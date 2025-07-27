@echo off
echo 正在切换到 Node.js 18.20.4...
nvm use 18.20.4
echo.
echo 当前 Node.js 版本:
node --version
echo.
echo 启动开发服务器...
npm run serve
