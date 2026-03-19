# Edge Function 部署指南

## 部署方式

### 方式1：使用 Supabase CLI（推荐）

1. 安装 Supabase CLI：
```bash
npm install -g supabase
```

2. 登录 Supabase：
```bash
supabase login
```

3. 链接到项目：
```bash
supabase link --project-ref xumbiixfvumebxyrtueu
```

4. 设置环境变量（在 Supabase Dashboard → Settings → Edge Functions → Secrets）：
   - `GEMINI_API_KEY`: 你的 Gemini API Key
   - `SUPABASE_URL`: https://xumbiixfvumebxyrtueu.supabase.co
   - `SUPABASE_SERVICE_ROLE_KEY`: 从 Dashboard → Settings → API 获取

5. 部署 Edge Function：
```bash
supabase functions deploy gemini-chat
```

### 方式2：通过 Supabase Dashboard

1. 访问 Supabase Dashboard：https://supabase.com/dashboard/project/xumbiixfvumebxyrtueu

2. 进入 Edge Functions 页面

3. 点击 "New Function"

4. 函数名称：`gemini-chat`

5. 复制 `supabase/functions/gemini-chat/index.ts` 的内容到编辑器

6. 设置环境变量（Secrets）：
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

7. 点击 "Deploy"

## 测试 Edge Function

部署成功后，可以使用以下命令测试：

```bash
curl -X POST https://xumbiixfvumebxyrtueu.supabase.co/functions/v1/gemini-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_123" \
  -d '{
    "message": "你好！",
    "persona": "healing"
  }'
```

## 注意事项

1. **环境变量**：确保在 Supabase Dashboard 中设置了所有必需的环境变量
2. **CORS**：Edge Function 已配置允许所有来源（`*`），生产环境建议限制为特定域名
3. **认证**：当前使用 `x-user-id` 请求头传递用户ID，前端会自动添加
4. **流式响应**：Edge Function 返回 Server-Sent Events (SSE) 格式的流式响应
5. **会话管理**：首次调用时不传 `sessionId`，Edge Function 会创建新会话并在响应头 `X-Session-Id` 中返回

## 故障排查

### 401/403 错误
- 检查 `Authorization` 头是否正确使用 anon key
- 确认 Edge Function 的 `verify_jwt` 设置为 `false`（在 `config.toml` 中）

### 500 错误
- 检查 Supabase Dashboard 的 Edge Function 日志
- 确认环境变量已正确设置
- 验证 Gemini API Key 是否有效

### 流式响应问题
- 确认前端使用 `ReadableStream` 正确消费响应
- 检查网络是否支持长连接

## 前端集成示例

```typescript
import { sendMessageViaEdge } from './services/supabaseService';

// 发送消息并处理流式响应
const stream = await sendMessageViaEdge({
  message: '你好！',
  persona: 'healing',
  sessionId: 'existing-session-id', // 可选
});

const reader = stream.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value);
  const lines = text.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.content) {
        console.log('收到内容:', data.content);
      }
      if (data.done) {
        console.log('会话ID:', data.sessionId);
      }
    }
  }
}
```
