import { apiFetch, getAuthToken } from './apiClient';
import type { User } from '../services/authService';

type AuthCallback = (user: User | null) => void;

const subscribers = new Set<AuthCallback>();
let currentUser: User | null = null;
let userInitPromise: Promise<User | null> | null = null;

async function fetchCurrentUser(): Promise<User | null> {
  if (!getAuthToken()) {
    currentUser = null;
    return null;
  }

  try {
    const data = await apiFetch<{ user: User }>('/auth/me');
    currentUser = data.user;
    return currentUser;
  } catch {
    currentUser = null;
    return null;
  }
}

export async function getUserId(): Promise<string | null> {
  if (userInitPromise === null) {
    userInitPromise = fetchCurrentUser();
  }
  const user = await userInitPromise;
  return user?.id ?? null;
}

export function getCurrentUserIdSync(): string | null {
  return currentUser?.id ?? null;
}

export function refreshUserState(): void {
  currentUser = null;
  userInitPromise = null;
}

export function emitAuthStateChange(user: User | null): void {
  currentUser = user;
  subscribers.forEach((callback) => callback(user));
}

export function onAuthStateChange(callback: AuthCallback) {
  subscribers.add(callback);
  return {
    unsubscribe: () => subscribers.delete(callback),
  };
}

export async function isLoggedIn(): Promise<boolean> {
  return (await getUserId()) !== null;
}

export function isBackendAvailable(): boolean {
  return true;
}
