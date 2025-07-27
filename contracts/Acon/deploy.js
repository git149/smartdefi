// SPDX-License-Identifier: MIT
// 部署脚本 - FEG SmartDeFi 代币发行生态系统

const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 开始部署 FEG SmartDeFi 代币发行生态系统...\n");

    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("📝 部署账户:", deployer.address);
    console.log("💰 账户余额:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

    // 获取网络信息
    const network = await ethers.provider.getNetwork();
    console.log("🌐 部署网络:", network.name, "(Chain ID:", network.chainId, ")\n");

    try {
        // 1. 部署 DeploymentManager (包含 TokenFactory 和 PresaleFactory)
        console.log("📦 部署 DeploymentManager...");
        const DeploymentManager = await ethers.getContractFactory("DeploymentManager");
        const deploymentManager = await DeploymentManager.deploy();
        await deploymentManager.deployed();
        console.log("✅ DeploymentManager 部署成功:", deploymentManager.address);

        // 2. 部署 FrontendInterface
        console.log("\n📦 部署 FrontendInterface...");
        const FrontendInterface = await ethers.getContractFactory("FrontendInterface");
        const frontendInterface = await FrontendInterface.deploy(deploymentManager.address);
        await frontendInterface.deployed();
        console.log("✅ FrontendInterface 部署成功:", frontendInterface.address);

        // 3. 部署 FrontendHelper
        console.log("\n📦 部署 FrontendHelper...");
        const FrontendHelper = await ethers.getContractFactory("FrontendHelper");
        const frontendHelper = await FrontendHelper.deploy();
        await frontendHelper.deployed();
        console.log("✅ FrontendHelper 部署成功:", frontendHelper.address);

        // 4. 获取工厂合约地址
        const tokenFactoryAddress = await deploymentManager.tokenFactory();
        const presaleFactoryAddress = await deploymentManager.presaleFactory();
        console.log("\n📋 工厂合约地址:");
        console.log("   TokenFactory:", tokenFactoryAddress);
        console.log("   PresaleFactory:", presaleFactoryAddress);

        // 5. 验证网络配置
        console.log("\n🔍 验证网络配置...");
        const chainConfig = await deploymentManager.getChainConfig(network.chainId);
        console.log("   链名称:", chainConfig.name);
        console.log("   路由器:", chainConfig.router);
        console.log("   WBNB:", chainConfig.wbnb);
        console.log("   USDT:", chainConfig.usdt);
        console.log("   支持状态:", chainConfig.supported ? "✅ 支持" : "❌ 不支持");

        // 6. 获取费用信息
        console.log("\n💰 费用信息:");
        const [tokenFee, presaleFee, platformFee, totalFee] = await deploymentManager.calculateDeploymentFee();
        console.log("   代币创建费用:", ethers.utils.formatEther(tokenFee), "ETH");
        console.log("   预售创建费用:", ethers.utils.formatEther(presaleFee), "ETH");
        console.log("   平台费用:", ethers.utils.formatEther(platformFee), "ETH");
        console.log("   总费用:", ethers.utils.formatEther(totalFee), "ETH");

        // 7. 输出部署总结
        console.log("\n" + "=".repeat(60));
        console.log("🎉 部署完成! 合约地址总结:");
        console.log("=".repeat(60));
        console.log("DeploymentManager:", deploymentManager.address);
        console.log("TokenFactory:", tokenFactoryAddress);
        console.log("PresaleFactory:", presaleFactoryAddress);
        console.log("FrontendInterface:", frontendInterface.address);
        console.log("FrontendHelper:", frontendHelper.address);
        console.log("=".repeat(60));

        // 8. 生成前端配置文件
        const config = {
            network: {
                name: network.name,
                chainId: network.chainId
            },
            contracts: {
                DeploymentManager: deploymentManager.address,
                TokenFactory: tokenFactoryAddress,
                PresaleFactory: presaleFactoryAddress,
                FrontendInterface: frontendInterface.address,
                FrontendHelper: frontendHelper.address
            },
            fees: {
                tokenCreation: ethers.utils.formatEther(tokenFee),
                presaleCreation: ethers.utils.formatEther(presaleFee),
                platform: ethers.utils.formatEther(platformFee),
                total: ethers.utils.formatEther(totalFee)
            },
            networkConfig: {
                router: chainConfig.router,
                wbnb: chainConfig.wbnb,
                usdt: chainConfig.usdt,
                supported: chainConfig.supported
            }
        };

        // 保存配置到文件
        const fs = require('fs');
        fs.writeFileSync(
            `deployment-config-${network.chainId}.json`,
            JSON.stringify(config, null, 2)
        );
        console.log(`\n📄 配置文件已保存: deployment-config-${network.chainId}.json`);

        // 9. 生成前端集成代码示例
        const frontendExample = `
// 前端集成示例 - ${network.name}
import { ethers } from 'ethers';

// 合约地址
const DEPLOYMENT_MANAGER = "${deploymentManager.address}";
const FRONTEND_INTERFACE = "${frontendInterface.address}";
const FRONTEND_HELPER = "${frontendHelper.address}";

// 连接合约
async function connectContracts() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    const frontendInterface = new ethers.Contract(
        FRONTEND_INTERFACE,
        FrontendInterfaceABI,
        signer
    );
    
    return { frontendInterface };
}

// 部署代币示例
async function deployToken() {
    const { frontendInterface } = await connectContracts();
    
    const params = {
        name: "MyToken",
        symbol: "MTK",
        totalSupply: 1000000,
        decimals: 18,
        buyFee: 1,
        sellFee: 4,
        presalePrice: 1000,
        hardCap: ethers.utils.parseEther("100"),
        softCap: ethers.utils.parseEther("50"),
        maxBuyPerWallet: ethers.utils.parseEther("5"),
        presaleDuration: 7 * 24 * 3600,
        liquidityPercent: 70,
        listingPrice: 800,
        autoListing: true
    };
    
    const tx = await frontendInterface.deployToken(params, {
        value: ethers.utils.parseEther("${ethers.utils.formatEther(totalFee)}")
    });
    
    const receipt = await tx.wait();
    console.log('Token deployed:', receipt);
}
`;

        fs.writeFileSync(
            `frontend-example-${network.chainId}.js`,
            frontendExample
        );
        console.log(`📄 前端示例已保存: frontend-example-${network.chainId}.js`);

        // 10. 输出使用说明
        console.log("\n" + "=".repeat(60));
        console.log("📖 使用说明:");
        console.log("=".repeat(60));
        console.log("1. 前端集成:");
        console.log(`   - 使用 FrontendInterface: ${frontendInterface.address}`);
        console.log(`   - 参考示例文件: frontend-example-${network.chainId}.js`);
        console.log("");
        console.log("2. 直接调用:");
        console.log(`   - DeploymentManager: ${deploymentManager.address}`);
        console.log(`   - 调用 deployTokenAndPresale() 函数`);
        console.log("");
        console.log("3. 费用要求:");
        console.log(`   - 每次部署需要: ${ethers.utils.formatEther(totalFee)} ETH`);
        console.log("");
        console.log("4. 网络支持:");
        console.log(`   - 当前网络: ${chainConfig.supported ? "✅ 支持" : "❌ 不支持"}`);
        console.log("=".repeat(60));

        // 11. 测试部署（可选）
        if (process.env.RUN_TEST_DEPLOYMENT === "true") {
            console.log("\n🧪 运行测试部署...");
            await testDeployment(frontendInterface, totalFee);
        }

        console.log("\n🎊 部署流程全部完成!");

    } catch (error) {
        console.error("\n❌ 部署失败:", error);
        process.exit(1);
    }
}

// 测试部署函数
async function testDeployment(frontendInterface, totalFee) {
    try {
        console.log("📝 创建测试代币...");
        
        const testParams = {
            name: "TestToken",
            symbol: "TEST",
            totalSupply: 1000000,
            decimals: 18,
            buyFee: 1,
            sellFee: 2,
            presalePrice: 1000,
            hardCap: ethers.utils.parseEther("10"),
            softCap: ethers.utils.parseEther("5"),
            maxBuyPerWallet: ethers.utils.parseEther("1"),
            presaleDuration: 24 * 3600,
            liquidityPercent: 70,
            listingPrice: 800,
            autoListing: false
        };

        const tx = await frontendInterface.deployToken(testParams, {
            value: totalFee
        });

        console.log("⏳ 等待交易确认...");
        const receipt = await tx.wait();
        
        // 解析事件获取代币地址
        const event = receipt.events?.find(e => e.event === 'TokenDeploymentCompleted');
        if (event) {
            const [creator, token, presale] = event.args;
            console.log("✅ 测试代币部署成功!");
            console.log("   创建者:", creator);
            console.log("   代币地址:", token);
            console.log("   预售地址:", presale);
        }

    } catch (error) {
        console.error("❌ 测试部署失败:", error.message);
    }
}

// 运行部署
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// 导出配置生成函数（供其他脚本使用）
module.exports = {
    main,
    testDeployment
};
