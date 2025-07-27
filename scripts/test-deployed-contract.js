const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
    console.log('🔍 测试已部署的 StagedTokenFactory 合约...');
    console.log('='.repeat(60));

    // 合约地址
    const contractAddress = '0x073faD54A73333EC1671522b9cCCbbBd153DA265';
    
    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    console.log('📝 测试账户:', deployer.address);

    // 获取合约实例
    const StagedTokenFactory = await ethers.getContractFactory("StagedTokenFactory");
    const contract = StagedTokenFactory.attach(contractAddress);

    console.log('📋 合约地址:', contractAddress);
    console.log('🌐 网络:', await deployer.provider.getNetwork());

    try {
        // 测试基本查询功能
        console.log('\n🔍 测试基本查询功能...');
        
        const creationFee = await contract.creationFee();
        console.log('💰 创建费用:', ethers.formatEther(creationFee), 'BNB');
        
        const totalTokens = await contract.totalTokensCreated();
        console.log('📊 已创建代币数量:', totalTokens.toString());
        
        const owner = await contract.owner();
        console.log('👤 合约所有者:', owner);
        
        const factoryEnabled = await contract.factoryEnabled();
        console.log('🏭 工厂状态:', factoryEnabled ? '启用' : '禁用');
        
        const allTokensLength = await contract.getAllTokensLength();
        console.log('📋 代币列表长度:', allTokensLength.toString());

        // 测试网络配置查询
        console.log('\n🌐 测试网络配置...');
        const networkConfig = await contract.networkConfigs(97); // BSC Testnet
        console.log('🔧 BSC测试网配置:', {
            router: networkConfig.router,
            wbnb: networkConfig.wbnb,
            usdt: networkConfig.usdt,
            enabled: networkConfig.enabled
        });

        console.log('\n✅ 所有基本功能测试通过！');

        // 可选：测试代币创建（需要足够的BNB）
        const balance = await deployer.provider.getBalance(deployer.address);
        const balanceInBNB = parseFloat(ethers.formatEther(balance));
        const creationFeeInBNB = parseFloat(ethers.formatEther(creationFee));
        
        console.log('\n💰 账户余额检查:');
        console.log(`   当前余额: ${balanceInBNB.toFixed(4)} BNB`);
        console.log(`   创建费用: ${creationFeeInBNB} BNB`);
        console.log(`   Gas预估: ~0.01 BNB`);
        
        if (balanceInBNB >= (creationFeeInBNB + 0.01)) {
            console.log('✅ 余额充足，可以进行代币创建测试');
            
            // 询问是否要创建测试代币
            console.log('\n🪙 是否创建测试代币？');
            console.log('   设置环境变量 CREATE_TEST_TOKEN=true 来启用测试代币创建');
            
            if (process.env.CREATE_TEST_TOKEN === 'true') {
                await testTokenCreation(contract, deployer, creationFee);
            } else {
                console.log('⏭️ 跳过代币创建测试');
            }
        } else {
            console.log('⚠️ 余额不足，跳过代币创建测试');
            console.log('   请访问 https://testnet.binance.org/faucet-smart 获取测试BNB');
        }

        // 输出测试总结
        console.log('\n' + '='.repeat(60));
        console.log('🎉 合约测试完成！');
        console.log('='.repeat(60));
        console.log('📋 合约地址:', contractAddress);
        console.log('🌐 BSCScan:', `https://testnet.bscscan.com/address/${contractAddress}`);
        console.log('💰 创建费用:', ethers.formatEther(creationFee), 'BNB');
        console.log('📊 当前代币数量:', totalTokens.toString());
        console.log('🏭 工厂状态:', factoryEnabled ? '正常运行' : '已禁用');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.reason) {
            console.error('原因:', error.reason);
        }
        throw error;
    }
}

async function testTokenCreation(contract, deployer, creationFee) {
    console.log('\n🪙 开始测试代币创建...');
    
    try {
        const tokenConfig = {
            name: 'Test Token ' + Date.now(),
            symbol: 'TEST' + Math.floor(Math.random() * 1000),
            totalSupply: '1000000',
            buyFee: 1,
            sellFee: 4
        };

        console.log('📝 代币配置:', tokenConfig);

        // 估算Gas
        const gasEstimate = await contract.createToken.estimateGas(
            tokenConfig.name,
            tokenConfig.symbol,
            tokenConfig.totalSupply,
            tokenConfig.buyFee,
            tokenConfig.sellFee,
            { value: creationFee }
        );

        console.log('⛽ Gas估算:', gasEstimate.toString());

        // 创建代币
        console.log('⏳ 正在创建代币...');
        const tx = await contract.createToken(
            tokenConfig.name,
            tokenConfig.symbol,
            tokenConfig.totalSupply,
            tokenConfig.buyFee,
            tokenConfig.sellFee,
            {
                value: creationFee,
                gasLimit: Math.floor(gasEstimate * 1.2) // 增加20%缓冲
            }
        );

        console.log('🔗 交易哈希:', tx.hash);
        console.log('⏳ 等待交易确认...');

        const receipt = await tx.wait();
        console.log('✅ 代币创建成功！');
        console.log('📋 Gas使用:', receipt.gasUsed.toString());

        // 解析事件获取代币地址
        const tokenCreatedEvent = receipt.logs.find(log => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed.name === 'TokenCreated';
            } catch {
                return false;
            }
        });

        if (tokenCreatedEvent) {
            const parsed = contract.interface.parseLog(tokenCreatedEvent);
            const tokenAddress = parsed.args.token;
            console.log('🪙 新代币地址:', tokenAddress);
            console.log('🌐 代币BSCScan:', `https://testnet.bscscan.com/address/${tokenAddress}`);
        }

        // 验证代币数量增加
        const newTotalTokens = await contract.totalTokensCreated();
        console.log('📊 更新后代币数量:', newTotalTokens.toString());

    } catch (error) {
        console.error('❌ 代币创建测试失败:', error.message);
        throw error;
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };
