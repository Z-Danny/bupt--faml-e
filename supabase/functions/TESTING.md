# 聊天后端功能测试指南

## 前置条件

1. Edge Function 已部署到 Supabase
2. 环境变量已在 Supabase Dashboard 中设置
3. 数据库表 `chat_sessions` 和 `chat_messages` 已创建

## 测试清单

### 测试1：创建新会话并发送文本消息

**目的**：验证新会话创建和基本消息发送功能

**步骤**：
```bash
curl -X POST https://xumbiixfvumebxyrtueu.supabase.co/functions/v1/gemini-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_123" \
  -d '{
    "message": "你好！我今天感觉有点焦虑。",
    "persona": "healing"
  }'
```

**预期结果**：
- 返回流式响应（SSE 格式）
- 响应头包含 `X-Session-Id`
- 收到 AI 的温暖回复
- 数据库中创建了新的 `chat_sessions` 记录
- 数据库中创建了两条 `chat_messages` 记录（用户消息 + AI 回复）

**验证**：
```sql
-- 在 Supabase SQL Editor 中执行
SELECT * FROM chat_sessions WHERE user_id = 'test_user_123' ORDER BY created_at DESC LIMIT 1;
SELECT * FROM chat_messages WHERE session_id = 'YOUR_SESSION_ID' ORDER BY created_at;
```

---

### 测试2：复用会话发送消息

**目的**：验证会话复用和历史消息带入功能

**步骤**：
```bash
curl -X POST https://xumbiixfvumebxyrtueu.supabase.co/functions/v1/gemini-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_123" \
  -d '{
    "message": "你能给我一些建议吗？",
    "persona": "healing",
    "sessionId": "YOUR_SESSION_ID_FROM_TEST1"
  }'
```

**预期结果**：
- AI 回复与上下文相关（提到之前的焦虑话题）
- 数据库中新增两条 `chat_messages` 记录
- 会话 ID 保持不变

---

### 测试3：流式响应

**目的**：验证流式响应的正确性

**步骤**：
```bash
curl -X POST https://xumbiixfvumebxyrtueu.supabase.co/functions/v1/gemini-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_123" \
  --no-buffer \
  -d '{
    "message": "请给我讲一个长故事。",
    "persona": "fun"
  }'
```

**预期结果**：
- 看到多次 `data: {...}` 输出
- 每次输出包含部分内容
- 最后一次输出包含 `done: true` 和 `sessionId`

---

### 测试4：音频输入

**目的**：验证音频输入处理（占位实现）

**步骤**：
```bash
curl -X POST https://xumbiixfvumebxyrtueu.supabase.co/functions/v1/gemini-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_123" \
  -d '{
    "message": "placeholder",
    "persona": "rational",
    "isAudio": true,
    "audioData": "base64_encoded_audio_data"
  }'
```

**预期结果**：
- 返回占位消息："[音频消息已接收，转写功能待实现]"
- 数据库中用户消息内容为占位文本

---

### 测试5：错误处理 - 缺少必需字段

**目的**：验证输入验证

**步骤**：
```bash
curl -X POST https://xumbiixfvumebxyrtueu.supabase.co/functions/v1/gemini-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_123" \
  -d '{
    "message": "你好"
  }'
```

**预期结果**：
- 返回 400 错误
- 错误消息："缺少必需字段：message 和 persona"

---

### 测试6：错误处理 - 无效会话ID

**目的**：验证会话验证

**步骤**：
```bash
curl -X POST https://xumbiixfvumebxyrtueu.supabase.co/functions/v1/gemini-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_123" \
  -d '{
    "message": "你好",
    "persona": "healing",
    "sessionId": "invalid-session-id-12345"
  }'
```

**预期结果**：
- 返回 404 错误
- 错误消息："会话不存在"

---

### 测试7：不同 Persona

**目的**：验证三种 Persona 的系统提示词

**步骤**：
分别使用 `healing`、`rational`、`fun` 三种 persona 发送相同消息：

```bash
# Healing
curl -X POST ... -d '{"message": "我考试失败了", "persona": "healing"}'

# Rational
curl -X POST ... -d '{"message": "我考试失败了", "persona": "rational"}'

# Fun
curl -X POST ... -d '{"message": "我考试失败了", "persona": "fun"}'
```

**预期结果**：
- Healing：温暖、接纳的回复
- Rational：逻辑分析、CBT 引导
- Fun：幽默、调侃的回复

---

### 测试8：情绪检测

**目的**：验证情绪关键词检测

**步骤**：
```bash
curl -X POST https://xumbiixfvumebxyrtueu.supabase.co/functions/v1/gemini-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_123" \
  -d '{
    "message": "我今天非常焦虑，担心明天的考试。",
    "persona": "healing"
  }'
```

**预期结果**：
- 数据库中用户消息的 `mood_detected` 字段为 `ANXIOUS`

**验证**：
```sql
SELECT mood_detected FROM chat_messages
WHERE content LIKE '%焦虑%'
ORDER BY created_at DESC LIMIT 1;
```

---

## 前端集成测试

### 测试9：前端服务层函数

在浏览器控制台中测试：

```javascript
// 导入服务函数
import { createChatSession, listChatSessions, fetchMessages, sendMessageViaEdge } from './services/supabaseService';

// 测试创建会话
const session = await createChatSession('healing');
console.log('新会话:', session);

// 测试发送消息
const stream = await sendMessageViaEdge({
  message: '你好！',
  persona: 'healing',
  sessionId: session.id
});

// 消费流式响应
const reader = stream.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value);
  console.log('收到数据:', text);
}

// 测试获取消息历史
const messages = await fetchMessages(session.id);
console.log('消息历史:', messages);

// 测试获取会话列表
const sessions = await listChatSessions();
console.log('会话列表:', sessions);
```

---

## 性能测试

### 测试10：并发请求

**目的**：验证 Edge Function 的并发处理能力

**步骤**：
```bash
# 使用 Apache Bench 或类似工具
ab -n 100 -c 10 -p request.json -T application/json \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "x-user-id: test_user_123" \
  https://xumbiixfvumebxyrtueu.supabase.co/functions/v1/gemini-chat
```

**预期结果**：
- 所有请求成功完成
- 平均响应时间 < 5 秒
- 无 500 错误

---

## 故障排查

### 常见问题

1. **401/403 错误**
   - 检查 `Authorization` 头是否正确
   - 确认 anon key 有效
   - 验证 Edge Function 的 `verify_jwt` 设置

2. **500 错误**
   - 查看 Supabase Dashboard 的 Edge Function 日志
   - 检查环境变量是否设置
   - 验证 Gemini API Key 是否有效

3. **流式响应中断**
   - 检查网络连接
   - 确认客户端正确处理 SSE
   - 查看 Edge Function 日志中的错误

4. **消息未保存到数据库**
   - 检查 `SUPABASE_SERVICE_ROLE_KEY` 是否正确
   - 验证表权限设置
   - 查看数据库日志

---

## 测试报告模板

```markdown
## 测试报告

**测试日期**：YYYY-MM-DD
**测试人员**：[姓名]
**Edge Function 版本**：[版本号]

### 测试结果

| 测试编号 | 测试项 | 状态 | 备注 |
|---------|--------|------|------|
| 1 | 创建新会话 | ✅ / ❌ | |
| 2 | 复用会话 | ✅ / ❌ | |
| 3 | 流式响应 | ✅ / ❌ | |
| 4 | 音频输入 | ✅ / ❌ | |
| 5 | 错误处理 - 缺少字段 | ✅ / ❌ | |
| 6 | 错误处理 - 无效会话 | ✅ / ❌ | |
| 7 | 不同 Persona | ✅ / ❌ | |
| 8 | 情绪检测 | ✅ / ❌ | |
| 9 | 前端集成 | ✅ / ❌ | |
| 10 | 并发测试 | ✅ / ❌ | |

### 发现的问题

1. [问题描述]
2. [问题描述]

### 建议

1. [改进建议]
2. [改进建议]
```
