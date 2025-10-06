# Room Panel - Deployment Guide for Windows 10

This guide will help you deploy the Room Panel application on a Windows 10 laptop.

## Prerequisites

### 1. Install Node.js
- **Download**: Go to [nodejs.org](https://nodejs.org/)
- **Version**: Download Node.js 18+ (LTS version recommended)
- **Installation**: Run the installer with default settings
- **Verify**: Open Command Prompt and run:
  ```cmd
  node --version
  npm --version
  ```

### 2. Install Git (Optional but recommended)
- **Download**: Go to [git-scm.com](https://git-scm.com/)
- **Installation**: Use default settings
- **Verify**: Open Command Prompt and run:
  ```cmd
  git --version
  ```

## Deployment Steps

### Step 1: Transfer the Project
Choose one of these methods:

#### Option A: USB Drive
1. Copy the entire `room-panel-skeleton` folder to a USB drive
2. Transfer to the Windows 10 laptop
3. Extract/copy to desired location (e.g., `C:\room-panel\`)

#### Option B: Network Transfer
1. Share the folder over network
2. Copy to the laptop via network

#### Option C: Git Clone (if using version control)
```cmd
git clone <repository-url>
cd room-panel-skeleton
```

### Step 2: Install Dependencies
1. Open Command Prompt as Administrator
2. Navigate to the project folder:
   ```cmd
   cd C:\path\to\room-panel-skeleton
   ```
3. Install dependencies:
   ```cmd
   npm install
   ```

### Step 3: Build the Application
```cmd
npm run build
```
This creates a `dist` folder with the production build.

### Step 4: Test the Application
```cmd
npm run preview
```
The application will be available at `http://localhost:4173`

## Production Deployment Options

### Option 1: Simple HTTP Server (Recommended for testing)
1. Install a simple HTTP server:
   ```cmd
   npm install -g serve
   ```
2. Serve the built application:
   ```cmd
   serve -s dist -l 3000
   ```
3. Access at `http://localhost:3000`

### Option 2: IIS (Windows Web Server)
1. Enable IIS in Windows Features
2. Copy the `dist` folder contents to `C:\inetpub\wwwroot\`
3. Configure IIS to serve the files
4. Access via `http://localhost` or `http://[laptop-ip]`

### Option 3: Apache/Nginx (Advanced)
- Install Apache or Nginx
- Configure to serve the `dist` folder
- Set up virtual hosts

## Auto-Start Configuration

### Method 1: Windows Startup Folder
1. Press `Win + R`, type `shell:startup`, press Enter
2. Create a batch file `start-room-panel.bat`:
   ```batch
   @echo off
   cd C:\path\to\room-panel-skeleton
   npm run preview
   ```
3. Add this batch file to the startup folder

### Method 2: Windows Service (Advanced)
1. Install `node-windows`:
   ```cmd
   npm install -g node-windows
   ```
2. Create a service script to run the application as a Windows service

### Method 3: Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to "At startup"
4. Set action to run your batch file

## Power Outage Recovery

### Automatic Restart
1. Configure Windows to automatically log in after restart
2. Set the application to start automatically (see Auto-Start Configuration)
3. Configure Windows to restore previous session

### Manual Recovery Steps
1. Power on the laptop
2. Wait for Windows to fully load
3. The application should start automatically
4. If not, manually run:
   ```cmd
   cd C:\path\to\room-panel-skeleton
   npm run preview
   ```

## Network Configuration

### Local Network Access
1. Find the laptop's IP address:
   ```cmd
   ipconfig
   ```
2. Access the application from other devices:
   `http://[laptop-ip]:4173`

### Firewall Configuration
1. Open Windows Defender Firewall
2. Add exception for the application port (4173)
3. Allow Node.js through firewall

## Troubleshooting

### Common Issues

#### Port Already in Use
```cmd
netstat -ano | findstr :4173
taskkill /PID <process-id> /F
```

#### Node.js Not Found
- Verify Node.js installation
- Restart Command Prompt
- Check PATH environment variable

#### Application Won't Start
1. Check if all dependencies are installed:
   ```cmd
   npm install
   ```
2. Clear npm cache:
   ```cmd
   npm cache clean --force
   ```
3. Delete `node_modules` and reinstall:
   ```cmd
   rmdir /s node_modules
   npm install
   ```

### Logs and Monitoring
1. Check application logs in Command Prompt
2. Monitor system resources (Task Manager)
3. Set up Windows Event Log monitoring

## Security Considerations

1. **Firewall**: Configure Windows Firewall properly
2. **User Permissions**: Run with appropriate user permissions
3. **Network Security**: Consider VPN or secure network setup
4. **Updates**: Keep Node.js and dependencies updated

## Maintenance

### Regular Updates
```cmd
npm update
npm run build
```

### Backup
1. Backup the entire project folder
2. Backup any custom configurations
3. Document any manual changes

### Monitoring
1. Set up system monitoring
2. Configure alerts for application failures
3. Regular health checks

## Quick Start Checklist

- [ ] Install Node.js 18+
- [ ] Transfer project files
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Test with `npm run preview`
- [ ] Configure auto-start
- [ ] Test power outage recovery
- [ ] Configure network access
- [ ] Set up monitoring

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify all prerequisites are met
3. Check Windows Event Logs
4. Test with a simple Node.js application first
