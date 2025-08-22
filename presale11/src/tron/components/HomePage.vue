<template>
  <div class="home-page">
    <!-- Header组件 -->
    <Header @back="handleHeaderBack" @launch-click="handleLaunchClick" />

    <!-- 页面版心容器，统一对齐与左右内边距 -->
    <div class="page-container">
      <!-- LaunchRWA组件 -->
      <section class="section section-rwa">
        <LaunchRWA
          @menu-click="handleMenuClick"
          @launch-click="handleLaunchClick"
          @detail-click="handleDetailClick"
        />
      </section>

      <!-- Launchpad组件 -->
      <section class="section section-launchpad">
        <Launchpad
          @telegram-click="handleTelegramClick"
          @twitter-click="handleTwitterClick"
          @buy-now-click="handleBuyNowClick"
          @address-copied="handleAddressCopied"
        />
      </section>

      <!-- TokenList组件 -->
      <section class="section section-list">
        <TokenList @token-click="handleTokenClick" />
      </section>
    </div>

  </div>
</template>

<script>
import Header from './Header.vue'
import LaunchRWA from './LaunchRWA.vue'
import Launchpad from './Launchpad.vue'
import TokenList from './TokenList.vue'

export default {
  name: 'HomePage',
  components: {
    Header,
    LaunchRWA,
    Launchpad,
    TokenList
  },
  methods: {
    handleHeaderBack() {
      console.log('Header back clicked')
      // 这里可以添加返回逻辑
    },

    handleMenuClick() {
      console.log('Menu clicked')
      // 这里可以添加菜单逻辑
    },

    handleLaunchClick() {
      console.log('Launch RWA clicked')
      // 这里可以添加Launch逻辑
    },

    handleDetailClick() {
      console.log('Detail clicked')
      // 这里可以添加详情逻辑
    },

    handleTelegramClick() {
      console.log('Telegram clicked')
      // 这里可以添加Telegram链接逻辑
    },

    handleTwitterClick() {
      console.log('Twitter clicked')
      // 这里可以添加Twitter链接逻辑
    },

    handleBuyNowClick() {
      console.log('Buy Now clicked')
      // 这里可以添加购买逻辑
    },

    handleAddressCopied(address) {
      console.log('Address copied:', address)
      // 这里可以添加复制成功提示
    },

    handleTokenClick(token) {
      console.log('Token clicked:', token)
      // TODO: 这里可以跳转或展开详情
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  color: white;
}

.page-info {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  text-align: center;
}

.info-card h2 {
  color: #00d4ff;
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 24px;
}

.info-card p {
  color: #e0e0e0;
  line-height: 1.6;
  margin-bottom: 16px;
}

.info-card ul {
  text-align: left;
  display: inline-block;
  color: #e0e0e0;
}

.info-card li {
  margin-bottom: 8px;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-info {
    padding: 16px;
  }

  .info-card {

/* --- 布局统一：版心、分节与组件内边距收敛 --- */
.page-container {
  width: 100%;
  max-width: 420px; /* 贴近视觉稿手机画布宽度 */
  margin: 0 auto;
  padding: 0 14px; /* 统一左右内边距 */
}
.section { margin-bottom: 18px; }

/* 将子组件内的外层 padding 背景收敛，避免双重留白 */
:deep(.launch-rwa), :deep(.launchpad) {
  padding-left: 0 !important;
  padding-right: 0 !important;
  background: transparent !important;
}
:deep(.launch-rwa) { padding-top: 8px; padding-bottom: 6px; }
:deep(.launchpad) { padding-top: 0; padding-bottom: 0; }

/* 标题对齐与字级（Launchpad） */
:deep(.launchpad-title) { text-align: left; margin: 10px 0 12px; }
:deep(.launchpad-title h2) { font-size: 22px; letter-spacing: 0.4px; text-shadow: none; }

/* 项目卡整体外距与圆角一致 */
:deep(.launchpad .project-card) { border-radius: 16px; margin: 0 0 14px; }

/* TokenList 顶部与 Launchpad 间距协调 */
.section-list { margin-top: 6px; }

/* 防横向滚动 */
.home-page { overflow-x: hidden; }

    padding: 20px;
  }

  .info-card h2 {
    font-size: 20px;
  }
}
</style>
