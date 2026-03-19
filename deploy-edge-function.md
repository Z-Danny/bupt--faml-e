# Edge Function 部署指南（手动执行）

## ✅ 已完成的准备工作

- ✅ Supabase CLI 已安装到项目（`npm install --save-dev supabase`）
- ✅ Edge Function 代码已完成（`supabase/functions/gemini-chat/index.ts`）
- ✅ 配置文件已创建（`supabase/config.toml`）

## 🚀 部署步骤

### 方式1：使用 Supabase CLI（推荐）

#### 步骤1：登录 Supabase

```bash
npx supabase login
```

这会打开浏览器，让你登录 Supabase 账号。

#### 步骤2：链接到项目

```bash
npx supabase link --project-ref xumbiixfvumebxyrtueu
```

如果提示输入数据库密码，可以在 Supabase Dashboard → Settings → Database 中找到。

#### 步骤3：设置环境变量（Secrets）

在部署前，需要在 Supabase Dashboard 中设置环境变量：

1. 访问：https://supabase.com/dashboard/project/xumbiixfvumebxyrtueu/settings/functions
2. 点击 "Edge Functions" → "Secrets"
3. 添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GEMINI_API_KEY` | 你的 Gemini API Key | 从 Google AI Studio 获取 |
| `SUPABASE_URL` | `https://xumbiixfvumebxyrtueu.supabase.co` | 项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 从 Dashboard 获取 | Settings → API → service_role key |

#### 步骤4：部署 Edge Function

```bash
npx supabase functions deploy gemini-chat
```

部署成功后，你会看到类似的输出：
```
Deploying function gemini-chat...
Function gemini-chat deployed successfully!
URL: https://xumbiixfvumebxyrtueu.supabase.co/functions/v1/gemini-chat
```

---

### 方式2：通过 Supabase Dashboard（手动）

如果 CLI 部署遇到问题，可以通过 Dashboard 手动部署：

#### 步骤1：访问 Edge Functions 页面

https://supabase.com/dashboard/project/xumbiixfvumebxyrtueu/functions

#### 步骤2：创建新函数

1. 点击 "New Function"
2. 函数名称：`gemini-chat`
3. 选择 "Import from file" 或直接粘贴代码

#### 步骤3：复制代码

打开 `supabase/functions/gemini-chat/index.ts`，复制全部内容到编辑器。

#### 步骤4：设置环境变量

在函数设置页面，添加以下 Secrets：
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

#### 步骤5：部署

点击 "Deploy" 按钮。

---

## 🧪 验证部署

部署成功后，运行以下命令测试：

```bash
curl -X POST https://xumbiixfvumebxyrtueu.supabase.co/functions/v1/gemini-chat \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bWJpaXhmdnVtZWJ4eXJ0dWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTg3MDAsImV4cCI6MjA4MDA3NDcwMH0.C8NOov3qfu1kqOvglnjw8Zm9JogylBKtQSpRXNzEcUU" \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_123" \
  -d '{"message":"你好！","persona":"healing"}'
```

**预期结果**：
- 返回流式响应（SSE 格式）
- 看到 AI 的回复内容
- 响应头包含 `X-Session-Id`

**如果返回 404**：
- Edge Function 未部署成功
- 检查函数名称是否为 `gemini-chat`

**如果返回 500**：
- 检查环境变量是否设置正确
- 查看 Supabase Dashboard 的 Edge Function 日志

---

## 📝 环境变量获取方法

### 1. GEMINI_API_KEY

1. 访问：https://aistudio.google.com/apikey
2. 创建新的 API Key
3. 复制 Key

### 2. SUPABASE_SERVICE_ROLE_KEY

1. 访问：https://supabase.com/dashboard/project/xumbiixfvumebxyrtueu/settings/api
2. 找到 "service_role" 部分
3. 点击 "Reveal" 显示 Key
4. 复制 Key

⚠️ **注意**：service_role key 拥有完全权限，请妥善保管，不要提交到 Git。

---

## 🔧 故障排查

### 问题1：CLI 登录失败

**解决方案**：
- 确保浏览器可以正常访问 Supabase
- 尝试使用 Dashboard 手动部署

### 问题2：部署时提示权限错误

**解决方案**：
- 确认你的 Supabase 账号有项目的管理员权限
- 检查项目 ref 是否正确（`xumbiixfvumebxyrtueu`）

### 问题3：函数部署成功但返回 500

**解决方案**：
1. 检查 Edge Function 日志：
   - Dashboard → Edge Functions → gemini-chat → Logs
2. 确认环境变量已设置
3. 验证 Gemini API Key 是否有效

### 问题4：流式响应不工作

**解决方案**：
- 确认使用的是 `--no-buffer` 选项（curl）
- 前端使用 `ReadableStream` 正确消费响应
- 检查网络是否支持长连接

---

## 📚 相关文档

- Supabase CLI 文档：https://supabase.com/docs/guides/cli
- Edge Functions 文档：https://supabase.com/docs/guides/functions
- 测试指南：`supabase/functions/TESTING.md`

---

## ✅ 完成检查清单

部署完成后，请确认：

- [ ] Edge Function 已部署到 Supabase
- [ ] 环境变量已在 Dashboard 中设置
- [ ] 测试 curl 命令返回正常响应
- [ ] 数据库中创建了 `chat_sessions` 和 `chat_messages` 记录
- [ ] 可以进行下一步（窗口4：前端集成）

---

**准备好了吗？开始部署吧！🚀**
