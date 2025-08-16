<template>
  <div class="mobile-layout">
    <!-- 主内容区域 -->
    <main class="mobile-main">
      <router-view />
    </main>
    
    <!-- 底部导航栏 -->
    <nav v-if="showBottomNav" class="mobile-bottom-nav">
      <router-link 
        v-for="item in navItems" 
        :key="item.name"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActiveRoute(item.path) }"
      >
        <div class="nav-icon">
          <component :is="item.icon" />
        </div>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
    
    <!-- 全局加载状态 -->
    <div v-if="$store.state.loading" class="global-loading">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
    </div>
    
    <!-- 全局提示 -->
    <Transition name="toast">
      <div v-if="$store.state.toast.show" class="global-toast" :class="$store.state.toast.type">
        <div class="toast-content">
          <div class="toast-icon">
            <CheckIcon v-if="$store.state.toast.type === 'success'" />
            <ExclamationIcon v-else-if="$store.state.toast.type === 'warning'" />
            <XCircleIcon v-else-if="$store.state.toast.type === 'error'" />
            <InfoIcon v-else />
          </div>
          <span class="toast-message">{{ $store.state.toast.message }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
// 导入图标组件
import { 
  HomeIcon, 
  RocketLaunchIcon, 
  CurrencyDollarIcon, 
  WalletIcon, 
  UserIcon,
  CheckIcon,
  ExclamationTriangleIcon as ExclamationIcon,
  XCircleIcon,
  InformationCircleIcon as InfoIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'MobileLayout',
  
  components: {
    HomeIcon,
    RocketLaunchIcon,
    CurrencyDollarIcon,
    WalletIcon,
    UserIcon,
    CheckIcon,
    ExclamationIcon,
    XCircleIcon,
    InfoIcon
  },
  
  data() {
    return {
      navItems: [
        {
          name: 'home',
          path: '/mobile/home',
          label: '首页',
          icon: 'HomeIcon'
        },
        {
          name: 'launch',
          path: '/mobile/launch',
          label: '发射',
          icon: 'RocketLaunchIcon'
        },
        {
          name: 'tokens',
          path: '/mobile/tokens',
          label: '代币',
          icon: 'CurrencyDollarIcon'
        },
        {
          name: 'wallet',
          path: '/mobile/wallet',
          label: '钱包',
          icon: 'WalletIcon'
        },
        {
          name: 'profile',
          path: '/mobile/profile',
          label: '我的',
          icon: 'UserIcon'
        }
      ]
    }
  },
  
  computed: {
    showBottomNav() {
      // 在某些页面隐藏底部导航
      const hideNavRoutes = [
        'MobileTokenLaunch',
        'MobileTokenDetail',
        'MobilePresaleDetail'
      ]
      return !hideNavRoutes.includes(this.$route.name)
    }
  },
  
  methods: {
    isActiveRoute(path) {
      return this.$route.path.startsWith(path)
    }
  },
  
  mounted() {
    // 设置移动端视口
    this.setupMobileViewport()
    
    // 监听屏幕方向变化
    this.setupOrientationChange()
  },
  
  methods: {
    setupMobileViewport() {
      // 设置视口元标签
      let viewport = document.querySelector('meta[name=viewport]')
      if (!viewport) {
        viewport = document.createElement('meta')
        viewport.name = 'viewport'
        document.head.appendChild(viewport)
      }
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      
      // 设置状态栏样式
      let statusBar = document.querySelector('meta[name=apple-mobile-web-app-status-bar-style]')
      if (!statusBar) {
        statusBar = document.createElement('meta')
        statusBar.name = 'apple-mobile-web-app-status-bar-style'
        document.head.appendChild(statusBar)
      }
      statusBar.content = 'black-translucent'
    },
    
    setupOrientationChange() {
      // 监听屏幕方向变化
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          // 重新计算视口高度
          this.updateViewportHeight()
        }, 100)
      })
      
      // 初始设置
      this.updateViewportHeight()
    },
    
    updateViewportHeight() {
      // 设置 CSS 自定义属性用于处理移动端视口高度
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
  }
}
</script>

<style scoped>
.mobile-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: calc(var(--vh, 1vh) * 100);
  background: #000000;
  color: #ffffff;
  overflow-x: hidden;
}

.mobile-main {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 底部导航栏 */
.mobile-bottom-nav {
  display: flex;
  background: #1a1a1a;
  border-top: 1px solid #333333;
  padding: 8px 0;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  position: sticky;
  bottom: 0;
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  text-decoration: none;
  color: #666666;
  transition: color 0.3s ease;
}

.nav-item.active {
  color: #8B5CF6;
}

.nav-item:hover {
  color: #8B5CF6;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
}

.nav-label {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

/* 全局加载状态 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner .spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333333;
  border-top: 3px solid #8B5CF6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 全局提示 */
.global-toast {
  position: fixed;
  top: 60px;
  left: 20px;
  right: 20px;
  background: #1a1a1a;
  border: 1px solid #333333;
  border-radius: 12px;
  padding: 16px;
  z-index: 9998;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.global-toast.success {
  border-color: #10B981;
  background: rgba(16, 185, 129, 0.1);
}

.global-toast.warning {
  border-color: #F59E0B;
  background: rgba(245, 158, 11, 0.1);
}

.global-toast.error {
  border-color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
}

.global-toast.info {
  border-color: #3B82F6;
  background: rgba(59, 130, 246, 0.1);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-icon svg {
  width: 100%;
  height: 100%;
}

.global-toast.success .toast-icon {
  color: #10B981;
}

.global-toast.warning .toast-icon {
  color: #F59E0B;
}

.global-toast.error .toast-icon {
  color: #EF4444;
}

.global-toast.info .toast-icon {
  color: #3B82F6;
}

.toast-message {
  font-size: 14px;
  color: #ffffff;
  line-height: 1.4;
}

/* 提示动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 安全区域适配 */
@supports (padding: max(0px)) {
  .mobile-layout {
    padding-top: env(safe-area-inset-top);
  }
}

/* 响应式调整 */
@media (max-width: 375px) {
  .nav-label {
    font-size: 11px;
  }
  
  .nav-icon {
    width: 20px;
    height: 20px;
  }
  
  .global-toast {
    left: 16px;
    right: 16px;
    top: 50px;
  }
}

/* 横屏适配 */
@media (orientation: landscape) and (max-height: 500px) {
  .mobile-bottom-nav {
    padding: 4px 0;
  }
  
  .nav-item {
    padding: 4px 2px;
  }
  
  .nav-icon {
    width: 20px;
    height: 20px;
    margin-bottom: 2px;
  }
  
  .nav-label {
    font-size: 10px;
  }
}
</style>
