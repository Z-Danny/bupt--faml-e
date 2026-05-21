# 历史文档：Edge Function 部署

本文件原先用于记录 Supabase Edge Function `gemini-chat` 的部署流程。

当前项目已经改为自托管架构：

```text
React/Vite -> Express API -> PostgreSQL -> Doubao / Ark
```

当前 AI 聊天入口是：

- 前端：`src/services/geminiService.ts`
- 后端：`POST /api/ai/chat` in `server/index.js`
- 部署：Docker Compose，见 [SELF_HOSTED.md](SELF_HOSTED.md)

不要再按旧流程部署 `supabase/functions/gemini-chat`。如果需要重新启用 Supabase Edge Function，需要先重新设计前端 API 调用、鉴权、数据库访问和环境变量。
