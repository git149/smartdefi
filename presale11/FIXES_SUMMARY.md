# TokenDetailPage.vue 修复总结

## 修复的问题

### 1. 持续时间计算错误 ✅

**问题描述：**
- 控制台显示"⚠️ 无法计算持续时间，使用默认值"
- `calculateDuration`方法逻辑过于复杂，容易失败

**修复方案：**
- 简化了`calculateDuration`方法的逻辑（第2352-2403行）
- 添加了更好的类型检查和错误处理
- 优先从格式化字符串中提取天数信息
- 改进了时间戳解析逻辑
- 添加了详细的调试日志

**修复后的改进：**
```javascript
// 修复前：复杂的多分支逻辑，容易失败
// 修复后：简化的逻辑，优先级明确
1. 首先尝试从格式化字符串提取天数 (如 "2025/08/15 14:14(90d 2h)" -> "90 days")
2. 然后尝试计算时间戳差值
3. 最后使用默认值并记录详细日志
```

### 2. 数值显示异常（硬顶软顶过大）✅

**问题描述：**
- 硬顶和软顶显示数值过大（如 1,000,000,000,000,000 TRX）
- 疑似单位换算问题

**修复方案：**
- 改进了`formatTrxAmount`方法（第2273-2303行）
- 添加了BigInt类型处理
- 改进了异常大数值的检测和单位转换
- 添加了调试日志来跟踪转换过程
- 改进了`calculateSoftCap`方法（第1176-1232行）
- 添加了科学计数法支持
- 增加了自动单位转换逻辑

**修复后的改进：**
```javascript
// 自动检测和转换异常大的数值
if (numericValue > 1e15) {
    numericValue = numericValue / 1e18; // wei到ether转换
} else if (numericValue > 1e12) {
    numericValue = numericValue / 1e6;  // SUN到TRX转换
}

// 智能格式化显示
if (trxAmount >= 1000000) {
    return `${(trxAmount / 1000000).toFixed(2)}M TRX`;
} else if (trxAmount >= 1000) {
    return `${(trxAmount / 1000).toFixed(2)}K TRX`;
}
```

### 3. 代币供应量显示不一致 ✅

**问题描述：**
- 控制台显示totalSupply为100000000000000000000000n，但实际应该是10000
- 本地`formatTokenAmount`方法忽略了decimals参数

**修复方案：**
- 修复了本地`formatTokenAmount`方法（第2305-2326行）
- 正确使用`TokenService.formatTokenAmount`处理decimals
- 添加了已格式化数据的检测逻辑
- 在`mapPresaleConfig`中添加了decimals参数（第1162-1165行）
- 添加了调试日志来跟踪供应量处理过程（第644-654行）

**修复后的改进：**
```javascript
// 修复前：忽略decimals参数
const tokenAmount = parseInt(amount)

// 修复后：正确处理decimals
const formattedAmount = TokenService.formatTokenAmount(amount.toString(), decimals)
const num = parseFloat(formattedAmount)
```

## 技术改进

### 1. 错误处理增强
- 所有方法都添加了try-catch错误处理
- 添加了详细的警告和错误日志
- 提供了合理的默认值

### 2. 调试能力提升
- 添加了关键步骤的调试日志
- 可以通过控制台跟踪数值转换过程
- 便于后续问题排查

### 3. 数据类型处理
- 改进了BigInt类型的处理
- 添加了科学计数法支持
- 增强了字符串解析能力

### 4. 单位转换智能化
- 自动检测异常大的数值
- 智能应用单位转换
- 支持多种数值格式

## 测试验证

创建了测试页面 `test-fixes.html` 来验证修复效果：
- TRX金额格式化测试
- 代币供应量格式化测试  
- 持续时间计算测试
- 软顶计算测试

## 使用建议

1. **监控控制台输出**：修复后的代码会输出详细的调试信息，可以通过控制台监控数值转换过程

2. **验证数值正确性**：特别关注硬顶、软顶和代币供应量的显示是否符合预期

3. **检查持续时间**：确认预售持续时间计算不再显示警告信息

## 注意事项

- 所有修改都保持了向后兼容性
- 没有修改合约代码，仅调整前端显示逻辑
- 保持了现有的配置映射逻辑不变
- 确保所有TRON地址使用Base58格式显示

## 文件修改位置

- `presale11/src/mobilePages/TokenDetailPage.vue`
  - 第644-654行：添加代币供应量调试日志
  - 第1162-1165行：修复预售配置映射中的decimals处理
  - 第1176-1232行：改进软顶计算逻辑
  - 第2273-2303行：修复TRX金额格式化
  - 第2305-2326行：修复代币数量格式化
  - 第2352-2403行：修复持续时间计算逻辑
