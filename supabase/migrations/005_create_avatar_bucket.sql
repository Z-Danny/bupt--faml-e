-- ============================================
-- 创建用户头像 Storage Bucket
-- 执行方式：在 Supabase Dashboard 的 SQL Editor 中运行
-- ============================================

-- ============================================
-- 1. 创建 avatars bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- ============================================
-- 2. RLS 策略
-- ============================================

-- 删除旧策略
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own avatars" ON storage.objects;

-- 上传策略：已认证用户可上传（使用用户ID作为文件名）
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 查看策略：公开可查看（便于显示头像）
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 删除策略：用户可删除自己的头像
CREATE POLICY "Authenticated users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 更新策略：用户可更新自己的头像
CREATE POLICY "Authenticated users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Avatars bucket 创建成功！';
    RAISE NOTICE '📁 bucket 名称: avatars';
    RAISE NOTICE '🔒 文件大小限制: 2MB';
    RAISE NOTICE '🌐 公开访问: 已启用';
    RAISE NOTICE '🔒 RLS 策略: 已配置';
END $$;
