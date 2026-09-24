import { useSyncExternalStore } from 'react';
import { store, type LocalState } from '../lib/storage';

export function useLocalState(): LocalState {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export function useIsFavorite(slug: string): boolean {
  return useLocalState().favorites.includes(slug);
}
