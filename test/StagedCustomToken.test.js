const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * StagedCustomToken 合约测试套件
 * 
 * 测试覆盖：
 * 1. 合约部署和初始化
 * 2. 三阶段初始化流程
 * 3. 费用机制和交易限制
 * 4. 权限管理和安全性
 * 5. DEX集成功能
 * 6. 边界条件和错误处理
 */

describe("StagedCustomToken", function () {
    let factory;
    let token;
    let owner;
    let user1;
    let user2;
    let feeRecipient;
    
    // 测试配置
    const TOKEN_CONFIG = {
        name: "Test Token",
        symbol: "TEST",
        totalSupply: "1000000", // 1M tokens
        buyFee: 2,  // 2%
        sellFee: 5, // 5%
    };
    
    const ADVANCED_CONFIG = {
        feeRecipient: ethers.ZeroAddress, // 使用默认值
        maxTxPercent: 10,     // 10%
        maxWalletPercent: 20, // 20%
        swapThreshold: 0      // 使用默认值
    };

    beforeEach(async function () {
        // 获取测试账户
        [owner, user1, user2, feeRecipient] = await ethers.getSigners();
        
        // 部署工厂合约
        const StagedTokenFactory = await ethers.getContractFactory("StagedTokenFactory");
        factory = await StagedTokenFactory.deploy();
        await factory.waitForDeployment();
    });

    describe("工厂合约部署", function () {
        it("应该正确初始化工厂合约", async function () {
            expect(await factory.factoryEnabled()).to.be.true;
            expect(await factory.totalTokensCreated()).to.equal(0);
            expect(await factory.owner()).to.equal(owner.address);
            
            const creationFee = await factory.creationFee();
            expect(creationFee).to.equal(ethers.parseEther("0.03"));
        });

        it("应该正确配置BSC测试网参数", async function () {
            const networkConfig = await factory.networkConfigs(97);
            expect(networkConfig.enabled).to.be.true;
            expect(networkConfig.router).to.not.equal(ethers.ZeroAddress);
            expect(networkConfig.wbnb).to.not.equal(ethers.ZeroAddress);
            expect(networkConfig.usdt).to.not.equal(ethers.ZeroAddress);
        });
    });

    describe("代币创建（阶段1）", function () {
        it("应该成功创建基础代币", async function () {
            const creationFee = await factory.creationFee();
            
            const tx = await factory.createToken(
                TOKEN_CONFIG.name,
                TOKEN_CONFIG.symbol,
                TOKEN_CONFIG.totalSupply,
                TOKEN_CONFIG.buyFee,
                TOKEN_CONFIG.sellFee,
                { value: creationFee }
            );
            
            const receipt = await tx.wait();
            
            // 检查事件
            const tokenCreatedEvent = receipt.logs.find(log => {
                try {
                    const parsed = factory.interface.parseLog(log);
                    return parsed.name === 'TokenCreated';
                } catch {
                    return false;
                }
            });
            
            expect(tokenCreatedEvent).to.not.be.undefined;
            
            const parsed = factory.interface.parseLog(tokenCreatedEvent);
            const tokenAddress = parsed.args.token;
            
            // 获取代币合约实例
            const StagedCustomToken = await ethers.getContractFactory("StagedCustomToken");
            token = StagedCustomToken.attach(tokenAddress);
            
            // 验证代币属性
            expect(await token.name()).to.equal(TOKEN_CONFIG.name);
            expect(await token.symbol()).to.equal(TOKEN_CONFIG.symbol);
            expect(await token.owner()).to.equal(owner.address);
            expect(await token.currentStage()).to.equal(0); // BASIC stage
            expect(await token.tradingEnabled()).to.be.false;
        });

        it("应该正确设置费用参数", async function () {
            const creationFee = await factory.creationFee();
            
            const tx = await factory.createToken(
                TOKEN_CONFIG.name,
                TOKEN_CONFIG.symbol,
                TOKEN_CONFIG.totalSupply,
                TOKEN_CONFIG.buyFee,
                TOKEN_CONFIG.sellFee,
                { value: creationFee }
            );
            
            const receipt = await tx.wait();
            const parsed = factory.interface.parseLog(receipt.logs[0]);
            const tokenAddress = parsed.args.token;
            
            const StagedCustomToken = await ethers.getContractFactory("StagedCustomToken");
            token = StagedCustomToken.attach(tokenAddress);
            
            expect(await token.feeBuy()).to.equal(TOKEN_CONFIG.buyFee);
            expect(await token.feeSell()).to.equal(TOKEN_CONFIG.sellFee);
        });

        it("应该拒绝过高的费用", async function () {
            const creationFee = await factory.creationFee();
            
            await expect(
                factory.createToken(
                    TOKEN_CONFIG.name,
                    TOKEN_CONFIG.symbol,
                    TOKEN_CONFIG.totalSupply,
                    11, // 超过10%限制
                    TOKEN_CONFIG.sellFee,
                    { value: creationFee }
                )
            ).to.be.revertedWith("Fee too high");
        });

        it("应该拒绝不足的创建费用", async function () {
            const creationFee = await factory.creationFee();
            const insufficientFee = creationFee - ethers.parseEther("0.001");
            
            await expect(
                factory.createToken(
                    TOKEN_CONFIG.name,
                    TOKEN_CONFIG.symbol,
                    TOKEN_CONFIG.totalSupply,
                    TOKEN_CONFIG.buyFee,
                    TOKEN_CONFIG.sellFee,
                    { value: insufficientFee }
                )
            ).to.be.revertedWith("Insufficient fee");
        });
    });

    describe("高级配置代币创建", function () {
        it("应该成功创建带高级配置的代币", async function () {
            const creationFee = await factory.creationFee();
            const advancedFee = creationFee * BigInt(120) / BigInt(100); // 20%额外费用
            
            // 设置自定义费用接收地址
            const customConfig = {
                ...ADVANCED_CONFIG,
                feeRecipient: feeRecipient.address
            };
            
            const tx = await factory.createAdvancedToken(
                TOKEN_CONFIG.name,
                TOKEN_CONFIG.symbol,
                TOKEN_CONFIG.totalSupply,
                TOKEN_CONFIG.buyFee,
                TOKEN_CONFIG.sellFee,
                customConfig,
                { value: advancedFee }
            );
            
            const receipt = await tx.wait();
            const parsed = factory.interface.parseLog(receipt.logs[0]);
            const tokenAddress = parsed.args.token;
            
            const StagedCustomToken = await ethers.getContractFactory("StagedCustomToken");
            token = StagedCustomToken.attach(tokenAddress);
            
            // 验证高级配置
            const advancedConfig = await token.getAdvancedConfig();
            expect(advancedConfig[0]).to.equal(feeRecipient.address); // feeRecipient
            
            // 验证交易限制
            const totalSupply = await token.totalSupply();
            const expectedMaxTx = totalSupply * BigInt(ADVANCED_CONFIG.maxTxPercent) / BigInt(100);
            const expectedMaxWallet = totalSupply * BigInt(ADVANCED_CONFIG.maxWalletPercent) / BigInt(100);
            
            expect(advancedConfig[1]).to.equal(expectedMaxTx); // maxTxAmount
            expect(advancedConfig[2]).to.equal(expectedMaxWallet); // maxWalletAmount
        });

        it("应该拒绝高级功能的不足费用", async function () {
            const creationFee = await factory.creationFee();
            
            await expect(
                factory.createAdvancedToken(
                    TOKEN_CONFIG.name,
                    TOKEN_CONFIG.symbol,
                    TOKEN_CONFIG.totalSupply,
                    TOKEN_CONFIG.buyFee,
                    TOKEN_CONFIG.sellFee,
                    ADVANCED_CONFIG,
                    { value: creationFee } // 应该需要120%的费用
                )
            ).to.be.revertedWith("Insufficient fee for advanced features");
        });
    });

    describe("DEX初始化（阶段2）", function () {
        beforeEach(async function () {
            // 创建基础代币
            const creationFee = await factory.creationFee();
            const tx = await factory.createToken(
                TOKEN_CONFIG.name,
                TOKEN_CONFIG.symbol,
                TOKEN_CONFIG.totalSupply,
                TOKEN_CONFIG.buyFee,
                TOKEN_CONFIG.sellFee,
                { value: creationFee }
            );
            
            const receipt = await tx.wait();
            const parsed = factory.interface.parseLog(receipt.logs[0]);
            const tokenAddress = parsed.args.token;
            
            const StagedCustomToken = await ethers.getContractFactory("StagedCustomToken");
            token = StagedCustomToken.attach(tokenAddress);
        });

        it("应该成功初始化DEX配置", async function () {
            await factory.initializeTokenDEX(await token.getAddress());
            
            expect(await token.currentStage()).to.equal(1); // DEX_READY stage
        });

        it("应该拒绝非创建者的DEX初始化", async function () {
            await expect(
                factory.connect(user1).initializeTokenDEX(await token.getAddress())
            ).to.be.revertedWith("Not token creator");
        });

        it("应该拒绝错误阶段的DEX初始化", async function () {
            // 先初始化一次
            await factory.initializeTokenDEX(await token.getAddress());
            
            // 再次尝试初始化应该失败
            await expect(
                factory.initializeTokenDEX(await token.getAddress())
            ).to.be.revertedWith("Wrong stage");
        });
    });

    describe("交易激活（阶段3）", function () {
        beforeEach(async function () {
            // 创建代币并初始化DEX
            const creationFee = await factory.creationFee();
            const tx = await factory.createToken(
                TOKEN_CONFIG.name,
                TOKEN_CONFIG.symbol,
                TOKEN_CONFIG.totalSupply,
                TOKEN_CONFIG.buyFee,
                TOKEN_CONFIG.sellFee,
                { value: creationFee }
            );
            
            const receipt = await tx.wait();
            const parsed = factory.interface.parseLog(receipt.logs[0]);
            const tokenAddress = parsed.args.token;
            
            const StagedCustomToken = await ethers.getContractFactory("StagedCustomToken");
            token = StagedCustomToken.attach(tokenAddress);
            
            await factory.initializeTokenDEX(tokenAddress);
        });

        it("应该成功激活代币交易", async function () {
            await factory.activateTokenTrading(await token.getAddress());
            
            expect(await token.currentStage()).to.equal(2); // FULLY_ACTIVE stage
            expect(await token.tradingEnabled()).to.be.true;
        });

        it("应该拒绝非创建者的交易激活", async function () {
            await expect(
                factory.connect(user1).activateTokenTrading(await token.getAddress())
            ).to.be.revertedWith("Not token creator");
        });
    });

    describe("一键部署功能", function () {
        it("应该成功执行一键创建和激活", async function () {
            const creationFee = await factory.creationFee();
            
            const tx = await factory.createAndActivateToken(
                TOKEN_CONFIG.name,
                TOKEN_CONFIG.symbol,
                TOKEN_CONFIG.totalSupply,
                TOKEN_CONFIG.buyFee,
                TOKEN_CONFIG.sellFee,
                { value: creationFee }
            );
            
            const receipt = await tx.wait();
            const parsed = factory.interface.parseLog(receipt.logs[0]);
            const tokenAddress = parsed.args.token;
            
            const StagedCustomToken = await ethers.getContractFactory("StagedCustomToken");
            token = StagedCustomToken.attach(tokenAddress);
            
            // 验证代币已完全激活
            expect(await token.currentStage()).to.equal(2); // FULLY_ACTIVE
            expect(await token.tradingEnabled()).to.be.true;
            
            // 验证阶段信息
            const stageInfo = await token.getStageInfo();
            expect(stageInfo[0]).to.equal(2); // stage
            expect(stageInfo[1]).to.be.true;  // dexReady
            expect(stageInfo[2]).to.be.true;  // tradingActive
        });
    });
});
