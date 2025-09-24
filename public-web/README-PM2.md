# PM2 Production Deployment Guide

## Quick Start

### Windows
```bash
# Run the startup script
startup.bat

# OR manually start
npm run deploy:fresh
```

### Linux/Mac
```bash
# Make script executable
chmod +x startup.sh

# Run the startup script
./startup.sh

# OR manually start
npm run deploy:fresh
```

## Installation

### 1. Install PM2 Globally
```bash
npm install -g pm2
```

### 2. Build the Application
```bash
npm run build
```

### 3. Start with PM2
```bash
npm run pm2:start
```

## PM2 Commands

### Package.json Scripts
- `npm run pm2:start` - Start the application
- `npm run pm2:stop` - Stop the application
- `npm run pm2:restart` - Restart the application
- `npm run pm2:reload` - Reload with zero downtime
- `npm run pm2:delete` - Remove from PM2
- `npm run pm2:logs` - View logs
- `npm run pm2:monit` - Open monitoring dashboard
- `npm run deploy` - Build and reload (for updates)
- `npm run deploy:fresh` - Build and fresh start

### Direct PM2 Commands
```bash
# Status
pm2 list
pm2 status

# Logs
pm2 logs bedrock-web
pm2 logs bedrock-web --lines 100

# Monitoring
pm2 monit

# Process Management
pm2 restart bedrock-web
pm2 reload bedrock-web
pm2 stop bedrock-web
pm2 delete bedrock-web

# Save/Restore
pm2 save
pm2 resurrect

# Startup Script (auto-start on boot)
pm2 startup
pm2 unstartup
```

## Configuration

The `ecosystem.config.js` file controls PM2 behavior:

```javascript
{
  name: 'bedrock-web',        // Application name
  instances: 'max',           // Number of instances (max = all CPU cores)
  exec_mode: 'cluster',       // Enable cluster mode
  max_memory_restart: '1G',   // Auto-restart if memory exceeds 1GB
  env: {
    NODE_ENV: 'production',
    PORT: 3000               // Change port if needed
  }
}
```

## Environment Variables

Create `.env.local` file for production settings:
```env
# Application
NODE_ENV=production
PORT=3000

# SMTP (for contact form)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_TO=foxxdev.collab@gmail.com
```

## Monitoring

### View Real-time Logs
```bash
pm2 logs bedrock-web --lines 100
```

### Monitor Dashboard
```bash
pm2 monit
```

### Web Dashboard (Optional)
```bash
pm2 install pm2-webshell
pm2 web
```

## Load Balancing

PM2 automatically load balances when using cluster mode:
- `instances: 'max'` - Uses all CPU cores
- `instances: 2` - Uses 2 instances
- `instances: -1` - Uses all cores minus 1

## Zero-Downtime Deployment

For updates without downtime:
```bash
# Pull latest code
git pull

# Deploy with reload
npm run deploy
```

## Auto-Start on Boot

### Linux/Mac
```bash
pm2 startup
# Copy and run the command it outputs
pm2 save
```

### Windows
```bash
pm2 install pm2-windows-startup
pm2 startup
pm2 save
```

## Troubleshooting

### Port Already in Use
Change the port in `ecosystem.config.js`:
```javascript
env: {
  PORT: 3001  // Use different port
}
```

### Memory Issues
Adjust memory limit in `ecosystem.config.js`:
```javascript
max_memory_restart: '2G'  // Increase to 2GB
```

### View Error Logs
```bash
# Check error logs
tail -f logs/err.log

# Check all logs
pm2 logs bedrock-web --err
```

### Reset Everything
```bash
pm2 kill
rm -rf logs/*
npm run deploy:fresh
```

## Production Best Practices

1. **Always build before deploying**
   ```bash
   npm run build
   ```

2. **Use environment variables**
   - Never commit `.env.local`
   - Use different settings for dev/prod

3. **Monitor resources**
   ```bash
   pm2 monit
   ```

4. **Set up log rotation**
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 30
   ```

5. **Enable auto-restart on boot**
   ```bash
   pm2 startup
   pm2 save
   ```

## Nginx Configuration (Optional)

If using Nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Support

For issues or questions about deployment:
- Check logs: `pm2 logs bedrock-web`
- Monitor processes: `pm2 monit`
- Restart if needed: `npm run pm2:restart`