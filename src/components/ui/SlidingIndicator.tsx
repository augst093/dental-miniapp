'use client';

import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';

// Shared "sliding pill" for segmented controls: one highlight glides between options
// instead of each option switching its own background.
//
// Usage:
//   const seg = useSlidingIndicator(activeKey);
//   <div ref={seg.attach} className="relative ...">
//     <SlidingIndicator box={seg.box} className="bg-white shadow-xs" />
//     <button data-seg-key={key} className="relative ...">...</button>
//   </div>
//
// Options must be `relative` and the active option must not have its own background,
// otherwise it paints over the indicator.

export interface IndicatorBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

function isSameBox(a: IndicatorBox | null, b: IndicatorBox): boolean {
  return !!a && a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height;
}

export function useSlidingIndicator<K extends string | number>(activeKey: K) {
  // Stored in state (not a ref), so the position is measured again when the control mounts,
  // for example when a drawer opens or a preset row appears
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [box, setBox] = useState<IndicatorBox | null>(null);

  const attach = useCallback((element: HTMLDivElement | null) => {
    setContainer(element);
  }, []);

  const measure = useCallback(() => {
    if (!container) return;

    // Options carry data-seg-key; find the active one among them
    const items = Array.from(container.querySelectorAll<HTMLElement>('[data-seg-key]'));
    const item = items.find((element) => element.dataset.segKey === String(activeKey));
    if (!item) return;

    // Layout offsets are immune to CSS transforms (entrance animations, sheets sliding in),
    // so the highlight lands exactly on the option even while parents are still moving.
    let left = 0;
    let top = 0;
    let node: HTMLElement | null = item;
    while (node && node !== container) {
      left += node.offsetLeft;
      top += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    if (node !== container) return; // option is not inside a positioned chain under the container
    const next: IndicatorBox = {
      left,
      top,
      width: item.offsetWidth,
      height: item.offsetHeight,
    };
    setBox((previous) => (isSameBox(previous, next) ? previous : next));
  }, [activeKey, container]);

  // Runs after every render, so options that mount later are measured as soon as they appear.
  // setBox bails out when the position has not changed, so this does not loop.
  useLayoutEffect(() => {
    measure();
  });

  useEffect(() => {
    if (!container) return;

    // Re-measure when the control resizes (fonts loading, orientation change, wrapping)
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [container, measure]);

  return { attach, box };
}

interface SlidingIndicatorProps {
  box: IndicatorBox | null;
  className?: string;
}

export function SlidingIndicator({ box, className = '' }: SlidingIndicatorProps) {
  // The first placement must not animate from the corner, so transitions switch on one frame later
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!box) return;
    // setTimeout rather than requestAnimationFrame: rAF stalls in background or hidden views
    const timer = window.setTimeout(() => setAnimated(true), 0);
    return () => window.clearTimeout(timer);
  }, [box]);

  return (
    <span
      aria-hidden="true"
      data-animated={animated ? 'true' : 'false'}
      className={`sliding-indicator pointer-events-none absolute left-0 top-0 rounded-full ${className}`}
      style={{
        width: box?.width ?? 0,
        height: box?.height ?? 0,
        transform: `translate3d(${box?.left ?? 0}px, ${box?.top ?? 0}px, 0)`,
        opacity: box ? 1 : 0,
      }}
    />
  );
}
