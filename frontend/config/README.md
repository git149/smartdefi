# StagedTokenFactory 前端集成指南

## 合约信息

- **合约地址**: `0x073faD54A73333EC1671522b9cCCbbBd153DA265`
- **网络**: BSC Testnet (Chain ID: 97)
- **部署时间**: 2025-07-26T16:42:42.712Z
- **创建费用**: 0.03 BNB
- **BSCScan**: https://testnet.bscscan.com/address/0x073faD54A73333EC1671522b9cCCbbBd153DA265

## 文件说明

### 1. `contract-config.json`
完整的合约配置文件，包含：
- 合约地址
- 网络配置
- 完整的 ABI

### 2. `staged-token-factory-abi.json`
纯 ABI 文件，包含所有合约函数和事件的定义。

### 3. `staged-token-factory-config.js`
前端 JavaScript 配置文件，包含：
- 合约地址和网络配置
- 精简的 ABI（仅包含常用函数）
- 使用示例代码

## 快速开始

### 方式一：使用 JavaScript 配置文件（推荐）

```javascript
import { 
  FACTORY_CONTRACT_ADDRESS, 
  FACTORY_ABI_ESSENTIAL, 
  NETWORK_CONFIG 
} from './config/staged-token-factory-config.js';

// 使用 Web3.js
import Web3 from 'web3';
const web3 = new Web3(NETWORK_CONFIG.rpcUrl);
const contract = new web3.eth.Contract(FACTORY_ABI_ESSENTIAL, FACTORY_CONTRACT_ADDRESS);

// 使用 Ethers.js
import { ethers } from 'ethers';
const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
const contract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_ABI_ESSENTIAL, provider);
```

### 方式二：使用 JSON 配置文件

```javascript
import contractConfig from './config/contract-config.json';

const { contractAddress, abi, network } = contractConfig;

// 使用配置
const web3 = new Web3(network.rpcUrl);
const contract = new web3.eth.Contract(abi, contractAddress);
```

## 主要功能

### 1. 查询合约信息

```javascript
// 获取创建费用
const creationFee = await contract.methods.creationFee().call();
console.log('创建费用:', web3.utils.fromWei(creationFee, 'ether'), 'BNB');

// 获取已创建代币数量
const totalTokens = await contract.methods.totalTokensCreated().call();
console.log('已创建代币数量:', totalTokens);

// 检查工厂状态
const isEnabled = await contract.methods.factoryEnabled().call();
console.log('工厂状态:', isEnabled ? '启用' : '禁用');
```

### 2. 创建代币

```javascript
// 基础代币创建
const receipt = await contract.methods.createToken(
  'My Token',        // 代币名称
  'MTK',            // 代币符号
  '1000000',        // 总供应量
  1,                // 买入费用 (1%)
  4                 // 卖出费用 (4%)
).send({
  from: userAddress,
  value: creationFee
});

// 一键创建并激活代币
const receipt2 = await contract.methods.createAndActivateToken(
  'My Token 2',
  'MTK2',
  '2000000',
  2,
  5
).send({
  from: userAddress,
  value: creationFee
});
```

### 3. 监听事件

```javascript
// 监听代币创建事件
contract.events.TokenCreated({
  fromBlock: 'latest'
}, (error, event) => {
  if (error) {
    console.error('事件监听错误:', error);
    return;
  }
  
  const { token, creator, name, symbol, totalSupply } = event.returnValues;
  console.log('新代币创建:', {
    address: token,
    creator: creator,
    name: name,
    symbol: symbol,
    totalSupply: totalSupply
  });
});
```

## 网络配置

确保您的钱包连接到 BSC 测试网：

```javascript
// MetaMask 网络配置
const bscTestnetConfig = {
  chainId: '0x61', // 97 in hex
  chainName: 'BSC Testnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  },
  rpcUrls: ['https://bsc-testnet-rpc.publicnode.com'],
  blockExplorerUrls: ['https://testnet.bscscan.com']
};

// 添加网络到 MetaMask
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [bscTestnetConfig]
});
```

## 错误处理

```javascript
try {
  const receipt = await contract.methods.createToken(
    name, symbol, supply, buyFee, sellFee
  ).send({ from: userAddress, value: creationFee });
  
  console.log('代币创建成功:', receipt.transactionHash);
} catch (error) {
  if (error.code === 4001) {
    console.log('用户取消了交易');
  } else if (error.message.includes('insufficient funds')) {
    console.log('余额不足');
  } else {
    console.error('创建失败:', error.message);
  }
}
```

## 注意事项

1. **测试网络**: 这是部署在 BSC 测试网的合约，仅用于测试
2. **创建费用**: 每次创建代币需要支付 0.03 BNB
3. **Gas 费用**: 除了创建费用，还需要额外的 BNB 用于 Gas 费用
4. **网络切换**: 确保钱包连接到正确的网络 (BSC Testnet, Chain ID: 97)

## 获取测试 BNB

访问 BSC 测试网水龙头获取测试 BNB：
- https://testnet.binance.org/faucet-smart

## 技术支持

如有问题，请查看：
- BSCScan 合约页面: https://testnet.bscscan.com/address/0x073faD54A73333EC1671522b9cCCbbBd153DA265
- 部署信息文件: `../deployments/staged-token-factory-deployment.json`
