# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Famlée** 是一款面向大学生的心理健康支持 Web 应用，基于 React 19、TypeScript 和 Vite 构建。应用集成了 Google Gemini 2.5 Flash 模型提供 AI 驱动的心理咨询聊天功能，支持三种治疗人格（治愈系/ACT、理性系/CBT、趣味系/幽默疗法）。后端使用 Supabase（PostgreSQL + Edge Functions）实现数据持久化和 AI 聊天服务。

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: Google Gemini 2.5 Flash (via Edge Function)
- **Icons**: Lucide React
- **State**: React Hooks + localStorage

## Development Commands

```bash
# 安装依赖
npm install

# 启动开发服务器 (http://localhost:3000)
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# Supabase 相关
npm run supabase:login    # 登录 Supabase CLI
npm run supabase:link     # 链接项目
npm run supabase:deploy   # 部署 Edge Function
```

## Environment Configuration

创建 `.env.local` 文件：
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Architecture

### Project Structure
```
D:\ai\famlée\
├── src/
│   ├── index.tsx              # 应用入口
│   ├── index.css              # Tailwind 指令 & 全局样式
│   ├── App.tsx                # 根组件，路由与全局状态
│   ├── types.ts               # TypeScript 类型定义
│   ├── constants.ts           # 心情主题 & 人格配置
│   ├── components/
│   │   ├── FluidBackground.tsx   # 动态渐变背景
│   │   ├── JournalModal.tsx      # 日记创建弹窗
│   │   └── MascotMenu.tsx        # 人格切换菜单
│   ├── pages/
│   │   ├── Home.tsx           # 首页：心情选择、日记入口
│   │   ├── Chat.tsx           # AI 聊天页面（流式对话、会话管理）
│   │   ├── Calendar.tsx       # Mood 日历：日记历史可视化
│   │   ├── Campus.tsx         # 校园心理活动布告栏
│   │   ├── Waterfall.tsx      # 心语瀑布：匿名吐槽墙
│   │   ├── Journal.tsx        # 日记详情页
│   │   ├── Profile.tsx        # 个人中心
│   │   ├── Admin.tsx          # Web 后台管理页面
│   │   └── AdminLogin.tsx     # 管理员登录页面
│   ├── lib/
│   │   └── supabaseClient.ts  # Supabase 客户端 & 用户ID管理
│   └── services/
│       ├── geminiService.ts   # Gemini AI 服务（流式聊天）
│       └── supabaseService.ts # Supabase API（日记、聊天会话）
├── supabase/
│   ├── config.toml            # Supabase 本地配置
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # 数据库初始化脚本
│   └── functions/
│       └── gemini-chat/
│           └── index.ts       # Edge Function：AI 聊天服务（流式）
├── docs/                      # 项目文档
├── .env.local                 # 环境变量（不提交）
├── .env.example               # 环境变量模板
└── package.json
```

### State Management & Routing
- **手动状态路由**: 无 React Router，通过 `App.tsx` 中的 `currentPage` 状态切换页面
- **自顶向下数据流**: 全局状态（`globalMood`, `currentPersona`）在 `App.tsx` 管理，通过 props 传递
- **用户标识**: 开发阶段使用固定用户ID `demo_user`，便于测试

### Database Schema (Supabase)
```sql
-- journals: 用户日记
journals (id, user_id, content, summary, mood, images[], audio_url, created_at)

-- chat_sessions: 聊天会话
chat_sessions (id, user_id, persona, created_at)

-- chat_messages: 聊天消息
chat_messages (id, session_id, role, content, mood_detected, created_at)
```

### Key Files & Responsibilities

| 文件 | 职责 |
|------|------|
| `src/App.tsx` | 应用外壳、导航、全局状态管理、Admin 模式路由 |
| `src/services/geminiService.ts` | Edge Function 流式聊天调用、SSE 解析 |
| `src/services/supabaseService.ts` | 日记 CRUD、聊天会话管理 |
| `src/lib/supabaseClient.ts` | Supabase 客户端初始化、固定用户ID |
| `src/constants.ts` | 心情主题配色、三种人格的系统指令与工具 |
| `src/types.ts` | TypeScript 接口定义 |
| `src/pages/Chat.tsx` | AI 聊天界面（流式文字、会话切换、交互工具） |
| `src/pages/Calendar.tsx` | Mood 日历，从 Supabase 加载日记数据 |
| `src/pages/Home.tsx` | 首页，心情选择与日记创建入口 |
| `src/pages/Admin.tsx` | Web 后台管理页面（数据统计、活动发布、数据分析） |
| `src/pages/AdminLogin.tsx` | 管理员登录页面（演示账号：admin/123456） |
| `src/components/JournalModal.tsx` | 日记创建弹窗，支持图片/音频上传 |
| `supabase/functions/gemini-chat/index.ts` | Edge Function，流式 AI 聊天、会话管理、消息持久化 |

### Persona System
三种 AI 人格，各有独特的治疗方法：

| ID | 名称 | 形象 | 治疗方法 | 工具 |
|----|------|------|----------|------|
| `healing` | 治愈系 (Melty) | 融化的布丁 | ACT 接纳承诺疗法 | 正念呼吸、情绪接纳、价值确认 |
| `rational` | 理性系 (Logic) | 几何线条 | CBT 认知行为疗法 | 捕捉负面想法、CBT 引导、逆向思考 |
| `fun` | 趣味系 (Spark) | 五彩火花 | 幽默疗法 | 毒舌锐评、MBTI 速测、一键发疯 |

### Chat Features (已实现)
- **流式文字对话**: 通过 Edge Function 调用 Gemini API，实时显示 AI 回复
- **会话管理**: 会话下拉菜单，支持新建、切换、历史恢复
- **消息持久化**: 所有对话自动存入 Supabase 数据库
- **Persona 切换**: 切换人格时自动创建新会话
- **交互工具**:
  - MBTI 速测：4 题快速性格测试
  - CBT 引导：4 步认知重构（事件→想法→证据→重构）
  - 正念呼吸：可视化呼吸引导（吸气→屏息→呼气）

### Mood System
5 种心情状态，影响全局背景色：
- `NEUTRAL`: 奶黄 + 薰衣草灰
- `HAPPY`: 金色 + 粉色
- `ANXIOUS`: 深蓝 + 灰蓝
- `SAD`: 薰衣草 + 灰色
- `ANGRY`: 红色 + 黄色

### Admin Backend Management System

**访问方式**: 在应用 URL 后添加 `?mode=admin` 参数（例如：`http://localhost:3000?mode=admin`）

**登录凭证**（演示环境）:
- 账号：`admin`
- 密码：`123456`

**功能模块**:

1. **数据统计 Dashboard**
   - 总对话次数统计（显示增长趋势）
   - 各情绪分布可视化（开心、焦虑、平和、难过、愤怒）
   - 时间维度切换：最近 7 天 / 30 天 / 3 个月
   - 趋势图表：开心/焦虑情绪对话量趋势（Area Chart）

2. **活动发布 Events**
   - 发布校园心理活动（讲座、团辅、工坊、运动）
   - 活动字段：标题、时间、类型、地点、描述、图片 URL
   - 已发布活动列表（显示在 Campus 校园布告栏页面）
   - 活动预览卡片（标题、类型徽章、时间、描述）

3. **数据分析 Analytics**
   - 正在开发中（占位界面）

**技术实现**:
- UI 组件：shadcn/ui (Card, Button, Badge, Input, Textarea, Select 等)
- 图表库：recharts (AreaChart, PieChart, BarChart)
- Mock 数据：`src/data/mockAdminData.ts` 提供演示数据
- 认证机制：localStorage 存储 token (`famlee_admin_token`)
- 退出登录：清除 token 并重定向回用户端

**路由逻辑** (`App.tsx`):
```tsx
// 检测 URL 参数
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('mode') === 'admin') {
  // 检查登录状态
  const token = localStorage.getItem('famlee_admin_token');
  // 未登录 → 显示 AdminLogin
  // 已登录 → 显示 AdminPage
}
```

**后续优化方向**:
- [ ] 连接真实 Supabase 数据（替代 mock 数据）
- [ ] 添加更多图表类型（饼图、柱状图）
- [ ] 实现用户管理、权限控制
- [ ] 活动编辑/删除功能
- [ ] 数据导出功能（CSV/JSON）

## Code Patterns

### Component Structure
- 函数式组件 + Hooks（useState, useEffect, useRef）
- Props 接口定义在 `types.ts` 或组件内联
- 条件渲染处理弹窗和页面状态

### Data Flow
```
用户操作 → 组件状态更新 → Edge Function / Supabase API → 数据库持久化
                ↓
         全局状态更新 → 背景色/UI 响应
```

### Error Handling
- try-catch 包裹异步操作
- API 失败时显示友好错误提示
- 麦克风权限错误特殊处理

## Important Notes

### API Key Security
- `.env.local` 已在 `.gitignore` 中，不会提交
- 生产环境使用 Edge Function 代理 AI 请求，API Key 存储在 Supabase Secrets

### User Identity（开发阶段）
- 当前使用固定用户ID `demo_user`，所有访问者共享数据
- 便于多设备测试和演示
- **TODO**: 正式上线前需改回动态生成用户ID

### Supabase Storage
- `journal-images`: 日记图片存储桶
- `journal-audio`: 日记音频存储桶
- 需在 Supabase Dashboard 创建并设置公开访问

## Completed Tasks (Window 4)

✅ 已完成的前端集成优化：

### 阶段 1：重构聊天服务层
- [x] `geminiService.ts` 完全切换为 Edge Function 调用
- [x] 移除本地 Gemini SDK 直接调用（保留日记摘要功能）
- [x] 统一流式响应处理（SSE 格式解析）

### 阶段 2：Chat 页面优化
- [x] 会话管理 UI（下拉菜单：会话列表、切换、新建）
- [x] 历史消息加载（从 Supabase 恢复会话）
- [x] 流式响应实时渲染（pendingText + 光标动画）

### 阶段 3：App.tsx 清理
- [x] 确认无遗留 mock 数据
- [x] 数据流清晰

### 阶段 4：会话管理完善
- [x] 会话下拉菜单 UI
- [x] Persona 切换时自动创建新会话
- [x] 会话历史持久化到 localStorage（`famlee_last_session`）

### 阶段 5：代码清理
- [x] 移除调试日志
- [x] 修复 header 名称不一致
- [x] 移除废弃函数
- [x] 简化冗余逻辑

### 阶段 6：UI 细节优化 (Window 5)
- [x] 移除聊天页面"消息"按钮的上下箭头符号，仅保留图标
- [x] 会话下拉菜单中"新建对话"按钮居中对齐
- [x] 简化为 "+" 图标（size 20），删除文字标签
- [x] Profile 页面新增"NFC 设置"选项（紫色主题，与其他设置保持一致）
- [x] 优化底部导航栏：增加横向长度、按钮尺寸、间距
- [x] 完善 Admin 后台管理系统文档

## Pending Tasks (Window 5)

### 语音对话功能

目前语音模式 UI 已实现，但录音后无法发送到 AI。需要实现完整的语音对话功能：

#### 阶段 1：音频录制优化
- [ ] 录音格式优化（当前 `audio/webm`，考虑兼容性）
- [ ] 录音时长限制（建议 60 秒）
- [ ] 录音波形可视化反馈

#### 阶段 2：语音转文字（STT）
- [ ] 集成 Gemini Audio API 或 Web Speech API
- [ ] Edge Function 添加音频处理端点
- [ ] 前端发送音频 base64 数据
- [ ] 转写结果显示在聊天界面

#### 阶段 3：文字转语音（TTS）- 可选
- [ ] AI 回复朗读功能
- [ ] 集成 Web Speech API 或 Google TTS
- [ ] 语音播放控制（播放/暂停/速度）

#### 阶段 4：完整语音对话流程
- [ ] 录音 → 转文字 → 发送到 AI → 流式回复 → (可选) 朗读
- [ ] 语音模式下的 UI 交互优化
- [ ] 错误处理（网络中断、转写失败等）

### 其他待办
- [ ] 端到端测试
- [ ] 性能优化（减少不必要的 re-render）
- [ ] 错误重试机制
