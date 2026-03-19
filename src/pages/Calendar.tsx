
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MoodType, JournalEntry } from '../types';
import { ChevronLeft, ChevronRight, TrendingUp, Zap, BookOpen, Mic, Activity, Sun, CloudRain, Loader2 } from 'lucide-react';
import { getJournals } from '../services/supabaseService';

interface CalendarPageProps {
  setGlobalMood: (mood: MoodType) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export const CalendarPage: React.FC<CalendarPageProps> = ({ setGlobalMood }) => {
  const [displayDate, setDisplayDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 追踪用户是否主动选择过日期（用于控制是否更新全局 mood）
  const userHasSelected = useRef(false);

  // 加载日记数据
  useEffect(() => {
    const loadJournals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getJournals();
        setEntries(data);
      } catch (err) {
        console.error('加载日记失败:', err);
        setError('加载失败，请刷新重试');
      } finally {
        setIsLoading(false);
      }
    };

    loadJournals();
  }, []);

  // --- Helpers ---
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };
  
  const nextMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getMoodColor = (mood: MoodType) => {
    switch(mood) {
        case MoodType.HAPPY: return 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]';
        case MoodType.ANXIOUS: return 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]';
        case MoodType.SAD: return 'bg-purple-400';
        case MoodType.ANGRY: return 'bg-red-500';
        case MoodType.NEUTRAL: return 'bg-gray-400';
        default: return 'bg-gray-200';
    }
  };

  // --- Data Processing ---
  
  // Get entries for the currently displayed month
  const monthlyEntries = useMemo(() => {
    return entries.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === displayDate.getMonth() && d.getFullYear() === displayDate.getFullYear();
    });
  }, [entries, displayDate]);

  // Get entries for the selected specific date
  const selectedDayEntries = useMemo(() => {
      if (!selectedDate) return [];
      return entries.filter(e => isSameDay(new Date(e.date), selectedDate));
  }, [entries, selectedDate]);

  // Effect to update Global Mood based on Selected Date
  // 只在用户主动选择日期时才更新全局 mood
  useEffect(() => {
    // 如果用户没有主动选择过，不更新全局 mood
    if (!userHasSelected.current) return;

    if (selectedDate) {
        // Find entries for this specific day
        const dayEntries = entries.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === selectedDate.getFullYear() &&
                   d.getMonth() === selectedDate.getMonth() &&
                   d.getDate() === selectedDate.getDate();
        });

        if (dayEntries.length > 0) {
            // Use the last entry's mood to set the background
            const lastEntry = dayEntries[dayEntries.length - 1];
            setGlobalMood(lastEntry.mood);
        } else {
            // Default to Neutral if no entries for selected date
            setGlobalMood(MoodType.NEUTRAL);
        }
    }
  }, [selectedDate, entries, setGlobalMood]);

  // Analysis Logic
  const analysis = useMemo(() => {
      const total = monthlyEntries.length;
      if (total === 0) return null;

      const counts = {
          [MoodType.HAPPY]: 0,
          [MoodType.ANXIOUS]: 0,
          [MoodType.SAD]: 0,
          [MoodType.ANGRY]: 0,
          [MoodType.NEUTRAL]: 0,
      };

      monthlyEntries.forEach(e => {
          if (counts[e.mood] !== undefined) counts[e.mood]++;
      });

      const dominantMood = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0] as MoodType;
      
      // Calculate "Stability Score"
      const stabilityScore = Math.min(100, Math.round(
          ((counts[MoodType.HAPPY] * 1.2 + counts[MoodType.NEUTRAL] * 1 + counts[MoodType.SAD] * 0.8 + counts[MoodType.ANXIOUS] * 0.5 + counts[MoodType.ANGRY] * 0.4) / total) * 100
      ));

      return { counts, total, dominantMood, stabilityScore };
  }, [monthlyEntries]);

  // Suggestion Logic
  const getSuggestion = (dominant: MoodType) => {
      switch(dominant) {
          case MoodType.HAPPY: return "本月你的状态非常棒！试着将这份能量传递给周围的人，或者记录下让你开心的微小瞬间，作为未来的能量储备。";
          case MoodType.ANXIOUS: return "看起来这个月有些压力。记得每天给自己留出10分钟的“放空时间”，深呼吸，或者去校园里散散步，不要被未来困住。";
          case MoodType.SAD: return "允许自己低落是治愈的开始。如果不开心，可以去心语瀑布发泄一下，或者试试ACT疗法中的“接纳”练习。抱抱你。";
          case MoodType.ANGRY: return "愤怒是力量的体现，但要注意释放的方式。试试剧烈运动（如夜跑），或者书写愤怒信然后撕掉它。";
          default: return "平平淡淡才是真。保持这份内心的宁静，规律作息，享受当下的每一个瞬间。";
      }
  };

  // --- Render ---

  const daysInMonth = getDaysInMonth(displayDate);
  const startDay = getFirstDayOfMonth(displayDate);
  const emptySlots = Array(startDay).fill(null);
  const daySlots = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // 加载状态
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-gray-400 mb-4" />
        <p className="text-sm text-gray-500">加载中...</p>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6">
        <CloudRain size={40} className="text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm hover:bg-black transition-colors"
        >
          刷新重试
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-12 px-5 pb-24 max-w-2xl mx-auto overflow-y-auto scrollbar-hide">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-serif font-bold text-gray-800 tracking-wide">Mood</h2>
            <div className="flex items-center gap-4 bg-white/40 rounded-full px-4 py-2 border border-white/40 shadow-sm">
                <button onClick={prevMonth} className="text-gray-600 hover:text-gray-900"><ChevronLeft size={20}/></button>
                <span className="text-sm font-medium text-gray-800 w-24 text-center">
                    {displayDate.getFullYear()}年 {displayDate.getMonth() + 1}月
                </span>
                <button onClick={nextMonth} className="text-gray-600 hover:text-gray-900"><ChevronRight size={20}/></button>
            </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white/30 backdrop-blur-xl border border-white/40 p-6 rounded-[2rem] mb-6 shadow-sm">
            <div className="grid grid-cols-7 gap-y-4 mb-2">
                {WEEKDAYS.map(d => (
                    <div key={d} className="text-center text-xs text-gray-400 font-medium">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-4 gap-x-1">
                {emptySlots.map((_, i) => <div key={`empty-${i}`} />)}
                {daySlots.map(day => {
                    const currentDayDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
                    // Find entry for this day (prioritize last entry of the day for color)
                    const entry = monthlyEntries.filter(e => isSameDay(new Date(e.date), currentDayDate)).pop();
                    const isSelected = selectedDate && isSameDay(selectedDate, currentDayDate);
                    const isToday = isSameDay(new Date(), currentDayDate);

                    return (
                        <div key={day} className="flex flex-col items-center">
                            <button
                                onClick={() => {
                                    userHasSelected.current = true; // 标记用户已主动选择
                                    setSelectedDate(currentDayDate);
                                }}
                                className={`
                                    w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 relative
                                    ${isSelected ? 'bg-gray-800 text-white shadow-lg scale-110' : 'text-gray-600 hover:bg-white/50'}
                                    ${isToday && !isSelected ? 'border border-gray-400' : ''}
                                `}
                            >
                                {day}
                                {entry && !isSelected && (
                                    <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${getMoodColor(entry.mood)}`}></span>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Analysis & Trends Section */}
        {analysis ? (
            <div className="space-y-6 animate-fade-in">
                
                {/* Mood Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/40 backdrop-blur-md border border-white/50 p-4 rounded-3xl">
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                            <Activity size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">情绪稳定性</span>
                        </div>
                        <div className="text-3xl font-black text-gray-800 mb-1">{analysis.stabilityScore}</div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-400 h-full rounded-full transition-all duration-1000" style={{ width: `${analysis.stabilityScore}%` }}></div>
                        </div>
                    </div>
                    
                    <div className="bg-white/40 backdrop-blur-md border border-white/50 p-4 rounded-3xl">
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                            <TrendingUp size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">记录天数</span>
                        </div>
                        <div className="text-3xl font-black text-gray-800 mb-1">
                            {new Set(monthlyEntries.map(e => new Date(e.date).getDate())).size}
                            <span className="text-sm font-normal text-gray-400 ml-1">/ {daysInMonth}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">持续记录有助于觉察自我</p>
                    </div>
                </div>

                {/* Mood Distribution Bar */}
                <div className="bg-white/40 backdrop-blur-md border border-white/50 p-5 rounded-3xl">
                    <h3 className="text-sm font-bold text-gray-800 mb-4">本月情绪构成</h3>
                    <div className="flex w-full h-4 rounded-full overflow-hidden mb-4">
                        {(Object.keys(analysis.counts) as MoodType[]).map(mood => {
                            const count = analysis.counts[mood];
                            if (count === 0) return null;
                            const pct = (count / analysis.total) * 100;
                            return (
                                <div key={mood} style={{ width: `${pct}%` }} className={`h-full ${getMoodColor(mood)} opacity-80`} />
                            );
                        })}
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                        {analysis.counts[MoodType.HAPPY] > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span>开心</span>}
                        {analysis.counts[MoodType.ANXIOUS] > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span>焦虑</span>}
                        {analysis.counts[MoodType.SAD] > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400"></span>难过</span>}
                        {/* Add others if needed */}
                    </div>
                </div>

                {/* AI Suggestions */}
                <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-white/60 p-5 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={80} /></div>
                    <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                        <Sun size={16} className="text-indigo-500" /> AI 专属建议
                    </h3>
                    <p className="text-xs text-indigo-800/80 leading-relaxed font-medium relative z-10">
                        {getSuggestion(analysis.dominantMood)}
                    </p>
                </div>

            </div>
        ) : (
            <div className="text-center py-10 opacity-50">
                <CloudRain size={40} className="mx-auto mb-2" />
                <p className="text-xs">本月暂无数据</p>
            </div>
        )}

        {/* Selected Day Detail List */}
        {selectedDate && selectedDayEntries.length > 0 && (
            <div className="mt-8 mb-4 animate-slide-up">
                <h3 className="text-lg font-thin text-gray-800 mb-4 pl-1 border-l-2 border-gray-800">
                    {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 的记录
                </h3>
                <div className="space-y-3">
                    {selectedDayEntries.map(entry => (
                        <div key={entry.id} className="bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-2 h-2 rounded-full ${getMoodColor(entry.mood)}`}></span>
                                <span className="text-[10px] text-gray-400 uppercase">
                                    {new Date(entry.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute:'2-digit' })}
                                </span>
                            </div>
                            {entry.content && <p className="text-sm text-gray-700 font-light mb-2">{entry.content}</p>}
                            
                            {/* Images */}
                            {entry.images && entry.images.length > 0 && (
                                <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-hide">
                                    {entry.images.map((img, i) => (
                                        <img key={i} src={img} alt="mood" className="w-16 h-16 rounded-lg object-cover" />
                                    ))}
                                </div>
                            )}

                            {/* Audio */}
                            {entry.audio && (
                                <div className="bg-gray-100 rounded-lg p-2 flex items-center gap-2 w-max max-w-full">
                                    <Mic size={14} className="text-gray-500" />
                                    <span className="text-xs text-gray-500">语音记录</span>
                                    <audio controls src={entry.audio} className="h-6 w-32" />
                                </div>
                            )}

                            {entry.summary && (
                                <div className="mt-2 text-[10px] text-indigo-400 italic">
                                    AI: {entry.summary}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};
