'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CalendarDays, Send, Trash2 } from 'lucide-react';
import { Language } from '../../data/clinicData';

// Telegram-style assistant chat. Messages go to /api/chat, which calls DeepSeek on the server.
// History lives only on this device (localStorage) and can be cleared.

type Role = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  time: number;
}

interface ChatScreenProps {
  lang: Language;
  onClose: () => void;
  onOpenBooking: () => void;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

const STORAGE_KEY = 'dentalux_chat_v1';
const MAX_STORED = 60;

const COPY: Record<
  Language,
  {
    status: string;
    placeholder: string;
    greeting: string;
    quick: string[];
    error: string;
    rateLimited: string;
    clear: string;
    book: string;
    today: string;
    close: string;
  }
> = {
  ru: {
    status: 'AI-ассистент · в сети',
    placeholder: 'Сообщение',
    greeting: 'Здравствуйте! Помогу с ценами, адресом и записью. Что вас интересует?',
    quick: ['Цены', 'Адрес и часы', 'Записаться', 'Болит зуб'],
    error: 'Сейчас не получается ответить. Позвоните в регистратуру: +998 (71) 200-00-00.',
    rateLimited: 'Слишком много сообщений. Попробуйте через несколько минут.',
    clear: 'Очистить чат',
    book: 'Записаться',
    today: 'Сегодня',
    close: 'Закрыть',
  },
  uz: {
    status: 'AI-yordamchi · onlayn',
    placeholder: 'Xabar',
    greeting: 'Assalomu alaykum! Narxlar, manzil va yozilish bo‘yicha yordam beraman. Nima qiziqtiradi?',
    quick: ['Narxlar', 'Manzil va soatlar', 'Yozilish', 'Tish og‘riyapti'],
    error: 'Hozir javob bera olmayman. Qabulxonaga qo‘ng‘iroq qiling: +998 (71) 200-00-00.',
    rateLimited: 'Juda ko‘p xabar yuborildi. Bir necha daqiqadan keyin urinib ko‘ring.',
    clear: 'Chatni tozalash',
    book: 'Yozilish',
    today: 'Bugun',
    close: 'Yopish',
  },
  en: {
    status: 'AI assistant · online',
    placeholder: 'Message',
    greeting: 'Hello! I can help with prices, the address and booking. What would you like to know?',
    quick: ['Prices', 'Address & hours', 'Book a visit', 'Tooth pain'],
    error: 'I cannot answer right now. Please call the front desk: +998 (71) 200-00-00.',
    rateLimited: 'Too many messages. Please try again in a few minutes.',
    clear: 'Clear chat',
    book: 'Book',
    today: 'Today',
    close: 'Close',
  },
};

class ChatRequestError extends Error {
  status: number;
  constructor(status: number) {
    super('chat_request_failed');
    this.status = status;
  }
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatTime(timestamp: number, lang: Language): string {
  return new Date(timestamp).toLocaleTimeString(lang === 'en' ? 'en-GB' : 'ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Replies may contain markdown bold; the chat shows plain text
function plainText(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1');
}

async function streamReply(
  history: { role: Role; content: string }[],
  lang: Language,
  onDelta: (delta: string) => void,
  signal: AbortSignal
): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: history, lang }),
    signal,
  });
  if (!response.ok || !response.body) {
    throw new ChatRequestError(response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta) onDelta(delta);
      } catch {
        // Ignore keep-alive or partial lines
      }
    }
  }
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="typing">
      <span className="chat-dot" />
      <span className="chat-dot" />
      <span className="chat-dot" />
    </span>
  );
}

function Bubble({ message, lang }: { message: ChatMessage; lang: Language }) {
  const mine = message.role === 'user';
  const pending = !mine && message.text === '';

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} chat-bubble-in`}>
      <div
        className={`max-w-[82%] px-3 py-2 text-[14.5px] leading-snug whitespace-pre-wrap break-words shadow-xs ${
          mine
            ? 'bg-[var(--accent)] text-white rounded-2xl rounded-br-md'
            : 'bg-white text-[var(--ink)] rounded-2xl rounded-bl-md'
        }`}
      >
        {pending ? (
          <TypingDots />
        ) : (
          <>
            {mine ? message.text : plainText(message.text)}
            <span
              className={`float-right ml-2 mt-1.5 text-[10px] ${mine ? 'text-blue-100' : 'text-slate-400'}`}
            >
              {formatTime(message.time, lang)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ lang, onClose, onOpenBooking, triggerHaptic }) => {
  const copy = COPY[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  // Visible area above the on-screen keyboard (null on platforms without visualViewport)
  const [viewport, setViewport] = useState<{ top: number; height: number } | null>(null);

  // When the keyboard opens, the chat must fit the remaining area so the header and the
  // newest messages stay on screen. iOS shifts the whole page otherwise.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      setViewport({ top: vv.offsetTop, height: vv.height });
      const list = listRef.current;
      if (list) list.scrollTop = list.scrollHeight;
    };

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  // Load saved history once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw) as ChatMessage[]);
    } catch {
      // Corrupt storage: start with an empty chat
    }
    setHydrated(true);
  }, []);

  // Persist history after every change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
      // Storage full or disabled: the chat still works for this session
    }
  }, [messages, hydrated]);

  // Keep the newest message in view
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Cancel an in-flight reply when the chat closes
  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    triggerHaptic('light');

    const userMessage: ChatMessage = { id: newId(), role: 'user', text, time: Date.now() };
    const assistantId = newId();
    const history = [...messages, userMessage];

    setMessages([...history, { id: assistantId, role: 'assistant', text: '', time: Date.now() }]);
    setDraft('');
    setBusy(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    const setAssistantText = (updater: (current: string) => string) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, text: updater(m.text) } : m))
      );
    };

    try {
      await streamReply(
        history.map(({ role, text: content }) => ({ role, content })),
        lang,
        (delta) => setAssistantText((current) => current + delta),
        controller.signal
      );
      // An empty reply is treated as a failure
      setAssistantText((current) => current || copy.error);
    } catch (error) {
      if (controller.signal.aborted) return;
      const status = error instanceof ChatRequestError ? error.status : 0;
      setAssistantText(() => (status === 429 ? copy.rateLimited : copy.error));
    } finally {
      setBusy(false);
      controllerRef.current = null;
    }
  };

  const clearChat = () => {
    triggerHaptic('medium');
    controllerRef.current?.abort();
    setMessages([]);
    setBusy(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clean up
    }
  };

  const showGreeting = hydrated && messages.length === 0;
  const greeting: ChatMessage = { id: 'greeting', role: 'assistant', text: copy.greeting, time: 0 };

  return (
    <div
      className="chat-wallpaper fixed inset-x-0 z-[60] flex flex-col sheet-enter"
      style={viewport ? { top: viewport.top, height: viewport.height } : { top: 0, bottom: 0 }}
    >
      {/* Header */}
      <header className="pt-safe bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-xs">
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <button
            onClick={onClose}
            aria-label={copy.close}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--accent)] hover:bg-slate-100 active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white font-extrabold text-[13px] flex items-center justify-center shadow-xs shrink-0">
            DL
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-bold text-[15px] leading-tight text-[var(--ink)]">DentaLux</div>
            <div className="text-[12px] text-emerald-600 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {copy.status}
            </div>
          </div>

          <button
            onClick={onOpenBooking}
            aria-label={copy.book}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--accent)] hover:bg-slate-100 active:scale-90 transition-transform"
          >
            <CalendarDays className="w-5 h-5" />
          </button>
          <button
            onClick={clearChat}
            aria-label={copy.clear}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 active:scale-90 transition-transform"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="flex justify-center pb-2">
          <span className="text-[11px] font-semibold text-slate-600 bg-white/70 backdrop-blur px-3 py-1 rounded-full shadow-xs">
            {copy.today}
          </span>
        </div>

        {showGreeting && <Bubble message={greeting} lang={lang} />}
        {messages.map((message) => (
          <Bubble key={message.id} message={message} lang={lang} />
        ))}
      </div>

      {/* Quick replies */}
      <div className="flex items-center gap-2 px-3 pb-2 overflow-x-auto no-scrollbar">
        {copy.quick.map((label) => (
          <button
            key={label}
            onClick={() => send(label)}
            disabled={busy}
            className="shrink-0 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200/80 text-[12.5px] font-semibold text-[var(--accent)] shadow-xs active:scale-95 transition-transform disabled:opacity-50"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="pb-safe px-2.5 pb-2.5 pt-1 flex items-end gap-2"
      >
        <div className="flex-1 bg-white rounded-3xl px-4 py-2 shadow-sm border border-slate-200/70">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            rows={1}
            maxLength={1000}
            enterKeyHint="send"
            placeholder={copy.placeholder}
            // 16px prevents iOS from zooming into the field when it is focused
            style={{ fontSize: 16, caretColor: 'var(--accent)' }}
            className="w-full resize-none bg-transparent outline-none leading-snug max-h-32 py-1 text-[var(--ink)] placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={!draft.trim() || busy}
          aria-label="Send"
          className="w-11 h-11 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-md active:scale-90 transition-all disabled:opacity-40 disabled:shadow-none shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
