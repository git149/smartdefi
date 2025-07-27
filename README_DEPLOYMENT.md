# StagedTokenFactory 智能合约部署系统

一个完整的JavaScript脚本系统，用于部署和测试StagedTokenFactory智能合约到BSC测试网。

## ✨ 功能特性

- 🚀 **一键部署** - 自动部署工厂合约并创建测试代币
- 🪙 **代币创建** - 支持自定义ERC20代币创建
- 📊 **分阶段初始化** - 基础 → DEX就绪 → 完全激活
- 🌐 **前端集成** - 自动生成前端集成代码
- 📝 **完整日志** - 详细的部署日志和错误处理
- 💾 **信息保存** - JSON格式保存所有部署信息
- 🔧 **灵活配置** - 支持环境变量和命令行参数

## 🚀 快速开始

### 1. 环境准备

```bash
# 安装依赖
npm install

# 配置环境变量（在.env文件中）
BSC_TESTNET_DEPLOYER_KEY=your_private_key_here
```

### 2. 获取测试BNB

访问 [BSC测试网水龙头](https://testnet.binance.org/faucet-smart) 获取测试BNB。

### 3. 查看项目状态

```bash
npm run summary
```

### 4. 一键部署

```bash
npm run deploy
```

## 📜 可用脚本

| 脚本 | 功能 | 使用方法 |
|------|------|----------|
| `npm run summary` | 查看项目状态和配置 | `npm run summary` |
| `npm run deploy` | 一键部署工厂合约和测试代币 | `npm run deploy` |
| `npm run create:token` | 创建自定义代币 | `npm run create:token -- --name "My Token"` |
| `npm run compile:contracts` | 编译智能合约 | `npm run compile:contracts` |
| `npm run help:deploy` | 显示帮助信息 | `npm run help:deploy` |

## 🛠️ 高级用法

### 创建自定义代币

```bash
# 基础代币
npm run create:token -- --name "My Token" --symbol "MTK" --supply 1000000

# 一键部署模式
npm run create:token -- --name "Quick Token" --symbol "QTK" --one-click

# 自定义费用
npm run create:token -- --name "Custom Token" --symbol "CTK" --buy-fee 2 --sell-fee 5
```

### 环境变量配置

```env
# 必需配置
BSC_TESTNET_DEPLOYER_KEY=your_private_key_here

# 可选配置
BSCSCAN_API_KEY=your_bscscan_api_key
TOKEN_NAME=Custom Token Name
TOKEN_SYMBOL=CTK
TOKEN_SUPPLY=5000000
SKIP_TOKEN_CREATION=false
USE_ONE_CLICK_DEPLOY=false
```

## 📁 输出文件

### 部署信息
- **位置**: `deployments/deployment-info-{timestamp}.json`
- **内容**: 合约地址、ABI、交易哈希、网络信息

### 代币信息
- **位置**: `tokens/token-{symbol}-{timestamp}.json`
- **内容**: 代币详情、交易记录、阶段状态

### 前端集成
- **位置**: `frontend-integration.js`
- **内容**: Web3连接、合约交互函数、使用示例

## 🌐 前端集成示例

```javascript
import { initWeb3, createToken } from './frontend-integration.js';

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

## 📋 项目结构

```
scripts/
├── deploy-and-test.js      # 一键部署脚本
├── create-token.js         # 代币创建脚本
├── compile-contract.js     # 合约编译脚本
└── show-summary.js         # 项目状态脚本

contracts/Acon/
├── StagedTokenFactory.sol  # 主要合约
├── Interfaces.sol          # 接口定义
└── deploy.js              # Hardhat部署脚本

deployments/               # 部署信息文件
tokens/                   # 代币信息文件
docs/                     # 详细文档
frontend-integration.js   # 前端集成代码
```

## 🔧 技术栈

- **区块链**: BSC测试网 (Chain ID: 97)
- **Web3库**: web3.js, ethers.js
- **合约**: Solidity ^0.8.20
- **编译器**: solc
- **前端**: Vue.js (可选)

## 📖 详细文档

- [完整部署指南](docs/DEPLOYMENT_GUIDE.md) - 详细的使用说明和故障排除
- [合约文档](contracts/Acon/README.md) - 智能合约技术文档

## 🔗 相关链接

- [BSC测试网浏览器](https://testnet.bscscan.com)
- [BSC测试网水龙头](https://testnet.binance.org/faucet-smart)
- [MetaMask配置指南](https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain)

## ❓ 常见问题

### Q: 部署失败，提示余额不足？
A: 请确保账户有足够的测试BNB，访问水龙头获取。

### Q: 如何验证合约？
A: 配置BSCSCAN_API_KEY后，脚本会自动尝试验证，或手动在BSCScan验证。

### Q: 前端无法连接合约？
A: 确保MetaMask连接到BSC测试网，检查合约地址是否正确。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 📄 许可证

MIT License

---

**开始您的第一次部署：**

```bash
npm run summary  # 查看状态
npm run deploy   # 开始部署
```
