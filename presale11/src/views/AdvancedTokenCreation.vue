<template>
  <div class="advanced-token-creation">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1>RWAunion</h1>
      </div>
    </div>

    <!-- 进度指示器 -->
    <div class="progress-indicator">
      <div class="progress-steps">
        <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <div class="step-number">1</div>
          <div class="step-label">Fee Settings</div>
        </div>
        <div class="step-connector" :class="{ active: currentStep > 1 }"></div>
        <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <div class="step-number">2</div>
          <div class="step-label">Presale Info</div>
        </div>
        <div class="step-connector" :class="{ active: currentStep > 2 }"></div>
        <div class="step" :class="{ active: currentStep >= 3 }">
          <div class="step-number">3</div>
          <div class="step-label">Create Token</div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>{{ getStepTitle() }}</h1>
        <p class="step-description">{{ getStepDescription() }}</p>
      </div>

      <!-- 步骤内容 -->
      <div class="layout-container">
        <!-- 主表单区域 -->
        <section class="main-column">
          <!-- 第一步：手续费设置 -->
          <div v-if="currentStep === 1" class="config-section">
            <h3>Transaction Fees</h3>
            
            <!-- 买入手续费 -->
            <div class="form-group">
              <label class="form-label">
                Buy Fee (%) *
                <span class="range-hint">0 - 25%</span>
              </label>
              <input
                v-model="feeSettings.buyFee"
                type="number"
                min="0"
                max="25"
                step="0.1"
                placeholder="0.5"
                class="form-input"
                :class="{ error: validationErrors.buyFee }"
                @input="validateBuyFee"
                @blur="validateBuyFee"
              />
              <small v-if="validationErrors.buyFee" class="error-text">{{ validationErrors.buyFee }}</small>
            </div>

            <!-- 卖出手续费 -->
            <div class="form-group">
              <label class="form-label">
                Sell Fee (%) *
                <span class="range-hint">0 - 25%</span>
              </label>
              <input
                v-model="feeSettings.sellFee"
                type="number"
                min="0"
                max="25"
                step="0.1"
                placeholder="0.5"
                class="form-input"
                :class="{ error: validationErrors.sellFee }"
                @input="validateSellFee"
                @blur="validateSellFee"
              />
              <small v-if="validationErrors.sellFee" class="error-text">{{ validationErrors.sellFee }}</small>
            </div>

            <!-- 手续费接收地址 -->
            <div class="form-group">
              <label class="form-label">Fee Recipient Address *</label>
              <input
                v-model="feeSettings.feeRecipient"
                type="text"
                placeholder="TRON address"
                class="form-input"
                :class="{ error: validationErrors.feeRecipient }"
                @blur="validateFeeRecipient"
              />
              <small v-if="validationErrors.feeRecipient" class="error-text">{{ validationErrors.feeRecipient }}</small>
            </div>
          </div>

          <!-- 第二步：预售信息 -->
          <div v-if="currentStep === 2" class="config-section">
            <h3>Presale Information</h3>
            
            <!-- 预售价格 -->
            <div class="form-group">
              <label class="form-label">Presale Rate (Tokens per TRX) *</label>
              <input
                v-model="presaleSettings.presaleRate"
                type="text"
                placeholder="1000000"
                class="form-input"
                :class="{ error: validationErrors.presaleRate }"
                @input="formatPresaleRate"
                @blur="validatePresaleRate"
              />
              <small v-if="validationErrors.presaleRate" class="error-text">{{ validationErrors.presaleRate }}</small>
            </div>

            <!-- 最大购买量 -->
            <div class="form-group">
              <label class="form-label">Max Buy (TRX) *</label>
              <input
                v-model="presaleSettings.maxBuy"
                type="text"
                placeholder="1000"
                class="form-input"
                :class="{ error: validationErrors.maxBuy }"
                @input="formatMaxBuy"
                @blur="validateMaxBuy"
              />
              <small v-if="validationErrors.maxBuy" class="error-text">{{ validationErrors.maxBuy }}</small>
            </div>

            <!-- 预售持续时间 -->
            <div class="form-group">
              <label class="form-label">
                Duration (Hours) *
                <span class="range-hint">1 - 168 hours</span>
              </label>
              <input
                v-model="presaleSettings.duration"
                type="number"
                min="1"
                max="168"
                placeholder="24"
                class="form-input"
                :class="{ error: validationErrors.duration }"
                @input="validateDuration"
                @blur="validateDuration"
              />
              <small v-if="validationErrors.duration" class="error-text">{{ validationErrors.duration }}</small>
            </div>
          </div>

          <!-- 第三步：确认创建 -->
          <div v-if="currentStep === 3" class="config-section">
            <h3>Confirm Token Creation</h3>
            
            <!-- 代币信息摘要 -->
            <div class="summary-card">
              <h4>Token Information</h4>
              <div class="summary-row">
                <span>Name:</span>
                <strong>{{ tokenConfig.name }}</strong>
              </div>
              <div class="summary-row">
                <span>Symbol:</span>
                <strong>{{ tokenConfig.symbol }}</strong>
              </div>
              <div class="summary-row">
                <span>Total Supply:</span>
                <strong>{{ $formatNumber(tokenConfig.totalSupply) }}</strong>
              </div>
            </div>

            <!-- 手续费摘要 -->
            <div class="summary-card">
              <h4>Fee Settings</h4>
              <div class="summary-row">
                <span>Buy Fee:</span>
                <strong>{{ feeSettings.buyFee }}%</strong>
              </div>
              <div class="summary-row">
                <span>Sell Fee:</span>
                <strong>{{ feeSettings.sellFee }}%</strong>
              </div>
            </div>

            <!-- 预售摘要 -->
            <div class="summary-card">
              <h4>Presale Settings</h4>
              <div class="summary-row">
                <span>Rate:</span>
                <strong>{{ $formatNumber(presaleSettings.presaleRate) }} tokens per TRX</strong>
              </div>
              <div class="summary-row">
                <span>Max Buy:</span>
                <strong>{{ presaleSettings.maxBuy }} TRX</strong>
              </div>
              <div class="summary-row">
                <span>Duration:</span>
                <strong>{{ presaleSettings.duration }} hours</strong>
              </div>
            </div>
          </div>
        </section>

        <!-- 右侧边栏 -->
        <aside class="sidebar">
          <!-- 网络状态卡 -->
          <div class="side-card network-card">
            <div class="network-badge">
              <span class="network-dot"></span>
              <span>TRON Network</span>
            </div>
            <div class="backing-asset">
              <span>Backing asset:</span>
              <div class="asset-chip">
                <span class="trx-icon">TRX</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="side-actions">
            <button
              v-if="currentStep < 3"
              @click="nextStep"
              :disabled="!canProceed"
              class="action-btn primary"
            >
              Next
            </button>
            <button
              v-else
              @click="createToken"
              :disabled="!canCreate || creating"
              class="action-btn primary"
            >
              {{ creating ? '创建中...' : 'Create Token & Presale' }}
            </button>
            
            <button
              v-if="currentStep > 1"
              @click="previousStep"
              class="action-btn secondary"
            >
              Previous
            </button>
          </div>

          <!-- 错误信息 -->
          <div v-if="error" class="side-card error-card">
            <h4>错误</h4>
            <p>{{ error }}</p>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AdvancedTokenCreation',
  
  data() {
    return {
      currentStep: 1,
      tokenConfig: null,
      
      feeSettings: {
        buyFee: '',
        sellFee: '',
        feeRecipient: ''
      },
      
      presaleSettings: {
        presaleRate: '',
        maxBuy: '',
        duration: ''
      },
      
      validationErrors: {
        buyFee: '',
        sellFee: '',
        feeRecipient: '',
        presaleRate: '',
        maxBuy: '',
        duration: ''
      },
      
      creating: false,
      error: null
    }
  },
  
  computed: {
    canProceed() {
      if (this.currentStep === 1) {
        return this.feeSettings.buyFee !== '' &&
               this.feeSettings.sellFee !== '' &&
               this.feeSettings.feeRecipient !== '' &&
               !this.validationErrors.buyFee &&
               !this.validationErrors.sellFee &&
               !this.validationErrors.feeRecipient
      } else if (this.currentStep === 2) {
        return this.presaleSettings.presaleRate !== '' &&
               this.presaleSettings.maxBuy !== '' &&
               this.presaleSettings.duration !== '' &&
               !this.validationErrors.presaleRate &&
               !this.validationErrors.maxBuy &&
               !this.validationErrors.duration
      }
      return false
    },
    
    canCreate() {
      return this.canProceed && !this.creating
    }
  },
  
  mounted() {
    this.loadTokenConfig()
    this.initializeFeeSettings()
  },
  
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    
    loadTokenConfig() {
      if (this.$route.params.tokenConfig) {
        this.tokenConfig = this.$route.params.tokenConfig
        console.log('接收到代币配置:', this.tokenConfig)
      } else {
        this.$router.replace({ name: 'tronExample' })
      }
    },
    
    initializeFeeSettings() {
      if (this.tokenConfig) {
        this.feeSettings.buyFee = this.tokenConfig.feeBuy || 0.5
        this.feeSettings.sellFee = this.tokenConfig.feeSell || 0.5
        this.feeSettings.feeRecipient = this.tokenConfig.feeRecipient || this.$tronState.currentAccount
      }
    },
    
    getStepTitle() {
      const titles = {
        1: 'Configure Transaction Fees',
        2: 'Set Presale Parameters',
        3: 'Review & Create Token'
      }
      return titles[this.currentStep] || ''
    },
    
    getStepDescription() {
      const descriptions = {
        1: 'Set the buy and sell fees for your token transactions',
        2: 'Configure the presale parameters for your token launch',
        3: 'Review all settings and create your token with presale'
      }
      return descriptions[this.currentStep] || ''
    },
    
    nextStep() {
      if (this.canProceed && this.currentStep < 3) {
        this.currentStep++
      }
    },
    
    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },
    
    // 验证方法
    validateBuyFee() {
      const fee = parseFloat(this.feeSettings.buyFee)
      if (this.feeSettings.buyFee === '') {
        this.validationErrors.buyFee = '买入手续费不能为空'
      } else if (isNaN(fee) || fee < 0 || fee > 25) {
        this.validationErrors.buyFee = '买入手续费必须在0-25%之间'
      } else {
        this.validationErrors.buyFee = ''
      }
    },
    
    validateSellFee() {
      const fee = parseFloat(this.feeSettings.sellFee)
      if (this.feeSettings.sellFee === '') {
        this.validationErrors.sellFee = '卖出手续费不能为空'
      } else if (isNaN(fee) || fee < 0 || fee > 25) {
        this.validationErrors.sellFee = '卖出手续费必须在0-25%之间'
      } else {
        this.validationErrors.sellFee = ''
      }
    },
    
    validateFeeRecipient() {
      if (!this.feeSettings.feeRecipient) {
        this.validationErrors.feeRecipient = '手续费接收地址不能为空'
      } else if (!this.$tronUtils?.AddressUtils?.isValidAddress(this.feeSettings.feeRecipient)) {
        this.validationErrors.feeRecipient = '请输入有效的TRON地址'
      } else {
        this.validationErrors.feeRecipient = ''
      }
    },
    
    formatPresaleRate() {
      this.presaleSettings.presaleRate = this.presaleSettings.presaleRate.replace(/[^\d]/g, '')
    },
    
    validatePresaleRate() {
      const rate = parseInt(this.presaleSettings.presaleRate)
      if (!this.presaleSettings.presaleRate) {
        this.validationErrors.presaleRate = '预售汇率不能为空'
      } else if (isNaN(rate) || rate <= 0) {
        this.validationErrors.presaleRate = '预售汇率必须是正整数'
      } else {
        this.validationErrors.presaleRate = ''
      }
    },
    
    formatMaxBuy() {
      this.presaleSettings.maxBuy = this.presaleSettings.maxBuy.replace(/[^\d.]/g, '')
    },
    
    validateMaxBuy() {
      const maxBuy = parseFloat(this.presaleSettings.maxBuy)
      if (!this.presaleSettings.maxBuy) {
        this.validationErrors.maxBuy = '最大购买量不能为空'
      } else if (isNaN(maxBuy) || maxBuy <= 0) {
        this.validationErrors.maxBuy = '最大购买量必须是正数'
      } else {
        this.validationErrors.maxBuy = ''
      }
    },
    
    validateDuration() {
      const duration = parseInt(this.presaleSettings.duration)
      if (!this.presaleSettings.duration) {
        this.validationErrors.duration = '持续时间不能为空'
      } else if (isNaN(duration) || duration < 1 || duration > 168) {
        this.validationErrors.duration = '持续时间必须在1-168小时之间'
      } else {
        this.validationErrors.duration = ''
      }
    },
    
    async createToken() {
      if (!this.canCreate) return
      
      this.creating = true
      this.error = null
      
      try {
        // 准备完整的代币配置
        const tokenConfig = {
          name: this.tokenConfig.name,
          symbol: this.tokenConfig.symbol,
          totalSupply: this.tokenConfig.totalSupply,
          feeBuy: parseFloat(this.feeSettings.buyFee) * 100, // 转换为基点
          feeSell: parseFloat(this.feeSettings.sellFee) * 100, // 转换为基点
          feeRecipient: this.feeSettings.feeRecipient
        }
        
        // 准备预售配置
        const presaleConfig = {
          presaleEthAmount: this.presaleSettings.presaleRate,
          tradeEthAmount: Math.floor(parseInt(this.presaleSettings.presaleRate) * 0.5).toString(),
          maxTotalNum: parseInt(this.presaleSettings.maxBuy),
          presaleMaxNum: Math.floor(parseInt(this.presaleSettings.maxBuy) * 0.1),
          marketDisAmount: this.tokenConfig.totalSupply
        }
        
        console.log('创建高级代币配置:', { tokenConfig, presaleConfig })
        
        // 调用创建方法
        const result = await this.$createTokenAndPresale(tokenConfig, presaleConfig)
        
        // 创建成功，跳转回主页面
        this.$router.push({
          name: 'tronExample',
          query: { created: 'success' }
        })
        
      } catch (error) {
        this.error = error.message || '创建失败'
        console.error('创建代币失败:', error)
      } finally {
        this.creating = false
      }
    }
  }
}
</script>

<style scoped>
.advanced-token-creation {
  /* CSS变量定义 */
  --bg-primary: #0B0F1A;
  --bg-secondary: #0A0E18;
  --panel-bg: rgba(19, 24, 33, 0.72);
  --panel-border: rgba(255, 255, 255, 0.08);
  --panel-border-hover: rgba(255, 255, 255, 0.15);
  --panel-blur: 10px;

  --text-primary: #E6EDF3;
  --text-secondary: #8A93A1;
  --text-muted: #6B7280;

  --primary: #6E7CFF;
  --accent: #2BD4FF;
  --success: #16C784;
  --danger: #FF4D4F;

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 32px;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  --font-sm: 12px;
  --font-base: 14px;
  --font-lg: 16px;
  --font-xl: 18px;
  --font-2xl: 24px;

  min-height: 100vh;
  color: var(--text-primary);
  background:
    radial-gradient(1200px 600px at -10% -20%, rgba(110, 124, 255, 0.15), transparent 60%),
    radial-gradient(1200px 600px at 110% -10%, rgba(43, 212, 255, 0.12), transparent 60%),
    linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  background-attachment: fixed;
}

/* 顶部导航栏 */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(11, 15, 26, 0.95);
  backdrop-filter: blur(var(--panel-blur));
  border-bottom: 1px solid var(--panel-border);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-2xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--accent);
}

.header h1 {
  font-size: var(--font-xl);
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--text-primary);
  margin: 0;
}

/* 进度指示器 */
.progress-indicator {
  background: rgba(11, 15, 26, 0.8);
  border-bottom: 1px solid var(--panel-border);
  padding: var(--spacing-lg) 0;
}

.progress-steps {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step.completed {
  opacity: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-base);
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-color: var(--accent);
  color: white;
}

.step.completed .step-number {
  background: var(--success);
  border-color: var(--success);
  color: white;
}

.step-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.step.active .step-label {
  color: var(--text-primary);
}

.step-connector {
  flex: 1;
  height: 2px;
  background: var(--panel-border);
  transition: all 0.3s ease;
  max-width: 100px;
}

.step-connector.active {
  background: var(--accent);
}

/* 主要内容区域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.page-header h1 {
  font-size: var(--font-2xl);
  font-weight: 700;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
}

.step-description {
  color: var(--text-secondary);
  font-size: var(--font-base);
  margin: 0;
}

/* 布局容器 */
.layout-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

@media (min-width: 1024px) {
  .layout-container {
    grid-template-columns: 3fr 2fr;
    gap: var(--spacing-2xl);
  }
}

/* 配置区域 */
.config-section {
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(var(--panel-blur));
  background: var(--panel-bg);
  transition: all 0.2s ease;
}

.config-section h3 {
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--text-primary);
  font-size: var(--font-lg);
  font-weight: 600;
}

/* 表单样式 */
.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-base);
}

.range-hint {
  float: right;
  color: var(--text-secondary);
  font-size: var(--font-sm);
  font-weight: normal;
}

.form-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(43, 212, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
}

.form-input.error {
  border-color: var(--danger);
  background: rgba(255, 77, 79, 0.1);
}

.error-text {
  color: var(--danger);
  font-size: var(--font-sm);
  margin-top: var(--spacing-xs);
  display: block;
}

/* 摘要卡片 */
.summary-card {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--panel-border);
}

.summary-card h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
  font-size: var(--font-base);
  font-weight: 600;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row span {
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.summary-row strong {
  color: var(--text-primary);
  font-size: var(--font-sm);
  font-weight: 600;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.side-card {
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(var(--panel-blur));
  background: var(--panel-bg);
}

.network-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.network-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.network-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
}

.backing-asset {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.asset-chip {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: rgba(255, 255, 255, 0.1);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
}

.trx-icon {
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--accent);
}

/* 操作按钮 */
.side-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.action-btn {
  width: 100%;
  padding: var(--spacing-lg);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  box-shadow: 0 4px 12px rgba(43, 212, 255, 0.3);
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(43, 212, 255, 0.4);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  border: 1px solid var(--panel-border);
}

.action-btn.secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--panel-border-hover);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 错误卡片 */
.error-card {
  background: rgba(255, 77, 79, 0.1);
  border-color: var(--danger);
}

.error-card h4 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--danger);
  font-size: var(--font-base);
}

.error-card p {
  margin: 0;
  color: var(--danger);
  font-size: var(--font-sm);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: var(--spacing-lg);
  }

  .header-content {
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .progress-steps {
    padding: 0 var(--spacing-lg);
    gap: var(--spacing-sm);
  }

  .step-connector {
    max-width: 50px;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: var(--font-sm);
  }

  .step-label {
    font-size: 10px;
  }

  .config-section {
    padding: var(--spacing-lg);
  }

  .side-card {
    padding: var(--spacing-lg);
  }
}
</style>
