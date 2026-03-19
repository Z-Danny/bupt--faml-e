
import React from 'react';
import { Settings, Shield, Activity, ChevronRight, LogOut, Moon, Nfc } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  return (
    <div className="h-full flex flex-col pt-12 px-5 pb-24 max-w-2xl mx-auto overflow-y-auto scrollbar-hide">
      
      {/* User Profile Card - Apple ID Style */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-5 rounded-[2rem] flex items-center gap-4 mb-6 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-white p-1 shadow-sm flex-shrink-0">
             <img src="/1.png" alt="Avatar" className="w-full h-full rounded-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate">北邮同学</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">2021级 · 信息与通信工程学院</p>
        </div>
        <button className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
            <ChevronRight size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Settings Group 1 */}
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

      <button className="mt-auto w-full py-3.5 bg-white/30 text-red-400 text-sm font-medium rounded-xl border border-white/40 hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2">
          <LogOut size={16} /> 退出登录
      </button>

      <div className="text-center mt-6 mb-2">
          <p className="text-[10px] text-gray-400 font-light">Famlée v1.0.3 Build 2024</p>
      </div>

    </div>
  );
};
