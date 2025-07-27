# FEG SmartDeFi 代币发行生态系统

基于 FEG SmartDeFi 架构设计的完整代币发行生态系统，支持一键部署代币和预售功能。

## 📋 系统架构

### 核心合约

1. **TokenFactory.sol** - 代币创建工厂合约
   - 创建自定义ERC20代币
   - 支持费用机制、流动性管理
   - 自动创建DEX交易对

2. **PresaleManager.sol** - 预售和交易管理合约
   - 预售功能和资金募集
   - 分阶段解锁机制
   - 内部交易系统
   - 价格发现机制

3. **DeploymentManager.sol** - 统一部署管理合约
   - 一键部署代币和预售
   - 多链支持配置
   - 费用管理和统计

4. **FrontendInterface.sol** - 前端集成接口
   - 简化的API接口
   - 批量查询功能
   - 实用工具函数

## 🚀 快速开始

### 1. 部署合约

```solidity
// 1. 部署 DeploymentManager
DeploymentManager deploymentManager = new DeploymentManager();

// 2. 部署 FrontendInterface
FrontendInterface frontend = new FrontendInterface(address(deploymentManager));
```

### 2. 前端集成

```javascript
// 连接合约
const frontendInterface = new ethers.Contract(
    FRONTEND_INTERFACE_ADDRESS,
    FrontendInterfaceABI,
    signer
);

// 部署代币和预售
const deploymentParams = {
    name: "MyToken",
    symbol: "MTK",
    totalSupply: 1000000,
    decimals: 18,
    buyFee: 1,
    sellFee: 4,
    presalePrice: 1000, // 每ETH购买1000个代币
    hardCap: ethers.utils.parseEther("100"),
    softCap: ethers.utils.parseEther("50"),
    maxBuyPerWallet: ethers.utils.parseEther("5"),
    presaleDuration: 7 * 24 * 3600, // 7天
    liquidityPercent: 70,
    listingPrice: 800,
    autoListing: true
};

const tx = await frontendInterface.deployToken(deploymentParams, {
    value: ethers.utils.parseEther("0.15") // 部署费用
});
```

## 🔧 功能特性

### 代币功能
- ✅ 标准ERC20实现
- ✅ 自定义费用机制（买入/卖出）
- ✅ 自动流动性管理
- ✅ LP自动销毁机制
- ✅ 费用分配系统
- ✅ 交易限制和保护

### 预售功能
- ✅ 多阶段预售系统
- ✅ 用户验证机制
- ✅ 分阶段解锁
- ✅ 价格发现机制
- ✅ 内部交易系统
- ✅ 流动性移除和收益分配

### 管理功能
- ✅ 权限控制系统
- ✅ 参数动态调整
- ✅ 紧急暂停机制
- ✅ 批量操作支持
- ✅ 统计和监控

## 🌐 多链支持

### 支持的网络

| 网络 | Chain ID | 状态 | DEX |
|------|----------|------|-----|
| BSC 主网 | 56 | ✅ 支持 | PancakeSwap |
| BSC 测试网 | 97 | ✅ 支持 | PancakeSwap |
| TRON 主网 | 728126428 | 🔄 开发中 | JustSwap |

### 网络配置

```solidity
// BSC 主网配置
networkConfigs[56] = NetworkConfig({
    router: 0x10ED43C718714eb63d5aA57B78B54704E256024E,
    wbnb: 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c,
    usdt: 0x55d398326f99059fF775485246999027B3197955,
    enabled: true
});
```

## 💰 费用结构

### 部署费用
- 代币创建费用: 0.1 BNB
- 预售创建费用: 0.05 BNB
- 平台费用: 10% (可调整)
- 总计: ~0.15 BNB

### 交易费用
- 买入费用: 1-10% (可自定义)
- 卖出费用: 1-10% (可自定义)
- 费用分配: LP池/营销/基价池 (1:1:1)

## 🔒 安全机制

### 权限控制
- 多级权限管理 (Owner/Manager)
- 时间锁机制
- 紧急暂停功能

### 安全检查
- 重入攻击防护
- 整数溢出保护
- 参数验证机制
- 交易限制保护

### 审计建议
- [ ] 智能合约安全审计
- [ ] 经济模型验证
- [ ] 压力测试
- [ ] 多链兼容性测试

## 📊 价格发现机制

### 核心算法
```solidity
// FEG 价格计算逻辑
function getMarketPrice() public view returns(uint256) {
    uint256 _amount = IERC20(USDT).balanceOf(pairUSDT);
    uint256 _token = IERC20(tokenAddress).balanceOf(pairUSDT);
    
    // 关键公式: price = supply * USDT_balance / token_balance
    uint256 price = supply.mul(_amount).div(_token);
    return price;
}
```

### 解锁机制
- 基于市场价格增长触发
- 每增加15万美元解锁1%
- 分阶段释放流动性
- 90%收益给用户，10%给平台

## 🛠️ 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 编译合约
npx hardhat compile

# 运行测试
npx hardhat test

# 部署到测试网
npx hardhat run scripts/deploy.js --network bscTestnet
```

### 测试网部署

```javascript
// scripts/deploy.js
async function main() {
    // 部署 DeploymentManager
    const DeploymentManager = await ethers.getContractFactory("DeploymentManager");
    const deploymentManager = await DeploymentManager.deploy();
    await deploymentManager.deployed();
    
    console.log("DeploymentManager deployed to:", deploymentManager.address);
    
    // 部署 FrontendInterface
    const FrontendInterface = await ethers.getContractFactory("FrontendInterface");
    const frontend = await FrontendInterface.deploy(deploymentManager.address);
    await frontend.deployed();
    
    console.log("FrontendInterface deployed to:", frontend.address);
}
```

## 📱 前端集成示例

### React 组件示例

```jsx
import { useState } from 'react';
import { ethers } from 'ethers';

function TokenDeployment() {
    const [params, setParams] = useState({
        name: '',
        symbol: '',
        totalSupply: 1000000,
        buyFee: 1,
        sellFee: 4,
        presalePrice: 1000,
        hardCap: '100',
        softCap: '50',
        maxBuyPerWallet: '5'
    });

    const deployToken = async () => {
        try {
            const tx = await frontendInterface.deployToken(params, {
                value: ethers.utils.parseEther("0.15")
            });
            
            const receipt = await tx.wait();
            console.log('Token deployed:', receipt);
        } catch (error) {
            console.error('Deployment failed:', error);
        }
    };

    return (
        <div>
            <h2>Deploy Your Token</h2>
            <form onSubmit={deployToken}>
                <input
                    placeholder="Token Name"
                    value={params.name}
                    onChange={(e) => setParams({...params, name: e.target.value})}
                />
                <input
                    placeholder="Token Symbol"
                    value={params.symbol}
                    onChange={(e) => setParams({...params, symbol: e.target.value})}
                />
                {/* 更多输入字段... */}
                <button type="submit">Deploy Token</button>
            </form>
        </div>
    );
}
```

### Web3 集成

```javascript
// 连接钱包
async function connectWallet() {
    if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        return signer;
    }
}

// 获取网络信息
async function getNetworkInfo() {
    const networkInfo = await frontendInterface.getNetworkInfo();
    console.log('Current network:', networkInfo);
}

// 获取用户代币信息
async function getUserTokens(userAddress) {
    const tokenInfo = await frontendInterface.getUserTokenInfo(userAddress);
    console.log('User tokens:', tokenInfo);
}
```

## 🔍 监控和分析

### 事件监听

```javascript
// 监听代币部署事件
frontendInterface.on("TokenDeploymentCompleted", (user, token, presale, event) => {
    console.log(`New token deployed: ${token} by ${user}`);
});

// 监听预售状态更新
frontendInterface.on("PresaleStatusUpdated", (presale, status, event) => {
    console.log(`Presale ${presale} status updated to ${status}`);
});
```

### 数据查询

```javascript
// 获取平台统计
const stats = await frontendInterface.getPlatformStats();
console.log('Platform stats:', stats);

// 获取最新代币
const latestTokens = await frontendInterface.getLatestTokens(10);
console.log('Latest tokens:', latestTokens);
```

## 🚨 注意事项

### 部署前检查
1. 确认网络配置正确
2. 检查部署费用充足
3. 验证参数合理性
4. 测试网先行验证

### 安全提醒
1. 私钥安全保管
2. 合约权限谨慎使用
3. 定期安全审计
4. 监控异常活动

### 法律合规
1. 遵守当地法律法规
2. 代币发行合规性
3. 预售活动许可
4. 税务申报义务

## 📞 技术支持

- 文档: [链接]
- 社区: [Discord/Telegram]
- 问题反馈: [GitHub Issues]
- 技术咨询: [邮箱]

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

**免责声明**: 本系统仅供学习和研究使用，使用者需自行承担相关风险和责任。请在充分了解相关法律法规的前提下使用。
