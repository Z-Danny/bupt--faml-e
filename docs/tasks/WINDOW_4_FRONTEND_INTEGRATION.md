# 窗口4任务：前端集成

> **分支**：`feature/frontend-integration`
> **优先级**：P1（依赖窗口2、窗口3完成）
> **预计时间**：6-8小时
> **角色**：Claude Code主力开发

---

## 🧭 任务目标

1. 集成窗口2的日记持久化与窗口3的聊天后端到前端
2. 重构聊天服务层为调用 Edge Function
3. 前端支持流式聊天、历史加载与会话管理
4. 移除模拟数据与本地假数据状态

---

## ✅ 开始前检查

**必须等待窗口2与窗口3完成以下任务**：
- [ ] 存在 `WINDOW_2_DONE.txt` 与 `WINDOW_3_DONE.txt`
- [ ] `supabase/functions/gemini-chat/index.ts` 支持流式/会话/音频
- [ ] `src/services/supabaseService.ts` 暴露聊天 API（createChatSession/listChatSessions/fetchMessages/sendMessageViaEdge）
- [ ] `.env.local` 已配置（含 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`）
- [ ] `src/lib/supabaseClient.ts` 可用（含 `getUserId`）

**未满足请等待！**

---

## 📋 任务清单

### 阶段1：重构聊天服务层（1.5小时）
文件：`src/services/geminiService.ts`

**目标**：废弃本地mock，改为调用 Edge Function，支持流式读取、会话与persona透传。

**实现要点**：
```typescript
// src/services/geminiService.ts
import { getUserId } from '../lib/supabaseClient';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-chat`;
const AUTH_HEADER = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;

export interface StreamChunk {
  text: string;
  done: boolean;
  sessionId?: string; // 首包可携带
}

// 发送并流式读取
export const streamChat = async (params: {
  message: string;
  persona: string;
  sessionId?: string;
  isAudio?: boolean;
  audioData?: string; // base64
  onChunk: (chunk: StreamChunk) => void;
}) => {
  const body = JSON.stringify({
    ...params,
    userId: getUserId(), // 若后端需要可透传
  });

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: AUTH_HEADER,
    },
    body,
  });

  if (!res.body) throw new Error('Streaming not supported');
  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');

  // 首包可从 header 或首个 chunk 解析 sessionId
  const sessionIdHeader = res.headers.get('x-session-id');
  if (sessionIdHeader) params.onChunk({ text: '', done: false, sessionId: sessionIdHeader });

  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // 按换行分片（后端若是 NDJSON）
    const parts = buffer.split('\n');
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      if (!part.trim()) continue;
      params.onChunk({ text: part, done: false });
    }
  }
  if (buffer.trim()) params.onChunk({ text: buffer, done: false });
  params.onChunk({ text: '', done: true });
};
```

**检查清单**：
- [ ] 不再直接调用 Gemini SDK，本地只负责 HTTP 调用 Edge Function
- [ ] 支持 `persona`、`sessionId`、音频透传
- [ ] 流式消费通过 `ReadableStream` + `TextDecoder`
- [ ] 错误抛出清晰，便于前端提示

---

### 阶段2：改造 Chat 页面（2.5小时）
文件：`src/pages/Chat.tsx`

**目标**：使用新的聊天 API，支持流式渲染、会话管理与历史加载。

**实现要点**：
- 状态新增：
  ```typescript
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [persona, setPersona] = useState<'healing' | 'rational' | 'fun'>('healing');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingText, setPendingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  ```
- 加载历史：
  ```typescript
  useEffect(() => {
    const init = async () => {
      try {
        // 可从localStorage取最近sessionId
        const cached = localStorage.getItem('famlee_last_session');
        if (cached) {
          setSessionId(cached);
          const history = await fetchMessages(cached);
          setMessages(history);
        }
      } catch (e) {
        setError('加载历史失败');
      }
    };
    init();
  }, []);
  ```
- 发送消息 & 流式展示：
  ```typescript
  const handleSend = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setError(null);
    setIsStreaming(true);
    setPendingText('');
    const nextMessages = [...messages, { role: 'user', content: text, session_id: sessionId ?? '', id: crypto.randomUUID(), created_at: new Date().toISOString() }];
    setMessages(nextMessages);

    await streamChat({
      message: text,
      persona,
      sessionId: sessionId ?? undefined,
      onChunk: ({ text: chunk, done, sessionId: sid }) => {
        if (sid && !sessionId) {
          setSessionId(sid);
          localStorage.setItem('famlee_last_session', sid);
        }
        setPendingText((prev) => prev + chunk);
        if (done) {
          setMessages((prev) => [
            ...prev,
            { role: 'model', content: pendingText + chunk, session_id: sid ?? sessionId ?? '', id: crypto.randomUUID(), created_at: new Date().toISOString() },
          ]);
          setPendingText('');
          setIsStreaming(false);
        }
      },
    }).catch((e) => {
      console.error(e);
      setError('发送失败，请重试');
      setIsStreaming(false);
      setPendingText('');
    });
  };
  ```
- UI 要点：
  - 聊天列表渲染 `messages`，追加一个"正在输入"气泡显示 `pendingText`
  - Persona 切换后可创建新会话或提示用户
  - 禁用发送按钮：`disabled={isStreaming}`
  - 错误条提示 + 重试按钮

**检查清单**：
- [ ] 首次无 `sessionId` 时由后端创建，并缓存（localStorage）
- [ ] 历史消息按时间排序显示
- [ ] 流式分片实时渲染，结束后合并为完整AI消息
- [ ] 音频消息入口复用相同流式流程（若已存在录音功能则调用 `streamChat` with `isAudio`）

---

### 阶段3：修改 App.tsx（45分钟）
文件：`src/App.tsx`

**目标**：移除模拟数据与本地状态，改为依赖真实 API。

**修改要点**：
- 删除 `generateMockEntries()`、`useState` 的假数据存储
- Calendar/Journal 相关组件仅作为路由渲染，不再传递本地 mock props：
  ```tsx
  // 修改前
  <CalendarPage journalEntries={journalEntries} />
  // 修改后
  <CalendarPage />
  ```
- 若有全局上下文存储聊天状态，重构为依赖 Supabase/Edge 数据，避免与窗口2/3逻辑冲突
- 确保 `.env.local` 变量被使用，无硬编码 URL/KEY

**检查清单**：
- [ ] 应用启动不再依赖 mock 数据
- [ ] 路由切换后各页面自行加载远端数据
- [ ] 移除未使用的模拟工具/类型/导入

---

### 阶段4：会话管理与历史加载完善（45分钟）
- 在 Chat 页面或独立 hook 中支持：
  - 列表展示现有会话（调用 `listChatSessions`）
  - 切换会话时加载 `fetchMessages(sessionId)`
  - 新建会话时写入 persona，并更新缓存
- 若 UI 有会话侧边栏：确保
  - 当前会话高亮
  - 切换时清理 `pendingText` 与 `isStreaming`
  - Persona 与会话 persona 同步显示

---

### 阶段5：流式响应前端处理细节（30分钟）
- 解析流格式：若后端使用 NDJSON/`data:` 事件，按行分割；如使用 chunk JSON，需 `JSON.parse` 后取 `delta`
- 处理异常：
  - `res.ok` 校验，非200提示错误
  - 超时/中断时重置 `isStreaming`，允许重发
- 性能：
  - 使用 `requestAnimationFrame` 或批量追加，避免过度 setState（可选）

---

### 阶段6：清理与注释（15分钟）
- 移除遗留 mock / console.log（保留必要错误日志）
- 为复杂流处理代码添加简短注释
- 确保类型定义（`ChatMessage`/`ChatSession`）已引用窗口3的 `src/types.ts`

---

## 🧪 测试清单（端到端）

- [ ] **测试1：新建会话并发送文本**
  - 进入聊天页，选择 persona，输入文本
  - 期望：自动创建会话，流式显示回复，最终消息落库
- [ ] **测试2：切换会话加载历史**
  - 使用已有会话切换，历史按时间顺序展示
  - 期望：无重复/漏条，最新会话标记
- [ ] **测试3：流式中断恢复**
  - 发送时刷新或切换会话
  - 期望：UI恢复正常，可继续发送，不残留 pending 状态
- [ ] **测试4：错误处理**
  - 断网后发送
  - 期望：提示"发送失败"，按钮恢复可用
- [ ] **测试5：persona 切换**
  - 切换 persona 后发送
  - 期望：新会话使用新 persona，历史保持隔离
- [ ] **测试6：历史加载回放**
  - 刷新页面后自动加载最近会话
  - 期望：展示历史记录，首屏无空白闪烁
- [ ] **测试7：音频（如有录音功能）**
  - 录音发送
  - 期望：转写文本进入对话，流式回复正常

---

## 🏁 完成标志

- [ ] `src/services/geminiService.ts` 已重构为 Edge Function 调用（含流式）
- [ ] `src/pages/Chat.tsx` 使用新服务并支持会话/历史/流式
- [ ] `src/App.tsx` 移除模拟数据，本地状态仅保留必要 UI 状态
- [ ] 会话管理与历史加载可用
- [ ] 测试清单通过
- [ ] 代码提交到 `feature/frontend-integration` 分支

---

## 📣 完成后通知模板

在项目根目录创建 `WINDOW_4_DONE.txt`，内容：

```
✅ 窗口4已完成前端集成

📦 产出物：
- src/services/geminiService.ts（Edge Function 流式调用）
- src/pages/Chat.tsx（流式聊天、会话管理、历史加载）
- src/App.tsx（移除模拟数据）

🧪 功能验证：
- 流式聊天正常，自动创建/切换会话
- 历史消息加载正确
- persona 切换可用

⚠️ 注意事项：
- 依赖 .env.local 与 Supabase Edge Function URL
- 若流格式调整，请同步修改前端解析逻辑
```

---

## ❓ 常见问题

**Q1: 收到 401/403？**
A: 检查 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 是否正确，Edge Function 权限是否允许匿名调用。

**Q2: 首包没有 sessionId？**
A: 后端需在 header 或首个 chunk 返回 `sessionId`；前端已兼容 header/首包，两者都缺失需协调窗口3补充。

**Q3: 流式显示卡顿/字符拆分？**
A: 确认后端分隔符（建议换行/NDJSON）。如 chunk 过小，可在前端累积到一定长度再 setState。

**Q4: 历史重复或顺序错乱？**
A: 拉取后按 `created_at` 升序排序；前端不要将 pending 文本写入 messages，以免重复。

**Q5: persona 不生效？**
A: 新 persona 需新建会话；旧会话切换 persona 会导致上下文混用，请在 UI 上提示并创建新会话。

---

## 🔗 参考资料

- Supabase JS 客户端：https://supabase.com/docs/reference/javascript/introduction
- Fetch API Streams：https://developer.mozilla.org/en-US/docs/Web/API/Streams_API
- React Hooks 最佳实践：https://react.dev/reference/react

---

**准备好了吗？开始前端集成吧！🚀**
