/**
 * 认证服务
 * 处理用户登录、注册、登出等认证操作
 */

import { supabase } from '../lib/supabaseClient';

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

// ============================================
// 注册
// ============================================
export async function signUp(email: string, password: string): Promise<AuthResponse> {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        // 检查是否需要邮箱验证
        if (!data.session) {
            return {
                success: true,
                requiresEmailConfirmation: true,
            };
        }

        return {
            success: true,
            user: data.user ? await fetchUserProfile(data.user.id, data.user.email) : undefined,
        };
    } catch (err) {
        return {
            success: false,
            error: '注册失败，请稍后重试',
        };
    }
}

// ============================================
// 登录
// ============================================
export async function signIn(email: string, password: string): Promise<AuthResponse> {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: true,
            user: data.user ? await fetchUserProfile(data.user.id, data.user.email) : undefined,
        };
    } catch (err) {
        return {
            success: false,
            error: '登录失败，请稍后重试',
        };
    }
}

// ============================================
// 登出
// ============================================
export async function signOut(): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }
        return { success: true };
    } catch (err) {
        return {
            success: false,
            error: '登出失败，请稍后重试',
        };
    }
}

// ============================================
// 获取当前用户
// ============================================
export async function getCurrentUser(): Promise<User | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return null;
        }

        return await fetchUserProfile(user.id, user.email);
    } catch (err) {
        return null;
    }
}

// ============================================
// 获取用户档案信息
// ============================================
export async function fetchUserProfile(userId: string, email?: string): Promise<User> {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !data) {
            // 如果档案不存在，返回基本信息
            return {
                id: userId,
                email: email || '',
            };
        }

        return {
            ...data,
            email: email || data.email || '',
        };
    } catch (err) {
        return {
            id: userId,
            email: email || '',
        };
    }
}

// ============================================
// 更新用户档案
// ============================================
export async function updateUserProfile(
    updates: Partial<Pick<User, 'display_name' | 'avatar_url' | 'mood_preference' | 'persona_preference'>>
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: '未登录' };
        }

        const { error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return { success: true };
    } catch (err) {
        return {
            success: false,
            error: '更新失败，请稍后重试',
        };
    }
}

// ============================================
// 重置密码
// ============================================
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return { success: true };
    } catch (err) {
        return {
            success: false,
            error: '发送失败，请稍后重试',
        };
    }
}

// ============================================
// 监听认证状态变化
// ============================================
export function onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            const userProfile = await fetchUserProfile(session.user.id, session.user.email);
            callback(userProfile);
        } else {
            callback(null);
        }
    });
    return subscription;
}
