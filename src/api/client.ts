import { useAuthStore } from '../store/useAuthStore';

const API_BASE = 'http://localhost:5003/api';

export async function client(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Первый запрос
  let res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Авто-рефреш: только если был токен и получили 401
  if (res.status === 401 && token) {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!refreshRes.ok) throw new Error('Refresh failed');

      const data = await refreshRes.json();
      useAuthStore.getState().setToken(data.accessToken);

      // Повторяем оригинальный запрос с новым токеном
      headers['Authorization'] = `Bearer ${data.accessToken}`;
      res = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    } catch {
      useAuthStore.getState().logout();
      throw new Error('Session expired. Please login again.');
    }
  }

  return res;
}