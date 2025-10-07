# InfoPanel Deployment Steps

## On HOST PC (where the app will run):

### Step 1: Get the code
```bash
# If using git:
git clone <your-repo-url>
cd InfoPanel

# Or copy the entire project folder to HOST
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Build the project
```bash
npm run build
```
*This creates the `dist` folder with the built web app*

### Step 4: Start both servers
**Option A: Two separate terminals**
```bash
# Terminal 1 - API Server
node server/index.js

# Terminal 2 - Web Server  
serve -s dist -l 3000
```

**Option B: Use the batch file**
```bash
# Create start-servers.bat with this content:
@echo off
echo Starting InfoPanel servers...
start "API Server" cmd /k "cd /d %~dp0 && node server/index.js"
timeout /t 2 /nobreak >nul
start "Web Server" cmd /k "cd /d %~dp0 && serve -s dist -l 3000"
echo Both servers started in separate windows
pause

# Then double-click start-servers.bat
```

## Access URLs:
- **Display**: `http://HOST_IP:3000/`
- **Admin**: `http://HOST_IP:3000/admin`

## Troubleshooting:
- **404 Error**: Make sure you ran `npm run build` first
- **API not working**: Make sure the API server is running on port 5174
- **No sync**: Check that both servers are running and accessible

## Updating the app:
```bash
git pull
npm run build
# Restart both servers
```
