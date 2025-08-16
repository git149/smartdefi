<template>
  <div class="token-detail-page">
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
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 返回按钮 -->
      <div class="return-section">
        <button @click="$router.go(-1)" class="return-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Return
        </button>
      </div>

      <!-- About CHOU 标题 -->
      <div class="page-title">
        <h2>About CHOU</h2>
      </div>

      <!-- 代币信息卡片 -->
      <div class="token-info-card">
        <div class="token-header">
          <div class="token-avatar">
  <div class="token-icon-wrapper">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 8L16 12L12 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 16L8 12L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
</div>
          <div class="token-details">
            <h3 class="token-name">{{ tokenInfo.name }}</h3>
            <p class="token-symbol">${{ tokenInfo.symbol }}</p>
            <div class="contract-address">
              <span class="address-text">{{ formatAddress(tokenInfo.contractAddress) }}</span>
              <button @click="copyAddress(tokenInfo.contractAddress)" class="copy-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              <button @click="openInExplorer(tokenInfo.contractAddress)" class="external-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="2"/>
                  <polyline points="15,3 21,3 21,9" stroke="currentColor" stroke-width="2"/>
                  <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
            
          </div>
        </div>

        <!-- 代币描述 -->
        <div class="token-description">
          <p>{{ tokenInfo.description }}</p>
        </div>
        
      </div>

      <!-- 操作按钮组 -->
      <div class="action-buttons">
        <button 
          v-for="(btn, index) in actionButtons" 
          :key="index"
          :class="['action-btn', { active: activeButton === index }]"
          @click="setActiveButton(index)"
        >
          {{ btn }}
        </button>
      </div>
        <!-- 预售内容区域 -->
<div v-if="activeButton === 1" class="presale-content">
  <!-- 买卖区域 -->
  <div class="buy-sell-section">
    <div class="buy-sell-tabs">
      <button 
        :class="['tab-btn', { active: buySellTab === 'buy' }]"
        @click="buySellTab = 'buy'"
      >
        Buy
      </button>
      <button 
        :class="['tab-btn', { active: buySellTab === 'sell' }]"
        @click="buySellTab = 'sell'"
      >
        Sell
      </button>
    </div>
    
    <div class="input-section">
      <div class="input-row">
        <label class="input-label">Input quantity</label>
        <button @click="setMaxAmount" class="max-btn">MAX</button>
      </div>
      <input 
        v-model="inputAmount" 
        type="number" 
        class="amount-input"
        placeholder="0.0"
      />
      <div class="balance-info">
        TRX balance: {{ formatNumber(trxBalance) }}
      </div>
    </div>
    
    <button @click="handleBuySell" class="action-button">
      {{ buySellTab === 'buy' ? 'BUY NOW' : 'SELL NOW' }}
    </button>
  </div>

  <!-- 流动性池详情 -->
  <div class="lp-details-section">
    <div class="lp-item">
      <span class="lp-label">总锁定LP</span>
      <span class="lp-value">{{ formatNumber(lpData.totalLocked) }}</span>
    </div>
    
    <div class="lp-item">
      <span class="lp-label">未解锁LP (60%)</span>
      <span class="lp-value">{{ formatNumber(lpData.unlocked) }}</span>
      <div class="lp-sub-info">({{ formatNumber(lpData.unlockedTrx) }} TRX + {{ formatNumber(lpData.unlockedToken) }} {{ tokenInfo.symbol }})</div>
    </div>
    
    <div class="lp-item">
      <span class="lp-label">已领取LP (20%)</span>
      <span class="lp-value">{{ formatNumber(lpData.claimed) }}</span>
    </div>
    
    <div class="lp-item">
      <span class="lp-label">可领取LP (20%)</span>
      <span class="lp-value">{{ formatNumber(lpData.claimable) }}</span>
    </div>
    
    <div class="lp-item">
      <span class="lp-label">将获得</span>
      <span class="lp-value">{{ countdownData.timeLeft }}</span>
      <div class="lp-sub-info">({{ formatNumber(lpData.willReceive) }} USDT)</div>
    </div>
    
    <div class="lp-item">
      <span class="lp-label">下次解锁时间</span>
      <span class="lp-value">{{ countdownData.nextUnlock }}</span>
    </div>
    
    <button @click="claimLp" class="receive-button">
      Receive
    </button>
  </div>
</div>

<!-- 代币基本信息表格和免责声明 -->
<div v-if="activeButton === 0" class="info-section-card">
  <div class="token-info-table">
    <div class="info-row">
      <div class="info-label">Name(Symbol)</div>
      <div class="info-value">{{ tokenInfo.symbol }}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Hard cap</div>
      <div class="info-value">{{ tokenInfo.hardCap }}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Soft cap</div>
      <div class="info-value">{{ tokenInfo.softCap }}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Max buy</div>
      <div class="info-value">{{ tokenInfo.maxBuy }}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Vesting</div>
      <div class="info-value">{{ tokenInfo.vesting }}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Dev share</div>
      <div class="info-value">{{ tokenInfo.devShare }}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Supply for LP</div>
      <div class="info-value">{{ tokenInfo.supplyForLP }}</div>
    </div>
    <div class="info-row">
      <div class="info-label">TRX pair</div>
      <div class="info-value">{{ tokenInfo.trxPair }}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Backing</div>
      <div class="info-value">{{ tokenInfo.backing }}</div>
    </div>
  </div>

  <!-- 免责声明 -->
  <div class="disclaimer-section">
    <div class="disclaimer-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    </div>
    <div class="disclaimer-text">
      <p><strong>Disclaimer:</strong> The listed tokens have nothing to do with TRX, please use at your own risk</p>
    </div>
  </div>
</div>

<!-- 资金曲线百分比 -->
<div v-if="activeButton === 0" class="info-section-card funding-curve-card">
  <div class="curve-title">Binding Curve Percentage</div>
  
  <div class="percentage-display">
    {{ fundingPercentage.toFixed(2) }}%
  </div>

  <div class="progress-bar-container">
    <div class="progress-bar" :style="{ width: fundingPercentage + '%' }"></div>
    <div class="progress-handle" :style="{ left: fundingPercentage + '%' }"></div>
  </div>

  <div class="curve-description">
    <p>There are still 137,620,713.17 CHO available for sale in the bonding curve, and 56,874.62 TRX in the bonding curve</p>
    <p>When the market value reaches $111,937.82, all liquidity in the bonding curve will be deposited into SunSwap and burned.</p>
    <p>Progress increases as the price rises.</p>
  </div>
</div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'TokenDetailPage',
  data() {
    return {
      loading: false,
      activeButton: 0,
      actionButtons: ['信息', '预售', '内盘'],
      fundingPercentage: 30.87,
      tokenInfo: {
  name: 'CHOU',
  symbol: 'CHO',
  icon: require('@/assets/img/buyToken_logo.png'),
  contractAddress: 'TKzxrLYDzpkkJQjYvgTdpQQQQQQQQQQQQQ',
  description: 'CHOU is a revolutionary token that combines traditional finance with decentralized technology, offering unique opportunities for investors and traders alike.',
  // 修改为UI图中的参数格式
  hardCap: '2000 TRX',
  softCap: '1000 TRX',
  maxBuy: '30 TRX',
  vesting: '5 % every 7 days',
  devShare: '10%',
  supplyForLP: '310.000(10%)',
  trxPair: '35% TRX / 70% union',
  backing: '35% TRX / 70% union'
},
        // 预售相关数据
    buySellTab: 'buy',
    inputAmount: '',
    trxBalance: 1648523,
    
    // LP数据
    lpData: {
      totalLocked: 165416165165165,
      unlocked: 515165165,
      unlockedTrx: 500,
      unlockedToken: 4012165165.551,
      claimed: 5615011,
      claimable: 548651,
      willReceive: 19.6606
    },
    
    // 倒计时数据
    countdownData: {
      timeLeft: '13D 14H 23M',
      nextUnlock: '12D 12H 18M 30S'
    
      },
      tokenInfoData: [
        { label: 'Name/Symbol', value: 'CHO' },
        { label: 'Hard cap', value: '2000 TRX' },
        { label: 'Soft cap', value: '10%' },
        { label: 'Max buy', value: '30 TRX' },
        { label: 'Vesting', value: '5 % every 7 days' },
        { label: 'Dev share', value: '1%' },
        { label: 'Supply for LP', value: '310,000(100%)' },
        { label: 'TRX pair', value: '35% TRX / 70 % union' },
        { label: 'Backing', value: '35% TRX / 70 % union' }
      ],
      remainingTokens: '117,800,717',
      liquidityTokens: '206,588,235',
      holdersList: [
        { label: 'Owner', address: 'TKzxrLYDzpkkJQjYvgTdpQQQQQQQQQQQQQ', percentage: '0.36%' },
        { label: 'Owner2Tc...', address: 'TKzxrLYDzpkkJQjYvgTdpQQQQQQQQQQQQQ', percentage: '0.36%' },
        { label: 'Owner3Tc...', address: 'TKzxrLYDzpkkJQjYvgTdpQQQQQQQQQQQQQ', percentage: '0.36%' },
        { label: 'Owner4Tc...', address: 'TKzxrLYDzpkkJQjYvgTdpQQQQQQQQQQQQQ', percentage: '0.36%' },
        { label: 'Owner5Tc...', address: 'TKzxrLYDzpkkJQjYvgTdpQQQQQQQQQQQQQ', percentage: '0.36%' },
        { label: 'Owner6Tc...', address: 'TKzxrLYDzpkkJQjYvgTdpQQQQQQQQQQQQQ', percentage: '0.36%' }
      ],
      allHolders: [], // 存储所有持有者数据
      displayedHoldersCount: 6 // 当前显示的持有者数量
    }
  },
  computed: {
    // 计算资金曲线的动态数据
    fundingCurveData() {
      return {
        percentage: this.fundingPercentage,
        remaining: this.formatNumber(this.remainingTokens),
        liquidity: this.formatNumber(this.liquidityTokens),
        symbol: this.tokenInfo.symbol
      }
    },
    // 判断是否还有更多持有者可以加载
    hasMoreHolders() {
      return this.displayedHoldersCount < this.allHolders.length;
    }
  },
  mounted() {
    this.initializeData();
      // 添加倒计时更新
  this.updateCountdown();
  },
  methods: {
    // 初始化页面数据
    async initializeData() {
      this.loading = true;
      try {
        // 这里可以添加从API获取代币详情数据的逻辑
        await this.loadTokenDetails();
        await this.loadHoldersData();
      } catch (error) {
        console.error('Failed to load token details:', error);
        this.$toast('加载代币详情失败');
      } finally {
        this.loading = false;
      }
    },

    // 加载代币详情数据
    async loadTokenDetails() {
      // 模拟API调用，实际项目中应该从后端获取数据
      const tokenId = this.$route.params.id || 'CHOU';
      console.log('Loading token details for:', tokenId);
      // const response = await this.$http.get(`/api/tokens/${tokenId}`);
      // this.tokenInfo = response.data;
    },

    // 加载持有者数据
    async loadHoldersData() {
      // 模拟更多持有者数据
      this.allHolders = [
        ...this.holdersList,
        { label: 'Owner7Tc...', address: 'TKzxrLYDzpkkJQjYvgTdpQQQQQQQQQQQQQ', percentage: '0.35%' },
        { label: 'Owner8Tc...', address: 'TKzxrLYDzpkkJQjYvgTdpQQQQQQQQQQQQQ', percentage: '0.34%' },
        { label: 'Owner9Tc...', address: 'TKzxrLYDzpkkJQjYvgTdpQQQQQQQQQQQQQ', percentage: '0.33%' },
        { label: 'Owner10Tc...', address: 'TKzxrLYDzpkkJQjYvgTdpQQQQQQQQQQQQQ', percentage: '0.32%' }
      ];
    },


    // 倒计时更新// 在 methods 中添加这些方法
// 设置最大数量
setMaxAmount() {
  if (this.buySellTab === 'buy') {
    this.inputAmount = this.trxBalance.toString();
  } else {
    this.inputAmount = '1000000'; // 示例值
  }
},

// 处理买卖操作
async handleBuySell() {
  if (!this.inputAmount || parseFloat(this.inputAmount) <= 0) {
    this.$toast('请输入有效数量');
    return;
  }
  
  try {
    if (this.buySellTab === 'buy') {
      await this.handleBuy();
    } else {
      await this.handleSell();
    }
  } catch (error) {
    console.error('交易失败:', error);
    this.$toast('交易失败，请重试');
  }
},

// 处理购买
async handleBuy() {
  const amount = parseFloat(this.inputAmount);
  if (amount > this.trxBalance) {
    this.$toast('余额不足');
    return;
  }
  
  console.log('购买数量:', amount);
  this.$toast('购买请求已提交');
  
  setTimeout(() => {
    this.inputAmount = '';
    this.$toast('购买成功！');
  }, 2000);
},

// 处理卖出
async handleSell() {
  const amount = parseFloat(this.inputAmount);
  
  console.log('卖出数量:', amount);
  this.$toast('卖出请求已提交');
  
  setTimeout(() => {
    this.inputAmount = '';
    this.$toast('卖出成功！');
  }, 2000);
},

// 领取LP
async claimLp() {
  try {
    console.log('领取LP');
    this.$toast('领取请求已提交');
    
    setTimeout(() => {
      this.$toast('领取成功！');
    }, 2000);
  } catch (error) {
    console.error('领取失败:', error);
    this.$toast('领取失败，请重试');
  }
},

// 更新倒计时
updateCountdown() {
  // 这里可以添加实际的倒计时逻辑
  console.log('倒计时更新');
},
    // 设置活动按钮
    setActiveButton(index) {
      this.activeButton = index;
      // 根据不同的按钮显示不同的内容
      switch(index) {
        case 0:
          // 显示基本信息
          break;
        case 1:
          // 显示详细信息
          break;
        case 2:
          // 显示其他内容
          break;
      }
    },

    // 格式化地址显示
    formatAddress(address) {
      if (!address) return '';
      return `${address.slice(0, 6)}...${address.slice(-6)}`;
    },

    // 格式化数字显示
    formatNumber(num) {
      if (typeof num === 'string') {
        return num;
      }
      return num.toLocaleString();
    },

    // 复制地址到剪贴板
    async copyAddress(address) {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(address);
          this.$toast('地址已复制到剪贴板');
        } else {
          // 兼容旧浏览器的复制方法
          const textArea = document.createElement('textarea');
          textArea.value = address;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy'); // 虽然已弃用，但仍需要支持旧浏览器
            this.$toast('地址已复制到剪贴板');
          } catch (err) {
            console.error('Fallback copy failed:', err);
            this.$toast('复制失败，请手动复制');
          }
          document.body.removeChild(textArea);
        }
      } catch (error) {
        console.error('Failed to copy address:', error);
        this.$toast('复制失败，请手动复制');
      }
    },

    // 在区块链浏览器中打开地址
    openInExplorer(address) {
      const explorerUrl = `https://tronscan.org/#/address/${address}`;
      window.open(explorerUrl, '_blank');
    },

    // 加载更多持有者
    loadMoreHolders() {
      if (this.hasMoreHolders) {
        this.displayedHoldersCount = Math.min(
          this.displayedHoldersCount + 6,
          this.allHolders.length
        );
        // 更新显示的持有者列表
        this.holdersList = this.allHolders.slice(0, this.displayedHoldersCount);
      } else {
        this.$toast('没有更多持有者数据');
      }
    },
     // 设置最大数量
  setMaxAmount() {
    if (this.buySellTab === 'buy') {
      this.inputAmount = this.trxBalance.toString();
    } else {
      // 如果是卖出，设置代币余额
      this.inputAmount = '1000000'; // 示例值，实际应该从钱包获取
    }
  },
  
  // 处理买卖操作
  async handleBuySell() {
    if (!this.inputAmount || parseFloat(this.inputAmount) <= 0) {
      this.$toast('请输入有效数量');
      return;
    }
    
    try {
      if (this.buySellTab === 'buy') {
        await this.handleBuy();
      } else {
        await this.handleSell();
      }
    } catch (error) {
      console.error('交易失败:', error);
      this.$toast('交易失败，请重试');
    }
  },
  
  // 处理购买
  async handleBuy() {
    const amount = parseFloat(this.inputAmount);
    if (amount > this.trxBalance) {
      this.$toast('余额不足');
      return;
    }
    
    // 这里添加实际的购买逻辑
    console.log('购买数量:', amount);
    this.$toast('购买请求已提交');
    
    // 模拟交易
    setTimeout(() => {
      this.inputAmount = '';
      this.$toast('购买成功！');
    }, 2000);
  },
  
  // 处理卖出
  async handleSell() {
    const amount = parseFloat(this.inputAmount);
    
    // 这里添加实际的卖出逻辑
    console.log('卖出数量:', amount);
    this.$toast('卖出请求已提交');
    
    // 模拟交易
    setTimeout(() => {
      this.inputAmount = '';
      this.$toast('卖出成功！');
    }, 2000);
  },
  
  // 领取LP
  async claimLp() {
    try {
      // 这里添加实际的领取逻辑
      console.log('领取LP');
      this.$toast('领取请求已提交');
      
      // 模拟领取
      setTimeout(() => {
        this.$toast('领取成功！');
      }, 2000);
    } catch (error) {
      console.error('领取失败:', error);
      this.$toast('领取失败，请重试');
    }
  },
  
  // 更新倒计时
  updateCountdown() {
    // 这里添加实际的倒计时逻辑
    // 可以使用 setInterval 来更新倒计时数据
  }
  }
}
</script>

<style lang="scss" scoped>
.token-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 自定义导航栏 */
.custom-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    height: 56px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .back-btn {
        background: none;
        border: none;
        color: #ffffff;
        padding: 8px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }

      .header-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        color: #ffffff;
      }
    }
  }
}

/* 主要内容区域 */
.main-content {
  padding-top: 72px;
  padding-bottom: 20px;
  padding-left: 16px;
  padding-right: 16px;
}

/* 返回按钮 */
.return-section {
  margin-bottom: 16px;

  .return-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: #8b9dc3;
    font-size: 14px;
    padding: 8px 0;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #ffffff;
    }
  }
}

/* 页面标题 */
.page-title {
  margin-bottom: 20px;

  h2 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: #ffffff;
  }
}

/* 代币信息卡片 */
.token-info-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;

  .token-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;

    .token-avatar {
      .token-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
      }
    }

    .token-details {
      flex: 1;

      .token-name {
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 4px 0;
        color: #ffffff;
      }

      .token-symbol {
        font-size: 16px;
        color: #8b9dc3;
        margin: 0 0 12px 0;
      }

      .contract-address {
        display: flex;
        align-items: center;
        gap: 8px;

        .address-text {
          font-size: 14px;
          color: #8b9dc3;
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .copy-btn, .external-btn {
          background: none;
          border: none;
          color: #8b9dc3;
          padding: 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: color 0.2s;

          &:hover {
            color: #ffffff;
          }
        }
      }
    }
  }
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;

  .action-btn {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: #8b9dc3;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      background: rgba(59, 130, 246, 0.2);
      border-color: #3b82f6;
      color: #3b82f6;
    }

    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }
  }
}

/* 代币基本信息表格 */
.token-info-table {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  margin-bottom: 24px;
  overflow: hidden;

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    &:last-child {
      border-bottom: none;
    }

    .info-label {
      font-size: 14px;
      color: #8b9dc3;
      font-weight: 500;
    }

    .info-value {
      font-size: 14px;
      color: #ffffff;
      font-weight: 600;
      text-align: right;
    }
  }
}

/* 资金曲线 */
.funding-curve {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;

  .curve-title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 12px;
  }

  .curve-percentage {
    font-size: 32px;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 16px;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 16px;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
  }

  .curve-description {
    font-size: 12px;
    color: #8b9dc3;
    line-height: 1.5;
  }
}

/* 持有者分布 */
.holders-distribution {
  .distribution-title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 16px;
  }

  .holders-list {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 16px;

    .holder-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      &:last-child {
        border-bottom: none;
      }

      .holder-info {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .holder-label {
          font-size: 14px;
          color: #ffffff;
          font-weight: 500;
        }

        .holder-address {
          font-size: 12px;
          color: #8b9dc3;
          font-family: 'Monaco', 'Menlo', monospace;
        }
      }

      .holder-percentage {
        font-size: 14px;
        color: #ffffff;
        font-weight: 600;
      }
    }

    .loading-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 20px;
      color: #8b9dc3;
      font-size: 14px;

      .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-top: 2px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }
  }

  .load-more-btn {
    width: 100%;
    padding: 12px;
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: #8b9dc3;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
      color: #ffffff;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .no-more-data {
    text-align: center;
    padding: 16px;
    color: #8b9dc3;
    font-size: 14px;
  }
}

/* 动画效果 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Toast 样式增强 */
.van-toast {
  background: rgba(0, 0, 0, 0.8) !important;
  color: #ffffff !important;
  border-radius: 8px !important;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 页面进入动画 */
.token-detail-page {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片悬停效果增强 */
.token-info-card,
.token-info-table,
.funding-curve,
.holders-list {
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
}

/* 按钮点击效果 */
.action-btn,
.load-more-btn,
.back-btn,
.return-btn {
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s;
  }

  &:active::before {
    width: 300px;
    height: 300px;
  }
}

/* 响应式设计 */
@media (max-width: 375px) {
  .main-content {
    padding-left: 12px;
    padding-right: 12px;
  }

  .token-info-card {
    padding: 16px;

    .token-header {
      gap: 12px;

      .token-avatar .token-icon {
        width: 50px;
        height: 50px;
      }

      .token-details {
        .token-name {
          font-size: 20px;
        }

        .token-symbol {
          font-size: 14px;
        }
      }
    }
  }

  .action-buttons {
    gap: 8px;

    .action-btn {
      padding: 10px 12px;
      font-size: 13px;
    }
  }

  .funding-curve {
    padding: 16px;

    .curve-percentage {
      font-size: 28px !important;
    }
  }

  .token-info-table .info-row {
    padding: 12px 16px;

    .info-label, .info-value {
      font-size: 13px;
    }
  }

  .holders-distribution .holders-list .holder-item {
    padding: 12px 16px;

    .holder-info {
      .holder-label {
        font-size: 13px;
      }

      .holder-address {
        font-size: 11px;
      }
    }

    .holder-percentage {
      font-size: 13px;
    }
  }
}

/* 大屏幕适配 */
@media (min-width: 768px) {
  .token-detail-page {
    max-width: 480px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  }
}

/* 横屏适配 */
@media (orientation: landscape) and (max-height: 500px) {
  .custom-header {
    .header-content {
      padding: 8px 16px;
      height: 48px;
    }
  }

  .main-content {
    padding-top: 60px;
  }

  .token-info-card {
    padding: 16px;
  }

  .funding-curve {
    padding: 16px;
  }
}

/* 深色模式增强 */
@media (prefers-color-scheme: dark) {
  .token-detail-page {
    background: linear-gradient(180deg, #0f0f23 0%, #1a1a2e 100%);
  }
}

/* 预售内容样式 */
.presale-content {
  animation: fadeIn 0.3s ease-in;
}

/* 买卖区域 */
.buy-sell-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.buy-sell-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  
  .tab-btn {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: #8b9dc3;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    
    &.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: #ffffff;
    }
    
    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }
  }
}

.input-section {
  margin-bottom: 20px;
  
  .input-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .input-label {
      font-size: 14px;
      color: #8b9dc3;
    }
    
    .max-btn {
      background: #3b82f6;
      border: none;
      color: #ffffff;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background: #2563eb;
      }
    }
  }
  
  .amount-input {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: #ffffff;
    font-size: 16px;
    margin-bottom: 8px;
    
    &::placeholder {
      color: #8b9dc3;
    }
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
    }
  }
  
  .balance-info {
    font-size: 12px;
    color: #8b9dc3;
  }
}

.action-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
}

/* LP详情区域 */
.lp-details-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
}

.lp-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
  
  .lp-label {
    font-size: 14px;
    color: #8b9dc3;
    flex: 1;
  }
  
  .lp-value {
    font-size: 14px;
    color: #ffffff;
    font-weight: 600;
    text-align: right;
    flex: 1;
  }
  
  .lp-sub-info {
    font-size: 12px;
    color: #8b9dc3;
    margin-top: 4px;
    text-align: right;
    flex: 1;
  }
}

.receive-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 代币描述样式 */
.token-description {
  margin-top: 16px;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  p {
    font-size: 14px;
    line-height: 1.6;
    color: #8b9dc3;
    margin: 0;
  }
}

/* 操作按钮样式 */
.token-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #8b9dc3;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.share-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* 修改合约地址样式 */
.contract-address .address-text {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #8b9dc3;
}

/* 代币头像样式 */
.token-avatar {
  .token-icon-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #fbbf24; /* 黄色背景 */
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
  }
}

/* 调整卡片布局 */
.token-info-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.token-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.token-details {
  flex: 1;
  
  .token-name {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 4px 0;
    color: #ffffff;
  }
  
  .token-symbol {
    font-size: 16px;
    color: #8b9dc3;
    margin: 0 0 12px 0;
  }
}

/* 操作按钮样式 */
.token-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #8b9dc3;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.twitter-btn:hover {
  background: rgba(29, 161, 242, 0.2);
  color: #1da1f2;
}

.telegram-btn:hover {
  background: rgba(0, 136, 204, 0.2);
  color: #0088cc;
}

.website-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* 代币描述样式 */
.token-description {
  margin-top: 16px;
  
  p {
    font-size: 14px;
    line-height: 1.6;
    color: #8b9dc3;
    margin: 0;
  }
}

/* 通用卡片样式 */
.info-section-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

/* 代币信息表格样式 */
.token-info-table .info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.token-info-table .info-row:last-child {
  border-bottom: none;
}

.token-info-table .info-label {
  font-size: 14px;
  color: #8b9dc3;
  font-weight: 500;
}

.token-info-table .info-value {
  font-size: 14px;
  color: #ffffff;
  font-weight: 600;
  text-align: right;
}

/* 免责声明样式 */
.disclaimer-section {
  display: flex;
  align-items: flex-start;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
}

.disclaimer-icon {
  color: #ef4444;
  margin-right: 12px;
  flex-shrink: 0;
}

.disclaimer-text {
  flex: 1;
}

.disclaimer-text p {
  color: #ef4444;
  font-size: 13px;
  line-height: 1.5;
  margin: 0 0 4px 0;
}

.disclaimer-text p:last-child {
  margin-bottom: 0;
}

.disclaimer-text strong {
  font-weight: 600;
}

/* 资金曲线卡片样式 */
.funding-curve-card .curve-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
}

.percentage-display {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 20px;
  display: inline-block;
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
}

/* 进度条样式 */
.progress-bar-container {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  margin-bottom: 20px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

/* 曲线描述文字样式 */
.curve-description p {
  color: #8b9dc3;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.curve-description p:last-child {
  margin-bottom: 0;
}

/* 通用卡片样式 */
.info-section-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 代币信息表格样式 */
.token-info-table {
  margin-bottom: 0;
}

.token-info-table .info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.token-info-table .info-row:last-child {
  border-bottom: none;
}

.token-info-table .info-label {
  font-size: 14px;
  color: #8b9dc3;
  font-weight: 500;
}

.token-info-table .info-value {
  font-size: 14px;
  color: #ffffff;
  font-weight: 600;
  text-align: right;
}

/* 免责声明样式 */
.disclaimer-section {
  display: flex;
  align-items: flex-start;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
}

.disclaimer-icon {
  color: #ef4444;
  margin-right: 12px;
  flex-shrink: 0;
  margin-top: 2px;
}

.disclaimer-text {
  flex: 1;
}

.disclaimer-text p {
  color: #ef4444;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.disclaimer-text strong {
  font-weight: 600;
}

/* 资金曲线卡片样式 */
.funding-curve-card .curve-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
}

.percentage-display {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 20px;
  display: inline-block;
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  text-align: center;
}

/* 进度条样式 */
.progress-bar-container {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  margin-bottom: 20px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

/* 曲线描述文字样式 */
.curve-description p {
  color: #8b9dc3;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.curve-description p:last-child {
  margin-bottom: 0;
}

/* 响应式调整 */
@media (max-width: 375px) {
  .info-section-card {
    padding: 16px;
    margin-bottom: 12px;
  }
  
  .token-info-table .info-row {
    padding: 10px 0;
  }
  
  .token-info-table .info-label,
  .token-info-table .info-value {
    font-size: 13px;
  }
  
  .percentage-display {
    font-size: 20px;
    padding: 10px 16px;
  }
  
  .curve-description p {
    font-size: 12px;
  }
}
</style>
