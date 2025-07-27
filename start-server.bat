@echo off
REM Web3 DApp 启动器 - Windows批处理版本
REM 双击此文件即可启动DApp

title Web3 DApp 启动器

echo.
echo ========================================
echo 🚀 Web3 DApp 启动器
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Python
    echo.
    echo 💡 解决方案:
    echo 1. 安装Python: https://python.org/downloads/
    echo 2. 或者使用Node.js版本: node start-server.js
    echo.
    pause
    exit /b 1
)

REM 检查HTML文件是否存在
if not exist "token-creator.html" (
    if not exist "frontend\token-creator.html" (
        echo ❌ 错误: 找不到token-creator.html文件
        echo.
        echo 📁 当前目录: %CD%
        echo.
        echo 💡 解决方案:
        echo 1. 确保token-creator.html文件在当前目录
        echo 2. 或者将此批处理文件放在包含HTML文件的目录中
        echo.
        pause
        exit /b 1
    )
)

echo ✅ 检查通过，正在启动服务器...
echo.

REM 启动Python服务器
echo 🌐 启动HTTP服务器...
echo 📍 地址: http://localhost:8000
echo 🎯 DApp: http://localhost:8000/token-creator.html
echo.
echo 📖 使用说明:
echo 1. 确保已安装MetaMask钱包扩展
echo 2. 浏览器将自动打开DApp页面
echo 3. 连接钱包并开始使用
echo 4. 关闭此窗口可停止服务器
echo.
echo ========================================
echo 服务器运行中... 按Ctrl+C停止
echo ========================================
echo.

REM 运行Python启动脚本
python start-server.py

echo.
echo 👋 服务器已停止
pause
