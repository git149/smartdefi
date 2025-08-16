# 移动端代币创建组件集成指南

## 概述

本文档介绍如何将新创建的移动端代币创建组件 `MobileTokenCreator.vue` 集成到现有的 TRON 代币发射平台中。

## 文件结构

```
src/tron/
├── components/
│   ├── MobileTokenCreator.vue      # 移动端代币创建组件
│   └── TokenCreator.vue            # 现有桌面端组件
├── views/
│   ├── MobileTokenLaunch.vue       # 移动端代币发射页面
│   └── ...
├── layouts/
│   └── MobileLayout.vue            # 移动端布局组件
├── router/
│   └── mobile.js                   # 移动端路由配置
└── ...
```

## 组件特性

### MobileTokenCreator.vue

- **响应式设计**: 专为移动设备优化的界面
- **两步骤流程**: Token details → LGE information
- **深色主题**: 黑色背景配紫色渐变按钮
- **步骤指示器**: 顶部圆点进度条
- **表单验证**: 实时字符计数和验证
- **文件上传**: Logo 图片上传功能
- **预设选择**: 代币经济学预设下拉选择

### 主要功能

1. **Logo 上传**
   - 支持 JPEG/PNG/WEBP/GIF 格式
   - 文件大小限制 4MB
   - 实时预览功能

2. **代币信息输入**
   - 代币名称 (最多20字符)
   - 代币符号 (最多10字符)
   - 总供应量
   - 代币描述 (最多256字符)

3. **社交媒体链接**
   - 网站 URL (可选)
   - Telegram 链接 (可选)
   - Twitter 链接 (可选)

4. **代币经济学预设**
   - 预定义的税收结构
   - 买入/卖出税率显示
   - 下拉选择界面

## 集成步骤

### 1. 安装依赖

确保项目中已安装以下依赖：

```bash
npm install @heroicons/vue
```

### 2. 路由配置

在主路由文件中添加移动端路由：

```javascript
// src/router/index.js
import { mobileRoutes, setupMobileRedirect } from '@/tron/router/mobile.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...existingRoutes,
    ...mobileRoutes
  ]
})

// 设置移动端自动重定向
setupMobileRedirect(router)

export default router
```

### 3. 状态管理

如果使用 Vuex/Pinia，确保有以下状态：

```javascript
// store/modules/ui.js
export default {
  state: {
    loading: false,
    toast: {
      show: false,
      type: 'info', // success, warning, error, info
      message: ''
    }
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SHOW_TOAST(state, { type, message }) {
      state.toast = { show: true, type, message }
      setTimeout(() => {
        state.toast.show = false
      }, 3000)
    }
  }
}
```

### 4. 样式配置

在全局样式中添加移动端基础样式：

```css
/* src/styles/mobile.css */
:root {
  --vh: 1vh;
}

* {
  -webkit-tap-highlight-color: transparent;
}

body {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

input, textarea {
  -webkit-user-select: text;
  user-select: text;
}
```

### 5. 与现有 TokenCreator 集成

复用现有的代币创建逻辑：

```javascript
// src/tron/services/tokenService.js
export class TokenService {
  static async createToken(tokenData) {
    // 复用现有的代币创建逻辑
    // 从 TokenCreator.vue 中提取的方法
  }
  
  static async uploadLogo(file) {
    // 复用现有的 IPFS 上传逻辑
  }
  
  static async deployContract(params) {
    // 复用现有的合约部署逻辑
  }
}
```

## 使用示例

### 基本使用

```vue
<template>
  <div class="app">
    <!-- 桌面端 -->
    <TokenCreator v-if="!isMobile" />
    
    <!-- 移动端 -->
    <MobileTokenCreator 
      v-if="isMobile"
      @create-token="handleCreateToken"
      @back="handleBack"
    />
  </div>
</template>

<script>
import TokenCreator from '@/tron/components/TokenCreator.vue'
import MobileTokenCreator from '@/tron/components/MobileTokenCreator.vue'

export default {
  components: {
    TokenCreator,
    MobileTokenCreator
  },
  
  computed: {
    isMobile() {
      return window.innerWidth <= 768
    }
  },
  
  methods: {
    async handleCreateToken(tokenData) {
      try {
        const result = await this.$tokenService.createToken(tokenData)
        this.$store.commit('SHOW_TOAST', {
          type: 'success',
          message: 'Token created successfully!'
        })
      } catch (error) {
        this.$store.commit('SHOW_TOAST', {
          type: 'error',
          message: error.message
        })
      }
    },
    
    handleBack() {
      this.$router.go(-1)
    }
  }
}
</script>
```

### 在路由中使用

```javascript
// src/router/index.js
{
  path: '/launch',
  name: 'TokenLaunch',
  component: () => {
    // 根据设备类型动态加载组件
    if (window.innerWidth <= 768) {
      return import('@/tron/views/MobileTokenLaunch.vue')
    } else {
      return import('@/tron/views/TokenLaunch.vue')
    }
  }
}
```

## 自定义配置

### 主题定制

可以通过 CSS 变量自定义主题：

```css
:root {
  --mobile-primary-color: #8B5CF6;
  --mobile-background-color: #000000;
  --mobile-surface-color: #1a1a1a;
  --mobile-text-color: #ffffff;
  --mobile-text-secondary: #666666;
  --mobile-border-color: #333333;
}
```

### 预设配置

在组件中自定义代币经济学预设：

```javascript
// 在 MobileTokenCreator.vue 的 data 中
presets: [
  {
    id: 'meme',
    name: 'Meme Category',
    description: 'Memes Tax',
    buyTax: 0.5,
    sellTax: 0.5
  },
  {
    id: 'defi',
    name: 'DeFi Category',
    description: 'DeFi Tax',
    buyTax: 1.0,
    sellTax: 1.0
  },
  // 添加更多预设...
]
```

## 注意事项

1. **性能优化**: 移动端组件已针对触摸交互和性能进行优化
2. **兼容性**: 支持 iOS Safari 和 Android Chrome
3. **安全区域**: 已适配 iPhone 刘海屏和底部安全区域
4. **网络处理**: 建议添加网络状态检测和离线提示
5. **错误处理**: 确保所有异步操作都有适当的错误处理

## 测试建议

1. **设备测试**: 在真实移动设备上测试
2. **网络测试**: 测试慢网络和离线情况
3. **表单验证**: 测试所有输入验证逻辑
4. **文件上传**: 测试不同格式和大小的图片上传
5. **横竖屏**: 测试屏幕方向变化

## 后续优化

1. **PWA 支持**: 添加 Service Worker 和离线功能
2. **手势支持**: 添加滑动手势导航
3. **动画优化**: 添加更流畅的页面转场动画
4. **无障碍**: 改进屏幕阅读器支持
5. **国际化**: 添加多语言支持
