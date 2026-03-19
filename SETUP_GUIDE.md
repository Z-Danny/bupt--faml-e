# Famlée 快速配置指南

> 本指南帮助你在 10 分钟内完成 Supabase 后端配置

## 📋 配置清单

- [ ] 创建 Supabase 项目
- [ ] 执行数据库 SQL 脚本
- [ ] 创建 Storage buckets
- [ ] 配置环境变量
- [ ] 验证配置

---

## 第一步：创建 Supabase 项目（3分钟）

### 1.1 访问 Supabase
打开浏览器访问：https://supabase.com

### 1.2 登录
- 点击右上角 "Sign in"
- 使用 GitHub 账号登录（推荐）

### 1.3 创建项目
点击 "New Project"，填写以下信息：

| 字段 | 填写内容 | 说明 |
|------|---------|------|
| Organization | 选择或创建 | 组织名称 |
| Name | `famlee-backend` | 项目名称 |
| Database Password | 设置强密码 | **务必记住！** |
| Region | `Northeast Asia (Tokyo)` | 选择最近的区域 |
| Pricing Plan | Free | 免费计划 |

点击 "Create new project"，等待 2-3 分钟初始化。

### 1.4 获取 API 密钥
项目创建完成后：
1. 点击左侧 "Settings" → "API"
2. 复制以下信息（保存到记事本）：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...`（很长的字符串）

---

## 第二步：创建数据库表（2分钟）

### 2.1 打开 SQL Editor
在 Supabase Dashboard 左侧点击 "SQL Editor"

### 2.2 执行 SQL 脚本
1. 点击 "New query"
2. 打开本地文件：`supabase/migrations/001_initial_schema.sql`
3. 复制全部内容
4. 粘贴到 SQL Editor
5. 点击右下角绿色 "Run" 按钮

### 2.3 验证表创建
1. 点击左侧 "Table Editor"
2. 应该看到 3 张表：
   - ✅ `journals` - 日记表
   - ✅ `chat_sessions` - 聊天会话表
   - ✅ `chat_messages` - 聊天消息表

---

## 第三步：创建 Storage Buckets（2分钟）

### 3.1 打开 Storage
点击左侧 "Storage"

### 3.2 创建图片存储桶
1. 点击 "Create a new bucket"
2. 填写：
   - **Name**: `journal-images`
   - **Public bucket**: ✅ 勾选
3. 点击 "Create bucket"

### 3.3 创建音频存储桶
1. 再次点击 "Create a new bucket"
2. 填写：
   - **Name**: `journal-audio`
   - **Public bucket**: ✅ 勾选
3. 点击 "Create bucket"

### 3.4 验证
在 Storage 页面应该看到 2 个 buckets：
- ✅ `journal-images`
- ✅ `journal-audio`

---

## 第四步：配置环境变量（2分钟）

### 4.1 编辑 .env.local 文件
打开项目根目录的 `.env.local` 文件，替换以下内容：

```env
# 替换为你的 Supabase 项目 URL
VITE_SUPABASE_URL=https://xxxxx.supabase.co

# 替换为你的 anon key
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# 保持你现有的 Gemini API Key
VITE_GEMINI_API_KEY=你的真实API_Key
```

### 4.2 保存文件
按 `Ctrl + S` 保存

---

## 第五步：验证配置（1分钟）

### 5.1 重启开发服务器
```bash
# 如果服务器正在运行，先停止（Ctrl + C）
npm run dev
```

### 5.2 检查控制台
确保没有环境变量相关的错误

### 5.3 测试连接
打开浏览器控制台（F12），执行：
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
```
应该输出你的 Supabase URL

---

## ✅ 配置完成！

现在你可以：
1. 查看窗口2任务文档：`docs/tasks/WINDOW_2_JOURNAL_PERSISTENCE.md`
2. 查看窗口3任务文档：`docs/tasks/WINDOW_3_CHAT_BACKEND.md`
3. 开始并行开发

---

## 🐛 常见问题

### Q1: 找不到 .env.local 文件
**A**: 文件已创建在项目根目录 `D:\ai\famlée\.env.local`，如果看不到，确保显示隐藏文件。

### Q2: SQL 执行失败
**A**:
- 检查是否完整复制了 SQL 脚本
- 确保没有重复执行（表已存在会报错）
- 如果表已存在，可以先删除再重新执行

### Q3: Storage bucket 创建失败
**A**:
- 确保 bucket 名称唯一
- 检查是否已存在同名 bucket
- 刷新页面重试

### Q4: 环境变量不生效
**A**:
- 确保文件名是 `.env.local`（不是 `.env.local.txt`）
- 修改后需要重启开发服务器
- 检查变量名是否以 `VITE_` 开头

---

## 📚 下一步

配置完成后，查看：
- [并行开发指南](docs/PARALLEL_DEVELOPMENT.md)
- [用户操作手册](docs/USER_MANUAL.md)
- [窗口任务文档](docs/tasks/)

---

**祝配置顺利！🎉**
