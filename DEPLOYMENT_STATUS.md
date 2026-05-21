# 部署状态

当前有效部署方案：Docker Compose 自托管。

## 当前状态

- Web 容器：Vite 构建产物由 Nginx 提供。
- API 容器：Node/Express，监听 `8787`。
- 数据库：PostgreSQL 16。
- 上传：API 服务通过 `/uploads/*` 提供静态文件。
- AI：API 服务通过 `DOUBAO_API_KEY` 调用火山引擎 Ark / 豆包 OpenAI-compatible 接口。

## 关键文件

- `docker-compose.yml`
- `Dockerfile.web`
- `Dockerfile.api`
- `.env.production.example`
- `SELF_HOSTED.md`
- `server/index.js`
- `server/schema.sql`

## 验证命令

```bash
docker compose ps
curl http://127.0.0.1:8787/api/health
```

预期：

```json
{"ok":true}
```

## 历史说明

旧的 `gemini-chat` Supabase Edge Function 和 Gemini 排查记录已经过时。当前项目不依赖 Supabase Edge Functions，也不使用 Gemini 作为聊天模型。
