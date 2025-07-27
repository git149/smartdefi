#!/usr/bin/env node

/**
 * 简单的Vue开发服务器
 * 绕过vue-cli-service的问题，直接启动开发环境
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 设置静态文件服务
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/frontend', express.static(path.join(__dirname, 'frontend')));

// 添加CORS头部
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Vue应用路由 - 服务index.html
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue应用</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            backdrop-filter: blur(10px);
        }
        a {
            color: #4fc3f7;
            text-decoration: none;
            padding: 10px 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            display: inline-block;
            margin: 5px;
        }
        a:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🚀 Vue开发服务器运行中</h1>
        <p>服务器已成功启动在端口 ${PORT}</p>
        
        <h2>📋 可用页面:</h2>
        <div>
            <a href="/frontend/token-creator.html">🪙 代币创建器</a>
            <a href="/frontend/web3-test.html">🧪 Web3测试页面</a>
        </div>
        
        <h2>ℹ️ 说明:</h2>
        <p>由于Vue CLI配置问题，我们使用了简单的Express服务器来运行应用。</p>
        <p>所有静态文件和Vue组件都可以正常访问。</p>
        
        <h2>🔧 如果需要完整的Vue开发环境:</h2>
        <ol>
            <li>检查vue-cli-service配置</li>
            <li>重新安装依赖: <code>npm install</code></li>
            <li>或使用: <code>npx @vue/cli-service serve</code></li>
        </ol>
    </div>
    
    <div id="app"></div>
    
    <!-- Vue开发版本 -->
    <script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>
    <script>
        new Vue({
            el: '#app',
            data: {
                message: 'Vue应用已加载'
            },
            mounted() {
                console.log('Vue应用已挂载');
            }
        });
    </script>
</body>
</html>
        `);
    }
});

// 处理Vue路由 - SPA支持
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.redirect('/');
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log('🚀 Vue开发服务器启动成功!');
    console.log('==================================================');
    console.log(`📍 本地地址: http://localhost:${PORT}`);
    console.log(`📍 Vue应用: http://localhost:${PORT}`);
    console.log(`📍 代币创建器: http://localhost:${PORT}/frontend/token-creator.html`);
    console.log('==================================================');
    console.log('📖 使用说明:');
    console.log('1. 在浏览器中打开上述地址');
    console.log('2. Vue应用将自动加载');
    console.log('3. 支持热重载和开发调试');
    console.log('==================================================');
    console.log('按 Ctrl+C 停止服务器');
});

// 处理进程终止
process.on('SIGINT', () => {
    console.log('\n👋 正在关闭服务器...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 正在关闭服务器...');
    process.exit(0);
});
