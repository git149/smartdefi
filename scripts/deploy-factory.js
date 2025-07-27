const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 开始部署StagedTokenFactory合约...");

    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    console.log("📝 部署者地址:", deployer.address);

    // 获取账户余额
    const balance = await deployer.getBalance();
    console.log("💰 部署者余额:", ethers.utils.formatEther(balance), "BNB");

    // 获取合约工厂
    const StagedTokenFactory = await ethers.getContractFactory("StagedTokenFactory");

    // 部署合约
    console.log("⏳ 正在部署合约...");
    const factory = await StagedTokenFactory.deploy();

    // 等待部署完成
    await factory.deployed();

    console.log("✅ 合约部署成功！");
    console.log("📋 合约地址:", factory.address);
    console.log("🔗 交易哈希:", factory.deployTransaction.hash);

    // 验证合约功能
    console.log("\n🔍 验证合约功能...");
    
    try {
        const creationFee = await factory.creationFee();
        console.log("💰 创建费用:", ethers.utils.formatEther(creationFee), "BNB");
        
        const totalTokens = await factory.totalTokensCreated();
        console.log("📊 已创建代币数量:", totalTokens.toString());
        
        const owner = await factory.owner();
        console.log("👤 合约所有者:", owner);
        
        console.log("✅ 合约功能验证通过！");
    } catch (error) {
        console.log("❌ 合约功能验证失败:", error.message);
    }

    // 输出前端配置信息
    console.log("\n📋 前端配置信息:");
    console.log("=".repeat(50));
    console.log("合约地址:", factory.address);
    console.log("网络: BSC测试网 (Chain ID: 97)");
    console.log("部署者:", deployer.address);
    console.log("=".repeat(50));

    // 保存部署信息到文件
    const deploymentInfo = {
        contractAddress: factory.address,
        deployerAddress: deployer.address,
        transactionHash: factory.deployTransaction.hash,
        network: "BSC Testnet",
        chainId: 97,
        deployedAt: new Date().toISOString(),
        creationFee: ethers.utils.formatEther(await factory.creationFee())
    };

    const fs = require('fs');
    const path = require('path');
    
    // 确保目录存在
    const deployDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deployDir)) {
        fs.mkdirSync(deployDir, { recursive: true });
    }

    // 保存部署信息
    const deploymentFile = path.join(deployDir, 'bsc-testnet-deployment.json');
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("💾 部署信息已保存到:", deploymentFile);

    console.log("\n🎉 部署完成！");
    console.log("📝 请将合约地址更新到前端代码中:");
    console.log(`   const FACTORY_ADDRESS = '${factory.address}';`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    });
