# StagedCustomToken 故障排除指南

## 概述

本文档提供了StagedCustomToken合约部署和测试过程中可能遇到的问题及其解决方案。

## 常见问题与解决方案

### 1. 合约编译问题

#### 问题：编译失败，找不到OpenZeppelin合约
```
Error: Cannot find module '@openzeppelin/contracts/...'
```

**解决方案：**
```bash
# 确保安装了OpenZeppelin合约库
npm install @openzeppelin/contracts@^4.9.6

# 检查remappings.txt文件是否正确配置
echo "@openzeppelin/contracts/=node_modules/@openzeppelin/contracts/" > remappings.txt
```

#### 问题：Solidity版本不兼容
```
Error: Source file requires different compiler version
```

**解决方案：**
- 检查hardhat.config.js中的Solidity版本设置
- 确保使用0.8.20版本：
```javascript
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
```

### 2. 部署环境问题

#### 问题：网络连接失败
```
Error: could not detect network
```

**解决方案：**
1. 检查网络配置：
```javascript
networks: {
  bscTestnet: {
    url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    accounts: [process.env.PRIVATE_KEY],
    chainId: 97
  }
}
```

2. 验证私钥格式：
```bash
# 私钥应该是64位十六进制字符串（不包含0x前缀）
# 或者66位字符串（包含0x前缀）
```

#### 问题：账户余额不足
```
Error: insufficient funds for gas * price + value
```

**解决方案：**
1. 获取测试BNB：
   - 访问 https://testnet.binance.org/faucet-smart
   - 输入您的钱包地址获取测试BNB

2. 检查当前余额：
```bash
node -e "
const { ethers } = require('hardhat');
async function checkBalance() {
  const [signer] = await ethers.getSigners();
  const balance = await signer.provider.getBalance(signer.address);
  console.log('余额:', ethers.formatEther(balance), 'BNB');
}
checkBalance();
"
```

### 3. 合约部署问题

#### 问题：Gas估算失败
```
Error: cannot estimate gas; transaction may fail
```

**解决方案：**
1. 增加Gas限制：
```javascript
const tx = await contract.deploy({
  gasLimit: 5000000 // 增加Gas限制
});
```

2. 检查合约构造函数参数：
```javascript
// 确保所有参数类型正确
const token = await factory.createToken(
  "Token Name",        // string
  "SYMBOL",           // string
  "1000000",          // uint256 (作为字符串)
  1,                  // uint256 (买入费用)
  4                   // uint256 (卖出费用)
);
```

#### 问题：交易被回滚
```
Error: transaction was reverted
```

**解决方案：**
1. 检查require条件：
```solidity
// 常见的回滚原因：
require(_feeBuy <= 10, "Buy fee too high");
require(_feeSell <= 10, "Sell fee too high");
require(msg.value >= creationFee, "Insufficient fee");
```

2. 使用try-catch捕获具体错误：
```javascript
try {
  const tx = await contract.someFunction();
  await tx.wait();
} catch (error) {
  console.log("错误原因:", error.reason);
  console.log("错误代码:", error.code);
}
```

### 4. 代币功能问题

#### 问题：代币转账失败
```
Error: Transfer amount exceeds max tx
```

**解决方案：**
1. 检查交易限制设置：
```javascript
const advancedConfig = await token.getAdvancedConfig();
console.log("最大交易限制:", ethers.formatEther(advancedConfig[1]));
console.log("最大钱包限制:", ethers.formatEther(advancedConfig[2]));
```

2. 调整限制或使用豁免账户：
```javascript
// 设置费用豁免
await token.setExcludeFee(userAddress, true);

// 或者调整交易限制
await token.updateTradingLimits(50, 100); // 50%交易限制，100%钱包限制
```

#### 问题：阶段状态错误
```
Error: Wrong stage
```

**解决方案：**
1. 检查当前阶段：
```javascript
const stageInfo = await token.getStageInfo();
console.log("当前阶段:", stageInfo[0]);
console.log("DEX就绪:", stageInfo[1]);
console.log("交易激活:", stageInfo[2]);
```

2. 按正确顺序执行阶段：
```javascript
// 阶段1：创建代币（自动完成）
// 阶段2：初始化DEX
await factory.initializeTokenDEX(tokenAddress);
// 阶段3：激活交易
await factory.activateTokenTrading(tokenAddress);
```

### 5. 测试问题

#### 问题：测试超时
```
Error: timeout of 20000ms exceeded
```

**解决方案：**
1. 增加测试超时时间：
```javascript
describe("StagedCustomToken", function () {
  this.timeout(60000); // 60秒超时
  
  it("should deploy successfully", async function () {
    this.timeout(30000); // 单个测试30秒超时
    // 测试代码...
  });
});
```

2. 使用更快的网络或本地测试网：
```javascript
// 使用Hardhat本地网络进行快速测试
npx hardhat test --network localhost
```

#### 问题：事件解析失败
```
Error: cannot find event in logs
```

**解决方案：**
1. 正确解析事件：
```javascript
const receipt = await tx.wait();
const tokenCreatedEvent = receipt.logs.find(log => {
  try {
    const parsed = factory.interface.parseLog(log);
    return parsed.name === 'TokenCreated';
  } catch {
    return false;
  }
});

if (tokenCreatedEvent) {
  const parsed = factory.interface.parseLog(tokenCreatedEvent);
  const tokenAddress = parsed.args.token;
}
```

### 6. 性能优化

#### Gas优化建议

1. **批量操作**：
```javascript
// 批量设置费用豁免
await token.setExcludeFeeBatch([addr1, addr2, addr3], true);
```

2. **合理的Gas价格**：
```javascript
const gasPrice = await provider.getGasPrice();
const tx = await contract.someFunction({
  gasPrice: gasPrice * 110n / 100n // 增加10%确保快速确认
});
```

3. **预估Gas使用**：
```javascript
const gasEstimate = await contract.someFunction.estimateGas(...args);
const tx = await contract.someFunction(...args, {
  gasLimit: gasEstimate * 120n / 100n // 增加20%缓冲
});
```

## 调试工具

### 1. 合约状态查询脚本
```javascript
// scripts/debug-token-state.js
async function debugTokenState(tokenAddress) {
  const token = await ethers.getContractAt("StagedCustomToken", tokenAddress);
  
  console.log("=== 代币状态调试 ===");
  console.log("名称:", await token.name());
  console.log("符号:", await token.symbol());
  console.log("总供应量:", ethers.formatEther(await token.totalSupply()));
  console.log("当前阶段:", await token.currentStage());
  console.log("交易状态:", await token.tradingEnabled());
  
  const stageInfo = await token.getStageInfo();
  console.log("阶段信息:", stageInfo);
  
  const advancedConfig = await token.getAdvancedConfig();
  console.log("高级配置:", advancedConfig);
}
```

### 2. 网络连接测试
```javascript
// scripts/test-network.js
async function testNetwork() {
  const [signer] = await ethers.getSigners();
  const network = await signer.provider.getNetwork();
  const balance = await signer.provider.getBalance(signer.address);
  
  console.log("网络:", network.name, "Chain ID:", network.chainId);
  console.log("账户:", signer.address);
  console.log("余额:", ethers.formatEther(balance), "BNB");
  
  // 测试交易
  const gasPrice = await signer.provider.getGasPrice();
  console.log("Gas价格:", ethers.formatUnits(gasPrice, "gwei"), "Gwei");
}
```

## 联系支持

如果遇到本文档未涵盖的问题，请：

1. 检查合约事件日志获取详细错误信息
2. 在BSCScan上查看交易详情
3. 使用Hardhat的console.log进行调试
4. 参考OpenZeppelin和Hardhat官方文档

## 相关资源

- [Hardhat文档](https://hardhat.org/docs)
- [OpenZeppelin文档](https://docs.openzeppelin.com/)
- [BSC测试网水龙头](https://testnet.binance.org/faucet-smart)
- [BSCScan测试网](https://testnet.bscscan.com/)
