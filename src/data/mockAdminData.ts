import { MoodType } from '../types';

// 模拟统计数据接口
export interface AdminStats {
  period: 'day' | 'week' | 'month';
  totalConversations: number;
  moodDistribution: {
    mood: MoodType;
    count: number;
    percentage: number;
  }[];
  trendData: {
    date: string;
    conversations: number;
    happy: number;
    anxious: number;
    sad: number;
    angry: number;
    neutral: number;
  }[];
  aiSummary: {
    mood: MoodType;
    summary: string;
    trend: 'up' | 'down' | 'stable';
  }[];
}

// 生成模拟统计数据
export const generateMockStats = (period: 'day' | 'week' | 'month'): AdminStats => {
  const conversations = period === 'day' ? 120 : period === 'week' ? 580 : 2450;

  const moodDistribution = [
    { mood: MoodType.HAPPY, count: Math.floor(conversations * 0.35), percentage: 35 },
    { mood: MoodType.ANXIOUS, count: Math.floor(conversations * 0.25), percentage: 25 },
    { mood: MoodType.NEUTRAL, count: Math.floor(conversations * 0.20), percentage: 20 },
    { mood: MoodType.SAD, count: Math.floor(conversations * 0.15), percentage: 15 },
    { mood: MoodType.ANGRY, count: Math.floor(conversations * 0.05), percentage: 5 },
  ];

  // 生成趋势数据
  const pointsCount = period === 'day' ? 24 : period === 'week' ? 7 : 30;
  const trendData = Array.from({ length: pointsCount }, (_, i) => {
    const baseValue = Math.floor(conversations / pointsCount);
    const variance = Math.floor(Math.random() * 20 - 10);

    return {
      date: period === 'day'
        ? `${i}:00`
        : period === 'week'
        ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i]
        : `${i + 1}日`,
      conversations: baseValue + variance,
      happy: Math.floor((baseValue + variance) * 0.35),
      anxious: Math.floor((baseValue + variance) * 0.25),
      sad: Math.floor((baseValue + variance) * 0.15),
      angry: Math.floor((baseValue + variance) * 0.05),
      neutral: Math.floor((baseValue + variance) * 0.20),
    };
  });

  const aiSummary = [
    {
      mood: MoodType.HAPPY,
      summary: '用户积极情绪整体上升，主要与期末考试结束、假期临近相关',
      trend: 'up' as const,
    },
    {
      mood: MoodType.ANXIOUS,
      summary: '焦虑情绪有所缓解，心理咨询活动效果显著',
      trend: 'down' as const,
    },
    {
      mood: MoodType.SAD,
      summary: '悲伤情绪保持稳定，需持续关注人际关系相关话题',
      trend: 'stable' as const,
    },
    {
      mood: MoodType.ANGRY,
      summary: '愤怒情绪略有下降，校园活动帮助释放压力',
      trend: 'down' as const,
    },
    {
      mood: MoodType.NEUTRAL,
      summary: '平和情绪稳定，用户心理状态整体健康',
      trend: 'stable' as const,
    },
  ];

  return {
    period,
    totalConversations: conversations,
    moodDistribution,
    trendData,
    aiSummary,
  };
};

// 模拟校园活动数据
export interface MockCampusEvent {
  id: string;
  title: string;
  date: string;
  type: '讲座' | '团辅' | '工坊' | '运动';
  location: string;
  description: string;
  imageUrl: string;
  status: 'draft' | 'published';
  createdAt: string;
}

export const mockCampusEvents: MockCampusEvent[] = [
  {
    id: '1',
    title: '湖畔冥想: 寻找内心的宁静',
    date: '2025-12-15 14:00',
    type: '团辅',
    location: '西土城校区 · 小花园',
    description: '在繁忙的学业中暂停一下，跟随专业心理老师进行集体放松技巧练习。',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80',
    status: 'published',
    createdAt: '2025-12-01',
  },
  {
    id: '2',
    title: '考前压力管理讲座',
    date: '2025-12-18 10:00',
    type: '讲座',
    location: '教三楼 201',
    description: '邀请北师大心理学教授，讲解如何科学应对考试焦虑。',
    imageUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=400&q=80',
    status: 'published',
    createdAt: '2025-12-02',
  },
  {
    id: '3',
    title: '新年心愿工作坊',
    date: '2025-12-28 16:00',
    type: '工坊',
    location: '沙河校区 · 活动中心',
    description: '通过艺术创作表达新年愿望，释放创造力',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80',
    status: 'draft',
    createdAt: '2025-12-05',
  },
];

// 数据分析接口定义
export interface AnalyticsData {
  // 使用时段分布（24小时）
  hourlyActivity: {
    hour: string;
    users: number;
  }[];

  // 会话时长分布
  sessionDuration: {
    range: string;
    count: number;
    percentage: number;
  }[];

  // 人格偏好分布
  personaPreference: {
    persona: 'healing' | 'rational' | 'fun';
    name: string;
    count: number;
    percentage: number;
    color: string;
  }[];

  // 交互工具使用统计
  toolUsage: {
    tool: string;
    count: number;
    icon: string;
  }[];

  // 关键指标
  keyMetrics: {
    avgSessionMinutes: number;
    returnRate: number;
    moodImprovementRate: number;
    totalJournals: number;
  };

  // 情绪转化分析
  moodTransition: {
    from: MoodType;
    to: MoodType;
    count: number;
    rate: number;
  }[];
}

// 生成数据分析 mock 数据
export const generateAnalyticsData = (): AnalyticsData => {
  // 使用时段分布（凌晨低谷、白天高峰）
  const hourlyActivity = Array.from({ length: 24 }, (_, i) => {
    let baseUsers = 30;
    // 凌晨 0-6 时：低谷期
    if (i >= 0 && i < 6) baseUsers = 5 + Math.floor(Math.random() * 10);
    // 早晨 6-9 时：逐渐上升
    else if (i >= 6 && i < 9) baseUsers = 20 + Math.floor(Math.random() * 15);
    // 上午 9-12 时：第一波高峰
    else if (i >= 9 && i < 12) baseUsers = 45 + Math.floor(Math.random() * 20);
    // 午间 12-14 时：午休小高峰
    else if (i >= 12 && i < 14) baseUsers = 55 + Math.floor(Math.random() * 25);
    // 下午 14-18 时：平稳期
    else if (i >= 14 && i < 18) baseUsers = 40 + Math.floor(Math.random() * 15);
    // 晚间 18-23 时：最高峰（学生空闲时间）
    else if (i >= 18 && i < 23) baseUsers = 60 + Math.floor(Math.random() * 30);
    // 深夜 23-24 时：逐渐下降
    else baseUsers = 25 + Math.floor(Math.random() * 15);

    return {
      hour: `${i}:00`,
      users: baseUsers,
    };
  });

  // 会话时长分布
  const sessionDuration = [
    { range: '<5分钟', count: 320, percentage: 18 },
    { range: '5-15分钟', count: 890, percentage: 50 },
    { range: '15-30分钟', count: 425, percentage: 24 },
    { range: '>30分钟', count: 142, percentage: 8 },
  ];

  // 人格偏好分布
  const personaPreference = [
    { persona: 'healing' as const, name: '治愈系 (Melty)', count: 1024, percentage: 42, color: '#72e3ad' },
    { persona: 'rational' as const, name: '理性系 (Logic)', count: 853, percentage: 35, color: '#6366F1' },
    { persona: 'fun' as const, name: '趣味系 (Spark)', count: 561, percentage: 23, color: '#F59E0B' },
  ];

  // 交互工具使用统计
  const toolUsage = [
    { tool: 'MBTI 速测', count: 456, icon: '🧠' },
    { tool: 'CBT 引导', count: 382, icon: '💭' },
    { tool: '正念呼吸', count: 621, icon: '🌬️' },
    { tool: '一键发疯', count: 234, icon: '🎉' },
    { tool: '情绪接纳', count: 512, icon: '💚' },
    { tool: '价值确认', count: 298, icon: '⭐' },
  ];

  // 关键指标
  const keyMetrics = {
    avgSessionMinutes: 14.2,
    returnRate: 68.5,
    moodImprovementRate: 73.8,
    totalJournals: 1847,
  };

  // 情绪转化分析（从负面情绪转向正面/中性情绪）
  const moodTransition = [
    { from: MoodType.ANXIOUS, to: MoodType.NEUTRAL, count: 245, rate: 42.3 },
    { from: MoodType.ANXIOUS, to: MoodType.HAPPY, count: 156, rate: 26.9 },
    { from: MoodType.SAD, to: MoodType.NEUTRAL, count: 187, rate: 51.2 },
    { from: MoodType.SAD, to: MoodType.HAPPY, count: 98, rate: 26.8 },
    { from: MoodType.ANGRY, to: MoodType.NEUTRAL, count: 67, rate: 54.5 },
    { from: MoodType.ANGRY, to: MoodType.HAPPY, count: 34, rate: 27.6 },
  ];

  return {
    hourlyActivity,
    sessionDuration,
    personaPreference,
    toolUsage,
    keyMetrics,
    moodTransition,
  };
};
