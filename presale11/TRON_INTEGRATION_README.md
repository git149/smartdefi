# TRON区块链智能合约集成指南

## 📋 概述

本项目已成功集成TRON区块链智能合约功能，支持代币创建、预售管理和完整的区块链交互。

## 🏗️ 架构概览

```
src/tron/
├── config/           # 配置文件
│   └── index.js     # 网络配置、合约地址、默认参数
├── contracts/       # 合约相关
│   └── abis/        # ABI文件
│       ├── CoordinatorFactoryABI.json
│       ├── presaleABI.json
│       ├── tokenABI.json
│       └── index.js # ABI统一导入
├── services/        # 服务类
│   ├── TronWebService.js          # TronWeb连接管理
│   ├── BaseContractService.js     # 合约服务基类
│   ├── CoordinatorFactoryService.js # 工厂合约服务
│   ├── PresaleService.js          # 预售合约服务
│   ├── TokenService.js            # 代币合约服务
│   └── index.js                   # 服务统一入口
├── utils/           # 工具函数
│   └── index.js     # 地址、数值、时间等工具
├── components/      # Vue组件
│   ├── TronWalletConnector.vue    # 钱包连接器
│   └── TokenCreator.vue           # 代币创建器
└── index.js         # Vue插件入口
```

## 🚀 快速开始

### 1. 环境配置

复制环境配置文件：
```bash
cp .env.example .env
```

配置TRON网络和合约地址：
```env
# 选择网络: MAINNET, SHASTA, NILE
VUE_APP_TRON_NETWORK=MAINNET

# 配置工厂合约地址
VUE_APP_COORDINATOR_FACTORY_NILE=TTMTNpZPeaxV9aT3mDuhMT7t6Suu1NtMrc
```

### 2. 在Vue组件中使用

#### 基础使用
```vue
<template>
  <div>
    <!-- 钱包连接器 -->
    <TronWalletConnector @connected="onConnected" />
    
    <!-- 代币创建器 -->
    <TokenCreator @created="onTokenCreated" />
  </div>
</template>

<script>
import TronWalletConnector from '@/tron/components/TronWalletConnector.vue'
import TokenCreator from '@/tron/components/TokenCreator.vue'

export default {
  components: {
    TronWalletConnector,
    TokenCreator
  },
  
  methods: {
    async onConnected(account) {
      console.log('钱包已连接:', account)
      
      // 获取余额
      const balance = await this.$getTronBalance()
      console.log('余额:', balance.formatted)
    },
    
    onTokenCreated(result) {
      console.log('代币创建成功:', result)
    }
  }
}
</script>
```

#### 高级使用
```javascript
// 创建代币和预售
const tokenConfig = {
  name: 'My Token',
  symbol: 'MTK',
  totalSupply: '1000000000000000000000000', // 1M tokens with 18 decimals
  feeBuy: 300,  // 3%
  feeSell: 300  // 3%
}

const presaleConfig = {
  presaleEthAmount: '100000',    // 0.1 TRX
  tradeEthAmount: '50000',       // 0.05 TRX
  maxTotalNum: 100,
  presaleMaxNum: 10
}

const result = await this.$createTokenAndPresale(tokenConfig, presaleConfig)

// 获取合约服务实例
const tokenService = this.$tron.getTokenService(tokenAddress)
const presaleService = this.$tron.getPresaleService(presaleAddress)

// 查询代币信息
const tokenInfo = await tokenService.getTokenInfo()

// 参与预售
await presaleService.participatePresale({ callValue: 100000 })
```

## 🔧 API参考

### 全局方法

#### 钱包操作
- `$connectTronWallet()` - 连接TRON钱包
- `$disconnectTronWallet()` - 断开钱包连接
- `$getTronBalance(address?)` - 获取TRX余额

#### 合约操作
- `$createTokenAndPresale(tokenConfig, presaleConfig, options?)` - 创建代币和预售

#### 工具方法
- `$formatTronAddress(address, startLength?, endLength?)` - 格式化地址显示
- `$formatNumber(value, decimals?)` - 格式化数字显示
- `$getTronTxLink(txHash, network?)` - 获取交易链接
- `$getTronAddressLink(address, network?)` - 获取地址链接

### 响应式状态

通过 `$tronState` 访问：
```javascript
{
  isConnected: false,      // 是否已连接钱包
  currentAccount: null,    // 当前账户地址
  isInitialized: false,    // 是否已初始化
  networkConfig: null      // 网络配置
}
```

### 服务类

#### TronWebService
```javascript
// 连接钱包
await this.$tronWeb.connectWallet()

// 获取余额
const balance = await this.$tronWeb.getBalance(address)

// 验证地址
const isValid = this.$tronWeb.isValidAddress(address)
```

#### CoordinatorFactoryService
```javascript
// 创建代币和预售
const result = await this.$tron.coordinatorFactory.createTokenAndPresale(
  tokenConfig, 
  presaleConfig
)

// 获取创建费用
const fee = await this.$tron.coordinatorFactory.getCreationFee()

// 获取工厂状态
const status = await this.$tron.coordinatorFactory.getFactoryStatus()
```

#### TokenService
```javascript
const tokenService = this.$tron.getTokenService(tokenAddress)

// 获取代币信息
const info = await tokenService.getTokenInfo()

// 转账
await tokenService.transfer(toAddress, amount)

// 授权
await tokenService.approve(spenderAddress, amount)
```

#### PresaleService
```javascript
const presaleService = this.$tron.getPresaleService(presaleAddress)

// 参与预售
await presaleService.participatePresale({ callValue: amount })

// 获取预售状态
const status = await presaleService.getPresaleFullStatus()

// 获取用户信息
const userInfo = await presaleService.getUserFullInfo(userAddress)
```

## 🎨 Vue过滤器

```vue
<template>
  <div>
    <!-- 地址格式化 -->
    <span>{{ address | tronAddress }}</span>
    
    <!-- 数字格式化 -->
    <span>{{ amount | tronNumber(2) }}</span>
    
    <!-- 时间格式化 -->
    <span>{{ timestamp | tronTime }}</span>
    <span>{{ timestamp | tronRelativeTime }}</span>
  </div>
</template>
```

## ⚙️ 配置选项

### 网络配置
```javascript
// src/tron/config/index.js
export const TRON_NETWORKS = {
  MAINNET: {
    name: 'TRON主网',
    fullHost: 'https://api.trongrid.io',
    chainId: 1
  },
  SHASTA: {
    name: 'Shasta测试网',
    fullHost: 'https://api.shasta.trongrid.io',
    chainId: 2
  }
}
```

### 默认交易参数
```javascript
export const DEFAULT_TRANSACTION_PARAMS = {
  CREATE_TOKEN_PRESALE: {
    feeLimit: 3000000000,  // 3000 TRX
    callValue: 50000000,   // 50 TRX
    shouldPollResponse: true
  }
}
```

## 🛠️ 开发指南

### 添加新的合约服务

1. 创建服务类：
```javascript
// src/tron/services/MyContractService.js
import BaseContractService from './BaseContractService'
import { getContractABI } from '../contracts/abis'

class MyContractService extends BaseContractService {
  constructor(contractAddress) {
    const abi = getContractABI('MY_CONTRACT')
    super(contractAddress, abi, 'MyContract')
  }
  
  async myMethod(param) {
    return await this.callMethod('myMethod', [param])
  }
}

export default MyContractService
```

2. 添加ABI文件到 `src/tron/contracts/abis/`

3. 在 `src/tron/contracts/abis/index.js` 中注册ABI

### 自定义配置

```javascript
// 在main.js中自定义配置
Vue.use(TronPlugin, {
  autoInit: true,  // 是否自动初始化
  // 其他配置选项
})
```

## 🔒 安全注意事项

1. **私钥安全**: 永远不要在代码中硬编码私钥
2. **地址验证**: 始终验证用户输入的地址格式
3. **金额检查**: 在发送交易前检查余额是否充足
4. **交易确认**: 等待交易确认后再更新UI状态
5. **错误处理**: 妥善处理所有可能的错误情况

## 🐛 故障排除

### 常见问题

1. **TronWeb未找到**
   - 确保已安装TronLink钱包
   - 检查浏览器是否支持

2. **合约调用失败**
   - 检查合约地址是否正确
   - 确认网络配置是否匹配
   - 验证ABI是否完整

3. **交易失败**
   - 检查账户余额是否充足
   - 确认feeLimit设置是否合理
   - 验证合约参数是否正确

### 调试模式

设置环境变量启用调试：
```env
VUE_APP_DEBUG_MODE=true
```

## 📚 示例页面

访问 `/tron-example` 路由查看完整的使用示例，包括：
- 钱包连接
- 代币创建
- 合约交互
- 状态查询

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看LICENSE文件了解详情
