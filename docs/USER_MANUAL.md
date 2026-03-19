# Supabase 项目用户操作手册

## 1. 前言
欢迎使用本手册！😊 这里将带你从零开始配置 Supabase 项目，并覆盖数据库、存储、Edge Function、环境变量等关键步骤。每一步都包含预期结果、注意事项与小贴士，帮助你顺利完成。

## 2. 创建 Supabase 项目（详细步骤）
1) 登录与新建项目
   - 访问 https://app.supabase.com 并登录（如无账号先注册）。
   - 点击 "New project" ➜ 选择组织或创建新组织。
   - 预期结果：出现项目名称、数据库密码等创建表单。
   - 注意：数据库密码请安全保存，后续连接必用。🔒
2) 填写项目信息
   - Project name：填写项目名；Database password：设置强密码；Region：选择就近区域。
   - 预期结果：可点击 "Create new project"。
   - 小贴士：区域越近，延迟越低。
3) 创建项目与初始化
   - 点击 "Create new project"，等待初始化。
   - 预期结果：进入项目 Dashboard，左侧导航可见 Table Editor / Authentication / Storage / Edge Functions 等。
   - 注意：初始化需数十秒，请耐心等待。⏳
4) 获取 API Keys
   - 在 Dashboard ➜ Settings ➜ API 查看 `anon` 与 `service_role` keys。
   - 预期结果：看到 `Project URL`、`anon key`、`service_role key`。
   - 注意：`service_role` 仅在安全后端使用，勿暴露到前端。

## 3. 数据库表创建步骤
1) 打开 Table Editor
   - 左侧导航 ➜ Table Editor ➜ "Create a new table"。
   - 预期结果：弹出新表配置对话框。
2) 配置表结构
   - Table name：如 `profiles`。
   - 添加列：`id` (uuid, primary key, default `gen_random_uuid()`), `created_at` (timestamp, default `now()`), 业务列（如 `full_name` text, `avatar_url` text）。
   - 预期结果：列清单显示主键与默认值。
   - 注意：勾选 "Enable Row Level Security (RLS)" 后再配置策略。
3) 保存并检查
   - 点击 "Save"。
   - 预期结果：表创建成功，可看到数据网格。
   - 小贴士：使用 "Insert row" 可手动添加样例数据验证。

## 4. Storage 配置步骤
1) 进入 Storage
   - 左侧导航 ➜ Storage ➜ "Create a new bucket"。
   - 预期结果：弹出创建 bucket 对话框。
2) 创建 Bucket
   - Bucket name：如 `public-files`；选择 Public 或 Private（推荐 Private）。
   - 预期结果：新 bucket 出现在列表。
   - 注意：Private 需通过签名 URL 访问，更安全。🔐
3) 上传与访问
   - 进入 bucket ➜ "Upload file" 选择文件。
   - 预期结果：文件列表出现上传项，可复制文件路径。
   - 小贴士：使用 Edge Function 或后端 SDK 生成签名 URL 提供下载链接。

## 5. Edge Function 部署步骤
1) 安装 Supabase CLI（本地）
   - 确保已安装 Node.js；执行 `npm i -g supabase`。
   - 预期结果：命令 `supabase --version` 可正常输出。
2) 初始化函数项目
   - 在本地项目根目录：`supabase functions new hello-world`。
   - 预期结果：生成 `supabase/functions/hello-world/index.ts` 等文件。
   - 小贴士：函数逻辑写在 `index.ts`，导出默认 `serve`。
3) 本地调试
   - 运行 `supabase functions serve --env-file .env.local`。
   - 预期结果：本地监听端口（默认 54321），可用 HTTP 请求测试。
   - 注意：需在 `.env.local` 中配置 `SUPABASE_URL` 与 `SUPABASE_SERVICE_ROLE_KEY`。
4) 部署到 Supabase
   - 登录：`supabase login` ➜ 粘贴 Access Token（在 Supabase Dashboard ➜ Account Settings ➜ Access Tokens）。
   - 部署：`supabase functions deploy hello-world`。
   - 预期结果：Dashboard ➜ Edge Functions 可看到已部署函数。🚀
5) 配置函数 URL
   - Dashboard ➜ Edge Functions ➜ 选择函数，复制 Invoke URL。
   - 注意：调用时需 `Authorization: Bearer <anon or service_role>` 视安全策略而定。

## 6. 环境变量配置
1) 获取必要变量
   - `SUPABASE_URL`、`SUPABASE_ANON_KEY`：Dashboard ➜ Settings ➜ API。
   - 如需服务端调用，使用 `SUPABASE_SERVICE_ROLE_KEY`（仅后端保存）。
2) 本地开发
   - 在项目根创建 `.env.local`：
     - `SUPABASE_URL=...`
     - `SUPABASE_ANON_KEY=...`
     - `SUPABASE_SERVICE_ROLE_KEY=...` (后端或 Edge Function 使用)
   - 预期结果：应用启动时可读取这些变量。
3) 生产环境
   - 在部署平台（如 Vercel/Netlify）配置同名环境变量。
   - 注意：永远不要在前端代码里硬编码 service_role。⚠️

## 7. 常见问题解答 (FAQ)
- Q: 前端请求 401/403？
  A: 检查是否使用 `anon key`，确保请求域名与 Dashboard 中的 "Auth Settings ➜ Redirect URLs" 相匹配；确认 RLS 策略允许该操作。
- Q: RLS 后查不到数据？
  A: 确认已创建允许读取的策略；使用 "Auth ➜ Users" 生成/登录用户再测试。
- Q: 上传文件失败？
  A: 检查 bucket 权限；Private bucket 需通过签名 URL 上传/下载；确认 `supabase.storage.from(bucket).upload` 路径含文件夹。
- Q: Edge Function 超时？
  A: 默认执行时间有限，检查函数日志，优化耗时操作或改用后台任务。

## 8. 故障排查指南
1) 查看日志
   - Dashboard ➜ Logs (API / Database / Edge Functions)。
   - 预期结果：能看到请求与错误详情。
2) 验证 RLS
   - Table Editor ➜ 目标表 ➜ "Row Level Security" ➜ 查看策略，必要时暂时 disable 测试。
   - 预期结果：确认策略是否阻挡请求。
3) 连接性检查
   - 使用 `supabase-js` 在本地执行简单 `select('*')` 测试。
   - 预期结果：能返回数据则网络与凭证正常。
4) Storage 访问
   - 对 Private bucket 尝试生成签名 URL；对 Public bucket 直接访问文件 URL 验证。
   - 预期结果：确认权限配置正确。
5) Edge Function 调用
   - 使用 `curl -i -H "Authorization: Bearer <key>" <invoke-url>`。
   - 预期结果：HTTP 200/OK，若失败查看函数日志定位错误。
   - 注意：确保使用正确的 Key（通常 anon）。

## 提示与注意事项
- 🔑 密钥分级：前端只用 `anon key`；`service_role` 仅服务器或 Edge Function 使用。
- 🧪 先本地验证：表结构、策略、函数在本地/测试环境验证后再上生产。
- 📦 版本控制：对数据库变更使用 SQL migration（Supabase 迁移或 SQL 脚本）以便回滚。
- 🚦 安全优先：开启 RLS，按需编写策略，不要使用 "disable RLS" 作为常态。
