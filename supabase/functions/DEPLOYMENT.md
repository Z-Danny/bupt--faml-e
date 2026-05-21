# 历史文档：Supabase Function 部署

此目录保留早期 Supabase Edge Function 方案的代码和说明，仅作归档。

当前项目主链路是：

```text
React/Vite -> Express API (/api/ai/chat) -> PostgreSQL -> Doubao / Ark
```

当前部署请使用：

- [../../SELF_HOSTED.md](../../SELF_HOSTED.md)
- [../../QUICK_DEPLOY.md](../../QUICK_DEPLOY.md)

如果要恢复 Supabase Edge Function，需要同步改回前端调用、鉴权、数据库访问和环境变量；不要只部署此目录里的函数。
