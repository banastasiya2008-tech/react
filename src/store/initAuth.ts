import { useAuthStore } from './useAuthStore';

const API_BASE = 'http://localhost:5003/api';

let initPromise: Promise<void> | null = null;

export function initAuth(): Promise<void> {
  if (initPromise) return initPromise;

  const { setAuth, clearAuth, setLoading } = useAuthStore.getState();
  setLoading(true);

  initPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setAuth(data.user, data.accessToken);
      } else {
        clearAuth();
      }
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  })();

  return initPromise;
}