# Git Setup and GitHub Deployment Guide

## Step 1: Install Git

### Download and Install Git
1. Go to [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Download the latest version for Windows
3. Run the installer with these recommended settings:
   - **Use Git from the command line and also from 3rd-party software**
   - **Use the OpenSSL library**
   - **Checkout Windows-style, commit Unix-style line endings**
   - **Use Windows' default console window**
   - **Enable file system caching**

### Verify Installation
After installation, open a new Command Prompt or PowerShell and run:
```cmd
git --version
```

## Step 2: Configure Git (First Time Setup)

```cmd
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Initialize Repository and Push to GitHub

### Initialize the Repository
```cmd
cd C:\Users\jakku\Downloads\room-panel-skeleton
git init
```

### Add All Files
```cmd
git add .
```

### Create Initial Commit
```cmd
git commit -m "Initial commit: Room Panel application"
```

### Add Remote Repository
```cmd
git remote add origin https://github.com/Jaqquca/Infosystem.git
```

### Push to GitHub
```cmd
git branch -M main
git push -u origin main
```

## Step 4: Create .gitignore File

Create a `.gitignore` file in the project root with this content:

```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity
```

## Alternative: Using GitHub Desktop (Easier Option)

If you prefer a GUI approach:

1. Download GitHub Desktop from [https://desktop.github.com/](https://desktop.github.com/)
2. Install and sign in with your GitHub account
3. Click "Add an Existing Repository from your Hard Drive"
4. Select the `room-panel-skeleton` folder
5. Click "Publish repository" to push to GitHub

## Troubleshooting

### Authentication Issues
If you get authentication errors:
1. Use GitHub Personal Access Token instead of password
2. Go to GitHub Settings > Developer settings > Personal access tokens
3. Generate a new token with repo permissions
4. Use the token as password when prompted

### Large Files
If you have large files that shouldn't be in Git:
1. Add them to `.gitignore`
2. Remove them from Git tracking: `git rm --cached filename`
3. Commit the changes

### Network Issues
If you have network issues:
1. Try using SSH instead of HTTPS
2. Configure Git proxy if behind corporate firewall
3. Use GitHub Desktop as alternative

## Commands Summary

```cmd
# Navigate to project
cd C:\Users\jakku\Downloads\room-panel-skeleton

# Initialize Git
git init

# Add all files
git add .

# Create commit
git commit -m "Initial commit: Room Panel application"

# Add remote
git remote add origin https://github.com/Jaqquca/Infosystem.git

# Push to GitHub
git push -u origin main
```

## Future Updates

To update the repository after making changes:

```cmd
git add .
git commit -m "Description of changes"
git push
```
