# AI Agent Skill Framework

本文档记录 Famlée 当前 AI 人格对话从“persona prompt 直连模型”升级为“Agent + Skill Pipeline”的实现。

## 背景

原实现中，AI 回复主要由后端 `PERSONA_PROMPTS` 决定：

```text
Chat.tsx -> streamChat() -> /api/ai/chat -> PERSONA_PROMPTS[persona] -> Doubao SSE
```

这种方式可以区分人格风格，但无法稳定表达：

- 情绪识别
- 安全保护
- 隐私保护
- 策略路由
- 长期反思闭环

因此本次改造把聊天回复生成改为后端 Agent Pipeline。

## 当前框架

```text
多模态输入（文字 / 图片 / 后续语音 / 日记上下文）
  -> 情绪识别 Skill
  -> 安全保护 Skill
  -> 隐私保护 Skill
  -> 心理支持策略路由
  -> Agent 人格约束
  -> 长期反思上下文
  -> Doubao / Ark SSE 回复
  -> metadata / emotion_events 落库
```

## 新增模块

### Agent 定义

文件：`server/ai/agents.js`

当前支持：

| Agent | 方法 | 默认 Skill | 说明 |
|---|---|---|---|
| `healing` | ACT 接纳承诺疗法 | `act_acceptance` | 温暖、接纳、先稳定情绪 |
| `rational` | CBT 认知行为疗法 | `cbt_reframe` | 冷静、客观、认知梳理 |
| `fun` | 轻量缓冲与幽默重构 | `humor_buffer` | 善意幽默，只调侃处境不调侃用户 |

### Pipeline

文件：`server/ai/pipeline.js`

职责：

- 选择 Agent
- 执行情绪识别
- 执行安全检测
- 执行隐私脱敏
- 选择心理支持策略 Skill
- 组合 system prompt
- 处理图片输入
- 生成 metadata

### 情绪识别 Skill

文件：`server/ai/skills/emotionRecognition.js`

当前用规则识别：

- `ANXIOUS`
- `SAD`
- `ANGRY`
- `HAPPY`
- `NEUTRAL`

同时生成：

- `tags`
- `summary`
- `riskSignals`
- `modality`

### 安全保护 Skill

文件：`server/ai/skills/safetyGuard.js`

当前支持：

- `low`
- `elevated`
- `crisis`

当识别到危机表达时，不再进入普通人格或幽默策略，而是直接返回危机支持回复。

### 隐私保护 Skill

文件：`server/ai/skills/privacyGuard.js`

当前支持基础脱敏：

- 邮箱
- 中国大陆手机号
- 身份证号
- 学号
- 微信 / QQ 标识

脱敏后的文本会送入模型，原文仍按用户消息保存。

### 心理支持策略 Skill

文件：`server/ai/skills/strategySkills.js`

当前支持：

| Skill | 作用 |
|---|---|
| `empathic_support` | 共情承接 |
| `cbt_reframe` | CBT 认知梳理 |
| `thought_record` | 自动想法记录 |
| `evidence_check` | 证据检验 |
| `act_acceptance` | ACT 情绪接纳 |
| `humor_buffer` | 轻量幽默缓冲 |
| `breathing` | 正念呼吸 |
| `values_clarification` | 价值澄清 |
| `personality_reflection` | MBTI / 性格轻量反思 |

### 策略路由

文件：`server/ai/skills/strategyRouter.js`

路由优先级：

1. 高风险内容优先进入共情和稳定支持。
2. 前端显式传入 `skillId` 时优先使用。
3. 工具按钮 `toolName` 映射到对应 Skill。
4. 根据情绪标签自动选择策略。
5. 回退到 Agent 默认 Skill。

### 长期反思模块

文件：`server/ai/longReflection.js`

当前会读取：

- 近期日记
- 近期 `emotion_events`

并生成轻量上下文给模型。该上下文只作为理解背景，不要求模型直接暴露给用户。

## 后端接口改动

文件：`server/index.js`

`POST /api/ai/chat` 从直接构建 prompt 改为：

```text
load history
load recent support context
runSupportPipeline()
save user message + metadata
record emotion event
if crisis -> direct SSE response
else -> call Doubao stream
save model message + metadata
```

SSE payload 现在会带 `metadata`：

```json
{
  "content": "...",
  "done": false,
  "sessionId": "...",
  "metadata": {
    "agent": {},
    "emotion": {},
    "safety": {},
    "privacy": {},
    "route": {}
  }
}
```

## 数据库改动

文件：`server/schema.sql`

新增：

```sql
alter table chat_messages
add column if not exists metadata jsonb;

create table if not exists emotion_events (...);
create table if not exists user_reflections (...);
```

用途：

- `chat_messages.metadata`: 保存每条消息对应的 Agent/Skill 运行结果。
- `emotion_events`: 支撑情绪日历、趋势画像。
- `user_reflections`: 支撑阶段总结、长期反思。

## 前端改动

### 结构化 Skill 传参

文件：`src/pages/Chat.tsx`

工具按钮现在映射到 `skillId`：

```ts
const TOOL_SKILL_IDS = {
  '正念呼吸': 'breathing',
  '情绪接纳': 'act_acceptance',
  '价值确认': 'values_clarification',
  '捕捉负面想法': 'thought_record',
  'CBT 引导': 'cbt_reframe',
  '逆向思考': 'evidence_check',
  '毒舌锐评': 'humor_buffer',
  'MBTI 速测': 'personality_reflection',
  '一键发疯': 'humor_buffer',
};
```

### streamChat 参数

文件：`src/services/geminiService.ts`

新增：

- `skillId`
- `toolName`

后端据此进行 Skill 路由。

## 参考来源

本项目没有直接复制第三方代码，而是参考其设计思路后实现为项目内模块。

| 来源 | 用途 |
|---|---|
| `joebwd/mental-wellness-prompts` | 心理支持 prompt、CBT/ACT/危机干预等策略设计参考 |
| `FreedomIntelligence/OpenClaw-Medical-Skills` | 危机识别和医疗/心理安全 Skill 思路 |
| `glebis/claude-skills` | CBT/DBT cognitive toolkit 的 Skill 结构参考 |
| `microsoft/presidio` | PII 检测、脱敏、隐私保护思路 |
| `CBT-LLM` paper | 中文 CBT 对话结构参考 |
| Hugging Face emotion classifiers | 情绪分类标签设计参考 |

## 验证

已执行：

```bash
npm run build
node --check server/index.js
node --check server/ai/pipeline.js
```

Pipeline smoke test：

```text
输入：“我很焦虑，怕考试挂科”
结果：emotion=ANXIOUS, skill=cbt_reframe

输入：“我不想活了”
结果：risk=crisis, skill=crisis_triage, directResponse=true
```

## 后续建议

- 把规则情绪识别替换或增强为 Hugging Face 分类模型。
- 把隐私保护替换或增强为 Presidio 服务。
- 为 `emotion_events` 增加前端趋势画像展示。
- 定期生成 `user_reflections` 周总结/月总结。
- 为语音输入增加 STT 后接入同一 Pipeline。
