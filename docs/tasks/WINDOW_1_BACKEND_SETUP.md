# 历史任务：Window 1 Backend Setup

此文件原先用于规划 Supabase 项目、Storage buckets 和 Edge Function 骨架。

当前项目已经改为自托管实现：

```text
React/Vite -> Express API -> PostgreSQL -> Doubao / Ark
```

当前后端入口：

- `server/index.js`
- `server/db.js`
- `server/schema.sql`

当前配置与部署：

- `SETUP_GUIDE.md`
- `SELF_HOSTED.md`
- `.env.example`
- `.env.production.example`

不要再按此历史任务创建 Supabase 项目或 `gemini-chat` Edge Function，除非明确决定恢复旧架构。
