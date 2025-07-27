#!/usr/bin/env node

/**
 * 简单的Vue开发服务器 - 使用Node.js内置模块
 * 无需额外依赖，直接启动Vue应用
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

function serveFile(res, filePath) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>404 - 文件未找到</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #e74c3c; }
    </style>
</head>
<body>
    <h1>404 - 文件未找到</h1>
    <p>请求的文件不存在: ${filePath}</p>
    <a href="/">返回首页</a>
</body>
</html>
                `);
            } else {
                res.writeHead(500);
                res.end('服务器内部错误');
            }
        } else {
            const contentType = getContentType(filePath);
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            res.end(content);
        }
    });
}

function serveVueApp(res) {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    
    if (fs.existsSync(indexPath)) {
        serveFile(res, indexPath);
    } else {
        // 如果没有index.html，创建一个简单的Vue应用页面
        res.writeHead(200, { 
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue应用 - 开发服务器</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
            margin: 20px 0;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin: 8px;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        .status {
            background: rgba(76, 175, 80, 0.2);
            border-left: 4px solid #4CAF50;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        code {
            background: rgba(0, 0, 0, 0.3);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>🚀 Vue开发服务器运行中</h1>
            <div class="status">
                <strong>✅ 服务器状态:</strong> 运行正常<br>
                <strong>📍 端口:</strong> ${PORT}<br>
                <strong>🌐 地址:</strong> http://localhost:${PORT}
            </div>
        </div>

        <div class="card">
            <h2>📋 可用页面</h2>
            <div class="grid">
                <div>
                    <h3>🪙 代币创建器</h3>
                    <p>Web3 DApp，用于创建BSC测试网代币</p>
                    <a href="/frontend/token-creator.html" class="btn">打开代币创建器</a>
                </div>
                <div>
                    <h3>🧪 Web3测试</h3>
                    <p>测试Web3连接和MetaMask功能</p>
                    <a href="/frontend/web3-test.html" class="btn">打开Web3测试</a>
                </div>
                <div>
                    <h3>📄 静态文件</h3>
                    <p>访问项目中的所有静态文件</p>
                    <a href="/frontend/" class="btn">浏览文件</a>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>🔧 Vue开发信息</h2>
            <p><strong>项目类型:</strong> Vue.js + Web3 混合项目</p>
            <p><strong>Vue源码:</strong> <code>/src</code> 目录</p>
            <p><strong>静态页面:</strong> <code>/frontend</code> 目录</p>
            <p><strong>智能合约:</strong> <code>/contracts</code> 目录</p>
            
            <h3>📖 使用说明</h3>
            <ul>
                <li>Vue应用源码在 <code>src/</code> 目录中</li>
                <li>静态HTML页面在 <code>frontend/</code> 目录中</li>
                <li>所有文件都可以通过HTTP协议访问</li>
                <li>支持Web3和MetaMask连接</li>
            </ul>
        </div>

        <div class="card">
            <h2>⚡ 快速链接</h2>
            <a href="/src/" class="btn">Vue源码目录</a>
            <a href="/public/" class="btn">公共资源</a>
            <a href="/node_modules/" class="btn">依赖包</a>
            <a href="/package.json" class="btn">项目配置</a>
        </div>
    </div>

    <div id="app"></div>

    <!-- Vue开发版本 -->
    <script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>
    <script>
        new Vue({
            el: '#app',
            data: {
                message: 'Vue应用已加载',
                serverInfo: {
                    port: ${PORT},
                    time: new Date().toLocaleString()
                }
            },
            mounted() {
                console.log('🎉 Vue应用已挂载');
                console.log('📍 服务器端口:', this.serverInfo.port);
                console.log('⏰ 启动时间:', this.serverInfo.time);
            }
        });
    </script>
</body>
</html>
        `);
    }
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // 处理根路径
    if (pathname === '/') {
        serveVueApp(res);
        return;
    }

    // 构建文件路径
    let filePath = path.join(__dirname, pathname);

    // 检查文件是否存在
    fs.stat(filePath, (err, stats) => {
        if (err) {
            // 文件不存在，尝试作为Vue路由处理
            if (pathname.startsWith('/src/') || pathname.startsWith('/public/')) {
                serveVueApp(res);
            } else {
                res.writeHead(404);
                res.end('文件未找到');
            }
            return;
        }

        if (stats.isDirectory()) {
            // 如果是目录，尝试查找index.html
            const indexPath = path.join(filePath, 'index.html');
            if (fs.existsSync(indexPath)) {
                serveFile(res, indexPath);
            } else {
                // 显示目录列表
                fs.readdir(filePath, (err, files) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('无法读取目录');
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>目录: ${pathname}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        a { display: block; padding: 5px; text-decoration: none; }
        a:hover { background: #f0f0f0; }
    </style>
</head>
<body>
    <h1>目录: ${pathname}</h1>
    <a href="../">../</a>
    ${files.map(file => `<a href="${path.join(pathname, file)}">${file}</a>`).join('')}
</body>
</html>
                    `);
                });
            }
        } else {
            // 是文件，直接服务
            serveFile(res, filePath);
        }
    });
});

server.listen(PORT, () => {
    console.log('🚀 Vue开发服务器启动成功!');
    console.log('==================================================');
    console.log(`📍 本地地址: http://localhost:${PORT}`);
    console.log(`🎯 Vue应用: http://localhost:${PORT}`);
    console.log(`🪙 代币创建器: http://localhost:${PORT}/frontend/token-creator.html`);
    console.log(`🧪 Web3测试: http://localhost:${PORT}/frontend/web3-test.html`);
    console.log('==================================================');
    console.log('📖 使用说明:');
    console.log('1. Vue源码在 /src 目录');
    console.log('2. 静态页面在 /frontend 目录');
    console.log('3. 支持Web3和MetaMask连接');
    console.log('4. 按 Ctrl+C 停止服务器');
    console.log('==================================================');
});

// 处理进程终止
process.on('SIGINT', () => {
    console.log('\n👋 正在关闭Vue服务器...');
    server.close(() => {
        console.log('✅ Vue服务器已关闭');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n👋 正在关闭Vue服务器...');
    server.close(() => {
        console.log('✅ Vue服务器已关闭');
        process.exit(0);
    });
});
