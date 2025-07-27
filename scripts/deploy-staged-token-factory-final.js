const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🚀 开始部署 StagedTokenFactory 合约到 BSC 测试网...');
    console.log('='.repeat(60));

    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    console.log('📝 部署者地址:', deployer.address);

    // 获取账户余额
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log('💰 部署者余额:', ethers.formatEther(balance), 'BNB');

    if (parseFloat(ethers.formatEther(balance)) < 0.05) {
        console.log('❌ 余额不足，需要至少 0.05 BNB 进行部署');
        return;
    }

    // 获取网络信息
    const network = await deployer.provider.getNetwork();
    console.log('🌐 网络信息:', {
        name: network.name,
        chainId: network.chainId.toString(),
        expected: '97 (BSC Testnet)'
    });

    if (network.chainId !== 97n) {
        console.log('❌ 网络不匹配，请确保连接到 BSC 测试网 (Chain ID: 97)');
        return;
    }

    console.log('📝 编译合约...');

    // 获取合约工厂
    const StagedTokenFactory = await ethers.getContractFactory("StagedTokenFactory");
    console.log('✅ 合约编译成功');

    // 部署合约
    console.log('⏳ 正在部署 StagedTokenFactory 合约...');
    
    try {
        const contract = await StagedTokenFactory.deploy({
            gasLimit: 6000000,
            gasPrice: ethers.parseUnits('10', 'gwei')
        });

        const contractAddress = await contract.getAddress();
        const deploymentTx = contract.deploymentTransaction();
        
        console.log('📋 合约地址:', contractAddress);
        console.log('🔗 交易哈希:', deploymentTx.hash);

        // 等待确认
        console.log('⏳ 等待交易确认...');
        await contract.waitForDeployment();

        console.log('✅ 合约部署成功！');

        // 验证合约功能
        console.log('\n🔍 验证合约功能...');
        
        const creationFee = await contract.creationFee();
        console.log('💰 创建费用:', ethers.formatEther(creationFee), 'BNB');
        
        const totalTokens = await contract.totalTokensCreated();
        console.log('📊 已创建代币数量:', totalTokens.toString());
        
        const owner = await contract.owner();
        console.log('👤 合约所有者:', owner);
        
        const factoryEnabled = await contract.factoryEnabled();
        console.log('🏭 工厂状态:', factoryEnabled ? '启用' : '禁用');
        
        console.log('✅ 合约功能验证通过！');

        // 获取合约ABI
        const contractArtifact = await ethers.getContractFactory("StagedTokenFactory");
        const abi = contractArtifact.interface.fragments.map(fragment => fragment.format('json')).map(JSON.parse);

        // 保存部署信息
        const deploymentInfo = {
            contractAddress: contractAddress,
            deployerAddress: deployer.address,
            transactionHash: deploymentTx.hash,
            network: 'BSC Testnet',
            chainId: 97,
            deployedAt: new Date().toISOString(),
            creationFee: ethers.formatEther(creationFee),
            bscscanUrl: `https://testnet.bscscan.com/address/${contractAddress}`,
            abi: abi,
            gasUsed: deploymentTx.gasLimit?.toString() || 'N/A',
            gasPrice: ethers.formatUnits(deploymentTx.gasPrice || 0, 'gwei') + ' Gwei'
        };

        // 确保目录存在
        const deployDir = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deployDir)) {
            fs.mkdirSync(deployDir, { recursive: true });
        }

        // 保存部署信息
        const deploymentFile = path.join(deployDir, 'staged-token-factory-deployment.json');
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
        
        console.log('💾 部署信息已保存到:', deploymentFile);

        // 生成前端配置文件
        console.log('\n🔧 生成前端配置文件...');
        await generateFrontendConfig(contractAddress, abi);

        // 输出部署总结
        console.log('\n' + '='.repeat(60));
        console.log('🎉 部署完成! 总结信息:');
        console.log('='.repeat(60));
        console.log(`📄 配置文件: ${deploymentFile}`);
        console.log(`🏭 工厂合约: ${contractAddress}`);
        console.log(`🌐 BSCScan: https://testnet.bscscan.com/address/${contractAddress}`);
        console.log(`💰 创建费用: ${ethers.formatEther(creationFee)} BNB`);
        console.log('='.repeat(60));

        // 输出使用说明
        printUsageInstructions(contractAddress);

        return {
            contractAddress,
            deploymentInfo,
            abi
        };

    } catch (error) {
        console.error('❌ 部署失败:', error.message);
        if (error.reason) {
            console.error('原因:', error.reason);
        }
        throw error;
    }
}

async function generateFrontendConfig(contractAddress, abi) {
    try {
        // 生成前端配置文件
        const frontendConfig = {
            contractAddress: contractAddress,
            network: {
                name: 'BSC Testnet',
                chainId: 97,
                rpcUrl: 'https://bsc-testnet-rpc.publicnode.com',
                blockExplorer: 'https://testnet.bscscan.com'
            },
            abi: abi
        };

        const configDir = path.join(__dirname, '../frontend/config');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }

        // 保存完整配置
        const configFile = path.join(configDir, 'contract-config.json');
        fs.writeFileSync(configFile, JSON.stringify(frontendConfig, null, 2));

        // 生成单独的ABI文件
        const abiFile = path.join(configDir, 'staged-token-factory-abi.json');
        fs.writeFileSync(abiFile, JSON.stringify(abi, null, 2));

        console.log('✅ 前端配置文件已生成:');
        console.log(`   - 完整配置: ${configFile}`);
        console.log(`   - ABI文件: ${abiFile}`);

        return { configFile, abiFile };
    } catch (error) {
        console.log('⚠️ 生成前端配置失败:', error.message);
        throw error;
    }
}

function printUsageInstructions(contractAddress) {
    console.log('\n📖 使用说明:');
    console.log('─'.repeat(40));
    console.log('1. 前端集成:');
    console.log('   - 合约地址:', contractAddress);
    console.log('   - 配置文件: frontend/config/contract-config.json');
    console.log('   - ABI文件: frontend/config/staged-token-factory-abi.json');
    console.log('');
    console.log('2. 合约验证:');
    console.log(`   - BSCScan: https://testnet.bscscan.com/address/${contractAddress}`);
    console.log('');
    console.log('3. 测试合约:');
    console.log('   - 可以调用 creationFee() 查看创建费用');
    console.log('   - 可以调用 totalTokensCreated() 查看已创建代币数量');
    console.log('─'.repeat(40));
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, generateFrontendConfig };
