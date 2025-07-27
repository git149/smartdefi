#!/usr/bin/env node

/**
 * Vue开发服务器启动脚本
 * 使用Vue CLI服务启动开发服务器
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 正在启动Vue开发服务器...');

// Vue CLI服务路径
const vueCliServicePath = path.join(__dirname, 'node_modules', '.bin', 'vue-cli-service');

// 启动参数
const args = [
    'serve',
    '--port', '3000',
    '--open',
    '--mode', 'development'
];

// 启动Vue CLI服务
const vueProcess = spawn('node', [vueCliServicePath, ...args], {
    stdio: 'inherit',
    cwd: __dirname,
    shell: true
});

vueProcess.on('error', (error) => {
    console.error('❌ Vue CLI服务启动失败:', error);
    process.exit(1);
});

vueProcess.on('close', (code) => {
    console.log(`\n👋 Vue CLI服务已停止 (退出码: ${code})`);
    process.exit(code);
});

// 处理进程终止
process.on('SIGINT', () => {
    console.log('\n🛑 正在停止Vue CLI服务...');
    vueProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 正在停止Vue CLI服务...');
    vueProcess.kill('SIGTERM');
});
