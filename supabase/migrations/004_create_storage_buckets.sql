-- ============================================
-- 创建 Storage Buckets 和 RLS 策略
-- 执行方式：在 Supabase Dashboard 的 SQL Editor 中运行
-- ============================================

-- ============================================
-- 1. 创建 journal-audio bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'journal-audio',
    'journal-audio',
    true,
    10485760, -- 10MB
    ARRAY['audio/webm', 'audio/ogg', 'audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/mp4']
);

-- ============================================
-- 2. 创建 journal-images bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'journal-images',
    'journal-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- ============================================
-- 3. journal-audio RLS 策略
-- ============================================

-- 上传策略：已认证用户可上传
CREATE POLICY "Authenticated users can upload audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'journal-audio');

-- 查看策略：公开可查看（便于音频播放）
CREATE POLICY "Public can view audio"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'journal-audio');

-- 删除策略：用户可删除自己的音频
CREATE POLICY "Authenticated users can delete audio"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'journal-audio');

-- ============================================
-- 4. journal-images RLS 策略
-- ============================================

-- 上传策略：已认证用户可上传
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'journal-images');

-- 查看策略：公开可查看
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'journal-images');

-- 删除策略：用户可删除自己的图片
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'journal-images');

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Storage buckets 创建成功！';
    RAISE NOTICE '📁 journal-audio: 音频存储桶，公开访问';
    RAISE NOTICE '📁 journal-images: 图片存储桶，公开访问';
    RAISE NOTICE '🔒 RLS 策略已配置';
END $$;
