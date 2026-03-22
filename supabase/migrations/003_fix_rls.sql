-- ============================================
-- 修复 RLS 策略问题
-- ============================================

-- 删除旧的 RLS 策略
DROP POLICY IF EXISTS "Users can view own journals" ON journals;
DROP POLICY IF EXISTS "Users can create own journals" ON journals;
DROP POLICY IF EXISTS "Users can update own journals" ON journals;
DROP POLICY IF EXISTS "Users can delete own journals" ON journals;

DROP POLICY IF EXISTS "Users can view own chat_sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can create own chat_sessions" ON chat_sessions;

DROP POLICY IF EXISTS "Users can view own chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can create own chat_messages" ON chat_messages;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- ============================================
-- 重新创建 RLS 策略（简化版）
-- ============================================

-- journals 表策略
CREATE POLICY "Users can view own journals"
    ON journals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journals"
    ON journals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journals"
    ON journals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journals"
    ON journals FOR DELETE
    USING (auth.uid() = user_id);

-- chat_sessions 表策略
CREATE POLICY "Users can view own chat_sessions"
    ON chat_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat_sessions"
    ON chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- chat_messages 表策略 - 简化为直接检查
CREATE POLICY "Users can view own chat_messages"
    ON chat_messages FOR SELECT
    USING (
        auth.uid() = (
            SELECT user_id FROM chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
        )
    );

CREATE POLICY "Users can create own chat_messages"
    ON chat_messages FOR INSERT
    WITH CHECK (
        auth.uid() = (
            SELECT user_id FROM chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
        )
    );

-- user_profiles 表策略
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ RLS 策略已修复！';
END $$;
