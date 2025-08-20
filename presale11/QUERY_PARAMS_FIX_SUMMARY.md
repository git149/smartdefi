# 查询参数解析问题修复总结

## 问题描述

用户报告：`http://localhost:8080/#/token-detail?index=0` 无法获取链上代币信息，而 `http://localhost:8080/#/token-detail` 可以正常工作。

## 问题分析

### 1. 路由配置问题
- **原始路由配置**：使用了动态路径参数 `:id?`，期望路径参数而非查询参数
- **问题**：`/token-detail?index=0` 中的 `?index=0` 是查询参数，但路由期望的是路径参数

### 2. Vue Router 哈希模式问题
- **哈希模式特性**：在哈希模式下，查询参数的处理可能存在问题
- **URL 结构**：`http://localhost:8080/#/token-detail?index=0` 中的查询参数在哈希之后

### 3. 参数解析逻辑问题
- **原始实现**：`getUrlParams()` 方法没有正确处理所有参数来源
- **同步问题**：`syncUrlParamsToRouter()` 方法没有完全同步所有参数类型

## 修复方案

### 1. 路由配置优化
```javascript
// 添加专门处理查询参数的路由
{
    path: '/token-detail', name: 'tokenDetailQuery',
    component: resolve => require(['../mobilePages/TokenDetailPage.vue'], resolve),
    props: true
}
```

### 2. 参数解析方法优化
```javascript
getUrlParams() {
    const route = this.$route || {};
    
    // 优先使用 Vue Router 的 query
    let index = route.query && route.query.index !== undefined ? route.query.index : undefined;
    let tokenAddress = route.query && route.query.tokenAddress;
    // ... 其他参数
    
    // 如果 Vue Router 没有解析到查询参数，尝试手动解析 URL
    if (index === undefined || !tokenAddress) {
        try {
            const fullUrl = window.location.href;
            const url = new URL(fullUrl);
            
            // 检查哈希中的查询参数
            const hash = url.hash || '';
            if (hash.includes('?')) {
                const hashQuery = hash.split('?')[1];
                const hashParams = new URLSearchParams(hashQuery);
                // ... 解析逻辑
            }
            
            // 检查 URL 搜索参数（哈希前的部分）
            // ... 解析逻辑
        } catch (e) {
            console.warn('⚠️ 解析 URL 参数失败:', e);
        }
    }
    
    return { tokenId, tokenAddress, presaleAddress, creator, index };
}
```

### 3. 参数同步逻辑增强
```javascript
syncUrlParamsToRouter() {
    try {
        const { tokenId, index, tokenAddress, presaleAddress, creator } = this.getUrlParams();
        const curr = this.$route;
        
        // 检查是否需要同步各种参数
        const needIndexSync = index !== undefined && curr.query.index !== index;
        const needTokenAddressSync = tokenAddress && curr.query.tokenAddress !== tokenAddress;
        // ... 其他同步检查
        
        if (needIndexSync || needTokenAddressSync || /* 其他条件 */) {
            // 构建新的查询参数和路径参数
            const newQuery = { ...curr.query };
            const newParams = { ...curr.params };
            
            // 更新参数
            if (index !== undefined) newQuery.index = index.toString();
            if (tokenAddress) newQuery.tokenAddress = tokenAddress;
            // ... 其他参数更新
            
            this.$router.replace({
                name: curr.name || 'tokenDetail',
                params: newParams,
                query: newQuery
            }).catch(() => {});
        }
    } catch (e) {
        console.warn('⚠️ 同步 URL 参数到路由失败:', e);
    }
}
```

## 修复效果

### 修复前
- ❌ `http://localhost:8080/#/token-detail?index=0` 无法获取代币信息
- ✅ `http://localhost:8080/#/token-detail` 可以正常工作

### 修复后
- ✅ `http://localhost:8080/#/token-detail?index=0` 可以正常获取代币信息
- ✅ `http://localhost:8080/#/token-detail` 仍然可以正常工作
- ✅ `http://localhost:8080/#/token-detail/5?index=2` 混合参数也可以正常工作

## 测试验证

创建了测试页面 `public/test-query-params.html` 来验证修复效果：

1. **基本路由测试**：`#/token-detail`
2. **查询参数测试**：`#/token-detail?index=0`
3. **多参数测试**：`#/token-detail?index=1&tokenAddress=TEST123`
4. **路径参数测试**：`#/token-detail/5`
5. **混合参数测试**：`#/token-detail/5?index=2`

## 技术要点

### 1. 参数解析优先级
1. Vue Router 的 `$route.query` 和 `$route.params`
2. 哈希中的查询参数
3. URL 搜索参数（哈希前）

### 2. 参数同步策略
- 自动检测参数变化
- 智能更新路由状态
- 保持向后兼容性

### 3. 错误处理
- 优雅降级
- 详细的日志记录
- 用户友好的错误提示

## 总结

通过这次修复，我们解决了 Vue Router 在哈希模式下查询参数解析的问题，使得：

1. **查询参数**：`?index=0` 能够被正确解析
2. **路径参数**：`/5` 仍然可以正常工作
3. **混合参数**：`/5?index=2` 也能正确处理
4. **向后兼容**：原有的功能不受影响

这个修复确保了应用能够处理各种 URL 格式，提升了用户体验和系统的健壮性。
