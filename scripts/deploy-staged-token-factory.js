#!/usr/bin/env node

/**
 * StagedTokenFactory 智能合约部署脚本
 * 
 * 功能：
 * 1. 部署 StagedTokenFactory.sol 合约到BSC测试网
 * 2. 调用合约中的代币创建方法
 * 3. 保存部署信息供前端使用
 * 
 * 使用方法：
 * node scripts/deploy-staged-token-factory.js
 * 
 * 环境要求：
 * - .env 文件中配置私钥和网络信息
 * - 账户有足够的BNB用于Gas费用
 */

require('dotenv').config();
const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// ===== 配置常量 =====
const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const BSC_TESTNET_CHAIN_ID = 97;

// 从环境变量读取配置
const PRIVATE_KEY = process.env.BSC_TESTNET_DEPLOYER_KEY || process.env.PRIVATE_KEY;
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY;

// 代币配置参数
const TOKEN_CONFIG = {
    name: process.env.TOKEN_NAME || 'FEG Token',
    symbol: process.env.TOKEN_SYMBOL || 'FEG',
    totalSupply: process.env.TOKEN_SUPPLY || '1000000',
    buyFee: 1,  // 1%
    sellFee: 4, // 4%
};

// ===== StagedTokenFactory 合约 ABI =====
const STAGED_TOKEN_FACTORY_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "token", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "creator", "type": "address"},
            {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
            {"indexed": false, "internalType": "string", "name": "symbol", "type": "string"},
            {"indexed": false, "internalType": "uint256", "name": "totalSupply", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "TokenCreated",
        "type": "event"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_name", "type": "string"},
            {"internalType": "string", "name": "_symbol", "type": "string"},
            {"internalType": "uint256", "name": "_totalSupply", "type": "uint256"},
            {"internalType": "uint256", "name": "_feeBuy", "type": "uint256"},
            {"internalType": "uint256", "name": "_feeSell", "type": "uint256"}
        ],
        "name": "createToken",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "tokenAddress", "type": "address"}],
        "name": "initializeTokenDEX",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "tokenAddress", "type": "address"}],
        "name": "activateTokenTrading",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_name", "type": "string"},
            {"internalType": "string", "name": "_symbol", "type": "string"},
            {"internalType": "uint256", "name": "_totalSupply", "type": "uint256"},
            {"internalType": "uint256", "name": "_feeBuy", "type": "uint256"},
            {"internalType": "uint256", "name": "_feeSell", "type": "uint256"}
        ],
        "name": "createAndActivateToken",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "creationFee",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalTokensCreated",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllTokensLength",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// ===== StagedTokenFactory 合约字节码 =====
// 注意：这里需要编译后的字节码，暂时使用占位符
const STAGED_TOKEN_FACTORY_BYTECODE = "0x608060405234801561001057600080fd5b50..."; // 实际字节码需要编译获得

// ===== 工具函数 =====

/**
 * 格式化日志输出
 */
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
        'info': '📝',
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'deploy': '🚀'
    }[type] || '📝';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

/**
 * 等待交易确认
 */
async function waitForTransaction(web3, txHash, confirmations = 1) {
    log(`等待交易确认: ${txHash}`);
    
    let receipt = null;
    let attempts = 0;
    const maxAttempts = 60; // 最多等待5分钟
    
    while (!receipt && attempts < maxAttempts) {
        try {
            receipt = await web3.eth.getTransactionReceipt(txHash);
            if (receipt) {
                if (receipt.status) {
                    log(`交易确认成功! Gas使用: ${receipt.gasUsed}`, 'success');
                    return receipt;
                } else {
                    throw new Error('交易执行失败');
                }
            }
        } catch (error) {
            if (error.message.includes('交易执行失败')) {
                throw error;
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒
        attempts++;
    }
    
    throw new Error('交易确认超时');
}

/**
 * 估算Gas费用
 */
async function estimateGas(web3, transaction) {
    try {
        const gasEstimate = await web3.eth.estimateGas(transaction);
        const gasPrice = await web3.eth.getGasPrice();
        const gasCost = web3.utils.fromWei((BigInt(gasEstimate) * BigInt(gasPrice)).toString(), 'ether');
        
        log(`Gas估算: ${gasEstimate}, Gas价格: ${web3.utils.fromWei(gasPrice, 'gwei')} Gwei, 预计费用: ${gasCost} BNB`);
        
        return {
            gasEstimate: Math.floor(gasEstimate * 1.2), // 增加20%缓冲
            gasPrice: gasPrice
        };
    } catch (error) {
        log(`Gas估算失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 保存部署信息到JSON文件
 */
function saveDeploymentInfo(deploymentData) {
    const timestamp = new Date().toISOString();
    const filename = `deployment-info-${Date.now()}.json`;
    const filepath = path.join(__dirname, '..', 'deployments', filename);
    
    // 确保目录存在
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    const deploymentInfo = {
        timestamp,
        network: {
            name: 'BSC Testnet',
            chainId: BSC_TESTNET_CHAIN_ID,
            rpcUrl: BSC_TESTNET_RPC
        },
        contracts: deploymentData.contracts,
        transactions: deploymentData.transactions,
        tokens: deploymentData.tokens || [],
        abi: {
            StagedTokenFactory: STAGED_TOKEN_FACTORY_ABI
        },
        config: TOKEN_CONFIG
    };
    
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
    log(`部署信息已保存到: ${filepath}`, 'success');
    
    return filepath;
}

// ===== 主要功能函数 =====

/**
 * 初始化Web3连接
 */
async function initializeWeb3() {
    log('初始化Web3连接...', 'deploy');
    
    if (!PRIVATE_KEY) {
        throw new Error('未找到私钥配置，请检查.env文件中的BSC_TESTNET_DEPLOYER_KEY或PRIVATE_KEY');
    }
    
    const web3 = new Web3(BSC_TESTNET_RPC);
    const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : '0x' + PRIVATE_KEY);
    web3.eth.accounts.wallet.add(account);
    
    // 检查网络连接
    const networkId = await web3.eth.net.getId();
    if (networkId !== BSC_TESTNET_CHAIN_ID) {
        throw new Error(`网络ID不匹配，期望: ${BSC_TESTNET_CHAIN_ID}, 实际: ${networkId}`);
    }
    
    // 检查账户余额
    const balance = await web3.eth.getBalance(account.address);
    const balanceInBNB = web3.utils.fromWei(balance, 'ether');
    
    log(`连接成功! 账户: ${account.address}`, 'success');
    log(`账户余额: ${balanceInBNB} BNB`);
    
    if (parseFloat(balanceInBNB) < 0.01) {
        log('账户余额不足，建议至少有0.01 BNB用于Gas费用', 'warning');
    }
    
    return { web3, account };
}

/**
 * 部署StagedTokenFactory合约
 */
async function deployStagedTokenFactory(web3, account) {
    log('开始部署StagedTokenFactory合约...', 'deploy');

    // 注意：这里需要实际的合约字节码
    // 由于没有编译环境，我们需要先编译合约或使用预编译的字节码
    if (STAGED_TOKEN_FACTORY_BYTECODE === "0x608060405234801561001057600080fd5b50...") {
        throw new Error('需要实际的合约字节码。请先编译StagedTokenFactory.sol合约。');
    }

    const contract = new web3.eth.Contract(STAGED_TOKEN_FACTORY_ABI);

    const deployTransaction = contract.deploy({
        data: STAGED_TOKEN_FACTORY_BYTECODE
    });

    // 估算Gas
    const { gasEstimate, gasPrice } = await estimateGas(web3, {
        from: account.address,
        data: deployTransaction.encodeABI()
    });

    // 部署合约
    const deployedContract = await deployTransaction.send({
        from: account.address,
        gas: gasEstimate,
        gasPrice: gasPrice
    });

    log(`StagedTokenFactory合约部署成功! 地址: ${deployedContract.options.address}`, 'success');

    return deployedContract;
}

/**
 * 创建代币
 */
async function createToken(web3, factoryContract, account, tokenConfig) {
    log(`开始创建代币: ${tokenConfig.name} (${tokenConfig.symbol})...`, 'deploy');

    // 获取创建费用
    const creationFee = await factoryContract.methods.creationFee().call();
    log(`代币创建费用: ${web3.utils.fromWei(creationFee, 'ether')} BNB`);

    // 准备交易参数
    const createTokenTx = factoryContract.methods.createToken(
        tokenConfig.name,
        tokenConfig.symbol,
        tokenConfig.totalSupply,
        tokenConfig.buyFee,
        tokenConfig.sellFee
    );

    // 估算Gas
    const { gasEstimate, gasPrice } = await estimateGas(web3, {
        from: account.address,
        to: factoryContract.options.address,
        data: createTokenTx.encodeABI(),
        value: creationFee
    });

    // 发送交易
    const receipt = await createTokenTx.send({
        from: account.address,
        gas: gasEstimate,
        gasPrice: gasPrice,
        value: creationFee
    });

    // 解析事件获取代币地址
    const tokenCreatedEvent = receipt.events.TokenCreated;
    if (!tokenCreatedEvent) {
        throw new Error('未找到TokenCreated事件');
    }

    const tokenAddress = tokenCreatedEvent.returnValues.token;
    log(`代币创建成功! 地址: ${tokenAddress}`, 'success');

    return {
        tokenAddress,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed
    };
}

/**
 * 初始化代币DEX配置
 */
async function initializeTokenDEX(web3, factoryContract, account, tokenAddress) {
    log(`初始化代币DEX配置: ${tokenAddress}...`);

    const initDEXTx = factoryContract.methods.initializeTokenDEX(tokenAddress);

    // 估算Gas
    const { gasEstimate, gasPrice } = await estimateGas(web3, {
        from: account.address,
        to: factoryContract.options.address,
        data: initDEXTx.encodeABI()
    });

    // 发送交易
    const receipt = await initDEXTx.send({
        from: account.address,
        gas: gasEstimate,
        gasPrice: gasPrice
    });

    log(`DEX初始化成功! 交易哈希: ${receipt.transactionHash}`, 'success');

    return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed
    };
}

/**
 * 激活代币交易
 */
async function activateTokenTrading(web3, factoryContract, account, tokenAddress) {
    log(`激活代币交易: ${tokenAddress}...`);

    const activateTx = factoryContract.methods.activateTokenTrading(tokenAddress);

    // 估算Gas
    const { gasEstimate, gasPrice } = await estimateGas(web3, {
        from: account.address,
        to: factoryContract.options.address,
        data: activateTx.encodeABI()
    });

    // 发送交易
    const receipt = await activateTx.send({
        from: account.address,
        gas: gasEstimate,
        gasPrice: gasPrice
    });

    log(`代币交易激活成功! 交易哈希: ${receipt.transactionHash}`, 'success');

    return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed
    };
}

/**
 * 一键创建并激活代币（可选）
 */
async function createAndActivateToken(web3, factoryContract, account, tokenConfig) {
    log(`一键创建并激活代币: ${tokenConfig.name} (${tokenConfig.symbol})...`, 'deploy');

    // 获取创建费用
    const creationFee = await factoryContract.methods.creationFee().call();
    log(`代币创建费用: ${web3.utils.fromWei(creationFee, 'ether')} BNB`);

    // 准备交易参数
    const createAndActivateTx = factoryContract.methods.createAndActivateToken(
        tokenConfig.name,
        tokenConfig.symbol,
        tokenConfig.totalSupply,
        tokenConfig.buyFee,
        tokenConfig.sellFee
    );

    // 估算Gas
    const { gasEstimate, gasPrice } = await estimateGas(web3, {
        from: account.address,
        to: factoryContract.options.address,
        data: createAndActivateTx.encodeABI(),
        value: creationFee
    });

    // 发送交易
    const receipt = await createAndActivateTx.send({
        from: account.address,
        gas: gasEstimate,
        gasPrice: gasPrice,
        value: creationFee
    });

    // 解析事件获取代币地址
    const tokenCreatedEvent = receipt.events.TokenCreated;
    if (!tokenCreatedEvent) {
        throw new Error('未找到TokenCreated事件');
    }

    const tokenAddress = tokenCreatedEvent.returnValues.token;
    log(`代币一键创建并激活成功! 地址: ${tokenAddress}`, 'success');

    return {
        tokenAddress,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed
    };
}

// ===== 主函数 =====

/**
 * 主部署流程
 */
async function main() {
    const startTime = Date.now();
    log('='.repeat(60), 'deploy');
    log('StagedTokenFactory 智能合约部署脚本启动', 'deploy');
    log('='.repeat(60), 'deploy');

    try {
        // 1. 初始化Web3连接
        const { web3, account } = await initializeWeb3();

        // 2. 部署StagedTokenFactory合约
        log('\n📦 第一步：部署StagedTokenFactory合约');
        const factoryContract = await deployStagedTokenFactory(web3, account);

        // 3. 获取合约信息
        const totalTokensCreated = await factoryContract.methods.totalTokensCreated().call();
        const creationFee = await factoryContract.methods.creationFee().call();

        log(`合约信息:`);
        log(`  - 地址: ${factoryContract.options.address}`);
        log(`  - 已创建代币数量: ${totalTokensCreated}`);
        log(`  - 创建费用: ${web3.utils.fromWei(creationFee, 'ether')} BNB`);

        // 4. 创建测试代币（可选）
        let tokenInfo = null;
        if (process.env.CREATE_TEST_TOKEN !== 'false') {
            log('\n🪙 第二步：创建测试代币');

            // 选择创建方式
            const useOneClickDeploy = process.env.USE_ONE_CLICK_DEPLOY === 'true';

            if (useOneClickDeploy) {
                log('使用一键部署模式...');
                tokenInfo = await createAndActivateToken(web3, factoryContract, account, TOKEN_CONFIG);
            } else {
                log('使用分步部署模式...');

                // 步骤1：创建基础代币
                tokenInfo = await createToken(web3, factoryContract, account, TOKEN_CONFIG);

                // 步骤2：初始化DEX配置
                const dexInfo = await initializeTokenDEX(web3, factoryContract, account, tokenInfo.tokenAddress);
                tokenInfo.dexInitialization = dexInfo;

                // 步骤3：激活交易
                const activationInfo = await activateTokenTrading(web3, factoryContract, account, tokenInfo.tokenAddress);
                tokenInfo.tradingActivation = activationInfo;
            }
        }

        // 5. 保存部署信息
        log('\n💾 第三步：保存部署信息');
        const deploymentData = {
            contracts: {
                StagedTokenFactory: {
                    address: factoryContract.options.address,
                    abi: STAGED_TOKEN_FACTORY_ABI,
                    creationFee: web3.utils.fromWei(creationFee, 'ether'),
                    totalTokensCreated: totalTokensCreated
                }
            },
            transactions: [],
            tokens: tokenInfo ? [{
                ...TOKEN_CONFIG,
                address: tokenInfo.tokenAddress,
                deploymentInfo: tokenInfo
            }] : []
        };

        const configFile = saveDeploymentInfo(deploymentData);

        // 6. 生成前端集成代码
        generateFrontendIntegration(factoryContract.options.address, configFile);

        // 7. 输出部署总结
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        log('\n' + '='.repeat(60), 'success');
        log('🎉 部署完成! 总结信息:', 'success');
        log('='.repeat(60), 'success');
        log(`⏱️  总耗时: ${duration} 秒`);
        log(`📄 配置文件: ${configFile}`);
        log(`🏭 工厂合约: ${factoryContract.options.address}`);
        if (tokenInfo) {
            log(`🪙 测试代币: ${tokenInfo.tokenAddress}`);
        }
        log(`🌐 BSCScan: https://testnet.bscscan.com/address/${factoryContract.options.address}`);
        log('='.repeat(60), 'success');

        // 8. 输出使用说明
        printUsageInstructions(factoryContract.options.address);

    } catch (error) {
        log(`部署失败: ${error.message}`, 'error');
        console.error('详细错误信息:', error);
        process.exit(1);
    }
}

/**
 * 生成前端集成代码
 */
function generateFrontendIntegration(factoryAddress, configFile) {
    const frontendCode = `
// StagedTokenFactory 前端集成代码
// 生成时间: ${new Date().toISOString()}

import Web3 from 'web3';

// 合约配置
const FACTORY_ADDRESS = '${factoryAddress}';
const BSC_TESTNET_RPC = '${BSC_TESTNET_RPC}';
const CHAIN_ID = ${BSC_TESTNET_CHAIN_ID};

// 合约ABI（简化版）
const FACTORY_ABI = ${JSON.stringify(STAGED_TOKEN_FACTORY_ABI, null, 2)};

// 初始化Web3连接
export async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // 检查网络
        const chainId = await web3.eth.getChainId();
        if (chainId !== CHAIN_ID) {
            throw new Error('请切换到BSC测试网');
        }

        return web3;
    } else {
        throw new Error('请安装MetaMask');
    }
}

// 获取工厂合约实例
export async function getFactoryContract(web3) {
    return new web3.eth.Contract(FACTORY_ABI, FACTORY_ADDRESS);
}

// 创建代币
export async function createToken(web3, tokenConfig) {
    const accounts = await web3.eth.getAccounts();
    const factory = await getFactoryContract(web3);

    const creationFee = await factory.methods.creationFee().call();

    return await factory.methods.createToken(
        tokenConfig.name,
        tokenConfig.symbol,
        tokenConfig.totalSupply,
        tokenConfig.buyFee,
        tokenConfig.sellFee
    ).send({
        from: accounts[0],
        value: creationFee
    });
}

// 使用示例
/*
const tokenConfig = {
    name: 'My Token',
    symbol: 'MTK',
    totalSupply: '1000000',
    buyFee: 1,
    sellFee: 4
};

const web3 = await initWeb3();
const receipt = await createToken(web3, tokenConfig);
console.log('代币创建成功:', receipt);
*/
`;

    const frontendFile = path.join(__dirname, '..', 'frontend-integration.js');
    fs.writeFileSync(frontendFile, frontendCode);
    log(`前端集成代码已生成: ${frontendFile}`, 'success');
}

/**
 * 打印使用说明
 */
function printUsageInstructions(factoryAddress) {
    log('\n📖 使用说明:');
    log('─'.repeat(40));
    log('1. 创建代币:');
    log('   node scripts/create-token.js --name "MyToken" --symbol "MTK"');
    log('');
    log('2. 前端集成:');
    log('   参考生成的 frontend-integration.js 文件');
    log('');
    log('3. 合约验证:');
    log(`   在BSCScan上验证合约: https://testnet.bscscan.com/address/${factoryAddress}#code`);
    log('');
    log('4. 环境变量:');
    log('   CREATE_TEST_TOKEN=false - 跳过测试代币创建');
    log('   USE_ONE_CLICK_DEPLOY=true - 使用一键部署模式');
    log('─'.repeat(40));
}

// ===== 脚本入口 =====

if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    main,
    deployStagedTokenFactory,
    createToken,
    initializeTokenDEX,
    activateTokenTrading,
    createAndActivateToken
};
