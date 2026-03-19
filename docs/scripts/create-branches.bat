@echo off
REM Famlée 项目分支创建脚本 (Windows 版本)
REM 用途：自动创建并推送所有功能分支

setlocal enabledelayedexpansion

echo 🚀 开始创建 Famlée 项目分支...
echo.

REM 检查是否在 git 仓库中
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：当前目录不是 git 仓库
    exit /b 1
)

REM 检查是否有未提交的更改
git diff-index --quiet HEAD -- >nul 2>&1
if errorlevel 1 (
    echo ⚠️  警告：存在未提交的更改
    set /p continue="是否继续？(y/n) "
    if /i not "!continue!"=="y" (
        echo ❌ 已取消
        exit /b 1
    )
)

REM 确保在 main 分支
echo 📍 切换到 main 分支...
git checkout main
git pull origin main

REM 创建 dev 分支
echo.
echo 📦 创建 dev 分支...
git show-ref --verify --quiet refs/heads/dev >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  dev 分支已存在，跳过创建
    git checkout dev
    git pull origin dev
) else (
    git checkout -b dev
    git push -u origin dev
    echo ✅ dev 分支创建成功
)

REM 定义功能分支列表
set branches=feature/backend-setup feature/journal-persistence feature/chat-backend feature/frontend-integration

REM 创建功能分支
for %%b in (%branches%) do (
    echo.
    echo 📦 创建 %%b 分支...

    REM 从 dev 分支创建
    git checkout dev

    git show-ref --verify --quiet refs/heads/%%b >nul 2>&1
    if not errorlevel 1 (
        echo ⚠️  %%b 分支已存在，跳过创建
    ) else (
        git checkout -b %%b
        git push -u origin %%b
        echo ✅ %%b 分支创建成功
    )
)

REM 回到 dev 分支
echo.
echo 📍 切换回 dev 分支...
git checkout dev

echo.
echo 🎉 所有分支创建完成！
echo.
echo 📋 分支列表：
echo   - main (生产分支)
echo   - dev (开发主分支)
for %%b in (%branches%) do (
    echo   - %%b
)
echo.
echo 💡 提示：
echo   1. 窗口1使用: git checkout feature/backend-setup
echo   2. 窗口2使用: git checkout feature/journal-persistence
echo   3. 窗口3使用: git checkout feature/chat-backend
echo   4. 窗口4使用: git checkout feature/frontend-integration
echo.
echo 📚 查看任务文档：
echo   - docs\tasks\WINDOW_1_BACKEND_SETUP.md
echo   - docs\tasks\WINDOW_2_JOURNAL_PERSISTENCE.md
echo   - docs\tasks\WINDOW_3_CHAT_BACKEND.md
echo   - docs\tasks\WINDOW_4_FRONTEND_INTEGRATION.md
echo.

pause
