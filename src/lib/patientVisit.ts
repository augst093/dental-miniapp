// The patient's latest booking, kept on this device so the app can show it on the home screen.
// Clinic-side status is not synced here yet (see the shared database step).

export interface PatientVisit {
  id: string;
  doctor: string;
  service: string;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:MM
  status: 'pending' | 'confirmed' | 'cancelled';
}

const STORAGE_KEY = 'dentalux_visit_v1';

export function loadVisit(): PatientVisit | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PatientVisit) : null;
  } catch {
    return null;
  }
}

export function saveVisit(visit: PatientVisit | null): void {
  try {
    if (visit) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visit));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage unavailable: the card simply will not persist
  }
}
