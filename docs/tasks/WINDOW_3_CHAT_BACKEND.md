# 窗口3任务：聊天后端功能开发

> **分支**：`feature/chat-backend`
> **优先级**：P1（依赖窗口1完成）
> **预计时间**：6-8小时
> **角色**：Claude Code独立开发，可与窗口2并行

---

## 🎯 任务目标

1. 完善 Edge Function：实现聊天消息持久化与流式返回
2. 支撑前端聊天：提供聊天会话与消息 API
3. 支持文本与音频消息
4. 在 `src/services/supabaseService.ts` 中暴露聊天相关函数

---

## ✅ 开始前检查

**必须等待窗口1完成以下任务**：
- [ ] Supabase 项目已创建
- [ ] 数据库表 `chat_sessions`、`chat_messages` 已创建
- [ ] Edge Function `gemini-chat` 骨架已生成
- [ ] `.env.local` 已配置（含 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`、`VITE_GEMINI_API_KEY`）
- [ ] 存在 `WINDOW_1_DONE.txt` 文件

**如果窗口1未完成，请等待！**

---

## 🛠️ 任务清单

### 阶段1：熟悉现状（20分钟）
- [ ] 阅读 `supabase/functions/gemini-chat/index.ts` 骨架
- [ ] 确认 `supabase/config.toml` 中函数名称与路径
- [ ] 查阅 `src/constants.ts` 的 `PERSONAS` 配置，确认系统提示词来源
- [ ] 记录 Edge Function URL，用于本地调试

### 阶段2：完善 Edge Function（核心开发，3-4小时）
文件：`supabase/functions/gemini-chat/index.ts`

**目标**：接受前端请求，处理会话/消息持久化，调用 Gemini，支持流式响应与音频输入。

**实现要点**：

- 请求体格式（示例）：
  ```json
  {
    "message": "你好！",
    "persona": "rational",
    "sessionId": "existing-session-id", // 可选，缺省则新建
    "isAudio": false,
    "audioData": null // 若 isAudio 为 true，传 base64 音频或 Blob
  }
  ```

- 关键逻辑步骤：
  ```ts
  import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  interface ChatRequest {
    message: string;
    persona: string;
    sessionId?: string;
    isAudio?: boolean;
    audioData?: string; // base64
  }

  const newSession = async (userId: string, persona: string) => {
    return supabase
      .from("chat_sessions")
      .insert({ user_id: userId, persona })
      .select("id")
      .single();
  };

  const addMessage = (sessionId: string, role: "user" | "model", content: string, mood?: string) =>
    supabase.from("chat_messages").insert({
      session_id: sessionId,
      role,
      content,
      mood_detected: mood ?? null,
    });

  const fetchHistory = (sessionId: string) =>
    supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

  const buildSystemPrompt = (persona: string) => {
    // TODO: 从 PERSONAS 或常量表按 persona 取系统提示
    return `You are persona ${persona}. Keep responses concise and empathetic.`;
  };
  ```

- 会话管理：
  - 如果 `sessionId` 为空：创建新会话，返回新 `sessionId`
  - 如果存在：校验 `sessionId` 是否存在，若不存在返回 404

- Gemini 调用（伪代码示例，依据实际 SDK/REST）：
  ```ts
  const prompt = [
    { role: "system", content: buildSystemPrompt(persona) },
    ...history.data.map((m) => ({ role: m.role === "user" ? "user" : "model", content: m.content })),
    { role: "user", content: message },
  ];

  const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=" + geminiApiKey, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: prompt }),
  });

  // 将 Gemini 流式片段转发给前端，同时累积完整回复用于落库
  ```

- 流式响应：
  - 使用 `ReadableStream` 将 Gemini 的分片实时转发
  - 同时拼接完整回复字符串，结束后写入 `chat_messages`（role=model）

- 音频处理：
  - 如果 `isAudio` 为 true，`audioData` 为 base64；转换为文本（可调用 Gemini 音频转文本接口或占位逻辑），再进入统一聊天流程
  - 将原始音频 URL/标记存入 `chat_messages` 的 `content`（可存文本转写结果，或 JSON 字符串标记音频）

- 错误处理：
  ```ts
  return new Response(JSON.stringify({ error: "reason" }), { status: 400 });
  ```

- 返回格式（流式时首包携带元数据，或在 header 中附加）：
  ```json
  {
    "sessionId": "new-or-existing",
    "message": "AI 回复内容（非流模式）"
  }
  ```

**检查清单**：
- [ ] 支持无 sessionId 时自动创建会话
- [ ] 先落用户消息，再调 Gemini，再落 AI 消息
- [ ] 支持 persona 切换
- [ ] 支持流式响应（文本）
- [ ] 支持音频输入转文本流程
- [ ] 错误返回格式统一

### 阶段3：实现聊天 API（前端服务层，1.5小时）
文件：`src/services/supabaseService.ts`

**新增导出函数**（示例签名，可调整）：
```ts
import { supabase } from "../lib/supabaseClient";
import { getUserId } from "../lib/supabaseClient";
import type { ChatSession, ChatMessage } from "../types";

export const createChatSession = async (persona: string): Promise<ChatSession> => {
  const userId = getUserId();
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: userId, persona })
    .select("*")
    .single();
  if (error) throw error;
  return data as ChatSession;
};

export const listChatSessions = async (): Promise<ChatSession[]> => {
  const userId = getUserId();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ChatSession[];
};

export const fetchMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ChatMessage[];
};

// 发送消息（非流）：前端可直接调用 Edge Function 以获流式；此函数用于回退或非流场景
export const sendMessageViaEdge = async (payload: {
  message: string;
  persona: string;
  sessionId?: string;
  isAudio?: boolean;
  audioData?: string;
}) => {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-chat`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
  return res.body ? res.body : res.json(); // 若流式，前端自行消费 ReadableStream
};
```

**检查清单**：
- [ ] 所有函数都使用 `getUserId()` 过滤当前用户数据
- [ ] 插入/查询字段与表结构一致
- [ ] 错误抛出清晰，便于前端提示

### 阶段4：类型补充（20分钟）
文件：`src/types.ts`（若已存在则补充字段）

```ts
export interface ChatSession {
  id: string;
  user_id: string;
  persona: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "model";
  content: string;         // 文本或转写后的音频文本
  mood_detected?: string | null;
  created_at: string;
}
```

- [ ] 确认枚举/联合类型与后端一致
- [ ] 如已有类型，合并而非覆盖，避免破坏其他窗口代码

### 阶段5：流式前端接入提示（参考，30分钟）
- 建议前端使用 `ReadableStream`/`getReader()` 消费 `sendMessageViaEdge` 返回的 `body`
- 每次 chunk 追加到 UI，末尾落库由后端完成
- 若需前端落库：监听结束后刷新 `fetchMessages(sessionId)`

---

## 🧪 测试清单

### 本地/边缘函数测试
- [ ] **测试1：创建新会话并发送文本**
  - `curl -X POST $FUNCTION_URL -H "Authorization: Bearer <anon>" -H "Content-Type: application/json" -d '{"message":"你好","persona":"healing"}'`
  - 期望：返回 `sessionId`，AI 回复
- [ ] **测试2：复用会话发送文本**
  - 携带上一步的 `sessionId`
  - 期望：历史被带入，回复与上下文相关
- [ ] **测试3：流式响应**
  - 用 `curl --no-buffer` 或前端 `ReadableStream` 观察分片
  - 期望：多次 chunk，结束后有 `\n` 或 EOF
- [ ] **测试4：音频输入**
  - 传 `isAudio=true` + `audioData` (base64)
  - 期望：音频被转写后参与对话；落库的用户消息可记录转写文本
- [ ] **测试5：错误处理**
  - 传空 `message` 或非法 `sessionId`
  - 期望：返回 400/404，包含 `error` 字段

### Supabase Dashboard 验证
- [ ] `chat_sessions`：有新纪录，persona 正确
- [ ] `chat_messages`：用户消息和 AI 消息均落库，时间顺序正确
- [ ] 若含音频：检查 `content` 是否存储转写结果或标记

---

## 🏁 完成标志

- [ ] `supabase/functions/gemini-chat/index.ts` 支持文本/音频输入、会话管理、消息持久化、流式响应
- [ ] `src/services/supabaseService.ts` 增加聊天相关函数
- [ ] `src/types.ts` 补充聊天类型（如需）
- [ ] 手动/自动测试通过（含流式与音频）
- [ ] 代码已提交到 `feature/chat-backend` 分支

---

## 📢 完成后通知模板

在项目根目录创建 `WINDOW_3_DONE.txt`，内容：

```
🎉 窗口3已完成聊天后端功能

✅ 产出物：
- supabase/functions/gemini-chat/index.ts（含流式/音频/会话持久化）
- src/services/supabaseService.ts（聊天 API）
- src/types.ts（聊天类型，若有更新）

🧪 功能验证：
- 文本/音频消息可发送与持久化
- 会话可复用，历史能带入
- 流式响应正常

📌 注意事项：
- 依赖 .env.local 与 Supabase 项目配置
- 前端可直接调用 Edge Function 获取流式回复
```

---

## ❓ 常见问题

**Q1: 收到 401/403？**
A: 检查 `Authorization` 使用 anon key，确保 Edge Function 权限未锁死；确认 `SUPABASE_SERVICE_ROLE_KEY` 在函数环境变量中存在。

**Q2: 流式响应只返回一次？**
A: 确认 Gemini 使用 stream 接口；检查 `ReadableStream` 是否正确 pipe/flush；避免在首包提前 `return`。

**Q3: 会话未创建/重复创建？**
A: 确认无 `sessionId` 时才新建；落库后返回新 `sessionId` 并在前端缓存使用。

**Q4: 音频无法转写？**
A: 检查音频 base64 是否正确；若未集成真实转写接口，先用占位转写并在 TODO 备注。

**Q5: 消息顺序错乱？**
A: 查询与插入时使用 `created_at`，并在前端按时间排序；确保时区一致（ISO 字符串）。

---

## 🔗 参考资料

- Supabase Functions：https://supabase.com/docs/guides/functions
- Supabase JS 客户端：https://supabase.com/docs/reference/javascript/introduction
- Gemini Streaming API（REST）：https://ai.google.dev/docs/api/streaming
- Deno ReadableStream 文档：https://deno.land/manual/runtime/streams

---

**准备好了吗？开始完善聊天后端吧！🚀**
