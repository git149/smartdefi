<template>
  <div class="token-marketplace">
    <!-- 自定义导航栏 -->
    <div class="custom-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="$router.go(-1)" class="back-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <h1 class="header-title">RWAunion</h1>
        </div>

        <!-- 用户头像 -->
        <div class="user-profile" @click="handleWalletClick">
          <div v-if="isConnected" class="profile-avatar">
            <img src="@/assets/img/avatar.png" alt="Profile" class="avatar-img" />
          </div>
          <div v-else class="profile-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 顶部横幅 -->
      <div class="top-banner">
        <div class="banner-header">
          <div class="fundraising-info">
            <span class="fundraising-label">Fundraising</span>
            <span class="fundraising-amount">2300 TRX</span>
          </div>
          <button class="launch-rwa-btn">Launch RWA</button>
        </div>

        <div class="banner-content">
          <div class="token-preview-card">
            <div class="token-visual">
              <div class="token-icon-container">
                <img src="@/assets/img/buyToken_logo.png" alt="Token" class="token-icon" />
              </div>
              <div class="token-info">
                <div class="token-title">TRX PUMP and CHOU</div>
                <div class="token-description">launch the first Chinese celebrity coin</div>
                <div class="token-symbol-badge">CHOU</div>
              </div>
            </div>
            <div class="token-actions">
              <button class="token-action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="12" r="1" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Launchpad 标题 -->
      <div class="section-header">
        <h2 class="section-title">Launchpad</h2>
        <div class="section-subtitle">
          <span class="progress-indicator">20% 11%</span>
        </div>
      </div>

      <!-- 预售功能区域 -->
      <div class="presale-section">
        <div class="casting">
          <div class="casting_tit">
            <div class="tit_box">
              <div class="casting_left">
                <img src="@/assets/img/buyToken_logo.png" alt="Token" />
                <div>DTK</div>
              </div>
              <div class="casting_right">
                <img src="@/assets/img/time.png" alt="" />
                <div>进行中</div>
              </div>
            </div>
          </div>

          <div class="cas_mess">
            <div class="lab">Default Token 预售</div>
            <div class="information">
              <img src="@/assets/img/social_1.png" alt="" />
              <img src="@/assets/img/social_2.png" alt="" />
            </div>
          </div>

          <div class="casting_content">
            <div class="casting_lab">0%</div>
            <div class="casting_bar">
              <div class="progressbar" style="width: 100%"></div>
            </div>

            <div class="num">
              <img src="@/assets/img/minus.png" alt="" @click="reducePresaleAmount()" />
              <div>{{ presaleAmount }} TRX</div>
              <img src="@/assets/img/plus.png" alt="" @click="addPresaleAmount()" />
            </div>

            <div class="price">
              <div class="lef">
                <img src="@/assets/img/buyToken_logo.png" alt="" />
                <div>余额金额</div>
              </div>
              <div class="rig">Balance: {{ walletBalance }} TRX</div>
            </div>

            <div class="zhuzao">
              铸造: {{ presaleAmount }} BNB
            </div>

            <div>
              <div class="clab">
                <div class="clab_lef">
                  <div>Raised</div>
                </div>
                <div class="clab_rig">0 / 0</div>
              </div>
              <div class="clab">
                <div class="clab_lef">
                  <div>Supply</div>
                </div>
                <div class="clab_rig">0</div>
              </div>
              <div class="clab">
                <div class="clab_lef">
                  <div>Max</div>
                </div>
                <div class="clab_rig">0 BNB</div>
              </div>
              <div class="clab">
                <div class="clab_lef">
                  <div>Min</div>
                </div>
                <div class="clab_rig">0 TRX</div>
              </div>

              <div class="casting_btn" @click="participatePresale" v-if="isConnected">
                参与预售
              </div>
              <div class="casting_btn2" v-else @click="handleWalletClick">
                连接钱包
              </div>

              <div class="coin_price">价格: 0 BNB ≈ 0 DTK</div>
              <div class="coin_msg">等待预售开始，多个代币预售即将上线，让我们一起期待吧！</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 代币列表 -->
      <div class="token-list-section">
        <TokenList
          @token-selected="handleTokenSelected"
          @buy-token="handleBuyToken"
          @view-details="handleViewDetails"
        />
      </div>

      <!-- 底部列表区域 -->
      <div class="list-section">
        <div class="list-header">
          <h3 class="list-title">List</h3>
          <div class="list-tabs">
            <span class="tab active">Top Ten Top Ten</span>
            <div class="notification-badge">
              <span class="badge-count">8</span>
            </div>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="search-container">
          <div class="search-box">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
            </svg>
            <input
              type="text"
              placeholder="Search for Tokens"
              class="search-input"
              v-model="searchQuery"
            />
          </div>

          <!-- 过滤选项 -->
          <div class="filter-options">
            <div class="filter-item">
              <input type="checkbox" id="sunswap" class="filter-checkbox" />
              <label for="sunswap" class="filter-label">Listed on SunSwap</label>
            </div>
            <div class="filter-actions">
              <button class="filter-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              <button class="filter-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M7 12h10M10 18h4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              <button class="filter-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16M6 12h12M8 18h8" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

     
      </div>
    </div>

    <!-- 代币详情模态框 -->
    <TokenDetails
      v-if="selectedToken"
      :token="selectedToken"
      :visible="showTokenDetails"
      :wallet-balance="walletBalance"
      @close="closeTokenDetails"
      @purchase="handlePurchase"
      @refresh="handleRefreshToken"
    />

    <!-- 钱包连接模态框 -->
    <van-popup 
      v-model="showWalletModal" 
      position="bottom" 
      :style="{ height: '40%' }"
      round
    >
      <div class="wallet-modal">
        <div class="modal-header">
          <h3>连接钱包</h3>
          <button @click="showWalletModal = false" class="close-btn">×</button>
        </div>
        
        <div class="wallet-options">
          <div class="wallet-option" @click="connectTronLink">
            <div class="wallet-logo tronlink-logo">TL</div>
            <div class="wallet-info">
              <div class="wallet-name">TronLink</div>
              <div class="wallet-desc">连接到TronLink钱包</div>
            </div>
            <div class="connect-arrow">→</div>
          </div>
        </div>

        <div class="wallet-tips">
          <div class="tip-item">
            <span class="tip-icon">💡</span>
            <span class="tip-text">请确保已安装TronLink浏览器扩展</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">🔒</span>
            <span class="tip-text">我们不会存储您的私钥信息</span>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 购买确认模态框 -->
    <van-popup 
      v-model="showPurchaseModal" 
      position="center" 
      :style="{ width: '90%', maxWidth: '400px' }"
      round
    >
      <div class="purchase-modal">
        <div class="modal-header">
          <h3>确认购买</h3>
          <button @click="showPurchaseModal = false" class="close-btn">×</button>
        </div>

        <div v-if="purchaseData" class="purchase-details">
          <div class="token-info">
            <img :src="purchaseData.token.icon" alt="" class="token-icon" />
            <div class="token-details">
              <div class="token-name">{{ purchaseData.token.tokenName }}</div>
              <div class="token-symbol">{{ purchaseData.token.tokenSymbol }}</div>
            </div>
          </div>

          <div class="purchase-summary">
            <div class="summary-item">
              <span class="label">购买数量:</span>
              <span class="value">{{ purchaseData.amount }}</span>
            </div>
            <div class="summary-item">
              <span class="label">单价:</span>
              <span class="value">{{ purchaseData.token.presale.preSaleEthAmountFormatted }} TRX</span>
            </div>
            <div class="summary-item total">
              <span class="label">总计:</span>
              <span class="value">{{ purchaseData.totalCost }} TRX</span>
            </div>
          </div>

          <div class="purchase-actions">
            <button @click="showPurchaseModal = false" class="cancel-btn">
              取消
            </button>
            <button 
              @click="confirmPurchase" 
              :disabled="isProcessing"
              class="confirm-btn"
            >
              {{ isProcessing ? '处理中...' : '确认购买' }}
            </button>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 交易进度指示器 -->
    <div v-if="isProcessing" class="transaction-progress">
      <div class="progress-spinner"></div>
      <div class="progress-text">{{ progressText }}</div>
      <div class="progress-detail">{{ progressDetail }}</div>
    </div>
  </div>
</template>

<script>
import { Toast } from 'vant'
import TokenList from '@/components/TokenList.vue'
import TokenDetails from '@/components/TokenDetails.vue'
import tokenListStore from '@/stores/tokenListStore'
import { useTokenPurchase } from '@/composables/useTokenPurchase'
import { formatAddressDisplay } from '@/utils/addressFormatter'

export default {
  name: 'TokenMarketplace',
  
  components: {
    TokenList,
    TokenDetails
  },

  setup() {
    const {
      isProcessing,
      transactionHash,
      error,
      walletBalance,
      walletAddress,
      isConnected,
      canPurchase,
      connectWallet,
      updateWalletBalance,
      purchaseToken,
      formatAddress,
      clearError
    } = useTokenPurchase()

    return {
      isProcessing,
      transactionHash,
      error,
      walletBalance,
      walletAddress,
      isConnected,
      canPurchase,
      connectWallet,
      updateWalletBalance,
      purchaseToken,
      formatAddress,
      clearError
    }
  },

  data() {
    return {
      lanImg: '',
      selectedToken: null,
      showTokenDetails: false,
      showWalletModal: false,
      showPurchaseModal: false,
      purchaseData: null,
      progressText: '',
      progressDetail: '',
      searchQuery: '',
      // 预售相关数据
      presaleAmount: 0.1,
      presaleFrequency: 1
    }
  },

  computed: {
    // 代币统计信息
    tokenStats() {
      return tokenListStore.utils.getStats()
    }
  },

  async mounted() {
    // 设置语言图标
    this.setLanguageIcon()
    
    // 初始化数据
    await this.initializeData()
  },

  methods: {
    /**
     * 设置语言图标
     */
    setLanguageIcon() {
      const locale = this.$i18n.locale
      if (locale === 'tc') {
        this.lanImg = require('@/assets/img/lan_tc.png')
      } else if (locale === 'en') {
        this.lanImg = require('@/assets/img/lan_en.png')
      } else if (locale === 'cn') {
        this.lanImg = require('@/assets/img/lan_cn.png')
      }
    },

    /**
     * 初始化数据
     */
    async initializeData() {
      try {
        // 初始化钱包连接状态
        await this.updateWalletBalance()
      } catch (error) {
        console.error('初始化失败:', error)
      }
    },

    /**
     * 导航栏右侧点击
     */
    onClickRight() {
      // 可以添加设置菜单等功能
      console.log('导航栏右侧点击')
    },

    /**
     * 钱包区域点击
     */
    handleWalletClick() {
      if (this.isConnected) {
        // 已连接，显示钱包详情或断开连接选项
        this.showWalletOptions()
      } else {
        // 未连接，显示连接选项
        this.showWalletModal = true
      }
    },

    /**
     * 显示钱包选项
     */
    showWalletOptions() {
      // 可以添加钱包管理功能
      Toast('钱包已连接')
    },

    /**
     * 连接TronLink钱包
     */
    async connectTronLink() {
      try {
        this.showWalletModal = false
        await this.connectWallet()
      } catch (error) {
        console.error('连接钱包失败:', error)
      }
    },

    /**
     * 处理代币选择
     */
    handleTokenSelected(token) {
      console.log('选择代币:', token.tokenSymbol)
      this.selectedToken = token
    },

    /**
     * 处理购买代币
     */
    handleBuyToken(token) {
      console.log('购买代币:', token.tokenSymbol)
      
      // 检查钱包连接
      if (!this.isConnected) {
        this.showWalletModal = true
        return
      }

      // 显示代币详情进行购买
      this.selectedToken = token
      this.showTokenDetails = true
    },

    /**
     * 处理查看详情
     */
    handleViewDetails(token) {
      console.log('查看详情:', token.tokenSymbol)
      this.selectedToken = token
      this.showTokenDetails = true
    },

    /**
     * 关闭代币详情
     */
    closeTokenDetails() {
      this.showTokenDetails = false
      this.selectedToken = null
    },

    /**
     * 增加预售数量
     */
    addPresaleAmount() {
      this.presaleFrequency += 1
      this.presaleAmount = (0.1 * this.presaleFrequency).toFixed(1)
    },

    /**
     * 减少预售数量
     */
    reducePresaleAmount() {
      if (this.presaleFrequency > 1) {
        this.presaleFrequency -= 1
        this.presaleAmount = (0.1 * this.presaleFrequency).toFixed(1)
      }
    },

    /**
     * 参与预售
     */
    async participatePresale() {
      try {
        // 检查钱包连接
        if (!this.isConnected) {
          Toast('请先连接钱包')
          this.showWalletModal = true
          return
        }

        // 检查余额
        if (Number(this.walletBalance) < Number(this.presaleAmount)) {
          Toast('余额不足')
          return
        }

        // 显示加载状态
        this.progressText = '正在参与预售...'
        this.progressDetail = '请在钱包中确认交易'

        Toast.loading({
          message: '正在处理...',
          forbidClick: true,
          duration: 0
        })

        // 这里可以集成实际的预售合约调用
        // 暂时模拟交易过程
        await new Promise(resolve => setTimeout(resolve, 3000))

        Toast.clear()
        Toast.success('预售参与成功！')

        // 刷新余额
        await this.updateWalletBalance()

      } catch (error) {
        Toast.clear()
        console.error('预售失败:', error)
        Toast.fail('预售失败: ' + (error.message || '未知错误'))
      }
    },

    /**
     * 增加预售数量
     */
    addPresaleAmount() {
      this.presaleFrequency += 1
      this.presaleAmount = (0.1 * this.presaleFrequency).toFixed(1)
    },

    /**
     * 减少预售数量
     */
    reducePresaleAmount() {
      if (this.presaleFrequency > 1) {
        this.presaleFrequency -= 1
        this.presaleAmount = (0.1 * this.presaleFrequency).toFixed(1)
      }
    },

    /**
     * 参与预售
     */
    async participatePresale() {
      try {
        // 检查钱包连接
        if (!this.isConnected) {
          Toast('请先连接钱包')
          this.showWalletModal = true
          return
        }

        // 检查余额
        if (Number(this.walletBalance) < Number(this.presaleAmount)) {
          Toast('余额不足')
          return
        }

        // 显示加载状态
        this.progressText = '正在参与预售...'
        this.progressDetail = '请在钱包中确认交易'

        Toast.loading({
          message: '正在处理...',
          forbidClick: true,
          duration: 0
        })

        // 这里可以集成实际的预售合约调用
        // 暂时模拟交易过程
        await new Promise(resolve => setTimeout(resolve, 3000))

        Toast.clear()
        Toast.success('预售参与成功！')

        // 刷新余额
        await this.updateWalletBalance()

      } catch (error) {
        Toast.clear()
        console.error('预售失败:', error)
        Toast.fail('预售失败: ' + (error.message || '未知错误'))
      }
    },

    /**
     * 处理购买请求
     */
    handlePurchase(purchaseData) {
      console.log('处理购买请求:', purchaseData)
      
      // 检查钱包连接
      if (!this.isConnected) {
        Toast('请先连接钱包')
        this.showWalletModal = true
        return
      }

      // 显示购买确认
      this.purchaseData = purchaseData
      this.showPurchaseModal = true
    },

    /**
     * 确认购买
     */
    async confirmPurchase() {
      try {
        this.showPurchaseModal = false
        this.progressText = '正在处理购买...'
        this.progressDetail = '请在钱包中确认交易'

        const result = await this.purchaseToken(this.purchaseData)

        if (result.success) {
          Toast.success('购买成功！')
          
          // 刷新代币数据
          await this.refreshTokenData()
          
          // 关闭详情页
          this.closeTokenDetails()
        }

      } catch (error) {
        console.error('购买失败:', error)
        Toast.fail('购买失败: ' + error.message)
      } finally {
        this.purchaseData = null
        this.progressText = ''
        this.progressDetail = ''
      }
    },

    /**
     * 刷新代币数据
     */
    async refreshTokenData() {
      try {
        await tokenListStore.actions.refreshTokens()
        
        // 如果有选中的代币，也刷新其详情
        if (this.selectedToken) {
          const updatedToken = await tokenListStore.actions.getTokenDetails(
            this.selectedToken.tokenAddress
          )
          this.selectedToken = updatedToken
        }
      } catch (error) {
        console.error('刷新代币数据失败:', error)
      }
    },

    /**
     * 处理代币刷新
     */
    async handleRefreshToken(token) {
      try {
        const updatedToken = await tokenListStore.actions.getTokenDetails(
          token.tokenAddress
        )
        this.selectedToken = updatedToken
        Toast.success('数据已刷新')
      } catch (error) {
        console.error('刷新代币失败:', error)
        Toast.fail('刷新失败')
      }
    }
  }
}
</script>

<style scoped>
.token-marketplace {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
}

/* 自定义导航栏样式 */
.custom-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: env(safe-area-inset-top) 0 0 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: white;
}

/* 用户头像样式 */
.user-profile {
  cursor: pointer;
}

.profile-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.profile-avatar:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(102, 126, 234, 0.5);
}

.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-avatar svg {
  color: rgba(255, 255, 255, 0.8);
}

/* 主要内容 */
.main-content {
  padding: 20px;
  padding-top: 80px; /* 为固定导航栏留出空间 */
}

/* 顶部横幅 */
.top-banner {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
}

.banner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.fundraising-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fundraising-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.fundraising-amount {
  font-size: 20px;
  font-weight: 700;
  color: #4ade80;
}

.launch-rwa-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.launch-rwa-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.banner-content {
  display: flex;
  justify-content: center;
}

.token-preview-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.token-visual {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.token-icon-container {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.token-icon {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  object-fit: cover;
}

.token-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.token-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  line-height: 1.2;
}

.token-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.3;
}

.token-symbol-badge {
  display: inline-block;
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
}

.token-actions {
  display: flex;
  align-items: center;
}

.token-action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.token-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

/* 区块标题 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.section-subtitle {
  display: flex;
  align-items: center;
}

.progress-indicator {
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* 列表区域 */
.list-section {
  margin-top: 30px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.list-tabs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tab {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s;
}

.tab.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.notification-badge {
  position: relative;
}

.badge-count {
  background: #ef4444;
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

/* 搜索容器 */
.search-container {
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  margin-bottom: 15px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  z-index: 1;
}

.search-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 15px 15px 15px 45px;
  color: white;
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 过滤选项 */
.filter-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.filter-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  position: relative;
  appearance: none;
  transition: all 0.3s;
}

.filter-checkbox:checked {
  background: #667eea;
  border-color: #667eea;
}

.filter-checkbox:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.filter-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.filter-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

/* 钱包模态框 */
.wallet-modal {
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  padding: 5px;
  transition: color 0.3s;
}

.close-btn:hover {
  color: white;
}

.wallet-options {
  margin-bottom: 20px;
}

.wallet-option {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.05);
}

.wallet-option:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.wallet-logo {
  width: 40px;
  height: 40px;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-weight: bold;
  font-size: 14px;
}

.wallet-info {
  flex: 1;
}

.wallet-name {
  font-size: 16px;
  font-weight: bold;
  color: white;
  margin-bottom: 2px;
}

.wallet-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.connect-arrow {
  font-size: 18px;
  color: #667eea;
}

.wallet-tips {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 15px;
}

.tip-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.tip-icon {
  margin-right: 10px;
  font-size: 16px;
  color: #667eea;
}

.tip-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* 购买确认模态框 */
.purchase-modal {
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
}

.purchase-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.token-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.token-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.token-name {
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.token-symbol {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.purchase-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-item.total {
  border-bottom: none;
  font-weight: bold;
  font-size: 16px;
  color: #4ade80;
}

.label {
  color: rgba(255, 255, 255, 0.7);
}

.value {
  color: white;
  font-weight: 500;
}

.purchase-actions {
  display: flex;
  gap: 10px;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-1px);
}

.confirm-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
  transform: none;
}

/* 交易进度 */
.transaction-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  color: white;
}

.progress-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(102, 126, 234, 0.3);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.progress-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: white;
}

.progress-detail {
  font-size: 14px;
  opacity: 0.8;
  color: rgba(255, 255, 255, 0.8);
}

/* 预售功能样式 */
.presale-section {
  margin-bottom: 30px;
}

.casting {
  width: 100%;
  background: rgba(72, 71, 100, 0.2);
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
  border-radius: 24px;
  border: 1px solid rgba(182, 32, 224, 1);
  padding: 0 0 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.casting_tit {
  width: calc(100% - 32px);
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(151, 151, 151, 0.2);
}

.tit_box {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.casting_left {
  display: flex;
  align-items: center;
}

.casting_left img {
  width: 34px;
  height: 34px;
  border-radius: 17px;
}

.casting_left div {
  font-weight: bold;
  font-size: 16px;
  color: #fff;
  line-height: 19px;
  margin-left: 6px;
}

.casting_right {
  background: rgba(255, 0, 153, 0.2);
  border-radius: 11px;
  padding: 4px 7px 4px 5px;
  display: flex;
  align-items: center;
}

.casting_right img {
  width: 14px;
  margin-right: 2px;
}

.casting_right div {
  font-weight: 400;
  font-size: 10px;
  color: #FF0099;
  line-height: 12px;
}

.cas_mess {
  padding: 10px 16px 0;
  border-bottom: 1px solid rgba(16, 9, 27, 0.1);
  width: 100%;
  box-sizing: border-box;
}

.cas_mess .lab {
  margin-bottom: 6px;
  font-weight: 400;
  font-size: 12px;
  color: RGBA(167, 160, 173, 1);
  line-height: 18px;
}

.information {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.information img {
  width: 24px;
  margin-right: 8px;
}

.casting_content {
  width: calc(100% - 32px);
  padding: 0 16px;
  text-align: center;
}

.casting_lab {
  margin-top: 20px;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
  line-height: 19px;
}

.casting_bar {
  width: 100%;
  margin-top: 10px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  display: flex;
  justify-content: flex-end;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.progressbar {
  border-radius: 0 10px 10px 0;
  background: rgba(48, 64, 86, 1);
  height: 10px;
  width: 100%;
}

.num {
  margin-top: 10px;
  background: rgba(26, 23, 82, 0.41);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.num img {
  width: 32px;
  cursor: pointer;
  transition: transform 0.2s;
}

.num img:hover {
  transform: scale(1.1);
}

.num div {
  font-weight: bold;
  font-size: 16px;
  color: #FFFFFF;
  line-height: 20px;
}

.price {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price .lef {
  display: flex;
  align-items: center;
}

.price .lef img {
  width: 16px;
  margin-right: 2px;
}

.price .lef div {
  font-size: 14px;
  color: #FFFFFF;
  line-height: 18px;
}

.price .rig {
  font-weight: bold;
  font-size: 12px;
  color: #FFFFFF;
  line-height: 16px;
}

.zhuzao {
  margin-top: 12px;
  font-weight: bold;
  font-size: 12px;
  color: #FFFFFF;
  line-height: 16px;
  text-align: center;
}

.clab {
  margin: 12px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.clab_lef {
  display: flex;
  align-items: center;
}

.clab_lef div {
  font-weight: 500;
  font-size: 12px;
  color: RGBA(137, 130, 146, 1);
  line-height: 18px;
}

.clab_rig {
  font-weight: bold;
  font-size: 12px;
  color: #fff;
  line-height: 16px;
}

.casting_btn,
.casting_btn2 {
  margin-top: 24px;
  width: 100%;
  text-align: center;
  border-radius: 8px;
  padding: 13px 0 12px;
  font-weight: 600;
  font-size: 16px;
  color: #fff;
  line-height: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.casting_btn {
  background: linear-gradient(225deg, #FF5E67 0%, #7600AE 100%);
}

.casting_btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 94, 103, 0.3);
}

.casting_btn2 {
  background: #999;
  opacity: 0.8;
}

.coin_price {
  margin-top: 16px;
  font-weight: 400;
  font-size: 12px;
  color: #3CD8FD;
  line-height: 16px;
}

.coin_msg {
  margin-top: 16px;
  font-weight: 400;
  font-size: 12px;
  color: #3AFF2E;
  line-height: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .fundraising-info {
    align-self: flex-start;
  }

  .launch-rwa-btn {
    align-self: flex-end;
  }

  .token-preview-card {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .token-visual {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .token-info {
    align-items: center;
  }

  .section-title {
    font-size: 24px;
  }

  .list-title {
    font-size: 20px;
  }

  .header-content {
    padding: 12px 15px;
  }

  .main-content {
    padding: 15px;
    padding-top: 75px;
  }

  .filter-options {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .filter-item {
    justify-content: flex-start;
  }

  .filter-actions {
    justify-content: center;
  }

  /* 预售功能移动端优化 */
  .casting {
    margin: 0;
  }

  .num img {
    width: 40px;
    height: 40px;
  }

  .casting_btn,
  .casting_btn2 {
    padding: 16px 0;
    font-size: 18px;
    min-height: 48px;
  }
}
</style>
