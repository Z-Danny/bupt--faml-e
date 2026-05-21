# 历史任务：Window 2 Journal Persistence

此文件原先用于规划基于 Supabase 的日记持久化。

当前日记持久化已经改为 Express + PostgreSQL：

- 前端服务：`src/services/backendService.ts`
- 保存日记：`POST /api/journals`
- 获取日记：`GET /api/journals`
- 获取单篇：`GET /api/journals/:id`
- 图片上传：`POST /api/uploads/images`
- 音频上传：`POST /api/uploads/audio`
- 后端实现：`server/index.js`
- 数据表：`journals` in `server/schema.sql`

此任务文档仅作历史归档，不再代表当前实现。
