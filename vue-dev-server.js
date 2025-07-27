#!/usr/bin/env node

/**
 * Vue开发服务器 - 使用webpack-dev-server
 * 这是一个替代vue-cli-service的解决方案
 */

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');

// 基础webpack配置
const config = {
    mode: 'development',
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader']
            },
            {
                test: /\.scss$/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': path.resolve(__dirname, 'src')
        },
        extensions: ['*', '.js', '.vue', '.json']
    },
    plugins: [
        new (require('vue-loader/lib/plugin'))(),
        new (require('html-webpack-plugin'))({
            template: './public/index.html'
        })
    ],
    devtool: 'eval-source-map'
};

// 开发服务器配置
const devServerOptions = {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
    overlay: {
        warnings: false,
        errors: true
    }
};

// 创建编译器
const compiler = webpack(config);

// 创建开发服务器
const server = new WebpackDevServer(compiler, devServerOptions);

console.log('🚀 正在启动Vue开发服务器...');
console.log('📍 端口: 3000');
console.log('📍 地址: http://localhost:3000');

// 启动服务器
server.listen(3000, 'localhost', (err) => {
    if (err) {
        console.error('❌ 服务器启动失败:', err);
        return;
    }
    console.log('✅ Vue开发服务器启动成功!');
    console.log('🌐 访问地址: http://localhost:3000');
});

// 处理进程终止
process.on('SIGINT', () => {
    console.log('\n🛑 正在停止服务器...');
    server.close(() => {
        console.log('✅ 服务器已停止');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 正在停止服务器...');
    server.close(() => {
        console.log('✅ 服务器已停止');
        process.exit(0);
    });
});
