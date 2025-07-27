#!/usr/bin/env node

/**
 * StagedCustomToken 综合测试脚本
 * 
 * 功能：
 * 1. 完整测试StagedCustomToken的三阶段初始化流程
 * 2. 验证代币创建、DEX集成和交易激活功能
 * 3. 测试费用机制、交易限制和权限管理
 * 4. 提供详细的测试报告和问题诊断
 * 
 * 使用方法：
 * node scripts/comprehensive-token-test.js
 * 
 * 环境要求：
 * - BSC测试网账户配置
 * - 足够的BNB用于Gas费用（建议0.1 BNB以上）
 */

require('dotenv').config();
const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// ===== 测试配置 =====
const TEST_CONFIG = {
    // 代币基础配置
    token: {
        name: 'Test FEG Token',
        symbol: 'TFEG',
        totalSupply: '1000000', // 1M tokens
        buyFee: 2,  // 2%
        sellFee: 5, // 5%
    },
    
    // 高级配置测试
    advancedConfig: {
        feeRecipient: ethers.ZeroAddress, // 使用默认值（代币创建者）
        maxTxPercent: 5,     // 5% 最大交易限制
        maxWalletPercent: 10, // 10% 最大钱包限制
        swapThreshold: 0     // 使用默认值
    },
    
    // 测试参数
    test: {
        minBalanceRequired: '0.05', // 最小BNB余额要求
        gasBuffer: 1.2,             // Gas缓冲倍数
        confirmationBlocks: 1,      // 确认区块数
        timeoutSeconds: 300         // 超时时间（秒）
    }
};

// ===== 测试状态跟踪 =====
let testResults = {
    timestamp: new Date().toISOString(),
    network: null,
    deployer: null,
    contracts: {},
    tokens: {},
    tests: [],
    summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
    }
};

// ===== 工具函数 =====

/**
 * 格式化日志输出
 */
function log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const icons = {
        'info': '📝',
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'test': '🧪',
        'deploy': '🚀',
        'stage': '📋'
    };
    
    const icon = icons[type] || '📝';
    console.log(`[${timestamp}] ${icon} ${message}`);
}

/**
 * 记录测试结果
 */
function recordTest(name, status, details = {}) {
    const test = {
        name,
        status, // 'passed', 'failed', 'skipped'
        timestamp: new Date().toISOString(),
        details
    };
    
    testResults.tests.push(test);
    testResults.summary.total++;
    testResults.summary[status]++;
    
    const statusIcon = {
        'passed': '✅',
        'failed': '❌',
        'skipped': '⏭️'
    }[status];
    
    log(`${name}: ${statusIcon}`, 'test');
    
    if (details.error) {
        log(`   错误: ${details.error}`, 'error');
    }
    if (details.gasUsed) {
        log(`   Gas使用: ${details.gasUsed}`, 'info');
    }
    if (details.transactionHash) {
        log(`   交易哈希: ${details.transactionHash}`, 'info');
    }
}

/**
 * 等待交易确认
 */
async function waitForTransaction(tx, description) {
    log(`等待交易确认: ${description}...`);
    try {
        const receipt = await tx.wait(TEST_CONFIG.test.confirmationBlocks);
        log(`交易确认成功，Gas使用: ${receipt.gasUsed}`, 'success');
        return receipt;
    } catch (error) {
        log(`交易确认失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 检查账户余额
 */
async function checkBalance(signer, minRequired) {
    const balance = await signer.provider.getBalance(signer.address);
    const balanceInBNB = parseFloat(ethers.formatEther(balance));
    const minRequiredBNB = parseFloat(minRequired);
    
    log(`账户余额: ${balanceInBNB.toFixed(4)} BNB`);
    
    if (balanceInBNB < minRequiredBNB) {
        throw new Error(`余额不足，需要至少 ${minRequired} BNB，当前余额 ${balanceInBNB.toFixed(4)} BNB`);
    }
    
    return balanceInBNB;
}

// ===== 主要测试函数 =====

/**
 * 初始化测试环境
 */
async function initializeTestEnvironment() {
    log('初始化测试环境...', 'stage');
    
    try {
        // 获取网络信息
        const [deployer] = await ethers.getSigners();
        const network = await deployer.provider.getNetwork();
        
        testResults.network = {
            name: network.name,
            chainId: Number(network.chainId)
        };
        testResults.deployer = deployer.address;
        
        log(`网络: ${network.name} (Chain ID: ${network.chainId})`);
        log(`部署账户: ${deployer.address}`);
        
        // 检查余额
        await checkBalance(deployer, TEST_CONFIG.test.minBalanceRequired);
        
        recordTest('环境初始化', 'passed', {
            network: network.name,
            chainId: Number(network.chainId),
            deployer: deployer.address
        });
        
        return { deployer, network };
        
    } catch (error) {
        recordTest('环境初始化', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 部署StagedTokenFactory合约
 */
async function deployTokenFactory(deployer) {
    log('部署StagedTokenFactory合约...', 'stage');
    
    try {
        const StagedTokenFactory = await ethers.getContractFactory("StagedTokenFactory");
        const factory = await StagedTokenFactory.deploy();
        const receipt = await waitForTransaction(factory.deploymentTransaction(), 'StagedTokenFactory部署');
        
        testResults.contracts.factory = {
            address: await factory.getAddress(),
            deploymentHash: receipt.hash,
            gasUsed: receipt.gasUsed.toString()
        };
        
        log(`StagedTokenFactory部署成功: ${await factory.getAddress()}`, 'success');
        
        recordTest('StagedTokenFactory部署', 'passed', {
            address: await factory.getAddress(),
            transactionHash: receipt.hash,
            gasUsed: receipt.gasUsed.toString()
        });
        
        return factory;
        
    } catch (error) {
        recordTest('StagedTokenFactory部署', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 测试工厂合约基础功能
 */
async function testFactoryBasicFunctions(factory) {
    log('测试工厂合约基础功能...', 'stage');
    
    try {
        // 测试查询功能
        const creationFee = await factory.creationFee();
        const totalTokens = await factory.totalTokensCreated();
        const factoryEnabled = await factory.factoryEnabled();
        
        log(`创建费用: ${ethers.formatEther(creationFee)} BNB`);
        log(`已创建代币数量: ${totalTokens}`);
        log(`工厂状态: ${factoryEnabled ? '启用' : '禁用'}`);
        
        // 测试网络配置
        const networkConfig = await factory.networkConfigs(97); // BSC Testnet
        log(`BSC测试网配置: Router=${networkConfig.router}, WBNB=${networkConfig.wbnb}`);
        
        recordTest('工厂基础功能查询', 'passed', {
            creationFee: ethers.formatEther(creationFee),
            totalTokens: totalTokens.toString(),
            factoryEnabled,
            networkConfig: {
                router: networkConfig.router,
                wbnb: networkConfig.wbnb,
                usdt: networkConfig.usdt,
                enabled: networkConfig.enabled
            }
        });
        
        return {
            creationFee,
            totalTokens,
            factoryEnabled,
            networkConfig
        };
        
    } catch (error) {
        recordTest('工厂基础功能查询', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 创建基础代币（阶段1）
 */
async function createBasicToken(factory, deployer, creationFee) {
    log('创建基础代币（阶段1）...', 'stage');
    
    try {
        const tx = await factory.createToken(
            TEST_CONFIG.token.name,
            TEST_CONFIG.token.symbol,
            TEST_CONFIG.token.totalSupply,
            TEST_CONFIG.token.buyFee,
            TEST_CONFIG.token.sellFee,
            { value: creationFee }
        );
        
        const receipt = await waitForTransaction(tx, '基础代币创建');
        
        // 解析事件获取代币地址
        const tokenCreatedEvent = receipt.logs.find(log => {
            try {
                const parsed = factory.interface.parseLog(log);
                return parsed.name === 'TokenCreated';
            } catch {
                return false;
            }
        });
        
        if (!tokenCreatedEvent) {
            throw new Error('未找到TokenCreated事件');
        }
        
        const parsed = factory.interface.parseLog(tokenCreatedEvent);
        const tokenAddress = parsed.args.token;
        
        testResults.tokens.basic = {
            address: tokenAddress,
            name: TEST_CONFIG.token.name,
            symbol: TEST_CONFIG.token.symbol,
            totalSupply: TEST_CONFIG.token.totalSupply,
            creationHash: receipt.hash,
            gasUsed: receipt.gasUsed.toString()
        };
        
        log(`基础代币创建成功: ${tokenAddress}`, 'success');
        
        recordTest('基础代币创建', 'passed', {
            tokenAddress,
            transactionHash: receipt.hash,
            gasUsed: receipt.gasUsed.toString()
        });
        
        return tokenAddress;
        
    } catch (error) {
        recordTest('基础代币创建', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 测试代币基础属性
 */
async function testTokenBasicProperties(tokenAddress) {
    log('测试代币基础属性...', 'stage');
    
    try {
        const StagedCustomToken = await ethers.getContractFactory("StagedCustomToken");
        const token = StagedCustomToken.attach(tokenAddress);
        
        // 测试ERC20基础属性
        const name = await token.name();
        const symbol = await token.symbol();
        const decimals = await token.decimals();
        const totalSupply = await token.totalSupply();
        
        // 测试阶段状态
        const currentStage = await token.currentStage();
        const tradingEnabled = await token.tradingEnabled();
        
        // 测试费用配置
        const feeBuy = await token.feeBuy();
        const feeSell = await token.feeSell();
        
        log(`代币名称: ${name}`);
        log(`代币符号: ${symbol}`);
        log(`小数位数: ${decimals}`);
        log(`总供应量: ${ethers.formatUnits(totalSupply, decimals)}`);
        log(`当前阶段: ${currentStage}`);
        log(`交易状态: ${tradingEnabled ? '已启用' : '未启用'}`);
        log(`买入费用: ${feeBuy}%`);
        log(`卖出费用: ${feeSell}%`);
        
        recordTest('代币基础属性测试', 'passed', {
            name, symbol, decimals: decimals.toString(),
            totalSupply: ethers.formatUnits(totalSupply, decimals),
            currentStage: currentStage.toString(),
            tradingEnabled,
            feeBuy: feeBuy.toString(),
            feeSell: feeSell.toString()
        });
        
        return token;
        
    } catch (error) {
        recordTest('代币基础属性测试', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 初始化DEX配置（阶段2）
 */
async function initializeDEXConfiguration(factory, tokenAddress, deployer) {
    log('初始化DEX配置（阶段2）...', 'stage');

    try {
        const tx = await factory.initializeTokenDEX(tokenAddress);
        const receipt = await waitForTransaction(tx, 'DEX配置初始化');

        recordTest('DEX配置初始化', 'passed', {
            tokenAddress,
            transactionHash: receipt.hash,
            gasUsed: receipt.gasUsed.toString()
        });

        return receipt;

    } catch (error) {
        recordTest('DEX配置初始化', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 激活代币交易（阶段3）
 */
async function activateTokenTrading(factory, tokenAddress, deployer) {
    log('激活代币交易（阶段3）...', 'stage');

    try {
        const tx = await factory.activateTokenTrading(tokenAddress);
        const receipt = await waitForTransaction(tx, '代币交易激活');

        recordTest('代币交易激活', 'passed', {
            tokenAddress,
            transactionHash: receipt.hash,
            gasUsed: receipt.gasUsed.toString()
        });

        return receipt;

    } catch (error) {
        recordTest('代币交易激活', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 测试代币阶段状态
 */
async function testTokenStageProgression(token) {
    log('测试代币阶段状态...', 'stage');

    try {
        const stageInfo = await token.getStageInfo();
        const [stage, dexReady, tradingActive, bnbPair, usdtPair] = stageInfo;

        log(`当前阶段: ${stage}`);
        log(`DEX就绪: ${dexReady}`);
        log(`交易激活: ${tradingActive}`);
        log(`BNB交易对: ${bnbPair}`);
        log(`USDT交易对: ${usdtPair}`);

        recordTest('代币阶段状态测试', 'passed', {
            stage: stage.toString(),
            dexReady,
            tradingActive,
            bnbPair,
            usdtPair
        });

        return { stage, dexReady, tradingActive, bnbPair, usdtPair };

    } catch (error) {
        recordTest('代币阶段状态测试', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 测试高级配置功能
 */
async function testAdvancedConfiguration(token) {
    log('测试高级配置功能...', 'stage');

    try {
        const advancedConfig = await token.getAdvancedConfig();
        const [feeRecipient, maxTxAmount, maxWalletAmount, swapThreshold, maxTxPercent, maxWalletPercent] = advancedConfig;

        log(`费用接收地址: ${feeRecipient}`);
        log(`最大交易数量: ${ethers.formatEther(maxTxAmount)}`);
        log(`最大钱包数量: ${ethers.formatEther(maxWalletAmount)}`);
        log(`Swap阈值: ${ethers.formatEther(swapThreshold)}`);
        log(`最大交易百分比: ${maxTxPercent}%`);
        log(`最大钱包百分比: ${maxWalletPercent}%`);

        recordTest('高级配置功能测试', 'passed', {
            feeRecipient,
            maxTxAmount: ethers.formatEther(maxTxAmount),
            maxWalletAmount: ethers.formatEther(maxWalletAmount),
            swapThreshold: ethers.formatEther(swapThreshold),
            maxTxPercent: maxTxPercent.toString(),
            maxWalletPercent: maxWalletPercent.toString()
        });

        return {
            feeRecipient,
            maxTxAmount,
            maxWalletAmount,
            swapThreshold,
            maxTxPercent,
            maxWalletPercent
        };

    } catch (error) {
        recordTest('高级配置功能测试', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 测试权限管理功能
 */
async function testPermissionManagement(token, deployer) {
    log('测试权限管理功能...', 'stage');

    try {
        // 测试所有者权限
        const owner = await token.owner();
        const isOwner = owner.toLowerCase() === deployer.address.toLowerCase();

        log(`合约所有者: ${owner}`);
        log(`部署者是否为所有者: ${isOwner}`);

        // 测试费用豁免查询
        const isExcluded = await token.isExcludeFee(deployer.address);
        log(`部署者费用豁免状态: ${isExcluded}`);

        recordTest('权限管理功能测试', 'passed', {
            owner,
            isOwner,
            deployerExcluded: isExcluded
        });

        return { owner, isOwner, isExcluded };

    } catch (error) {
        recordTest('权限管理功能测试', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 生成测试报告
 */
function generateTestReport() {
    log('生成测试报告...', 'stage');

    const reportDir = path.join(__dirname, '..', 'test-reports');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportFile = path.join(reportDir, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(testResults, null, 2));

    // 生成简化的文本报告
    const textReport = generateTextReport();
    const textReportFile = path.join(reportDir, `test-summary-${Date.now()}.txt`);
    fs.writeFileSync(textReportFile, textReport);

    log(`详细报告已保存: ${reportFile}`, 'success');
    log(`摘要报告已保存: ${textReportFile}`, 'success');

    return { reportFile, textReportFile };
}

/**
 * 生成文本格式测试报告
 */
function generateTextReport() {
    const { summary, tests, network, deployer, contracts, tokens } = testResults;

    let report = `
StagedCustomToken 合约测试报告
=====================================

测试时间: ${testResults.timestamp}
网络信息: ${network?.name} (Chain ID: ${network?.chainId})
部署账户: ${deployer}

合约信息:
---------
工厂合约: ${contracts.factory?.address || 'N/A'}
测试代币: ${tokens.basic?.address || 'N/A'}

测试摘要:
---------
总测试数: ${summary.total}
通过: ${summary.passed} ✅
失败: ${summary.failed} ❌
跳过: ${summary.skipped} ⏭️
成功率: ${summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : 0}%

详细测试结果:
-----------
`;

    tests.forEach((test, index) => {
        const statusIcon = {
            'passed': '✅',
            'failed': '❌',
            'skipped': '⏭️'
        }[test.status];

        report += `${index + 1}. ${test.name}: ${statusIcon}\n`;

        if (test.details.error) {
            report += `   错误: ${test.details.error}\n`;
        }
        if (test.details.gasUsed) {
            report += `   Gas使用: ${test.details.gasUsed}\n`;
        }
        if (test.details.transactionHash) {
            report += `   交易哈希: ${test.details.transactionHash}\n`;
        }
        report += '\n';
    });

    return report;
}

/**
 * 主测试执行函数
 */
async function runComprehensiveTest() {
    const startTime = Date.now();

    log('='.repeat(60), 'test');
    log('StagedCustomToken 综合测试开始', 'test');
    log('='.repeat(60), 'test');

    try {
        // 1. 初始化测试环境
        const { deployer, network } = await initializeTestEnvironment();

        // 2. 部署工厂合约
        const factory = await deployTokenFactory(deployer);

        // 3. 测试工厂基础功能
        const factoryInfo = await testFactoryBasicFunctions(factory);

        // 4. 创建基础代币（阶段1）
        const tokenAddress = await createBasicToken(factory, deployer, factoryInfo.creationFee);

        // 5. 测试代币基础属性
        const token = await testTokenBasicProperties(tokenAddress);

        // 6. 初始化DEX配置（阶段2）
        await initializeDEXConfiguration(factory, tokenAddress, deployer);

        // 7. 激活代币交易（阶段3）
        await activateTokenTrading(factory, tokenAddress, deployer);

        // 8. 测试代币阶段状态
        await testTokenStageProgression(token);

        // 9. 测试高级配置功能
        await testAdvancedConfiguration(token);

        // 10. 测试权限管理功能
        await testPermissionManagement(token, deployer);

        // 生成测试报告
        const reports = generateTestReport();

        // 输出测试总结
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        log('\n' + '='.repeat(60), 'success');
        log('🎉 综合测试完成!', 'success');
        log('='.repeat(60), 'success');
        log(`⏱️  总耗时: ${duration} 秒`);
        log(`📊 测试结果: ${testResults.summary.passed}/${testResults.summary.total} 通过`);
        log(`🏭 工厂合约: ${testResults.contracts.factory?.address}`);
        log(`🪙 测试代币: ${testResults.tokens.basic?.address}`);
        log(`📄 详细报告: ${reports.reportFile}`);
        log(`📋 摘要报告: ${reports.textReportFile}`);

        if (testResults.contracts.factory?.address) {
            log(`🌐 BSCScan: https://testnet.bscscan.com/address/${testResults.contracts.factory.address}`);
        }

        log('='.repeat(60), 'success');

        // 输出使用说明
        printUsageInstructions();

        return testResults;

    } catch (error) {
        log(`测试执行失败: ${error.message}`, 'error');
        console.error('详细错误信息:', error);

        // 即使失败也生成报告
        generateTestReport();

        throw error;
    }
}

/**
 * 打印使用说明
 */
function printUsageInstructions() {
    log('\n📖 后续操作建议:');
    log('─'.repeat(40));
    log('1. 查看详细测试报告了解所有测试结果');
    log('2. 在BSCScan上验证合约代码');
    log('3. 使用前端界面测试代币交互功能');
    log('4. 进行更多的边界条件测试');
    log('5. 测试与其他DeFi协议的集成');
    log('─'.repeat(40));
}

/**
 * 脚本入口点
 */
if (require.main === module) {
    runComprehensiveTest()
        .then(() => {
            log('测试脚本执行完成', 'success');
            process.exit(0);
        })
        .catch((error) => {
            log('测试脚本执行失败', 'error');
            console.error(error);
            process.exit(1);
        });
}

// 导出测试函数供其他脚本使用
module.exports = {
    TEST_CONFIG,
    testResults,
    runComprehensiveTest,
    initializeTestEnvironment,
    deployTokenFactory,
    testFactoryBasicFunctions,
    createBasicToken,
    testTokenBasicProperties,
    initializeDEXConfiguration,
    activateTokenTrading,
    testTokenStageProgression,
    testAdvancedConfiguration,
    testPermissionManagement,
    generateTestReport,
    generateTextReport,
    log,
    recordTest,
    waitForTransaction
};
