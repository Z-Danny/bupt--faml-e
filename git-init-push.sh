#!/bin/bash

# ============================================
# Git Repository Initialization and Push Script
# ============================================
# This script automates the process of:
# 1. Initializing a local Git repository
# 2. Adding all files
# 3. Creating initial commit
# 4. Connecting to remote GitHub repository
# 5. Pushing to remote
#
# Usage:
# 1. Edit the REMOTE_URL variable below with your GitHub repository URL
# 2. Run: bash git-init-push.sh
# ============================================

# ============================================
# CONFIGURATION - EDIT THIS SECTION
# ============================================
REMOTE_URL="https://github.com/pawaovo/faml-e"
BRANCH_NAME="main"
COMMIT_MESSAGE="Initial commit: Project setup and migration"

# ============================================
# SCRIPT EXECUTION - DO NOT EDIT BELOW
# ============================================

echo "=========================================="
echo "Git Repository Initialization Script"
echo "=========================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "ERROR: Git is not installed. Please install Git first."
    exit 1
fi

echo "Step 1: Checking current directory..."
echo "Current directory: $(pwd)"
echo ""

# Check if .git directory already exists
if [ -d ".git" ]; then
    echo "WARNING: Git repository already exists in this directory."
    read -p "Do you want to continue? This will add a new remote. (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 0
    fi
else
    echo "Step 2: Initializing Git repository..."
    git init
    echo "Git repository initialized."
    echo ""
fi

echo "Step 3: Checking for .gitignore file..."
if [ ! -f ".gitignore" ]; then
    echo "Creating .gitignore file..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor directories and files
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.DS_Store

# OS files
Thumbs.db

# Temporary files
*.tmp
*.temp
.cache/
EOF
    echo ".gitignore file created."
else
    echo ".gitignore file already exists."
fi
echo ""

echo "Step 4: Adding all files to staging area..."
git add .
echo "Files added to staging area."
echo ""

echo "Step 5: Creating initial commit..."
git commit -m "$COMMIT_MESSAGE"
echo "Initial commit created."
echo ""

echo "Step 6: Renaming branch to '$BRANCH_NAME'..."
git branch -M $BRANCH_NAME
echo "Branch renamed to '$BRANCH_NAME'."
echo ""

echo "Step 7: Adding remote repository..."
echo "Remote URL: $REMOTE_URL"

# Check if remote 'origin' already exists
if git remote | grep -q "^origin$"; then
    echo "WARNING: Remote 'origin' already exists."
    echo "Current remote URL: $(git remote get-url origin)"
    read -p "Do you want to update the remote URL? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin $REMOTE_URL
        echo "Remote URL updated."
    else
        echo "Keeping existing remote URL."
    fi
else
    git remote add origin $REMOTE_URL
    echo "Remote repository added."
fi
echo ""

echo "Step 8: Pushing to remote repository..."
echo "This may take a few moments depending on your project size..."
git push -u origin $BRANCH_NAME

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "SUCCESS! Repository pushed successfully!"
    echo "=========================================="
    echo ""
    echo "Your repository is now available at:"
    echo "$REMOTE_URL"
    echo ""
    echo "Next steps:"
    echo "1. Visit your GitHub repository to verify the files"
    echo "2. Add a README.md if you haven't already"
    echo "3. Configure repository settings (visibility, collaborators, etc.)"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "ERROR: Failed to push to remote repository"
    echo "=========================================="
    echo ""
    echo "Possible reasons:"
    echo "1. Authentication failed - Make sure you have access to the repository"
    echo "2. Repository doesn't exist - Create it on GitHub first"
    echo "3. Network issues - Check your internet connection"
    echo ""
    echo "For authentication, you may need to:"
    echo "- Use a Personal Access Token (PAT) instead of password"
    echo "- Configure SSH keys"
    echo "- Use GitHub CLI (gh auth login)"
    echo ""
    exit 1
fi
