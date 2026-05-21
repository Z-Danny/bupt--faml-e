# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

**Famlée** 是一款面向大学生的心理健康支持 Web 应用，基于 React 19、TypeScript 和 Vite 构建。当前后端是自托管 Node.js / Express API，数据持久化使用 PostgreSQL，AI 聊天通过火山引擎 Ark / 豆包 OpenAI-compatible `/chat/completions` 接口实现流式回复。

`supabase/` 目录和部分早期窗口文档是历史方案归档。当前主链路不是 Supabase Edge Function，也不是 Gemini。

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express 5
- **Database**: PostgreSQL (`server/schema.sql`)
- **AI**: Volcengine Ark / Doubao via OpenAI-compatible API
- **Icons**: Lucide React
- **State**: React Hooks + localStorage
- **Auth**: JWT stored in `localStorage` as `famlee_auth_token`

## Development Commands

```bash
# 安装依赖
npm install

# 启动 API 服务 (http://localhost:8787)
npm run server:dev

# 启动前端开发服务器 (http://localhost:3000)
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 启动 API 普通模式
npm run server
```

Vite dev server proxies `/api` and `/uploads` to `http://localhost:8787`.

## Environment Configuration

创建 `.env.local` 文件，可从 `.env.example` 复制：

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

Production Docker deployment uses `.env.production` based on `.env.production.example`.

## Architecture

### Runtime Flow

```text
React/Vite frontend
  -> /api/* via apiClient.ts
  -> Express API (server/index.js)
  -> PostgreSQL via pg (server/db.js)
  -> Doubao / Ark chat completions for AI
```

### Project Structure

```text
famlee/
├── src/
│   ├── index.tsx
│   ├── index.css
│   ├── App.tsx
│   ├── types.ts
│   ├── constants.ts
│   ├── components/
│   ├── pages/
│   │   ├── Chat.tsx
│   │   ├── Calendar.tsx
│   │   ├── Home.tsx
│   │   ├── Profile.tsx
│   │   ├── Admin.tsx
│   │   └── AdminLogin.tsx
│   ├── lib/
│   │   ├── apiClient.ts
│   │   └── authState.ts
│   └── services/
│       ├── authService.ts
│       ├── backendService.ts
│       └── geminiService.ts   # 历史命名；当前封装 /api/ai/chat 与 /api/ai/summary
├── server/
│   ├── index.js               # Express API、AI 代理、上传、SSE
│   ├── db.js                  # PostgreSQL pool
│   └── schema.sql             # 当前数据库 schema
├── uploads/                   # 运行时上传目录
├── docker-compose.yml
├── Dockerfile.api
├── Dockerfile.web
└── supabase/                  # 历史 Supabase 方案归档
```

### State Management & Routing

- **手动状态路由**: 无 React Router，通过 `App.tsx` 中的 `currentPage` 状态切换页面。
- **自顶向下数据流**: 全局状态（`globalMood`, `currentPersona`）在 `App.tsx` 管理，通过 props 传递。
- **认证状态**: 用户登录 token 存在 `localStorage` 的 `famlee_auth_token`，请求由 `apiClient.ts` 自动附加 Bearer token。

### Database Schema

Current schema lives in `server/schema.sql`.

```sql
users (id, email, password_hash, display_name, avatar_url, mood_preference, persona_preference, created_at, updated_at)
journals (id, user_id, content, summary, mood, images, audio_url, created_at)
chat_sessions (id, user_id, persona, created_at)
chat_messages (id, session_id, role, content, mood_detected, images, created_at)
```

### Key Files & Responsibilities

| File | Responsibility |
|------|----------------|
| `src/App.tsx` | App shell, manual page routing, global mood/persona state, admin mode routing |
| `src/lib/apiClient.ts` | API base URL, auth token, JSON fetch helper |
| `src/services/authService.ts` | Register/login/me/profile API calls |
| `src/services/backendService.ts` | Journals, uploads, chat sessions, message history |
| `src/services/geminiService.ts` | Historical name; streams `/api/ai/chat` SSE and calls `/api/ai/summary` |
| `src/constants.ts` | Frontend mood themes, persona display metadata, tool labels |
| `src/pages/Chat.tsx` | Chat UI, streaming state, session menu, tools, Web Speech voice mode |
| `server/index.js` | Express routes, JWT auth, uploads, AI proxy, SSE transform, persistence |
| `server/schema.sql` | PostgreSQL schema initialization |

## AI Chat Implementation

### Main Chat Path

1. `Chat.tsx` calls `streamChat(message, persona, sessionId, images, onChunk)`.
2. `geminiService.ts` sends `POST /api/ai/chat` and reads the response body as SSE.
3. `server/index.js` `POST /api/ai/chat`:
   - validates JWT via `requireAuth`;
   - creates or validates `chat_sessions`;
   - inserts the user message into `chat_messages`;
   - loads recent history;
   - builds provider messages using `PERSONA_PROMPTS`;
   - calls Doubao / Ark with `stream: true`;
   - forwards provider deltas as `data: {"content": "...", "done": false, "sessionId": "..."}`;
   - stores the complete model reply;
   - sends final `done: true`.

### Persona System

Three persona IDs are supported:

| ID | Name | Method | Notes |
|----|------|--------|-------|
| `healing` | 治愈系 / Melty | ACT | Warm, accepting, action-oriented |
| `rational` | 理性系 / Logic | CBT | Calm, analytical, Socratic |
| `fun` | 趣味系 / Spark | Humor | Light, energetic, never cruel |

The model-facing prompts are in `server/index.js` `PERSONA_PROMPTS`. The frontend persona definitions in `src/constants.ts` are used for UI, tools, and display copy.

### Chat Features

- **Streaming text chat** via SSE.
- **Session management** with list, create, switch, and history restore.
- **Persistence** in PostgreSQL.
- **Image input**: uploaded through `/api/uploads/images`; local upload URLs are converted to data URLs before being sent to the provider.
- **Tools**:
  - MBTI quick test
  - CBT guided reframe
  - Mindfulness breathing

### Voice Mode Status

Voice UI exists. Current implementation uses browser Web Speech API in `Chat.tsx` to recognize Chinese speech and fill `inputValue`. It does not yet upload audio to the backend or auto-send recognized text to AI.

## Admin Backend Management System

**Access**: append `?mode=admin` to the app URL, for example `http://localhost:3000?mode=admin`.

Demo credentials:

- Username: `admin`
- Password: `123456`

Current admin data is mostly mock data from `src/data/mockAdminData.ts`. Future work should connect it to Express/PostgreSQL endpoints, not Supabase.

## Code Patterns

- Function components + Hooks.
- Props interfaces live in `types.ts` or component-local definitions.
- Async API calls use `try/catch` and user-friendly fallback messages.
- `apiClient.ts` is the default API path; avoid adding direct provider calls in the browser.
- Keep model/API secrets on the server side only.

## Data Flow

```text
User action
  -> React component state
  -> service wrapper
  -> Express /api route
  -> PostgreSQL and/or Doubao
  -> React UI update
```

## Important Notes

### API Key Security

- `.env.local` and `.env.production` must not be committed.
- `DOUBAO_API_KEY` belongs on the server only.
- The browser should only know `VITE_API_BASE_URL`.

### Historical Supabase Files

The `supabase/` folder and older task/deployment docs describe a previous implementation path. Do not assume those files are active unless the user explicitly asks to revive the Supabase Edge Function approach.

### Pending Work

- Complete voice conversation flow.
- Add server-side STT or reliable browser STT send behavior.
- Add TTS playback for AI replies.
- Connect Admin analytics to real PostgreSQL data.
- Add end-to-end tests and retry handling.
