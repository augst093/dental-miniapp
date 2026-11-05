// Shared motion helpers.
//
// While content is sliding between screens, backdrop blur on frosted cards is switched off
// (see `.is-moving` in globals.css). Blur is the most expensive effect on phones, and recalculating
// it on every frame is what makes transitions look stuttery. It returns once the motion ends.

let movingTimer: number | undefined;

export function markMoving(durationMs = 560): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.add('is-moving');
  if (movingTimer !== undefined) window.clearTimeout(movingTimer);
  movingTimer = window.setTimeout(() => {
    root.classList.remove('is-moving');
    movingTimer = undefined;
  }, durationMs);
}
