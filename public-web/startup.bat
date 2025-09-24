@echo off
REM Bedrock Web Platform - PM2 Production Startup Script (Windows)

echo Starting Bedrock Web Platform...

REM Check if PM2 is installed globally
where pm2 >nul 2>nul
if %errorlevel% neq 0 (
    echo PM2 not found! Installing PM2 globally...
    npm install -g pm2
)

REM Create logs directory if it doesn't exist
if not exist logs mkdir logs

REM Build the application
echo Building application...
call npm run build

REM Check if build was successful
if %errorlevel% neq 0 (
    echo Build failed! Please fix build errors before deploying.
    exit /b 1
)

REM Stop existing PM2 process if running
pm2 stop bedrock-web 2>nul

REM Delete existing PM2 process if exists
pm2 delete bedrock-web 2>nul

REM Start the application with PM2
echo Starting PM2...
pm2 start ecosystem.config.js --env production

REM Save PM2 configuration
pm2 save

REM Show status
pm2 list

echo.
echo Bedrock Web Platform is running!
echo View logs: pm2 logs bedrock-web
echo Monitor: pm2 monit
echo Restart: npm run pm2:restart
echo Stop: npm run pm2:stop
pause