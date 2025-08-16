<template>
  <div class="token-list">


    <!-- 代币列表 -->
    <div class="tokens-container">
      <!-- 加载状态 -->
      <div v-if="loading && tokens.length === 0" class="loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载代币列表中...</div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-text">{{ error }}</div>
        <button @click="retry" class="retry-btn">重试</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredTokens.length === 0" class="empty-state">
        <div class="empty-icon">🪙</div>
        <div class="empty-text">暂无代币</div>
        <div class="empty-desc">还没有创建任何代币</div>
      </div>

      <!-- 代币列表 -->
      <div v-else class="tokens-grid">
        <div
          v-for="token in filteredTokens"
          :key="token.tokenAddress"
          class="token-card"
          @click="selectToken(token)"
        >
          <!-- 主要内容区域 - 水平布局 -->
          <div class="token-main-content">
            <!-- 左侧：代币图标 -->
            <div class="token-left">
              <img :src="token.icon" :alt="token.tokenSymbol" class="token-icon" />
            </div>

            <!-- 中间：代币信息 -->
            <div class="token-center">
              <div class="token-info">
                <div class="token-name">Name: {{ token.tokenName || 'CHOU' }}</div>
                <div class="token-description">{{ token.description || 'PEPE visits all northern countries and regions.' }}</div>
              </div>
              <div class="token-badge">
                {{ token.tokenSymbol || 'CHOU' }}
              </div>
            </div>

            <!-- 右侧：社交图标和操作 -->
            <div class="token-right">
              <div class="social-icons">
                <button class="social-btn telegram-btn" @click.stop="openTelegram(token)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </button>
                <button class="social-btn twitter-btn" @click.stop="openTwitter(token)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
              </div>
              <button class="close-btn" @click.stop="closeToken(token)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- 进度和市值信息 -->
          <div class="token-progress-section">
            <div class="progress-info">
              <span class="progress-change" :class="{ positive: token.changePercentage >= 0, negative: token.changePercentage < 0 }">
                {{ token.changePercentage >= 0 ? '+' : '' }}{{ token.changePercentage || 208.81 }}%
              </span>
            </div>

            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: (token.progress?.percentage || 30.87) + '%' }"
              ></div>
              <div class="progress-handle"></div>
            </div>

            <div class="market-cap-info">
              <span class="market-cap-label">Marker Cap:</span>
              <span class="market-cap-value">{{ token.marketCap || '3000 TRX' }} ({{ token.progress?.percentage || 30.87 }}%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMoreTokens" class="load-more-section">
        <button 
          @click="loadMore" 
          :disabled="loading"
          class="load-more-btn"
        >
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import tokenListStore from '@/stores/tokenListStore'

export default {
  name: 'TokenList',
  
  data() {
    return {
      searchTimer: null,
  
    }
  },

  computed: {
    // 从store获取状态
    tokens() {
      return tokenListStore.state.tokens
    },
    
    filteredTokens() {
      return tokenListStore.getters.filteredTokens.value
    },
    
    loading() {
      return tokenListStore.state.loading
    },
    
    error() {
      return tokenListStore.state.error
    },
    
    hasMoreTokens() {
      return tokenListStore.getters.hasMoreTokens.value
    },
    
    currentFilter() {
      return tokenListStore.state.filters.status
    }
  },

  async mounted() {
    // 初始化加载代币列表
    await this.loadTokens()
  },

  methods: {
    /**
     * 加载代币列表
     */
    async loadTokens() {
      try {
        await tokenListStore.actions.loadTokens(true)
      } catch (error) {
        console.error('加载代币列表失败:', error)
      }
    },

    /**
     * 加载更多代币
     */
    async loadMore() {
      try {
        await tokenListStore.actions.loadMoreTokens()
      } catch (error) {
        console.error('加载更多代币失败:', error)
      }
    },

    /**
     * 重试加载
     */
    async retry() {
      tokenListStore.actions.clearError()
      await this.loadTokens()
    },


    /**
     * 设置筛选条件
     */
    setFilter(status) {
      tokenListStore.actions.setFilters({ status })
    },

    /**
     * 选择代币
     */
    selectToken(token) {
      tokenListStore.actions.selectToken(token)
      this.$emit('token-selected', token)
    },

    /**
     * 购买代币
     */
    buyToken(token) {
      this.$emit('buy-token', token)
      console.log('购买代币:', token.tokenSymbol)
    },

    /**
     * 查看详情
     */
    viewDetails(token) {
      this.$emit('view-details', token)
      console.log('查看详情:', token.tokenSymbol)
    },

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      const statusMap = {
        'active': '进行中',
        'completed': '已完成',
        'pending': '未开始',
        'unknown': '未知'
      }
      return statusMap[status] || '未知'
    },

    /**
     * 打开Telegram
     */
    openTelegram(token) {
      console.log('打开Telegram:', token.tokenSymbol)
      // 这里可以添加实际的Telegram链接逻辑
      if (token.telegramUrl) {
        window.open(token.telegramUrl, '_blank')
      }
    },

    /**
     * 打开Twitter
     */
    openTwitter(token) {
      console.log('打开Twitter:', token.tokenSymbol)
      // 这里可以添加实际的Twitter链接逻辑
      if (token.twitterUrl) {
        window.open(token.twitterUrl, '_blank')
      }
    },

    /**
     * 关闭代币卡片
     */
    closeToken(token) {
      console.log('关闭代币:', token.tokenSymbol)
      // 这里可以添加隐藏或移除代币的逻辑
      this.$emit('close-token', token)
    },


  }
}
</script>

<style scoped>
.token-list {
  padding: 0;
  background: transparent;
  min-height: auto;
}



.search-box {
  position: relative;
  margin-bottom: 15px;
}


.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.filter-tab {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
  color: rgba(255, 255, 255, 0.8);
}

.filter-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* 代币网格 */
.tokens-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.token-card {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.8) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(15px);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.token-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.token-card:hover {
  transform: translateY(-3px);
  border-color: rgba(102, 126, 234, 0.4);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
}

.token-card:hover::before {
  opacity: 1;
}

/* 主要内容区域 - 水平布局 */
.token-main-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.token-left {
  flex-shrink: 0;
}

.token-center {
  flex: 1;
  min-width: 0;
}

.token-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 代币图标 */
.token-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: cover;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 代币信息 */
.token-info {
  margin-bottom: 8px;
}

.token-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
  line-height: 1.2;
}

.token-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.3;
  margin-bottom: 8px;
}

.token-badge {
  display: inline-block;
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

/* 社交媒体图标 */
.social-icons {
  display: flex;
  gap: 6px;
}

.social-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.telegram-btn {
  background: rgba(0, 136, 204, 0.2);
  color: #0088cc;
  border: 1px solid rgba(0, 136, 204, 0.3);
}

.telegram-btn:hover {
  background: rgba(0, 136, 204, 0.3);
  transform: scale(1.05);
}

.twitter-btn {
  background: rgba(29, 161, 242, 0.2);
  color: #1da1f2;
  border: 1px solid rgba(29, 161, 242, 0.3);
}

.twitter-btn:hover {
  background: rgba(29, 161, 242, 0.3);
  transform: scale(1.05);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: scale(1.05);
}

/* 进度和市值信息区域 */
.token-progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-info {
  flex-shrink: 0;
}

.progress-change {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.progress-change.positive {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.progress-change.negative {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  position: relative;
  overflow: visible;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-handle {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  border: 2px solid #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.market-cap-info {
  flex-shrink: 0;
  text-align: right;
}

.market-cap-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-bottom: 2px;
}

.market-cap-value {
  font-size: 12px;
  font-weight: 600;
  color: white;
}

/* 移除旧的操作按钮样式，现在使用社交媒体图标和关闭按钮 */

/* 状态组件 */
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text, .error-text, .empty-text {
  font-size: 16px;
  color: white;
  margin-bottom: 10px;
}

.empty-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.retry-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-2px);
}

/* 加载更多 */
.load-more-section {
  text-align: center;
  margin-top: 30px;
}

.load-more-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.load-more-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-2px);
}

.load-more-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tokens-grid {
    gap: 10px;
  }

  .token-card {
    padding: 12px;
  }

  .token-main-content {
    gap: 12px;
  }

  .token-icon {
    width: 50px;
    height: 50px;
  }

  .token-name {
    font-size: 13px;
  }

  .token-description {
    font-size: 11px;
  }

  .token-badge {
    font-size: 11px;
    padding: 3px 8px;
  }

  .social-btn, .close-btn {
    width: 28px;
    height: 28px;
  }

  .progress-change {
    font-size: 12px;
    padding: 3px 6px;
  }

  .market-cap-label, .market-cap-value {
    font-size: 11px;
  }

  .token-progress-section {
    gap: 8px;
  }

  .filter-tabs {
    gap: 8px;
  }

  .filter-tab {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
