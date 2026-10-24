import { useAuthStore } from '../store/useAuthStore';

const API_BASE = 'http://localhost:5003/api';

export async function client(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const token = useAuthStore.getState().accessToken;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  
  if (res.status === 401 && token) {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!refreshRes.ok) throw new Error('Refresh failed');

      const data = await refreshRes.json();
      useAuthStore.getState().setAuth(data.user ?? useAuthStore.getState().user!, data.accessToken);

      headers['Authorization'] = `Bearer ${data.accessToken}`;
      res = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    } catch {
      useAuthStore.getState().clearAuth();
      throw new Error('Session expired. Please login again.');
    }
  }

  return res;
}