const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🚀 开始部署StagedTokenFactory合约到BSC测试网...');

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

    console.log('📝 编译合约...');

    // 获取合约工厂
    const StagedTokenFactory = await ethers.getContractFactory("StagedTokenFactory");

    console.log('✅ 合约编译成功');

    // 部署合约
    console.log('⏳ 正在部署StagedTokenFactory合约...');
    
    try {
        const contract = await StagedTokenFactory.deploy({
            gasLimit: 5000000,
            gasPrice: ethers.parseUnits('10', 'gwei')
        });

        console.log('📋 合约地址:', await contract.getAddress());
        console.log('🔗 交易哈希:', contract.deploymentTransaction().hash);

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

        const contractAddress = await contract.getAddress();

        // 生成前端配置
        console.log('\n📋 前端配置信息:');
        console.log('='.repeat(60));
        console.log('合约地址:', contractAddress);
        console.log('网络: BSC测试网 (Chain ID: 97)');
        console.log('部署者:', deployer.address);
        console.log('BSCScan链接: https://testnet.bscscan.com/address/' + contractAddress);
        console.log('='.repeat(60));

        // 获取合约ABI
        const contractArtifact = await ethers.getContractFactory("StagedTokenFactory");
        const abi = contractArtifact.interface.fragments.map(fragment => fragment.format('json')).map(JSON.parse);

        // 保存部署信息
        const deploymentInfo = {
            contractAddress: contractAddress,
            deployerAddress: deployer.address,
            transactionHash: contract.deploymentTransaction().hash,
            network: 'BSC Testnet',
            chainId: 97,
            deployedAt: new Date().toISOString(),
            creationFee: ethers.formatEther(creationFee),
            bscscanUrl: `https://testnet.bscscan.com/address/${contractAddress}`,
            abi: abi
        };

        // 确保目录存在
        const deployDir = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deployDir)) {
            fs.mkdirSync(deployDir, { recursive: true });
        }

        // 保存部署信息
        const deploymentFile = path.join(deployDir, 'staged-factory-deployment.json');
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
        
        console.log('💾 部署信息已保存到:', deploymentFile);

        console.log('\n🔧 自动更新前端配置...');
        await updateFrontendConfig(contractAddress, abi);

        console.log('\n🎉 部署完成！');

    } catch (error) {
        console.error('❌ 部署失败:', error.message);
        if (error.reason) {
            console.error('原因:', error.reason);
        }
    }
}

async function updateFrontendConfig(contractAddress, abi) {
    try {
        const frontendPath = path.join(__dirname, '../frontend/create-token.html');
        let content = fs.readFileSync(frontendPath, 'utf8');

        // 更新合约地址
        content = content.replace(
            /const FACTORY_ADDRESS = '[^']*';/,
            `const FACTORY_ADDRESS = '${contractAddress}';`
        );

        // 生成前端需要的ABI，包含所有必要方法
        const frontendABI = abi.filter(item => {
            if (item.type === 'function') {
                return ['creationFee', 'totalTokensCreated', 'createToken', 'createAdvancedToken', 'createAndActivateToken'].includes(item.name);
            }
            if (item.type === 'event') {
                return item.name === 'TokenCreated';
            }
            return false;
        });

        // 更新ABI
        const abiString = JSON.stringify(frontendABI, null, 12).replace(/\n/g, '\n        ');
        content = content.replace(
            /const FACTORY_ABI = \[[\s\S]*?\];/,
            `const FACTORY_ABI = ${abiString};`
        );

        fs.writeFileSync(frontendPath, content);
        console.log('✅ 前端配置已自动更新');
        console.log('📝 已更新合约地址和ABI配置');
    } catch (error) {
        console.log('⚠️ 自动更新前端配置失败:', error.message);
        console.log('请手动更新前端配置');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };
