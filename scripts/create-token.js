#!/usr/bin/env node

/**
 * 代币创建和测试脚本
 * 
 * 功能：
 * 1. 连接已部署的StagedTokenFactory合约
 * 2. 创建自定义代币
 * 3. 测试代币的完整生命周期
 * 4. 保存代币信息
 * 
 * 使用方法：
 * node scripts/create-token.js [options]
 * 
 * 选项：
 * --name "Token Name"     代币名称
 * --symbol "TKN"          代币符号
 * --supply 1000000        总供应量
 * --buy-fee 1             买入费用 (%)
 * --sell-fee 4            卖出费用 (%)
 * --factory-address 0x... 工厂合约地址
 * --one-click             使用一键部署模式
 * --step-by-step          使用分步部署模式（默认）
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

// 解析命令行参数
function parseArguments() {
    const args = process.argv.slice(2);
    const config = {
        name: 'Test Token',
        symbol: 'TEST',
        totalSupply: '1000000',
        buyFee: 1,
        sellFee: 4,
        factoryAddress: null,
        oneClick: false
    };
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--name':
                config.name = args[++i];
                break;
            case '--symbol':
                config.symbol = args[++i];
                break;
            case '--supply':
                config.totalSupply = args[++i];
                break;
            case '--buy-fee':
                config.buyFee = parseInt(args[++i]);
                break;
            case '--sell-fee':
                config.sellFee = parseInt(args[++i]);
                break;
            case '--factory-address':
                config.factoryAddress = args[++i];
                break;
            case '--one-click':
                config.oneClick = true;
                break;
            case '--step-by-step':
                config.oneClick = false;
                break;
            case '--help':
                printHelp();
                process.exit(0);
        }
    }
    
    return config;
}

// 打印帮助信息
function printHelp() {
    console.log(`
代币创建脚本使用说明:

基本用法:
  node scripts/create-token.js

选项:
  --name "Token Name"     代币名称 (默认: "Test Token")
  --symbol "TKN"          代币符号 (默认: "TEST")
  --supply 1000000        总供应量 (默认: 1000000)
  --buy-fee 1             买入费用百分比 (默认: 1)
  --sell-fee 4            卖出费用百分比 (默认: 4)
  --factory-address 0x... 工厂合约地址 (自动从配置文件读取)
  --one-click             使用一键部署模式
  --step-by-step          使用分步部署模式 (默认)
  --help                  显示此帮助信息

示例:
  # 创建基础代币
  node scripts/create-token.js --name "My Token" --symbol "MTK"
  
  # 一键创建并激活代币
  node scripts/create-token.js --name "Quick Token" --symbol "QTK" --one-click
  
  # 自定义费用的代币
  node scripts/create-token.js --name "Custom Token" --symbol "CTK" --buy-fee 2 --sell-fee 5

环境要求:
  - .env 文件中配置私钥
  - 账户有足够的BNB用于Gas费用
  - 已部署的StagedTokenFactory合约
`);
}

// ===== 简化的合约ABI =====
const FACTORY_ABI = [
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
        "inputs": [],
        "name": "creationFee",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
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
    }
];

// 代币合约ABI（用于查询代币信息）
const TOKEN_ABI = [
    {
        "inputs": [],
        "name": "name",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getStageInfo",
        "outputs": [
            {"internalType": "uint8", "name": "stage", "type": "uint8"},
            {"internalType": "bool", "name": "dexReady", "type": "bool"},
            {"internalType": "bool", "name": "tradingActive", "type": "bool"},
            {"internalType": "address", "name": "bnbPair", "type": "address"},
            {"internalType": "address", "name": "usdtPair", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// ===== 工具函数 =====

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
        'info': '📝',
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'token': '🪙'
    }[type] || '📝';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

// 查找工厂合约地址
function findFactoryAddress() {
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    
    if (!fs.existsSync(deploymentsDir)) {
        return null;
    }
    
    const files = fs.readdirSync(deploymentsDir);
    const deploymentFiles = files.filter(f => f.startsWith('deployment-info-') && f.endsWith('.json'));
    
    if (deploymentFiles.length === 0) {
        return null;
    }
    
    // 使用最新的部署文件
    const latestFile = deploymentFiles.sort().pop();
    const deploymentInfo = JSON.parse(fs.readFileSync(path.join(deploymentsDir, latestFile), 'utf8'));
    
    return deploymentInfo.contracts?.StagedTokenFactory?.address;
}

// ===== 主要功能函数 =====

/**
 * 初始化Web3连接
 */
async function initializeWeb3() {
    if (!PRIVATE_KEY) {
        throw new Error('未找到私钥配置，请检查.env文件');
    }

    const web3 = new Web3(BSC_TESTNET_RPC);
    const account = web3.eth.accounts.privateKeyToAccount(
        PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : '0x' + PRIVATE_KEY
    );
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
 * 获取工厂合约实例
 */
async function getFactoryContract(web3, factoryAddress) {
    if (!factoryAddress) {
        factoryAddress = findFactoryAddress();
        if (!factoryAddress) {
            throw new Error('未找到工厂合约地址，请先部署合约或使用 --factory-address 参数指定');
        }
        log(`使用工厂合约地址: ${factoryAddress}`);
    }

    const factory = new web3.eth.Contract(FACTORY_ABI, factoryAddress);

    // 验证合约是否存在
    try {
        const creationFee = await factory.methods.creationFee().call();
        log(`工厂合约验证成功，创建费用: ${web3.utils.fromWei(creationFee, 'ether')} BNB`);
        return factory;
    } catch (error) {
        throw new Error(`无法连接到工厂合约 ${factoryAddress}: ${error.message}`);
    }
}

/**
 * 创建代币（分步模式）
 */
async function createTokenStepByStep(web3, factory, account, config) {
    log(`开始分步创建代币: ${config.name} (${config.symbol})`, 'token');

    const creationFee = await factory.methods.creationFee().call();

    // 步骤1：创建基础代币
    log('步骤1: 创建基础代币...');
    const createTx = await factory.methods.createToken(
        config.name,
        config.symbol,
        config.totalSupply,
        config.buyFee,
        config.sellFee
    ).send({
        from: account.address,
        value: creationFee,
        gas: 3000000
    });

    // 获取代币地址
    const tokenAddress = createTx.events.TokenCreated.returnValues.token;
    log(`代币创建成功! 地址: ${tokenAddress}`, 'success');

    // 步骤2：初始化DEX配置
    log('步骤2: 初始化DEX配置...');
    const initDEXTx = await factory.methods.initializeTokenDEX(tokenAddress).send({
        from: account.address,
        gas: 1000000
    });
    log(`DEX初始化成功! 交易: ${initDEXTx.transactionHash}`, 'success');

    // 步骤3：激活交易
    log('步骤3: 激活代币交易...');
    const activateTx = await factory.methods.activateTokenTrading(tokenAddress).send({
        from: account.address,
        gas: 2000000
    });
    log(`交易激活成功! 交易: ${activateTx.transactionHash}`, 'success');

    return {
        tokenAddress,
        transactions: {
            creation: createTx.transactionHash,
            dexInit: initDEXTx.transactionHash,
            activation: activateTx.transactionHash
        }
    };
}

/**
 * 创建代币（一键模式）
 */
async function createTokenOneClick(web3, factory, account, config) {
    log(`开始一键创建代币: ${config.name} (${config.symbol})`, 'token');

    const creationFee = await factory.methods.creationFee().call();

    const createTx = await factory.methods.createAndActivateToken(
        config.name,
        config.symbol,
        config.totalSupply,
        config.buyFee,
        config.sellFee
    ).send({
        from: account.address,
        value: creationFee,
        gas: 5000000
    });

    // 获取代币地址
    const tokenAddress = createTx.events.TokenCreated.returnValues.token;
    log(`代币一键创建成功! 地址: ${tokenAddress}`, 'success');

    return {
        tokenAddress,
        transactions: {
            creation: createTx.transactionHash
        }
    };
}

/**
 * 查询代币信息
 */
async function getTokenInfo(web3, tokenAddress, creatorAddress) {
    log(`查询代币信息: ${tokenAddress}`);

    const token = new web3.eth.Contract(TOKEN_ABI, tokenAddress);

    try {
        const [name, symbol, totalSupply, decimals, balance, stageInfo] = await Promise.all([
            token.methods.name().call(),
            token.methods.symbol().call(),
            token.methods.totalSupply().call(),
            token.methods.decimals().call(),
            token.methods.balanceOf(creatorAddress).call(),
            token.methods.getStageInfo().call()
        ]);

        const tokenInfo = {
            address: tokenAddress,
            name,
            symbol,
            totalSupply: web3.utils.fromWei(totalSupply, 'ether'),
            decimals: parseInt(decimals),
            creatorBalance: web3.utils.fromWei(balance, 'ether'),
            stage: {
                current: parseInt(stageInfo.stage),
                dexReady: stageInfo.dexReady,
                tradingActive: stageInfo.tradingActive,
                bnbPair: stageInfo.bnbPair,
                usdtPair: stageInfo.usdtPair
            }
        };

        log(`代币信息查询成功:`, 'success');
        log(`  名称: ${tokenInfo.name}`);
        log(`  符号: ${tokenInfo.symbol}`);
        log(`  总供应量: ${tokenInfo.totalSupply}`);
        log(`  创建者余额: ${tokenInfo.creatorBalance}`);
        log(`  当前阶段: ${tokenInfo.stage.current}`);
        log(`  DEX就绪: ${tokenInfo.stage.dexReady ? '是' : '否'}`);
        log(`  交易激活: ${tokenInfo.stage.tradingActive ? '是' : '否'}`);

        return tokenInfo;

    } catch (error) {
        log(`查询代币信息失败: ${error.message}`, 'error');
        return null;
    }
}

/**
 * 保存代币信息
 */
function saveTokenInfo(tokenInfo, config, transactions) {
    const timestamp = new Date().toISOString();
    const filename = `token-${config.symbol.toLowerCase()}-${Date.now()}.json`;
    const tokensDir = path.join(__dirname, '..', 'tokens');

    if (!fs.existsSync(tokensDir)) {
        fs.mkdirSync(tokensDir, { recursive: true });
    }

    const filepath = path.join(tokensDir, filename);

    const data = {
        timestamp,
        config,
        tokenInfo,
        transactions,
        network: {
            name: 'BSC Testnet',
            chainId: BSC_TESTNET_CHAIN_ID,
            explorer: `https://testnet.bscscan.com/token/${tokenInfo.address}`
        }
    };

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    log(`代币信息已保存: ${filepath}`, 'success');

    return filepath;
}

// ===== 主函数 =====

/**
 * 主函数
 */
async function main() {
    const startTime = Date.now();

    try {
        // 解析命令行参数
        const config = parseArguments();

        log('='.repeat(60), 'token');
        log('代币创建脚本启动', 'token');
        log('='.repeat(60), 'token');
        log(`代币配置:`);
        log(`  名称: ${config.name}`);
        log(`  符号: ${config.symbol}`);
        log(`  总供应量: ${config.totalSupply}`);
        log(`  买入费用: ${config.buyFee}%`);
        log(`  卖出费用: ${config.sellFee}%`);
        log(`  部署模式: ${config.oneClick ? '一键部署' : '分步部署'}`);

        // 初始化Web3连接
        const { web3, account } = await initializeWeb3();

        // 获取工厂合约
        const factory = await getFactoryContract(web3, config.factoryAddress);

        // 创建代币
        let result;
        if (config.oneClick) {
            result = await createTokenOneClick(web3, factory, account, config);
        } else {
            result = await createTokenStepByStep(web3, factory, account, config);
        }

        // 查询代币详细信息
        const tokenInfo = await getTokenInfo(web3, result.tokenAddress, account.address);

        // 保存代币信息
        if (tokenInfo) {
            const savedFile = saveTokenInfo(tokenInfo, config, result.transactions);

            // 输出总结
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            log('\n' + '='.repeat(60), 'success');
            log('🎉 代币创建完成! 总结信息:', 'success');
            log('='.repeat(60), 'success');
            log(`⏱️  总耗时: ${duration} 秒`);
            log(`🪙 代币地址: ${result.tokenAddress}`);
            log(`📄 信息文件: ${savedFile}`);
            log(`🌐 BSCScan: https://testnet.bscscan.com/token/${result.tokenAddress}`);
            log('='.repeat(60), 'success');

            // 输出使用说明
            printTokenUsage(result.tokenAddress, tokenInfo);
        }

    } catch (error) {
        log(`代币创建失败: ${error.message}`, 'error');
        console.error('详细错误信息:', error);
        process.exit(1);
    }
}

/**
 * 打印代币使用说明
 */
function printTokenUsage(tokenAddress, tokenInfo) {
    log('\n📖 代币使用说明:');
    log('─'.repeat(40));
    log('1. 添加到钱包:');
    log(`   代币地址: ${tokenAddress}`);
    log(`   符号: ${tokenInfo.symbol}`);
    log(`   小数位: ${tokenInfo.decimals}`);
    log('');
    log('2. 查看代币:');
    log(`   BSCScan: https://testnet.bscscan.com/token/${tokenAddress}`);
    log('');
    log('3. 交易状态:');
    log(`   当前阶段: ${getStageDescription(tokenInfo.stage.current)}`);
    log(`   DEX就绪: ${tokenInfo.stage.dexReady ? '✅' : '❌'}`);
    log(`   交易激活: ${tokenInfo.stage.tradingActive ? '✅' : '❌'}`);

    if (tokenInfo.stage.bnbPair && tokenInfo.stage.bnbPair !== '0x0000000000000000000000000000000000000000') {
        log(`   BNB交易对: ${tokenInfo.stage.bnbPair}`);
    }
    if (tokenInfo.stage.usdtPair && tokenInfo.stage.usdtPair !== '0x0000000000000000000000000000000000000000') {
        log(`   USDT交易对: ${tokenInfo.stage.usdtPair}`);
    }
    log('─'.repeat(40));
}

/**
 * 获取阶段描述
 */
function getStageDescription(stage) {
    const stages = {
        0: 'BASIC - 基础阶段',
        1: 'DEX_READY - DEX就绪',
        2: 'FULLY_ACTIVE - 完全激活'
    };
    return stages[stage] || `未知阶段 (${stage})`;
}

// ===== 脚本入口 =====

if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    main,
    createTokenStepByStep,
    createTokenOneClick,
    getTokenInfo
};
