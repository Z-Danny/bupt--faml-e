import React, { useState } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  Settings,
  HelpCircle,
  Search,
  LogOut,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { generateMockStats, mockCampusEvents, generateAnalyticsData, type MockCampusEvent } from '@/data/mockAdminData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { MoodType } from '../types';

// Mood 颜色映射
const MOOD_COLORS: Record<MoodType, string> = {
  [MoodType.HAPPY]: '#72e3ad',
  [MoodType.ANXIOUS]: '#6366F1',
  [MoodType.SAD]: '#94A3B8',
  [MoodType.ANGRY]: '#EF4444',
  [MoodType.NEUTRAL]: '#D1D5DB',
};

interface AdminPageProps {
  onLogout: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('month');
  const [events, setEvents] = useState<MockCampusEvent[]>(mockCampusEvents);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    type: '讲座' as const,
    location: '',
    description: '',
    imageUrl: '',
  });

  const stats = generateMockStats(timePeriod);
  const analyticsData = generateAnalyticsData();

  const handlePublishEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location) {
      alert('请填写完整的活动信息');
      return;
    }

    const event: MockCampusEvent = {
      id: Date.now().toString(),
      ...newEvent,
      status: 'published',
      createdAt: new Date().toISOString(),
    };

    setEvents([event, ...events]);
    setNewEvent({
      title: '',
      date: '',
      type: '讲座',
      location: '',
      description: '',
      imageUrl: '',
    });

    alert('活动发布成功!');
  };

  // 侧边栏菜单项
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: '数据统计' },
    { id: 'analytics', icon: BarChart3, label: '数据分析' },
    { id: 'events', icon: Calendar, label: '活动发布' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20">
      {/* 左侧导航栏 */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-emerald-100 flex flex-col shadow-lg">
        {/* Logo */}
        <div className="p-6 border-b border-emerald-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#72e3ad] to-[#5dd39e] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#72e3ad] to-[#5dd39e] bg-clip-text text-transparent">Famlée</h1>
              <p className="text-xs text-slate-500">后台管理</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 pt-4">{menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-[#72e3ad] text-white font-medium shadow-lg shadow-emerald-200/50 scale-[1.02]'
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-[#72e3ad]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <Separator className="bg-emerald-100" />

        {/* Bottom Section */}
        <div className="p-4 space-y-3">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-emerald-50 hover:text-[#72e3ad] rounded-xl transition-all duration-200">
            <Settings className="w-5 h-5" />
            <span className="text-sm">设置</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-emerald-50 hover:text-[#72e3ad] rounded-xl transition-all duration-200">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm">帮助</span>
          </button>

          <Separator className="bg-emerald-100" />

          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
            <Avatar className="w-9 h-9 ring-2 ring-[#72e3ad]/30">
              <AvatarFallback className="bg-gradient-to-br from-[#72e3ad] to-[#5dd39e] text-white text-sm font-medium">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">管理员</p>
              <p className="text-xs text-slate-500 truncate">admin</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 hover:bg-white/50 hover:text-rose-500"
              onClick={onLogout}
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-1">数据统计</h2>
                <p className="text-slate-500">欢迎回来，这是您的数据概览</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="搜索..."
                    className="pl-9 w-64 border-slate-200 focus:border-[#72e3ad] focus:ring-[#72e3ad]/20"
                  />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Revenue Card */}
              <Card className="relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur hover:scale-[1.02]">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardDescription className="text-sm font-medium text-slate-600">总对话次数</CardDescription>
                    <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-0 shadow-sm">
                      <TrendingUp className="w-3 h-3" />
                      +12.5%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-800 mb-1">
                    {stats.totalConversations.toLocaleString()}
                  </div>
                  <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    本月持续上升
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    最近 6 个月访客数
                  </p>
                </CardContent>
              </Card>

              {/* New Customers Card */}
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur hover:scale-[1.02]">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardDescription className="text-sm font-medium text-slate-600">开心情绪</CardDescription>
                    <Badge className="gap-1 bg-amber-100 text-amber-700 border-0 shadow-sm">
                      <TrendingDown className="w-3 h-3" />
                      -5%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-800 mb-1">
                    {stats.moodDistribution.find(m => m.mood === MoodType.HAPPY)?.count || 0}
                  </div>
                  <p className="text-xs text-amber-600 flex items-center gap-1 font-medium">
                    <TrendingDown className="w-3 h-3" />
                    本周期略有下降
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    需要关注改善措施
                  </p>
                </CardContent>
              </Card>

              {/* Active Accounts Card */}
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur hover:scale-[1.02]">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardDescription className="text-sm font-medium text-slate-600">焦虑情绪</CardDescription>
                    <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-0 shadow-sm">
                      <TrendingUp className="w-3 h-3" />
                      +8%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-800 mb-1">
                    {stats.moodDistribution.find(m => m.mood === MoodType.ANXIOUS)?.count || 0}
                  </div>
                  <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    用户留存率良好
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    互动超出预期目标
                  </p>
                </CardContent>
              </Card>

              {/* Growth Rate Card */}
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur hover:scale-[1.02]">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardDescription className="text-sm font-medium text-slate-600">平和情绪</CardDescription>
                    <Badge className="gap-1 bg-slate-100 text-slate-600 border-0 shadow-sm">
                      <Minus className="w-3 h-3" />
                      稳定
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-800 mb-1">
                    {stats.moodDistribution.find(m => m.mood === MoodType.NEUTRAL)?.percentage}%
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                    <Minus className="w-3 h-3" />
                    保持稳定表现
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    符合增长预期
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chart Section */}
            <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-slate-800">对话量趋势</CardTitle>
                    <CardDescription className="mt-1 text-slate-500">最近 3 个月总计</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={timePeriod === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimePeriod('month')}
                      className={timePeriod === 'month' ? 'bg-[#72e3ad] hover:bg-[#5dd39e] border-0 shadow-md shadow-emerald-200/50 text-white' : 'border-slate-200 text-slate-600 hover:border-[#72e3ad] hover:text-[#72e3ad] hover:bg-emerald-50'}
                    >
                      最近 3 个月
                    </Button>
                    <Button
                      variant={timePeriod === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimePeriod('week')}
                      className={timePeriod === 'week' ? 'bg-[#72e3ad] hover:bg-[#5dd39e] border-0 shadow-md shadow-emerald-200/50 text-white' : 'border-slate-200 text-slate-600 hover:border-[#72e3ad] hover:text-[#72e3ad] hover:bg-emerald-50'}
                    >
                      最近 30 天
                    </Button>
                    <Button
                      variant={timePeriod === 'day' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimePeriod('day')}
                      className={timePeriod === 'day' ? 'bg-[#72e3ad] hover:bg-[#5dd39e] border-0 shadow-md shadow-emerald-200/50 text-white' : 'border-slate-200 text-slate-600 hover:border-[#72e3ad] hover:text-[#72e3ad] hover:bg-emerald-50'}
                    >
                      最近 7 天
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={stats.trendData}>
                    <defs>
                      <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#72e3ad" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#72e3ad" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="happy"
                      stroke="#72e3ad"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrimary)"
                      name="开心"
                    />
                    <Area
                      type="monotone"
                      dataKey="anxious"
                      stroke="#6366F1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSecondary)"
                      name="焦虑"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Events View */}
        {activeView === 'events' && (
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-1">活动发布</h2>
              <p className="text-slate-500">管理校园心理活动</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 发布新活动 */}
              <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-slate-800">发布新活动</CardTitle>
                  <CardDescription className="text-slate-500">填写活动信息并发布到校园心理布告栏</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-slate-700">活动标题 *</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="例如: 湖畔冥想工作坊"
                      className="border-slate-200 focus:border-[#72e3ad] focus:ring-[#72e3ad]/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="date" className="text-slate-700">活动时间 *</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="border-slate-200 focus:border-[#72e3ad] focus:ring-[#72e3ad]/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type" className="text-slate-700">活动类型 *</Label>
                    <Select
                      id="type"
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                      className="border-slate-200 focus:border-[#72e3ad] focus:ring-[#72e3ad]/20"
                    >
                      <option value="讲座">讲座</option>
                      <option value="团辅">团辅</option>
                      <option value="工坊">工坊</option>
                      <option value="运动">运动</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-slate-700">活动地点 *</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder="例如: 西土城校区 · 小花园"
                      className="border-slate-200 focus:border-[#72e3ad] focus:ring-[#72e3ad]/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-slate-700">活动描述</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="简要描述活动内容"
                      rows={4}
                      className="border-slate-200 focus:border-[#72e3ad] focus:ring-[#72e3ad]/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="imageUrl" className="text-slate-700">活动图片 URL</Label>
                    <Input
                      id="imageUrl"
                      value={newEvent.imageUrl}
                      onChange={(e) => setNewEvent({ ...newEvent, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="border-slate-200 focus:border-[#72e3ad] focus:ring-[#72e3ad]/20"
                    />
                  </div>

                  <Button onClick={handlePublishEvent} className="w-full bg-[#72e3ad] hover:bg-[#5dd39e] border-0 shadow-md shadow-emerald-200/50 text-white">
                    发布活动
                  </Button>
                </CardContent>
              </Card>

              {/* 已发布活动 */}
              <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-slate-800">已发布活动</CardTitle>
                  <CardDescription className="text-slate-500">最近发布的校园心理活动</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 border border-slate-200 rounded-lg hover:shadow-md hover:border-[#72e3ad]/50 transition-all bg-white"
                      >
                        <div className="flex items-start gap-3">
                          {event.imageUrl && (
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-16 h-16 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-slate-800 mb-1 truncate">{event.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                              <Badge className="bg-emerald-100 text-emerald-700 border-0">{event.type}</Badge>
                              <span>{event.date}</span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2">
                              {event.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-1">数据分析</h2>
              <p className="text-slate-500">深度洞察用户行为与心理健康趋势</p>
            </div>

            {/* 关键指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <CardDescription className="text-sm font-medium text-slate-600">平均会话时长</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-800 mb-1">
                    {analyticsData.keyMetrics.avgSessionMinutes} <span className="text-lg text-slate-500">分钟</span>
                  </div>
                  <p className="text-xs text-slate-500">用户平均对话时长</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <CardDescription className="text-sm font-medium text-slate-600">用户回访率</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-800 mb-1">
                    {analyticsData.keyMetrics.returnRate}%
                  </div>
                  <p className="text-xs text-slate-500">7 天内再次访问比例</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <CardDescription className="text-sm font-medium text-slate-600">情绪改善率</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#72e3ad] mb-1">
                    {analyticsData.keyMetrics.moodImprovementRate}%
                  </div>
                  <p className="text-xs text-slate-500">负面→正面/中性转化率</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <CardDescription className="text-sm font-medium text-slate-600">日记总数</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-800 mb-1">
                    {analyticsData.keyMetrics.totalJournals.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500">累计创建日记数</p>
                </CardContent>
              </Card>
            </div>

            {/* 使用时段分布 + 人格偏好 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* 使用时段热力图 */}
              <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">使用时段分布</CardTitle>
                  <CardDescription className="text-slate-500">24 小时活跃用户数（单位：人）</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.hourlyActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="hour"
                        stroke="#9ca3af"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Bar dataKey="users" fill="#72e3ad" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-4">
                    📊 <strong>洞察</strong>：晚间 18-23 时为使用高峰，凌晨 0-6 时活跃度最低。建议在高峰时段加强客服支持。
                  </p>
                </CardContent>
              </Card>

              {/* 人格偏好分布饼图 */}
              <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">人格偏好分布</CardTitle>
                  <CardDescription className="text-slate-500">三种治疗人格使用占比</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={analyticsData.personaPreference}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => `${Math.round((percent || 0) * 100)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                      >
                        {analyticsData.personaPreference.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {analyticsData.personaPreference.map((persona) => (
                      <div key={persona.persona} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: persona.color }}
                          />
                          <span className="text-slate-600">{persona.name}</span>
                        </div>
                        <span className="font-medium text-slate-800">{persona.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 会话时长分布 + 工具使用统计 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* 会话时长分布 */}
              <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">会话时长分布</CardTitle>
                  <CardDescription className="text-slate-500">用户单次对话时长区间统计</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={analyticsData.sessionDuration} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                      <YAxis dataKey="range" type="category" stroke="#9ca3af" fontSize={12} width={80} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-4">
                    💡 <strong>发现</strong>：50% 的会话在 5-15 分钟内完成，说明用户倾向简短高效的对话。
                  </p>
                </CardContent>
              </Card>

              {/* 工具使用统计 */}
              <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">交互工具使用统计</CardTitle>
                  <CardDescription className="text-slate-500">各功能工具累计使用次数</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={analyticsData.toolUsage} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                      <YAxis dataKey="tool" type="category" stroke="#9ca3af" fontSize={12} width={90} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-4">
                    🌟 <strong>亮点</strong>：正念呼吸工具最受欢迎（621次），情绪接纳紧随其后（512次）。
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 情绪转化分析 */}
            <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">情绪转化分析</CardTitle>
                <CardDescription className="text-slate-500">负面情绪向正面/中性情绪的转化率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsData.moodTransition.map((transition, index) => {
                    const fromColor = MOOD_COLORS[transition.from];
                    const toColor = MOOD_COLORS[transition.to];
                    const fromName = {
                      [MoodType.ANXIOUS]: '焦虑',
                      [MoodType.SAD]: '难过',
                      [MoodType.ANGRY]: '愤怒',
                      [MoodType.HAPPY]: '开心',
                      [MoodType.NEUTRAL]: '平和',
                    }[transition.from];
                    const toName = {
                      [MoodType.ANXIOUS]: '焦虑',
                      [MoodType.SAD]: '难过',
                      [MoodType.ANGRY]: '愤怒',
                      [MoodType.HAPPY]: '开心',
                      [MoodType.NEUTRAL]: '平和',
                    }[transition.to];

                    return (
                      <div
                        key={index}
                        className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: fromColor }}
                          />
                          <span className="text-sm font-medium text-slate-700">{fromName}</span>
                          <span className="text-slate-400">→</span>
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: toColor }}
                          />
                          <span className="text-sm font-medium text-slate-700">{toName}</span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold text-slate-800">{transition.rate}%</p>
                            <p className="text-xs text-slate-500">{transition.count} 次转化</p>
                          </div>
                          <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0">有效</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-[#72e3ad]/20">
                  <p className="text-sm text-slate-700">
                    <strong>✨ 总结</strong>：平均情绪改善率达 <strong className="text-[#72e3ad]">{analyticsData.keyMetrics.moodImprovementRate}%</strong>，
                    说明 AI 心理支持系统有效帮助用户缓解负面情绪。焦虑→平和的转化率最高（42.3%），建议针对性优化焦虑情绪应对策略。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Placeholder for other views */}
        {!['dashboard', 'events', 'analytics'].includes(activeView) && (
          <div className="p-8">
            <Card className="p-12 text-center">
              <CardTitle className="text-2xl mb-2">功能开发中</CardTitle>
              <CardDescription>该功能正在开发中，敬请期待...</CardDescription>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};
