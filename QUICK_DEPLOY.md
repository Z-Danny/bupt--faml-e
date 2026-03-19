# 🚀 快速部署指南

## 当前状态

✅ **已完成**：
- Supabase CLI 已安装（`npm install --save-dev supabase`）
- Edge Function 代码已完成
- 配置文件已创建
- 部署脚本已添加到 package.json

❌ **待完成**：
- 登录 Supabase
- 链接项目
- 设置环境变量
- 部署 Edge Function

---

## 🎯 快速部署（3步）

### 步骤1：登录并链接项目

```bash
# 登录 Supabase（会打开浏览器）
npm run supabase:login

# 链接到项目
npm run supabase:link
```

### 步骤2：设置环境变量

访问 Supabase Dashboard 设置 Secrets：
https://supabase.com/dashboard/project/xumbiixfvumebxyrtueu/settings/functions

添加以下环境变量：

| 变量名 | 值 | 获取方式 |
|--------|-----|----------|
| `GEMINI_API_KEY` | 你的 Gemini API Key | https://aistudio.google.com/apikey |
| `SUPABASE_URL` | `https://xumbiixfvumebxyrtueu.supabase.co` | 已知 |
| `SUPABASE_SERVICE_ROLE_KEY` | 从 Dashboard 获取 | Settings → API → service_role |

### 步骤3：部署

```bash
# 部署 Edge Function
npm run supabase:deploy
```

---

## ✅ 验证部署

部署成功后，运行测试命令：

```bash
curl -X POST https://xumbiixfvumebxyrtueu.supabase.co/functions/v1/gemini-chat \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bWJpaXhmdnVtZWJ4eXJ0dWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTg3MDAsImV4cCI6MjA4MDA3NDcwMH0.C8NOov3qfu1kqOvglnjw8Zm9JogylBKtQSpRXNzEcUU" \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_123" \
  -d '{"message":"你好！","persona":"healing"}'
```

**预期结果**：看到流式响应，包含 AI 的回复。

---

## 🔧 如果遇到问题

### CLI 登录失败
→ 使用 Dashboard 手动部署（见 `deploy-edge-function.md`）

### 部署后返回 500
→ 检查环境变量是否设置正确
→ 查看 Dashboard 的 Edge Function 日志

### 返回 404
→ 确认函数名称为 `gemini-chat`
→ 检查部署是否成功

---

## 📚 详细文档

- 完整部署指南：`deploy-edge-function.md`
- 测试指南：`supabase/functions/TESTING.md`
- 部署说明：`supabase/functions/DEPLOYMENT.md`

---

## 🎉 部署成功后

1. ✅ 标记窗口3完成
2. 🚀 开始窗口4：前端集成
3. 📝 参考：`docs/tasks/WINDOW_4_FRONTEND_INTEGRATION.md`

---

**需要帮助？查看详细文档或联系支持。**
