// Opens an external web page. Inside Telegram the page opens in the external browser,
// which is more reliable than a plain link inside the Mini App webview.

export function openExternal(url: string): void {
  const webApp = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
  if (webApp?.openLink) {
    webApp.openLink(url);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Google Calendar "create event" link for a visit. Tashkent is UTC+5 all year round.
export function buildCalendarUrl(params: {
  title: string;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:MM
  location: string;
  details: string;
}): string {
  const start = new Date(`${params.dateStr}T${params.timeStr}:00+05:00`);
  if (Number.isNaN(start.getTime())) return 'https://calendar.google.com/';
  const end = new Date(start.getTime() + 45 * 60 * 1000);
  const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    location: params.location,
    details: params.details,
  });
  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}
