'use client';

import React, { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, CalendarDays, SendHorizonal, Trash2 } from 'lucide-react';
import { Language } from '../../data/clinicData';
import { clearHistory, loadHistory, saveHistory } from './chatStorage';

// Telegram-style assistant chat. Messages go to /api/chat, which calls DeepSeek on the server.
// History is kept per Telegram user (CloudStorage) with a local copy, and can be cleared.
//
// Performance notes:
// - Streamed tokens are batched into one state update per animation frame.
// - Bubbles are memoised, so only the bubble that is still streaming re-renders.
// - History is written to storage once per finished reply, not per token.
// - Scrolling is instant while streaming and respects a user who scrolled up to read.
// - No backdrop blur and no infinite animations inside the chat.

type Role = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  time: number;
  // For the patient's own messages: the assistant has started answering (shows the double tick)
  delivered?: boolean;
}

// Position of a bubble inside a run of messages from the same sender (Telegram-style grouping)
type GroupPosition = 'single' | 'first' | 'middle' | 'last';

const GROUP_GAP_MS = 2 * 60 * 1000;

function groupPositions(list: ChatMessage[]): GroupPosition[] {
  return list.map((message, index) => {
    const prev = list[index - 1];
    const next = list[index + 1];
    const joinsPrev = !!prev && prev.role === message.role && message.time - prev.time < GROUP_GAP_MS;
    const joinsNext = !!next && next.role === message.role && next.time - message.time < GROUP_GAP_MS;
    if (joinsPrev && joinsNext) return 'middle';
    if (joinsPrev) return 'last';
    if (joinsNext) return 'first';
    return 'single';
  });
}

// The corner next to the sender's edge is sharp only where a tail or the group continues
function bubbleShape(mine: boolean, position: GroupPosition): string {
  const hasTail = position === 'single' || position === 'last';
  if (mine) {
    if (hasTail) return 'rounded-2xl rounded-br-[4px]';
    return position === 'first' ? 'rounded-2xl rounded-br-[6px]' : 'rounded-2xl rounded-r-[6px]';
  }
  if (hasTail) return 'rounded-2xl rounded-bl-[4px]';
  return position === 'first' ? 'rounded-2xl rounded-bl-[6px]' : 'rounded-2xl rounded-l-[6px]';
}

const EMPTY_STATE: Record<Language, { title: string; sub: string }> = {
  ru: { title: 'Ассистент DentaLux', sub: 'Отвечу на вопросы о ценах, адресе и записи' },
  uz: { title: 'DentaLux yordamchisi', sub: 'Narxlar, manzil va yozilish bo‘yicha javob beraman' },
  en: { title: 'DentaLux assistant', sub: 'I can answer questions about prices, the address and booking' },
};

interface ChatScreenProps {
  lang: Language;
  onClose: () => void;
  onOpenBooking: () => void;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
  // Ready text to put in the input when the chat opens (for example from the visit card)
  initialDraft?: string;
}

// Height of the custom caret in the input (px)
const CARET_HEIGHT = 20;

// Messages kept for the AI context and for storage (the storage limit is per value, see chatStorage.ts)
const MAX_STORED = 30;

const STORAGE_WARNING: Record<Language, string> = {
  ru: 'История не сохраняется',
  uz: 'Tarix saqlanmayapti',
  en: 'History is not being saved',
};
// Distance from the bottom (px) within which the list keeps following new messages
const STICK_THRESHOLD = 80;

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
    status: 'на связи 24/7',
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
    status: 'onlayn 24/7',
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
    status: 'online 24/7',
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

// Thin check marks drawn as vectors, in the style of Telegram: one when sent, two when delivered
function DeliveryTicks({ double }: { double: boolean }) {
  if (!double) {
    return (
      <svg width="11" height="9" viewBox="0 0 11 9" fill="none" aria-hidden="true" className="shrink-0">
        <path d="M1 4.6 4 7.6 10 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="9" viewBox="0 0 16 9" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M1 4.6 4 7.6 10 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.4 4.6 8.4 7.6 14.4 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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

// Memoised: a bubble re-renders only when its own message object changes
const Bubble = memo(function Bubble({
  message,
  lang,
  position,
}: {
  message: ChatMessage;
  lang: Language;
  position: GroupPosition;
}) {
  const mine = message.role === 'user';
  const pending = !mine && message.text === '';
  const body = mine ? message.text : plainText(message.text);
  const gap = position === 'first' || position === 'single' ? 'mt-2' : 'mt-[2px]';

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} ${gap} chat-bubble-in`}>
      <div
        className={`max-w-[82%] px-3 py-2 text-[14.5px] leading-snug whitespace-pre-wrap break-words shadow-xs ${bubbleShape(
          mine,
          position
        )} ${mine ? 'bg-[var(--accent)] text-white' : 'bg-white text-[var(--ink)]'}`}
      >
        {pending ? (
          <TypingDots />
        ) : (
          <>
            {body}
            <span
              className={`float-right ml-2 mt-1.5 flex items-center gap-0.5 text-[10px] ${
                mine ? 'text-blue-100' : 'text-slate-400'
              }`}
            >
              {formatTime(message.time, lang)}
              {mine && <DeliveryTicks double={!!message.delivered} />}
            </span>
          </>
        )}
      </div>
    </div>
  );
});

export const ChatScreen: React.FC<ChatScreenProps> = ({
  lang,
  onClose,
  onOpenBooking,
  triggerHaptic,
  initialDraft = '',
}) => {
  const copy = COPY[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>(initialDraft);
  const [busy, setBusy] = useState<boolean>(false);
  // Visible area above the on-screen keyboard (null where visualViewport is unavailable)
  const [viewport, setViewport] = useState<{ top: number; height: number } | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Own blinking caret: the native caret of the field does not blink reliably in Telegram's
  // webview, so it is hidden and a mirror of the text places a styled caret at the insertion point.
  const inputWrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const mirrorRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<HTMLSpanElement | null>(null);
  const [caretIndex, setCaretIndex] = useState<number>(0);
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [caretPos, setCaretPos] = useState<{ left: number; top: number } | null>(null);
  // Changes on every keystroke; used to restart the caret blink from its solid phase
  const [caretPulse, setCaretPulse] = useState<number>(0);

  const syncCaret = (el: HTMLTextAreaElement) => {
    setCaretIndex(el.selectionStart ?? el.value.length);
  };

  // Position the caret after every change of text, cursor or focus
  useLayoutEffect(() => {
    const wrap = inputWrapRef.current;
    const marker = markerRef.current;
    const field = inputRef.current;
    if (!wrap || !marker || !field) return;

    // Coordinates relative to the padding box of the wrapper (where an absolute child is placed)
    const wrapRect = wrap.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const left = markerRect.left - wrapRect.left - wrap.clientLeft;
    const top = markerRect.top - wrapRect.top - wrap.clientTop - field.scrollTop + (markerRect.height - CARET_HEIGHT) / 2;
    setCaretPos((previous) =>
      previous && previous.left === left && previous.top === top ? previous : { left, top }
    );
  }, [draft, caretIndex, inputFocused]);
  // Whether the list should follow new messages (false when the user scrolled up to read)
  const stickRef = useRef<boolean>(true);

  // Latest messages for the save on unmount, and whether the user cleared the chat on purpose
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;
  const clearedRef = useRef<boolean>(false);

  // True only after the stored history was read successfully. If the read failed, nothing is
  // written in this session, so a new question cannot overwrite the saved history.
  const storageReadyRef = useRef<boolean>(false);
  // Whether the last save failed; shown in the header so the problem is visible
  const [storageFailed, setStorageFailed] = useState<boolean>(false);

  // Load the saved history once (Telegram CloudStorage, or the local copy outside Telegram)
  useEffect(() => {
    let cancelled = false;
    loadHistory()
      .then(({ ok, json }) => {
        if (cancelled) return;
        storageReadyRef.current = ok;
        if (!ok) setStorageFailed(true);
        if (json) {
          try {
            const parsed = JSON.parse(json) as ChatMessage[];
            if (Array.isArray(parsed)) {
              // Only fill an empty chat, so a message sent before loading finished is not lost
              setMessages((prev) => (prev.length ? prev : parsed.slice(-MAX_STORED)));
            }
          } catch {
            // Corrupt history: start with an empty chat
          }
        }
        setHydrated(true);
      })
      .catch(() => {
        if (cancelled) return;
        storageReadyRef.current = false;
        setStorageFailed(true);
        setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Stored form: finished messages only. Empty placeholders for replies still streaming are dropped.
  const persist = (list: ChatMessage[]) => {
    if (!storageReadyRef.current) return;
    if (list.length === 0 && !clearedRef.current) return; // never overwrite history with an empty list by accident
    const finished = list.filter((m) => m.role === 'user' || m.text.length > 0);
    saveHistory(JSON.stringify(finished.slice(-MAX_STORED)))
      .then(() => setStorageFailed(false))
      .catch(() => setStorageFailed(true));
  };

  // Save once per finished reply (busy turns false), never per streamed token
  useEffect(() => {
    if (!hydrated || busy) return;
    persist(messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, hydrated, busy]);

  // Closing the chat while a reply is still streaming keeps the question and the partial answer
  useEffect(() => {
    return () => persist(messagesRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the newest message in view, instantly (smooth scrolling per token is what made it stutter)
  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && stickRef.current) list.scrollTop = list.scrollHeight;
  }, [messages]);

  const onListScroll = () => {
    const list = listRef.current;
    if (!list) return;
    stickRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < STICK_THRESHOLD;
  };

  // The chat must fit the area above the keyboard, otherwise the header and newest messages
  // leave the screen. Only real size changes trigger a re-render, and scrolling the list is
  // left alone unless the keyboard just opened.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    let lastHeight = vv.height;
    const update = () => {
      const next = { top: Math.round(vv.offsetTop), height: Math.round(vv.height) };
      setViewport((prev) => (prev && prev.top === next.top && prev.height === next.height ? prev : next));
      if (next.height < lastHeight) {
        stickRef.current = true;
        const list = listRef.current;
        if (list) list.scrollTop = list.scrollHeight;
      }
      lastHeight = next.height;
    };

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

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

    stickRef.current = true;
    setMessages([...history, { id: assistantId, role: 'assistant', text: '', time: Date.now() }]);
    // The question is stored straight away, so it survives even if the chat is closed mid-reply
    persist(history);
    setDraft('');
    setBusy(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    // Streamed tokens are collected and applied once per frame: one state update per frame
    // instead of one per token, so only the streaming bubble re-renders.
    let pending = '';
    let frame = 0;
    let received = false;

    const applyText = (update: (current: string) => string) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, text: update(m.text) } : m))
      );
    };

    const flush = () => {
      frame = 0;
      if (!pending) return;
      const chunk = pending;
      pending = '';
      applyText((current) => current + chunk);
    };

    try {
      await streamReply(
        history.map(({ role, text: content }) => ({ role, content })),
        lang,
        (delta) => {
          if (!received) {
            // First token: the question has been received, show the double tick
            setMessages((prev) => prev.map((m) => (m.id === userMessage.id ? { ...m, delivered: true } : m)));
          }
          received = true;
          pending += delta;
          if (!frame) frame = requestAnimationFrame(flush);
        },
        controller.signal
      );
      if (frame) cancelAnimationFrame(frame);
      flush();
      if (!received) applyText(() => copy.error);
    } catch (error) {
      if (frame) cancelAnimationFrame(frame);
      if (controller.signal.aborted) return;
      const status = error instanceof ChatRequestError ? error.status : 0;
      applyText(() => (status === 429 ? copy.rateLimited : copy.error));
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
    clearedRef.current = true;
    clearHistory().catch(() => {
      // Nothing more to clean up
    });
  };

  const showGreeting = hydrated && messages.length === 0;
  const greeting: ChatMessage = { id: 'greeting', role: 'assistant', text: copy.greeting, time: 0 };
  const positions = groupPositions(messages);

  return (
    <div
      className="chat-wallpaper fixed inset-x-0 z-[45] flex flex-col screen-enter"
      style={viewport ? { top: viewport.top, height: viewport.height } : { top: 0, bottom: 0 }}
    >
      {/* Header */}
      <header className="pt-safe bg-white border-b border-slate-200/70 shadow-xs">
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <button
            onClick={onClose}
            aria-label={copy.close}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--accent)] hover:bg-slate-100 active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white font-extrabold text-[13px] flex items-center justify-center shrink-0">
            DL
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-bold text-[15px] leading-tight text-[var(--ink)]">DentaLux</div>
            {storageFailed ? (
              <div className="text-[12px] text-amber-600 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {STORAGE_WARNING[lang]}
              </div>
            ) : (
              <div className="text-[12px] text-emerald-600 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {copy.status}
              </div>
            )}
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
            <Trash2 className="w-[18px] h-[18px]" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={listRef}
        onScroll={onListScroll}
        className="flex-1 overflow-y-auto overscroll-contain px-3 py-4"
      >
        <div className="flex justify-center pb-2">
          <span className="text-[11px] font-semibold text-slate-600 bg-white/90 px-3 py-1 rounded-full shadow-xs">
            {copy.today}
          </span>
        </div>

        {!hydrated && (
          <div className="space-y-2 pt-2" aria-hidden="true">
            <div className="chat-skeleton h-10 w-2/3 rounded-2xl" />
            <div className="chat-skeleton h-10 w-1/2 rounded-2xl ml-auto" />
            <div className="chat-skeleton h-14 w-3/4 rounded-2xl" />
          </div>
        )}

        {showGreeting && (
          <div className="flex flex-col items-center text-center pt-4 pb-6 chat-bubble-in">
            <div className="w-16 h-16 rounded-full bg-[var(--accent)] text-white font-extrabold text-[17px] flex items-center justify-center shadow-md">
              DL
            </div>
            <div className="mt-3 font-bold text-[16px] text-[var(--ink)]">{EMPTY_STATE[lang].title}</div>
            <div className="text-[12.5px] text-[var(--ink-muted)] max-w-[260px] leading-snug">
              {EMPTY_STATE[lang].sub}
            </div>
          </div>
        )}
        {showGreeting && <Bubble message={greeting} lang={lang} position="single" />}
        {messages.map((message, index) => (
          <Bubble key={message.id} message={message} lang={lang} position={positions[index]} />
        ))}
      </div>

      {/* Quick replies */}
      <div className="flex items-center gap-2 px-3 pb-2 overflow-x-auto no-scrollbar">
        {copy.quick.map((label) => (
          <button
            key={label}
            onClick={() => send(label)}
            disabled={busy}
            className="shrink-0 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-[12.5px] font-semibold text-[var(--accent)] shadow-xs active:scale-95 transition-transform disabled:opacity-50"
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
        <div
          ref={inputWrapRef}
          className="relative flex-1 min-h-11 bg-white rounded-3xl px-4 py-1.5 shadow-sm border border-slate-200/70"
        >
          {/* Hidden mirror of the text, used only to measure where the caret belongs */}
          <div
            ref={mirrorRef}
            aria-hidden="true"
            className="absolute left-4 right-4 top-[6px] py-1 whitespace-pre-wrap break-words invisible pointer-events-none"
            style={{ fontSize: 16, lineHeight: '22px' }}
          >
            {draft.slice(0, caretIndex)}
            <span ref={markerRef}>&#8203;</span>
            {draft.slice(caretIndex) || ' '}
          </div>

          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setCaretPulse((count) => count + 1);
              syncCaret(e.target);
            }}
            onSelect={(e) => syncCaret(e.currentTarget)}
            onKeyUp={(e) => syncCaret(e.currentTarget)}
            onClick={(e) => syncCaret(e.currentTarget)}
            onFocus={(e) => {
              setInputFocused(true);
              syncCaret(e.currentTarget);
            }}
            onBlur={() => setInputFocused(false)}
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
            // 16px prevents iOS from zooming into the field when it is focused.
            // The native caret is hidden; our own blinking caret is drawn below.
            style={{ fontSize: 16, lineHeight: '22px', caretColor: 'transparent' }}
            className="relative block w-full resize-none bg-transparent outline-none max-h-32 py-1 text-[var(--ink)] placeholder:text-slate-400"
          />

          {/* Always mounted and moved with transform: no remounts, no flicker while typing.
              The inner element is keyed by the keystroke counter, so each keystroke restarts the
              blink from "solid", like a native caret. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 transition-opacity duration-150"
            style={{
              opacity: inputFocused && caretPos ? 1 : 0,
              transform: `translate3d(${caretPos?.left ?? 0}px, ${caretPos?.top ?? 0}px, 0)`,
            }}
          >
            <span
              key={caretPulse}
              className="chat-caret block rounded-full bg-[var(--accent)]"
              style={{ width: 2, height: CARET_HEIGHT }}
            />
          </span>
        </div>
        <button
          type="submit"
          disabled={!draft.trim() || busy}
          aria-label="Send"
          className="w-11 h-11 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform disabled:bg-slate-300 disabled:shadow-none shrink-0"
        >
          <SendHorizonal className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
