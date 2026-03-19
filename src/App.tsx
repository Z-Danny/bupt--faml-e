
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

const App: React.FC = () => {
  // 检测是否为管理模式
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // 用户端状态
  const [currentPage, setCurrentPage] = useState('home');
  const [globalMood, setGlobalMood] = useState<MoodType>(MoodType.NEUTRAL);

  // Persona State - Default to the second one (Rational) per user request
  const [currentPersona, setCurrentPersona] = useState<PersonaConfig>(PERSONAS[1]);

  // State to hold message when switching from Journal Modal to Chat
  const [pendingChatMessage, setPendingChatMessage] = useState<string | null>(null);

  // Bottom navigation visibility state
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);

  // 初始化：检测 URL 参数和登录状态
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');

    if (modeParam === 'admin') {
      setIsAdminMode(true);
      // 检查是否已登录
      const token = localStorage.getItem('famlee_admin_token');
      if (token === 'authenticated') {
        setIsAdminAuthenticated(true);
      }
    }
  }, []);

  // 管理员登录成功
  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  // 管理员退出登录
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    // 重定向回用户端
    window.location.href = window.location.origin;
  };

  // 如果是管理模式，渲染管理端
  if (isAdminMode) {
    return isAdminAuthenticated ? (
      <AdminPage onLogout={handleAdminLogout} />
    ) : (
      <AdminLogin onLoginSuccess={handleAdminLogin} />
    );
  }

  // 以下是用户端逻辑
  const handleAddEntry = (entry: JournalEntry) => {
    // 日记已保存到 Supabase，这里可以添加额外的处理逻辑（如通知）
    console.log('日记已保存:', entry);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage
                  setPage={setCurrentPage}
                  currentMood={globalMood}
                  setGlobalMood={setGlobalMood}
                  onSaveEntry={handleAddEntry}
                  setPendingChatMessage={setPendingChatMessage}
                  currentPersona={currentPersona}
                  setPersona={setCurrentPersona}
               />;
      case 'chat':
        return <ChatPage
                  setGlobalMood={setGlobalMood}
                  initialMessage={pendingChatMessage}
                  clearInitialMessage={() => setPendingChatMessage(null)}
                  currentPersona={currentPersona}
                  setBottomNavVisible={setIsBottomNavVisible}
               />;
      case 'calendar':
        return <CalendarPage
                  setGlobalMood={setGlobalMood}
               />;
      case 'campus': return <CampusPage />;
      case 'waterfall': return <WaterfallPage />;
      case 'profile': return <ProfilePage />;
      default: return <HomePage
                  setPage={setCurrentPage}
                  currentMood={globalMood}
                  setGlobalMood={setGlobalMood}
                  onSaveEntry={handleAddEntry}
                  setPendingChatMessage={setPendingChatMessage}
                  currentPersona={currentPersona}
                  setPersona={setCurrentPersona}
               />;
    }
  };

  const NavButton = ({ id, icon: Icon }: { id: string, icon: any }) => (
    <button
        onClick={() => setCurrentPage(id)}
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
            onClick={() => setCurrentPage('home')}
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
