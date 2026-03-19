# 窗口1任务：后端基础设施搭建

> **分支**：`feature/backend-setup`
> **优先级**：P0（最高，其他窗口依赖）
> **预计时间**：4-6小时
> **角色**：用户手动操作 + Claude Code辅助

---

## 🎯 任务目标

1. 创建Supabase项目并配置
2. 设计并创建数据库表
3. 配置文件存储（Storage）
4. 生成Edge Function骨架
5. 配置环境变量

---

## 📋 任务清单

### 阶段1：Supabase项目创建（30分钟，手动操作）

#### 1.1 注册并创建项目
- [ ] 访问 https://supabase.com
- [ ] 使用GitHub账号登录
- [ ] 点击 "New Project"
- [ ] 填写项目信息：
  - **Organization**: 选择或创建
  - **Name**: `famlee-backend`
  - **Database Password**: 设置强密码（记住！）
  - **Region**: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`
  - **Pricing Plan**: Free
- [ ] 点击 "Create new project"
- [ ] 等待2-3分钟初始化完成

#### 1.2 获取API凭证
- [ ] 进入项目Dashboard
- [ ] 点击左侧 "Settings" → "API"
- [ ] 复制以下信息到记事本：
  ```
  Project URL: https://xxxxx.supabase.co
  anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

#### 1.3 配置本地环境变量
- [ ] 在项目根目录创建 `.env.local` 文件
- [ ] 添加以下内容（替换为实际值）：
  ```env
  VITE_SUPABASE_URL=https://xxxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  VITE_GEMINI_API_KEY=你现有的Gemini API Key
  ```

---

### 阶段2：数据库设计（30分钟，CC辅助）

#### 2.1 让CC生成数据库迁移脚本

**提示词**：
```
请根据以下需求生成Supabase数据库迁移脚本：

需求：
1. journals表：存储用户日记
   - id (UUID, 主键)
   - user_id (VARCHAR(255), 用户ID)
   - content (TEXT, 日记内容)
   - summary (TEXT, AI生成的总结)
   - mood (VARCHAR(20), 心情：NEUTRAL/HAPPY/ANXIOUS/SAD/ANGRY)
   - images (TEXT[], 图片URL数组)
   - audio_url (TEXT, 音频URL)
   - created_at (TIMESTAMP, 创建时间)
   - 索引：(user_id, created_at DESC)

2. chat_sessions表：存储聊天会话
   - id (UUID, 主键)
   - user_id (VARCHAR(255), 用户ID)
   - persona (VARCHAR(20), 角色：healing/rational/fun)
   - created_at (TIMESTAMP, 创建时间)

3. chat_messages表：存储聊天消息
   - id (UUID, 主键)
   - session_id (UUID, 外键关联chat_sessions)
   - role (VARCHAR(10), 角色：user/model)
   - content (TEXT, 消息内容)
   - mood_detected (VARCHAR(20), 检测到的心情)
   - created_at (TIMESTAMP, 创建时间)
   - 索引：(session_id, created_at)

请生成完整的SQL脚本，保存到 supabase/migrations/001_initial_schema.sql
```

#### 2.2 执行数据库迁移（手动操作）
- [ ] 等待CC生成SQL脚本
- [ ] 在Supabase Dashboard中：
  - 点击左侧 "SQL Editor"
  - 点击 "New query"
  - 粘贴生成的SQL脚本
  - 点击 "Run" 执行
- [ ] 验证表创建成功：
  - 点击左侧 "Table Editor"
  - 应该看到3张表：`journals`, `chat_sessions`, `chat_messages`

---

### 阶段3：配置Storage（10分钟，手动操作）

#### 3.1 创建Storage Buckets
- [ ] 在Supabase Dashboard中点击左侧 "Storage"
- [ ] 点击 "Create a new bucket"
- [ ] 创建第一个bucket：
  - **Name**: `journal-images`
  - **Public bucket**: ✅ 勾选
  - 点击 "Create bucket"
- [ ] 创建第二个bucket：
  - **Name**: `journal-audio`
  - **Public bucket**: ✅ 勾选
  - 点击 "Create bucket"

#### 3.2 配置访问策略（可选）
- [ ] 点击bucket名称进入详情
- [ ] 点击 "Policies" 标签
- [ ] 默认策略已允许公开读取，无需额外配置

---

### 阶段4：生成Edge Function骨架（1小时，CC辅助）

#### 4.1 让CC生成Edge Function代码

**提示词**：
```
请生成Supabase Edge Function代码，用于代理Gemini API调用。

需求：
1. 函数名：gemini-chat
2. 功能：
   - 接收前端请求（message, persona, sessionId, isAudio, audioData）
   - 调用Gemini API（使用环境变量中的API Key）
   - 支持文本和音频输入
   - 根据persona加载不同的系统指令
   - 保存消息到chat_messages表
   - 返回AI回复

3. 技术要求：
   - 使用Deno运行时
   - 使用Supabase客户端操作数据库
   - 使用fetch调用Gemini REST API
   - 添加错误处理

请生成以下文件：
- supabase/functions/gemini-chat/index.ts
- supabase/functions/gemini-chat/deno.json（依赖配置）

参考现有的persona配置：
- src/constants.ts中的PERSONAS数组
```

#### 4.2 创建Edge Function配置文件

**提示词**：
```
请创建Supabase Edge Function的配置文件：
- supabase/config.toml（Supabase项目配置）
```

---

### 阶段5：部署Edge Function（20分钟，手动操作）

#### 5.1 安装Supabase CLI
```bash
npm install -g supabase
```

#### 5.2 登录Supabase
```bash
supabase login
```
- [ ] 会打开浏览器，点击 "Authorize" 授权CLI访问

#### 5.3 关联项目
```bash
supabase link --project-ref xxxxx
```
- [ ] `project-ref` 在Dashboard URL中：`https://supabase.com/dashboard/project/[project-ref]`
- [ ] 输入数据库密码（创建项目时设置的）

#### 5.4 部署Edge Function
```bash
supabase functions deploy gemini-chat
```
- [ ] 等待部署完成
- [ ] 记录Function URL：`https://xxxxx.supabase.co/functions/v1/gemini-chat`

#### 5.5 配置环境变量
```bash
supabase secrets set GEMINI_API_KEY=你的Gemini_API_Key
```

#### 5.6 测试Edge Function
```bash
curl -X POST \
  https://xxxxx.supabase.co/functions/v1/gemini-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "你好", "persona": "rational", "sessionId": "test-session"}'
```
- [ ] 应该返回AI回复

---

### 阶段6：生成配置文档（30分钟，CC辅助）

#### 6.1 让CC生成环境变量模板

**提示词**：
```
请创建环境变量模板文件 .env.example，包含：
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_GEMINI_API_KEY

并添加详细注释说明每个变量的用途和获取方式。
```

#### 6.2 让CC生成Supabase配置文档

**提示词**：
```
请创建Supabase配置文档 docs/supabase-setup.md，包含：
1. 项目创建步骤
2. 数据库表结构说明
3. Storage配置说明
4. Edge Function部署步骤
5. 环境变量配置说明
6. 常见问题解答

使用清晰的Markdown格式，包含截图说明（用文字描述截图内容）。
```

---

## ✅ 完成标志

当以下所有项都完成时，窗口1任务完成：

- [ ] Supabase项目已创建并可访问
- [ ] 数据库表已创建（journals, chat_sessions, chat_messages）
- [ ] Storage buckets已创建（journal-images, journal-audio）
- [ ] Edge Function已部署并可调用
- [ ] `.env.local` 已配置
- [ ] `.env.example` 已创建
- [ ] `docs/supabase-setup.md` 已创建
- [ ] 所有文件已提交到 `feature/backend-setup` 分支

---

## 📢 完成后通知其他窗口

在项目根目录创建 `WINDOW_1_DONE.txt` 文件，内容如下：

```
✅ 窗口1已完成后端基础设施搭建

📋 产出物：
- Supabase项目：https://xxxxx.supabase.co
- 数据库表：journals, chat_sessions, chat_messages
- Storage buckets：journal-images, journal-audio
- Edge Function：gemini-chat

📢 窗口2和窗口3可以开始开发了！

🔗 关键信息：
- SUPABASE_URL: https://xxxxx.supabase.co
- Edge Function URL: https://xxxxx.supabase.co/functions/v1/gemini-chat

📝 注意事项：
- 所有窗口使用相同的 .env.local 文件
- supabaseClient.ts 由窗口2创建，窗口3和4复用
- 遇到问题查看 docs/supabase-setup.md
```

---

## 🐛 常见问题

### Q1: Supabase项目创建失败
**A**: 检查网络连接，确保可以访问supabase.com。如果在国内，可能需要使用代理。

### Q2: 数据库迁移执行失败
**A**: 检查SQL语法是否正确，确保没有重复创建表。可以先删除已存在的表再重新执行。

### Q3: Edge Function部署失败
**A**:
1. 检查Supabase CLI是否已登录：`supabase projects list`
2. 检查项目是否已关联：`supabase status`
3. 检查函数代码是否有语法错误

### Q4: Edge Function调用返回401错误
**A**: 检查Authorization header中的token是否正确，应该使用anon key而非service_role key。

### Q5: Gemini API调用失败
**A**:
1. 检查环境变量是否已设置：`supabase secrets list`
2. 检查API Key是否有效
3. 查看Edge Function日志：`supabase functions logs gemini-chat`

---

## 📚 参考资料

- [Supabase快速开始](https://supabase.com/docs/guides/getting-started)
- [Supabase Edge Functions文档](https://supabase.com/docs/guides/functions)
- [Gemini API文档](https://ai.google.dev/docs)
- [Deno运行时文档](https://deno.land/manual)

---

## 🔄 下一步

完成本窗口任务后：
1. 提交代码到 `feature/backend-setup` 分支
2. 推送到远程仓库
3. 创建 `WINDOW_1_DONE.txt` 通知文件
4. 通知窗口2和窗口3开始开发
5. 监控窗口2和3的进度，提供支持

---

**准备好了吗？开始搭建后端基础设施吧！🚀**
