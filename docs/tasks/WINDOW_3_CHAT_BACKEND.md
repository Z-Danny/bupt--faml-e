# 历史任务：Window 3 Chat Backend

此文件原先用于规划 Supabase Edge Function + Gemini 的聊天后端。

当前 AI 聊天已经改为 Express + PostgreSQL + 豆包 / Ark：

- 前端聊天 UI：`src/pages/Chat.tsx`
- 前端流式封装：`src/services/geminiService.ts`
- 会话 API：`src/services/backendService.ts`
- 后端聊天路由：`POST /api/ai/chat` in `server/index.js`
- 会话列表：`GET /api/chat/sessions`
- 历史消息：`GET /api/chat/sessions/:id/messages`
- 数据表：`chat_sessions`, `chat_messages` in `server/schema.sql`
- AI Provider：Volcengine Ark / Doubao OpenAI-compatible `/chat/completions`

此任务文档仅作历史归档，不再代表当前实现。不要再实现或部署 `supabase/functions/gemini-chat` 作为主链路。
