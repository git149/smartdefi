#!/usr/bin/env node

/**
 * StagedCustomToken 部署和验证脚本
 * 
 * 功能：
 * 1. 编译StagedTokenFactory合约
 * 2. 部署到BSC测试网
 * 3. 创建测试代币并验证功能
 * 4. 生成前端集成代码
 * 5. 提供详细的部署报告
 * 
 * 使用方法：
 * node scripts/deploy-and-verify-staged-token.js
 * 
 * 环境要求：
 * - 配置好的BSC测试网私钥
 * - 足够的BNB用于Gas费用
 */

require('dotenv').config();
const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// ===== 配置常量 =====
const DEPLOYMENT_CONFIG = {
    network: {
        name: 'BSC Testnet',
        chainId: 97,
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
        blockExplorer: 'https://testnet.bscscan.com'
    },
    
    // 测试代币配置
    testToken: {
        name: 'FEG SmartDeFi Token',
        symbol: 'FEG',
        totalSupply: '1000000', // 1M tokens
        buyFee: 1,  // 1%
        sellFee: 4, // 4%
    },
    
    // 高级配置示例
    advancedConfig: {
        feeRecipient: ethers.ZeroAddress, // 使用默认值
        maxTxPercent: 0,     // 使用默认值（无限制）
        maxWalletPercent: 0, // 使用默认值（无限制）
        swapThreshold: 0     // 使用默认值
    },
    
    // 部署选项
    options: {
        createTestToken: true,      // 是否创建测试代币
        useOneClickDeploy: false,   // 是否使用一键部署
        generateFrontendCode: true, // 是否生成前端代码
        saveDeploymentInfo: true    // 是否保存部署信息
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
        'deploy': '🚀',
        'verify': '🔍'
    };
    
    const icon = icons[type] || '📝';
    console.log(`[${timestamp}] ${icon} ${message}`);
}

/**
 * 等待交易确认
 */
async function waitForTransaction(tx, description) {
    log(`等待交易确认: ${description}...`);
    try {
        const receipt = await tx.wait();
        log(`交易确认成功，Gas使用: ${receipt.gasUsed}`, 'success');
        return receipt;
    } catch (error) {
        log(`交易确认失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 检查部署环境
 */
async function checkDeploymentEnvironment() {
    log('检查部署环境...', 'deploy');
    
    try {
        const [deployer] = await ethers.getSigners();
        const network = await deployer.provider.getNetwork();
        const balance = await deployer.provider.getBalance(deployer.address);
        
        log(`网络: ${network.name} (Chain ID: ${network.chainId})`);
        log(`部署账户: ${deployer.address}`);
        log(`账户余额: ${ethers.formatEther(balance)} BNB`);
        
        // 检查网络是否正确
        if (Number(network.chainId) !== DEPLOYMENT_CONFIG.network.chainId) {
            throw new Error(`网络不匹配，期望Chain ID: ${DEPLOYMENT_CONFIG.network.chainId}, 实际: ${network.chainId}`);
        }
        
        // 检查余额是否充足
        const balanceInBNB = parseFloat(ethers.formatEther(balance));
        if (balanceInBNB < 0.05) {
            log('账户余额较低，建议至少有0.05 BNB用于部署和测试', 'warning');
        }
        
        return { deployer, network, balance };
        
    } catch (error) {
        log(`环境检查失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 部署StagedTokenFactory合约
 */
async function deployStagedTokenFactory(deployer) {
    log('部署StagedTokenFactory合约...', 'deploy');
    
    try {
        const StagedTokenFactory = await ethers.getContractFactory("StagedTokenFactory");
        
        log('开始部署合约...');
        const factory = await StagedTokenFactory.deploy();
        
        log('等待部署交易确认...');
        const receipt = await waitForTransaction(factory.deploymentTransaction(), 'StagedTokenFactory部署');
        
        const factoryAddress = await factory.getAddress();
        log(`StagedTokenFactory部署成功: ${factoryAddress}`, 'success');
        log(`部署交易哈希: ${receipt.hash}`);
        log(`Gas使用: ${receipt.gasUsed}`);
        log(`BSCScan: ${DEPLOYMENT_CONFIG.network.blockExplorer}/address/${factoryAddress}`);
        
        return {
            factory,
            address: factoryAddress,
            deploymentHash: receipt.hash,
            gasUsed: receipt.gasUsed.toString(),
            blockNumber: receipt.blockNumber
        };
        
    } catch (error) {
        log(`合约部署失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 验证工厂合约功能
 */
async function verifyFactoryContract(factory) {
    log('验证工厂合约功能...', 'verify');
    
    try {
        // 检查基础配置
        const creationFee = await factory.creationFee();
        const totalTokens = await factory.totalTokensCreated();
        const factoryEnabled = await factory.factoryEnabled();
        const owner = await factory.owner();
        
        log(`创建费用: ${ethers.formatEther(creationFee)} BNB`);
        log(`已创建代币数量: ${totalTokens}`);
        log(`工厂状态: ${factoryEnabled ? '启用' : '禁用'}`);
        log(`合约所有者: ${owner}`);
        
        // 检查网络配置
        const networkConfig = await factory.networkConfigs(DEPLOYMENT_CONFIG.network.chainId);
        log(`网络配置验证:`);
        log(`  Router: ${networkConfig.router}`);
        log(`  WBNB: ${networkConfig.wbnb}`);
        log(`  USDT: ${networkConfig.usdt}`);
        log(`  启用状态: ${networkConfig.enabled}`);
        
        if (!networkConfig.enabled) {
            throw new Error('当前网络配置未启用');
        }
        
        log('工厂合约功能验证通过', 'success');
        
        return {
            creationFee,
            totalTokens,
            factoryEnabled,
            owner,
            networkConfig
        };
        
    } catch (error) {
        log(`工厂合约验证失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 创建测试代币
 */
async function createTestToken(factory, deployer, creationFee) {
    if (!DEPLOYMENT_CONFIG.options.createTestToken) {
        log('跳过测试代币创建', 'info');
        return null;
    }
    
    log('创建测试代币...', 'deploy');
    
    try {
        const { testToken } = DEPLOYMENT_CONFIG;
        
        log(`代币配置:`);
        log(`  名称: ${testToken.name}`);
        log(`  符号: ${testToken.symbol}`);
        log(`  总供应量: ${testToken.totalSupply}`);
        log(`  买入费用: ${testToken.buyFee}%`);
        log(`  卖出费用: ${testToken.sellFee}%`);
        
        // 选择创建方式
        let tx, tokenAddress;
        
        if (DEPLOYMENT_CONFIG.options.useOneClickDeploy) {
            log('使用一键部署模式...');
            tx = await factory.createAndActivateToken(
                testToken.name,
                testToken.symbol,
                testToken.totalSupply,
                testToken.buyFee,
                testToken.sellFee,
                { value: creationFee }
            );
        } else {
            log('使用分步部署模式...');
            tx = await factory.createToken(
                testToken.name,
                testToken.symbol,
                testToken.totalSupply,
                testToken.buyFee,
                testToken.sellFee,
                { value: creationFee }
            );
        }
        
        const receipt = await waitForTransaction(tx, '测试代币创建');
        
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
        tokenAddress = parsed.args.token;
        
        log(`测试代币创建成功: ${tokenAddress}`, 'success');
        log(`创建交易哈希: ${receipt.hash}`);
        log(`BSCScan: ${DEPLOYMENT_CONFIG.network.blockExplorer}/address/${tokenAddress}`);
        
        // 如果使用分步部署，继续完成后续步骤
        if (!DEPLOYMENT_CONFIG.options.useOneClickDeploy) {
            await completeTokenDeployment(factory, tokenAddress);
        }
        
        return {
            address: tokenAddress,
            name: testToken.name,
            symbol: testToken.symbol,
            totalSupply: testToken.totalSupply,
            creationHash: receipt.hash,
            gasUsed: receipt.gasUsed.toString()
        };
        
    } catch (error) {
        log(`测试代币创建失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 完成代币部署（分步模式）
 */
async function completeTokenDeployment(factory, tokenAddress) {
    log('完成代币部署流程...', 'deploy');
    
    try {
        // 步骤2：初始化DEX配置
        log('初始化DEX配置...');
        const dexTx = await factory.initializeTokenDEX(tokenAddress);
        await waitForTransaction(dexTx, 'DEX配置初始化');
        
        // 步骤3：激活交易
        log('激活代币交易...');
        const activateTx = await factory.activateTokenTrading(tokenAddress);
        await waitForTransaction(activateTx, '代币交易激活');
        
        log('代币部署流程完成', 'success');
        
    } catch (error) {
        log(`代币部署流程失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 验证代币功能
 */
async function verifyTokenFunctionality(tokenAddress) {
    log('验证代币功能...', 'verify');

    try {
        const StagedCustomToken = await ethers.getContractFactory("StagedCustomToken");
        const token = StagedCustomToken.attach(tokenAddress);

        // 验证基础属性
        const name = await token.name();
        const symbol = await token.symbol();
        const totalSupply = await token.totalSupply();
        const decimals = await token.decimals();

        log(`代币验证结果:`);
        log(`  名称: ${name}`);
        log(`  符号: ${symbol}`);
        log(`  总供应量: ${ethers.formatUnits(totalSupply, decimals)}`);
        log(`  小数位数: ${decimals}`);

        // 验证阶段状态
        const stageInfo = await token.getStageInfo();
        const [stage, dexReady, tradingActive, bnbPair, usdtPair] = stageInfo;

        log(`  当前阶段: ${stage}`);
        log(`  DEX就绪: ${dexReady}`);
        log(`  交易激活: ${tradingActive}`);
        log(`  BNB交易对: ${bnbPair}`);
        log(`  USDT交易对: ${usdtPair}`);

        // 验证费用配置
        const feeBuy = await token.feeBuy();
        const feeSell = await token.feeSell();

        log(`  买入费用: ${feeBuy}%`);
        log(`  卖出费用: ${feeSell}%`);

        log('代币功能验证通过', 'success');

        return {
            name, symbol, totalSupply: ethers.formatUnits(totalSupply, decimals),
            decimals: decimals.toString(), stage: stage.toString(),
            dexReady, tradingActive, bnbPair, usdtPair,
            feeBuy: feeBuy.toString(), feeSell: feeSell.toString()
        };

    } catch (error) {
        log(`代币功能验证失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 保存部署信息
 */
function saveDeploymentInfo(deploymentData) {
    if (!DEPLOYMENT_CONFIG.options.saveDeploymentInfo) {
        return null;
    }

    log('保存部署信息...', 'info');

    try {
        const deploymentDir = path.join(__dirname, '..', 'deployments');
        if (!fs.existsSync(deploymentDir)) {
            fs.mkdirSync(deploymentDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `staged-token-deployment-${timestamp}.json`;
        const filepath = path.join(deploymentDir, filename);

        const deploymentInfo = {
            timestamp: new Date().toISOString(),
            network: DEPLOYMENT_CONFIG.network,
            contracts: deploymentData.contracts,
            tokens: deploymentData.tokens,
            configuration: DEPLOYMENT_CONFIG,
            gasUsage: deploymentData.gasUsage
        };

        fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
        log(`部署信息已保存: ${filepath}`, 'success');

        return filepath;

    } catch (error) {
        log(`保存部署信息失败: ${error.message}`, 'error');
        return null;
    }
}

/**
 * 生成前端集成代码
 */
function generateFrontendIntegration(factoryAddress, tokenAddress = null) {
    if (!DEPLOYMENT_CONFIG.options.generateFrontendCode) {
        return null;
    }

    log('生成前端集成代码...', 'info');

    try {
        const frontendCode = `
// StagedTokenFactory 前端集成代码
// 生成时间: ${new Date().toISOString()}
// 网络: ${DEPLOYMENT_CONFIG.network.name}

import { ethers } from 'ethers';

// 合约配置
export const CONTRACT_CONFIG = {
    FACTORY_ADDRESS: '${factoryAddress}',
    ${tokenAddress ? `TEST_TOKEN_ADDRESS: '${tokenAddress}',` : ''}
    NETWORK: {
        name: '${DEPLOYMENT_CONFIG.network.name}',
        chainId: ${DEPLOYMENT_CONFIG.network.chainId},
        rpcUrl: '${DEPLOYMENT_CONFIG.network.rpcUrl}',
        blockExplorer: '${DEPLOYMENT_CONFIG.network.blockExplorer}'
    }
};

// 工厂合约ABI（简化版）
export const FACTORY_ABI = [
    "function createToken(string name, string symbol, uint256 totalSupply, uint256 feeBuy, uint256 feeSell) payable returns (address)",
    "function createAdvancedToken(string name, string symbol, uint256 totalSupply, uint256 feeBuy, uint256 feeSell, tuple(address,uint256,uint256,uint256) config) payable returns (address)",
    "function initializeTokenDEX(address tokenAddress)",
    "function activateTokenTrading(address tokenAddress)",
    "function creationFee() view returns (uint256)",
    "function totalTokensCreated() view returns (uint256)",
    "event TokenCreated(address indexed token, address indexed creator, string name, string symbol, uint256 totalSupply, uint256 timestamp)"
];

// 代币合约ABI（简化版）
export const TOKEN_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function getStageInfo() view returns (uint8, bool, bool, address, address)",
    "function getAdvancedConfig() view returns (address, uint256, uint256, uint256, uint256, uint256)"
];

// 初始化Web3连接
export async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const network = await provider.getNetwork();
        if (Number(network.chainId) !== CONTRACT_CONFIG.NETWORK.chainId) {
            throw new Error(\`请切换到\${CONTRACT_CONFIG.NETWORK.name}\`);
        }

        return provider;
    } else {
        throw new Error('请安装MetaMask钱包');
    }
}

// 获取工厂合约实例
export async function getFactoryContract(provider) {
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_CONFIG.FACTORY_ADDRESS, FACTORY_ABI, signer);
}

// 创建代币
export async function createToken(provider, tokenConfig) {
    const factory = await getFactoryContract(provider);
    const creationFee = await factory.creationFee();

    const tx = await factory.createToken(
        tokenConfig.name,
        tokenConfig.symbol,
        tokenConfig.totalSupply,
        tokenConfig.buyFee,
        tokenConfig.sellFee,
        { value: creationFee }
    );

    return await tx.wait();
}

// 使用示例
/*
const provider = await initWeb3();
const tokenConfig = {
    name: 'My Token',
    symbol: 'MTK',
    totalSupply: '1000000',
    buyFee: 1,
    sellFee: 4
};

const receipt = await createToken(provider, tokenConfig);
console.log('代币创建成功:', receipt);
*/
`;

        const frontendFile = path.join(__dirname, '..', 'frontend', 'staged-token-integration.js');
        const frontendDir = path.dirname(frontendFile);

        if (!fs.existsSync(frontendDir)) {
            fs.mkdirSync(frontendDir, { recursive: true });
        }

        fs.writeFileSync(frontendFile, frontendCode);
        log(`前端集成代码已生成: ${frontendFile}`, 'success');

        return frontendFile;

    } catch (error) {
        log(`生成前端集成代码失败: ${error.message}`, 'error');
        return null;
    }
}

/**
 * 主部署流程
 */
async function main() {
    const startTime = Date.now();

    log('='.repeat(60), 'deploy');
    log('StagedCustomToken 部署和验证脚本启动', 'deploy');
    log('='.repeat(60), 'deploy');

    try {
        // 1. 检查部署环境
        const { deployer, network, balance } = await checkDeploymentEnvironment();

        // 2. 部署StagedTokenFactory合约
        const factoryDeployment = await deployStagedTokenFactory(deployer);

        // 3. 验证工厂合约功能
        const factoryInfo = await verifyFactoryContract(factoryDeployment.factory);

        // 4. 创建测试代币（可选）
        let tokenDeployment = null;
        let tokenInfo = null;

        if (DEPLOYMENT_CONFIG.options.createTestToken) {
            tokenDeployment = await createTestToken(
                factoryDeployment.factory,
                deployer,
                factoryInfo.creationFee
            );

            if (tokenDeployment) {
                tokenInfo = await verifyTokenFunctionality(tokenDeployment.address);
            }
        }

        // 5. 保存部署信息
        const deploymentData = {
            contracts: {
                factory: factoryDeployment
            },
            tokens: tokenDeployment ? [tokenDeployment] : [],
            gasUsage: {
                factoryDeployment: factoryDeployment.gasUsed,
                tokenCreation: tokenDeployment?.gasUsed || '0'
            }
        };

        const deploymentFile = saveDeploymentInfo(deploymentData);

        // 6. 生成前端集成代码
        const frontendFile = generateFrontendIntegration(
            factoryDeployment.address,
            tokenDeployment?.address
        );

        // 7. 输出部署总结
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        log('\n' + '='.repeat(60), 'success');
        log('🎉 部署和验证完成!', 'success');
        log('='.repeat(60), 'success');
        log(`⏱️  总耗时: ${duration} 秒`);
        log(`🌐 网络: ${network.name} (Chain ID: ${network.chainId})`);
        log(`👤 部署账户: ${deployer.address}`);
        log(`🏭 工厂合约: ${factoryDeployment.address}`);

        if (tokenDeployment) {
            log(`🪙 测试代币: ${tokenDeployment.address}`);
        }

        if (deploymentFile) {
            log(`📄 部署信息: ${deploymentFile}`);
        }

        if (frontendFile) {
            log(`💻 前端代码: ${frontendFile}`);
        }

        log(`🌐 工厂BSCScan: ${DEPLOYMENT_CONFIG.network.blockExplorer}/address/${factoryDeployment.address}`);

        if (tokenDeployment) {
            log(`🌐 代币BSCScan: ${DEPLOYMENT_CONFIG.network.blockExplorer}/address/${tokenDeployment.address}`);
        }

        log('='.repeat(60), 'success');

        // 8. 输出使用说明
        printUsageInstructions(factoryDeployment.address, tokenDeployment?.address);

        return {
            factory: factoryDeployment,
            token: tokenDeployment,
            deploymentFile,
            frontendFile
        };

    } catch (error) {
        log(`部署失败: ${error.message}`, 'error');
        console.error('详细错误信息:', error);
        process.exit(1);
    }
}

/**
 * 打印使用说明
 */
function printUsageInstructions(factoryAddress, tokenAddress = null) {
    log('\n📖 使用说明:');
    log('─'.repeat(50));
    log('1. 合约验证:');
    log(`   在BSCScan上验证工厂合约: ${DEPLOYMENT_CONFIG.network.blockExplorer}/address/${factoryAddress}#code`);

    if (tokenAddress) {
        log(`   在BSCScan上查看测试代币: ${DEPLOYMENT_CONFIG.network.blockExplorer}/address/${tokenAddress}`);
    }

    log('\n2. 创建更多代币:');
    log('   node scripts/comprehensive-token-test.js');

    log('\n3. 前端集成:');
    log('   参考生成的 frontend/staged-token-integration.js 文件');

    log('\n4. 测试功能:');
    log('   - 代币转账测试');
    log('   - 费用机制验证');
    log('   - DEX交易测试');
    log('   - 权限管理测试');

    log('\n5. 获取测试BNB:');
    log('   访问 https://testnet.binance.org/faucet-smart');
    log('─'.repeat(50));
}

/**
 * 脚本入口点
 */
if (require.main === module) {
    main()
        .then(() => {
            log('部署脚本执行完成', 'success');
            process.exit(0);
        })
        .catch((error) => {
            log('部署脚本执行失败', 'error');
            console.error(error);
            process.exit(1);
        });
}

// 导出主要函数
module.exports = {
    DEPLOYMENT_CONFIG,
    main,
    checkDeploymentEnvironment,
    deployStagedTokenFactory,
    verifyFactoryContract,
    createTestToken,
    completeTokenDeployment,
    verifyTokenFunctionality,
    saveDeploymentInfo,
    generateFrontendIntegration,
    log,
    waitForTransaction
};
