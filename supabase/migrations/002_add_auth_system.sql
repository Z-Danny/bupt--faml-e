-- ============================================
-- Famlée 用户认证系统迁移脚本
-- 添加用户表和 RLS 策略
-- ============================================

-- ============================================
-- 1. 创建用户档案表
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    mood_preference TEXT DEFAULT 'NEUTRAL' CHECK (mood_preference IN ('NEUTRAL', 'HAPPY', 'ANXIOUS', 'SAD', 'ANGRY')),
    persona_preference TEXT DEFAULT 'healing' CHECK (persona_preference IN ('healing', 'rational', 'fun')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加注释
COMMENT ON TABLE user_profiles IS '用户档案表 - 存储用户额外信息';
COMMENT ON COLUMN user_profiles.id IS '关联 auth.users 的用户ID';
COMMENT ON COLUMN user_profiles.email IS '用户邮箱';
COMMENT ON COLUMN user_profiles.display_name IS '用户显示名称';
COMMENT ON COLUMN user_profiles.avatar_url IS '用户头像URL';
COMMENT ON COLUMN user_profiles.mood_preference IS '偏好心情主题';
COMMENT ON COLUMN user_profiles.persona_preference IS '偏好AI人格';

-- ============================================
-- 2. 清理旧数据并修改表结构
-- ============================================

-- 清空现有数据（数据不重要，已确认）
TRUNCATE TABLE chat_messages CASCADE;
TRUNCATE TABLE chat_sessions CASCADE;
TRUNCATE TABLE journals CASCADE;

-- 修改 journals 表的 user_id 列类型（VARCHAR → UUID）
ALTER TABLE journals
    ALTER COLUMN user_id TYPE UUID USING gen_random_uuid();

-- 修改 chat_sessions 表的 user_id 列类型（VARCHAR → UUID）
ALTER TABLE chat_sessions
    ALTER COLUMN user_id TYPE UUID USING gen_random_uuid();

-- ============================================
-- 3. 启用 RLS（Row Level Security）
-- ============================================

ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. 创建 RLS 策略
-- ============================================

-- journals 表策略
-- 用户只能查看自己的日记
CREATE POLICY "Users can view own journals"
    ON journals FOR SELECT
    USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 用户可以创建自己的日记
CREATE POLICY "Users can create own journals"
    ON journals FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 用户可以更新自己的日记
CREATE POLICY "Users can update own journals"
    ON journals FOR UPDATE
    USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 用户可以删除自己的日记
CREATE POLICY "Users can delete own journals"
    ON journals FOR DELETE
    USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- chat_sessions 表策略
-- 用户可以查看自己的会话
CREATE POLICY "Users can view own chat_sessions"
    ON chat_sessions FOR SELECT
    USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 用户可以创建自己的会话
CREATE POLICY "Users can create own chat_sessions"
    ON chat_sessions FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- chat_messages 表策略
-- 通过关联会话控制：用户只能查看自己会话的消息
CREATE POLICY "Users can view own chat_messages"
    ON chat_messages FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

-- 用户可以创建自己会话的消息
CREATE POLICY "Users can create own chat_messages"
    ON chat_messages FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

-- user_profiles 表策略
-- 用户可以查看自己的档案
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() IS NOT NULL AND id = auth.uid());

-- 用户可以更新自己的档案
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() IS NOT NULL AND id = auth.uid());

-- ============================================
-- 5. 创建触发器：用户注册时自动创建档案
-- ============================================

-- 创建函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. 允许服务端角色访问（可选）
-- ============================================

-- 如果需要服务端访问，可以添加服务端角色策略
-- ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Service role can access all" ON journals
--     FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ 认证系统迁移完成！';
    RAISE NOTICE '📋 已创建表：user_profiles';
    RAISE NOTICE '🔒 已启用 RLS 并设置策略';
    RAISE NOTICE '🔄 已修改 user_id 为 UUID 类型';
    RAISE NOTICE '🚀 已创建用户注册触发器';
    RAISE NOTICE '⚠️  注意：如果表中有旧数据，user_id 可能需要手动调整';
END $$;
