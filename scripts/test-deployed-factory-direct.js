#!/usr/bin/env node

/**
 * 直接测试已部署的StagedTokenFactory合约
 * 使用预定义的ABI，无需重新编译
 */

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// ===== 配置常量 =====
const BSC_TESTNET_CONFIG = {
    chainId: 97,
    name: 'BSC Testnet',
    rpcUrl: 'https://bsc-testnet.public.blastapi.io',
    blockExplorer: 'https://testnet.bscscan.com'
};

// 已部署的工厂合约地址
const FACTORY_ADDRESS = '0x073faD54A73333EC1671522b9cCCbbBd153DA265';

// 测试代币配置
const TEST_TOKEN_CONFIG = {
    name: 'FEG Test Token',
    symbol: 'FEGT',
    totalSupply: '1000000',
    buyFee: 2,
    sellFee: 5,
};

// 工厂合约ABI（从部署记录中提取的关键函数）
const FACTORY_ABI = [
    "function creationFee() view returns (uint256)",
    "function totalTokensCreated() view returns (uint256)",
    "function factoryEnabled() view returns (bool)",
    "function owner() view returns (address)",
    "function getAllTokensLength() view returns (uint256)",
    "function networkConfigs(uint256) view returns (address router, address wbnb, address usdt, bool enabled)",
    "function createToken(string name, string symbol, uint256 totalSupply, uint256 feeBuy, uint256 feeSell) payable returns (address)",
    "function initializeTokenDEX(address tokenAddress)",
    "function activateTokenTrading(address tokenAddress)",
    "event TokenCreated(address indexed token, address indexed creator, string name, string symbol, uint256 totalSupply, uint256 timestamp)"
];

// 代币合约ABI（基础ERC20 + 自定义函数）
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

// 测试结果记录
let testResults = {
    timestamp: new Date().toISOString(),
    network: BSC_TESTNET_CONFIG,
    factoryAddress: FACTORY_ADDRESS,
    deployer: null,
    tests: [],
    gasUsage: {},
    contracts: {},
    summary: { total: 0, passed: 0, failed: 0, totalGasUsed: 0 }
};

// ===== 工具函数 =====

function log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const icons = {
        'info': '📝', 'success': '✅', 'error': '❌', 'warning': '⚠️',
        'test': '🧪', 'deploy': '🚀', 'verify': '🔍'
    };
    console.log(`[${timestamp}] ${icons[type] || '📝'} ${message}`);
}

function recordTest(name, status, details = {}) {
    const test = { name, status, timestamp: new Date().toISOString(), details };
    testResults.tests.push(test);
    testResults.summary.total++;
    testResults.summary[status]++;
    
    if (details.gasUsed) {
        testResults.summary.totalGasUsed += parseInt(details.gasUsed);
    }
    
    const statusIcon = status === 'passed' ? '✅' : '❌';
    log(`${name}: ${statusIcon}`, 'test');
    
    if (details.error) log(`   错误: ${details.error}`, 'error');
    if (details.gasUsed) log(`   Gas使用: ${details.gasUsed}`, 'info');
    if (details.transactionHash) {
        log(`   交易哈希: ${details.transactionHash}`, 'info');
        log(`   BSCScan: ${BSC_TESTNET_CONFIG.blockExplorer}/tx/${details.transactionHash}`, 'info');
    }
}

// ===== 主要测试函数 =====

/**
 * 初始化Web3连接
 */
async function initializeConnection() {
    log('初始化BSC测试网连接...', 'test');
    
    try {
        const provider = new ethers.JsonRpcProvider(BSC_TESTNET_CONFIG.rpcUrl);
        const privateKey = process.env.BSC_TESTNET_DEPLOYER_KEY || process.env.PRIVATE_KEY;
        
        if (!privateKey) {
            throw new Error('未找到私钥配置，请检查.env文件中的BSC_TESTNET_DEPLOYER_KEY或PRIVATE_KEY');
        }
        
        const wallet = new ethers.Wallet(privateKey, provider);
        const network = await provider.getNetwork();
        const balance = await provider.getBalance(wallet.address);
        
        testResults.deployer = wallet.address;
        
        log(`网络: ${network.name} (Chain ID: ${network.chainId})`);
        log(`部署账户: ${wallet.address}`);
        log(`账户余额: ${ethers.formatEther(balance)} BNB`);
        
        if (Number(network.chainId) !== BSC_TESTNET_CONFIG.chainId) {
            throw new Error(`网络不匹配，期望Chain ID: ${BSC_TESTNET_CONFIG.chainId}, 实际: ${network.chainId}`);
        }
        
        const balanceInBNB = parseFloat(ethers.formatEther(balance));
        if (balanceInBNB < 0.05) {
            log('账户余额较低，建议至少有0.05 BNB用于测试', 'warning');
        }
        
        recordTest('环境初始化', 'passed', {
            network: network.name,
            chainId: Number(network.chainId),
            deployer: wallet.address,
            balance: ethers.formatEther(balance)
        });
        
        return { provider, wallet, network, balance };
        
    } catch (error) {
        recordTest('环境初始化', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 验证工厂合约基础功能
 */
async function verifyFactoryContract(wallet) {
    log('验证工厂合约基础功能...', 'verify');
    
    try {
        const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, wallet);
        
        // 验证合约是否存在
        const code = await wallet.provider.getCode(FACTORY_ADDRESS);
        if (code === '0x') {
            throw new Error('指定地址没有部署合约');
        }
        
        // 查询基础信息
        const creationFee = await factory.creationFee();
        const totalTokens = await factory.totalTokensCreated();
        const factoryEnabled = await factory.factoryEnabled();
        const owner = await factory.owner();
        const allTokensLength = await factory.getAllTokensLength();
        
        log(`创建费用: ${ethers.formatEther(creationFee)} BNB`);
        log(`已创建代币数量: ${totalTokens}`);
        log(`工厂状态: ${factoryEnabled ? '启用' : '禁用'}`);
        log(`合约所有者: ${owner}`);
        log(`代币列表长度: ${allTokensLength}`);
        
        // 验证网络配置
        const networkConfig = await factory.networkConfigs(BSC_TESTNET_CONFIG.chainId);
        log(`BSC测试网配置验证:`);
        log(`  Router: ${networkConfig.router}`);
        log(`  WBNB: ${networkConfig.wbnb}`);
        log(`  USDT: ${networkConfig.usdt}`);
        log(`  启用状态: ${networkConfig.enabled}`);
        
        if (!networkConfig.enabled) {
            throw new Error('BSC测试网配置未启用');
        }
        
        if (!factoryEnabled) {
            throw new Error('工厂合约已禁用');
        }
        
        testResults.contracts.factory = {
            address: FACTORY_ADDRESS,
            creationFee: ethers.formatEther(creationFee),
            totalTokens: totalTokens.toString(),
            factoryEnabled,
            owner,
            networkConfig: {
                router: networkConfig.router,
                wbnb: networkConfig.wbnb,
                usdt: networkConfig.usdt,
                enabled: networkConfig.enabled
            }
        };
        
        recordTest('工厂基础功能验证', 'passed', {
            creationFee: ethers.formatEther(creationFee),
            totalTokens: totalTokens.toString(),
            factoryEnabled,
            networkConfigEnabled: networkConfig.enabled
        });
        
        return { factory, creationFee, totalTokens, factoryEnabled, owner, networkConfig };
        
    } catch (error) {
        recordTest('工厂基础功能验证', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 测试代币创建功能
 */
async function testTokenCreation(factory, wallet, creationFee) {
    log('测试代币创建功能...', 'test');
    
    try {
        const { name, symbol, totalSupply, buyFee, sellFee } = TEST_TOKEN_CONFIG;
        
        log(`创建代币配置:`);
        log(`  名称: ${name}`);
        log(`  符号: ${symbol}`);
        log(`  总供应量: ${totalSupply}`);
        log(`  买入费用: ${buyFee}%`);
        log(`  卖出费用: ${sellFee}%`);
        log(`  创建费用: ${ethers.formatEther(creationFee)} BNB`);
        
        // 估算Gas
        const gasEstimate = await factory.createToken.estimateGas(
            name, symbol, totalSupply, buyFee, sellFee,
            { value: creationFee }
        );
        
        log(`Gas估算: ${gasEstimate}`);
        
        // 创建代币
        const tx = await factory.createToken(
            name, symbol, totalSupply, buyFee, sellFee,
            {
                value: creationFee,
                gasLimit: Math.floor(Number(gasEstimate) * 1.2)
            }
        );
        
        log(`交易已发送: ${tx.hash}`);
        log(`等待交易确认...`);
        
        const receipt = await tx.wait();
        log(`交易确认成功，Gas使用: ${receipt.gasUsed}`, 'success');
        
        // 解析TokenCreated事件
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
        const creator = parsed.args.creator;
        
        log(`代币创建成功!`, 'success');
        log(`代币地址: ${tokenAddress}`);
        log(`创建者: ${creator}`);
        log(`BSCScan: ${BSC_TESTNET_CONFIG.blockExplorer}/address/${tokenAddress}`);
        
        testResults.contracts.token = {
            address: tokenAddress,
            name, symbol, totalSupply, buyFee, sellFee,
            creator,
            creationHash: receipt.hash,
            gasUsed: receipt.gasUsed.toString()
        };
        
        recordTest('代币创建', 'passed', {
            tokenAddress,
            creator,
            transactionHash: receipt.hash,
            gasUsed: receipt.gasUsed.toString()
        });
        
        return { tokenAddress, creator, receipt, gasUsed: receipt.gasUsed };
        
    } catch (error) {
        recordTest('代币创建', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 验证代币合约功能
 */
async function verifyTokenContract(tokenAddress, wallet) {
    log('验证代币合约功能...', 'verify');

    try {
        const token = new ethers.Contract(tokenAddress, TOKEN_ABI, wallet);

        // 验证ERC20基础属性
        const name = await token.name();
        const symbol = await token.symbol();
        const decimals = await token.decimals();
        const totalSupply = await token.totalSupply();
        const owner = await token.owner();

        // 验证阶段状态
        const currentStage = await token.currentStage();
        const tradingEnabled = await token.tradingEnabled();

        // 验证费用配置
        const feeBuy = await token.feeBuy();
        const feeSell = await token.feeSell();
        const feeRecipient = await token.feeRecipient();

        log(`代币验证结果:`);
        log(`  名称: ${name}`);
        log(`  符号: ${symbol}`);
        log(`  小数位数: ${decimals}`);
        log(`  总供应量: ${ethers.formatUnits(totalSupply, decimals)}`);
        log(`  所有者: ${owner}`);
        log(`  当前阶段: ${currentStage} (${['BASIC', 'DEX_READY', 'FULLY_ACTIVE'][currentStage]})`);
        log(`  交易状态: ${tradingEnabled ? '已启用' : '未启用'}`);
        log(`  买入费用: ${feeBuy}%`);
        log(`  卖出费用: ${feeSell}%`);
        log(`  费用接收地址: ${feeRecipient}`);

        // 验证配置是否正确
        if (name !== TEST_TOKEN_CONFIG.name) {
            throw new Error(`代币名称不匹配，期望: ${TEST_TOKEN_CONFIG.name}, 实际: ${name}`);
        }
        if (symbol !== TEST_TOKEN_CONFIG.symbol) {
            throw new Error(`代币符号不匹配，期望: ${TEST_TOKEN_CONFIG.symbol}, 实际: ${symbol}`);
        }
        if (Number(currentStage) !== 0) {
            throw new Error(`初始阶段应该是BASIC(0)，实际: ${currentStage}`);
        }
        if (tradingEnabled) {
            throw new Error('初始状态交易应该未启用');
        }

        recordTest('代币合约验证', 'passed', {
            name, symbol, decimals: decimals.toString(),
            totalSupply: ethers.formatUnits(totalSupply, decimals),
            owner, currentStage: currentStage.toString(),
            tradingEnabled, feeBuy: feeBuy.toString(), feeSell: feeSell.toString()
        });

        return {
            token, name, symbol, decimals, totalSupply, owner,
            currentStage, tradingEnabled, feeBuy, feeSell, feeRecipient
        };

    } catch (error) {
        recordTest('代币合约验证', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 测试DEX初始化（阶段2）
 */
async function testDEXInitialization(factory, tokenAddress, wallet) {
    log('测试DEX初始化（阶段2）...', 'test');

    try {
        const tx = await factory.initializeTokenDEX(tokenAddress);
        log(`交易已发送: ${tx.hash}`);
        log(`等待交易确认...`);

        const receipt = await tx.wait();
        log(`交易确认成功，Gas使用: ${receipt.gasUsed}`, 'success');

        // 验证阶段状态变化
        const token = new ethers.Contract(tokenAddress, TOKEN_ABI, wallet);
        const currentStage = await token.currentStage();

        if (Number(currentStage) !== 1) {
            throw new Error(`DEX初始化后阶段应该是DEX_READY(1)，实际: ${currentStage}`);
        }

        log(`DEX初始化成功，当前阶段: ${currentStage} (DEX_READY)`, 'success');

        recordTest('DEX初始化', 'passed', {
            tokenAddress,
            currentStage: currentStage.toString(),
            transactionHash: receipt.hash,
            gasUsed: receipt.gasUsed.toString()
        });

        return { receipt, currentStage, gasUsed: receipt.gasUsed };

    } catch (error) {
        recordTest('DEX初始化', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 测试交易激活（阶段3）
 */
async function testTradingActivation(factory, tokenAddress, wallet) {
    log('测试交易激活（阶段3）...', 'test');

    try {
        const tx = await factory.activateTokenTrading(tokenAddress);
        log(`交易已发送: ${tx.hash}`);
        log(`等待交易确认...`);

        const receipt = await tx.wait();
        log(`交易确认成功，Gas使用: ${receipt.gasUsed}`, 'success');

        // 验证最终状态
        const token = new ethers.Contract(tokenAddress, TOKEN_ABI, wallet);
        const currentStage = await token.currentStage();
        const tradingEnabled = await token.tradingEnabled();
        const stageInfo = await token.getStageInfo();

        if (Number(currentStage) !== 2) {
            throw new Error(`交易激活后阶段应该是FULLY_ACTIVE(2)，实际: ${currentStage}`);
        }
        if (!tradingEnabled) {
            throw new Error('交易激活后交易状态应该为启用');
        }

        const [stage, dexReady, tradingActive, bnbPair, usdtPair] = stageInfo;

        log(`交易激活成功!`, 'success');
        log(`  当前阶段: ${stage} (FULLY_ACTIVE)`);
        log(`  DEX就绪: ${dexReady}`);
        log(`  交易激活: ${tradingActive}`);
        log(`  BNB交易对: ${bnbPair}`);
        log(`  USDT交易对: ${usdtPair}`);

        recordTest('交易激活', 'passed', {
            tokenAddress,
            currentStage: stage.toString(),
            tradingEnabled: tradingActive,
            bnbPair, usdtPair,
            transactionHash: receipt.hash,
            gasUsed: receipt.gasUsed.toString()
        });

        return {
            receipt, currentStage: stage, tradingEnabled: tradingActive,
            bnbPair, usdtPair, gasUsed: receipt.gasUsed
        };

    } catch (error) {
        recordTest('交易激活', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 测试高级配置功能
 */
async function testAdvancedConfiguration(tokenAddress, wallet) {
    log('测试高级配置功能...', 'verify');

    try {
        const token = new ethers.Contract(tokenAddress, TOKEN_ABI, wallet);
        const advancedConfig = await token.getAdvancedConfig();
        const [feeRecipient, maxTxAmount, maxWalletAmount, swapThreshold, maxTxPercent, maxWalletPercent] = advancedConfig;

        log(`高级配置信息:`);
        log(`  费用接收地址: ${feeRecipient}`);
        log(`  最大交易数量: ${ethers.formatEther(maxTxAmount)}`);
        log(`  最大钱包数量: ${ethers.formatEther(maxWalletAmount)}`);
        log(`  Swap阈值: ${ethers.formatEther(swapThreshold)}`);
        log(`  最大交易百分比: ${maxTxPercent}%`);
        log(`  最大钱包百分比: ${maxWalletPercent}%`);

        recordTest('高级配置验证', 'passed', {
            feeRecipient,
            maxTxAmount: ethers.formatEther(maxTxAmount),
            maxWalletAmount: ethers.formatEther(maxWalletAmount),
            swapThreshold: ethers.formatEther(swapThreshold),
            maxTxPercent: maxTxPercent.toString(),
            maxWalletPercent: maxWalletPercent.toString()
        });

        return {
            feeRecipient, maxTxAmount, maxWalletAmount,
            swapThreshold, maxTxPercent, maxWalletPercent
        };

    } catch (error) {
        recordTest('高级配置验证', 'failed', { error: error.message });
        throw error;
    }
}

/**
 * 生成测试报告
 */
function generateTestReport() {
    log('生成测试报告...', 'info');

    try {
        const reportDir = path.join(__dirname, '..', 'test-reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportFile = path.join(reportDir, `bsc-factory-test-${timestamp}.json`);

        const successRate = testResults.summary.total > 0
            ? ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)
            : 0;

        const finalReport = {
            ...testResults,
            summary: {
                ...testResults.summary,
                successRate: `${successRate}%`,
                totalGasUsedBNB: ethers.formatEther(testResults.summary.totalGasUsed.toString())
            }
        };

        fs.writeFileSync(reportFile, JSON.stringify(finalReport, null, 2));

        // 生成文本摘要
        const textSummary = generateTextSummary(finalReport);
        const summaryFile = path.join(reportDir, `bsc-factory-summary-${timestamp}.txt`);
        fs.writeFileSync(summaryFile, textSummary);

        log(`详细报告已保存: ${reportFile}`, 'success');
        log(`摘要报告已保存: ${summaryFile}`, 'success');

        return { reportFile, summaryFile, finalReport };

    } catch (error) {
        log(`生成测试报告失败: ${error.message}`, 'error');
        return null;
    }
}

/**
 * 生成文本格式摘要
 */
function generateTextSummary(report) {
    const { summary, tests, contracts, network, deployer } = report;

    let text = `
StagedTokenFactory BSC测试网测试报告
=====================================

测试时间: ${report.timestamp}
网络: ${network.name} (Chain ID: ${network.chainId})
测试账户: ${deployer}

合约信息:
---------
工厂合约: ${contracts.factory?.address || 'N/A'}
测试代币: ${contracts.token?.address || 'N/A'}

测试摘要:
---------
总测试数: ${summary.total}
通过: ${summary.passed} ✅
失败: ${summary.failed} ❌
成功率: ${summary.successRate}
总Gas消耗: ${summary.totalGasUsedBNB} BNB

详细测试结果:
-----------
`;

    tests.forEach((test, index) => {
        const statusIcon = test.status === 'passed' ? '✅' : '❌';
        text += `${index + 1}. ${test.name}: ${statusIcon}\n`;

        if (test.details.error) {
            text += `   错误: ${test.details.error}\n`;
        }
        if (test.details.gasUsed) {
            text += `   Gas使用: ${test.details.gasUsed}\n`;
        }
        if (test.details.transactionHash) {
            text += `   交易: ${network.blockExplorer}/tx/${test.details.transactionHash}\n`;
        }
        text += '\n';
    });

    if (contracts.factory?.address) {
        text += `\nBSCScan链接:\n`;
        text += `工厂合约: ${network.blockExplorer}/address/${contracts.factory.address}\n`;
        if (contracts.token?.address) {
            text += `测试代币: ${network.blockExplorer}/address/${contracts.token.address}\n`;
        }
    }

    return text;
}

/**
 * 主测试执行函数
 */
async function runBSCFactoryTest() {
    const startTime = Date.now();

    log('='.repeat(60), 'test');
    log('BSC测试网 StagedTokenFactory 合约功能测试开始', 'test');
    log(`工厂合约地址: ${FACTORY_ADDRESS}`, 'test');
    log('='.repeat(60), 'test');

    try {
        // 1. 初始化连接
        log('\n📋 步骤1: 初始化BSC测试网连接');
        const { provider, wallet, network, balance } = await initializeConnection();

        // 2. 验证工厂合约
        log('\n🔍 步骤2: 验证工厂合约基础功能');
        const factoryInfo = await verifyFactoryContract(wallet);

        // 3. 测试代币创建
        log('\n🪙 步骤3: 测试代币创建功能');
        const tokenCreation = await testTokenCreation(factoryInfo.factory, wallet, factoryInfo.creationFee);

        // 4. 验证代币合约
        log('\n✅ 步骤4: 验证代币合约功能');
        const tokenInfo = await verifyTokenContract(tokenCreation.tokenAddress, wallet);

        // 5. 测试DEX初始化（阶段2）
        log('\n🔄 步骤5: 测试DEX初始化（阶段2）');
        const dexInit = await testDEXInitialization(factoryInfo.factory, tokenCreation.tokenAddress, wallet);

        // 6. 测试交易激活（阶段3）
        log('\n🚀 步骤6: 测试交易激活（阶段3）');
        const tradingActivation = await testTradingActivation(factoryInfo.factory, tokenCreation.tokenAddress, wallet);

        // 7. 测试高级配置
        log('\n⚙️ 步骤7: 测试高级配置功能');
        const advancedConfig = await testAdvancedConfiguration(tokenCreation.tokenAddress, wallet);

        // 8. 生成测试报告
        log('\n📊 步骤8: 生成测试报告');
        const reports = generateTestReport();

        // 9. 输出测试总结
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        log('\n' + '='.repeat(60), 'success');
        log('🎉 BSC测试网 StagedTokenFactory 测试完成!', 'success');
        log('='.repeat(60), 'success');
        log(`⏱️  总耗时: ${duration} 秒`);
        log(`📊 测试结果: ${testResults.summary.passed}/${testResults.summary.total} 通过`);
        log(`💰 总Gas消耗: ${ethers.formatEther(testResults.summary.totalGasUsed.toString())} BNB`);
        log(`🏭 工厂合约: ${FACTORY_ADDRESS}`);
        log(`🪙 测试代币: ${tokenCreation.tokenAddress}`);

        if (reports) {
            log(`📄 详细报告: ${reports.reportFile}`);
            log(`📋 摘要报告: ${reports.summaryFile}`);
        }

        log(`🌐 工厂BSCScan: ${BSC_TESTNET_CONFIG.blockExplorer}/address/${FACTORY_ADDRESS}`);
        log(`🌐 代币BSCScan: ${BSC_TESTNET_CONFIG.blockExplorer}/address/${tokenCreation.tokenAddress}`);
        log('='.repeat(60), 'success');

        // 输出使用建议
        printUsageRecommendations(FACTORY_ADDRESS, tokenCreation.tokenAddress);

        return {
            success: true,
            factoryAddress: FACTORY_ADDRESS,
            tokenAddress: tokenCreation.tokenAddress,
            testResults,
            reports
        };

    } catch (error) {
        log(`测试执行失败: ${error.message}`, 'error');
        console.error('详细错误信息:', error);

        // 即使失败也生成报告
        const reports = generateTestReport();

        return {
            success: false,
            error: error.message,
            testResults,
            reports
        };
    }
}

/**
 * 打印使用建议
 */
function printUsageRecommendations(factoryAddress, tokenAddress) {
    log('\n📖 后续操作建议:');
    log('─'.repeat(50));
    log('1. 合约验证:');
    log(`   在BSCScan上验证工厂合约源码`);
    log(`   ${BSC_TESTNET_CONFIG.blockExplorer}/address/${factoryAddress}#code`);

    log('\n2. 代币功能测试:');
    log(`   测试代币转账功能`);
    log(`   验证费用机制是否正常工作`);
    log(`   测试交易限制功能`);

    log('\n3. DEX集成测试:');
    log(`   在PancakeSwap测试网添加流动性`);
    log(`   测试买入/卖出功能`);
    log(`   验证费用收取是否正确`);

    log('\n4. 前端集成:');
    log(`   使用Web3.js或ethers.js连接合约`);
    log(`   实现代币创建界面`);
    log(`   添加MetaMask集成`);

    log('\n5. 安全检查:');
    log(`   进行更多边界条件测试`);
    log(`   测试权限管理功能`);
    log(`   验证紧急情况处理`);

    log('\n6. 获取更多测试BNB:');
    log(`   访问 https://testnet.binance.org/faucet-smart`);
    log('─'.repeat(50));
}

/**
 * 脚本入口点
 */
async function main() {
    log(`开始测试BSC测试网上的StagedTokenFactory合约`);
    log(`合约地址: ${FACTORY_ADDRESS}`);

    const result = await runBSCFactoryTest();

    if (result.success) {
        log('测试脚本执行完成', 'success');
        process.exit(0);
    } else {
        log('测试脚本执行失败', 'error');
        process.exit(1);
    }
}

// 脚本入口
if (require.main === module) {
    main().catch((error) => {
        log('脚本执行异常', 'error');
        console.error(error);
        process.exit(1);
    });
}

// 导出主要函数
module.exports = {
    BSC_TESTNET_CONFIG,
    TEST_TOKEN_CONFIG,
    FACTORY_ADDRESS,
    FACTORY_ABI,
    TOKEN_ABI,
    testResults,
    runBSCFactoryTest,
    initializeConnection,
    verifyFactoryContract,
    testTokenCreation,
    verifyTokenContract,
    testDEXInitialization,
    testTradingActivation,
    testAdvancedConfiguration,
    generateTestReport,
    generateTextSummary,
    log,
    recordTest
};
