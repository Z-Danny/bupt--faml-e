# Famlée 后台管理系统访问指南

## 访问方式

后台管理系统通过 URL 参数进入：

```text
http://localhost:3000/?mode=admin
```

生产环境：

```text
https://your-domain.com/?mode=admin
```

## 登录凭证

```text
账号: admin
密码: 123456
```

当前 Admin 登录是演示模式，token 保存在 `localStorage` 的 `famlee_admin_token`。

## 功能说明

### 数据统计面板

- 时间维度切换。
- 总对话次数、情绪分布等指标卡片。
- 对话趋势图、情绪分布图、时长分布图。
- 当前数据主要来自 `src/data/mockAdminData.ts`。

### 活动发布面板

- 发布校园心理活动。
- 展示已发布活动列表和活动预览。
- 当前仍以页面内状态 / mock 数据为主，尚未接入真实后端事件表。

### 数据分析

- 当前为占位/演示功能。

## 技术实现

- UI 组件：shadcn/ui 风格组件。
- 图表库：recharts。
- 主题系统：`theme.md` 中的 tweakcn / oklch 配置。
- 状态管理：React Hooks + localStorage。
- 路由逻辑：`App.tsx` 读取 `?mode=admin`。

## 当前限制

- 未接入 Express 后端管理员认证。
- 未使用真实 PostgreSQL 聚合数据。
- 暂无管理员角色权限表。
- 暂无活动增删改查 API。

## 后续扩展方向

- 在 Express API 中增加 admin-only middleware。
- 新增管理员用户或角色权限表。
- 用 PostgreSQL 聚合替换 `mockAdminData`。
- 添加校园活动表和活动 CRUD API。
- 添加 CSV/JSON 导出。

## 开发

需要同时启动 API 和前端：

```bash
npm run server:dev
npm run dev
```

访问：

- 用户端：`http://localhost:3000/`
- 管理端：`http://localhost:3000/?mode=admin`
