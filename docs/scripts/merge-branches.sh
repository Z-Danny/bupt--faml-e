#!/bin/bash

# Famlée 项目分支合并脚本
# 用途：按顺序合并功能分支到 dev，最后合并到 main

set -e  # 遇到错误立即退出

echo "🔀 开始合并 Famlée 项目分支..."
echo ""

# 检查是否在 git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ 错误：当前目录不是 git 仓库"
    exit 1
fi

# 检查是否有未提交的更改
if ! git diff-index --quiet HEAD --; then
    echo "❌ 错误：存在未提交的更改，请先提交或暂存"
    exit 1
fi

# 定义合并顺序
merge_order=(
    "feature/backend-setup"
    "feature/journal-persistence"
    "feature/chat-backend"
    "feature/frontend-integration"
)

# 函数：合并分支
merge_branch() {
    local branch=$1
    echo ""
    echo "📦 合并 $branch 到 dev..."

    # 检查分支是否存在
    if ! git show-ref --verify --quiet refs/heads/$branch; then
        echo "⚠️  $branch 分支不存在，跳过"
        return
    fi

    # 检查是否有 DONE 文件
    local window_num=""
    case $branch in
        "feature/backend-setup")
            window_num="1"
            ;;
        "feature/journal-persistence")
            window_num="2"
            ;;
        "feature/chat-backend")
            window_num="3"
            ;;
        "feature/frontend-integration")
            window_num="4"
            ;;
    esac

    if [ -n "$window_num" ]; then
        git checkout $branch
        if [ ! -f "WINDOW_${window_num}_DONE.txt" ]; then
            echo "⚠️  警告：未找到 WINDOW_${window_num}_DONE.txt 文件"
            read -p "是否继续合并？(y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "❌ 跳过 $branch"
                git checkout dev
                return
            fi
        fi
    fi

    # 切换到 dev 并合并
    git checkout dev
    git pull origin dev

    if git merge --no-ff $branch -m "Merge $branch into dev"; then
        echo "✅ $branch 合并成功"
        git push origin dev
    else
        echo "❌ 合并冲突！请手动解决冲突后执行："
        echo "   git add ."
        echo "   git commit"
        echo "   git push origin dev"
        echo "   然后重新运行此脚本"
        exit 1
    fi
}

# 阶段1：合并所有功能分支到 dev
echo "📋 阶段1：合并功能分支到 dev"
echo "================================"

for branch in "${merge_order[@]}"; do
    merge_branch $branch
done

# 阶段2：运行测试（可选）
echo ""
echo "📋 阶段2：运行测试"
echo "================================"
echo "⚠️  建议在合并到 main 前运行完整测试"
read -p "是否运行测试？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧪 运行测试..."
    npm run build
    if [ $? -eq 0 ]; then
        echo "✅ 构建成功"
    else
        echo "❌ 构建失败，请修复后再合并到 main"
        exit 1
    fi
fi

# 阶段3：合并到 main
echo ""
echo "📋 阶段3：合并到 main"
echo "================================"
read -p "是否将 dev 合并到 main？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔀 合并 dev 到 main..."
    git checkout main
    git pull origin main

    if git merge --no-ff dev -m "Merge dev into main - Release"; then
        echo "✅ dev 合并到 main 成功"
        git push origin main
        echo ""
        echo "🎉 所有分支合并完成！"
        echo ""
        echo "📋 下一步："
        echo "  1. 在 GitHub/GitLab 上创建 Release Tag"
        echo "  2. 部署到生产环境"
        echo "  3. 验证生产环境功能"
    else
        echo "❌ 合并冲突！请手动解决冲突"
        exit 1
    fi
else
    echo "⏸️  跳过合并到 main"
    echo "💡 稍后可手动执行："
    echo "   git checkout main"
    echo "   git merge --no-ff dev"
    echo "   git push origin main"
fi

echo ""
echo "✅ 合并流程完成！"
echo ""
