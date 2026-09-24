/**
 * Minimal promise wrapper over IndexedDB for data that can grow beyond what
 * belongs in localStorage (problem reports with free-text notes).
 */

const DB_NAME = 'voltara';
const DB_VERSION = 1;

export const STORES = { reports: 'reports' } as const;

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (!('indexedDB' in window)) return Promise.reject(new Error('IndexedDB unavailable'));
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.reports)) {
        db.createObjectStore(STORES.reports, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
  });
  return dbPromise;
}

function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = fn(db.transaction(store, mode).objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export const idb = {
  put: <T>(store: string, value: T) => tx(store, 'readwrite', (s) => s.put(value)),
  all: <T>(store: string) => tx<T[]>(store, 'readonly', (s) => s.getAll() as IDBRequest<T[]>),
  clear: (store: string) => tx(store, 'readwrite', (s) => s.clear()),
  async destroy(): Promise<void> {
    if (dbPromise) (await dbPromise).close();
    dbPromise = null;
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    });
  },
};
