# TRON Nile测试链 - 代币预售对查询测试

这个测试套件用于验证在TRON Nile测试链上 `getTokenPresalePairsByCreator` 方法的功能。

## 📋 测试目标

验证地址 `TK57586sko7cTQxgNUGqpzMGWTwWBsr6iu` 创建的代币预售对，测试 `getTokenPresalePairsByCreator` 方法是否能正确查询到结果。

## 📁 测试文件

### 1. HTML测试页面
- **文件**: `test-token-query.html`
- **用途**: 浏览器端测试，需要TronLink钱包
- **特点**: 可视化界面，实时显示测试结果

### 2. Node.js测试脚本
- **文件**: `test-token-query.js`
- **用途**: 命令行测试，无需钱包
- **特点**: 自动化测试，详细日志输出

## 🚀 使用方法

### 方法1: HTML页面测试

1. **打开测试页面**
   ```bash
   # 在浏览器中打开
   file:///path/to/src/tron/test-token-query.html
   ```

2. **连接TronLink钱包**
   - 确保TronLink已安装并连接到Nile测试网
   - 点击"连接TronLink"按钮

3. **运行测试**
   - 点击"运行完整测试"按钮
   - 或分别点击各个测试按钮

### 方法2: Node.js脚本测试

1. **安装依赖**
   ```bash
   npm install tronweb
   ```

2. **运行完整测试**
   ```bash
   node test-token-query.js
   # 或
   node test-token-query.js full
   ```

3. **运行特定测试**
   ```bash
   # 测试创建者代币数量
   node test-token-query.js creator
   
   # 测试代币预售对查询
   node test-token-query.js pairs
   
   # 测试所有代币查询
   node test-token-query.js all
   ```

## 🔧 配置信息

### 网络配置
- **网络**: TRON Nile测试网
- **RPC地址**: https://nile.trongrid.io
- **Chain ID**: 3

### 合约配置
- **工厂合约地址**: `TTMTNpZPeaxV9aT3mDuhMT7t6Suu1NtMrc`
- **创建者地址**: `TK57586sko7cTQxgNUGqpzMGWTwWBsr6iu`

## 📊 测试内容

### 1. 网络连接测试
- 验证TRON Nile网络连接
- 检查节点信息
- 确认网络类型

### 2. 合约连接测试
- 验证工厂合约地址
- 测试基本合约调用
- 检查工厂状态

### 3. 创建者代币数量测试
- 查询指定创建者的代币数量
- 验证地址格式和有效性

### 4. 代币预售对查询测试
- 测试 `getTokenPresalePairsByCreator` 方法
- 验证分页参数（offset, limit）
- 检查返回数据结构

### 5. 所有代币查询测试
- 测试 `getAllTokenPresalePairs` 方法
- 筛选指定创建者的代币
- 对比两种查询方法的结果

### 6. 分页查询测试
- 测试分页功能
- 验证大数据量处理
- 检查分页参数有效性

## 📈 预期结果

### 成功情况
如果 `TK57586sko7cTQxgNUGqpzMGWTwWBsr6iu` 确实创建过代币，您应该看到：

```
✅ 创建者代币数量查询成功
📊 创建者代币数量: X

✅ 代币预售对查询成功
📊 查询结果:
   - 返回代币数量: X
   - 总代币数量: X

📋 代币列表:
1. TOKEN_SYMBOL (TOKEN_NAME)
   代币地址: T1234...5678
   预售地址: T8765...4321
   创建者: TK575...6iu
   创建时间: 2024/1/1 12:00:00
   总供应量: 1000000000000000000000000
```

### 失败情况
如果该地址没有创建过代币，您会看到：

```
⚠️ 该地址没有创建过代币
📊 创建者代币数量: 0

⚠️ 未找到代币预售对
📊 查询结果: 该地址没有创建过代币预售对
```

## 🔍 故障排除

### 常见问题

1. **网络连接失败**
   - 检查网络连接
   - 确认Nile测试网RPC地址正确
   - 尝试使用其他RPC节点

2. **合约连接失败**
   - 验证工厂合约地址是否正确
   - 检查合约是否已部署
   - 确认ABI定义是否正确

3. **TronLink连接失败**
   - 确保TronLink已安装
   - 检查是否连接到Nile测试网
   - 尝试重新连接钱包

4. **查询结果为空**
   - 确认创建者地址正确
   - 检查该地址是否真的创建过代币
   - 尝试查询其他地址

### 调试步骤

1. **检查网络**
   ```javascript
   // 在浏览器控制台执行
   await window.tronWeb.trx.getNodeInfo()
   ```

2. **检查合约**
   ```javascript
   // 测试基本合约调用
   const contract = await tronWeb.contract(ABI, FACTORY_ADDRESS);
   const totalPairs = await contract.totalPairsCreated().call();
   console.log('总创建数量:', totalPairs.toString());
   ```

3. **检查创建者**
   ```javascript
   // 查询创建者代币数量
   const creatorCount = await contract.getCreatorTokenCount(CREATOR_ADDRESS).call();
   console.log('创建者代币数量:', creatorCount.toString());
   ```

## 📝 测试报告

测试完成后，您应该能够回答以下问题：

1. ✅ 网络连接是否正常？
2. ✅ 合约是否可访问？
3. ✅ 创建者地址是否有效？
4. ✅ `getTokenPresalePairsByCreator` 方法是否工作？
5. ✅ 分页功能是否正常？
6. ✅ 返回的数据结构是否正确？

## 🎯 测试结论

根据测试结果，您可以确定：

- **如果查询到代币**: `getTokenPresalePairsByCreator` 方法工作正常
- **如果查询不到代币**: 可能是该地址确实没有创建过代币，或者合约方法有问题
- **如果查询失败**: 可能是网络、合约或参数配置问题

## 📞 技术支持

如果遇到问题，请检查：

1. 网络连接状态
2. 合约地址是否正确
3. 创建者地址是否有效
4. TronLink钱包配置
5. 控制台错误信息

---

**注意**: 这是一个测试工具，仅用于验证合约功能，不会产生任何交易或修改区块链状态。
