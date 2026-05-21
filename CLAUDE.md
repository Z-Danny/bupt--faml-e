# CLAUDE.md

This file mirrors the current repository guidance for coding agents.

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
npm install
npm run server:dev   # API on http://localhost:8787
npm run dev          # Frontend on http://localhost:3000
npm run build
npm run preview
npm run server
```

Vite proxies `/api` and `/uploads` to `http://localhost:8787`.

## Environment Configuration

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

## Architecture

```text
React/Vite frontend
  -> /api/* through src/lib/apiClient.ts
  -> Express API in server/index.js
  -> PostgreSQL through server/db.js
  -> Doubao / Ark chat completions for AI
```

Current schema is in `server/schema.sql`:

```sql
users (id, email, password_hash, display_name, avatar_url, mood_preference, persona_preference, created_at, updated_at)
journals (id, user_id, content, summary, mood, images, audio_url, created_at)
chat_sessions (id, user_id, persona, created_at)
chat_messages (id, session_id, role, content, mood_detected, images, created_at)
```

## Key Files

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

## AI Chat

1. `Chat.tsx` calls `streamChat()`.
2. `geminiService.ts` posts to `/api/ai/chat` and parses SSE lines.
3. `server/index.js` validates JWT, creates/validates the session, stores the user message, loads history, calls Doubao with `stream: true`, forwards deltas, stores the final model reply, then sends `done: true`.

The model-facing persona prompts are in `server/index.js` `PERSONA_PROMPTS`. `src/constants.ts` controls frontend display and tool labels.

Supported personas:

| ID | Name | Method |
|----|------|--------|
| `healing` | Melty / 治愈系 | ACT |
| `rational` | Logic / 理性系 | CBT |
| `fun` | Spark / 趣味系 | Humor |

## Voice Mode

Voice UI exists. Current implementation uses browser Web Speech API in `Chat.tsx` to recognize Chinese speech and fill the input. It does not yet upload audio to the backend or auto-send recognized text to AI.

## Admin

Admin mode is available at `?mode=admin`.

Demo credentials:

- Username: `admin`
- Password: `123456`

Admin analytics currently use `src/data/mockAdminData.ts`; future backend work should use Express/PostgreSQL APIs.

## Important Notes

- Keep `DOUBAO_API_KEY`, `DATABASE_URL`, and `JWT_SECRET` server-side.
- Browser code should call `apiClient.ts`, not AI providers directly.
- `supabase/` and older task/deployment docs are historical. Do not use them as current architecture unless explicitly asked.
- Production Docker deployment is documented in `SELF_HOSTED.md`.
