const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'famlee_auth_token';

export interface ApiErrorBody {
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function apiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    let errorBody: ApiErrorBody = {};
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { message: await response.text().catch(() => '') };
    }
    throw new ApiError(response.status, errorBody.error || errorBody.message || `请求失败 (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
