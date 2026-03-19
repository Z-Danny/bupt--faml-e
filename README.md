<div align="center">

# 🫧 Famlée

**面向大学生的 AI 心理健康支持平台**

*让情绪自由流动，在这里融化所有的压力与不安*

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google)](https://ai.google.dev/)

</div>

---

## 📖 项目简介

**Famlée** 是一款专为大学生设计的心理健康支持 Web 应用。在快节奏的校园生活中，学业压力、人际关系、就业焦虑等问题常常困扰着年轻人。Famlée 提供了一个安全、私密的空间，让用户可以随时随地与 AI 心理咨询师对话，记录情绪变化，参与校园心理活动。

> 🎯 **目标用户**: 北京邮电大学及其他高校学生
> 🏆 **项目定位**: 校园心理健康辅助工具，非专业医疗替代品

---

## ✨ 核心特色

### 🤖 三种 AI 治疗人格

Famlée 提供三种风格迥异的 AI 咨询师，满足不同用户的情感需求：

| 人格 | 名称 | 治疗方法 | 适用场景 |
|------|------|----------|----------|
| 🫧 **治愈系** | Melty (小融) | ACT 接纳承诺疗法 | 需要温暖陪伴、情绪宣泄 |
| 🧠 **理性系** | Logic (罗极) | CBT 认知行为疗法 | 需要理性分析、思维重构 |
| 🎭 **趣味系** | Spark (火花) | 幽默疗法 + MBTI | 需要轻松氛围、解压发疯 |

### 🎨 情绪感知背景

应用背景会根据用户的情绪状态动态变化，营造沉浸式的情感体验：

- 😊 **开心**: 温暖的金色与粉色渐变
- 😰 **焦虑**: 沉稳的深蓝与灰蓝
- 😢 **难过**: 柔和的薰衣草与灰色
- 😠 **愤怒**: 热烈的红色与黄色
- 😐 **平静**: 舒适的奶黄与淡紫

### 📝 心情日记系统

- 支持文字、图片、语音多种记录方式
- AI 自动生成日记摘要
- Mood 日历可视化情绪变化趋势
- 月度情绪分析与个性化建议

### 🏫 校园心理资源

- **校园布告栏**: 心理讲座、团辅活动、艺术疗愈等校园活动信息
- **心语瀑布**: 匿名吐槽墙，释放压力的安全空间

---

## 🛠️ 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  React 19 + TypeScript + Vite + Tailwind CSS                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Backend                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   PostgreSQL    │  │  Edge Functions │  │   Storage   │ │
│  │  - journals     │  │  - gemini-chat  │  │  - images   │ │
│  │  - chat_sessions│  │    (流式 AI)    │  │  - audio    │ │
│  │  - chat_messages│  └─────────────────┘  └─────────────┘ │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Gemini API                         │
│                   Gemini 2.5 Flash Model                     │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | React 19 | 最新版本，支持并发特性 |
| **类型系统** | TypeScript 5.8 | 强类型保障代码质量 |
| **构建工具** | Vite 6.2 | 极速开发体验 |
| **样式方案** | Tailwind CSS 3.4 | 原子化 CSS，快速开发 |
| **后端服务** | Supabase | PostgreSQL + Auth + Storage + Edge Functions |
| **AI 模型** | Gemini 2.5 Flash | Google 最新多模态模型 |
| **图标库** | Lucide React | 轻量级图标组件 |

---

## 📱 功能模块

### 1. 首页 (Home)
- 心情快速选择（5 种情绪状态）
- 日记创建入口
- AI 人格切换菜单

### 2. AI 聊天 (Chat) ✅ 已实现
- **流式文字对话**: 实时显示 AI 回复，逐字输出
- **会话管理**: 下拉菜单切换历史会话，新建对话
- **消息持久化**: 所有对话自动存入数据库
- **快捷工具**:
  - ☁️ 正念呼吸引导
  - 🧠 CBT 认知重构
  - 🔮 MBTI 快速测试

### 3. 语音模式 (Voice) 🚧 开发中
- **UI 已完成**: 棉花糖球体动画、录音状态反馈
- **待实现**: 语音转文字、AI 对话、语音回复

### 4. Mood 日历 (Calendar)
- 月度情绪日历视图
- 情绪稳定性评分
- 情绪构成分析图
- AI 个性化建议

### 5. 校园布告栏 (Campus)
- 心理活动列表
- 活动报名功能
- 专属推荐（基于情绪分析）

### 6. 心语瀑布 (Waterfall)
- 匿名发布心事
- 分类浏览（爱情、学业、就业、吐槽等）
- 点赞互动

### 7. 个人中心 (Profile)
- 用户设置
- 数据统计

### 🔐 后台管理系统 (Admin) ✅ 已实现

**访问入口**: 在应用 URL 后添加 `?mode=admin` 参数
- 本地开发: `http://localhost:3000?mode=admin`
- 生产环境: `https://your-domain.com?mode=admin`

**登录凭证**（演示环境）:
- 账号：`admin`
- 密码：`123456`

**功能模块**:

#### 📊 数据统计 Dashboard
- **总对话次数**: 实时统计，显示增长趋势（+12.5%）
- **情绪分布分析**:
  - 开心情绪数量（显示周期变化）
  - 焦虑情绪数量（用户留存率分析）
  - 平和情绪占比（稳定性指标）
- **时间维度切换**: 最近 7 天 / 30 天 / 3 个月
- **可视化图表**: 开心/焦虑情绪对话量趋势（Area Chart）

#### 📅 活动发布 Events
- **发布校园心理活动**:
  - 活动类型：讲座、团辅、工坊、运动
  - 必填字段：标题、时间、地点
  - 可选字段：描述、图片 URL
- **已发布活动管理**:
  - 活动列表展示（标题、类型徽章、时间、描述）
  - 自动同步到 Campus 校园布告栏页面
  - 活动预览卡片（带图片、类型标签）

#### 📈 数据分析 Analytics（开发中）
- 用户行为分析
- 情绪趋势预测
- 活动参与度统计

**技术实现**:
- **UI 组件**: shadcn/ui 企业级组件库（Card、Button、Badge、Input、Textarea、Select 等）
- **图表库**: recharts（支持 AreaChart、PieChart、BarChart）
- **数据来源**: Mock 数据（`src/data/mockAdminData.ts`）
- **认证机制**: localStorage 存储 token (`famlee_admin_token`)
- **退出登录**: 清除 token 并重定向回用户端首页

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Supabase 账号
- Google AI Studio API Key

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/your-username/famlee.git
cd famlee

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 API Keys

# 4. 启动开发服务器
npm run dev
```

### 环境变量配置

创建 `.env.local` 文件：

```env
# Gemini API Key (从 Google AI Studio 获取)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Supabase 配置 (从 Supabase Dashboard 获取)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase 设置

1. 创建 Supabase 项目
2. 运行数据库迁移脚本：`supabase/migrations/001_initial_schema.sql`
3. 创建 Storage Buckets：`journal-images`, `journal-audio`
4. 设置 Edge Function Secret：`GEMINI_API_KEY`
5. 部署 Edge Function：`npm run supabase:deploy`

---

## 📂 项目结构

```
famlée/
├── src/
│   ├── index.tsx              # 应用入口
│   ├── App.tsx                # 根组件
│   ├── types.ts               # 类型定义
│   ├── constants.ts           # 常量配置
│   ├── components/            # 通用组件
│   │   ├── FluidBackground.tsx
│   │   ├── JournalModal.tsx
│   │   └── MascotMenu.tsx
│   ├── pages/                 # 页面组件
│   │   ├── Home.tsx
│   │   ├── Chat.tsx
│   │   ├── Calendar.tsx
│   │   ├── Campus.tsx
│   │   ├── Waterfall.tsx
│   │   ├── Profile.tsx
│   │   ├── Admin.tsx           # Web 后台管理
│   │   └── AdminLogin.tsx      # 管理员登录
│   ├── lib/                   # 工具库
│   │   └── supabaseClient.ts
│   ├── services/              # 服务层
│   │   ├── geminiService.ts
│   │   └── supabaseService.ts
│   └── data/                  # Mock 数据
│       └── mockAdminData.ts    # 后台演示数据
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   └── functions/
│       └── gemini-chat/
├── docs/                      # 项目文档
├── .env.example               # 环境变量模板
└── package.json
```

---

## 🔧 开发命令

```bash
# 开发
npm run dev              # 启动开发服务器 (localhost:3000)

# 构建
npm run build            # 构建生产版本
npm run preview          # 预览生产构建

# Supabase
npm run supabase:login   # 登录 Supabase CLI
npm run supabase:link    # 链接项目
npm run supabase:deploy  # 部署 Edge Function
```

---

## 🌐 部署

### Vercel 部署（推荐）

1. Fork 本项目到你的 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量：
   - `VITE_GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 点击 Deploy

### 其他平台

项目为纯静态 SPA，可部署到任何支持静态托管的平台：
- Netlify
- Cloudflare Pages
- GitHub Pages

---

## 📋 开发进度

### ✅ 已完成功能

- [x] 流式 AI 聊天（文字模式）
- [x] 会话管理（新建、切换、历史恢复）
- [x] 消息持久化到 Supabase
- [x] 三种 AI 人格切换
- [x] MBTI 速测、CBT 引导、正念呼吸工具
- [x] Mood 日历与情绪分析
- [x] 心情日记系统
- [x] Edge Function 流式响应
- [x] Web 后台管理系统（数据统计、活动发布、管理员认证）

### 🚧 开发中：语音对话功能

| 阶段 | 任务 | 状态 |
|------|------|------|
| 1 | 音频录制优化（格式、时长、波形） | ⏳ |
| 2 | 语音转文字（STT）集成 | ⏳ |
| 3 | 文字转语音（TTS）- 可选 | ⏳ |
| 4 | 完整语音对话流程 | ⏳ |

**技术方案**：
- 语音识别：Gemini Audio API / Web Speech API
- 语音合成：Web Speech API / Google TTS
- 录音格式：WebM (浏览器原生支持)

### 📌 未来规划

- [ ] 用户认证系统
- [ ] 数据导出功能
- [ ] 多语言支持
- [ ] PWA 离线支持
- [ ] 深色模式

---

## ⚠️ 免责声明

Famlée 是一款心理健康辅助工具，**不能替代专业的心理咨询或医疗服务**。

- 如果您正在经历严重的心理困扰，请立即寻求专业帮助
- 如有自残或自杀倾向，请拨打心理援助热线或前往医院就诊
- 本应用仅供情绪记录和轻度心理支持使用

**北京邮电大学心理咨询中心**: 010-6228xxxx

---

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

---

<div align="center">

**Made with 💜 for BUPT Students**

*让每一个情绪都被温柔以待*

</div>
