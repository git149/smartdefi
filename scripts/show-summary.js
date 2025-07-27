#!/usr/bin/env node

/**
 * 项目总结和使用指南脚本
 * 
 * 功能：
 * 1. 显示项目概览
 * 2. 列出所有可用脚本
 * 3. 显示配置状态
 * 4. 提供快速开始指南
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// 检查环境配置
function checkEnvironment() {
    const config = {
        privateKey: !!(process.env.BSC_TESTNET_DEPLOYER_KEY || process.env.PRIVATE_KEY),
        bscscanKey: !!process.env.BSCSCAN_API_KEY,
        tokenConfig: {
            name: process.env.TOKEN_NAME || 'FEG Token',
            symbol: process.env.TOKEN_SYMBOL || 'FEG',
            supply: process.env.TOKEN_SUPPLY || '1000000'
        }
    };
    
    return config;
}

// 检查已部署的合约
function checkDeployments() {
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    
    if (!fs.existsSync(deploymentsDir)) {
        return { hasDeployments: false, count: 0, latest: null };
    }
    
    const files = fs.readdirSync(deploymentsDir);
    const deploymentFiles = files.filter(f => f.startsWith('deployment-info-') && f.endsWith('.json'));
    
    if (deploymentFiles.length === 0) {
        return { hasDeployments: false, count: 0, latest: null };
    }
    
    const latestFile = deploymentFiles.sort().pop();
    let latestDeployment = null;
    
    try {
        const content = fs.readFileSync(path.join(deploymentsDir, latestFile), 'utf8');
        latestDeployment = JSON.parse(content);
    } catch (error) {
        // 忽略解析错误
    }
    
    return {
        hasDeployments: true,
        count: deploymentFiles.length,
        latest: latestDeployment
    };
}

// 检查已创建的代币
function checkTokens() {
    const tokensDir = path.join(__dirname, '..', 'tokens');
    
    if (!fs.existsSync(tokensDir)) {
        return { hasTokens: false, count: 0 };
    }
    
    const files = fs.readdirSync(tokensDir);
    const tokenFiles = files.filter(f => f.startsWith('token-') && f.endsWith('.json'));
    
    return {
        hasTokens: tokenFiles.length > 0,
        count: tokenFiles.length
    };
}

// 主函数
function main() {
    console.log('='.repeat(80));
    console.log('🚀 StagedTokenFactory 智能合约部署系统');
    console.log('='.repeat(80));
    
    // 项目概览
    console.log('\n📋 项目概览:');
    console.log('   这是一个完整的智能合约部署和测试系统，支持：');
    console.log('   • 部署 StagedTokenFactory 合约到 BSC 测试网');
    console.log('   • 创建自定义 ERC20 代币');
    console.log('   • 分阶段代币初始化（基础 → DEX就绪 → 完全激活）');
    console.log('   • 前端集成代码生成');
    console.log('   • 完整的错误处理和日志记录');
    
    // 环境配置检查
    console.log('\n⚙️ 环境配置状态:');
    const config = checkEnvironment();
    console.log(`   私钥配置: ${config.privateKey ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`   BSCScan API: ${config.bscscanKey ? '✅ 已配置' : '⚠️ 未配置（可选）'}`);
    console.log(`   代币配置: ${config.tokenConfig.name} (${config.tokenConfig.symbol}) - ${config.tokenConfig.supply}`);
    
    if (!config.privateKey) {
        console.log('\n⚠️ 警告: 请在 .env 文件中配置 BSC_TESTNET_DEPLOYER_KEY 或 PRIVATE_KEY');
    }
    
    // 部署状态检查
    console.log('\n📦 部署状态:');
    const deployments = checkDeployments();
    if (deployments.hasDeployments) {
        console.log(`   已完成部署: ${deployments.count} 次`);
        if (deployments.latest) {
            console.log(`   最新工厂合约: ${deployments.latest.contracts?.StagedTokenFactory?.address || 'N/A'}`);
            console.log(`   部署时间: ${deployments.latest.timestamp}`);
        }
    } else {
        console.log('   尚未进行部署');
    }
    
    // 代币状态检查
    const tokens = checkTokens();
    if (tokens.hasTokens) {
        console.log(`   已创建代币: ${tokens.count} 个`);
    } else {
        console.log('   尚未创建代币');
    }
    
    // 可用脚本
    console.log('\n🛠️ 可用脚本:');
    console.log('   1. 一键部署和测试:');
    console.log('      npm run deploy');
    console.log('      node scripts/deploy-and-test.js');
    console.log('');
    console.log('   2. 分步操作:');
    console.log('      npm run compile:contracts    # 编译合约');
    console.log('      npm run deploy:factory       # 部署工厂合约');
    console.log('      npm run create:token         # 创建代币');
    console.log('');
    console.log('   3. 自定义代币创建:');
    console.log('      npm run create:token -- --name "My Token" --symbol "MTK"');
    console.log('      npm run create:token -- --one-click');
    console.log('');
    console.log('   4. 帮助信息:');
    console.log('      npm run help:deploy');
    console.log('      node scripts/create-token.js --help');
    
    // 快速开始指南
    console.log('\n🚀 快速开始:');
    if (!config.privateKey) {
        console.log('   1. 配置环境变量:');
        console.log('      在 .env 文件中添加: BSC_TESTNET_DEPLOYER_KEY=your_private_key');
        console.log('   2. 获取测试 BNB:');
        console.log('      访问: https://testnet.binance.org/faucet-smart');
        console.log('   3. 运行部署:');
        console.log('      npm run deploy');
    } else if (!deployments.hasDeployments) {
        console.log('   1. 获取测试 BNB (如果还没有):');
        console.log('      访问: https://testnet.binance.org/faucet-smart');
        console.log('   2. 运行一键部署:');
        console.log('      npm run deploy');
        console.log('   3. 查看部署结果:');
        console.log('      检查 deployments/ 目录下的配置文件');
    } else {
        console.log('   系统已就绪! 您可以:');
        console.log('   1. 创建新代币:');
        console.log('      npm run create:token -- --name "New Token" --symbol "NEW"');
        console.log('   2. 查看已部署的合约:');
        if (deployments.latest?.contracts?.StagedTokenFactory?.address) {
            console.log(`      https://testnet.bscscan.com/address/${deployments.latest.contracts.StagedTokenFactory.address}`);
        }
        console.log('   3. 使用前端集成:');
        console.log('      参考生成的 frontend-integration.js 文件');
    }
    
    // 文档和资源
    console.log('\n📚 文档和资源:');
    console.log('   • 部署指南: docs/DEPLOYMENT_GUIDE.md');
    console.log('   • BSC 测试网浏览器: https://testnet.bscscan.com');
    console.log('   • BSC 测试网水龙头: https://testnet.binance.org/faucet-smart');
    console.log('   • MetaMask 配置: https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain');
    
    // 目录结构
    console.log('\n📁 项目结构:');
    console.log('   scripts/                 # 部署和测试脚本');
    console.log('   ├── deploy-and-test.js   # 一键部署脚本');
    console.log('   ├── create-token.js      # 代币创建脚本');
    console.log('   ├── compile-contract.js  # 合约编译脚本');
    console.log('   └── show-summary.js      # 本脚本');
    console.log('   contracts/Acon/          # 智能合约源码');
    console.log('   deployments/             # 部署信息文件');
    console.log('   tokens/                  # 代币信息文件');
    console.log('   docs/                    # 文档');
    console.log('   frontend-integration.js  # 前端集成代码');
    
    console.log('\n' + '='.repeat(80));
    console.log('💡 提示: 运行 npm run deploy 开始您的第一次部署!');
    console.log('='.repeat(80));
}

// 运行主函数
if (require.main === module) {
    main();
}

module.exports = { main, checkEnvironment, checkDeployments, checkTokens };
