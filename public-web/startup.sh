#!/bin/bash

# Bedrock Web Platform - PM2 Production Startup Script

echo "🚀 Starting Bedrock Web Platform..."

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null
then
    echo "PM2 not found! Installing PM2 globally..."
    npm install -g pm2
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Build the application
echo "📦 Building application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix build errors before deploying."
    exit 1
fi

# Stop existing PM2 process if running
pm2 stop bedrock-web 2>/dev/null

# Delete existing PM2 process if exists
pm2 delete bedrock-web 2>/dev/null

# Start the application with PM2
echo "🎯 Starting PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Set up PM2 startup script (optional - requires sudo on Linux)
# pm2 startup

# Show status
pm2 list

echo "✅ Bedrock Web Platform is running!"
echo "📊 View logs: pm2 logs bedrock-web"
echo "📈 Monitor: pm2 monit"
echo "🔄 Restart: npm run pm2:restart"
echo "🛑 Stop: npm run pm2:stop"