'use client';

// Chat history storage.
// Inside Telegram this uses CloudStorage, which is tied to the Telegram user and survives
// webview resets. Outside Telegram (or on old clients) it falls back to localStorage.
// Telegram limits each value to 4096 characters, so the JSON is split into chunks.

const LOCAL_KEY = 'dentalux_chat_v1';
const META_KEY = 'chat_meta';
const CHUNK_PREFIX = 'chat_';
const CHUNK_SIZE = 3500;
const MAX_CHUNKS = 40;

function cloudStorage() {
  if (typeof window === 'undefined') return undefined;
  const webApp = window.Telegram?.WebApp;
  if (!webApp?.CloudStorage) return undefined;
  // Old clients have CloudStorage but no version check; treat them as supported
  if (webApp.isVersionAtLeast && !webApp.isVersionAtLeast('6.9')) return undefined;
  return webApp.CloudStorage;
}

function setCloudItem(storage: NonNullable<ReturnType<typeof cloudStorage>>, key: string, value: string) {
  return new Promise<void>((resolve, reject) => {
    storage.setItem(key, value, (error) => (error ? reject(new Error(error)) : resolve()));
  });
}

function getCloudItems(storage: NonNullable<ReturnType<typeof cloudStorage>>, keys: string[]) {
  return new Promise<Record<string, string>>((resolve, reject) => {
    storage.getItems(keys, (error, values) => (error ? reject(new Error(error)) : resolve(values ?? {})));
  });
}

function chunkKeys(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${CHUNK_PREFIX}${index}`);
}

export async function saveHistory(json: string): Promise<void> {
  // Local copy first: cheap, and it keeps working if the cloud write fails
  try {
    localStorage.setItem(LOCAL_KEY, json);
  } catch {
    // Storage full or disabled
  }

  const storage = cloudStorage();
  if (!storage) return;

  const chunks: string[] = [];
  for (let index = 0; index < json.length; index += CHUNK_SIZE) {
    chunks.push(json.slice(index, index + CHUNK_SIZE));
  }
  if (chunks.length > MAX_CHUNKS) return; // caller keeps the history small enough

  await Promise.all(chunks.map((chunk, index) => setCloudItem(storage, `${CHUNK_PREFIX}${index}`, chunk)));
  await setCloudItem(storage, META_KEY, String(chunks.length));
}

export async function loadHistory(): Promise<string | null> {
  const storage = cloudStorage();
  if (storage) {
    try {
      const meta = await getCloudItems(storage, [META_KEY]);
      const count = Number(meta[META_KEY]);
      if (count > 0) {
        const keys = chunkKeys(count);
        const values = await getCloudItems(storage, keys);
        const json = keys.map((key) => values[key] ?? '').join('');
        if (json) return json;
      }
    } catch {
      // Cloud unavailable: fall through to the local copy
    }
  }

  try {
    return localStorage.getItem(LOCAL_KEY);
  } catch {
    return null;
  }
}

export async function clearHistory(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch {
    // Nothing to clean up
  }

  const storage = cloudStorage();
  if (!storage) return;
  const keys = [META_KEY, ...chunkKeys(MAX_CHUNKS)];
  await new Promise<void>((resolve) => storage.removeItems(keys, () => resolve()));
}
