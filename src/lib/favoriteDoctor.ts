// The patient's chosen doctor, kept on this device.

const STORAGE_KEY = 'dentalux_fav_doctor_v1';

export function loadFavoriteDoctor(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveFavoriteDoctor(doctorId: string | null): void {
  try {
    if (doctorId) {
      localStorage.setItem(STORAGE_KEY, doctorId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage unavailable: the choice lasts for this session only
  }
}
