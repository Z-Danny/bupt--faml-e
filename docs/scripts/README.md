# 辅助脚本使用说明

本目录包含用于 Famlée 项目并行开发的辅助脚本。

## 📁 脚本列表

### 1. create-branches.sh / create-branches.bat
**用途**：自动创建所有功能分支

**支持平台**：
- `create-branches.sh`：Linux / macOS / Git Bash (Windows)
- `create-branches.bat`：Windows 命令提示符 / PowerShell

**功能**：
- 创建 `dev` 开发主分支
- 创建 4 个功能分支：
  - `feature/backend-setup`
  - `feature/journal-persistence`
  - `feature/chat-backend`
  - `feature/frontend-integration`
- 自动推送到远程仓库

**使用方法**：

Linux / macOS / Git Bash:
```bash
cd D:\ai\famlée
chmod +x docs/scripts/create-branches.sh
./docs/scripts/create-branches.sh
```

Windows 命令提示符:
```cmd
cd D:\ai\famlée
docs\scripts\create-branches.bat
```

**注意事项**：
- 确保当前目录是 git 仓库
- 建议在 `main` 分支上执行
- 如有未提交的更改，脚本会提示确认

---

### 2. merge-branches.sh
**用途**：按顺序合并功能分支到 dev，最后合并到 main

**支持平台**：Linux / macOS / Git Bash (Windows)

**功能**：
- 按依赖顺序合并功能分支到 `dev`
- 检查 `WINDOW_X_DONE.txt` 文件确认任务完成
- 可选运行构建测试
- 可选合并 `dev` 到 `main`

**使用方法**：

```bash
cd D:\ai\famlée
chmod +x docs/scripts/merge-branches.sh
./docs/scripts/merge-branches.sh
```

**合并顺序**：
1. `feature/backend-setup` → `dev`
2. `feature/journal-persistence` → `dev`
3. `feature/chat-backend` → `dev`
4. `feature/frontend-integration` → `dev`
5. `dev` → `main` (可选)

**注意事项**：
- 确保所有功能分支已完成并测试通过
- 合并前会检查 `WINDOW_X_DONE.txt` 文件
- 如遇冲突，脚本会暂停并提示手动解决
- 建议在合并到 `main` 前运行完整测试

---

## 🚀 快速开始

### 第一步：创建分支
```bash
# Linux / macOS / Git Bash
./docs/scripts/create-branches.sh

# Windows
docs\scripts\create-branches.bat
```

### 第二步：切换到对应分支开始开发
```bash
# 窗口1
git checkout feature/backend-setup

# 窗口2
git checkout feature/journal-persistence

# 窗口3
git checkout feature/chat-backend

# 窗口4
git checkout feature/frontend-integration
```

### 第三步：完成开发后合并分支
```bash
# 确保所有窗口都已完成并创建 WINDOW_X_DONE.txt
./docs/scripts/merge-branches.sh
```

---

## 🐛 故障排查

### Q1: 脚本提示 "permission denied"
**A**: 需要给脚本添加执行权限：
```bash
chmod +x docs/scripts/*.sh
```

### Q2: Windows 上无法运行 .sh 脚本
**A**: 有两种解决方案：
1. 使用 Git Bash 运行 `.sh` 脚本
2. 使用 Windows 命令提示符运行 `.bat` 脚本

### Q3: 合并时遇到冲突
**A**: 脚本会暂停并提示手动解决：
```bash
# 1. 查看冲突文件
git status

# 2. 手动编辑冲突文件

# 3. 标记为已解决
git add .

# 4. 完成合并
git commit

# 5. 推送到远程
git push origin dev

# 6. 重新运行合并脚本
./docs/scripts/merge-branches.sh
```

### Q4: 分支已存在
**A**: 脚本会自动跳过已存在的分支，不会覆盖现有工作。

---

## 📚 相关文档

- [并行开发指南](../PARALLEL_DEVELOPMENT.md)
- [窗口1任务文档](../tasks/WINDOW_1_BACKEND_SETUP.md)
- [窗口2任务文档](../tasks/WINDOW_2_JOURNAL_PERSISTENCE.md)
- [窗口3任务文档](../tasks/WINDOW_3_CHAT_BACKEND.md)
- [窗口4任务文档](../tasks/WINDOW_4_FRONTEND_INTEGRATION.md)
- [用户操作手册](../USER_MANUAL.md)

---

## 💡 最佳实践

1. **创建分支前**：
   - 确保 `main` 分支是最新的
   - 提交或暂存所有未提交的更改

2. **开发过程中**：
   - 定期提交代码到功能分支
   - 使用有意义的提交信息
   - 完成后创建 `WINDOW_X_DONE.txt` 文件

3. **合并前**：
   - 确保所有测试通过
   - 检查 `WINDOW_X_DONE.txt` 文件存在
   - 在本地测试合并后的代码

4. **合并后**：
   - 在 `dev` 分支运行完整测试
   - 验证所有功能正常工作
   - 确认无冲突或遗漏

---

**祝开发顺利！🎉**
