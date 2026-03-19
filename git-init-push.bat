@echo off
REM ============================================
REM Git Repository Initialization and Push Script (Windows)
REM ============================================
REM This script automates the process of:
REM 1. Initializing a local Git repository
REM 2. Adding all files
REM 3. Creating initial commit
REM 4. Connecting to remote GitHub repository
REM 5. Pushing to remote
REM
REM Usage:
REM 1. Edit the REMOTE_URL variable below with your GitHub repository URL
REM 2. Run: git-init-push.bat
REM ============================================

setlocal enabledelayedexpansion

REM ============================================
REM CONFIGURATION - EDIT THIS SECTION
REM ============================================
set "REMOTE_URL=https://github.com/pawaovo/faml-e"
set "BRANCH_NAME=main"
set "COMMIT_MESSAGE=Initial commit: Project setup and migration"

REM ============================================
REM SCRIPT EXECUTION - DO NOT EDIT BELOW
REM ============================================

echo ==========================================
echo Git Repository Initialization Script
echo ==========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed. Please install Git first.
    echo Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Step 1: Checking current directory...
echo Current directory: %CD%
echo.

REM Check if .git directory already exists
if exist ".git" (
    echo WARNING: Git repository already exists in this directory.
    set /p "continue=Do you want to continue? This will add a new remote. (y/n): "
    if /i not "!continue!"=="y" (
        echo Operation cancelled.
        pause
        exit /b 0
    )
) else (
    echo Step 2: Initializing Git repository...
    git init
    if %errorlevel% neq 0 (
        echo ERROR: Failed to initialize Git repository.
        pause
        exit /b 1
    )
    echo Git repository initialized.
    echo.
)

echo Step 3: Checking for .gitignore file...
if not exist ".gitignore" (
    echo Creating .gitignore file...
    (
        echo # Dependencies
        echo node_modules/
        echo .pnp
        echo .pnp.js
        echo.
        echo # Testing
        echo coverage/
        echo.
        echo # Production
        echo build/
        echo dist/
        echo.
        echo # Environment variables
        echo .env
        echo .env.local
        echo .env.development.local
        echo .env.test.local
        echo .env.production.local
        echo.
        echo # Logs
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
        echo pnpm-debug.log*
        echo lerna-debug.log*
        echo.
        echo # Editor directories and files
        echo .vscode/
        echo .idea/
        echo *.suo
        echo *.ntvs*
        echo *.njsproj
        echo *.sln
        echo *.sw?
        echo .DS_Store
        echo.
        echo # OS files
        echo Thumbs.db
        echo.
        echo # Temporary files
        echo *.tmp
        echo *.temp
        echo .cache/
    ) > .gitignore
    echo .gitignore file created.
) else (
    echo .gitignore file already exists.
)
echo.

echo Step 4: Adding all files to staging area...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files to staging area.
    pause
    exit /b 1
)
echo Files added to staging area.
echo.

echo Step 5: Creating initial commit...
git commit -m "%COMMIT_MESSAGE%"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create commit.
    echo This might be because there are no changes to commit.
    pause
    exit /b 1
)
echo Initial commit created.
echo.

echo Step 6: Renaming branch to '%BRANCH_NAME%'...
git branch -M %BRANCH_NAME%
if %errorlevel% neq 0 (
    echo WARNING: Failed to rename branch. Continuing anyway...
)
echo Branch renamed to '%BRANCH_NAME%'.
echo.

echo Step 7: Adding remote repository...
echo Remote URL: %REMOTE_URL%

REM Check if remote 'origin' already exists
git remote | findstr /C:"origin" >nul 2>nul
if %errorlevel% equ 0 (
    echo WARNING: Remote 'origin' already exists.
    for /f "delims=" %%i in ('git remote get-url origin') do set "current_url=%%i"
    echo Current remote URL: !current_url!
    set /p "update=Do you want to update the remote URL? (y/n): "
    if /i "!update!"=="y" (
        git remote set-url origin %REMOTE_URL%
        echo Remote URL updated.
    ) else (
        echo Keeping existing remote URL.
    )
) else (
    git remote add origin %REMOTE_URL%
    if %errorlevel% neq 0 (
        echo ERROR: Failed to add remote repository.
        pause
        exit /b 1
    )
    echo Remote repository added.
)
echo.

echo Step 8: Pushing to remote repository...
echo This may take a few moments depending on your project size...
git push -u origin %BRANCH_NAME%

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo SUCCESS! Repository pushed successfully!
    echo ==========================================
    echo.
    echo Your repository is now available at:
    echo %REMOTE_URL%
    echo.
    echo Next steps:
    echo 1. Visit your GitHub repository to verify the files
    echo 2. Add a README.md if you haven't already
    echo 3. Configure repository settings (visibility, collaborators, etc.^)
    echo.
) else (
    echo.
    echo ==========================================
    echo ERROR: Failed to push to remote repository
    echo ==========================================
    echo.
    echo Possible reasons:
    echo 1. Authentication failed - Make sure you have access to the repository
    echo 2. Repository doesn't exist - Create it on GitHub first
    echo 3. Network issues - Check your internet connection
    echo.
    echo For authentication, you may need to:
    echo - Use a Personal Access Token (PAT^) instead of password
    echo - Configure SSH keys
    echo - Use GitHub CLI (gh auth login^)
    echo.
    pause
    exit /b 1
)

pause
