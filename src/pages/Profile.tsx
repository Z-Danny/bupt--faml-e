
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Shield, Activity, ChevronRight, LogOut, Moon, Nfc, Mail, Lock, User as UserIcon, X, Camera, Check, Loader2 } from 'lucide-react';
import { signIn, signUp, updateUserProfile, type User as AuthUser } from '../services/authService';
import { uploadAvatar } from '../services/supabaseService';

interface ProfilePageProps {
  user: { id: string; email: string; display_name?: string; avatar_url?: string } | null;
  onLogout: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

type AuthView = 'none' | 'login' | 'register';

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout, onLoginSuccess }) => {
  const [authView, setAuthView] = useState<AuthView>('none');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

  // 编辑个人信息相关状态
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const [editAvatarBlob, setEditAvatarBlob] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 如果没有用户，显示登录/注册选项
  useEffect(() => {
    if (!user) {
      setAuthView('none');
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);

    setLoading(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
      setAuthView('none');
      setEmail('');
      setPassword('');
    } else {
      setError(result.error || '登录失败');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('密码至少需要 6 个字符');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    const result = await signUp(email, password);

    setLoading(false);

    if (result.success) {
      if (result.requiresEmailConfirmation) {
        setShowEmailConfirmation(true);
      } else if (result.user) {
        onLoginSuccess(result.user);
        setAuthView('none');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } else {
      setError(result.error || '注册失败');
    }
  };

  const handleCancel = () => {
    setAuthView('none');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setShowEmailConfirmation(false);
  };

  // ============================================
  // 编辑个人信息相关函数
  // ============================================
  const openEditModal = () => {
    setEditDisplayName(user?.display_name || '');
    setEditAvatarPreview(user?.avatar_url || null);
    setEditAvatarBlob(null);
    setEditError('');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditDisplayName('');
    setEditAvatarPreview(null);
    setEditAvatarBlob(null);
    setEditError('');
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // 检查文件大小（限制 2MB）
      if (file.size > 2 * 1024 * 1024) {
        setEditError('头像图片不能超过 2MB');
        return;
      }

      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        setEditError('请选择图片文件');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditAvatarPreview(result);
        setEditAvatarBlob(result);
        setEditError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!editDisplayName.trim()) {
      setEditError('请输入用户名');
      return;
    }

    setIsSaving(true);
    setEditError('');

    try {
      let avatarUrl = user?.avatar_url;

      // 如果有新头像，先上传
      if (editAvatarBlob) {
        avatarUrl = await uploadAvatar(editAvatarBlob);
      }

      // 更新用户档案
      const result = await updateUserProfile({
        display_name: editDisplayName.trim(),
        avatar_url: avatarUrl,
      });

      if (result.success) {
        // 刷新页面以更新显示
        window.location.reload();
      } else {
        setEditError(result.error || '保存失败');
      }
    } catch (err: any) {
      console.error('保存个人信息失败:', err);
      setEditError(err.message || '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 渲染登录/注册面板
  if (authView !== 'none') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 pb-24">
        {/* 邮箱验证成功提示 */}
        {showEmailConfirmation ? (
          <div className="w-full max-w-sm">
            <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={32} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">检查你的邮箱</h2>
              <p className="text-sm text-gray-600 mb-6">
                我们已向 <span className="font-medium">{email}</span> 发送了验证邮件
              </p>
              <p className="text-xs text-gray-500 mb-6">请点击邮件中的验证链接完成注册</p>
              <button
                onClick={handleCancel}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition"
              >
                返回
              </button>
            </div>
          </div>
        ) : (
          /* 登录/注册表单 */
          <div className="w-full max-w-sm">
            <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] relative">
              {/* 关闭按钮 */}
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-white/40 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              {/* 标题 */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {authView === 'login' ? '登录' : '注册'}
                </h2>
                <p className="text-sm text-gray-500">Famlée 欢迎你</p>
              </div>

              {/* 表单 */}
              <form onSubmit={authView === 'login' ? handleLogin : handleRegister} className="space-y-4">
                {/* 邮箱输入 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2 ml-1">
                    邮箱
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/40 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-purple-300 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* 密码输入 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2 ml-1">
                    密码
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authView === 'login' ? '••••••••' : '至少 6 个字符'}
                      className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/40 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-purple-300 transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {/* 确认密码（仅注册时显示） */}
                {authView === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2 ml-1">
                      确认密码
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="再次输入密码"
                        className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/40 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-purple-300 transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* 错误提示 */}
                {error && (
                  <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-xs">
                    {error}
                  </div>
                )}

                {/* 提交按钮 */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '处理中...' : (authView === 'login' ? '登录' : '注册')}
                </button>
              </form>

              {/* 切换登录/注册 */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')}
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  {authView === 'login' ? '还没有账号？立即注册' : '已有账号？立即登录'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 渲染个人中心（已登录或游客模式）
  return (
    <div className="h-full flex flex-col pt-12 px-5 pb-24 max-w-2xl mx-auto overflow-y-auto scrollbar-hide">

      {/* User Profile Card - Apple ID Style */}
      {user ? (
        /* 已登录用户 */
        <div
          onClick={openEditModal}
          className="bg-white/40 backdrop-blur-xl border border-white/50 p-5 rounded-[2rem] flex items-center gap-4 mb-6 shadow-sm cursor-pointer hover:bg-white/50 transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-white p-1 shadow-sm flex-shrink-0 relative">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <UserIcon size={28} className="text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white">
              <Camera size={12} className="text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 truncate">
                {user.display_name || 'Famlée 用户'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
          </div>
          <button className="p-2 bg-white/50 rounded-full">
              <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>
      ) : (
        /* 未登录用户 - 显示登录/注册入口 */
        <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-[2rem] text-center mb-6 shadow-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon size={32} className="text-purple-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">欢迎使用 Famlée</h3>
          <p className="text-xs text-gray-500 mb-4">登录后解锁全部功能</p>
          <button
            onClick={() => setAuthView('login')}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            登录 / 注册
          </button>
        </div>
      )}

      {/* Settings Group 1 - 仅登录用户可见 */}
      {user && (
        <div className="bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden mb-6 shadow-sm">
           <button className="w-full flex items-center gap-3 p-4 hover:bg-white/30 transition-colors border-b border-gray-100/50">
               <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                   <Activity size={18} />
               </div>
               <span className="flex-1 text-left text-sm font-medium text-gray-800">使用说明</span>
               <ChevronRight size={16} className="text-gray-400" />
           </button>
           <button className="w-full flex items-center gap-3 p-4 hover:bg-white/30 transition-colors border-b border-gray-100/50">
               <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                   <Shield size={18} />
               </div>
               <span className="flex-1 text-left text-sm font-medium text-gray-800">隐私边界</span>
               <ChevronRight size={16} className="text-gray-400" />
           </button>
           <button className="w-full flex items-center gap-3 p-4 hover:bg-white/30 transition-colors border-b border-gray-100/50">
               <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                   <Nfc size={18} />
               </div>
               <span className="flex-1 text-left text-sm font-medium text-gray-800">NFC 设置</span>
               <ChevronRight size={16} className="text-gray-400" />
           </button>
           <button className="w-full flex items-center gap-3 p-4 hover:bg-white/30 transition-colors">
               <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
                   <Settings size={18} />
               </div>
               <span className="flex-1 text-left text-sm font-medium text-gray-800">通用设置</span>
               <ChevronRight size={16} className="text-gray-400" />
           </button>
        </div>
      )}

      {/* Settings Group 2 */}
      <div className="bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden mb-8 shadow-sm">
         <button className="w-full flex items-center gap-3 p-4 hover:bg-white/30 transition-colors">
             <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                 <Moon size={18} />
             </div>
             <span className="flex-1 text-left text-sm font-medium text-gray-800">深色模式</span>
             <div className="w-10 h-6 bg-gray-200 rounded-full relative">
                 <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
             </div>
         </button>
      </div>

      {/* 退出登录按钮 - 仅登录用户可见 */}
      {user && (
        <button
          onClick={onLogout}
          className="mt-auto w-full py-3.5 bg-white/30 text-red-400 text-sm font-medium rounded-xl border border-white/40 hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2"
        >
            <LogOut size={16} /> 退出登录
        </button>
      )}

      <div className="text-center mt-6 mb-2">
          <p className="text-[10px] text-gray-400 font-light">Famlée v1.0.3 Build 2024</p>
      </div>

      {/* 编辑个人信息弹窗 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={closeEditModal}
          ></div>

          {/* Card */}
          <div className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden relative animate-slide-up transform transition-all border border-white/50">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100/50">
              <span className="text-sm font-medium text-gray-500 tracking-widest">编辑资料</span>
              <button onClick={closeEditModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {/* 头像上传 */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md overflow-hidden">
                    {editAvatarPreview ? (
                      <img src={editAvatarPreview} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <UserIcon size={40} className="text-white" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-purple-600 transition-colors"
                  >
                    <Camera size={16} className="text-white" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                  />
                </div>
              </div>

              {/* 用户名输入 */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-2 ml-1">
                  用户名
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="输入你的用户名"
                  className="w-full px-4 py-3 bg-gray-50/50 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 transition-all"
                  maxLength={20}
                />
                <p className="text-[10px] text-gray-400 mt-1 ml-1">最多 20 个字符</p>
              </div>

              {/* 错误提示 */}
              {editError && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 text-red-600 rounded-xl text-xs">
                  {editError}
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={closeEditModal}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      保存 <Check size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
