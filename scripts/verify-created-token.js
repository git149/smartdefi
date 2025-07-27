#!/usr/bin/env node

/**
 * 验证已创建代币的完整性
 * 验证代币地址：0x30442B89374d99CbF54904580bed02308EE4b63e
 */

require('dotenv').config();
const { ethers } = require('ethers');

// BSC测试网配置
const BSC_TESTNET_CONFIG = {
    chainId: 97,
    name: 'BSC Testnet',
    rpcUrl: 'https://bsc-testnet.public.blastapi.io',
    blockExplorer: 'https://testnet.bscscan.com'
};

// 已创建的代币地址
const TOKEN_ADDRESS = '0x30442B89374d99CbF54904580bed02308EE4b63e';
const FACTORY_ADDRESS = '0x073faD54A73333EC1671522b9cCCbbBd153DA265';

// 预期的代币属性
const EXPECTED_TOKEN = {
    name: 'FEG Test Token',
    symbol: 'FEGT',
    totalSupply: '1000000',
    buyFee: 2,
    sellFee: 5,
    decimals: 18
};

// 代币合约ABI
const TOKEN_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function owner() view returns (address)",
    "function currentStage() view returns (uint8)",
    "function tradingEnabled() view returns (bool)",
    "function feeBuy() view returns (uint256)",
    "function feeSell() view returns (uint256)",
    "function feeRecipient() view returns (address)",
    "function getStageInfo() view returns (uint8 stage, bool dexReady, bool tradingActive, address bnbPair, address usdtPair)",
    "function getAdvancedConfig() view returns (address feeRecipient, uint256 maxTxAmount, uint256 maxWalletAmount, uint256 swapThreshold, uint256 maxTxPercent, uint256 maxWalletPercent)"
];

function log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const icons = {
        'info': '📝', 'success': '✅', 'error': '❌', 'warning': '⚠️', 'verify': '🔍'
    };
    console.log(`[${timestamp}] ${icons[type] || '📝'} ${message}`);
}

async function verifyTokenIntegrity() {
    log('开始验证已创建代币的完整性...', 'verify');
    log(`代币地址: ${TOKEN_ADDRESS}`);
    log(`BSCScan: ${BSC_TESTNET_CONFIG.blockExplorer}/address/${TOKEN_ADDRESS}`);
    
    try {
        // 初始化连接
        const provider = new ethers.JsonRpcProvider(BSC_TESTNET_CONFIG.rpcUrl);
        const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
        
        // 验证合约是否存在
        const code = await provider.getCode(TOKEN_ADDRESS);
        if (code === '0x') {
            throw new Error('代币合约不存在');
        }
        log('代币合约存在 ✓', 'success');
        
        // 验证基础属性
        log('\n=== 基础属性验证 ===');
        const name = await token.name();
        const symbol = await token.symbol();
        const decimals = await token.decimals();
        const totalSupply = await token.totalSupply();
        const owner = await token.owner();
        
        log(`名称: ${name} ${name === EXPECTED_TOKEN.name ? '✓' : '✗'}`);
        log(`符号: ${symbol} ${symbol === EXPECTED_TOKEN.symbol ? '✓' : '✗'}`);
        log(`小数位数: ${decimals} ${Number(decimals) === EXPECTED_TOKEN.decimals ? '✓' : '✗'}`);
        log(`总供应量: ${ethers.formatUnits(totalSupply, decimals)} ${ethers.formatUnits(totalSupply, decimals) === EXPECTED_TOKEN.totalSupply ? '✓' : '✗'}`);
        log(`所有者: ${owner}`);
        
        // 验证阶段状态
        log('\n=== 阶段状态验证 ===');
        const currentStage = await token.currentStage();
        const tradingEnabled = await token.tradingEnabled();
        const stageNames = ['BASIC', 'DEX_READY', 'FULLY_ACTIVE'];
        
        log(`当前阶段: ${currentStage} (${stageNames[currentStage]}) ${Number(currentStage) === 0 ? '✓' : '✗'}`);
        log(`交易状态: ${tradingEnabled ? '已启用' : '未启用'} ${!tradingEnabled ? '✓' : '✗'}`);
        
        // 验证费用配置
        log('\n=== 费用配置验证 ===');
        const feeBuy = await token.feeBuy();
        const feeSell = await token.feeSell();
        const feeRecipient = await token.feeRecipient();
        
        log(`买入费用: ${feeBuy}% ${Number(feeBuy) === EXPECTED_TOKEN.buyFee ? '✓' : '✗'}`);
        log(`卖出费用: ${feeSell}% ${Number(feeSell) === EXPECTED_TOKEN.sellFee ? '✓' : '✗'}`);
        log(`费用接收地址: ${feeRecipient}`);
        
        // 验证高级配置
        log('\n=== 高级配置验证 ===');
        const advancedConfig = await token.getAdvancedConfig();
        const [configFeeRecipient, maxTxAmount, maxWalletAmount, swapThreshold, maxTxPercent, maxWalletPercent] = advancedConfig;
        
        log(`配置费用接收地址: ${configFeeRecipient}`);
        log(`最大交易数量: ${ethers.formatEther(maxTxAmount)}`);
        log(`最大钱包数量: ${ethers.formatEther(maxWalletAmount)}`);
        log(`Swap阈值: ${ethers.formatEther(swapThreshold)}`);
        log(`最大交易百分比: ${maxTxPercent}%`);
        log(`最大钱包百分比: ${maxWalletPercent}%`);
        
        // 验证余额分配
        log('\n=== 余额分配验证 ===');
        const ownerBalance = await token.balanceOf(owner);
        const ownerBalanceFormatted = ethers.formatUnits(ownerBalance, decimals);
        
        log(`所有者余额: ${ownerBalanceFormatted} ${ownerBalanceFormatted === EXPECTED_TOKEN.totalSupply ? '✓' : '✗'}`);
        
        // 生成验证总结
        log('\n=== 验证总结 ===');
        const checks = [
            name === EXPECTED_TOKEN.name,
            symbol === EXPECTED_TOKEN.symbol,
            Number(decimals) === EXPECTED_TOKEN.decimals,
            ethers.formatUnits(totalSupply, decimals) === EXPECTED_TOKEN.totalSupply,
            Number(currentStage) === 0,
            !tradingEnabled,
            Number(feeBuy) === EXPECTED_TOKEN.buyFee,
            Number(feeSell) === EXPECTED_TOKEN.sellFee,
            ownerBalanceFormatted === EXPECTED_TOKEN.totalSupply
        ];
        
        const passedChecks = checks.filter(check => check).length;
        const totalChecks = checks.length;
        
        log(`验证通过: ${passedChecks}/${totalChecks}`, passedChecks === totalChecks ? 'success' : 'warning');
        
        if (passedChecks === totalChecks) {
            log('🎉 代币完整性验证通过！代币创建功能正常工作。', 'success');
        } else {
            log('⚠️ 部分验证未通过，请检查代币配置。', 'warning');
        }
        
        // 输出使用信息
        log('\n=== 代币使用信息 ===');
        log(`代币合约地址: ${TOKEN_ADDRESS}`);
        log(`BSCScan查看: ${BSC_TESTNET_CONFIG.blockExplorer}/address/${TOKEN_ADDRESS}`);
        log(`添加到MetaMask: 代币地址 ${TOKEN_ADDRESS}`);
        log(`网络: BSC测试网 (Chain ID: 97)`);
        
        return {
            success: passedChecks === totalChecks,
            passedChecks,
            totalChecks,
            tokenInfo: {
                address: TOKEN_ADDRESS,
                name, symbol, decimals: Number(decimals),
                totalSupply: ethers.formatUnits(totalSupply, decimals),
                owner, currentStage: Number(currentStage),
                tradingEnabled, feeBuy: Number(feeBuy), feeSell: Number(feeSell),
                feeRecipient, ownerBalance: ownerBalanceFormatted
            }
        };
        
    } catch (error) {
        log(`验证失败: ${error.message}`, 'error');
        throw error;
    }
}

// 脚本入口
if (require.main === module) {
    verifyTokenIntegrity()
        .then((result) => {
            if (result.success) {
                log('代币验证脚本执行完成', 'success');
                process.exit(0);
            } else {
                log('代币验证发现问题', 'warning');
                process.exit(1);
            }
        })
        .catch((error) => {
            log('验证脚本执行失败', 'error');
            console.error(error);
            process.exit(1);
        });
}

module.exports = { verifyTokenIntegrity, TOKEN_ADDRESS, FACTORY_ADDRESS, EXPECTED_TOKEN };
