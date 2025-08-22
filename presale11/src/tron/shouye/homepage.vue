<template>
  <div class="homepage-container">
    <!-- Header组件 - 固定在顶部 -->
    <Header 
      @back="handleHeaderBack" 
      @launch-click="handleLaunchClick" 
    />

    <!-- 可滚动内容区域 -->
    <div class="content-area">
      <!-- LaunchRWA组件 - 轮播图区域 -->
      <section class="section section-rwa">
        <LaunchRWA
          @menu-click="handleMenuClick"
          @launch-click="handleLaunchClick"
          @detail-click="handleDetailClick"
        />
      </section>

      <!-- Launchpad组件 - 主卡片区域 -->
      <section class="section section-launchpad">
        <Launchpad
          @telegram-click="handleTelegramClick"
          @twitter-click="handleTwitterClick"
          @buy-now-click="handleBuyNowClick"
          @address-copied="handleAddressCopied"
        />
      </section>

      <!-- TokenList组件 - 列表区域 -->
      <section class="section section-list">
        <TokenList @token-click="handleTokenClick" />
      </section>
    </div>
  </div>
</template>

<script>
import Header from '../components/Header.vue'
import LaunchRWA from '../components/LaunchRWA.vue'
import Launchpad from '../components/Launchpad.vue'
import TokenList from '../components/TokenList.vue'

export default {
  name: 'Homepage',
  components: {
    Header,
    LaunchRWA,
    Launchpad,
    TokenList
  },
  methods: {
    // Header组件事件处理
    handleHeaderBack() {
      console.log('Header back clicked')
      // 返回上一页或首页
      this.$router.go(-1)
    },

    // LaunchRWA组件事件处理
    handleMenuClick() {
      console.log('Menu clicked')
      // 处理菜单点击逻辑
    },

    handleLaunchClick() {
      console.log('Launch RWA clicked')
      // 处理Launch RWA按钮点击逻辑
    },

    handleDetailClick() {
      console.log('Detail clicked')
      // 处理详情按钮点击逻辑
    },

    // Launchpad组件事件处理
    handleTelegramClick() {
      console.log('Telegram clicked')
      // 打开Telegram链接
      window.open('https://t.me/your_telegram_channel', '_blank')
    },

    handleTwitterClick() {
      console.log('Twitter clicked')
      // 打开Twitter链接
      window.open('https://twitter.com/your_twitter_account', '_blank')
    },

    handleBuyNowClick() {
      console.log('Buy Now clicked')
      // 处理购买按钮点击逻辑
    },

    handleAddressCopied(address) {
      console.log('Address copied:', address)
      // 显示复制成功提示
      // 这里可以添加Toast提示组件
    },

    // TokenList组件事件处理
    handleTokenClick(token) {
      console.log('Token clicked:', token)
      // 跳转到代币详情页面
      this.$router.push({
        name: 'tokenDetail',
        params: { id: token.id }
      })
    }
  }
}
</script>

<style scoped>
/* 主容器样式 - 精确匹配参考图的375px × 812px移动端布局 */
.homepage-container {
  width: 375px;
  height: 812px;
  margin: 0 auto;
  background: linear-gradient(135deg, #1a0037 0%, #2d00aa 50%, #4a00e0 100%);
  border-radius: 0;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  color: white;
}

/* 可滚动内容区域 - 匹配原型的content-flex结构 */
.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  /* 隐藏滚动条但保持滚动功能 - 匹配原型的hide-scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.content-area::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 组件区域样式 - 精确匹配原型间距 */
.section {
  margin-bottom: 0;
}

.section-rwa {
  /* LaunchRWA组件区域 - 对应原型的轮播图区域 */
  margin-bottom: 16px;
}

.section-launchpad {
  /* Launchpad组件区域 - 对应参考图的主卡片区域 */
  margin-bottom: 12px; /* 减少间距，让布局更紧凑 */
}

.section-list {
  /* TokenList组件区域 - 对应原型的列表区域 */
  margin-bottom: 0;
  flex: 1;
}

/* 深度样式调整 - 精确匹配参考图样式 */
:deep(.header) {
  position: sticky;
  top: 0;
  z-index: 100;
  background: transparent;
}

:deep(.launch-rwa) {
  /* 调整LaunchRWA组件 - 匹配参考图轮播图区域 */
  padding: 0 16px;
  background: transparent;
  min-height: 140px;
}

:deep(.carousel-card) {
  /* 确保轮播图卡片样式匹配参考图 */
  height: 120px;
  border-radius: 12px;
  margin: 0;
}

:deep(.launchpad) {
  /* 调整Launchpad组件 - 匹配参考图主卡片区域 */
  padding: 0 16px;
  background: transparent;
}

:deep(.launchpad-title) {
  text-align: center;
  margin: 0 0 16px 0;
}

:deep(.launchpad-title h2) {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

:deep(.token-list) {
  /* 调整TokenList组件 - 匹配参考图列表区域 */
  padding: 0 16px;
  background: transparent;
  max-width: none;
  margin: 0;
}

/* 响应式设计 - 适配不同移动端设备 */
@media (max-width: 390px) {
  .homepage-container {
    width: 100%;
    max-width: 390px;
    border-radius: 0;
    box-shadow: none;
  }

  :deep(.launch-rwa) {
    padding: 0 12px;
    min-height: 160px;
  }

  :deep(.launchpad) {
    padding: 0 12px;
  }

  :deep(.token-list) {
    padding: 0 12px;
  }
}

@media (max-width: 320px) {
  .homepage-container {
    width: 100%;
    max-width: 320px;
  }

  :deep(.launch-rwa) {
    padding: 0 8px;
    min-height: 140px;
  }

  :deep(.launchpad) {
    padding: 0 8px;
  }

  :deep(.token-list) {
    padding: 0 8px;
  }
}

/* 确保页面在移动端Safari中正常显示 */
@supports (-webkit-touch-callout: none) {
  .homepage-container {
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }
}

/* 桌面端预览模式 - 居中显示 */
@media (min-width: 768px) {
  body {
    background: #0f0c29;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    padding: 20px;
  }
}
</style>
