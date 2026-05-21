# 历史任务：Window 4 Frontend Integration

此文件原先用于规划前端从 mock / 本地 Gemini SDK 切换到 Supabase Edge Function。

当前前端已经接入 Express API：

- API base：`src/lib/apiClient.ts`
- 认证：`src/services/authService.ts`
- 日记、上传、会话：`src/services/backendService.ts`
- AI 流式聊天：`src/services/geminiService.ts`
- 聊天页面：`src/pages/Chat.tsx`

当前请求流：

```text
Chat.tsx -> streamChat() -> /api/ai/chat -> Express -> Doubao / Ark -> SSE -> Chat.tsx
```

此任务文档仅作历史归档，不再代表当前实现。
