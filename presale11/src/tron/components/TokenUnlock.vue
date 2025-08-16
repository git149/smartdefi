<template>
  <div class="token-unlock">
    <!-- 页面标题 -->
    <div class="header">
      <h1 class="title">代币解锁</h1>
      <p class="subtitle">查看和解锁您的预售代币</p>
    </div>

    <!-- 钱包连接状态 -->
    <div v-if="!isWalletConnected" class="wallet-prompt">
      <div class="prompt-card">
        <div class="prompt-icon">🔗</div>
        <h3>请连接钱包</h3>
        <p>需要连接TronLink钱包来查看解锁信息</p>
        <button @click="connectWallet" class="connect-btn">连接钱包</button>
      </div>
    </div>

    <!-- 主要内容 -->
    <div v-else class="main-content">
      <!-- 解锁概览卡片 -->
      <div class="overview-card">
        <div class="card-header">
          <h3>解锁概览</h3>
          <button @click="refreshData" class="refresh-btn" :disabled="loading">
            <span class="refresh-icon" :class="{ spinning: loading }">🔄</span>
          </button>
        </div>

        <div class="overview-grid">
          <div class="overview-item">
            <div class="item-label">总购买数量</div>
            <div class="item-value">{{ formatNumber(unlockProgress.totalPurchased) }}</div>
          </div>
          <div class="overview-item">
            <div class="item-label">已解锁数量</div>
            <div class="item-value">{{ formatNumber(unlockProgress.alreadyUnlocked) }}</div>
          </div>
          <div class="overview-item">
            <div class="item-label">待解锁数量</div>
            <div class="item-value">{{ formatNumber(unlockProgress.remainingToUnlock) }}</div>
          </div>
          <div class="overview-item">
            <div class="item-label">解锁进度</div>
            <div class="item-value">{{ unlockProgress.unlockProgress.toFixed(1) }}%</div>
          </div>
        </div>

        <!-- 解锁进度条 -->
        <div class="progress-section">
          <div class="progress-label">
            <span>解锁进度</span>
            <span>{{ formatNumber(unlockProgress.alreadyUnlocked) }} / {{ formatNumber(unlockProgress.totalPurchased) }}</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: unlockProgress.unlockProgress + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 解锁操作卡片 -->
      <div class="action-card">
        <div class="card-header">
          <h3>解锁操作</h3>
        </div>

        <!-- 解锁状态检查 -->
        <div v-if="!unlockEligibility.canUnlock" class="unlock-blocked">
          <div class="warning-icon">⚠️</div>
          <p>{{ unlockEligibility.reason }}</p>
        </div>

        <!-- 解锁操作 -->
        <div v-else class="unlock-actions">
          <div class="unlock-info">
            <div class="info-row">
              <span>当前阶段:</span>
              <span>第 {{ unlockProgress.currentStage }} 阶段</span>
            </div>
            <div class="info-row">
              <span>阶段解锁率:</span>
              <span>{{ unlockProgress.stageUnlockRate }}%</span>
            </div>
            <div class="info-row">
              <span>本阶段可解锁:</span>
              <span>{{ formatNumber(unlockProgress.currentStageUnlockable - unlockProgress.alreadyUnlocked) }} 代币</span>
            </div>
          </div>

          <button 
            @click="unlockTokens" 
            class="unlock-btn"
            :disabled="loading"
          >
            <span class="btn-icon">🔓</span>
            解锁代币
          </button>
        </div>
      </div>

      <!-- 解锁历史卡片 -->
      <div class="history-card">
        <div class="card-header">
          <h3>解锁历史</h3>
        </div>
        <div class="history-list">
          <div v-if="unlockHistory.length === 0" class="no-history">
            暂无解锁记录
          </div>
          <div 
            v-for="(record, index) in unlockHistory" 
            :key="index"
            class="history-item"
          >
            <div class="history-time">{{ record.time }}</div>
            <div class="history-amount">解锁 {{ formatNumber(record.amount) }} 代币</div>
            <div class="history-status" :class="record.success ? 'success' : 'failed'">
              {{ record.success ? '成功' : '失败' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载遮罩 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>{{ loadingText }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TokenUnlock',
  data() {
    return {
      // 基本状态
      isWalletConnected: false,
      walletAddress: '',
      presaleAddress: '',
      
      // 解锁数据
      unlockProgress: {
        totalPurchased: 0,
        alreadyUnlocked: 0,
        remainingToUnlock: 0,
        currentStageUnlockable: 0,
        unlockProgress: 0,
        currentStage: 0,
        userStage: 0,
        stageUnlockRate: 0
      },
      
      unlockEligibility: {
        canUnlock: false,
        reason: null
      },
      
      // UI状态
      loading: false,
      loadingText: '',
      
      // 解锁历史
      unlockHistory: []
    }
  },

  async mounted() {
    await this.initializeUnlock()
  },

  methods: {
    // 初始化解锁组件
    async initializeUnlock() {
      try {
        // 从URL参数获取预售地址
        const urlParams = new URLSearchParams(window.location.search)
        this.presaleAddress = urlParams.get('presale')
        
        if (!this.presaleAddress) {
          alert('缺少预售合约地址参数')
          return
        }

        // 检查钱包连接
        await this.checkWalletConnection()
        
        if (this.isWalletConnected) {
          await this.loadUnlockData()
        }
      } catch (error) {
        console.error('❌ 初始化解锁组件失败:', error)
      }
    },

    // 检查钱包连接
    async checkWalletConnection() {
      try {
        if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
          this.isWalletConnected = true
          this.walletAddress = window.tronWeb.defaultAddress.base58
          console.log('🔗 钱包已连接:', this.walletAddress)
        }
      } catch (error) {
        console.error('❌ 检查钱包连接失败:', error)
      }
    },

    // 连接钱包
    async connectWallet() {
      try {
        if (!window.tronWeb) {
          alert('请安装TronLink钱包')
          return
        }

        await new Promise(resolve => setTimeout(resolve, 1000))
        await this.checkWalletConnection()
        
        if (this.isWalletConnected) {
          await this.loadUnlockData()
        }
      } catch (error) {
        console.error('❌ 连接钱包失败:', error)
        alert('连接钱包失败: ' + error.message)
      }
    },

    // 加载解锁数据
    async loadUnlockData() {
      try {
        this.loading = true
        this.loadingText = '加载解锁信息...'

        // 导入预售服务
        const { default: PresaleService } = await import('../services/PresaleService')
        const presaleService = new PresaleService(this.presaleAddress)

        // 获取解锁进度
        this.unlockProgress = await presaleService.getUnlockProgress(this.walletAddress)
        
        // 检查解锁资格
        this.unlockEligibility = await presaleService.checkUnlockEligibility(this.walletAddress)
        
        console.log('📊 解锁数据加载完成:', {
          progress: this.unlockProgress,
          eligibility: this.unlockEligibility
        })
      } catch (error) {
        console.error('❌ 加载解锁数据失败:', error)
        alert('加载解锁数据失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    // 刷新数据
    async refreshData() {
      await this.loadUnlockData()
    },

    // 解锁代币
    async unlockTokens() {
      if (!confirm('确定要解锁代币吗？')) return

      try {
        this.loading = true
        this.loadingText = '解锁代币中...'

        const { default: PresaleService } = await import('../services/PresaleService')
        const presaleService = new PresaleService(this.presaleAddress)

        const result = await presaleService.unlockTokens()
        
        // 记录解锁历史
        this.addUnlockHistory(
          this.unlockProgress.currentStageUnlockable - this.unlockProgress.alreadyUnlocked,
          true
        )
        
        // 刷新数据
        await this.loadUnlockData()
        
        alert('代币解锁成功！')
      } catch (error) {
        console.error('❌ 解锁代币失败:', error)
        this.addUnlockHistory(0, false)
        alert('解锁代币失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    // 添加解锁历史
    addUnlockHistory(amount, success) {
      const record = {
        time: new Date().toLocaleString(),
        amount,
        success
      }
      this.unlockHistory.unshift(record)
      
      // 只保留最近10条记录
      if (this.unlockHistory.length > 10) {
        this.unlockHistory = this.unlockHistory.slice(0, 10)
      }
    },

    // 格式化数字
    formatNumber(num) {
      if (!num) return '0'
      return Number(num).toLocaleString()
    }
  }
}
</script>

<style scoped>
.token-unlock {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 页面标题 */
.header {
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

/* 钱包连接提示 */
.wallet-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.prompt-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 400px;
  width: 100%;
}

.prompt-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.prompt-card h3 {
  font-size: 1.5rem;
  margin: 0 0 10px 0;
  color: #333;
}

.prompt-card p {
  color: #666;
  margin: 0 0 30px 0;
  line-height: 1.5;
}

.connect-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.connect-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

/* 主要内容 */
.main-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 卡片通用样式 */
.overview-card, .action-card, .history-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.card-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

/* 刷新按钮 */
.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: #f0f0f0;
}

.refresh-icon {
  font-size: 1.2rem;
  display: inline-block;
  transition: transform 0.5s ease;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 概览网格 */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.overview-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.item-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.item-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

/* 进度条 */
.progress-section {
  margin-top: 20px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.progress-bar {
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #28a745, #20c997);
  border-radius: 6px;
  transition: width 0.5s ease;
}

/* 解锁操作 */
.unlock-blocked {
  text-align: center;
  padding: 30px;
  color: #856404;
}

.warning-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.unlock-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.unlock-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row span:first-child {
  color: #666;
}

.info-row span:last-child {
  font-weight: 600;
  color: #333;
}

.unlock-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.unlock-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(40, 167, 69, 0.3);
}

.unlock-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-icon {
  font-size: 1.2rem;
}

/* 解锁历史 */
.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.no-history {
  text-align: center;
  color: #6c757d;
  padding: 30px;
  font-style: italic;
}

.history-item {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
}

.history-item:last-child {
  border-bottom: none;
}

.history-time {
  font-size: 0.85rem;
  color: #6c757d;
}

.history-amount {
  font-weight: 500;
  color: #333;
}

.history-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
}

.history-status.success {
  background: #d4edda;
  color: #155724;
}

.history-status.failed {
  background: #f8d7da;
  color: #721c24;
}

/* 加载遮罩 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.loading-spinner p {
  margin: 0;
  color: #333;
  font-weight: 500;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .token-unlock {
    padding: 15px;
  }

  .title {
    font-size: 2rem;
  }

  .overview-card, .action-card, .history-card {
    padding: 20px;
  }

  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .history-item {
    grid-template-columns: 1fr;
    gap: 8px;
    text-align: center;
  }
}
</style>
