// Doctors and services for the patient app. Pure functions (unit-tested) plus the shared data types.
//
// Rule: if the database has active doctors or services, the patient app shows them (so changes made by
// staff reach patients). If it has none, the demo catalog from clinicData is used, so the demo never breaks.

import { DOCTORS, SERVICES, type Doctor, type ServiceItem, type Language } from '../data/clinicData';

export interface DbDoctor {
  id: string;
  name: string;
  specialty: string;
  experienceYears: number | null;
  isActive: boolean;
}

export interface DbService {
  id: string;
  title: string;
  category: string;
  priceUzs: number;
  durationMinutes: number;
  description: string | null;
  isActive: boolean;
}

export interface Catalog {
  source: 'database' | 'demo';
  doctors: Doctor[];
  services: ServiceItem[];
}

const LANGS: Language[] = ['ru', 'uz', 'en'];

function all(text: string): Record<Language, string> {
  return { ru: text, uz: text, en: text };
}

export function formatSum(value: number): string {
  return `${value.toLocaleString('ru-RU').replace(/\s/g, ' ')} сум`;
}

/** Doctors: active rows from the database; the demo profile of the same doctor is kept when the name matches */
export function buildDoctors(rows: DbDoctor[], demo: Doctor[] = DOCTORS): Doctor[] {
  return rows
    .filter((row) => row.isActive)
    .map((row) => {
      const match = demo.find((d) => d.name.ru.trim() === row.name.trim());
      if (match) {
        return {
          ...match,
          dbId: row.id,
          name: { ...match.name, ru: row.name },
          specialization: { ...match.specialization, ru: row.specialty },
          experienceYears: row.experienceYears ?? match.experienceYears,
        };
      }
      return {
        id: `db-${row.id}`,
        dbId: row.id,
        name: all(row.name),
        role: all(row.specialty),
        specialization: all(row.specialty),
        experienceYears: row.experienceYears ?? 0,
        credentials: all(''),
        initials: row.name.split(' ').map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase(),
        photoUrl: null,
        bio: all(''),
        education: { ru: [], uz: [], en: [] },
        languages: all(''),
      };
    });
}

/** Services: active rows from the database; the demo wording of the same service is kept when the title matches */
export function buildServices(rows: DbService[], demo: ServiceItem[] = SERVICES): ServiceItem[] {
  return rows
    .filter((row) => row.isActive)
    .map((row) => {
      const match = demo.find((s) => s.name.ru.trim() === row.title.trim());
      const duration = `${row.durationMinutes} мин`;
      if (match) {
        return {
          ...match,
          name: { ...match.name, ru: row.title },
          priceUzs: formatSum(row.priceUzs),
          duration: { ...match.duration, ru: duration },
          description: row.description ? { ...match.description, ru: row.description } : match.description,
        };
      }
      return {
        id: `db-${row.id}`,
        category: row.category,
        name: all(row.title),
        priceUzs: formatSum(row.priceUzs),
        priceUsd: undefined,
        duration: all(duration),
        description: all(row.description ?? ''),
        highlight: false,
        keywords: [],
      };
    });
}

export function buildCatalog(doctors: DbDoctor[], services: DbService[]): Catalog {
  const activeDoctors = doctors.filter((d) => d.isActive);
  const activeServices = services.filter((s) => s.isActive);
  if (activeDoctors.length === 0 && activeServices.length === 0) {
    return { source: 'demo', doctors: DOCTORS, services: SERVICES };
  }
  return {
    source: 'database',
    doctors: activeDoctors.length ? buildDoctors(activeDoctors) : DOCTORS,
    services: activeServices.length ? buildServices(activeServices) : SERVICES,
  };
}

export { LANGS };
