# Edge Function 部署状态

## ✅ 已完成

1. **Supabase CLI 安装** ✅
   - 已安装到项目依赖
   - 版本：2.63.1

2. **登录和链接** ✅
   - 已登录 Supabase
   - 已链接到项目 `xumbiixfvumebxyrtueu`

3. **Edge Function 部署** ✅
   - 函数名称：`gemini-chat`
   - 部署状态：已部署
   - URL: https://xumbiixfvumebxyrtueu.supabase.co/functions/v1/gemini-chat

4. **代码修复** ✅
   - 修复了 Gemini API 调用格式
   - 使用 `systemInstruction` 字段
   - 改用稳定的 `gemini-1.5-flash` 模型
   - 添加了详细的错误日志

## ⚠️ 当前问题

### 问题：Gemini API 返回 400 错误

**症状**：
```
{"error":"Gemini API error: 400"}
```

**可能原因**：

1. **网络连接问题**
   - 直接测试 Gemini API 时连接超时
   - 可能是网络防火墙或代理问题

2. **API Key 问题**
   - API Key 可能无效或已过期
   - API Key 可能没有正确设置在 Supabase Secrets 中

3. **API 配额问题**
   - Gemini API 可能有使用限制
   - 需要检查 Google AI Studio 的配额

## 🔧 排查步骤

### 步骤1：验证 API Key

1. 访问：https://aistudio.google.com/apikey
2. 检查 API Key 是否有效
3. 尝试创建新的 API Key

### 步骤2：检查 Supabase Secrets

1. 访问：https://supabase.com/dashboard/project/xumbiixfvumebxyrtueu/settings/functions
2. 确认以下环境变量已设置：
   - `GEMINI_API_KEY`: AIzaSyD68fix5iD58vrBf89QT_8D3oMC-EhP5D4
   - `SUPABASE_URL`: https://xumbiixfvumebxyrtueu.supabase.co
   - `SUPABASE_SERVICE_ROLE_KEY`: [从 Dashboard 获取]

### 步骤3：查看 Edge Function 日志

1. 访问：https://supabase.com/dashboard/project/xumbiixfvumebxyrtueu/functions/gemini-chat/logs
2. 查看详细的错误信息
3. 检查 Gemini API 的具体错误响应

### 步骤4：测试网络连接

在本地测试 Gemini API：

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBmXimEwLtZ8fhmZlD4J5QaWfJVL3ZVGjE" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"你好"}]}]}'
```

如果超时，可能是网络问题。

### 步骤5：检查 API 配额

1. 访问：https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com
2. 检查 API 是否已启用
3. 查看配额和使用情况

## 📝 临时解决方案

如果 Gemini API 持续无法使用，可以考虑：

1. **使用其他 AI 模型**
   - OpenAI GPT
   - Anthropic Claude
   - 其他兼容的 API

2. **使用代理**
   - 如果是网络问题，可以配置代理

3. **本地测试**
   - 先在本地测试 Gemini API 是否可用
   - 确认问题后再部署

## 🎯 下一步

1. **排查 API Key 问题**
   - 确认 API Key 有效
   - 重新设置 Supabase Secrets

2. **查看详细日志**
   - 在 Supabase Dashboard 查看 Edge Function 日志
   - 获取 Gemini API 的具体错误信息

3. **测试网络连接**
   - 确认可以访问 Gemini API
   - 排除网络问题

4. **成功后继续**
   - 运行完整测试（`supabase/functions/TESTING.md`）
   - 开始窗口4：前端集成

## 📚 相关文档

- Gemini API 文档：https://ai.google.dev/docs
- Supabase Edge Functions：https://supabase.com/docs/guides/functions
- 测试指南：`supabase/functions/TESTING.md`

---

**最后更新**：2025-11-30
**状态**：部署成功，但 API 调用失败（400 错误）
