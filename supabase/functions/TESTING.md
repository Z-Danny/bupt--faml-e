# 历史文档：Supabase Function 测试

此文件原先用于测试 `gemini-chat` Supabase Edge Function。当前项目已经不通过 Supabase Function 提供 AI 聊天。

当前测试入口：

```bash
curl http://localhost:8787/api/health
```

登录后，前端通过 `src/services/geminiService.ts` 调用：

```text
POST /api/ai/chat
```

后端实现位于：

```text
server/index.js
```

聊天数据保存在 PostgreSQL 表：

```text
chat_sessions
chat_messages
```

请不要再使用旧的 `https://...supabase.co/functions/v1/gemini-chat` 测试命令验证当前项目。
