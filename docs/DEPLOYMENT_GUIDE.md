# 智能合约部署和测试指南

本指南将帮助您使用JavaScript脚本部署和测试StagedTokenFactory智能合约到BSC测试网。

## 📋 目录

- [环境准备](#环境准备)
- [快速开始](#快速开始)
- [脚本说明](#脚本说明)
- [配置参数](#配置参数)
- [使用示例](#使用示例)
- [前端集成](#前端集成)
- [常见问题](#常见问题)

## 🛠️ 环境准备

### 1. 安装依赖

确保您已经安装了Node.js (v14+)，然后安装项目依赖：

```bash
npm install
```

### 2. 配置环境变量

在项目根目录的`.env`文件中配置以下参数：

```env
# BSC测试网部署私钥
BSC_TESTNET_DEPLOYER_KEY=your_private_key_here

# 或者使用通用私钥配置
PRIVATE_KEY=your_private_key_here

# BSCScan API密钥（可选，用于合约验证）
BSCSCAN_API_KEY=your_bscscan_api_key

# 代币配置（可选）
TOKEN_NAME=FEG Token
TOKEN_SYMBOL=FEG
TOKEN_SUPPLY=1000000
```

### 3. 获取测试BNB

访问 [BSC测试网水龙头](https://testnet.binance.org/faucet-smart) 获取测试BNB用于Gas费用。

## 🚀 快速开始

### 方式一：一键部署和测试

```bash
# 部署工厂合约并创建测试代币
node scripts/deploy-and-test.js
```

### 方式二：分步操作

```bash
# 1. 编译合约（如果需要）
node scripts/compile-contract.js

# 2. 部署工厂合约
node scripts/deploy-staged-token-factory.js

# 3. 创建代币
node scripts/create-token.js --name "My Token" --symbol "MTK"
```

## 📜 脚本说明

### 1. `deploy-and-test.js` - 一体化部署脚本

**功能：**
- 部署StagedTokenFactory合约到BSC测试网
- 创建测试代币
- 保存部署信息
- 生成前端集成代码

**使用方法：**
```bash
node scripts/deploy-and-test.js
```

**环境变量：**
- `SKIP_TOKEN_CREATION=true` - 跳过代币创建
- `TOKEN_NAME="Custom Name"` - 自定义代币名称
- `TOKEN_SYMBOL="CUSTOM"` - 自定义代币符号

### 2. `create-token.js` - 代币创建脚本

**功能：**
- 连接已部署的工厂合约
- 创建自定义代币
- 支持分步或一键部署模式

**使用方法：**
```bash
# 基础用法
node scripts/create-token.js

# 自定义参数
node scripts/create-token.js --name "My Token" --symbol "MTK" --supply 1000000

# 一键部署模式
node scripts/create-token.js --name "Quick Token" --symbol "QTK" --one-click

# 指定工厂合约地址
node scripts/create-token.js --factory-address 0x1234...
```

**参数说明：**
- `--name "Token Name"` - 代币名称
- `--symbol "TKN"` - 代币符号
- `--supply 1000000` - 总供应量
- `--buy-fee 1` - 买入费用百分比
- `--sell-fee 4` - 卖出费用百分比
- `--factory-address 0x...` - 工厂合约地址
- `--one-click` - 使用一键部署模式
- `--step-by-step` - 使用分步部署模式（默认）

### 3. `compile-contract.js` - 合约编译脚本

**功能：**
- 编译StagedTokenFactory.sol合约
- 提取ABI和字节码
- 生成部署配置文件

**使用方法：**
```bash
node scripts/compile-contract.js
```

## ⚙️ 配置参数

### 网络配置

```javascript
const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const BSC_TESTNET_CHAIN_ID = 97;
```

### 代币配置

```javascript
const TOKEN_CONFIG = {
    name: 'FEG Token',        // 代币名称
    symbol: 'FEG',            // 代币符号
    totalSupply: '1000000',   // 总供应量
    buyFee: 1,                // 买入费用 (1%)
    sellFee: 4                // 卖出费用 (4%)
};
```

## 💡 使用示例

### 示例1：部署基础代币

```bash
node scripts/create-token.js \
  --name "Test Token" \
  --symbol "TEST" \
  --supply 1000000 \
  --buy-fee 1 \
  --sell-fee 3
```

### 示例2：一键部署高级代币

```bash
node scripts/create-token.js \
  --name "Advanced Token" \
  --symbol "ADV" \
  --supply 5000000 \
  --buy-fee 2 \
  --sell-fee 5 \
  --one-click
```

### 示例3：批量创建代币

```bash
# 创建多个代币
for i in {1..3}; do
  node scripts/create-token.js \
    --name "Batch Token $i" \
    --symbol "BATCH$i" \
    --supply 1000000
done
```

## 🌐 前端集成

部署完成后，脚本会自动生成`frontend-integration.js`文件，包含前端集成所需的配置和函数。

### 基础用法

```javascript
import { initWeb3, createToken, CONFIG } from './frontend-integration.js';

// 初始化Web3连接
const web3 = await initWeb3();

// 创建代币
const receipt = await createToken(web3, {
    name: 'My Token',
    symbol: 'MTK',
    totalSupply: '1000000'
});

console.log('代币创建成功:', receipt);
```

### Vue.js集成示例

```javascript
// 在Vue组件中使用
export default {
    data() {
        return {
            web3: null,
            account: null,
            factoryContract: null
        }
    },
    async mounted() {
        await this.initBlockchain();
    },
    methods: {
        async initBlockchain() {
            try {
                this.web3 = await initWeb3();
                const accounts = await this.web3.eth.getAccounts();
                this.account = accounts[0];
                this.factoryContract = await getFactoryContract(this.web3);
            } catch (error) {
                console.error('区块链初始化失败:', error);
            }
        },
        async createToken(tokenConfig) {
            try {
                const receipt = await createToken(this.web3, tokenConfig);
                this.$toast.success('代币创建成功!');
                return receipt;
            } catch (error) {
                this.$toast.error('代币创建失败: ' + error.message);
                throw error;
            }
        }
    }
}
```

## 📁 输出文件

### 部署信息文件

位置：`deployments/deployment-info-{timestamp}.json`

```json
{
    "timestamp": "2024-01-01T00:00:00.000Z",
    "network": {
        "name": "BSC Testnet",
        "chainId": 97,
        "rpcUrl": "https://data-seed-prebsc-1-s1.binance.org:8545/"
    },
    "contracts": {
        "StagedTokenFactory": {
            "address": "0x1234...",
            "abi": [...]
        }
    },
    "tokens": [
        {
            "name": "FEG Token",
            "symbol": "FEG",
            "address": "0x5678...",
            "transactionHash": "0xabcd...",
            "explorer": "https://testnet.bscscan.com/token/0x5678..."
        }
    ]
}
```

### 代币信息文件

位置：`tokens/token-{symbol}-{timestamp}.json`

```json
{
    "timestamp": "2024-01-01T00:00:00.000Z",
    "config": {
        "name": "FEG Token",
        "symbol": "FEG",
        "totalSupply": "1000000",
        "buyFee": 1,
        "sellFee": 4
    },
    "tokenInfo": {
        "address": "0x1234...",
        "name": "FEG Token",
        "symbol": "FEG",
        "totalSupply": "1000000",
        "decimals": 18,
        "creatorBalance": "1000000",
        "stage": {
            "current": 2,
            "dexReady": true,
            "tradingActive": true,
            "bnbPair": "0x5678...",
            "usdtPair": "0x9abc..."
        }
    },
    "transactions": {
        "creation": "0xdef0...",
        "dexInit": "0x1234...",
        "activation": "0x5678..."
    },
    "network": {
        "name": "BSC Testnet",
        "chainId": 97,
        "explorer": "https://testnet.bscscan.com/token/0x1234..."
    }
}
```

## ❓ 常见问题

### Q1: 部署失败，提示"insufficient funds"

**解决方案：**
1. 确保账户有足够的BNB用于Gas费用（建议至少0.01 BNB）
2. 访问BSC测试网水龙头获取测试BNB
3. 检查网络连接是否正常

### Q2: 合约验证失败

**解决方案：**
1. 确保BSCScan API密钥配置正确
2. 等待几分钟后重试验证
3. 手动在BSCScan上验证合约

### Q3: 前端无法连接合约

**解决方案：**
1. 确保MetaMask已连接到BSC测试网
2. 检查合约地址是否正确
3. 确认网络ID匹配（97）

### Q4: 代币创建成功但无法交易

**解决方案：**
1. 检查代币是否已完成所有初始化阶段
2. 确认DEX配置是否正确
3. 验证交易对是否已创建

### Q5: Gas费用过高

**解决方案：**
1. 等待网络拥堵缓解
2. 调整Gas价格设置
3. 使用分步部署模式减少单次交易复杂度

## 📞 技术支持

如果遇到问题，请：

1. 检查控制台日志输出
2. 查看生成的配置文件
3. 在BSCScan上验证交易状态
4. 参考本文档的常见问题部分

## 🔗 相关链接

- [BSC测试网水龙头](https://testnet.binance.org/faucet-smart)
- [BSC测试网浏览器](https://testnet.bscscan.com)
- [MetaMask配置指南](https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain)
