import { useCallback, useEffect, useState } from 'react';

// Only post IDs are stored, using the Web Storage API (localStorage).
// Everything else about a post is fetched from Reddit when needed.
const STORAGE_KEY = 'redditFavouriteIds';

function loadIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : [];
  } catch {
    return [];
  }
}

function checkStorage(): boolean {
  try {
    const probe = '__fav_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export const useFavourites = () => {
  const [ids, setIds] = useState<string[]>(loadIds);
  // Reddit runs the app in an iframe; some browsers block storage there.
  const [storageAvailable] = useState(checkStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Storage unavailable: favourites last only for this session.
    }
  }, [ids]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setIds(loadIds());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const remove = useCallback(
    (id: string) => setIds((prev) => prev.filter((x) => x !== id)),
    []
  );
  const toggle = useCallback(
    (id: string) =>
      setIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      ),
    []
  );
  const isFavourite = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, remove, toggle, isFavourite, storageAvailable };
};

export type Favourites = ReturnType<typeof useFavourites>;
