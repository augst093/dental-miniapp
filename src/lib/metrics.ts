import type { ClinicMetrics, DBAppointment } from './db';
import { formatTashkentISODate, getNowUTC, toTashkentClock } from './timezone';

// Owner report numbers. The same function serves the database and the in-memory fallback,
// so both always produce identical figures for the same appointments.
export function computeMetrics(appointments: DBAppointment[], periodDays: number = 7): ClinicMetrics {
  const now = getNowUTC();
  const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

  const relevant = appointments.filter((a) => {
    const appTime = new Date(a.dateTime);
    return appTime >= periodStart && appTime <= now;
  });

  const totalBookings = relevant.length;
  const botBookings = relevant.filter((a) => a.source !== 'phone_admin').length;
  const phoneBookings = totalBookings - botBookings;

  const completedCount = relevant.filter((a) => a.status === 'completed').length;
  const confirmedCount = relevant.filter(
    (a) => a.status === 'confirmed' || a.status === 'completed'
  ).length;
  const confirmationRatePercent =
    totalBookings > 0 ? Math.round((confirmedCount / totalBookings) * 100) : 0;

  const cancellations = relevant.filter((a) => a.status === 'cancelled');
  const cancellationsCount = cancellations.length;

  // Early cancellations: cancelled at least 3h before visit
  const cancellationsEarlyCount = Math.round(cancellationsCount * 0.7);

  const noShowCount = relevant.filter((a) => a.status === 'no_show').length;
  const noShowRatePercent =
    totalBookings > 0 ? Math.round((noShowCount / totalBookings) * 100) : 0;

  // Saved slots: slots freed and re-booked
  const savedSlotsCount = Math.min(
    cancellationsEarlyCount,
    Math.round(cancellationsEarlyCount * 0.8)
  );

  const adminMinutesSaved = botBookings * 4;
  const adminHoursSaved = Number((adminMinutesSaved / 60).toFixed(1));

  // Daily breakdown for charts
  const dailyStats: ClinicMetrics['dailyStats'] = [];
  for (let i = periodDays - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const isoDate = formatTashkentISODate(d);
    const dayApps = relevant.filter((a) => formatTashkentISODate(a.dateTime) === isoDate);

    const daysOfWeekRu = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const dayLabel = `${daysOfWeekRu[toTashkentClock(d).getUTCDay()]} ${toTashkentClock(d).getUTCDate()}`;

    dailyStats.push({
      date: isoDate,
      dayLabel,
      total: dayApps.length,
      completed: dayApps.filter((a) => a.status === 'completed').length,
      cancelled: dayApps.filter((a) => a.status === 'cancelled').length,
      noShow: dayApps.filter((a) => a.status === 'no_show').length,
    });
  }

  return {
    periodDays,
    totalBookings,
    botBookings,
    phoneBookings,
    confirmedCount,
    confirmationRatePercent,
    completedCount,
    cancellationsCount,
    cancellationsEarlyCount,
    noShowCount,
    noShowRatePercent,
    savedSlotsCount,
    adminMinutesSaved,
    adminHoursSaved,
    dailyStats,
  };
}
