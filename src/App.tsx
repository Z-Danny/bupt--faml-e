import React, { useState, useEffect } from 'react';
import { FluidBackground } from './components/FluidBackground';
import { HomePage } from './pages/Home';
import { ChatPage } from './pages/Chat';
import { CalendarPage } from './pages/Calendar';
import { CampusPage } from './pages/Campus';
import { WaterfallPage } from './pages/Waterfall';
import { ProfilePage } from './pages/Profile';
import { AdminPage } from './pages/Admin';
import { AdminLogin } from './pages/AdminLogin';
import { MoodType, JournalEntry, PersonaConfig } from './types';
import { Home, Calendar as CalendarIcon, ClipboardList, Megaphone, User } from 'lucide-react';
import { PERSONAS } from './constants';
import { getUserId, onAuthStateChange, refreshUserState } from './lib/supabaseClient';
import { getCurrentUser, signOut, onAuthStateChange as onAuthChange, type User as AuthUser } from './services/authService';

// 需要登录的页面列表
const PROTECTED_PAGES = ['chat', 'calendar', 'journal'];

// 游客可访问的页面
const PUBLIC_PAGES = ['home', 'campus', 'waterfall', 'profile'];

const App: React.FC = () => {
  // ============================================
  // 管理员模式状态
  // ============================================
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // ============================================
  // 用户认证状态
  // ============================================
  const [user, setUser] = useState<{ id: string; email: string; display_name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // 用户端状态
  // ============================================
  const [currentPage, setCurrentPage] = useState('home');
  const [globalMood, setGlobalMood] = useState<MoodType>(MoodType.NEUTRAL);
  const [currentPersona, setCurrentPersona] = useState<PersonaConfig>(PERSONAS[1]);
  const [pendingChatMessage, setPendingChatMessage] = useState<string | null>(null);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);

  // ============================================
  // 初始化：检测 URL 参数和认证状态
  // ============================================
  useEffect(() => {
    const init = async () => {
      // 检测是否为管理模式
      const urlParams = new URLSearchParams(window.location.search);
      const modeParam = urlParams.get('mode');

      if (modeParam === 'admin') {
        setIsAdminMode(true);
        const token = localStorage.getItem('famlee_admin_token');
        if (token === 'authenticated') {
          setIsAdminAuthenticated(true);
        }
      } else {
        // 用户端：检查登录状态
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setLoading(false);
      }
    };

    init();

    // 监听认证状态变化
    const subscription = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      // 如果用户登出且当前在需要登录的页面，返回首页
      if (!currentUser && PROTECTED_PAGES.includes(currentPage)) {
        setCurrentPage('home');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [currentPage]);

  // ============================================
  // 认证处理函数
  // ============================================
  const handleLoginSuccess = (authUser: AuthUser) => {
    refreshUserState();
    setUser(authUser);
  };

  const handleLogout = async () => {
    await signOut();
    refreshUserState();
    setUser(null);
    setCurrentPage('home');
  };

  // ============================================
  // 管理员处理函数
  // ============================================
  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    window.location.href = window.location.origin;
  };

  // ============================================
  // 页面切换：检查权限
  // ============================================
  const handlePageChange = (page: string) => {
    // 如果未登录且访问需要登录的页面，提示用户去个人中心登录
    if (!user && PROTECTED_PAGES.includes(page)) {
      setCurrentPage('profile');
      return;
    }
    setCurrentPage(page);
  };

  // ============================================
  // 管理员模式渲染
  // ============================================
  if (isAdminMode) {
    return isAdminAuthenticated ? (
      <AdminPage onLogout={handleAdminLogout} />
    ) : (
      <AdminLogin onLoginSuccess={handleAdminLogin} />
    );
  }

  // ============================================
  // 加载状态
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // 用户端渲染
  // ============================================
  const handleAddEntry = (entry: JournalEntry) => {
    console.log('日记已保存:', entry);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage
                  setPage={handlePageChange}
                  currentMood={globalMood}
                  setGlobalMood={setGlobalMood}
                  onSaveEntry={handleAddEntry}
                  setPendingChatMessage={setPendingChatMessage}
                  currentPersona={currentPersona}
                  setPersona={setCurrentPersona}
                  user={user}
               />;
      case 'chat':
        if (!user) {
          // 如果没有用户，不应该到这里，但作为防御
          return (
            <div className="h-full flex items-center justify-center px-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">请先登录</p>
                <button
                  onClick={() => handlePageChange('profile')}
                  className="px-6 py-2 bg-purple-500 text-white rounded-xl"
                >
                  去登录
                </button>
              </div>
            </div>
          );
        }
        return <ChatPage
                  setGlobalMood={setGlobalMood}
                  initialMessage={pendingChatMessage}
                  clearInitialMessage={() => setPendingChatMessage(null)}
                  currentPersona={currentPersona}
                  setBottomNavVisible={setIsBottomNavVisible}
                  userId={user.id}
               />;
      case 'calendar':
        if (!user) {
          return (
            <div className="h-full flex items-center justify-center px-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">请先登录</p>
                <button
                  onClick={() => handlePageChange('profile')}
                  className="px-6 py-2 bg-purple-500 text-white rounded-xl"
                >
                  去登录
                </button>
              </div>
            </div>
          );
        }
        return <CalendarPage
                  setGlobalMood={setGlobalMood}
                  userId={user.id}
               />;
      case 'campus': return <CampusPage />;
      case 'waterfall': return <WaterfallPage />;
      case 'profile':
        return <ProfilePage
                  user={user}
                  onLogout={handleLogout}
                  onLoginSuccess={handleLoginSuccess}
               />;
      default: return <HomePage
                  setPage={handlePageChange}
                  currentMood={globalMood}
                  setGlobalMood={setGlobalMood}
                  onSaveEntry={handleAddEntry}
                  setPendingChatMessage={setPendingChatMessage}
                  currentPersona={currentPersona}
                  setPersona={setCurrentPersona}
                  user={user}
               />;
    }
  };

  const NavButton = ({ id, icon: Icon }: { id: string, icon: any }) => (
    <button
        onClick={() => handlePageChange(id)}
        className={`p-4 rounded-full transition-all duration-300 ${
            currentPage === id
            ? 'bg-gray-800 text-white shadow-lg'
            : 'text-gray-500 hover:bg-white/30'
        }`}
    >
        <Icon size={22} strokeWidth={1.5} />
    </button>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden text-gray-800">
      <FluidBackground mood={globalMood} />

      {/* Main Content Area */}
      <main className="h-full w-full">
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 glass-panel rounded-full pl-3 pr-3 py-2.5 flex items-center gap-2 shadow-xl z-40 border border-white/40 transition-all duration-300 ${
        isBottomNavVisible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'
      }`}>
        <NavButton id="calendar" icon={CalendarIcon} />
        <NavButton id="waterfall" icon={Megaphone} />

        {/* Center Prominent Button for Home */}
        <button
            onClick={() => handlePageChange('home')}
            className={`
                mx-3 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border border-white/20
                ${currentPage === 'home'
                ? 'bg-gray-800 text-white scale-110 shadow-gray-500/30'
                : 'bg-white/50 text-gray-700 hover:bg-white/70'}
            `}
        >
            <Home size={26} strokeWidth={1.5} />
        </button>

        <NavButton id="campus" icon={ClipboardList} />
        <NavButton id="profile" icon={User} />
      </nav>
    </div>
  );
};

export default App;
