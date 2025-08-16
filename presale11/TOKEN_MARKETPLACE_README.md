# 代币预售平台功能说明

## 🎯 功能概述

本项目新增了完整的代币预售平台功能，用户可以：
- 浏览所有已创建的代币列表
- 查看代币详细信息和预售状态
- 参与代币预售购买
- 管理钱包连接和余额

## 🏗️ 技术架构

### 核心组件
```
src/
├── tron/services/
│   └── TokenListService.js          # 代币列表服务
├── stores/
│   └── tokenListStore.js            # 代币列表状态管理
├── components/
│   ├── TokenList.vue                # 代币列表组件
│   └── TokenDetails.vue             # 代币详情组件
├── composables/
│   └── useTokenPurchase.js          # 购买功能组合式函数
├── mobilePages/
│   └── tokenMarketplace.vue         # 主页面
└── views/
    └── TokenMarketplaceTest.vue     # 测试页面
```

### 服务层架构
- **TokenListService**: 负责获取和管理代币列表数据
- **tokenListStore**: 使用Vue响应式系统管理状态
- **useTokenPurchase**: 处理钱包连接和购买逻辑

## 🚀 快速开始

### 1. 访问页面
```
# 主要功能页面
http://localhost:8080/#/token-marketplace

# 测试页面
http://localhost:8080/#/token-marketplace-test
```

### 2. 功能测试流程

#### 步骤1: 连接钱包
1. 确保已安装TronLink浏览器扩展
2. 在页面右上角点击"连接钱包"
3. 在TronLink中确认连接

#### 步骤2: 浏览代币列表
1. 页面会自动加载已创建的代币列表
2. 可以使用搜索和筛选功能
3. 查看代币基本信息和预售状态

#### 步骤3: 参与预售
1. 点击感兴趣的代币的"Buy Now"按钮
2. 在详情页面设置购买数量
3. 确认交易并在TronLink中签名

## 📋 功能详情

### 代币列表功能
- ✅ 获取所有已创建的代币对
- ✅ 显示代币基本信息（名称、符号、总供应量）
- ✅ 显示预售状态和进度
- ✅ 搜索和筛选功能
- ✅ 分页加载更多

### 代币详情功能
- ✅ 完整的代币信息展示
- ✅ 预售价格和进度信息
- ✅ 购买数量设置
- ✅ 余额检查和验证
- ✅ 地址复制功能

### 购买功能
- ✅ 钱包连接检查
- ✅ 余额验证
- ✅ 交易发送和确认
- ✅ 交易状态跟踪
- ✅ 错误处理和用户提示

### 状态管理
- ✅ 响应式数据管理
- ✅ 缓存机制
- ✅ 自动刷新
- ✅ 错误状态处理

## 🔧 配置说明

### 网络配置
当前配置使用TRON NILE测试网：
```javascript
// src/tron/config/index.js
export const CURRENT_NETWORK = 'NILE'
export const CONTRACT_ADDRESSES = {
  NILE: {
    COORDINATOR_FACTORY: 'TTMTNpZPeaxV9aT3mDuhMT7t6Suu1NtMrc'
  }
}
```

### 默认项目配置
```javascript
export const DEFAULT_PROJECT_CONTRACTS = {
  NILE: {
    TOKEN_ADDRESS: 'TGX1nrURc8by7Jdsv7zrxuEYSNgsmD3Qm3',
    PRESALE_ADDRESS: 'TQqMakjbxrKPFQfSukQ4fkMeuvEddP36Vj',
    PROJECT_NAME: 'Default Token',
    PROJECT_SYMBOL: 'DTK'
  }
}
```

## 🧪 测试指南

### 使用测试页面
访问 `/token-marketplace-test` 页面进行功能测试：

1. **代币列表服务测试**
   - 测试获取代币列表
   - 测试代币详情获取
   - 测试缓存功能

2. **钱包连接测试**
   - 测试TronWeb检测
   - 测试钱包连接
   - 测试余额查询

3. **合约交互测试**
   - 测试工厂合约状态
   - 测试代币数量查询
   - 测试创建费用查询

### 手动测试步骤
1. 打开测试页面
2. 依次点击测试按钮
3. 查看测试结果和错误信息
4. 验证代币列表预览
5. 检查钱包状态显示

## 🐛 常见问题

### 1. TronLink未检测到
**问题**: 页面提示"TronWeb未找到"
**解决**: 
- 安装TronLink浏览器扩展
- 刷新页面
- 检查TronLink是否已启用

### 2. 钱包连接失败
**问题**: 无法连接到TronLink钱包
**解决**:
- 确保TronLink已解锁
- 检查网络设置（应为NILE测试网）
- 尝试手动连接钱包

### 3. 代币列表为空
**问题**: 页面显示"暂无代币"
**解决**:
- 检查网络连接
- 验证合约地址配置
- 查看浏览器控制台错误信息

### 4. 购买交易失败
**问题**: 购买时交易失败
**解决**:
- 检查TRX余额是否充足
- 确认预售状态为"进行中"
- 检查购买数量是否超限

## 📝 开发说明

### 添加新功能
1. 在相应的服务类中添加方法
2. 更新状态管理store
3. 修改UI组件
4. 添加测试用例

### 自定义配置
可以通过URL参数指定特定的代币项目：
```
/token-marketplace?token=TOKEN_ADDRESS&presale=PRESALE_ADDRESS&name=TOKEN_NAME&symbol=TOKEN_SYMBOL
```

### 扩展功能
- 添加更多筛选条件
- 实现代币收藏功能
- 添加价格图表
- 集成更多钱包类型

## 🔗 相关链接

- [TRON NILE测试网浏览器](https://nile.tronscan.org/)
- [TronLink钱包下载](https://www.tronlink.org/)
- [TRON开发文档](https://developers.tron.network/)

## 📞 技术支持

如遇到问题，请：
1. 查看浏览器控制台错误信息
2. 使用测试页面进行诊断
3. 检查网络和钱包配置
4. 联系开发团队获取支持
