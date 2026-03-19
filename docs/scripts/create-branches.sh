#!/bin/bash

# Famlée 项目分支创建脚本
# 用途：自动创建并推送所有功能分支

set -e  # 遇到错误立即退出

echo "🚀 开始创建 Famlée 项目分支..."
echo ""

# 检查是否在 git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ 错误：当前目录不是 git 仓库"
    exit 1
fi

# 检查是否有未提交的更改
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  警告：存在未提交的更改"
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 已取消"
        exit 1
    fi
fi

# 确保在 main 分支
echo "📍 切换到 main 分支..."
git checkout main
git pull origin main

# 创建 dev 分支
echo ""
echo "📦 创建 dev 分支..."
if git show-ref --verify --quiet refs/heads/dev; then
    echo "⚠️  dev 分支已存在，跳过创建"
    git checkout dev
    git pull origin dev
else
    git checkout -b dev
    git push -u origin dev
    echo "✅ dev 分支创建成功"
fi

# 定义功能分支列表
branches=(
    "feature/backend-setup"
    "feature/journal-persistence"
    "feature/chat-backend"
    "feature/frontend-integration"
)

# 创建功能分支
for branch in "${branches[@]}"; do
    echo ""
    echo "📦 创建 $branch 分支..."

    # 从 dev 分支创建
    git checkout dev

    if git show-ref --verify --quiet refs/heads/$branch; then
        echo "⚠️  $branch 分支已存在，跳过创建"
    else
        git checkout -b $branch
        git push -u origin $branch
        echo "✅ $branch 分支创建成功"
    fi
done

# 回到 dev 分支
echo ""
echo "📍 切换回 dev 分支..."
git checkout dev

echo ""
echo "🎉 所有分支创建完成！"
echo ""
echo "📋 分支列表："
echo "  - main (生产分支)"
echo "  - dev (开发主分支)"
for branch in "${branches[@]}"; do
    echo "  - $branch"
done
echo ""
echo "💡 提示："
echo "  1. 窗口1使用: git checkout feature/backend-setup"
echo "  2. 窗口2使用: git checkout feature/journal-persistence"
echo "  3. 窗口3使用: git checkout feature/chat-backend"
echo "  4. 窗口4使用: git checkout feature/frontend-integration"
echo ""
echo "📚 查看任务文档："
echo "  - docs/tasks/WINDOW_1_BACKEND_SETUP.md"
echo "  - docs/tasks/WINDOW_2_JOURNAL_PERSISTENCE.md"
echo "  - docs/tasks/WINDOW_3_CHAT_BACKEND.md"
echo "  - docs/tasks/WINDOW_4_FRONTEND_INTEGRATION.md"
echo ""
