-- Famlée 数据库初始化脚本
-- 创建所有必要的表和索引

-- ============================================
-- 1. journals 表：存储用户日记
-- ============================================
CREATE TABLE IF NOT EXISTS journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    mood VARCHAR(20) NOT NULL CHECK (mood IN ('NEUTRAL', 'HAPPY', 'ANXIOUS', 'SAD', 'ANGRY')),
    images TEXT[] DEFAULT '{}',
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为 journals 表创建索引（提升查询性能）
CREATE INDEX IF NOT EXISTS idx_journals_user_id_created_at
ON journals(user_id, created_at DESC);

-- 添加注释
COMMENT ON TABLE journals IS '用户日记表';
COMMENT ON COLUMN journals.id IS '日记唯一标识';
COMMENT ON COLUMN journals.user_id IS '用户ID（前端生成）';
COMMENT ON COLUMN journals.content IS '日记内容';
COMMENT ON COLUMN journals.summary IS 'AI生成的总结';
COMMENT ON COLUMN journals.mood IS '心情类型';
COMMENT ON COLUMN journals.images IS '图片URL数组';
COMMENT ON COLUMN journals.audio_url IS '音频URL';
COMMENT ON COLUMN journals.created_at IS '创建时间';

-- ============================================
-- 2. chat_sessions 表：存储聊天会话
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    persona VARCHAR(20) NOT NULL CHECK (persona IN ('healing', 'rational', 'fun')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为 chat_sessions 表创建索引
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id_created_at
ON chat_sessions(user_id, created_at DESC);

-- 添加注释
COMMENT ON TABLE chat_sessions IS '聊天会话表';
COMMENT ON COLUMN chat_sessions.id IS '会话唯一标识';
COMMENT ON COLUMN chat_sessions.user_id IS '用户ID';
COMMENT ON COLUMN chat_sessions.persona IS 'AI角色类型（healing/rational/fun）';
COMMENT ON COLUMN chat_sessions.created_at IS '会话创建时间';

-- ============================================
-- 3. chat_messages 表：存储聊天消息
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'model')),
    content TEXT NOT NULL,
    mood_detected VARCHAR(20) CHECK (mood_detected IN ('NEUTRAL', 'HAPPY', 'ANXIOUS', 'SAD', 'ANGRY')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为 chat_messages 表创建索引
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id_created_at
ON chat_messages(session_id, created_at ASC);

-- 添加注释
COMMENT ON TABLE chat_messages IS '聊天消息表';
COMMENT ON COLUMN chat_messages.id IS '消息唯一标识';
COMMENT ON COLUMN chat_messages.session_id IS '所属会话ID';
COMMENT ON COLUMN chat_messages.role IS '消息角色（user/model）';
COMMENT ON COLUMN chat_messages.content IS '消息内容';
COMMENT ON COLUMN chat_messages.mood_detected IS '检测到的心情';
COMMENT ON COLUMN chat_messages.created_at IS '消息创建时间';

-- ============================================
-- 4. 插入测试数据（可选）
-- ============================================
-- 取消下面的注释以插入测试数据

-- INSERT INTO journals (user_id, content, summary, mood) VALUES
-- ('test_user_001', '今天天气很好，心情不错！', 'AI总结：用户心情愉悦', 'HAPPY'),
-- ('test_user_001', '工作压力有点大，需要放松一下。', 'AI总结：用户感到压力', 'ANXIOUS');

-- INSERT INTO chat_sessions (user_id, persona) VALUES
-- ('test_user_001', 'healing');

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ 数据库表创建成功！';
    RAISE NOTICE '📋 已创建表：journals, chat_sessions, chat_messages';
    RAISE NOTICE '📊 已创建索引：提升查询性能';
    RAISE NOTICE '🎉 可以开始使用了！';
END $$;
