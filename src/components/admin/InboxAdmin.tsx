'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCheck, Inbox, RotateCcw, Send, X } from 'lucide-react';
import { telegramAuthHeaders } from '../../lib/telegramClient';
import { EmptyState } from '../ui/EmptyState';

// Staff inbox: questions handed over from the patient chat. Replies are delivered through the bot.

type Filter = 'all' | 'new' | 'answered' | 'resolved';

interface ThreadRow {
  id: string;
  patientName: string;
  status: 'new' | 'answered' | 'resolved';
  patientUnreachable: boolean;
  lastMessageAt: string;
  lastText: string;
  lastDirection: 'in' | 'out' | null;
}

interface MessageRow {
  id: string;
  direction: 'in' | 'out';
  text: string;
  deliveryStatus: string | null;
  createdAt: string;
}

interface ThreadDetail {
  id: string;
  patientName: string;
  status: 'new' | 'answered' | 'resolved';
  patientUnreachable: boolean;
  messages: MessageRow[];
}

const STATUS_LABEL: Record<string, string> = { new: 'Новый', answered: 'Отвечено', resolved: 'Закрыт' };
const STATUS_STYLE: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  answered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  resolved: 'bg-slate-100 text-slate-600 border-slate-200',
};

const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });

async function api<T>(method: string, url: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...telegramAuthHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as any;
  return { ok: res.ok, status: res.status, data: data as T & { error?: any; success?: boolean } };
}

function errorText(data: any): string {
  if (!data) return 'Не удалось выполнить действие';
  if (typeof data.error === 'string') return data.error;
  return data.error?.message || 'Не удалось выполнить действие';
}

export function InboxAdmin({ onNewCount }: { onNewCount?: (count: number) => void }) {
  const [filter, setFilter] = useState<Filter>('new');
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({ new: 0, answered: 0, resolved: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await api<any>('GET', `/api/admin/inbox?status=${filter}`);
    if (!res.ok) {
      setError(errorText(res.data));
    } else {
      setError(null);
      setThreads(res.data.threads);
      setCounts(res.data.counts);
      onNewCount?.(res.data.counts.new ?? 0);
    }
    setLoading(false);
  }, [filter, onNewCount]);

  useEffect(() => {
    setLoading(true);
    load();
    // Light polling so new questions appear without reloading the panel
    const timer = window.setInterval(load, 25000);
    return () => window.clearInterval(timer);
  }, [load]);

  const filters: { id: Filter; label: string }[] = [
    { id: 'new', label: `Новые (${counts.new ?? 0})` },
    { id: 'answered', label: `Отвечено (${counts.answered ?? 0})` },
    { id: 'resolved', label: `Закрытые (${counts.resolved ?? 0})` },
    { id: 'all', label: 'Все' },
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`min-h-[40px] px-3.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-colors duration-200 active:scale-95 ${
              filter === f.id ? 'bg-[var(--accent)] text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-2.5" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="chat-skeleton h-20 rounded-3xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="clinic-card p-4 rounded-2xl flex items-center justify-between gap-3">
          <span className="text-[13px] text-slate-700">{error}</span>
          <button type="button" onClick={() => { setLoading(true); load(); }} className="min-h-[40px] px-3.5 rounded-full bg-[var(--accent)] text-white text-[12px] font-bold">
            Повторить
          </button>
        </div>
      )}

      {!loading && !error && threads.length === 0 && (
        <EmptyState
          icon={<Inbox className="w-6 h-6" />}
          title={filter === 'new' ? 'Новых вопросов нет' : 'Здесь пока пусто'}
          text="Когда пациент нажмёт «Связаться с администратором» в чате, вопрос появится здесь."
        />
      )}

      {!loading && !error && threads.length > 0 && (
        <div className="space-y-2.5 stagger">
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setOpenId(t.id)}
              className="w-full text-left rounded-3xl border border-slate-200/90 bg-white/95 p-4 active:scale-[0.99] transition-transform duration-200"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[14px] text-slate-900 truncate">{t.patientName}</span>
                <span className="text-[11px] text-slate-500 shrink-0">{timeFormat.format(new Date(t.lastMessageAt))}</span>
              </div>
              <p className="text-[13px] text-slate-600 mt-1 line-clamp-2">
                {t.lastDirection === 'out' ? 'Вы: ' : ''}
                {t.lastText}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_STYLE[t.status]}`}>{STATUS_LABEL[t.status]}</span>
                {t.patientUnreachable && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">Бот заблокирован</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {openId && (
        <ThreadSheet
          threadId={openId}
          onClose={() => setOpenId(null)}
          onChanged={() => load()}
        />
      )}
    </div>
  );
}

function ThreadSheet({ threadId, onClose, onChanged }: { threadId: string; onClose: () => void; onChanged: () => void }) {
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reply, setReply] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const loadThread = useCallback(async () => {
    const res = await api<any>('GET', `/api/admin/inbox/${threadId}`);
    if (!res.ok) setLoadError(errorText(res.data));
    else setThread(res.data.thread);
  }, [threadId]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const send = async () => {
    setSending(true);
    setSendError(null);
    const res = await api<any>('POST', `/api/admin/inbox/${threadId}/reply`, { text: reply });
    setSending(false);
    if (!res.ok) {
      setSendError(errorText(res.data));
      await loadThread();
      return;
    }
    setReply('');
    await loadThread();
    onChanged();
  };

  const setStatus = async (status: 'new' | 'resolved') => {
    const res = await api<any>('PATCH', `/api/admin/inbox/${threadId}`, { status });
    if (res.ok) {
      await loadThread();
      onChanged();
    }
  };

  const unreachable = thread?.patientUnreachable ?? false;

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="Диалог">
      <button type="button" aria-label="Закрыть" onClick={onClose} className="absolute inset-0 bg-slate-950/55 about-backdrop-in" />
      <div className="relative w-full sm:max-w-lg h-[88dvh] flex flex-col bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl sheet-enter">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <div className="min-w-0">
            <div className="font-bold text-[15px] text-slate-900 truncate">{thread?.patientName ?? 'Диалог'}</div>
            {thread && <div className="text-[11px] text-slate-500">{STATUS_LABEL[thread.status]}</div>}
          </div>
          <button type="button" aria-label="Закрыть" onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center active:scale-90 transition-transform">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
          {loadError && <p className="text-[13px] text-red-600">{loadError}</p>}
          {!thread && !loadError && <div className="chat-skeleton h-16 rounded-2xl" />}
          {thread?.messages.map((m) => (
            <div key={m.id} className={`flex ${m.direction === 'out' ? 'justify-end' : 'justify-start'} chat-bubble-in`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[14px] leading-snug ${m.direction === 'out' ? 'bg-[var(--accent)] text-white rounded-br-md' : 'bg-slate-100 text-slate-900 rounded-bl-md'}`}>
                <div className="whitespace-pre-wrap break-words">{m.text}</div>
                <div className={`mt-1 text-[10px] ${m.direction === 'out' ? 'text-white/75' : 'text-slate-500'}`}>
                  {timeFormat.format(new Date(m.createdAt))}
                  {m.direction === 'out' && m.deliveryStatus === 'failed' && <span className="ml-1.5 font-bold text-red-200">· не доставлено</span>}
                  {m.direction === 'out' && m.deliveryStatus === 'sent' && <span className="ml-1.5">· доставлено</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] space-y-2.5">
          {unreachable && (
            <div className="flex gap-2.5 items-start rounded-2xl bg-amber-50 border border-amber-200 p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-900 leading-snug">
                {thread?.patientName} заблокировал бота, ответы в Telegram не доходят. Позвоните пациенту по телефону из карточки записи.
              </p>
            </div>
          )}
          {sendError && <p role="alert" className="text-[12px] font-semibold text-red-600">{sendError}</p>}
          {!unreachable && (
            <div className="flex gap-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={2}
                maxLength={1000}
                placeholder="Ответ пациенту — уйдёт в Telegram"
                className="flex-1 px-3 py-2 rounded-2xl border border-slate-200 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 resize-none"
              />
              <button
                type="button"
                onClick={send}
                disabled={sending || reply.trim().length === 0}
                className="min-w-[48px] rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
                aria-label="Отправить ответ"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            {thread?.status !== 'resolved' ? (
              <button type="button" onClick={() => setStatus('resolved')} className="flex-1 min-h-[40px] rounded-full border border-slate-200 text-slate-700 text-[12px] font-semibold flex items-center justify-center gap-1.5">
                <CheckCheck className="w-4 h-4" /> Закрыть вопрос
              </button>
            ) : (
              <button type="button" onClick={() => setStatus('new')} className="flex-1 min-h-[40px] rounded-full border border-slate-200 text-slate-700 text-[12px] font-semibold flex items-center justify-center gap-1.5">
                <RotateCcw className="w-4 h-4" /> Вернуть в работу
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
