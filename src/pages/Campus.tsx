
import React, { useState } from 'react';
import { MapPin, Clock, HeartHandshake, Phone, Ticket, CheckCircle, Star, X, Calendar, Users, Send } from 'lucide-react';
import { CampusEvent } from '../types';

export const CampusPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<number>(12); // Mock date selection
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set(['1'])); // 默认已报名第一个活动

  // Extended mock data
  const events: CampusEvent[] = [
    { 
        id: '1', 
        title: '湖畔冥想: 寻找内心的宁静', 
        date: '10月12日 14:00', 
        type: '团辅', 
        location: '西土城校区 · 小花园',
        description: '在繁忙的学业中暂停一下，跟随专业心理老师进行集体放松技巧练习。请穿着宽松衣物。',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: '2', 
        title: '考前压力管理讲座', 
        date: '10月15日 10:00', 
        type: '讲座', 
        location: '教三楼 201',
        description: '邀请北师大心理学教授，讲解如何科学应对考试焦虑，提升复习效率。',
        imageUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: '3',
        title: '"色彩与情绪" 艺术疗愈',
        date: '10月18日 16:00',
        type: '工坊',
        location: '沙河校区 · 活动中心',
        description: '无需绘画基础，通过色彩表达自我，释放潜意识中的情绪压力。材料费用已包含在报名费中。',
        imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: '4', 
        title: '夜跑俱乐部', 
        date: '10月12日 19:00', 
        type: '运动', 
        location: '西土城 · 操场',
        description: '不仅仅是跑步，更是释放多巴胺的狂欢。',
        imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: '5',
        title: '沙盘游戏体验工作坊',
        date: '10月20日 14:30',
        type: '团辅',
        location: '学十楼 · 106室',
        description: '在沙盘的世界里，看见你的潜意识。',
        imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=400&q=80'
    }
  ];

  // Calendar Strip Mock Data
  const dates = [
      { day: '11', week: '五' },
      { day: '12', week: '六' },
      { day: '13', week: '日' },
      { day: '14', week: '一' },
      { day: '15', week: '二' },
  ];

  const featuredEvent = events[0];
  const exclusiveEvent = events[4]; // Sandplay
  const otherEvents = events.slice(1, 4);

  // 报名/取消报名
  const handleRegister = (eventId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setRegisteredEvents(prev => {
          const newSet = new Set(prev);
          if (newSet.has(eventId)) {
              newSet.delete(eventId);
          } else {
              newSet.add(eventId);
          }
          return newSet;
      });
  };

  // 检查是否已报名
  const isRegistered = (eventId: string) => registeredEvents.has(eventId);

  return (
    <div className="h-full flex flex-col pt-10 px-0 pb-24 max-w-2xl mx-auto overflow-y-auto scrollbar-hide bg-gray-50/50">
        
        {/* Header Section */}
        <div className="px-6 pt-6 mb-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-serif text-gray-900 tracking-wide font-bold mb-1">
                        校园心理布告栏
                    </h2>
                    <p className="text-xs text-gray-500 font-light tracking-widest uppercase">Campus Psychology Board</p>
                </div>
                <button className="bg-red-50 text-red-500 p-2 rounded-full border border-red-100 shadow-sm">
                    <HeartHandshake size={20} />
                </button>
            </div>
            
            {/* Contact Info Card */}
            <div className="mt-4 bg-white/60 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-sm flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone size={14} className="text-gray-400" />
                    <span className="font-medium">010-6228xxxx</span>
                    <span className="text-xs text-gray-400 ml-auto">周一至周五 8:00-17:00</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="font-medium">学十楼 106 室</span>
                    <span className="text-xs text-blue-500 ml-auto cursor-pointer">导航 &gt;</span>
                </div>
            </div>
        </div>

        {/* Stats Widgets */}
        <div className="grid grid-cols-2 gap-4 px-6 mb-8">
            <div className="glass-panel p-4 rounded-3xl flex items-center gap-3 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                    <Ticket size={64} />
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl">
                    <Ticket size={20} />
                </div>
                <div>
                    <div className="text-2xl font-bold text-gray-800">3</div>
                    <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">已报名</div>
                </div>
            </div>
            <div className="glass-panel p-4 rounded-3xl flex items-center gap-3 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                    <CheckCircle size={64} />
                </div>
                <div className="p-3 bg-green-50 text-green-500 rounded-2xl">
                    <CheckCircle size={20} />
                </div>
                <div>
                    <div className="text-2xl font-bold text-gray-800">12</div>
                    <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">已参与</div>
                </div>
            </div>
        </div>

        {/* Date Selector */}
        <div className="flex justify-between px-6 mb-6">
            {dates.map((d, i) => {
                const isActive = parseInt(d.day) === selectedDate;
                return (
                    <button 
                        key={i}
                        onClick={() => setSelectedDate(parseInt(d.day))}
                        className={`
                            flex flex-col items-center justify-center w-12 h-14 rounded-xl transition-all duration-300
                            ${isActive ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}
                        `}
                    >
                        <span className="text-[10px] font-light mb-0.5">{d.week}</span>
                        <span className="text-base font-bold">{d.day}</span>
                    </button>
                )
            })}
        </div>

        <div className="px-6 pb-4">
             {/* Recent Popular (Formerly Today's Recommendation) */}
             <div className="flex items-center gap-2 mb-4">
                 <h3 className="text-sm font-bold text-gray-800">近期热门</h3>
                 <span className="h-1 w-1 rounded-full bg-red-400"></span>
             </div>
             
             <div
                 onClick={() => setSelectedEvent(featuredEvent)}
                 className="relative h-48 w-full rounded-[2rem] overflow-hidden shadow-lg mb-8 group cursor-pointer"
             >
                 <img src={featuredEvent.imageUrl} alt="event" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                 {/* 已报名标记 */}
                 {isRegistered(featuredEvent.id) && (
                     <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                         <CheckCircle size={12} /> 已报名
                     </div>
                 )}

                 <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                     <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md rounded text-[10px] font-bold uppercase mb-2 border border-white/30">
                         {featuredEvent.type}
                     </span>
                     <h2 className="text-lg font-bold mb-1 leading-tight">{featuredEvent.title}</h2>
                     <div className="flex items-center gap-3 text-xs text-gray-200 font-light">
                        <span className="flex items-center gap-1"><Clock size={10} /> {featuredEvent.date.split(' ')[1]}</span>
                        <span className="flex items-center gap-1"><MapPin size={10} /> {featuredEvent.location.split('·')[1]}</span>
                     </div>
                 </div>
             </div>

             {/* Exclusive Recommendation */}
             <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <h3 className="text-sm font-bold text-gray-800">专属推荐</h3>
                </div>

                <div
                    onClick={() => setSelectedEvent(exclusiveEvent)}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 p-1 rounded-[2rem] shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="bg-white rounded-[1.8rem] p-4 flex gap-4 items-center relative">
                        <img src={exclusiveEvent.imageUrl} alt="exclusive" className="w-20 h-20 rounded-2xl object-cover" />
                        <div className="flex-1">
                            <div className="text-[10px] text-indigo-500 font-medium mb-1">根据你的心情分析</div>
                            <h4 className="text-base font-bold text-gray-800 mb-1">{exclusiveEvent.title}</h4>
                            <p className="text-xs text-gray-400 line-clamp-1 mb-2">{exclusiveEvent.description}</p>
                            <button
                                onClick={(e) => handleRegister(exclusiveEvent.id, e)}
                                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                                    isRegistered(exclusiveEvent.id)
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-900 text-white hover:bg-black'
                                }`}
                            >
                                {isRegistered(exclusiveEvent.id) ? '已报名 ✓' : '立即报名'}
                            </button>
                        </div>
                    </div>
                </div>
             </div>

             <h3 className="text-sm font-bold text-gray-800 mb-4">全部活动</h3>

             {/* Event List with Images */}
             <div className="space-y-4">
                {otherEvents.map(event => (
                    <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="bg-white p-3 rounded-[1.5rem] shadow-sm border border-gray-100 flex gap-4 items-center group cursor-pointer hover:shadow-md transition-shadow"
                    >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-gray-800 text-sm truncate pr-2">{event.title}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1">
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{event.type}</span>
                                <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <MapPin size={10} /> {event.location}
                            </div>
                        </div>

                        {/* Action */}
                        <button
                            onClick={(e) => handleRegister(event.id, e)}
                            className={`h-8 px-3 rounded-full text-xs font-medium transition-colors ${
                                isRegistered(event.id)
                                    ? 'bg-green-500 text-white'
                                    : 'border border-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white'
                            }`}
                        >
                            {isRegistered(event.id) ? '已报名' : '报名'}
                        </button>
                    </div>
                ))}
             </div>
        </div>

        {/* 活动详情悬浮卡片 */}
        {selectedEvent && (
            <>
                {/* 高斯模糊背景遮罩 */}
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
                    onClick={() => setSelectedEvent(null)}
                />
                {/* 悬浮卡片 */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                    <div className="pointer-events-auto w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        {/* 活动图片 */}
                        <div className="relative h-44 overflow-hidden">
                            <img
                                src={selectedEvent.imageUrl}
                                alt={selectedEvent.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            {/* 关闭按钮 */}
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
                            >
                                <X size={16} className="text-gray-600" />
                            </button>

                            {/* 类型标签 */}
                            <div className="absolute bottom-3 left-4">
                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/30">
                                    {selectedEvent.type}
                                </span>
                            </div>

                            {/* 已报名标记 */}
                            {isRegistered(selectedEvent.id) && (
                                <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                    <CheckCircle size={12} /> 已报名
                                </div>
                            )}
                        </div>

                        {/* 活动信息 */}
                        <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-3">{selectedEvent.title}</h3>

                            {/* 时间和地点 */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Calendar size={14} className="text-blue-500" />
                                    </div>
                                    <span>{selectedEvent.date}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="p-2 bg-rose-50 rounded-lg">
                                        <MapPin size={14} className="text-rose-500" />
                                    </div>
                                    <span>{selectedEvent.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="p-2 bg-amber-50 rounded-lg">
                                        <Users size={14} className="text-amber-500" />
                                    </div>
                                    <span>已报名 {Math.floor(Math.random() * 20) + 5} 人</span>
                                </div>
                            </div>

                            {/* 活动描述 */}
                            <div className="bg-gray-50 rounded-xl p-3 mb-5">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {selectedEvent.description}
                                </p>
                            </div>

                            {/* 报名按钮 */}
                            <button
                                onClick={() => handleRegister(selectedEvent.id)}
                                className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                    isRegistered(selectedEvent.id)
                                        ? 'bg-gray-100 text-gray-500'
                                        : 'bg-gray-900 text-white hover:bg-black shadow-lg'
                                }`}
                            >
                                {isRegistered(selectedEvent.id) ? (
                                    <>
                                        <CheckCircle size={16} /> 取消报名
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} /> 立即报名
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </>
        )}
    </div>
  );
};
