# StagedCustomToken 完整部署指南

## 概述

本指南将引导您完成StagedCustomToken合约在BSC测试网上的完整部署和测试流程。

## 前置要求

### 1. 环境准备

**Node.js 和 npm**
```bash
# 检查版本
node --version  # 建议 v16+
npm --version   # 建议 v8+
```

**项目依赖**
```bash
# 安装项目依赖
npm install

# 验证关键依赖
npm list hardhat ethers @openzeppelin/contracts
```

### 2. 网络配置

**BSC测试网配置**
- 网络名称: BSC Testnet
- RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
- Chain ID: 97
- 符号: BNB
- 区块浏览器: https://testnet.bscscan.com

**MetaMask配置**
1. 打开MetaMask
2. 点击网络下拉菜单
3. 选择"添加网络"
4. 输入上述BSC测试网信息

### 3. 账户准备

**获取测试BNB**
1. 访问 https://testnet.binance.org/faucet-smart
2. 输入您的钱包地址
3. 完成验证获取测试BNB
4. 建议至少获取0.1 BNB用于部署和测试

**私钥配置**
```bash
# 复制.env.example到.env
cp .env.example .env

# 编辑.env文件，添加您的私钥
BSC_TESTNET_DEPLOYER_KEY=your_private_key_here
```

⚠️ **安全提醒**: 永远不要在主网使用测试私钥，不要将私钥提交到版本控制系统。

## 部署流程

### 步骤1: 环境验证

```bash
# 运行环境检查脚本
node scripts/test-connection.js
```

预期输出：
```
✅ 网络连接成功
✅ 账户配置正确
✅ 余额充足
✅ 合约编译通过
```

### 步骤2: 编译合约

```bash
# 编译所有合约
npx hardhat compile

# 或使用项目脚本
npm run compile:contracts
```

验证编译结果：
```bash
# 检查编译输出
ls -la artifacts/contracts/Acon/
# 应该看到 StagedTokenFactory.sol/ 目录
```

### 步骤3: 部署合约

**方式1: 使用完整部署脚本（推荐）**
```bash
node scripts/deploy-and-verify-staged-token.js
```

**方式2: 使用Hardhat部署**
```bash
npx hardhat run scripts/deploy-staged-factory.js --network bscTestnet
```

**方式3: 分步部署**
```bash
# 1. 部署工厂合约
node scripts/deploy-factory.js

# 2. 创建测试代币
node scripts/create-token.js --name "Test Token" --symbol "TEST"
```

### 步骤4: 验证部署

部署成功后，您应该看到类似输出：
```
🎉 部署和验证完成!
⏱️  总耗时: 45.2 秒
🌐 网络: BSC Testnet (Chain ID: 97)
👤 部署账户: 0x1234...5678
🏭 工厂合约: 0xabcd...ef01
🪙 测试代币: 0x9876...5432
📄 部署信息: deployments/staged-token-deployment-2024-01-15.json
💻 前端代码: frontend/staged-token-integration.js
🌐 工厂BSCScan: https://testnet.bscscan.com/address/0xabcd...ef01
```

## 功能测试

### 基础功能测试

```bash
# 运行综合测试套件
node scripts/comprehensive-token-test.js
```

### 单元测试

```bash
# 运行Hardhat测试
npx hardhat test

# 运行特定测试文件
npx hardhat test test/StagedCustomToken.test.js
```

### 手动功能验证

**1. 验证工厂合约**
```javascript
// 在Hardhat控制台中执行
npx hardhat console --network bscTestnet

const factory = await ethers.getContractAt("StagedTokenFactory", "0xYourFactoryAddress");
console.log("创建费用:", ethers.formatEther(await factory.creationFee()));
console.log("已创建代币数:", await factory.totalTokensCreated());
```

**2. 验证代币合约**
```javascript
const token = await ethers.getContractAt("StagedCustomToken", "0xYourTokenAddress");
console.log("代币名称:", await token.name());
console.log("当前阶段:", await token.currentStage());
console.log("交易状态:", await token.tradingEnabled());
```

## 三阶段部署详解

### 阶段1: 基础代币创建

**功能**: 创建ERC20代币，设置基础参数
**状态**: BASIC (0)
**操作**:
```javascript
const tx = await factory.createToken(
  "Token Name",    // 代币名称
  "SYMBOL",        // 代币符号
  "1000000",       // 总供应量
  2,               // 买入费用 (2%)
  5,               // 卖出费用 (5%)
  { value: creationFee }
);
```

**验证**:
- 代币合约已创建
- 所有代币分配给创建者
- 费用豁免已设置
- 阶段状态为BASIC

### 阶段2: DEX配置初始化

**功能**: 配置DEX参数，准备创建交易对
**状态**: DEX_READY (1)
**操作**:
```javascript
await factory.initializeTokenDEX(tokenAddress);
```

**验证**:
- Router、WBNB、USDT地址已配置
- 阶段状态为DEX_READY
- 交易仍未启用

### 阶段3: 交易激活

**功能**: 创建交易对，启用交易
**状态**: FULLY_ACTIVE (2)
**操作**:
```javascript
await factory.activateTokenTrading(tokenAddress);
```

**验证**:
- BNB和USDT交易对已创建
- 交易已启用
- 费用机制激活
- 阶段状态为FULLY_ACTIVE

## 高级配置

### 自定义高级参数

```javascript
const advancedConfig = {
  feeRecipient: "0x1234...5678",  // 自定义费用接收地址
  maxTxPercent: 5,                // 5% 最大交易限制
  maxWalletPercent: 10,           // 10% 最大钱包限制
  swapThreshold: ethers.parseEther("1000") // 自定义swap阈值
};

const tx = await factory.createAdvancedToken(
  name, symbol, totalSupply, buyFee, sellFee,
  advancedConfig,
  { value: advancedCreationFee } // 需要额外20%费用
);
```

### 一键部署模式

```javascript
// 一次性完成所有三个阶段
const tx = await factory.createAndActivateToken(
  name, symbol, totalSupply, buyFee, sellFee,
  { value: creationFee }
);
```

## 前端集成

### Web3连接

```javascript
import { ethers } from 'ethers';
import { CONTRACT_CONFIG, FACTORY_ABI } from './staged-token-integration.js';

// 初始化Web3
const provider = await initWeb3();
const factory = await getFactoryContract(provider);

// 创建代币
const tokenConfig = {
  name: 'My Token',
  symbol: 'MTK',
  totalSupply: '1000000',
  buyFee: 1,
  sellFee: 4
};

const receipt = await createToken(provider, tokenConfig);
console.log('代币创建成功:', receipt);
```

### React集成示例

```jsx
import React, { useState } from 'react';
import { ethers } from 'ethers';

function TokenCreator() {
  const [tokenConfig, setTokenConfig] = useState({
    name: '',
    symbol: '',
    totalSupply: '1000000',
    buyFee: 1,
    sellFee: 4
  });

  const createToken = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const factory = new ethers.Contract(
        CONTRACT_CONFIG.FACTORY_ADDRESS,
        FACTORY_ABI,
        await provider.getSigner()
      );
      
      const creationFee = await factory.creationFee();
      const tx = await factory.createToken(
        tokenConfig.name,
        tokenConfig.symbol,
        tokenConfig.totalSupply,
        tokenConfig.buyFee,
        tokenConfig.sellFee,
        { value: creationFee }
      );
      
      const receipt = await tx.wait();
      console.log('代币创建成功!', receipt);
    } catch (error) {
      console.error('创建失败:', error);
    }
  };

  return (
    <div>
      <h2>创建代币</h2>
      <input 
        placeholder="代币名称"
        value={tokenConfig.name}
        onChange={(e) => setTokenConfig({...tokenConfig, name: e.target.value})}
      />
      <input 
        placeholder="代币符号"
        value={tokenConfig.symbol}
        onChange={(e) => setTokenConfig({...tokenConfig, symbol: e.target.value})}
      />
      <button onClick={createToken}>创建代币</button>
    </div>
  );
}
```

## 监控和维护

### 合约事件监听

```javascript
// 监听代币创建事件
factory.on("TokenCreated", (token, creator, name, symbol, totalSupply, timestamp) => {
  console.log(`新代币创建: ${name} (${symbol}) at ${token}`);
});

// 监听DEX初始化事件
factory.on("TokenDEXInitialized", (token, creator) => {
  console.log(`DEX初始化完成: ${token}`);
});
```

### 状态查询脚本

```bash
# 查看工厂状态
node -e "
const { ethers } = require('hardhat');
async function checkFactory() {
  const factory = await ethers.getContractAt('StagedTokenFactory', '0xYourAddress');
  console.log('总代币数:', await factory.totalTokensCreated());
  console.log('创建费用:', ethers.formatEther(await factory.creationFee()));
}
checkFactory();
"
```

## 安全考虑

### 权限管理
- 只有代币创建者可以初始化DEX和激活交易
- 工厂合约所有者可以管理网络配置和费用
- 代币合约所有者可以管理费用豁免和参数

### 费用限制
- 买入和卖出费用最大10%
- 创建费用防止垃圾代币
- 高级功能需要额外费用

### 升级策略
- 合约不可升级，确保去中心化
- 新功能通过部署新版本实现
- 向后兼容现有代币

## 故障排除

如遇到问题，请参考：
- [故障排除指南](./TROUBLESHOOTING_STAGED_TOKEN.md)
- 检查BSCScan上的交易详情
- 使用Hardhat控制台调试
- 查看合约事件日志

## 下一步

部署成功后，您可以：
1. 在BSCScan上验证合约源码
2. 集成到您的DApp前端
3. 添加流动性到PancakeSwap
4. 实施代币经济模型
5. 进行安全审计

## 支持资源

- [项目GitHub](https://github.com/your-repo)
- [技术文档](./README.md)
- [API参考](./API_REFERENCE.md)
- [社区论坛](https://your-forum.com)
