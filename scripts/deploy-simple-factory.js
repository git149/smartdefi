const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

async function main() {
    console.log('🚀 开始部署SimpleTokenFactory合约...');

    // 读取合约源码
    const contractPath = path.join(__dirname, '../contracts/SimpleTokenFactory.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    // 编译合约
    console.log('📝 编译合约...');
    const input = {
        language: 'Solidity',
        sources: {
            'SimpleTokenFactory.sol': {
                content: source
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            }
        }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors) {
        console.log('⚠️ 编译警告/错误:');
        output.errors.forEach(error => {
            console.log(error.formattedMessage);
        });
    }

    const contract = output.contracts['SimpleTokenFactory.sol']['SimpleTokenFactory'];
    const abi = contract.abi;
    const bytecode = contract.evm.bytecode.object;

    console.log('✅ 合约编译成功');

    // 连接到BSC测试网
    const provider = new ethers.JsonRpcProvider('https://bsc-testnet-rpc.publicnode.com');
    
    // 注意：这里需要私钥，实际部署时请设置环境变量
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.log('❌ 请设置环境变量 PRIVATE_KEY');
        console.log('💡 使用方法: PRIVATE_KEY=your_private_key node scripts/deploy-simple-factory.js');
        return;
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    console.log('📝 部署者地址:', wallet.address);

    // 获取余额
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 部署者余额:', ethers.formatEther(balance), 'BNB');

    if (parseFloat(ethers.formatEther(balance)) < 0.01) {
        console.log('❌ 余额不足，需要至少 0.01 BNB 进行部署');
        return;
    }

    // 部署合约
    console.log('⏳ 正在部署合约...');
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    
    try {
        const contract = await factory.deploy({
            gasLimit: 3000000,
            gasPrice: ethers.parseUnits('10', 'gwei')
        });

        console.log('📋 合约地址:', contract.target);
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
        
        console.log('✅ 合约功能验证通过！');

        // 生成前端配置
        console.log('\n📋 前端配置信息:');
        console.log('='.repeat(50));
        console.log('合约地址:', contract.target);
        console.log('网络: BSC测试网 (Chain ID: 97)');
        console.log('部署者:', wallet.address);
        console.log('='.repeat(50));

        // 保存部署信息
        const deploymentInfo = {
            contractAddress: contract.target,
            deployerAddress: wallet.address,
            transactionHash: contract.deploymentTransaction().hash,
            network: 'BSC Testnet',
            chainId: 97,
            deployedAt: new Date().toISOString(),
            creationFee: ethers.formatEther(creationFee),
            abi: abi
        };

        // 确保目录存在
        const deployDir = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deployDir)) {
            fs.mkdirSync(deployDir, { recursive: true });
        }

        // 保存部署信息
        const deploymentFile = path.join(deployDir, 'simple-factory-deployment.json');
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
        
        console.log('💾 部署信息已保存到:', deploymentFile);

        console.log('\n🎉 部署完成！');
        console.log('📝 请将以下信息更新到前端代码中:');
        console.log(`   const FACTORY_ADDRESS = '${contract.target}';`);

        // 生成更新前端的脚本
        console.log('\n🔧 自动更新前端配置...');
        await updateFrontendConfig(contract.target, abi);

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

        // 更新ABI（保持现有格式）
        const abiString = JSON.stringify(abi, null, 12).replace(/\n/g, '\n        ');
        content = content.replace(
            /const FACTORY_ABI = \[[\s\S]*?\];/,
            `const FACTORY_ABI = ${abiString};`
        );

        fs.writeFileSync(frontendPath, content);
        console.log('✅ 前端配置已自动更新');
    } catch (error) {
        console.log('⚠️ 自动更新前端配置失败:', error.message);
        console.log('请手动更新前端配置');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };
