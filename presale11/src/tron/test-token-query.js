// test-token-query.js
// TRON Nile测试链 - 代币预售对查询测试脚本

const TronWeb = require('tronweb');

// 配置
const CONFIG = {
    FACTORY_ADDRESS: 'TTMTNpZPeaxV9aT3mDuhMT7t6Suu1NtMrc',
    CREATOR_ADDRESS: 'TK57586sko7cTQxgNUGqpzMGWTwWBsr6iu',
    NILE_NETWORK: {
        fullHost: 'https://nile.trongrid.io',
        solidityNode: 'https://nile.trongrid.io',
        eventServer: 'https://nile.trongrid.io'
    }
};

// CoordinatorFactory ABI (简化版，包含主要查询方法)
const FACTORY_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "creator", "type": "address"},
            {"internalType": "uint256", "name": "offset", "type": "uint256"},
            {"internalType": "uint256", "name": "limit", "type": "uint256"}
        ],
        "name": "getTokenPresalePairsByCreator",
        "outputs": [
            {
                "components": [
                    {"internalType": "address", "name": "tokenAddress", "type": "address"},
                    {"internalType": "address", "name": "presaleAddress", "type": "address"},
                    {"internalType": "address", "name": "creator", "type": "address"},
                    {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
                    {"internalType": "string", "name": "tokenName", "type": "string"},
                    {"internalType": "string", "name": "tokenSymbol", "type": "string"},
                    {"internalType": "uint256", "name": "totalSupply", "type": "uint256"}
                ],
                "internalType": "struct CoordinatorFactory.TokenPresalePair[]",
                "name": "pairs",
                "type": "tuple[]"
            },
            {"internalType": "uint256", "name": "total", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "creator", "type": "address"}],
        "name": "getCreatorTokenCount",
        "outputs": [{"internalType": "uint256", "name": "count", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "offset", "type": "uint256"},
            {"internalType": "uint256", "name": "limit", "type": "uint256"}
        ],
        "name": "getAllTokenPresalePairs",
        "outputs": [
            {
                "components": [
                    {"internalType": "address", "name": "tokenAddress", "type": "address"},
                    {"internalType": "address", "name": "presaleAddress", "type": "address"},
                    {"internalType": "address", "name": "creator", "type": "address"},
                    {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
                    {"internalType": "string", "name": "tokenName", "type": "string"},
                    {"internalType": "string", "name": "tokenSymbol", "type": "string"},
                    {"internalType": "uint256", "name": "totalSupply", "type": "uint256"}
                ],
                "internalType": "struct CoordinatorFactory.TokenPresalePair[]",
                "name": "pairs",
                "type": "tuple[]"
            },
            {"internalType": "uint256", "name": "total", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalPairsCreated",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "factoryEnabled",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// 初始化TronWeb
const tronWeb = new TronWeb(CONFIG.NILE_NETWORK);

// 格式化地址显示
function formatAddress(address) {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// 格式化时间戳
function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    return new Date(Number(timestamp) * 1000).toLocaleString();
}

// 打印分隔线
function printSeparator(title = '') {
    const line = '='.repeat(60);
    if (title) {
        console.log(`\n${line}`);
        console.log(`  ${title}`);
        console.log(`${line}`);
    } else {
        console.log(`\n${line}`);
    }
}

// 测试合约连接
async function testContractConnection() {
    printSeparator('测试合约连接');
    
    try {
        console.log('🔍 正在连接合约...');
        const contract = await tronWeb.contract(FACTORY_ABI, CONFIG.FACTORY_ADDRESS);
        
        // 测试基本调用
        console.log('📞 测试基本合约调用...');
        const [totalPairs, factoryEnabled] = await Promise.all([
            contract.totalPairsCreated().call(),
            contract.factoryEnabled().call()
        ]);
        
        console.log('✅ 合约连接成功');
        console.log(`📊 总创建数量: ${totalPairs.toString()}`);
        console.log(`🏭 工厂状态: ${factoryEnabled ? '启用' : '禁用'}`);
        
        return contract;
    } catch (error) {
        console.error('❌ 合约连接失败:', error.message);
        return null;
    }
}

// 测试创建者代币数量
async function testCreatorTokenCount(contract) {
    printSeparator('测试创建者代币数量');
    
    try {
        console.log(`🔍 查询创建者地址: ${CONFIG.CREATOR_ADDRESS}`);
        const creatorCount = await contract.getCreatorTokenCount(CONFIG.CREATOR_ADDRESS).call();
        
        console.log(`📊 创建者代币数量: ${creatorCount.toString()}`);
        
        if (creatorCount.toString() === '0') {
            console.log('⚠️ 该地址没有创建过代币');
            return 0;
        }
        
        console.log('✅ 创建者代币数量查询成功');
        return parseInt(creatorCount.toString());
    } catch (error) {
        console.error('❌ 查询创建者代币数量失败:', error.message);
        return 0;
    }
}

// 测试代币预售对查询
async function testGetTokenPresalePairs(contract) {
    printSeparator('测试代币预售对查询');
    
    try {
        console.log(`🔍 查询代币预售对...`);
        console.log(`   创建者地址: ${CONFIG.CREATOR_ADDRESS}`);
        console.log(`   偏移量: 0`);
        console.log(`   限制数量: 50`);
        
        const result = await contract.getTokenPresalePairsByCreator(
            CONFIG.CREATOR_ADDRESS,
            0,  // offset
            50  // limit
        ).call();
        
        console.log(`📊 查询结果:`);
        console.log(`   - 返回代币数量: ${result.pairs.length}`);
        console.log(`   - 总代币数量: ${result.total.toString()}`);
        
        if (result.pairs && result.pairs.length > 0) {
            console.log('\n📋 代币列表:');
            result.pairs.forEach((pair, index) => {
                console.log(`\n${index + 1}. ${pair.tokenSymbol} (${pair.tokenName})`);
                console.log(`   代币地址: ${formatAddress(pair.tokenAddress)}`);
                console.log(`   预售地址: ${formatAddress(pair.presaleAddress)}`);
                console.log(`   创建者: ${formatAddress(pair.creator)}`);
                console.log(`   创建时间: ${formatTimestamp(pair.createdAt)}`);
                console.log(`   总供应量: ${pair.totalSupply.toString()}`);
                console.log(`   TRONScan: https://nile.tronscan.org/#/address/${pair.tokenAddress}`);
            });
        } else {
            console.log('⚠️ 未找到代币预售对');
        }
        
        console.log('✅ 代币预售对查询成功');
        return result;
    } catch (error) {
        console.error('❌ 代币预售对查询失败:', error.message);
        return null;
    }
}

// 测试所有代币查询
async function testAllTokens(contract) {
    printSeparator('测试所有代币查询');
    
    try {
        console.log('🔍 查询所有代币...');
        const result = await contract.getAllTokenPresalePairs(0, 50).call();
        
        console.log(`📊 所有代币查询结果:`);
        console.log(`   - 返回代币数量: ${result.pairs.length}`);
        console.log(`   - 总代币数量: ${result.total.toString()}`);
        
        // 筛选指定创建者的代币
        const creatorTokens = result.pairs.filter(pair => 
            pair.creator.toLowerCase() === CONFIG.CREATOR_ADDRESS.toLowerCase()
        );
        
        console.log(`\n🎯 筛选结果:`);
        console.log(`   - 创建者代币数量: ${creatorTokens.length}`);
        
        if (creatorTokens.length > 0) {
            console.log('\n📋 创建者的代币:');
            creatorTokens.forEach((pair, index) => {
                console.log(`\n${index + 1}. ${pair.tokenSymbol} (${pair.tokenName})`);
                console.log(`   代币地址: ${formatAddress(pair.tokenAddress)}`);
                console.log(`   预售地址: ${formatAddress(pair.presaleAddress)}`);
                console.log(`   创建时间: ${formatTimestamp(pair.createdAt)}`);
            });
        } else {
            console.log('⚠️ 在所有代币中未找到创建者的代币');
        }
        
        console.log('✅ 所有代币查询成功');
        return result;
    } catch (error) {
        console.error('❌ 所有代币查询失败:', error.message);
        return null;
    }
}

// 分页查询测试
async function testPaginationQuery(contract, totalCount) {
    printSeparator('测试分页查询');
    
    try {
        console.log(`🔍 开始分页查询，总代币数量: ${totalCount}`);
        
        const allTokens = [];
        const pageSize = 10;
        let offset = 0;
        let pageCount = 0;
        
        while (offset < totalCount) {
            pageCount++;
            console.log(`\n📄 查询第 ${pageCount} 页 (offset: ${offset}, limit: ${pageSize})`);
            
            const result = await contract.getTokenPresalePairsByCreator(
                CONFIG.CREATOR_ADDRESS,
                offset,
                pageSize
            ).call();
            
            console.log(`   返回代币数量: ${result.pairs.length}`);
            allTokens.push(...result.pairs);
            offset += pageSize;
            
            // 如果返回的数据少于页面大小，说明已经查询完
            if (result.pairs.length < pageSize) {
                console.log(`   已到达最后一页`);
                break;
            }
        }
        
        console.log(`\n✅ 分页查询完成`);
        console.log(`   - 总页数: ${pageCount}`);
        console.log(`   - 总获取代币数量: ${allTokens.length}`);
        
        return allTokens;
        
    } catch (error) {
        console.error('❌ 分页查询失败:', error.message);
        return [];
    }
}

// 网络连接测试
async function testNetworkConnection() {
    printSeparator('测试网络连接');
    
    try {
        console.log('🔍 测试TRON Nile网络连接...');
        
        // 获取节点信息
        const nodeInfo = await tronWeb.trx.getNodeInfo();
        console.log('✅ 网络连接成功');
        console.log(`🌐 节点信息: ${nodeInfo.configNodeInfo}`);
        
        // 检查是否为Nile网络
        const isNile = nodeInfo.configNodeInfo.includes('nile');
        console.log(`📡 网络类型: ${isNile ? 'Nile测试网' : '其他网络'}`);
        
        if (!isNile) {
            console.log('⚠️ 警告: 当前可能不是Nile测试网');
        }
        
        return true;
    } catch (error) {
        console.error('❌ 网络连接失败:', error.message);
        return false;
    }
}

// 主测试函数
async function runFullTest() {
    console.log('🚀 开始TRON Nile测试链代币预售对查询测试');
    printSeparator('测试信息');
    console.log(`📋 测试信息:`);
    console.log(`   网络: TRON Nile测试网`);
    console.log(`   工厂合约: ${CONFIG.FACTORY_ADDRESS}`);
    console.log(`   创建者地址: ${CONFIG.CREATOR_ADDRESS}`);
    
    try {
        // 1. 测试网络连接
        const networkOk = await testNetworkConnection();
        if (!networkOk) {
            console.log('❌ 网络连接失败，测试终止');
            return;
        }
        
        // 2. 测试合约连接
        const contract = await testContractConnection();
        if (!contract) {
            console.log('❌ 合约连接失败，测试终止');
            return;
        }
        
        // 3. 测试创建者代币数量
        const creatorCount = await testCreatorTokenCount(contract);
        
        // 4. 测试代币预售对查询
        const queryResult = await testGetTokenPresalePairs(contract);
        
        // 5. 测试所有代币查询
        const allTokensResult = await testAllTokens(contract);
        
        // 6. 如果有代币，测试分页查询
        if (creatorCount > 0) {
            await testPaginationQuery(contract, creatorCount);
        }
        
        // 测试总结
        printSeparator('测试总结');
        console.log('📊 测试结果:');
        console.log(`   ✅ 网络连接: 成功`);
        console.log(`   ✅ 合约连接: 成功`);
        console.log(`   📊 创建者代币数量: ${creatorCount}`);
        console.log(`   📊 代币预售对查询: ${queryResult ? '成功' : '失败'}`);
        console.log(`   📊 所有代币查询: ${allTokensResult ? '成功' : '失败'}`);
        
        if (creatorCount > 0) {
            console.log(`\n🎉 测试成功! 找到 ${creatorCount} 个代币预售对`);
        } else {
            console.log(`\n⚠️ 测试完成，但未找到代币预售对`);
        }
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
        console.error('错误详情:', error);
    }
}

// 单独测试函数
async function testSpecificFunction(functionName) {
    console.log(`🔍 测试特定函数: ${functionName}`);
    
    try {
        const contract = await tronWeb.contract(FACTORY_ABI, CONFIG.FACTORY_ADDRESS);
        
        switch (functionName) {
            case 'getCreatorTokenCount':
                await testCreatorTokenCount(contract);
                break;
            case 'getTokenPresalePairsByCreator':
                await testGetTokenPresalePairs(contract);
                break;
            case 'getAllTokenPresalePairs':
                await testAllTokens(contract);
                break;
            default:
                console.log('❌ 未知的测试函数');
        }
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

// 命令行参数处理
const args = process.argv.slice(2);
const command = args[0];

if (command === 'full') {
    // 运行完整测试
    runFullTest().then(() => {
        console.log('\n🎉 测试脚本执行完毕');
        process.exit(0);
    }).catch((error) => {
        console.error('❌ 测试脚本执行失败:', error);
        process.exit(1);
    });
} else if (command === 'creator') {
    // 测试创建者代币数量
    testSpecificFunction('getCreatorTokenCount').then(() => {
        process.exit(0);
    });
} else if (command === 'pairs') {
    // 测试代币预售对查询
    testSpecificFunction('getTokenPresalePairsByCreator').then(() => {
        process.exit(0);
    });
} else if (command === 'all') {
    // 测试所有代币查询
    testSpecificFunction('getAllTokenPresalePairs').then(() => {
        process.exit(0);
    });
} else {
    // 默认运行完整测试
    console.log('📋 使用方法:');
    console.log('  node test-token-query.js full     - 运行完整测试');
    console.log('  node test-token-query.js creator  - 测试创建者代币数量');
    console.log('  node test-token-query.js pairs    - 测试代币预售对查询');
    console.log('  node test-token-query.js all      - 测试所有代币查询');
    console.log('  node test-token-query.js          - 运行完整测试');
    
    runFullTest().then(() => {
        console.log('\n🎉 测试脚本执行完毕');
        process.exit(0);
    }).catch((error) => {
        console.error('❌ 测试脚本执行失败:', error);
        process.exit(1);
    });
}

// 导出函数供其他模块使用
module.exports = {
    runFullTest,
    testContractConnection,
    testCreatorTokenCount,
    testGetTokenPresalePairs,
    testAllTokens,
    testPaginationQuery,
    testNetworkConnection
};
