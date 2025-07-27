#!/usr/bin/env node

/**
 * 测试BSC测试网连接
 */

require('dotenv').config();

async function testConnection() {
    console.log('🔍 测试Web3和BSC测试网连接...\n');
    
    try {
        // 测试不同的Web3导入方式
        let Web3;
        try {
            Web3 = require('web3').default;
            console.log('✅ 使用 Web3.default 导入成功');
        } catch (e) {
            try {
                Web3 = require('web3');
                console.log('✅ 使用 Web3 直接导入成功');
            } catch (e2) {
                const { Web3: Web3Named } = require('web3');
                Web3 = Web3Named;
                console.log('✅ 使用 { Web3 } 命名导入成功');
            }
        }
        
        console.log(`📋 Web3版本: ${Web3.version || 'unknown'}\n`);
        
        // 测试不同的RPC端点
        const rpcEndpoints = [
            'https://bsc-testnet-rpc.publicnode.com',
            'https://data-seed-prebsc-1-s1.binance.org:8545/',
            'https://data-seed-prebsc-2-s1.binance.org:8545/',
            'https://bsc-testnet.public.blastapi.io'
        ];
        
        let workingRPC = null;
        
        for (const rpc of rpcEndpoints) {
            try {
                console.log(`🔗 测试RPC: ${rpc}`);
                const web3 = new Web3(rpc);
                
                // 设置超时
                const timeout = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('超时')), 5000)
                );
                
                const networkTest = Promise.race([
                    web3.eth.getChainId(),
                    timeout
                ]);
                
                const chainId = await networkTest;
                
                if (chainId == 97) {
                    console.log(`✅ 连接成功! Chain ID: ${chainId}`);
                    workingRPC = rpc;
                    
                    // 测试获取最新区块
                    const blockNumber = await web3.eth.getBlockNumber();
                    console.log(`📦 最新区块: ${blockNumber}`);
                    break;
                } else {
                    console.log(`❌ 错误的Chain ID: ${chainId}`);
                }
            } catch (error) {
                console.log(`❌ 连接失败: ${error.message}`);
            }
        }
        
        if (!workingRPC) {
            throw new Error('所有RPC端点都无法连接');
        }
        
        // 测试账户配置
        console.log('\n🔑 测试账户配置...');
        const privateKey = process.env.BSC_TESTNET_DEPLOYER_KEY || process.env.PRIVATE_KEY;
        
        if (!privateKey) {
            console.log('❌ 未找到私钥配置');
            return;
        }
        
        const web3 = new Web3(workingRPC);
        const account = web3.eth.accounts.privateKeyToAccount(
            privateKey.startsWith('0x') ? privateKey : '0x' + privateKey
        );
        
        console.log(`✅ 账户地址: ${account.address}`);
        
        // 检查余额
        const balance = await web3.eth.getBalance(account.address);
        const balanceInBNB = web3.utils.fromWei(balance, 'ether');
        console.log(`💰 账户余额: ${balanceInBNB} BNB`);
        
        if (parseFloat(balanceInBNB) < 0.001) {
            console.log('⚠️ 余额不足，请访问水龙头获取测试BNB');
            console.log('🚰 BSC测试网水龙头: https://testnet.binance.org/faucet-smart');
        }
        
        console.log('\n🎉 连接测试完成!');
        console.log(`📋 推荐RPC: ${workingRPC}`);
        
        return {
            success: true,
            rpc: workingRPC,
            account: account.address,
            balance: balanceInBNB
        };
        
    } catch (error) {
        console.error('\n❌ 连接测试失败:', error.message);
        return { success: false, error: error.message };
    }
}

if (require.main === module) {
    testConnection();
}

module.exports = { testConnection };
