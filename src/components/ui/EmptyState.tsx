import React from 'react';
import { IconBadge, IconTone } from './IconBadge';

// Shown when a list or a result is empty. Always explains what happened and offers one next step.

interface EmptyStateProps {
  icon: React.ReactNode;
  tone?: IconTone;
  title: string;
  text?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, tone = 'neutral', title, text, action }: EmptyStateProps) {
  return (
    <div className="clinic-card rounded-3xl px-6 py-8 flex flex-col items-center text-center gap-3 chat-bubble-in">
      <IconBadge tone={tone} size="lg">
        {icon}
      </IconBadge>
      <div className="type-card-title">{title}</div>
      {text && <p className="type-caption max-w-[260px]">{text}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 px-5 py-2.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] text-[13px] font-bold active:scale-95 transition-transform"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
