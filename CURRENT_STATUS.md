# Famlée 项目当前状态

> 更新时间：2026-05-21

## 当前架构

项目已经从早期 Supabase / Gemini 方案切换为自托管方案：

```text
React/Vite frontend
  -> Express API (/api)
  -> PostgreSQL
  -> Doubao / Volcengine Ark OpenAI-compatible API
```

## 已完成

- React 19 + TypeScript + Vite 前端。
- Express API 服务：`server/index.js`。
- PostgreSQL schema：`server/schema.sql`。
- 用户注册、登录、JWT 鉴权。
- 日记保存、读取、图片/音频上传。
- AI 日记摘要：`POST /api/ai/summary`。
- AI 流式聊天：`POST /api/ai/chat`。
- 聊天会话列表、切换、历史消息恢复。
- 图片多模态输入。
- 三种 persona：`healing`、`rational`、`fun`。
- Admin 演示后台。
- Docker Compose 自托管部署配置。

## 进行中 / 待完善

### 语音对话

当前语音 UI 使用浏览器 Web Speech API 识别中文并回填输入框。尚未完成：

- 自动发送识别文本到 AI。
- 服务端音频上传 STT。
- AI 回复 TTS 播放。
- 录音时长限制和波形反馈。

### Admin 数据

Admin 当前主要使用 `src/data/mockAdminData.ts`。后续需要：

- 添加真实统计 API。
- 从 PostgreSQL 聚合聊天、情绪、活动数据。
- 增加管理员后端鉴权和权限控制。

### 测试与稳定性

- 端到端测试。
- AI 请求错误重试。
- 更细的聊天失败状态展示。
- 生产日志和监控。

## 关键文档

- [README.md](README.md)：项目总览和开发启动。
- [SETUP_GUIDE.md](SETUP_GUIDE.md)：本地配置。
- [SELF_HOSTED.md](SELF_HOSTED.md)：Docker / Caddy 自托管部署。
- [QUICK_DEPLOY.md](QUICK_DEPLOY.md)：快速部署。
- [AGENTS.md](AGENTS.md)：代理/开发者工作说明。

## 历史归档

以下文档或目录描述早期方案，当前不作为实现依据：

- `supabase/`
- `deploy-edge-function.md`
- `supabase/functions/DEPLOYMENT.md`
- `supabase/functions/TESTING.md`
- `docs/tasks/WINDOW_*`
- `docs/PARALLEL_DEVELOPMENT.md`

如需恢复 Supabase Edge Function，需要重新同步前端 API、鉴权、数据库访问和部署流程。
