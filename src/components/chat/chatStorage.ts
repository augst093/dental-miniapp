'use client';

// Chat history storage.
// Inside Telegram this uses CloudStorage, which is tied to the Telegram user and survives
// webview resets. Outside Telegram (or on old clients) it falls back to localStorage.
//
// CloudStorage limits: each value is at most 4096 characters, and keys are at most 128
// characters. The JSON is split into chunks of 1500 characters, so even if the limit is counted
// in bytes (Cyrillic is 2 bytes per character) a chunk always fits.

const LOCAL_KEY = 'dentalux_chat_v1';
const META_KEY = 'chat_meta';
const CHUNK_PREFIX = 'chat_';
const CHUNK_SIZE = 1500;
const MAX_CHUNKS = 40;
const CLOUD_TIMEOUT_MS = 5000;

type CloudStorage = NonNullable<NonNullable<Window['Telegram']>['WebApp']['CloudStorage']>;

export interface LoadResult {
  // false when storage could not be read: the chat must not overwrite history in that case
  ok: boolean;
  json: string | null;
}

function cloudStorage(): CloudStorage | undefined {
  if (typeof window === 'undefined') return undefined;
  const webApp = window.Telegram?.WebApp;
  if (!webApp?.CloudStorage) return undefined;
  if (webApp.isVersionAtLeast && !webApp.isVersionAtLeast('6.9')) return undefined;
  return webApp.CloudStorage;
}

// A callback that never fires (seen on some clients) must not freeze the chat
function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`${label}: timeout`)), CLOUD_TIMEOUT_MS);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function setCloudItem(storage: CloudStorage, key: string, value: string): Promise<void> {
  return withTimeout(
    new Promise<void>((resolve, reject) => {
      storage.setItem(key, value, (error) => (error ? reject(new Error(error)) : resolve()));
    }),
    `set ${key}`
  );
}

function getCloudItems(storage: CloudStorage, keys: string[]): Promise<Record<string, string>> {
  return withTimeout(
    new Promise<Record<string, string>>((resolve, reject) => {
      storage.getItems(keys, (error, values) => (error ? reject(new Error(error)) : resolve(values ?? {})));
    }),
    `get ${keys.join(',')}`
  );
}

function removeCloudItems(storage: CloudStorage, keys: string[]): Promise<void> {
  return withTimeout(
    new Promise<void>((resolve, reject) => {
      storage.removeItems(keys, (error) => (error ? reject(new Error(error)) : resolve()));
    }),
    'remove'
  );
}

function chunkKeys(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${CHUNK_PREFIX}${index}`);
}

// Resolves when the history is stored. Rejects if the cloud write fails, so the caller can show it.
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
  if (chunks.length > MAX_CHUNKS) {
    throw new Error('history too large for cloud storage');
  }

  // Chunks first, then the count: a reader never sees a count that points at missing chunks
  await Promise.all(chunks.map((chunk, index) => setCloudItem(storage, `${CHUNK_PREFIX}${index}`, chunk)));
  await setCloudItem(storage, META_KEY, String(chunks.length));
}

export async function loadHistory(): Promise<LoadResult> {
  const storage = cloudStorage();
  if (storage) {
    try {
      const meta = await getCloudItems(storage, [META_KEY]);
      const count = Number(meta[META_KEY] ?? 0);
      if (count > 0) {
        const keys = chunkKeys(count);
        const values = await getCloudItems(storage, keys);
        const json = keys.map((key) => values[key] ?? '').join('');
        if (json) return { ok: true, json };
      }
      // Cloud read fine but empty: check the local copy (history from before cloud storage)
      return { ok: true, json: readLocal() };
    } catch {
      // Cloud could not be read: do not touch stored history in this session
      return { ok: false, json: null };
    }
  }

  return { ok: true, json: readLocal() };
}

function readLocal(): string | null {
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
  await removeCloudItems(storage, [META_KEY, ...chunkKeys(MAX_CHUNKS)]);
}
