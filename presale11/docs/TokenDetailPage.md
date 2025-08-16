# 代币详情页面 (TokenDetailPage)

## 概述

TokenDetailPage 是一个完全按照设计稿复现的代币详情页面，提供了完整的代币信息展示和交互功能。

## 功能特性

### 🎨 视觉设计
- **一比一复现**：完全按照提供的设计稿进行视觉复现
- **响应式设计**：适配移动端和桌面端，优先移动端体验
- **现代化UI**：渐变背景、毛玻璃效果、流畅动画
- **深色主题**：符合现代应用设计趋势

### 📱 页面结构
1. **自定义导航栏**
   - RWAunion 标题
   - 返回按钮
   - 固定定位，支持滚动时的毛玻璃效果

2. **代币信息卡片**
   - 代币图标和名称
   - 代币符号 ($CHO)
   - 合约地址（支持复制和跳转区块链浏览器）

3. **操作按钮组**
   - 信息、详情、内容三个切换按钮
   - 支持状态切换和视觉反馈

4. **代币基本信息表格**
   - Name/Symbol、Soft cap、Max buy 等详细信息
   - 清晰的标签-值对展示

5. **资金曲线进度**
   - 动态百分比显示 (30.87%)
   - 进度条可视化
   - 详细的资金分布说明

6. **持有者分布列表**
   - 持有者地址和持有比例
   - 支持点击复制地址
   - Load More 分页加载功能

### 🔧 技术实现

#### 技术栈
- **Vue 2.6.11**：主框架
- **Vant 2.12.47**：UI组件库
- **SCSS**：样式预处理器
- **Vue Router 3.0.7**：路由管理

#### 核心功能
```javascript
// 地址复制功能
async copyAddress(address) {
  // 支持现代浏览器的 Clipboard API
  // 兼容旧浏览器的 execCommand 方法
}

// 区块链浏览器跳转
openInExplorer(address) {
  // 跳转到 TRON 区块链浏览器
}

// 动态数据加载
async loadTokenDetails() {
  // 支持从 API 获取代币详情
}

// 分页加载持有者
loadMoreHolders() {
  // 支持分批加载持有者数据
}
```

## 使用方法

### 路由配置
页面已自动添加到路由配置中：
```javascript
{
  path: '/token-detail/:id?', 
  name: 'tokenDetail',
  component: TokenDetailPage
}
```

### 访问方式
1. **直接访问**：`/#/token-detail`
2. **带参数访问**：`/#/token-detail/CHOU`
3. **从其他页面跳转**：
   ```javascript
   this.$router.push({
     name: 'tokenDetail',
     params: { id: 'CHOU' }
   })
   ```

### 测试页面
访问 `http://localhost:3000/token-detail-test.html` 查看测试页面和功能演示。

## 文件结构

```
src/mobilePages/TokenDetailPage.vue    # 主页面组件
public/token-detail-test.html          # 测试页面
docs/TokenDetailPage.md               # 文档说明
```

## 样式特性

### 响应式断点
- **小屏幕** (≤375px)：优化间距和字体大小
- **大屏幕** (≥768px)：居中显示，最大宽度480px
- **横屏模式**：调整导航栏高度

### 动画效果
- **页面进入**：fadeInUp 动画
- **卡片悬停**：上移和阴影效果
- **按钮点击**：涟漪效果
- **加载状态**：旋转动画

### 颜色方案
- **主背景**：渐变深蓝色 (#1a1a2e → #16213e)
- **卡片背景**：半透明白色 (rgba(255,255,255,0.05))
- **主色调**：蓝色 (#3b82f6)
- **文字颜色**：白色主文字，灰蓝色辅助文字

## 集成说明

### API 集成
页面预留了 API 集成接口，可以轻松连接后端数据：

```javascript
// 在 loadTokenDetails 方法中
const response = await this.$http.get(`/api/tokens/${tokenId}`);
this.tokenInfo = response.data;
```

### TRON 集成
- 支持 TRON 地址格式
- 集成 TronScan 区块链浏览器
- 兼容项目现有的 TRON 工具链

## 性能优化

- **懒加载**：持有者数据分批加载
- **防抖处理**：按钮点击防重复
- **内存优化**：组件销毁时清理定时器
- **缓存策略**：支持数据缓存机制

## 浏览器兼容性

- **现代浏览器**：Chrome 60+, Firefox 60+, Safari 12+
- **移动端**：iOS Safari 12+, Android Chrome 60+
- **功能降级**：旧浏览器自动使用兼容方案

## 后续扩展

1. **实时数据**：WebSocket 连接实时更新
2. **图表展示**：价格走势图、交易量图表
3. **社交功能**：评论、点赞、分享
4. **多语言**：国际化支持
5. **主题切换**：明暗主题切换

## 维护说明

- 定期更新依赖版本
- 监控页面性能指标
- 收集用户反馈优化体验
- 保持与设计稿的一致性
