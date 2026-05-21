import { apiFetch, clearAuthToken, setAuthToken } from '../lib/apiClient';
import { emitAuthStateChange, onAuthStateChange as subscribeAuthState } from '../lib/authState';

export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  mood_preference?: string;
  persona_preference?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User;
  requiresEmailConfirmation?: boolean;
}

interface AuthPayload {
  token: string;
  user: User;
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const data = await apiFetch<AuthPayload>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setAuthToken(data.token);
    emitAuthStateChange(data.user);
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || '注册失败，请稍后重试' };
  }
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const data = await apiFetch<AuthPayload>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setAuthToken(data.token);
    emitAuthStateChange(data.user);
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || '登录失败，请稍后重试' };
  }
}

export async function signOut(): Promise<{ success: boolean; error?: string }> {
  clearAuthToken();
  emitAuthStateChange(null);
  return { success: true };
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const data = await apiFetch<{ user: User }>('/auth/me');
    return data.user;
  } catch {
    return null;
  }
}

export async function fetchUserProfile(userId: string, email?: string): Promise<User> {
  try {
    const data = await apiFetch<{ user: User }>(`/users/${userId}`);
    return data.user;
  } catch {
    return { id: userId, email: email || '' };
  }
}

export async function updateUserProfile(
  updates: Partial<Pick<User, 'display_name' | 'avatar_url' | 'mood_preference' | 'persona_preference'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await apiFetch<{ user: User }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    emitAuthStateChange(data.user);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || '更新失败，请稍后重试' };
  }
}

export async function resetPassword(_email: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: '当前自托管版本暂未开启邮件重置密码' };
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return subscribeAuthState(callback);
}
