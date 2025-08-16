<template>
  <div class="token-detail-page">
    <!-- 自定义导航栏 -->
    <div class="custom-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="$router.go(-1)" class="back-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
          <h1 class="header-title">RWAunion</h1>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 添加加载状态 -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      <!-- 返回按钮 -->
      <div class="return-section">
        <button @click="$router.go(-1)" class="return-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
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
              🐸
            </div>
          </div>
          <div class="token-details">
            <h3 class="token-name">{{ tokenInfo.name }}</h3>
            <p class="token-symbol">${{ tokenInfo.symbol }}</p>
            <div class="contract-address">
              <span class="address-text">{{ formatAddress(tokenInfo.contractAddress) }}</span>
              <button @click="copyAddress(tokenInfo.contractAddress)" class="copy-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                    stroke="currentColor" stroke-width="2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2" />
                </svg>
              </button>
              <button @click="openInExplorer(tokenInfo.contractAddress)" class="external-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor"
                    stroke-width="2" />
                  <polyline points="15,3 21,3 21,9" stroke="currentColor" stroke-width="2" />
                  <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 代币描述 -->
        <div class="token-description">
          <p>{{ tokenInfo.description }}</p>
        </div>

        <!-- 社交媒体按钮 -->
        <div class="social-actions">
          <button class="social-btn twitter-btn" @click="openTwitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </button>
          <button class="social-btn telegram-btn" @click="openTelegram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </button>
          <button class="social-btn website-btn" @click="openWebsite">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="m12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 操作按钮组 -->
      <div class="action-buttons">
        <button v-for="(btn, index) in actionButtons" :key="index"
          :class="['action-btn', { active: activeButton === index }]" @click="setActiveButton(index)">
          {{ btn }}
        </button>
      </div>

      <!-- 信息区域内容 -->
      <div v-if="activeButton === 0" class="info-content">
        <!-- 代币基本信息表格 -->
        <div class="info-section-card">
          <div class="token-info-table">
            <div class="info-row">
              <div class="info-label">Token name</div>
              <div class="info-value">{{ tokenInfo.tokenName }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Name(Symbol)</div>
              <div class="info-value">{{ tokenInfo.nameSymbol }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Supply</div>
              <div class="info-value">{{ tokenInfo.supply }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Tokenomic preset</div>
              <div class="info-value">{{ tokenInfo.tokenomicPreset }}</div>
            </div>
          </div>

          <!-- 免责声明 -->
          <div class="disclaimer-section">
            <div class="disclaimer-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div class="disclaimer-text">
              <p><strong>Disclaimer:</strong> The listed tokens have nothing to do with TRX, please use at your own risk
              </p>
            </div>
          </div>
        </div>

        <!-- Token for LGE 详情 -->
        <div class="info-section-card">
          <h3 class="section-title">Token for LGE</h3>
          <div class="lge-info-table">
            <div class="info-row">
              <div class="info-label">Token for LGE</div>
              <div class="info-value">{{ tokenInfo.tokenForLGE }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">TST/TRX rate</div>
              <div class="info-value">{{ tokenInfo.tstTrxRate }}</div>
            </div>
            <!-- 修改为 -->
            <div class="info-row">
              <div class="info-label">Soft cap</div>
              <div class="info-value">{{ tokenInfo.softCap }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Hard cap</div>
              <div class="info-value">{{ tokenInfo.hardCap }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Min buy</div>
              <div class="info-value">{{ tokenInfo.minBuy }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Max buy</div>
              <div class="info-value">{{ tokenInfo.maxBuy }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Start time</div>
              <div class="info-value">{{ tokenInfo.startTime }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">End time</div>
              <div class="info-value">{{ tokenInfo.endTime }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Duration</div>
              <div class="info-value">{{ tokenInfo.duration }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Vesting delay</div>
              <div class="info-value">{{ tokenInfo.vestingDelay }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Vesting rate(%)</div>
              <div class="info-value">{{ tokenInfo.vestingRate }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Vesting rounds</div>
              <div class="info-value">{{ tokenInfo.vestingRounds }}</div>
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
        </div>

        <!-- 绑定曲线百分比 -->
        <div class="info-section-card">
          <div class="curve-title">Binding Curve Percentage</div>

          <div class="percentage-display">
            {{ fundingPercentage.toFixed(2) }}%
          </div>

          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: fundingPercentage + '%' }"></div>
            <div class="progress-handle" :style="{ left: fundingPercentage + '%' }"></div>
          </div>

          <div class="curve-description">
            <p>When the progress reaches 100%, the casting will end.</p>
          </div>
        </div>

        <!-- 预售输入区域 -->
        <div class="info-section-card">
          <div class="input-section">
            <div class="input-row">
              <label class="input-label">Input quantity</label>
              <button @click="setMaxPresaleAmount" class="max-btn">MAX</button>
            </div>
            <input v-model="presaleInputAmount" type="number" class="amount-input" placeholder="0.0" />
            <div class="balance-info">
              TRX balance: {{ formatNumber(trxBalance) }}
            </div>
          </div>

          <button @click="enterPresale" class="enter-presale-btn">
            Enter presale
          </button>
        </div>

        <!-- 内盘抢购区域 -->
        <div class="info-section-card">
          <div class="internal-market-title">RWAUnion 内盘抢购</div>
          <div class="internal-market-desc">
            白名单用户可在外部市场开放前一小时在内盘预购
          </div>

          <div class="quantity-selector">
            <button @click="decreaseInternalAmount" class="quantity-btn">-</button>
            <span class="quantity-display">{{ internalMarketAmount }} TRX</span>
            <button @click="increaseInternalAmount" class="quantity-btn">+</button>
          </div>

          <div class="balance-info">
            TRX balance: {{ formatNumber(trxBalance) }}
          </div>

          <div class="quota-info">
            <span class="quota-label">内盘额度:</span>
            <span class="quota-value">{{ internalMarketQuota }}份</span>
          </div>

          <button @click="buyInternalMarket" class="buy-now-btn">
            BUY NOW
          </button>

          <div class="real-time-price">
            {{ realTimePrice }}
          </div>
        </div>
      </div>

      <!-- 预售内容区域 -->
      <div v-if="activeButton === 1" class="presale-content">
        <!-- 买卖区域 -->
        <div class="buy-sell-section">
          <div class="buy-sell-tabs">
            <button :class="['tab-btn', { active: buySellTab === 'buy' }]" @click="buySellTab = 'buy'">
              Buy
            </button>
            <button :class="['tab-btn', { active: buySellTab === 'sell' }]" @click="buySellTab = 'sell'">
              Sell
            </button>
          </div>

          <div class="input-section">
            <div class="input-row">
              <label class="input-label">Input quantity</label>
              <button @click="setMaxAmount" class="max-btn">MAX</button>
            </div>
            <input v-model="inputAmount" type="number" class="amount-input" placeholder="0.0" />
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
            <div class="lp-sub-info">({{ formatNumber(lpData.unlockedTrx) }} TRX + {{ formatNumber(lpData.unlockedToken)
            }} {{ tokenInfo.symbol }})</div>
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
    </div>
  </div>
</template>

<script>
import TokenService from '../tron/services/TokenService';
import PresaleService from '../tron/services/PresaleService';

export default {
  name: 'TokenDetailPage',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      error: null,
      activeButton: 0,
      actionButtons: ['信息', '预售', '内盘'],

      // 代币信息
      tokenInfo: {
        name: 'CHOU',
        symbol: 'CHO',
        contractAddress: '0xbDd4A37C18327652BbbF6d90888A2f3969e4d6el',
        description: 'PEPE visits all northern countries and regions in 2025 - Alaska, Canada, Greenland, Iceland, Norway, Sweden, Finland and Siberia. He is not scare from the cold and polar bears. PEPE enjoys the beautiful north nature and the northern lights.',

        // 基本信息
        tokenName: 'CHO',
        nameSymbol: 'CHO',
        supply: '210000000',
        tokenomicPreset: '0.5%/0.5%',

        // LGE相关参数
        tokenForLGE: '100%',
        tstTrxRate: '1 TST=1 TRX',
        softCap: '0-1000TRX',
        hardCap: '0-1000TRX',
        minBuy: '500 TRX',
        maxBuy: '500 TRX',
        startTime: '2025/08/15 14:14(4d 2h)',
        endTime: '2025/08/15 14:14(4d 2h)',
        duration: '10 days',
        vestingDelay: '10 days',
        vestingRate: '10%',
        vestingRounds: '5 rounds',
        trxPair: '25% TRX / 50% union',
        backing: '25% TRX / 50% union'
      },

      // 资金曲线数据
      fundingPercentage: 30.89,

      // 预售相关数据
      presaleInputAmount: '',
      trxBalance: 1648523,
      internalMarketQuota: 3,
      realTimePrice: '1 TRX ≈ 651 RWAUnion',
      internalMarketAmount: 100,

      // 买卖相关数据
      buySellTab: 'buy',
      inputAmount: '',

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
      }
    }
  },

  mounted() {
    this.initializeData();
    this.updateCountdown();
  },

  methods: {
    async initializeData() {
      this.loading = true;
      try {
        // 1. 加载代币详情
        await this.loadTokenDetails();

        // 2. 加载预售信息
        await this.loadPresaleInfo();

        // 3. 加载用户余额
        await this.loadUserBalance();

      } catch (error) {
        console.error('Failed to initialize data:', error);
        this.$toast('数据加载失败');
      } finally {
        this.loading = false;
      }
    },

    async loadTokenDetails() {
      const params = this.getUrlParams();
      console.log('Loading token details with params:', params);

      // 如果有tokenAddress，直接使用
      if (params.tokenAddress && this.validateAddress(params.tokenAddress)) {
        await this.loadTokenByAddress(params.tokenAddress);
      }
      // 如果有tokenId，通过ID获取
      else if (params.tokenId) {
        await this.loadTokenById(params.tokenId);
      }
      // 默认加载CHOU代币
      else {
        await this.loadDefaultToken();
      }
    },
    // 通过地址加载代币
    async loadTokenByAddress(tokenAddress) {
      try {
        const tokenService = new TokenService(tokenAddress);
        const tokenInfo = await tokenService.getTokenInfo();

        this.tokenInfo = {
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          contractAddress: tokenAddress,
          description: this.tokenInfo.description, // 保持默认描述
          tokenName: tokenInfo.name,
          nameSymbol: tokenInfo.symbol,
          supply: tokenInfo.totalSupply.toString(),
          tokenomicPreset: '0.5%/0.5%', // 暂时保持默认值
          // 保持其他LGE参数的默认值
          tokenForLGE: '100%',
          tstTrxRate: '1 TST=1 TRX',
          softCap: '0-1000TRX',
          hardCap: '0-1000TRX',
          minBuy: '500 TRX',
          maxBuy: '500 TRX',
          startTime: '2025/08/15 14:14(4d 2h)',
          endTime: '2025/08/15 14:14(4d 2h)',
          duration: '10 days',
          vestingDelay: '10 days',
          vestingRate: '10%',
          vestingRounds: '5 rounds',
          trxPair: '25% TRX / 50% union',
          backing: '25% TRX / 50% union'
        };
      } catch (error) {
        console.error('Failed to load token by address:', error);
        this.$toast('代币信息加载失败');
      }
    },

    // 通过ID加载代币
    async loadTokenById(tokenId) {
      console.log('Loading token by ID:', tokenId);
      // 暂时使用默认数据
      this.loadDefaultToken();
    },

    // 加载默认代币
    async loadDefaultToken() {
      console.log('Loading default token');
      // 保持现有的默认数据不变
    },

    // 加载预售信息
    async loadPresaleInfo() {
      const params = this.getUrlParams();

      if (params.presaleAddress && this.validateAddress(params.presaleAddress)) {
        try {
          const presaleService = new PresaleService(params.presaleAddress);
          const presaleInfo = await presaleService.getPresaleBasicInfo();

          // 更新预售相关参数
          this.tokenInfo = {
            ...this.tokenInfo,
            tokenForLGE: presaleInfo.tokenForLGE || '100%',
            tstTrxRate: presaleInfo.tstTrxRate || '1 TST=1 TRX',
            softCap: presaleInfo.softCap || '0-1000TRX',
            hardCap: presaleInfo.hardCap || '0-1000TRX',
            minBuy: presaleInfo.minBuy || '500 TRX',
            maxBuy: presaleInfo.maxBuy || '500 TRX',
            startTime: presaleInfo.startTime || '2025/08/15 14:14(4d 2h)',
            endTime: presaleInfo.endTime || '2025/08/15 14:14(4d 2h)',
            duration: presaleInfo.duration || '10 days',
            vestingDelay: presaleInfo.vestingDelay || '10 days',
            vestingRate: presaleInfo.vestingRate || '10%',
            vestingRounds: presaleInfo.vestingRounds || '5 rounds',
            trxPair: presaleInfo.trxPair || '25% TRX / 50% union',
            backing: presaleInfo.backing || '25% TRX / 50% union'
          };
        } catch (error) {
          console.error('Failed to load presale info:', error);
          this.$toast('预售信息加载失败');
        }
      }
    },

    // 添加这些新方法
    getUrlParams() {
      return {
        tokenId: this.$route.params.id,
        tokenAddress: this.$route.query.tokenAddress,
        presaleAddress: this.$route.query.presaleAddress,
        creator: this.$route.query.creator
      };
    },

    validateAddress(address) {
      if (!address) return false;
      const tronAddressRegex = /^T[A-Za-z1-9]{33}$/;
      return tronAddressRegex.test(address);
    },



    // 设置活动按钮
    setActiveButton(index) {
      this.activeButton = index;
    },

    // 格式化地址显示
    formatAddress(address) {
      if (!address) return '';
      return `${address.slice(0, 6)}...${address.slice(-6)}`;
    },
    // 加载用户余额
    async loadUserBalance() {
      try {
        if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
          const balance = await window.tronWeb.trx.getBalance();
          this.trxBalance = window.tronWeb.fromSun(balance);
        }
      } catch (error) {
        console.error('Failed to load user balance:', error);
        // 保持默认余额
      }
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
          const textArea = document.createElement('textarea');
          textArea.value = address;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
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

    // 社交媒体链接
    openTwitter() {
      window.open('https://twitter.com/chou_token', '_blank');
    },

    openTelegram() {
      window.open('https://t.me/chou_token', '_blank');
    },

    openWebsite() {
      window.open('https://chou.token', '_blank');
    },

    // 设置最大预售数量
    setMaxPresaleAmount() {
      this.presaleInputAmount = this.trxBalance.toString();
    },

    // 进入预售
    async enterPresale() {
      if (!this.presaleInputAmount || parseFloat(this.presaleInputAmount) <= 0) {
        this.$toast('请输入有效数量');
        return;
      }

      const amount = parseFloat(this.presaleInputAmount);
      if (amount > this.trxBalance) {
        this.$toast('余额不足');
        return;
      }

      console.log('进入预售:', amount);
      this.$toast('预售请求已提交');

      setTimeout(() => {
        this.presaleInputAmount = '';
        this.$toast('预售成功！');
      }, 2000);
    },

    // 减少内盘数量
    decreaseInternalAmount() {
      if (this.internalMarketAmount > 100) {
        this.internalMarketAmount -= 100;
      }
    },

    // 增加内盘数量
    increaseInternalAmount() {
      if (this.internalMarketAmount < this.trxBalance) {
        this.internalMarketAmount += 100;
      }
    },

    // 内盘购买
    async buyInternalMarket() {
      if (this.internalMarketQuota <= 0) {
        this.$toast('内盘额度不足');
        return;
      }

      console.log('内盘购买:', this.internalMarketAmount);
      this.$toast('内盘购买请求已提交');

      setTimeout(() => {
        this.internalMarketQuota--;
        this.$toast('内盘购买成功！');
      }, 2000);
    },

    // 设置最大数量
    setMaxAmount() {
      if (this.buySellTab === 'buy') {
        this.inputAmount = this.trxBalance.toString();
      } else {
        this.inputAmount = '1000000';
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
      console.log('倒计时更新');
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
    margin-bottom: 16px;

    .token-avatar {
      .token-icon-wrapper {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        color: #ffffff;
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

        .copy-btn,
        .external-btn {
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

  .token-description {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    p {
      font-size: 14px;
      line-height: 1.6;
      color: #8b9dc3;
      margin: 0;
    }
  }

  .social-actions {
    display: flex;
    justify-content: center;
    gap: 12px;

    .social-btn {
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

/* 通用卡片样式 */
.info-section-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 16px 0;
  }
}

/* 代币信息表格 */
.token-info-table,
.lge-info-table {
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);

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

/* 免责声明 */
.disclaimer-section {
  display: flex;
  align-items: flex-start;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;

  .disclaimer-icon {
    color: #ef4444;
    margin-right: 12px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .disclaimer-text {
    flex: 1;

    p {
      color: #ef4444;
      font-size: 13px;
      line-height: 1.5;
      margin: 0;
    }

    strong {
      font-weight: 600;
    }
  }
}

/* 资金曲线 */
.curve-title {
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

.curve-description p {
  color: #8b9dc3;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

/* 输入区域 */
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
    font-size: 1px !important;
    color: #8b9dc3;
  }
}

/* 按钮样式 */
.enter-presale-btn,
.buy-now-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
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

/* 内盘抢购 */
.internal-market-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.internal-market-desc {
  font-size: 13px;
  color: #8b9dc3;
  line-height: 1.5;
  margin-bottom: 20px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 16px;

  .quantity-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .quantity-display {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    min-width: 120px;
    text-align: center;
  }
}

.quota-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .quota-label {
    font-size: 14px;
    color: #8b9dc3;
  }

  .quota-value {
    font-size: 14px;
    color: #ffffff;
    font-weight: 600;
  }
}

.real-time-price {
  font-size: 12px;
  color: #8b9dc3;
  text-align: center;
  margin-top: 16px;
}

/* 加载状态样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 46, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  color: #ffffff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 在这里添加新的样式 */
.info-section-card .balance-info {
  font-size: 14px !important;
  color: #8b9dc3;
}

/* 预售内容样式 */
.presale-content {
  animation: fadeIn 0.3s ease-in;
}

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

/* 响应式设计 */
@media (max-width: 375px) {
  .main-content {
    padding-left: 12px;
    padding-right: 12px;
  }

  .info-section-card {
    padding: 16px;
    margin-bottom: 12px;
  }

  .token-info-card {
    padding: 16px;

    .token-header {
      gap: 12px;

      .token-avatar .token-icon-wrapper {
        width: 50px;
        height: 50px;
        font-size: 28px;
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

  .percentage-display {
    font-size: 20px;
    padding: 10px 16px;
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
</style>