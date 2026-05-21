# Famlée 本地运行与运维手册

本手册对应当前自托管架构：React/Vite + Express + PostgreSQL + 豆包 / 火山引擎 Ark。

早期 Supabase 项目创建、Storage、Edge Function 操作流程已经过时，不适用于当前主链路。

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

必要配置：

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

### 3. 启动 API

```bash
npm run server:dev
```

API 启动时会读取 `server/schema.sql` 初始化数据库表。

### 4. 启动前端

```bash
npm run dev
```

访问 `http://localhost:3000`。

## 生产部署

推荐 Docker Compose：

```bash
cp .env.production.example .env.production
docker compose up -d --build
```

反向代理需要转发：

- `/api/*` -> API 服务 `8787`
- `/uploads/*` -> API 服务 `8787`
- 其他路径 -> Web 服务 `80`

详见根目录 [SELF_HOSTED.md](../SELF_HOSTED.md)。

## 账号与数据

- 用户通过 `/api/auth/register` 注册。
- 登录后 JWT token 存在浏览器 `localStorage` 的 `famlee_auth_token`。
- 日记表：`journals`。
- 聊天会话表：`chat_sessions`。
- 聊天消息表：`chat_messages`。
- 上传文件保存在 `UPLOAD_DIR`。

## AI 聊天

- 前端服务：`src/services/geminiService.ts`。
- 后端路由：`POST /api/ai/chat`。
- Provider：豆包 / Ark OpenAI-compatible `/chat/completions`。
- 返回格式：Server-Sent Events。

常见失败原因：

- `DOUBAO_API_KEY` 未配置。
- `DOUBAO_MODEL` 不支持当前输入类型。
- API 服务无法访问火山引擎 Ark。
- 用户未登录导致 401。

## 常见问题

### 前端页面可以打开，但聊天失败

先检查 API：

```bash
curl http://localhost:8787/api/health
```

然后查看 API 终端中的错误日志。

### 数据库连接失败

检查 `DATABASE_URL`，确认 PostgreSQL 正在运行且数据库存在。

### 上传文件无法访问

检查 `UPLOAD_DIR` 是否可写，并确认 `/uploads/*` 已经由 API 服务或反向代理暴露。

### Admin 数据不是真实数据

当前 Admin 仍使用 mock 数据。真实数据接入需要新增 Express admin API 和 PostgreSQL 聚合查询。
