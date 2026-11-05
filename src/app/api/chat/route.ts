import { NextRequest, NextResponse } from 'next/server';
import { buildSystemPrompt } from '../../../lib/clinicAssistant';
import { clientIp, isRateLimited } from '../../../lib/rateLimit';

// The DeepSeek key stays on the server: the browser only talks to this route.
export const maxDuration = 30;

const MAX_MESSAGES = 20;
const MAX_CHARS = 1000;
const RATE_LIMIT = 20; // requests per window, per client IP
const RATE_WINDOW_MS = 10 * 60 * 1000;

type ChatRole = 'user' | 'assistant';
interface IncomingMessage {
  role: ChatRole;
  content: string;
}

// Same idea as the bot's PII stripping: phone-like sequences never reach the AI provider
function maskPhones(text: string): string {
  return text.replace(/\+?\d[\d\s()-]{8,}\d/g, '[ТЕЛЕФОН_СКРЫТ]');
}

function parseMessages(raw: unknown): IncomingMessage[] | null {
  if (!Array.isArray(raw)) return null;
  const messages: IncomingMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null;
    const { role, content } = item as Record<string, unknown>;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    if (content.length > MAX_CHARS) return null;
    messages.push({ role, content: content.trim() });
  }
  const trimmed = messages.slice(-MAX_MESSAGES).filter((m) => m.content.length > 0);
  if (trimmed.length === 0 || trimmed[trimmed.length - 1].role !== 'user') return null;
  return trimmed;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  if (isRateLimited('chat:' + clientIp(request), RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let body: { messages?: unknown; lang?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const messages = parseMessages(body.messages);
  if (!messages) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const lang = typeof body.lang === 'string' ? body.lang : 'ru';

  const baseUrl = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.4,
        max_tokens: 600,
        messages: [
          { role: 'system', content: buildSystemPrompt(lang) },
          ...messages.map((m) => ({
            role: m.role,
            content: m.role === 'user' ? maskPhones(m.content) : m.content,
          })),
        ],
      }),
      signal: AbortSignal.timeout(25000),
    });
  } catch {
    return NextResponse.json({ error: 'upstream_unreachable' }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 });
  }

  // Pass the provider's server-sent events straight through to the browser
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
