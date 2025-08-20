<template>
  <div class="fee-presale-settings">
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

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>Launch <span class="accent">your token</span> on RWAunion</h1>
        <div class="tab-switcher">
          <button class="tab active">Simple</button>
          <button class="tab">Advanced</button>
          <div class="tab-indicator"></div>
        </div>
      </div>

      <!-- 表单内容 -->
      <div class="layout-container">
        <!-- 主表单区域 -->
        <section class="main-column">
          <div class="config-section">
            <!-- Token for LGE(Amount) -->
            <div class="form-group">
              <label class="form-label">* Token for LGE (Token amount)</label>
              <div class="token-input-container">
                <div class="token-input-field">
                  <div class="token-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1L9.5 5.5L14 7L9.5 8.5L8 13L6.5 8.5L2 7L6.5 5.5L8 1Z" fill="currentColor"/>
                    </svg>
                    <span class="token-name">union</span>
                  </div>
                  <div class="token-amount">
                    <span class="amount-value">{{ formatTokenAmount(formData.lgeAmount) }}</span>
                  </div>
                </div>
                <div class="balance-info">
                  <span class="balance-text">Balance: {{ formatBalance(tokenConfig.totalSupply) }} MAX</span>
                  <span class="percentage-used">{{ calculatePercentageUsed() }} ({{ calculatePercentageUsed() }}%)</span>
                </div>
                <div class="percentage-buttons">
                  <button 
                    v-for="percentage in [10, 25, 50, 75, 'Max']" 
                    :key="percentage"
                    class="percentage-btn"
                    :class="{ active: selectedPercentage === percentage }"
                    @click="selectPercentage(percentage)"
                  >
                    {{ percentage === 'Max' ? 'Max' : percentage + '%' }}
                  </button>
                </div>
              </div>
              <small v-if="validationErrors.lgeAmount" class="error-text">{{ validationErrors.lgeAmount }}</small>
            </div>

            <!-- Rate(FVP per TRX) -->
            <div class="form-group">
              <label class="form-label">Rate(FVP per TRX) *</label>
              <input
                v-model="formData.rate"
                type="text"
                placeholder="Ex.210000000"
                class="form-input"
                :class="{ error: validationErrors.rate }"
                @input="formatRate"
                @blur="validateRate"
              />
              <small v-if="validationErrors.rate" class="error-text">{{ validationErrors.rate }}</small>
            </div>

            <!-- Max Buy(TRX) -->
            <div class="form-group">
              <label class="form-label">Max Buy(TRX) *</label>
              <input
                v-model="formData.maxBuy"
                type="text"
                placeholder="Ex.210000000"
                class="form-input"
                :class="{ error: validationErrors.maxBuy }"
                @input="formatMaxBuy"
                @blur="validateMaxBuy"
              />
              <small v-if="validationErrors.maxBuy" class="error-text">{{ validationErrors.maxBuy }}</small>
            </div>

            <!-- Start date and time -->
            <div class="form-group">
              <label class="form-label">Start date and time *</label>
              <div class="datetime-input" @click="showDateTimePicker">
                <input
                  v-model="formData.startDateTime"
                  type="text"
                  placeholder="选择开始时间"
                  class="form-input"
                  :class="{ error: validationErrors.startDateTime }"
                  readonly
                />
                <svg class="calendar-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.66667 1.66667V5M13.3333 1.66667V5M2.5 8.33333H17.5M4.16667 3.33333H15.8333C16.7538 3.33333 17.5 4.07953 17.5 5V16.6667C17.5 17.5871 16.7538 18.3333 15.8333 18.3333H4.16667C3.24619 18.3333 2.5 17.5871 2.5 16.6667V5C2.5 4.07953 3.24619 3.33333 4.16667 3.33333Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <small v-if="validationErrors.startDateTime" class="error-text">{{ validationErrors.startDateTime }}</small>
            </div>

            <!-- Duration (Hours) -->
            <div class="form-group">
              <label class="form-label">
                Duration (Hours) *
                <span class="range-hint">Min 1 - Max 90</span>
              </label>
              <input
                v-model="formData.duration"
                type="number"
                min="1"
                max="90"
                placeholder="Ex.210000000"
                class="form-input"
                :class="{ error: validationErrors.duration }"
                @input="validateDuration"
                @blur="validateDuration"
              />
              <small v-if="validationErrors.duration" class="error-text">{{ validationErrors.duration }}</small>
            </div>

            <!-- Vesting delay (Days) -->
            <div class="form-group">
              <label class="form-label">
                Vesting delay (Days) *
                <span class="range-hint">Min 7 - Max 30</span>
              </label>
              <input
                v-model="formData.vestingDelay"
                type="number"
                min="7"
                max="30"
                placeholder="Ex.210000000"
                class="form-input"
                :class="{ error: validationErrors.vestingDelay }"
                @input="validateVestingDelay"
                @blur="validateVestingDelay"
              />
              <small v-if="validationErrors.vestingDelay" class="error-text">{{ validationErrors.vestingDelay }}</small>
            </div>

            <!-- Vesting rate (%) -->
            <div class="form-group">
              <label class="form-label">
                Vesting rate (%) *
                <span class="range-hint">Min 5 - Max 20</span>
              </label>
              <input
                v-model="formData.vestingRate"
                type="number"
                min="5"
                max="20"
                step="0.1"
                placeholder="Ex.210000000"
                class="form-input"
                :class="{ error: validationErrors.vestingRate }"
                @input="validateVestingRate"
                @blur="validateVestingRate"
              />
              <small v-if="validationErrors.vestingRate" class="error-text">{{ validationErrors.vestingRate }}</small>
            </div>

            <!-- Backing share (%) -->
            <div class="form-group">
              <label class="form-label">
                Backing share (%) *
                <span class="range-hint">Min 1 - Max 50</span>
              </label>
              <input
                v-model="formData.backingShare"
                type="number"
                min="1"
                max="50"
                step="0.1"
                placeholder="Ex.210000000"
                class="form-input"
                :class="{ error: validationErrors.backingShare }"
                @input="validateBackingShare"
                @blur="validateBackingShare"
              />
              <small v-if="validationErrors.backingShare" class="error-text">{{ validationErrors.backingShare }}</small>
            </div>

            <!-- FEC share (%) -->
            <div class="form-group">
              <label class="form-label">
                FEC share (%) *
                <span class="range-hint">Min 30 - Max 100</span>
              </label>
              <input
                v-model="formData.fecShare"
                type="number"
                min="30"
                max="100"
                step="0.1"
                placeholder="Ex.210000000"
                class="form-input"
                :class="{ error: validationErrors.fecShare }"
                @input="validateFecShare"
                @blur="validateFecShare"
              />
              <small v-if="validationErrors.fecShare" class="error-text">{{ validationErrors.fecShare }}</small>
            </div>

            <!-- Dev Share (%) -->
            <div class="form-group">
              <label class="form-label">
                Dev Share (%) *
                <span class="range-hint">Min 0 - Max 50</span>
              </label>
              <input
                v-model="formData.devShare"
                type="number"
                min="0"
                max="50"
                step="0.1"
                placeholder="Ex.210000000"
                class="form-input"
                :class="{ error: validationErrors.devShare }"
                @input="validateDevShare"
                @blur="validateDevShare"
              />
              <small v-if="validationErrors.devShare" class="error-text">{{ validationErrors.devShare }}</small>
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
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="side-actions">
            <button
              @click="createToken"
              :disabled="!canCreate || creating"
              class="action-btn primary"
            >
              {{ creating ? '创建中...' : 'Create token' }}
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
  name: 'FeeAndPresaleSettings',
  
  data() {
    return {
      tokenConfig: null, // 从上一页传递的代币配置

      formData: {
        lgeAmount: '',
        rate: '',
        maxBuy: '',
        startDateTime: '',
        duration: '',
        vestingDelay: '',
        vestingRate: '',
        backingShare: '',
        fecShare: '',
        devShare: ''
      },

      validationErrors: {
        lgeAmount: '',
        rate: '',
        maxBuy: '',
        startDateTime: '',
        duration: '',
        vestingDelay: '',
        vestingRate: '',
        backingShare: '',
        fecShare: '',
        devShare: ''
      },

      creating: false,
      error: null,
      selectedPercentage: 'Max' // 新增：用于存储选中的百分比
    }
  },
  
  computed: {
    canCreate() {
      return this.isFormValid && !this.creating
    },
    
    isFormValid() {
      return !Object.values(this.validationErrors).some(error => error !== '') &&
             Object.values(this.formData).every(value => value !== '')
    }
  },
  
  mounted() {
    // 从路由参数或状态管理中获取代币配置信息
    this.loadTokenConfig()
    // 初始化百分比选择器
    this.initializePercentageSelector()
  },
  
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    
    loadTokenConfig() {
      // 从路由参数中获取代币配置信息
      if (this.$route.params.tokenConfig) {
        this.tokenConfig = this.$route.params.tokenConfig
        console.log('接收到代币配置:', this.tokenConfig)
        // 设置默认的LGE数量为总供应量的10%
        if (this.tokenConfig.totalSupply) {
          const defaultAmount = (parseFloat(this.tokenConfig.totalSupply) * 0.1).toString();
          this.formData.lgeAmount = defaultAmount;
        }
        // 加载配置后初始化百分比选择器
        this.$nextTick(() => {
          this.initializePercentageSelector()
        })
      } else {
        // 如果没有代币配置，返回到代币创建页面
        this.$router.replace({ name: 'tronExample' })
      }
    },
    
    // 格式化方法
    formatLgeAmount() {
      this.formData.lgeAmount = this.formData.lgeAmount.replace(/[^\d.]/g, '')
    },
    
    formatRate() {
      this.formData.rate = this.formData.rate.replace(/[^\d.]/g, '')
    },
    
    formatMaxBuy() {
      this.formData.maxBuy = this.formData.maxBuy.replace(/[^\d.]/g, '')
    },

    formatTokenAmount(value) {
      if (value === '') return '';
      const num = parseFloat(value);
      if (isNaN(num)) return '';
      return num.toLocaleString();
    },

    formatBalance(totalSupply) {
      if (!totalSupply) return '0';
      const num = parseFloat(totalSupply);
      if (isNaN(num)) return '0';
      return num.toLocaleString();
    },

    calculatePercentageUsed() {
      if (!this.tokenConfig || !this.tokenConfig.totalSupply) return '0';
      const totalSupply = parseFloat(this.tokenConfig.totalSupply);
      const lgeAmount = parseFloat(this.formData.lgeAmount);
      if (isNaN(totalSupply) || isNaN(lgeAmount) || totalSupply === 0) return '0';
      const percentage = (lgeAmount / totalSupply) * 100;
      return percentage.toFixed(2);
    },

    selectPercentage(percentage) {
      this.selectedPercentage = percentage;
      if (percentage === 'Max') {
        this.formData.lgeAmount = this.tokenConfig.totalSupply;
      } else {
        this.formData.lgeAmount = (parseFloat(this.tokenConfig.totalSupply) * (percentage / 100)).toString();
      }
      this.validateLgeAmount();
    },
    
    // 验证方法
    validateLgeAmount() {
      const amount = parseFloat(this.formData.lgeAmount)
      if (!this.formData.lgeAmount) {
        this.validationErrors.lgeAmount = 'LGE数量不能为空'
      } else if (isNaN(amount) || amount <= 0) {
        this.validationErrors.lgeAmount = 'LGE数量必须是正数'
      } else if (amount > 100) {
        this.validationErrors.lgeAmount = 'LGE数量不能超过100%'
      } else {
        this.validationErrors.lgeAmount = ''
      }
    },
    
    validateRate() {
      const rate = parseFloat(this.formData.rate)
      if (!this.formData.rate) {
        this.validationErrors.rate = '汇率不能为空'
      } else if (isNaN(rate) || rate <= 0) {
        this.validationErrors.rate = '汇率必须是正数'
      } else {
        this.validationErrors.rate = ''
      }
    },
    
    validateMaxBuy() {
      const maxBuy = parseFloat(this.formData.maxBuy)
      if (!this.formData.maxBuy) {
        this.validationErrors.maxBuy = '最大购买量不能为空'
      } else if (isNaN(maxBuy) || maxBuy <= 0) {
        this.validationErrors.maxBuy = '最大购买量必须是正数'
      } else {
        this.validationErrors.maxBuy = ''
      }
    },
    
    validateDuration() {
      const duration = parseInt(this.formData.duration)
      if (!this.formData.duration) {
        this.validationErrors.duration = '持续时间不能为空'
      } else if (isNaN(duration) || duration < 1 || duration > 90) {
        this.validationErrors.duration = '持续时间必须在1-90小时之间'
      } else {
        this.validationErrors.duration = ''
      }
    },
    
    validateVestingDelay() {
      const delay = parseInt(this.formData.vestingDelay)
      if (!this.formData.vestingDelay) {
        this.validationErrors.vestingDelay = '释放延迟不能为空'
      } else if (isNaN(delay) || delay < 7 || delay > 30) {
        this.validationErrors.vestingDelay = '释放延迟必须在7-30天之间'
      } else {
        this.validationErrors.vestingDelay = ''
      }
    },
    
    validateVestingRate() {
      const rate = parseFloat(this.formData.vestingRate)
      if (!this.formData.vestingRate) {
        this.validationErrors.vestingRate = '释放比率不能为空'
      } else if (isNaN(rate) || rate < 5 || rate > 20) {
        this.validationErrors.vestingRate = '释放比率必须在5%-20%之间'
      } else {
        this.validationErrors.vestingRate = ''
      }
    },
    
    validateBackingShare() {
      const share = parseFloat(this.formData.backingShare)
      if (!this.formData.backingShare) {
        this.validationErrors.backingShare = '支撑份额不能为空'
      } else if (isNaN(share) || share < 1 || share > 50) {
        this.validationErrors.backingShare = '支撑份额必须在1%-50%之间'
      } else {
        this.validationErrors.backingShare = ''
      }
    },
    
    validateFecShare() {
      const share = parseFloat(this.formData.fecShare)
      if (!this.formData.fecShare) {
        this.validationErrors.fecShare = 'FEC份额不能为空'
      } else if (isNaN(share) || share < 30 || share > 100) {
        this.validationErrors.fecShare = 'FEC份额必须在30%-100%之间'
      } else {
        this.validationErrors.fecShare = ''
      }
    },
    
    validateDevShare() {
      const share = parseFloat(this.formData.devShare)
      if (!this.formData.devShare) {
        this.validationErrors.devShare = '开发者份额不能为空'
      } else if (isNaN(share) || share < 0 || share > 50) {
        this.validationErrors.devShare = '开发者份额必须在0%-50%之间'
      } else {
        this.validationErrors.devShare = ''
      }
    },
    
    showDateTimePicker() {
      // 这里可以集成日期时间选择器
      // 暂时使用简单的prompt
      const datetime = prompt('请输入开始时间 (YYYY-MM-DD HH:mm):')
      if (datetime) {
        this.formData.startDateTime = datetime
        this.validateStartDateTime()
      }
    },
    
    validateStartDateTime() {
      if (!this.formData.startDateTime) {
        this.validationErrors.startDateTime = '开始时间不能为空'
      } else {
        // 简单的日期格式验证
        const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/
        if (!dateRegex.test(this.formData.startDateTime)) {
          this.validationErrors.startDateTime = '请输入正确的日期时间格式'
        } else {
          this.validationErrors.startDateTime = ''
        }
      }
    },
    
    async createToken() {
      if (!this.canCreate) return

      this.creating = true
      this.error = null

      try {
        // 验证所有字段
        this.validateAllFields()

        if (!this.isFormValid) {
          throw new Error('请检查表单输入')
        }

        if (!this.tokenConfig) {
          throw new Error('缺少代币配置信息')
        }

        // 准备完整的代币配置
        const tokenConfig = {
          name: this.tokenConfig.name,
          symbol: this.tokenConfig.symbol,
          totalSupply: this.tokenConfig.totalSupply,
          feeBuy: this.tokenConfig.feeBuy || 300, // 默认3%
          feeSell: this.tokenConfig.feeSell || 300, // 默认3%
          feeRecipient: this.tokenConfig.feeRecipient || this.$tronState.currentAccount
        }

        // 准备预售配置
        const presaleConfig = {
          presaleEthAmount: this.formData.rate, // 预售价格（每TRX可买代币数量）
          tradeEthAmount: (parseFloat(this.formData.rate) * 0.5).toString(), // 内场交易价格（预售价格的一半）
          maxTotalNum: parseInt(this.formData.maxBuy) || 100,
          presaleMaxNum: Math.floor(parseInt(this.formData.maxBuy) * 0.1) || 10,
          marketDisAmount: this.tokenConfig.totalSupply
        }

        console.log('创建配置:', { tokenConfig, presaleConfig })

        // 调用创建方法
        const result = await this.$createTokenAndPresale(tokenConfig, presaleConfig)

        // 创建成功，跳转回主页面并显示结果
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
    },
    
    validateAllFields() {
      this.validateLgeAmount()
      this.validateRate()
      this.validateMaxBuy()
      this.validateStartDateTime()
      this.validateDuration()
      this.validateVestingDelay()
      this.validateVestingRate()
      this.validateBackingShare()
      this.validateFecShare()
      this.validateDevShare()
    },

    initializePercentageSelector() {
      // 在mounted中初始化时，确保selectedPercentage的值与当前的formData.lgeAmount匹配
      // 这样在用户点击百分比按钮时，selectedPercentage会正确反映当前选中的百分比
      const currentLgeAmount = parseFloat(this.formData.lgeAmount);
      const totalSupply = parseFloat(this.tokenConfig?.totalSupply);

      if (totalSupply > 0 && currentLgeAmount > 0) {
        const percentage = (currentLgeAmount / totalSupply) * 100;
        // 找到最接近的预设百分比
        if (percentage >= 100) {
          this.selectedPercentage = 'Max';
        } else if (percentage >= 75) {
          this.selectedPercentage = 75;
        } else if (percentage >= 50) {
          this.selectedPercentage = 50;
        } else if (percentage >= 25) {
          this.selectedPercentage = 25;
        } else if (percentage >= 10) {
          this.selectedPercentage = 10;
        } else {
          this.selectedPercentage = 10; // 默认选择10%
        }
      } else {
        this.selectedPercentage = 10; // 如果没有代币配置或总供应量为0，则默认选中10%
      }
    }
  }
}
</script>

<style scoped>
.fee-presale-settings {
  /* CSS变量定义 - 基于UI设计图规范 */
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
  --primary-light: #8B9AFF;
  --accent: #2BD4FF;
  --accent-light: #5CE1FF;

  --success: #16C784;
  --success-light: #34D399;
  --danger: #FF4D4F;
  --danger-light: #FF6B6B;
  --warning: #F59E0B;

  /* 间距规范 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 32px;

  /* 圆角规范 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* 字体规范 */
  --font-xs: 10px;
  --font-sm: 12px;
  --font-base: 14px;
  --font-lg: 16px;
  --font-xl: 18px;
  --font-2xl: 24px;
  --font-3xl: 28px;

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

/* 主要内容区域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}

/* 页面标题和Tab切换器 */
.page-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.page-header h1 {
  font-size: var(--font-3xl);
  font-weight: 800;
  margin: 0 0 var(--spacing-xl) 0;
  line-height: 1.2;
}

.page-header h1 .accent {
  color: var(--accent);
}

/* Tab切换器 */
.tab-switcher {
  display: inline-flex;
  gap: var(--spacing-xs);
  background: rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xs);
  border: 1px solid var(--panel-border);
  position: relative;
}

.tab-switcher .tab {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-2xl);
  border-radius: var(--radius-md);
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: var(--font-base);
  position: relative;
  z-index: 2;
  text-align: center;
  min-width: 120px;
}

.tab-switcher .tab:hover {
  color: var(--text-primary);
}

.tab-switcher .tab.active {
  color: white;
}

.tab-indicator {
  position: absolute;
  top: var(--spacing-xs);
  left: var(--spacing-xs);
  bottom: var(--spacing-xs);
  width: calc(50% - var(--spacing-xs));
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: var(--radius-md);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  box-shadow: 0 2px 8px rgba(43, 212, 255, 0.3);
}

/* 双栏布局容器 */
.layout-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-2xl);
}

@media (min-width: 1024px) {
  .layout-container {
    grid-template-columns: 3fr 2fr;
    gap: var(--spacing-3xl);
  }
}

/* 主列和侧边栏 */
.main-column,
.sidebar {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 配置区域样式 */
.config-section {
  padding: var(--spacing-2xl);
  border-radius: var(--radius-xl);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(var(--panel-blur));
  background: var(--panel-bg);
  transition: all 0.2s ease;
}

.config-section:hover {
  border-color: var(--panel-border-hover);
}

/* 表单组件样式 */
.form-group {
  margin-bottom: var(--spacing-xl);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-base);
  position: relative;
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
  animation: shake 0.3s ease-in-out;
}

.form-input.error:focus {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.2);
}

/* 带后缀的输入框 */
.input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-suffix .form-input {
  padding-right: 40px;
}

.input-suffix {
  position: absolute;
  right: var(--spacing-md);
  color: var(--text-secondary);
  font-size: var(--font-base);
  pointer-events: none;
}

/* 日期时间输入框 */
.datetime-input {
  position: relative;
  cursor: pointer;
}

.datetime-input .form-input {
  cursor: pointer;
  padding-right: 40px;
}

.calendar-icon {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

/* 侧边栏样式 */
.side-card {
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(var(--panel-blur));
  background: var(--panel-bg);
  transition: all 0.2s ease;
}

.side-card:hover {
  border-color: var(--panel-border-hover);
}

/* 网络状态卡 */
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
  gap: var(--spacing-md);
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
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
  color: var(--danger-light);
  font-size: var(--font-sm);
}

/* 错误文本样式 */
.error-text {
  color: var(--danger);
  font-size: var(--font-sm);
  margin-top: var(--spacing-xs);
  display: block;
  animation: fadeIn 0.2s ease-in-out;
}

/* Token输入容器样式 */
.token-input-container {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all 0.2s ease;
}

.token-input-container:hover {
  border-color: var(--panel-border-hover);
}

.token-input-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.token-icon {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-primary);
}

.token-icon svg {
  color: var(--accent);
}

.token-name {
  font-weight: 600;
  font-size: var(--font-base);
}

.token-amount {
  display: flex;
  align-items: center;
}

.amount-value {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.balance-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.balance-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.percentage-used {
  color: var(--text-primary);
  font-weight: 500;
}

.percentage-buttons {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.percentage-btn {
  flex: 1;
  min-width: 60px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--font-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.percentage-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.percentage-btn.active {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-color: var(--accent);
  color: white;
  box-shadow: 0 2px 8px rgba(43, 212, 255, 0.3);
}

.percentage-btn.active:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(43, 212, 255, 0.4);
}

/* 动画 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: var(--spacing-lg);
  }

  .header-content {
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .page-header h1 {
    font-size: var(--font-2xl);
  }

  .tab-switcher .tab {
    min-width: 100px;
    padding: var(--spacing-sm) var(--spacing-lg);
  }

  .config-section {
    padding: var(--spacing-lg);
  }

  .side-card {
    padding: var(--spacing-lg);
  }
}
</style>
