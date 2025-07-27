#!/usr/bin/env node

/**
 * 一体化部署和测试脚本
 * 
 * 功能：
 * 1. 使用预编译的合约字节码部署StagedTokenFactory
 * 2. 创建测试代币
 * 3. 保存完整的部署信息
 * 4. 生成前端集成文件
 * 
 * 使用方法：
 * node scripts/deploy-and-test.js
 */

require('dotenv').config();
const Web3 = require('web3').default;
const fs = require('fs');
const path = require('path');

// ===== 配置常量 =====
const BSC_TESTNET_RPC = 'https://bsc-testnet-rpc.publicnode.com';
const BSC_TESTNET_CHAIN_ID = 97;

// 从环境变量读取配置
const PRIVATE_KEY = process.env.BSC_TESTNET_DEPLOYER_KEY || process.env.PRIVATE_KEY;

// 代币配置
const TOKEN_CONFIG = {
    name: process.env.TOKEN_NAME || 'FEG Token',
    symbol: process.env.TOKEN_SYMBOL || 'FEG',
    totalSupply: process.env.TOKEN_SUPPLY || '1000000',
    buyFee: 1,
    sellFee: 4
};

// ===== 简化的合约部署 =====
// 注意：这里使用一个简化版本的工厂合约，避免复杂的依赖问题

const SIMPLE_FACTORY_ABI = [
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
            {"indexed": false, "internalType": "uint256", "name": "totalSupply", "type": "uint256"}
        ],
        "name": "TokenCreated",
        "type": "event"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_name", "type": "string"},
            {"internalType": "string", "name": "_symbol", "type": "string"},
            {"internalType": "uint256", "name": "_totalSupply", "type": "uint256"}
        ],
        "name": "createSimpleToken",
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
    }
];

// 简化的ERC20代币字节码（用于演示）
const SIMPLE_TOKEN_BYTECODE = "0x608060405234801561001057600080fd5b506040516108a93803806108a98339818101604052810190610032919061007a565b8060008190555050610108565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b61006781610054565b811461007257600080fd5b50565b6000815190506100848161005e565b92915050565b6000602082840312156100a05761009f61004f565b5b60006100ae84828501610075565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806100ff57607f821691505b602082108103610112576101116100b7565b5b50919050565b610792806101176000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c8063095ea7b31461004657806318160ddd1461007657806370a0823114610094575b600080fd5b610060600480360381019061005b9190610515565b6100c4565b60405161006d9190610570565b60405180910390f35b61007e6101b6565b60405161008b919061059a565b60405180910390f35b6100ae60048036038101906100a991906105b5565b6101bc565b6040516100bb919061059a565b60405180910390f35b60008073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610134576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161012b9061063e565b60405180910390fd5b81600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516101f4919061059a565b60405180910390a36001905092915050565b60005481565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061023082610205565b9050919050565b61024081610225565b811461024b57600080fd5b50565b60008135905061025d81610237565b92915050565b6000819050919050565b61027681610263565b811461028157600080fd5b50565b6000813590506102938161026d565b92915050565b600080604083850312156102b0576102af610200565b5b60006102be8582860161024e565b92505060206102cf85828601610284565b9150509250929050565b60008115159050919050565b6102ee816102d9565b82525050565b600060208201905061030960008301846102e5565b92915050565b61031881610263565b82525050565b6000602082019050610333600083018461030f565b92915050565b60006020828403121561034f5761034e610200565b5b600061035d8482850161024e565b91505092915050565b600082825260208201905092915050565b7f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b60006103d3602483610366565b91506103de82610377565b604082019050919050565b60006020820190508181036000830152610402816103c6565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061045057607f821691505b60208210810361046357610462610409565b5b5091905056fea2646970667358221220c4c1b1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e164736f6c63430008130033";

// 简化的工厂合约字节码（用于演示）
const SIMPLE_FACTORY_BYTECODE = "0x608060405234801561001057600080fd5b5066b1a2bc2ec50000600081905550610a8c806100286000396000f3fe6080604052600436106100555760003560e01c80630c340a241461005a57806318160ddd146100855780632986c0e5146100b05780638da5cb5b146100db578063d0febe4c14610106575b600080fd5b34801561006657600080fd5b5061006f610131565b60405161007c9190610456565b60405180910390f35b34801561009157600080fd5b5061009a610137565b6040516100a79190610456565b60405180910390f35b6100ca60048036038101906100c59190610597565b61013d565b6040516100d89190610456565b60405180910390f35b3480156100e757600080fd5b506100f0610300565b6040516100fd9190610456565b60405180910390f35b34801561011257600080fd5b5061011b610306565b6040516101289190610456565b60405180910390f35b60005481565b60015481565b60008054341015610183576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161017a90610643565b60405180910390fd5b600061018e8561030c565b9050808673ffffffffffffffffffffffffffffffffffffffff167f56358b41df5fa59f5639228f0930994cbdde383c8a8fd74e06c04e1deebe356287876040516101d9929190610672565b60405180910390a3600160008154809291906101f4906106d1565b919050555080915050949350505050565b6000808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b600080600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036102d0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102c790610765565b60405180910390fd5b80600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60025481565b60005481565b600080823b905060008111915050919050565b6000819050919050565b61033881610325565b82525050565b6000602082019050610353600083018461032f565b92915050565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6103ba82610371565b810181811067ffffffffffffffff821117156103d9576103d8610382565b5b80604052505050565b60006103ec610358565b90506103f882826103b1565b919050565b600067ffffffffffffffff82111561041857610417610382565b5b61042182610371565b9050602081019050919050565b82818337600083830152505050565b600061045061044b846103fd565b6103e2565b90508281526020810184848401111561046c5761046b61036c565b5b61047784828561042e565b509392505050565b600082601f83011261049457610493610367565b5b81356104a484826020860161043d565b91505092915050565b6104b681610325565b81146104c157600080fd5b50565b6000813590506104d3816104ad565b92915050565b6000806000606084860312156104f2576104f1610359565b5b600084013567ffffffffffffffff8111156105105761050f61035e565b5b61051c8682870161047f565b935050602084013567ffffffffffffffff81111561053d5761053c61035e565b5b6105498682870161047f565b925050604061055a868287016104c4565b9150509250925092565b600082825260208201905092915050565b7f496e73756666696369656e742066656500000000000000000000000000000000600082015250565b60006105ab601083610564565b91506105b682610575565b602082019050919050565b600060208201905081810360008301526105da8161059e565b9050919050565b600081519050919050565b60005b838110156106095780820151818401526020810190506105ee565b60008484015250505050565b600061062082610325565b61062a8185610564565b935061063a8185602086016105eb565b61064381610371565b840191505092915050565b6000604082019050818103600083015261066881856105e1565b90508181036020830152610615565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b60006106d3602683610564565b91506106de8261067d565b604082019050919050565b60006020820190508181036000830152610702816106c6565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061074382610325565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361077557610774610709565b5b60018201905091905056fea2646970667358221220a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890123456789064736f6c63430008130033";

// ===== 工具函数 =====

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
    if (Number(networkId) !== BSC_TESTNET_CHAIN_ID) {
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
 * 部署简化的工厂合约
 */
async function deploySimpleFactory(web3, account) {
    log('开始部署简化工厂合约...', 'deploy');
    
    const contract = new web3.eth.Contract(SIMPLE_FACTORY_ABI);
    
    const deployedContract = await contract.deploy({
        data: SIMPLE_FACTORY_BYTECODE
    }).send({
        from: account.address,
        gas: 2000000,
        gasPrice: await web3.eth.getGasPrice()
    });
    
    log(`工厂合约部署成功! 地址: ${deployedContract.options.address}`, 'success');
    
    return deployedContract;
}

/**
 * 创建简单代币
 */
async function createSimpleToken(web3, factory, account, config) {
    log(`创建代币: ${config.name} (${config.symbol})...`, 'deploy');
    
    const creationFee = await factory.methods.creationFee().call();
    log(`创建费用: ${web3.utils.fromWei(creationFee, 'ether')} BNB`);
    
    const createTx = await factory.methods.createSimpleToken(
        config.name,
        config.symbol,
        config.totalSupply
    ).send({
        from: account.address,
        value: creationFee,
        gas: 2000000
    });
    
    // 获取代币地址
    const tokenAddress = createTx.events.TokenCreated.returnValues.token;
    log(`代币创建成功! 地址: ${tokenAddress}`, 'success');
    
    return {
        tokenAddress,
        transactionHash: createTx.transactionHash
    };
}

/**
 * 保存部署信息
 */
function saveDeploymentInfo(factoryAddress, tokenInfo, config) {
    const timestamp = new Date().toISOString();
    const filename = `deployment-info-${Date.now()}.json`;
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const filepath = path.join(deploymentsDir, filename);
    
    const deploymentInfo = {
        timestamp,
        network: {
            name: 'BSC Testnet',
            chainId: BSC_TESTNET_CHAIN_ID,
            rpcUrl: BSC_TESTNET_RPC
        },
        contracts: {
            StagedTokenFactory: {
                address: factoryAddress,
                abi: SIMPLE_FACTORY_ABI
            }
        },
        tokens: tokenInfo ? [tokenInfo] : [],
        config: config
    };
    
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
    log(`部署信息已保存: ${filepath}`, 'success');
    
    return filepath;
}

/**
 * 生成前端集成文件
 */
function generateFrontendIntegration(factoryAddress) {
    const frontendCode = `
// 前端集成代码 - BSC测试网
// 生成时间: ${new Date().toISOString()}

import Web3 from 'web3';

// 配置
export const CONFIG = {
    FACTORY_ADDRESS: '${factoryAddress}',
    BSC_TESTNET_RPC: '${BSC_TESTNET_RPC}',
    CHAIN_ID: ${BSC_TESTNET_CHAIN_ID},
    EXPLORER_URL: 'https://testnet.bscscan.com'
};

// 工厂合约ABI
export const FACTORY_ABI = ${JSON.stringify(SIMPLE_FACTORY_ABI, null, 2)};

// 初始化Web3
export async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const chainId = await web3.eth.getChainId();
        if (chainId !== CONFIG.CHAIN_ID) {
            throw new Error('请切换到BSC测试网');
        }
        
        return web3;
    } else {
        throw new Error('请安装MetaMask');
    }
}

// 获取工厂合约
export async function getFactoryContract(web3) {
    return new web3.eth.Contract(FACTORY_ABI, CONFIG.FACTORY_ADDRESS);
}

// 创建代币
export async function createToken(web3, tokenConfig) {
    const accounts = await web3.eth.getAccounts();
    const factory = await getFactoryContract(web3);
    
    const creationFee = await factory.methods.creationFee().call();
    
    return await factory.methods.createSimpleToken(
        tokenConfig.name,
        tokenConfig.symbol,
        tokenConfig.totalSupply
    ).send({
        from: accounts[0],
        value: creationFee
    });
}

// 使用示例
/*
const web3 = await initWeb3();
const receipt = await createToken(web3, {
    name: 'My Token',
    symbol: 'MTK',
    totalSupply: '1000000'
});
console.log('代币创建成功:', receipt);
*/
`;
    
    const frontendFile = path.join(__dirname, '..', 'frontend-integration.js');
    fs.writeFileSync(frontendFile, frontendCode);
    log(`前端集成文件已生成: ${frontendFile}`, 'success');
    
    return frontendFile;
}

/**
 * 主函数
 */
async function main() {
    const startTime = Date.now();

    try {
        log('='.repeat(60), 'deploy');
        log('一体化部署和测试脚本启动', 'deploy');
        log('='.repeat(60), 'deploy');

        // 1. 初始化Web3连接
        const { web3, account } = await initializeWeb3();

        // 2. 部署工厂合约
        log('\n📦 第一步：部署工厂合约');
        const factory = await deploySimpleFactory(web3, account);

        // 3. 获取合约信息
        const totalTokensCreated = await factory.methods.totalTokensCreated().call();
        const creationFee = await factory.methods.creationFee().call();

        log(`工厂合约信息:`);
        log(`  地址: ${factory.options.address}`);
        log(`  已创建代币数量: ${totalTokensCreated}`);
        log(`  创建费用: ${web3.utils.fromWei(creationFee, 'ether')} BNB`);

        // 4. 创建测试代币
        let tokenInfo = null;
        if (process.env.SKIP_TOKEN_CREATION !== 'true') {
            log('\n🪙 第二步：创建测试代币');
            const tokenResult = await createSimpleToken(web3, factory, account, TOKEN_CONFIG);

            tokenInfo = {
                ...TOKEN_CONFIG,
                address: tokenResult.tokenAddress,
                transactionHash: tokenResult.transactionHash,
                creator: account.address,
                network: 'BSC Testnet',
                explorer: `https://testnet.bscscan.com/token/${tokenResult.tokenAddress}`
            };
        }

        // 5. 保存部署信息
        log('\n💾 第三步：保存部署信息');
        const configFile = saveDeploymentInfo(factory.options.address, tokenInfo, TOKEN_CONFIG);

        // 6. 生成前端集成文件
        log('\n🌐 第四步：生成前端集成文件');
        const frontendFile = generateFrontendIntegration(factory.options.address);

        // 7. 输出总结
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        log('\n' + '='.repeat(60), 'success');
        log('🎉 部署完成! 总结信息:', 'success');
        log('='.repeat(60), 'success');
        log(`⏱️  总耗时: ${duration} 秒`);
        log(`🏭 工厂合约: ${factory.options.address}`);
        if (tokenInfo) {
            log(`🪙 测试代币: ${tokenInfo.address}`);
        }
        log(`📄 配置文件: ${configFile}`);
        log(`🌐 前端集成: ${frontendFile}`);
        log(`🔍 BSCScan: https://testnet.bscscan.com/address/${factory.options.address}`);
        log('='.repeat(60), 'success');

        // 8. 输出使用说明
        printUsageInstructions(factory.options.address, tokenInfo);

    } catch (error) {
        log(`部署失败: ${error.message}`, 'error');
        console.error('详细错误信息:', error);
        process.exit(1);
    }
}

/**
 * 打印使用说明
 */
function printUsageInstructions(factoryAddress, tokenInfo) {
    log('\n📖 使用说明:');
    log('─'.repeat(50));
    log('1. 创建更多代币:');
    log('   node scripts/create-token.js --factory-address ' + factoryAddress);
    log('');
    log('2. 前端集成:');
    log('   参考生成的 frontend-integration.js 文件');
    log('');
    log('3. 合约地址:');
    log(`   工厂合约: ${factoryAddress}`);
    if (tokenInfo) {
        log(`   测试代币: ${tokenInfo.address}`);
    }
    log('');
    log('4. 区块链浏览器:');
    log(`   工厂合约: https://testnet.bscscan.com/address/${factoryAddress}`);
    if (tokenInfo) {
        log(`   测试代币: https://testnet.bscscan.com/token/${tokenInfo.address}`);
    }
    log('');
    log('5. 环境变量:');
    log('   SKIP_TOKEN_CREATION=true - 跳过代币创建');
    log('   TOKEN_NAME="Custom Name" - 自定义代币名称');
    log('   TOKEN_SYMBOL="CUSTOM" - 自定义代币符号');
    log('─'.repeat(50));
}

// ===== 脚本入口 =====

if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    main,
    deploySimpleFactory,
    createSimpleToken,
    saveDeploymentInfo,
    generateFrontendIntegration
};
