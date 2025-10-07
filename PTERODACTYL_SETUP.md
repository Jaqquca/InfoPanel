# InfoPanel Pterodactyl Deployment Guide

## What You Need to Install on Your Server:

### 1. Node.js (Latest LTS)
```bash
# Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL:
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs
```

### 2. Git (if not already installed)
```bash
# Ubuntu/Debian:
sudo apt update && sudo apt install git

# CentOS/RHEL:
sudo yum install git
```

## Pterodactyl Panel Setup:

### 1. Create New Server
- **Name**: InfoPanel
- **Description**: Room Information Panel with Real-time Updates
- **Nest**: Generic
- **Egg**: Generic Service
- **Docker Image**: `node:18-alpine` (or latest Node.js image)

### 2. Server Configuration
- **Startup Command**: `bash pterodactyl-startup.sh`
- **Working Directory**: `/home/container`
- **Allocation**: Choose any available port (e.g., 3000)
- **Memory**: 512MB minimum
- **Disk Space**: 1GB minimum

### 3. Environment Variables
- `NODE_ENV=production`
- `PORT=3000` (or your chosen port)

## Deployment Steps:

### 1. Upload Your Code
Upload the entire project folder to your Pterodactyl server's file manager, or use Git:

```bash
# In Pterodactyl file manager terminal:
git clone <your-repo-url>
cd InfoPanel
```

### 2. Make Startup Script Executable
```bash
chmod +x pterodactyl-startup.sh
```

### 3. Start the Server
Click "Start" in Pterodactyl panel. The server will:
1. Install dependencies (`npm install`)
2. Build the app (`npm run build`)
3. Start the server (`node server/index.js`)

## Access Your App:
- **URL**: `http://YOUR_SERVER_IP:PORT`
- **Display**: `http://YOUR_SERVER_IP:PORT/`
- **Admin**: `http://YOUR_SERVER_IP:PORT/admin`

## Features:
- ✅ **Real-time Updates**: Changes sync instantly across all devices
- ✅ **WebSocket Connection**: No more polling, instant updates
- ✅ **Single Server**: One server handles both API and web serving
- ✅ **Auto-reconnect**: WebSocket automatically reconnects if connection drops
- ✅ **Production Ready**: Optimized for Pterodactyl deployment

## Troubleshooting:
- **Port Issues**: Make sure the port is open in your firewall
- **Build Errors**: Check Node.js version (18+ recommended)
- **WebSocket Issues**: Ensure your server supports WebSocket connections
- **Memory Issues**: Increase memory allocation in Pterodactyl if needed

## Updating the App:
1. Upload new code to Pterodactyl file manager
2. Restart the server in Pterodactyl panel
3. The startup script will rebuild and restart automatically

## Security Notes:
- The admin password is hardcoded: `Aa123456789`
- Consider changing this in production
- The app is designed for trusted networks
