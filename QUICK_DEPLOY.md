# 快速部署

当前推荐部署方式是 Docker Compose 自托管。旧的 Supabase Edge Function / `gemini-chat` 部署流程已经废弃。

## 1. 准备环境变量

```bash
cp .env.production.example .env.production
```

编辑 `.env.production`：

```env
VITE_API_BASE_URL=/api
POSTGRES_USER=famlee
POSTGRES_PASSWORD=change-this-database-password
POSTGRES_DB=famlee
DATABASE_URL=postgres://famlee:change-this-database-password@db:5432/famlee
JWT_SECRET=replace-with-a-long-random-secret
UPLOAD_DIR=/app/uploads
PUBLIC_BASE_URL=https://your-domain.example
DOUBAO_API_KEY=your_doubao_api_key
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL=your_doubao_vision_or_multimodal_model
```

## 2. 启动服务

```bash
docker compose up -d --build
```

## 3. 验证

```bash
curl http://127.0.0.1:8787/api/health
```

预期：

```json
{"ok":true}
```

Web 容器默认暴露在 `127.0.0.1:8081`，API 暴露在 `127.0.0.1:8787`。

## 4. 反向代理

生产环境需要把：

- `/api/*` 转发到 `famlee-api:8787`
- `/uploads/*` 转发到 `famlee-api:8787`
- 其他路径转发到 `famlee-web:80`

Caddy 示例见 [SELF_HOSTED.md](SELF_HOSTED.md)。

## 5. 常见问题

- `DOUBAO_API_KEY 未配置`: 检查 `.env.production` 并重建 API 容器。
- 数据库连接失败: 检查 `POSTGRES_PASSWORD` 和 `DATABASE_URL` 是否一致。
- 图片无法访问: 检查 `/uploads/*` 是否转发到 API 服务。
