/**
 * Supabase 客户端配置
 * 用于连接 Supabase 后端服务
 */

import { createClient } from '@supabase/supabase-js';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// 从环境变量读取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 验证环境变量
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        '缺少 Supabase 环境变量。请检查 .env.local 文件中的 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY'
    );
}

// 创建 Supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 用户认证状态
let currentUser: SupabaseUser | null = null;
let userInitPromise: Promise<void> | null = null;

/**
 * 初始化用户会话
 * 从 Supabase 获取当前用户信息
 */
async function initUserSession(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;
}

/**
 * 获取当前用户ID
 * 如果用户未登录，返回 null
 * 使用 async/await 调用以确保获取最新状态
 */
export async function getUserId(): Promise<string | null> {
    if (userInitPromise === null) {
        userInitPromise = initUserSession();
    }
    await userInitPromise;

    // 检查最新用户状态
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;

    return currentUser?.id ?? null;
}

/**
 * 获取当前用户（同步版本）
 * 注意：首次调用时可能返回 null，建议使用 getUserId() 获取准确状态
 */
export function getCurrentUserIdSync(): string | null {
    return currentUser?.id ?? null;
}

/**
 * 刷新用户状态
 * 在登录/登出后调用以更新本地缓存
 */
export function refreshUserState(): void {
    currentUser = null;
    userInitPromise = null;
}

/**
 * 监听认证状态变化
 */
export function onAuthStateChange(callback: (user: SupabaseUser | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user ?? null;
        callback(currentUser);
    });

    return subscription;
}

/**
 * 检查用户是否已登录
 */
export async function isLoggedIn(): Promise<boolean> {
    const userId = await getUserId();
    return userId !== null;
}
