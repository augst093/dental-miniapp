'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { telegramAuthHeaders } from '../../lib/telegramClient';

// Messages the bot could not deliver after all retries. Staff can send them again.

const KIND_LABEL: Record<string, string> = {
  reminder: 'Напоминание',
  inbox_reply: 'Ответ пациенту',
  staff_alert: 'Уведомление админам',
  patient_html: 'Сообщение пациенту',
  patient_text: 'Сообщение пациенту',
};

interface FailedItem {
  id: string;
  kind: string;
  text: string;
  attempts: number;
  lastError: string | null;
  updatedAt: string;
}

export function OutboxFailed() {
  const [items, setItems] = useState<FailedItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/outbox?status=failed', { headers: telegramAuthHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const retry = async (id: string) => {
    setBusy(id);
    setMessage(null);
    const res = await fetch(`/api/admin/outbox/${id}/retry`, { method: 'POST', headers: telegramAuthHeaders() });
    setBusy(null);
    if (!res.ok) {
      setMessage('Не удалось поставить сообщение в очередь ещё раз');
      return;
    }
    setMessage('Сообщение снова в очереди. Отправка — в ближайшие секунды.');
    load();
  };

  if (total === 0) return null;

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-4 space-y-3 chat-bubble-in" role="region" aria-label="Неотправленные сообщения">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <span className="text-[13px] font-bold text-amber-900">Не доставлено: {total}</span>
      </div>
      {message && <p className="text-[12px] text-amber-900">{message}</p>}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-white p-3 border border-amber-100">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">{KIND_LABEL[item.kind] ?? item.kind}</div>
                <p className="text-[13px] text-slate-800 line-clamp-2 mt-0.5">{item.text.replace(/<[^>]+>/g, '')}</p>
                <p className="text-[11px] text-slate-500 mt-1">Попыток: {item.attempts}{item.lastError ? ` · ${item.lastError.slice(0, 120)}` : ''}</p>
              </div>
              <button
                type="button"
                onClick={() => retry(item.id)}
                disabled={busy === item.id}
                className="min-h-[40px] shrink-0 px-3 rounded-full bg-[var(--accent)] text-white text-[12px] font-bold flex items-center gap-1.5 disabled:opacity-50 active:scale-95 transition-transform"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Повторить
              </button>
            </div>
          </div>
        ))}
      </div>
      {total > items.length && <p className="text-[11px] text-amber-800">Показаны первые {items.length} из {total}.</p>}
    </div>
  );
}
