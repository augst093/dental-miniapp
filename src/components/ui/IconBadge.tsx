import React from 'react';

// One style for every icon in a circle: same size, same tints, same stroke (set globally in globals.css)

export type IconTone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
export type IconSize = 'sm' | 'md' | 'lg';

const TONES: Record<IconTone, string> = {
  accent: 'bg-[var(--accent-subtle)] text-[var(--accent)]',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
  neutral: 'bg-slate-100 text-slate-600',
};

const SIZES: Record<IconSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

interface IconBadgeProps {
  tone?: IconTone;
  size?: IconSize;
  className?: string;
  children: React.ReactNode;
}

export function IconBadge({ tone = 'accent', size = 'md', className = '', children }: IconBadgeProps) {
  return (
    <div className={`${SIZES[size]} ${TONES[tone]} rounded-full flex items-center justify-center shrink-0 ${className}`}>
      {children}
    </div>
  );
}
