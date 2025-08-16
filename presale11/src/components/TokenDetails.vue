<template>
  <div class="token-details-modal" v-if="visible" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- 模态框头部 -->
      <div class="modal-header">
        <div class="token-title">
          <img :src="token.icon" :alt="token.tokenSymbol" class="token-icon" />
          <div class="title-info">
            <h2 class="token-name">{{ token.tokenName }}</h2>
            <p class="token-symbol">{{ token.tokenSymbol }}</p>
          </div>
        </div>
        <button @click="closeModal" class="close-btn">×</button>
      </div>

      <!-- 代币基本信息 -->
      <div class="token-basic-info">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">代币地址</div>
            <div class="info-value address" @click="copyAddress(token.tokenAddress)">
              {{ formatAddress(token.tokenAddress) }}
              <span class="copy-icon">📋</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">预售地址</div>
            <div class="info-value address" @click="copyAddress(token.presaleAddress)">
              {{ formatAddress(token.presaleAddress) }}
              <span class="copy-icon">📋</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">总供应量</div>
            <div class="info-value">{{ token.totalSupplyFormatted }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">创建者</div>
            <div class="info-value address" @click="copyAddress(token.creator)">
              {{ formatAddress(token.creator) }}
              <span class="copy-icon">📋</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">创建时间</div>
            <div class="info-value">{{ token.createdAtFormatted }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">状态</div>
            <div class="info-value">
              <span :class="['status-badge', token.status]">
                {{ getStatusText(token.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 预售信息 -->
      <div v-if="token.presale" class="presale-section">
        <h3 class="section-title">预售信息</h3>
        
        <!-- 价格信息 -->
        <div class="price-info">
          <div class="price-card">
            <div class="price-label">预售价格</div>
            <div class="price-value">{{ token.presale.preSaleEthAmountFormatted }} TRX</div>
          </div>
          <div class="price-card" v-if="token.presale.tokenPrice">
            <div class="price-label">市场价格</div>
            <div class="price-value">{{ formatPrice(token.presale.tokenPrice) }} TRX</div>
          </div>
        </div>

        <!-- 进度信息 -->
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-title">预售进度</span>
            <span class="progress-percentage">{{ token.progress.percentage }}%</span>
          </div>
          
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: token.progress.percentage + '%' }"
            ></div>
          </div>
          
          <div class="progress-stats">
            <div class="stat">
              <span class="stat-label">已售出</span>
              <span class="stat-value">{{ token.progress.current }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">总量</span>
              <span class="stat-value">{{ token.progress.total }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">剩余</span>
              <span class="stat-value">{{ token.progress.total - token.progress.current }}</span>
            </div>
          </div>
        </div>

        <!-- 预售详细数据 -->
        <div class="presale-details">
          <div class="detail-grid">
            <div class="detail-item" v-if="token.presale.preSaleMaxNum">
              <div class="detail-label">最大购买量</div>
              <div class="detail-value">{{ token.presale.preSaleMaxNum }}</div>
            </div>
            <div class="detail-item" v-if="token.presale.coinAmount">
              <div class="detail-label">每TRX获得代币</div>
              <div class="detail-value">{{ token.presale.coinAmount }}</div>
            </div>
            <div class="detail-item" v-if="token.presale.nowStage">
              <div class="detail-label">当前阶段</div>
              <div class="detail-value">{{ token.presale.nowStage }}</div>
            </div>
            <div class="detail-item" v-if="token.presale.stageUnlockRate">
              <div class="detail-label">解锁比例</div>
              <div class="detail-value">{{ token.presale.stageUnlockRate / 10 }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 购买区域 -->
      <div v-if="token.status === 'active'" class="purchase-section">
        <h3 class="section-title">参与预售</h3>
        
        <div class="purchase-form">
          <div class="amount-input">
            <label class="input-label">购买数量</label>
            <div class="input-group">
              <button @click="decreaseAmount" class="amount-btn">-</button>
              <input 
                v-model="purchaseAmount" 
                type="number" 
                min="1" 
                :max="maxPurchaseAmount"
                class="amount-field"
                @input="validateAmount"
              />
              <button @click="increaseAmount" class="amount-btn">+</button>
            </div>
            <div class="amount-info">
              <span>需要支付: {{ calculateTotalCost }} TRX</span>
            </div>
          </div>

          <div class="balance-info">
            <div class="balance-item">
              <span class="balance-label">钱包余额:</span>
              <span class="balance-value">{{ walletBalance }} TRX</span>
            </div>
          </div>

          <button 
            @click="handlePurchase"
            :disabled="!canPurchase"
            class="purchase-btn"
          >
            {{ purchaseButtonText }}
          </button>
        </div>
      </div>

      <!-- 其他状态的提示 -->
      <div v-else class="status-section">
        <div class="status-message">
          <div v-if="token.status === 'pending'" class="pending-message">
            <div class="status-icon">⏳</div>
            <div class="status-text">预售尚未开始</div>
            <div class="status-desc">请等待预售开始时间</div>
          </div>
          
          <div v-else-if="token.status === 'completed'" class="completed-message">
            <div class="status-icon">✅</div>
            <div class="status-text">预售已结束</div>
            <div class="status-desc">该代币预售已成功完成</div>
          </div>
          
          <div v-else class="unknown-message">
            <div class="status-icon">❓</div>
            <div class="status-text">状态未知</div>
            <div class="status-desc">请稍后重试或联系客服</div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button @click="viewOnExplorer" class="explorer-btn">
          在区块浏览器中查看
        </button>
        <button @click="refreshData" class="refresh-btn" :disabled="refreshing">
          {{ refreshing ? '刷新中...' : '刷新数据' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Toast } from 'vant'
import { smartFormatAddress, formatAddressDisplay } from '@/utils/addressFormatter'

export default {
  name: 'TokenDetails',
  
  props: {
    token: {
      type: Object,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    walletBalance: {
      type: [String, Number],
      default: 0
    }
  },

  data() {
    return {
      purchaseAmount: 1,
      refreshing: false
    }
  },

  computed: {
    /**
     * 最大购买数量
     */
    maxPurchaseAmount() {
      if (!this.token.presale) return 1
      return Math.min(
        this.token.presale.preSaleMaxNum || 999999,
        this.token.progress.total - this.token.progress.current
      )
    },

    /**
     * 计算总费用
     */
    calculateTotalCost() {
      if (!this.token.presale) return 0
      const price = parseFloat(this.token.presale.preSaleEthAmountFormatted) || 0
      return (price * this.purchaseAmount).toFixed(6)
    },

    /**
     * 是否可以购买
     */
    canPurchase() {
      if (this.token.status !== 'active') return false
      if (this.purchaseAmount <= 0) return false
      if (this.purchaseAmount > this.maxPurchaseAmount) return false
      
      const totalCost = parseFloat(this.calculateTotalCost)
      const balance = parseFloat(this.walletBalance)
      
      return totalCost <= balance
    },

    /**
     * 购买按钮文本
     */
    purchaseButtonText() {
      if (this.token.status !== 'active') return '预售未开始'
      if (this.purchaseAmount <= 0) return '请输入购买数量'
      if (this.purchaseAmount > this.maxPurchaseAmount) return '超出最大购买量'
      
      const totalCost = parseFloat(this.calculateTotalCost)
      const balance = parseFloat(this.walletBalance)
      
      if (totalCost > balance) return '余额不足'
      
      return `购买 ${this.purchaseAmount} 个`
    }
  },

  methods: {
    /**
     * 关闭模态框
     */
    closeModal() {
      this.$emit('close')
    },

    /**
     * 格式化地址
     */
    formatAddress(address) {
      if (!address) return ''
      // 使用地址格式化工具，确保显示Base58格式
      return formatAddressDisplay(smartFormatAddress(address), 6, 4)
    },

    /**
     * 复制地址
     */
    async copyAddress(address) {
      try {
        // 复制完整的Base58地址
        const fullAddress = smartFormatAddress(address)
        await navigator.clipboard.writeText(fullAddress)
        Toast('地址已复制到剪贴板')
      } catch (error) {
        console.error('复制失败:', error)
        Toast('复制失败')
      }
    },

    /**
     * 格式化价格
     */
    formatPrice(price) {
      if (!price) return '0'
      return parseFloat(price).toFixed(6)
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
     * 增加购买数量
     */
    increaseAmount() {
      if (this.purchaseAmount < this.maxPurchaseAmount) {
        this.purchaseAmount++
      }
    },

    /**
     * 减少购买数量
     */
    decreaseAmount() {
      if (this.purchaseAmount > 1) {
        this.purchaseAmount--
      }
    },

    /**
     * 验证购买数量
     */
    validateAmount() {
      if (this.purchaseAmount < 1) {
        this.purchaseAmount = 1
      } else if (this.purchaseAmount > this.maxPurchaseAmount) {
        this.purchaseAmount = this.maxPurchaseAmount
      }
    },

    /**
     * 处理购买
     */
    handlePurchase() {
      if (!this.canPurchase) return

      this.$emit('purchase', {
        token: this.token,
        amount: this.purchaseAmount,
        totalCost: this.calculateTotalCost
      })
    },

    /**
     * 在区块浏览器中查看
     */
    viewOnExplorer() {
      const explorerUrl = `https://nile.tronscan.org/#/token20/${this.token.tokenAddress}`
      window.open(explorerUrl, '_blank')
    },

    /**
     * 刷新数据
     */
    async refreshData() {
      this.refreshing = true
      try {
        this.$emit('refresh', this.token)
        await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟刷新延迟
      } finally {
        this.refreshing = false
      }
    }
  }
}
</script>

<style scoped>
.token-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  color: white;
}

/* 模态框头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.token-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.token-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.token-name {
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin: 0;
}

.token-symbol {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 5px 0 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  padding: 5px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* 基本信息 */
.token-basic-info {
  padding: 0 20px 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: white;
  font-weight: 500;
}

.info-value.address {
  cursor: pointer;
  color: #4ade80;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s;
}

.info-value.address:hover {
  color: #22c55e;
}

.copy-icon {
  font-size: 14px;
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.3s;
}

.copy-icon:hover {
  opacity: 1;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
  backdrop-filter: blur(10px);
}

.status-badge.active {
  background: #e8f5e8;
  color: #28a745;
}

.status-badge.completed {
  background: #e8e8e8;
  color: #666;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

/* 预售信息 */
.presale-section {
  padding: 0 20px 20px;
  border-top: 1px solid #f0f0f0;
  margin-top: 20px;
  padding-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 15px;
}

.price-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.price-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
}

.price-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.price-value {
  font-size: 16px;
  font-weight: bold;
  color: #007bff;
}

/* 进度条样式 */
.progress-section {
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.progress-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.progress-percentage {
  font-size: 14px;
  font-weight: bold;
  color: #007bff;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s;
}

.progress-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.stat {
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #666;
  display: block;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

/* 预售详细数据 */
.presale-details {
  margin-top: 15px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-label {
  font-size: 12px;
  color: #666;
}

.detail-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 购买区域 */
.purchase-section {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  background: #f8f9fa;
}

.purchase-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.amount-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.input-group {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.amount-btn {
  background: #f8f9fa;
  border: none;
  padding: 12px 15px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  color: #007bff;
}

.amount-btn:hover {
  background: #e9ecef;
}

.amount-field {
  flex: 1;
  border: none;
  padding: 12px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
}

.amount-info {
  font-size: 14px;
  color: #666;
  text-align: center;
}

.balance-info {
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.balance-item {
  display: flex;
  justify-content: space-between;
}

.balance-label {
  font-size: 14px;
  color: #666;
}

.balance-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.purchase-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.purchase-btn:hover:not(:disabled) {
  background: #0056b3;
}

.purchase-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 状态区域 */
.status-section {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.status-message {
  text-align: center;
  padding: 30px 20px;
}

.status-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.status-text {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.status-desc {
  font-size: 14px;
  color: #666;
}

/* 操作按钮 */
.action-buttons {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
}

.explorer-btn, .refresh-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.explorer-btn:hover, .refresh-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #007bff;
  color: #007bff;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .info-grid, .price-info, .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .progress-stats {
    grid-template-columns: 1fr;
    gap: 5px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
