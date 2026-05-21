<div align="center">

# Famlée

**面向大学生的 AI 心理健康支持平台**

让情绪自由流动，在这里融化所有的压力与不安

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)

</div>

---

## 项目简介

**Famlée** 是一款专为大学生设计的心理健康支持 Web 应用。用户可以与不同风格的 AI 心理支持助手对话、记录心情日记、查看 Mood 日历，并浏览校园心理活动信息。

> 项目定位：校园心理健康辅助工具，不能替代专业心理咨询或医疗服务。

---

## 当前架构

当前项目已经切换为自托管后端：

```text
React 19 + TypeScript + Vite
        |
        | /api/*, /uploads/* via Vite proxy or Caddy
        v
Node.js / Express API (server/index.js)
        |
        | pg
        v
PostgreSQL (server/schema.sql)
        |
        | OpenAI-compatible chat/completions
        v
Volcengine Ark / Doubao model
```

说明：
- 前端默认通过 `VITE_API_BASE_URL=/api` 调 Express API。
- 本地开发时 Vite 把 `/api` 和 `/uploads` 代理到 `http://localhost:8787`。
- AI 聊天通过后端 `/api/ai/chat` 调用豆包 OpenAI-compatible 接口，使用 SSE 流式返回。
- 对话、日记、用户数据保存在 PostgreSQL。
- 图片、头像、音频上传保存到后端 `UPLOAD_DIR`，并通过 `/uploads/*` 暴露。
- `supabase/` 目录和部分旧部署文档是历史方案归档，不是当前主链路。

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React 19, TypeScript, Vite | SPA，手动状态路由 |
| 样式 | Tailwind CSS | 全局样式和页面 UI |
| 后端 | Node.js, Express 5 | REST API、上传、AI 代理、SSE |
| 数据库 | PostgreSQL | 用户、日记、聊天会话、聊天消息 |
| AI | Volcengine Ark / Doubao | OpenAI-compatible `/chat/completions` |
| 图标 | Lucide React | 图标组件 |
| 图表 | Recharts | Admin 数据看板 |

---

## 核心功能

### AI 聊天

- 三种人格：治愈系 Melty、理性系 Logic、趣味系 Spark。
- 文本流式回复：前端读取 SSE 增量片段并实时渲染 `pendingText`。
- 会话管理：新建、切换、加载历史消息。
- 消息持久化：用户消息和完整 AI 回复写入 PostgreSQL。
- 图片输入：前端上传图片后，把 `/uploads/...` URL 随聊天请求传给后端；后端转成 data URL 传给模型。
- 快捷工具：MBTI 速测、CBT 引导、正念呼吸。

### 语音模式

语音 UI 已实现。当前使用浏览器 Web Speech API 做语音识别，识别结果会回填输入框并切回文本模式；完整的“录音上传 -> 服务端 STT -> 自动发送 AI -> TTS”流程尚未接通。

### 日记与 Mood 日历

- 日记支持文字、图片、音频。
- `/api/ai/summary` 生成日记摘要。
- Calendar 从后端日记 API 加载数据并做情绪展示。

### 后台管理

访问 `?mode=admin` 进入 Admin 模式。当前后台数据主要来自 `src/data/mockAdminData.ts`，登录 token 保存在 `localStorage` 的 `famlee_admin_token`。

演示账号：
- 账号：`admin`
- 密码：`123456`

---

## 快速开始

### 依赖

- Node.js 18+
- npm
- PostgreSQL，或直接使用 Docker Compose
- 豆包 / 火山引擎 Ark API Key

### 本地环境变量

复制环境变量模板：

```bash
cp .env.example .env.local
```

关键配置：

```env
VITE_API_BASE_URL=/api
PORT=8787
DATABASE_URL=postgres://famlee:famlee_password@localhost:5432/famlee
JWT_SECRET=replace-with-a-long-random-secret
UPLOAD_DIR=./uploads
PUBLIC_BASE_URL=http://localhost:8787
DOUBAO_API_KEY=your_doubao_api_key
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL=your_doubao_vision_or_multimodal_model
```

### 启动开发

需要分别启动 API 和前端：

```bash
npm install
npm run server:dev
```

另开一个终端：

```bash
npm run dev
```

默认地址：
- 前端：`http://localhost:3000`
- API：`http://localhost:8787`
- 健康检查：`http://localhost:8787/api/health`

### Docker 自托管

```bash
cp .env.production.example .env.production
docker compose up -d --build
```

更多说明见 [SELF_HOSTED.md](SELF_HOSTED.md)。

---

## 项目结构

```text
famlee/
├── src/
│   ├── App.tsx
│   ├── index.tsx
│   ├── constants.ts
│   ├── lib/
│   │   ├── apiClient.ts
│   │   └── authState.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── backendService.ts
│   │   └── geminiService.ts      # 历史命名；当前封装 /api/ai/chat 和 /api/ai/summary
│   └── pages/
│       ├── Chat.tsx
│       ├── Calendar.tsx
│       ├── Home.tsx
│       └── ...
├── server/
│   ├── index.js                 # Express API、AI 代理、上传、SSE
│   ├── db.js                    # PostgreSQL pool
│   └── schema.sql               # 当前数据库 schema
├── uploads/                     # 本地上传目录，运行时生成
├── docker-compose.yml
├── Dockerfile.api
├── Dockerfile.web
├── supabase/                    # 历史 Supabase 方案归档
└── docs/
```

---

## 开发命令

```bash
npm run dev          # Vite 前端开发服务器，端口 3000
npm run server:dev   # Express API watch 模式，端口 8787
npm run server       # Express API 普通启动
npm run build        # 前端生产构建
npm run preview      # 预览前端构建
```

---

## AI 对话实现要点

- `src/pages/Chat.tsx`：聊天 UI、会话菜单、消息状态、流式渲染。
- `src/services/geminiService.ts`：读取 `/api/ai/chat` 的 SSE 响应并解析 `content` / `done` / `sessionId`。
- `server/index.js`：`POST /api/ai/chat` 负责鉴权、会话落库、历史组装、调用豆包、转发 SSE、保存完整 AI 回复。
- `server/index.js`：`PERSONA_PROMPTS` 是模型真正使用的 system prompt；`src/constants.ts` 里的 persona 配置主要服务前端展示和快捷工具。

---

## 部署

推荐使用 Docker Compose 自托管：

```bash
cp .env.production.example .env.production
docker compose up -d --build
```

生产环境需要通过反向代理把 `/api/*` 和 `/uploads/*` 转发到 API 容器，其余路径转发到 Web 容器。示例见 [SELF_HOSTED.md](SELF_HOSTED.md)。

---

## 开发进度

已实现：
- 用户注册、登录和 JWT 鉴权。
- 日记 CRUD、图片/音频上传。
- AI 文本流式聊天。
- 会话列表、会话切换、历史消息恢复。
- 图片多模态输入。
- 三种 AI 人格和快捷心理工具。
- Mood 日历、Profile、Campus、Waterfall 页面。
- Admin 演示后台。

待完善：
- 语音对话自动发送和服务端 STT。
- AI 回复 TTS 播放。
- Admin 连接真实后端数据。
- 更完整的测试覆盖和错误重试。

---

## 免责声明

Famlée 是心理健康辅助工具，不能替代专业心理咨询或医疗服务。若用户出现强烈自伤、自杀或伤害他人的风险，应立即联系可信任的人、校园心理中心或当地紧急服务。
