/**
 * Supabase 客户端配置
 * 用于连接 Supabase 后端服务
 */

import { createClient } from '@supabase/supabase-js';

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

/**
 * 开发阶段：统一使用固定用户ID
 * 所有访问者共享同一个用户身份，方便测试和演示
 *
 * TODO: 正式上线前需改回动态生成用户ID的逻辑
 */
const DEMO_USER_ID = 'demo_user';

export const getUserId = (): string => {
  // 开发阶段：返回固定用户ID
  return DEMO_USER_ID;
};
