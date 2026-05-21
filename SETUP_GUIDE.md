# Famlée 快速配置指南

本指南对应当前项目架构：React/Vite 前端 + Node/Express API + PostgreSQL + 豆包 / 火山引擎 Ark。

旧的 Supabase / Gemini Edge Function 配置流程已归档，不是当前主链路。

## 配置清单

- [ ] 安装 Node.js 18+
- [ ] 安装依赖
- [ ] 准备 PostgreSQL 数据库，或使用 Docker Compose
- [ ] 配置 `.env.local`
- [ ] 启动 API 服务
- [ ] 启动 Vite 前端
- [ ] 验证 AI 聊天

## 方式一：本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 准备 PostgreSQL

创建数据库后，确保 `DATABASE_URL` 指向它。API 启动时会自动读取 `server/schema.sql` 初始化表结构。

示例：

```env
DATABASE_URL=postgres://famlee:famlee_password@localhost:5432/famlee
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

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

### 4. 启动 API

```bash
npm run server:dev
```

验证：

```bash
curl http://localhost:8787/api/health
```

预期返回：

```json
{"ok":true}
```

### 5. 启动前端

另开一个终端：

```bash
npm run dev
```

访问 `http://localhost:3000`。Vite 会把 `/api` 和 `/uploads` 代理到 `http://localhost:8787`。

## 方式二：Docker Compose

```bash
cp .env.production.example .env.production
# 编辑 .env.production，填入强密码和 DOUBAO_API_KEY
docker compose up -d --build
```

服务：

- Web: `127.0.0.1:8081`
- API: `127.0.0.1:8787`
- PostgreSQL: `127.0.0.1:5432`

更多生产部署说明见 [SELF_HOSTED.md](SELF_HOSTED.md)。

## 常见问题

### API 返回 `未登录`

聊天、日记、上传等接口需要登录。先在前端注册/登录，token 会保存到 `localStorage` 的 `famlee_auth_token`。

### AI 聊天失败

检查：

- `.env.local` 中 `DOUBAO_API_KEY` 是否设置。
- `DOUBAO_MODEL` 是否支持文本/图片输入。
- API 服务终端是否有豆包接口错误。

### 前端请求 `/api` 失败

确认：

- `npm run server:dev` 正在运行。
- `vite.config.ts` 中代理仍指向 `http://localhost:8787`。
- `.env.local` 的 `VITE_API_BASE_URL=/api`。

### 上传图片不显示

确认：

- `UPLOAD_DIR` 可写。
- API 服务暴露 `/uploads/*`。
- 生产环境反向代理把 `/uploads/*` 转发到 API 服务。
