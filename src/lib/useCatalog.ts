'use client';

import { useEffect, useState } from 'react';
import { DOCTORS, SERVICES, type Doctor, type ServiceItem } from '../data/clinicData';

// The demo catalog shows at once; the database catalog replaces it when it arrives.
export function useCatalog(): { doctors: Doctor[]; services: ServiceItem[]; source: 'database' | 'demo' } {
  const [catalog, setCatalog] = useState<{ doctors: Doctor[]; services: ServiceItem[]; source: 'database' | 'demo' }>({ doctors: DOCTORS, services: SERVICES, source: 'demo' });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/catalog')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data?.success || data.source !== 'database') return;
        setCatalog({ doctors: data.doctors, services: data.services, source: 'database' });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return catalog;
}
