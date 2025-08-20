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

        <!-- 代币导航控件 -->
        <div class="token-navigation">
          <button
            @click="navigateToPreviousToken"
            class="nav-btn prev-btn"
            :disabled="loading || currentTokenIndex <= 0"
            title="上一个代币"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <span class="token-index-display">
            {{ currentTokenIndex + 1 }} / {{ totalTokenCount || '?' }}
          </span>

          <button
            @click="navigateToNextToken"
            class="nav-btn next-btn"
            :disabled="loading || currentTokenIndex >= (totalTokenCount - 1)"
            title="下一个代币"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
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
        <div class="info-section-card bonding-curve-card">
          <div class="bonding-curve-header">
            <div class="curve-title">Binding Curve Percentage</div>
            <div class="percentage-badge">
              {{ fundingPercentage.toFixed(2) }}%
            </div>
          </div>

          <div class="enhanced-progress-container">
            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: fundingPercentage + '%' }"
              ></div>
              <div
                class="progress-thumb"
                :style="{ left: fundingPercentage + '%' }"
              ></div>
            </div>
            <div class="progress-labels">
              <span class="progress-start">0%</span>
              <span class="progress-end">100%</span>
            </div>
          </div>

          <div class="curve-status-info">
            <div class="status-text">
              When the progress reaches 100%, the casting will end
            </div>
            <div class="funding-stats">
              <div class="stat-item">
                <span class="stat-label">Current</span>
                <span class="stat-value">{{ fundingPercentage.toFixed(1) }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Target</span>
                <span class="stat-value">100%</span>
              </div>
            </div>
          </div>

          <!-- 参与预售区域 -->
          <div class="presale-participation-section">
            <div class="presale-section-title">Enter presale</div>

            <div class="presale-input-container">
              <div class="amount-input-wrapper">
                <input
                  v-model="presaleAmount"
                  type="number"
                  placeholder="Input quantity"
                  class="presale-amount-input"
                  :disabled="presaleLoading || !isWalletConnected"
                  @input="validatePresaleAmount"
                />
                <button
                  class="max-button"
                  @click="setMaxAmount"
                  :disabled="presaleLoading || !isWalletConnected"
                >
                  MAX
                </button>
              </div>

              <div class="balance-display">
                TRX balance: {{ formatBalance(userTrxBalance) }}
              </div>

              <div v-if="presaleValidationError" class="validation-error">
                {{ presaleValidationError }}
              </div>

              <button
                class="enter-presale-button"
                @click="enterPresale"
                :disabled="!canEnterPresale"
                :class="{
                  'loading': presaleLoading,
                  'success': presaleSuccess
                }"
              >
                <span v-if="presaleLoading" class="loading-spinner"></span>
                <span v-else-if="presaleSuccess">✓ Success</span>
                <span v-else>Enter presale</span>
              </button>
            </div>
          </div>
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
import coordinatorFactoryService from '../tron/services/CoordinatorFactoryService';
import { AddressUtils } from '../tron/config';
import presaleABI from '../../contract/presaleABI.json';

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
        contractAddress: 'TE8EDTFy7CD2TXyrb7wCCHNaC8rao9HEiC',
        description: 'PEPE visits all northern countries and regions in 2025 - Alaska, Canada, Greenland, Iceland, Norway, Sweden, Finland and Siberia. He is not scare from the cold and polar bears. PEPE enjoys the beautiful north nature and the northern lights.',

        // 基本信息
        tokenName: 'CHO',
        nameSymbol: 'CHO',
        supply: '210000000',
        tokenomicPreset: '0.5%/0.5%',

        // LGE相关参数
        tokenForLGE: '100%',
        tstTrxRate: '1 TST=1 TRX',
        softCap: '333 TRX',  // 硬顶的1/3
        hardCap: '1000 TRX',
        minBuy: '500 TRX',
        maxBuy: '500 TRX',
        startTime: '2025/08/15 14:14(4d 2h)',
        endTime: '2025/08/15 14:14(4d 2h)',
        duration: '90 days',
        vestingDelay: '10 days',
        vestingRate: '10%',
        vestingRounds: '5 rounds',
        trxPair: '25% TRX / 50% union',
        backing: '25% TRX / 50% union'
      },

      // 代币导航相关
      totalTokenCount: 0,
      currentTokenIndex: 0, // 当前代币索引的本地状态

      // 资金曲线数据
      fundingPercentage: 30.89,

      // 预售相关数据
      presaleInputAmount: '',
      trxBalance: 1648523,
      internalMarketQuota: 3,
      realTimePrice: '1 TRX ≈ 651 RWAUnion',
      internalMarketAmount: 100,

      // 绑定曲线预售参与数据
      presaleAmount: '',
      userTrxBalance: 1648523,
      presaleLoading: false,
      presaleSuccess: false,
      presaleValidationError: '',
      presaleContractAddress: null,
      presaleAddressToken: null, // 缓存的预售地址对应的代币地址
      walletWatcher: null,
      indexChangeTimeout: null, // 防抖定时器

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

  computed: {
    // 钱包连接状态
    isWalletConnected() {
      return this.$tronState?.isConnected || false;
    },

    // 是否可以参与预售
    canEnterPresale() {
      return (
        this.isWalletConnected &&
        !this.presaleLoading &&
        this.presaleAmount &&
        !this.presaleValidationError &&
        parseFloat(this.presaleAmount) > 0
      );
    },

    // 最大可投入金额
    maxPresaleAmount() {
      const balance = this.userTrxBalance || 0;
      const hardCap = parseFloat(this.tokenInfo.hardCap?.replace(/[^\d.]/g, '') || '1000');
      const currentRaised = (this.fundingPercentage / 100) * hardCap;
      const remaining = hardCap - currentRaised;

      return Math.min(balance, remaining);
    }
  },

  mounted() {
    // 先把 URL 的 search 和 hash 参数规范化同步到 $route 上
    this.syncUrlParamsToRouter();
    
    // 添加调试：检查 tokenInfo 的初始状态
    console.log('🔍 页面加载时 tokenInfo 状态:', {
      tokenForLGE: this.tokenInfo.tokenForLGE,
      hardCap: this.tokenInfo.hardCap,
      maxBuy: this.tokenInfo.maxBuy,
      完整对象: this.tokenInfo
    });

    this.initializeData();
    this.updateCountdown();

    // 监听钱包连接状态变化
    this.watchWalletConnection();

    // 注册全局预售管理方法到控制台
    this.registerConsoleCommands();
  },

  beforeDestroy() {
    // 清理全局方法
    this.unregisterConsoleCommands();
  },

  watch: {
    // 监听 tokenForLGE 的变化
    'tokenInfo.tokenForLGE': {
      handler(newVal, oldVal) {
        console.log('🔍 tokenForLGE 发生变化:', {
          旧值: oldVal,
          新值: newVal,
          变化时间: new Date().toLocaleString()
        });
      },
      immediate: true
    },

    // 监听路由查询参数变化
    '$route.query.index': {
      handler(newIndex, oldIndex) {
        if (newIndex !== oldIndex && newIndex !== undefined) {
          const targetIndex = parseInt(newIndex);
          console.log(`🔄 路由索引变化: ${oldIndex} → ${newIndex}`);

          // 防抖处理，避免重复加载
          if (this.indexChangeTimeout) {
            clearTimeout(this.indexChangeTimeout);
          }

          this.indexChangeTimeout = setTimeout(async () => {
            // 只有当新索引与当前本地状态不同时才更新
            if (targetIndex !== this.currentTokenIndex) {
              console.log(`📊 开始加载索引 ${targetIndex} 的代币...`);
              try {
                await this.loadTokenByIndex(targetIndex);
                console.log(`✅ 索引 ${targetIndex} 加载完成`);
              } catch (error) {
                console.error(`❌ 索引 ${targetIndex} 加载失败:`, error);
                this.$toast(`加载代币失败，请重试`);
              }
            }
          }, 100); // 100ms防抖延迟
        }
      },
      immediate: true // ✅ 修复：设置为true，确保页面初始化时立即响应URL参数
    }
  },

  beforeUnmount() {
    // 清理定时器
    if (this.walletWatcher) {
      clearInterval(this.walletWatcher);
    }
    // 清理防抖定时器
    if (this.indexChangeTimeout) {
      clearTimeout(this.indexChangeTimeout);
    }
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
      console.log('🔍 Loading token details with params:', params);

      // 如果有tokenAddress，直接使用
      if (params.tokenAddress && this.validateAddress(params.tokenAddress)) {
        console.log('📍 使用指定的代币地址:', params.tokenAddress);
        // 重置索引状态，因为使用的是地址而不是索引
        this.currentTokenIndex = 0;
        await this.loadTokenByAddress(params.tokenAddress);
      }
      // 如果有tokenId，通过ID获取
      else if (params.tokenId) {
        console.log('🆔 使用指定的代币ID:', params.tokenId);
        // 重置索引状态，因为使用的是ID而不是索引
        this.currentTokenIndex = 0;
        await this.loadTokenById(params.tokenId);
      }
      // 如果有index参数，加载指定索引的代币
      else if (params.index !== undefined) {
        const targetIndex = parseInt(params.index);
        console.log('📊 使用指定的代币索引:', targetIndex);

        // ✅ 优化：检查是否已经是目标索引，避免重复加载
        if (this.currentTokenIndex !== targetIndex) {
          console.log(`🔄 索引变化: ${this.currentTokenIndex} → ${targetIndex}`);
          await this.loadTokenByIndex(targetIndex);
        } else {
          console.log(`📊 索引未变化，跳过加载: ${targetIndex}`);
        }
      }
      // 默认加载第0个代币
      else {
        console.log('🔄 使用默认代币（索引0）');
        // 设置默认索引状态
        this.currentTokenIndex = 0;
        await this.loadTokenByIndex(0);
      }
    },
    // 通过地址加载代币（从链上读取Token信息与手续费配置）
    async loadTokenByAddress(tokenAddress) {
      try {
        const base58Address = AddressUtils.toBase58(tokenAddress)
        const tokenService = new TokenService(base58Address)

        const [info, baseCfg] = await Promise.all([
          tokenService.getTokenInfo(),
          tokenService.callMethod('baseConfig').catch(() => null)
        ])

        const decimals = parseInt(info.decimals)
        const supplyFormatted = TokenService.formatTokenAmount(
          info.totalSupply.toString(),
          isNaN(decimals) ? 18 : decimals
        )

        // 添加调试日志
        console.log(`📊 第七个代币totalSupply处理:`, {
          raw: info.totalSupply.toString(),
          decimals: isNaN(decimals) ? 18 : decimals,
          formatted: supplyFormatted
        })

        let feeBuy = 0, feeSell = 0
        if (baseCfg) {
          feeBuy = Number(baseCfg.feeBuy || baseCfg[0] || 0)
          feeSell = Number(baseCfg.feeSell || baseCfg[1] || 0)
        }
        const tokenomicPreset = `${(feeBuy / 100).toFixed(2)}%/${(feeSell / 100).toFixed(2)}%`

        this.tokenInfo = {
          ...this.tokenInfo,
          name: info.name,
          symbol: info.symbol,
          contractAddress: base58Address,
          tokenName: info.name,
          nameSymbol: `${info.name} (${info.symbol})`,
          supply: supplyFormatted,
          tokenomicPreset
        }
      } catch (error) {
        console.error('Failed to load token by address:', error)
        this.$toast('代币信息加载失败')
      }
    },

    // 通过ID加载代币
    async loadTokenById(tokenId) {
      console.log('🆔 Loading token by ID:', tokenId);
      // 暂时使用默认数据（索引0）
      await this.loadTokenByIndex(0);
    },

    // 加载默认代币：从工厂合约动态获取一个示例代币
    async loadDefaultToken() {
      console.log('Loading default token from factory')
      await this.loadTokenFromFactoryExample()
    },

    // 从工厂合约获取一个代币示例并加载其详情
    async loadTokenFromFactoryExample() {
      try {
        console.log('🔍 从工厂合约获取代币示例...')

        // 使用新的智能获取方法，确保能获取到可用的代币
        const result = await coordinatorFactoryService.getAllTokenPresalePairsComplete()

        if (!result.pairs || result.pairs.length === 0) {
          console.warn('⚠️ 工厂合约中没有找到任何代币对')
          this.$toast('工厂合约中暂无可用代币')
          return
        }

        console.log(`✅ 找到${result.pairs.length}个代币对，使用第7个作为示例`)

        const pair = result.pairs[7]
        const tokenAddress = AddressUtils.toBase58(pair.tokenAddress || pair[7])
        await this.loadTokenByAddress(tokenAddress)

      } catch (error) {
        console.error('❌ 从工厂合约获取代币示例失败:', error)
        this.$toast('从工厂合约获取代币失败')
      }
    },

    /**
     * 通过索引加载代币
     * @param {number} index - 代币索引（0开始）
     */
    async loadTokenByIndex(index) {
      try {
        console.log(`🔍 加载索引为 ${index} 的代币...`);

        // 获取所有代币对
        const result = await coordinatorFactoryService.getAllTokenPresalePairsComplete();

        if (!result.pairs || result.pairs.length === 0) {
          console.warn('⚠️ 工厂合约中没有找到任何代币对');
          this.$toast('工厂合约中暂无可用代币');
          return;
        }

        console.log(`📊 总共找到 ${result.pairs.length} 个代币对`);

        // 更新总代币数量
        this.totalTokenCount = result.pairs.length;

        // 验证索引范围
        if (index < 0) {
          console.warn(`⚠️ 索引不能为负数: ${index}，使用索引 0`);
          index = 0;
        } else if (index >= result.pairs.length) {
          console.warn(`⚠️ 索引 ${index} 超出范围 (0-${result.pairs.length - 1})，使用最后一个代币`);
          index = result.pairs.length - 1;
          this.$toast(`指定的索引超出范围，显示最后一个代币（索引 ${index}）`);
        }

        const pair = result.pairs[index];
        const tokenAddress = AddressUtils.toBase58(pair.tokenAddress || pair[7]);

        console.log(`✅ 加载索引 ${index} 的代币:`, {
          tokenSymbol: pair.tokenSymbol,
          tokenName: pair.tokenName,
          tokenAddress: tokenAddress
        });

        // 更新本地状态
        this.currentTokenIndex = index;

        // 在URL中更新当前索引（不刷新页面）
        this.updateUrlWithIndex(index);

        await this.loadTokenByAddress(tokenAddress);

        // 切换代币后重置并重新获取预售信息，确保控制台与按钮指向正确的合约
        this.presaleContractAddress = null;
        this.presaleAddressToken = null;
        try {
          await this.loadPresaleInfo();
          await this.updateFundingProgress();
          console.log('🔁 已根据新代币刷新预售信息与进度');
        } catch (e) {
          console.warn('⚠️ 刷新预售信息失败:', e?.message || e);
        }

      } catch (error) {
        console.error('❌ 通过索引加载代币失败:', error);
        this.$toast(`加载索引 ${index} 的代币失败`);

        // 回退到默认代币
        if (index !== 0) {
          console.log('🔄 回退到默认代币（索引 0）');
          await this.loadTokenByIndex(0);
        }
      }
    },

    /**
     * 更新URL中的索引参数（不刷新页面）
     * @param {number} index - 代币索引
     */
    updateUrlWithIndex(index) {
      try {
        // 使用 Vue Router 更新哈希路由的 query，确保 $route.query 能读取
        const current = this.$route;
        const newQuery = { ...current.query, index: index.toString() };

        // 保留现有的 params（如 :id），只更新 query
        this.$router.replace({
          name: current.name || 'tokenDetail',
          params: current.params,
          query: newQuery
        }).catch(() => {});

        console.log('📍 Router query 已更新', {
          fullPath: this.$route.fullPath,
          query: this.$route.query
        });
      } catch (error) {
        console.warn('⚠️ 更新路由 query 失败:', error);
      }
    },

    // 加载预售信息：从预售合约直接获取完整配置，包含错误处理和回退机制
    async loadPresaleInfo() {
      const params = this.getUrlParams()

      try {
        console.log('🔍 开始加载预售配置信息...')

        // 1. 获取预售合约地址
        let presaleAddress = params.presaleAddress
        let tokenAddress = this.tokenInfo.contractAddress

        if (!presaleAddress && tokenAddress) {
          presaleAddress = await this.getPresaleAddressWithFallback(tokenAddress)
        }

        if (!presaleAddress || !this.validateAddress(presaleAddress)) {
          console.warn('⚠️ 无有效的预售合约地址，使用默认配置')
          this.showDefaultPresaleConfig()
          return
        }

        // 缓存有效的预售合约地址，且关联当前代币地址，供enterPresale方法使用
        this.presaleContractAddress = presaleAddress
        this.presaleAddressToken = this.tokenInfo.contractAddress
        console.log('💾 预售合约地址已缓存:', presaleAddress, 'for token:', this.presaleAddressToken)

        // 2. 从预售合约获取完整配置
        await this.loadPresaleConfigFromContract(presaleAddress)

      } catch (error) {
        console.error('❌ 加载预售信息失败:', error)
        this.showDefaultPresaleConfig()
        this.$toast('预售信息加载失败，显示默认配置')
      }
    },

    // 获取预售地址，包含回退机制
    async getPresaleAddressWithFallback(tokenAddress) {
      try {
        console.log('📍 尝试从工厂合约获取预售地址:', tokenAddress)

        // 方法1：直接通过 getTokenFullDetails 获取
        const tokenDetails = await coordinatorFactoryService.getTokenFullDetails(tokenAddress)
        const presaleAddress = tokenDetails.pair?.presaleAddress

        if (presaleAddress) {
          // 转换为 Base58 格式
          const base58Address = AddressUtils.toBase58(presaleAddress)
          console.log('🔄 地址格式转换:', {
            原始地址: presaleAddress,
            Base58地址: base58Address
          })

          if (this.validateAddress(base58Address)) {
            console.log('✅ 成功获取预售地址:', base58Address)
            return base58Address
          } else {
            console.warn('⚠️ 转换后的地址格式无效:', base58Address)
          }
        }

        throw new Error('getTokenFullDetails 返回无效地址')

      } catch (error) {
        console.warn('⚠️ getTokenFullDetails 失败，尝试直接查询方法:', error.message)

        // 方法2：尝试直接通过 getTokenPresale 获取
        try {
          const presaleAddress = await coordinatorFactoryService.getTokenPresale(tokenAddress)
          if (presaleAddress) {
            // 转换为 Base58 格式
            const base58Address = AddressUtils.toBase58(presaleAddress)
            console.log('🔄 地址格式转换:', {
              原始地址: presaleAddress,
              Base58地址: base58Address
            })

            if (this.validateAddress(base58Address)) {
              console.log('✅ 通过直接查询获取预售地址:', base58Address)
              return base58Address
            } else {
              console.warn('⚠️ 转换后的地址格式仍然无效:', base58Address)
            }
          }
        } catch (directError) {
          console.warn('⚠️ 直接查询也失败:', directError.message)
        }

        // 方法3：最后的回退方案 - 返回null表示没有预售合约
        console.error('❌ 所有方法都失败，该代币可能没有预售合约')
        return null
      }
    },

    // 从工厂合约查找指定代币的预售合约
    async findTokenPresaleInFactory(targetTokenAddress) {
      try {
        console.log('� 在工厂合约中查找指定代币的预售合约:', targetTokenAddress)

        // 获取所有代币对
        const totalPairs = await coordinatorFactoryService.getTotalPairsCreated()
        console.log('📊 工厂合约总代币对数量:', totalPairs)

        if (totalPairs === 0) {
          console.warn('⚠️ 工厂合约中没有任何代币对')
          return null
        }

        const { pairs } = await coordinatorFactoryService.getAllTokenPresalePairs(0, totalPairs)

        if (!pairs || pairs.length === 0) {
          console.warn('⚠️ 工厂合约返回空的代币对列表')
          return null
        }

        // 查找匹配的代币对
        const targetPair = pairs.find(pair => {
          const tokenAddress = AddressUtils.toBase58(pair.tokenAddress || pair[0])
          return AddressUtils.isEqual(tokenAddress, targetTokenAddress)
        })

        if (targetPair) {
          const presaleAddress = AddressUtils.toBase58(targetPair.presaleAddress || targetPair[1])
          console.log('✅ 找到匹配的代币对:', {
            tokenAddress: targetTokenAddress,
            presaleAddress: presaleAddress
          })
          return presaleAddress
        } else {
          console.log('❌ 在工厂合约中未找到该代币的预售合约')
          return null
        }

      } catch (error) {
        console.error('❌ 在工厂合约中查找代币失败:', error)
        return null
      }
    },

    // 显示默认预售配置
    showDefaultPresaleConfig() {
      console.log('📋 显示默认预售配置')

      // 保持当前的默认值，确保页面正常显示
      const defaultConfig = {
        tokenForLGE: '100%',
        tstTrxRate: '1 TST=1 TRX',
        softCap: '333 TRX',  // 硬顶的1/3
        hardCap: '1000 TRX',
        minBuy: '500 TRX',
        maxBuy: '500 TRX',
        startTime: '2025/08/15 14:14(4d 2h)',
        endTime: '2025/08/15 14:14(4d 2h)',
        duration: '90 days',
        vestingDelay: '10 days',
        vestingRate: '10%',
        vestingRounds: '5 rounds',
        trxPair: '25% TRX / 50% union',
        backing: '25% TRX / 50% union'
      }

      this.tokenInfo = { ...this.tokenInfo, ...defaultConfig }
    },

    // 从预售合约直接获取配置信息，包含详细错误处理
    async loadPresaleConfigFromContract(presaleAddress) {
      try {
        console.log('📊 从预售合约获取配置:', presaleAddress)

        const presaleService = new PresaleService(presaleAddress)

        // 并行获取所有配置信息，每个调用都有独立的错误处理
        const fullConfig = await this.getPresaleConfigWithRetry(presaleService)

        console.log('📋 获取到的完整配置:', fullConfig)

        // 检查是否获取到有效配置
        const hasValidConfig = this.validatePresaleConfig(fullConfig)

        if (hasValidConfig) {
          // 映射配置数据到页面展示字段
          this.updateTokenInfoFromContractConfig(fullConfig)
          console.log('✅ 预售配置加载成功')
        } else {
          console.warn('⚠️ 获取的配置无效，使用默认值')
          this.showDefaultPresaleConfig()
        }

      } catch (error) {
        console.error('❌ 从合约获取配置失败:', error)

        // 根据错误类型提供不同的处理
        if (error.message && error.message.includes('REVERT')) {
          console.warn('⚠️ 合约调用被回退，可能是无效的预售地址')
          this.$toast('预售合约地址无效，显示默认配置')
        } else if (error.message && error.message.includes('timeout')) {
          console.warn('⚠️ 合约调用超时')
          this.$toast('网络超时，请稍后重试')
        } else {
          console.warn('⚠️ 未知错误，使用默认配置')
          this.$toast('加载配置失败，显示默认配置')
        }

        this.showDefaultPresaleConfig()
      }
    },

    // 带重试机制的配置获取
    async getPresaleConfigWithRetry(presaleService, maxRetries = 2) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 尝试获取配置 (${attempt}/${maxRetries})...`)

          const fullConfig = await presaleService.getFullPresaleConfig()

          // 如果成功获取，直接返回
          if (fullConfig) {
            return fullConfig
          }

          throw new Error('获取的配置为空')

        } catch (error) {
          console.warn(`⚠️ 第 ${attempt} 次尝试失败:`, error.message)

          if (attempt === maxRetries) {
            throw error // 最后一次尝试失败，抛出错误
          }

          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    },

    // 验证预售配置的有效性
    validatePresaleConfig(config) {
      if (!config) {
        return false
      }

      const { lgeConfig, lpConfig, presaleConfig, tradeConfig } = config

      // 至少需要有一个配置不为空
      const hasAnyConfig = lgeConfig || lpConfig || presaleConfig || tradeConfig

      console.log('🔍 配置验证结果:', {
        hasLGE: !!lgeConfig,
        hasLP: !!lpConfig,
        hasPresale: !!presaleConfig,
        hasTrade: !!tradeConfig,
        isValid: hasAnyConfig
      })

      return hasAnyConfig
    },

    // 将合约配置数据映射到页面展示字段，包含安全的数据处理
    updateTokenInfoFromContractConfig(config) {
      try {
        const { lgeConfig, lpConfig, presaleConfig, tradeConfig } = config || {}

        console.log('🔄 映射配置数据到页面字段...', {
          hasLGE: !!lgeConfig,
          hasLP: !!lpConfig,
          hasPresale: !!presaleConfig,
          hasTrade: !!tradeConfig
        })

        const updates = {}
        let successfulMappings = 0

        // 从 LGE 配置映射字段
        if (lgeConfig) {
          try {
            const lgeUpdates = this.mapLGEConfig(lgeConfig)
            Object.assign(updates, lgeUpdates)
            successfulMappings++
            console.log('✅ LGE 配置映射成功')
          } catch (error) {
            console.warn('⚠️ LGE 配置映射失败:', error)
          }
        }

        // 从 LP 配置映射字段
        if (lpConfig) {
          try {
            const lpUpdates = this.mapLPConfig(lpConfig)
            Object.assign(updates, lpUpdates)
            successfulMappings++
            console.log('✅ LP 配置映射成功')
          } catch (error) {
            console.warn('⚠️ LP 配置映射失败:', error)
          }
        }

        // 从预售配置映射字段
        if (presaleConfig) {
          try {
            console.log('🔍 预售配置对象详情:', {
              完整对象: presaleConfig,
              preSaleMaxNum: presaleConfig.preSaleMaxNum,
              preSaleEthAmount: presaleConfig.preSaleEthAmount,
              preSaleMaxNum类型: typeof presaleConfig.preSaleMaxNum,
              所有属性: Object.keys(presaleConfig),
              预售配置JSON: JSON.stringify(presaleConfig, null, 2)
            })
            
            const presaleUpdates = this.mapPresaleConfig(presaleConfig)
            console.log('🔍 预售配置映射结果:', presaleUpdates)
            
            Object.assign(updates, presaleUpdates)
            successfulMappings++
            console.log('✅ 预售配置映射成功')
          } catch (error) {
            console.warn('⚠️ 预售配置映射失败:', error)
          }
        }

        // 从交易配置映射字段
        if (tradeConfig) {
          try {
            const tradeUpdates = this.mapTradeConfig(tradeConfig)
            Object.assign(updates, tradeUpdates)
            successfulMappings++
            console.log('✅ 交易配置映射成功')
          } catch (error) {
            console.warn('⚠️ 交易配置映射失败:', error)
          }
        }

        // 只有在成功映射至少一个配置时才更新
        if (successfulMappings > 0) {
          console.log('🔍 更新前的 tokenInfo.tokenForLGE:', this.tokenInfo.tokenForLGE)
          console.log('🔍 即将应用的更新:', JSON.stringify(updates, null, 2))
          this.tokenInfo = { ...this.tokenInfo, ...updates }
          
          // 检查硬顶和最大购买量是否正确格式化
          if (this.tokenInfo.hardCap && this.tokenInfo.hardCap.includes('1000000000.00M')) {
            console.log('🔍 硬顶值:', this.tokenInfo.hardCap)
          }
          
          if (this.tokenInfo.maxBuy && this.tokenInfo.maxBuy.includes('100000000.00M')) {
            console.log('🔍 最大购买量值:', this.tokenInfo.maxBuy)
          }
          
          // 检查 Token for LGE 是否正确设置
          if (this.tokenInfo.tokenForLGE === '0' || this.tokenInfo.tokenForLGE === 0) {
            console.warn('⚠️ 检测到 Token for LGE 为 0，尝试强制设置')
            console.log('🔍 当前 tokenInfo.tokenForLGE:', this.tokenInfo.tokenForLGE)
            console.log('🔍 预售配置更新中的 tokenForLGE:', updates.tokenForLGE)
            console.log('🔍 预售配置更新完整内容:', JSON.stringify(updates, null, 2))
            
            // 如果预售配置中有 tokenForLGE，强制应用
            if (updates.tokenForLGE && updates.tokenForLGE !== '0') {
              console.log('🔧 强制应用预售配置中的 tokenForLGE:', updates.tokenForLGE)
              this.tokenInfo.tokenForLGE = updates.tokenForLGE
              console.log('🔧 强制应用后的 tokenInfo.tokenForLGE:', this.tokenInfo.tokenForLGE)
            } else {
              console.warn('⚠️ 预售配置更新中没有有效的 tokenForLGE 值')
            }
          }
          
          console.log('🔍 更新后的 tokenInfo.tokenForLGE:', this.tokenInfo.tokenForLGE)
          console.log(`✅ 配置数据映射完成，成功映射 ${successfulMappings} 个配置`)
        } else {
          console.warn('⚠️ 没有成功映射任何配置，保持默认值')
        }

      } catch (error) {
        console.error('❌ 配置数据映射过程中发生错误:', error)
      }
    },

    // 映射 LGE 配置
    mapLGEConfig(lgeConfig) {
      const updates = {}

      // 添加原始数据调试日志
      console.log('🔍 LGE配置原始数据:', {
        startTime: lgeConfig.startTime,
        hardcap: lgeConfig.hardcap,
        maxBuyPerWallet: lgeConfig.maxBuyPerWallet,
        vestingDelay: lgeConfig.vestingDelay,
        vestingRate: lgeConfig.vestingRate
      })

      if (lgeConfig.startTime) {
        updates.startTime = this.formatTimestamp(lgeConfig.startTime)
      }

      if (lgeConfig.hardcap) {
        console.log(`🎯 处理硬顶数据: ${lgeConfig.hardcap} (类型: ${typeof lgeConfig.hardcap})`)
        console.log(`🔍 硬顶原始值详情:`, {
          原始值: lgeConfig.hardcap,
          类型: typeof lgeConfig.hardcap,
          是否为数字: !isNaN(Number(lgeConfig.hardcap)),
          数值: Number(lgeConfig.hardcap)
        })
        const formattedHardCap = this.formatTrxAmount(lgeConfig.hardcap, true) // 标记为硬顶
        updates.hardCap = formattedHardCap
        console.log(`🎯 硬顶格式化结果: ${formattedHardCap}`)
        // 自动计算软顶（硬顶的1/3）
        updates.softCap = this.calculateSoftCap(formattedHardCap)
      }

      if (lgeConfig.maxBuyPerWallet) {
        console.log(`💰 处理最大购买数据: ${lgeConfig.maxBuyPerWallet} (类型: ${typeof lgeConfig.maxBuyPerWallet})`)
        console.log(`🔍 最大购买原始值详情:`, {
          原始值: lgeConfig.maxBuyPerWallet,
          类型: typeof lgeConfig.maxBuyPerWallet,
          是否为数字: !isNaN(Number(lgeConfig.maxBuyPerWallet)),
          数值: Number(lgeConfig.maxBuyPerWallet)
        })
        const formattedMaxBuy = this.formatTrxAmount(lgeConfig.maxBuyPerWallet, true) // 标记为最大购买量
        updates.maxBuy = formattedMaxBuy
        console.log(`💰 最大购买格式化结果: ${formattedMaxBuy}`)
      }

      if (lgeConfig.vestingDelay) {
        updates.vestingDelay = this.formatDuration(lgeConfig.vestingDelay)
      }

      if (lgeConfig.vestingRate) {
        updates.vestingRate = `${lgeConfig.vestingRate}%`
        updates.vestingRounds = this.calculateVestingRounds(updates.vestingRate)
      }

      if (lgeConfig.backingShare || lgeConfig.backingReceiver) {
        updates.backing = this.formatBackingInfo(lgeConfig.backingShare, lgeConfig.backingReceiver)
      }

      // 计算结束时间和持续时间
      if (lgeConfig.startTime && lgeConfig.vestingDelay) {
        updates.endTime = this.calculateEndTime(lgeConfig.startTime, lgeConfig.vestingDelay)
        updates.duration = this.calculateDuration(lgeConfig.startTime, updates.endTime)
      }

      return updates
    },

    // 映射 LP 配置
    mapLPConfig(lpConfig) {
      const updates = {}

      if (lpConfig.userShare && lpConfig.devShare) {
        updates.trxPair = this.formatLpDistribution(lpConfig.userShare, lpConfig.devShare)
      }

      return updates
    },

    // 映射预售配置
    mapPresaleConfig(presaleConfig) {
      const updates = {}

      console.log('🔍 预售配置原始数据:', {
        preSaleMaxNum: presaleConfig.preSaleMaxNum,
        preSaleEthAmount: presaleConfig.preSaleEthAmount,
        preSaleMaxNum类型: typeof presaleConfig.preSaleMaxNum
      })

      if (presaleConfig.preSaleMaxNum !== undefined && presaleConfig.preSaleMaxNum !== null) {
        // 使用默认的18位decimals，因为这里没有具体的decimals信息
        console.log(`🔍 处理 preSaleMaxNum: ${presaleConfig.preSaleMaxNum} (类型: ${typeof presaleConfig.preSaleMaxNum})`)
        console.log(`🔍 preSaleMaxNum 数值检查:`, {
          值: presaleConfig.preSaleMaxNum,
          类型: typeof presaleConfig.preSaleMaxNum,
          是否为BigInt: typeof presaleConfig.preSaleMaxNum === 'bigint',
          转换为字符串: presaleConfig.preSaleMaxNum.toString(),
          转换为数字: Number(presaleConfig.preSaleMaxNum)
        })
        
        updates.tokenForLGE = this.formatTokenAmount(presaleConfig.preSaleMaxNum, 18)
        console.log(`🔍 tokenForLGE 格式化结果: ${updates.tokenForLGE}`)
      } else {
        console.warn('⚠️ preSaleMaxNum 为空或未定义')
      }

      if (presaleConfig.preSaleEthAmount) {
        updates.minBuy = this.formatTrxAmount(presaleConfig.preSaleEthAmount, false, true)
      }

      // 注意：软顶现在在 mapLGEConfig 中自动计算，无需在此处重复计算

      return updates
    },

    // 动态计算软顶（硬顶的1/3）- 修复：改进数值提取和处理逻辑
    calculateSoftCap(hardCapValue) {
      try {
        if (!hardCapValue || hardCapValue === 0) {
          console.log('⚠️ 硬顶值为空，使用默认软顶')
          return '333 TRX'  // 默认值
        }

        // 如果硬顶是字符串格式，提取数值
        let numericValue = hardCapValue
        if (typeof hardCapValue === 'string') {
          // 提取数字部分，处理带逗号的数字和科学计数法，例如 "1,000,000,000,000,000 TRX" -> 1000000000000000
          const cleanString = hardCapValue.replace(/[,\s]/g, '') // 移除逗号和空格
          const match = cleanString.match(/(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/);
          if (match) {
            numericValue = parseFloat(match[1])
            console.log(`🔍 从硬顶字符串提取数值: "${hardCapValue}" -> ${numericValue}`)

            // 检查是否是异常大的数值（可能是单位错误）
            if (numericValue > 1000000000) { // 超过10亿
              console.warn(`⚠️ 检测到异常大的硬顶数值: ${numericValue}，可能需要单位转换`)
              // 尝试除以常见的单位转换因子
              if (numericValue > 1e15) { // 超过千万亿，可能是wei单位
                numericValue = numericValue / 1e18 // 除以10^18
                console.log(`🔄 应用wei到ether转换: ${numericValue}`)
              } else if (numericValue > 1e12) { // 超过万亿，可能是sun单位
                numericValue = numericValue / 1e6 // 除以10^6 (SUN到TRX)
                console.log(`🔄 应用SUN到TRX转换: ${numericValue}`)
              }
            }
          } else {
            console.warn('⚠️ 无法从硬顶字符串中提取数值:', hardCapValue)
            return '333 TRX'
          }
        }

        // 计算软顶 = 硬顶 / 3
        const softCapValue = Math.round(numericValue / 3)

        // 格式化显示
        let formattedSoftCap
        if (softCapValue >= 1000000) {
          formattedSoftCap = `${(softCapValue / 1000000).toFixed(2)}M TRX`
        } else if (softCapValue >= 1000) {
          formattedSoftCap = `${(softCapValue / 1000).toFixed(2)}K TRX`
        } else {
          formattedSoftCap = `${softCapValue.toLocaleString()} TRX`
        }

        console.log(`💰 软顶动态计算: ${numericValue} / 3 = ${softCapValue} -> ${formattedSoftCap}`)
        return formattedSoftCap

      } catch (error) {
        console.error('❌ 软顶计算失败:', error)
        return '333 TRX'  // 返回默认值
      }
    },

    // 更新硬顶时自动重新计算软顶
    updateHardCapAndRecalculateSoftCap(newHardCap) {
      try {
        // 更新硬顶
        this.tokenInfo.hardCap = newHardCap

        // 自动重新计算软顶
        this.tokenInfo.softCap = this.calculateSoftCap(newHardCap)

        console.log('🔄 硬顶更新，软顶自动重新计算:', {
          hardCap: newHardCap,
          softCap: this.tokenInfo.softCap
        })

      } catch (error) {
        console.error('❌ 硬顶更新和软顶重新计算失败:', error)
      }
    },

    // 映射交易配置
    mapTradeConfig(tradeConfig) {
      const updates = {}

      if (tradeConfig.tradeEthAmount) {
        updates.tstTrxRate = this.formatExchangeRate(tradeConfig.tradeEthAmount)
      }

      return updates
    },

    // 添加这些新方法
    getUrlParams() {
      const route = this.$route || {};
      console.log('🔍 解析路由参数:', {
        route: route,
        fullPath: route.fullPath,
        query: route.query,
        params: route.params
      });

      // 1) 优先使用 Vue Router 的 query
      let index = route.query && route.query.index !== undefined ? route.query.index : undefined;
      let tokenAddress = route.query && route.query.tokenAddress;
      let presaleAddress = route.query && route.query.presaleAddress;
      let creator = route.query && route.query.creator;
      let tokenId = route.params && route.params.id;

      // 2) 如果 Vue Router 没有解析到查询参数，尝试手动解析 URL
      if (index === undefined || !tokenAddress) {
        try {
          // 解析完整的 URL，包括哈希部分
          const fullUrl = window.location.href;
          const url = new URL(fullUrl);
          
          // 检查哈希中的查询参数
          const hash = url.hash || '';
          if (hash.includes('?')) {
            const hashQuery = hash.split('?')[1];
            const hashParams = new URLSearchParams(hashQuery);
            
            if (index === undefined) {
              const hashIndex = hashParams.get('index');
              if (hashIndex !== null && hashIndex !== '') {
                index = hashIndex;
                console.log('🔍 从哈希查询参数解析到 index:', index);
              }
            }
            
            if (!tokenAddress) {
              const hashTokenAddress = hashParams.get('tokenAddress');
              if (hashTokenAddress) {
                tokenAddress = hashTokenAddress;
                console.log('🔍 从哈希查询参数解析到 tokenAddress:', tokenAddress);
              }
            }
            
            if (!presaleAddress) {
              const hashPresaleAddress = hashParams.get('presaleAddress');
              if (hashPresaleAddress) {
                presaleAddress = hashPresaleAddress;
              }
            }
            
            if (!creator) {
              const hashCreator = hashParams.get('creator');
              if (hashCreator) {
                creator = hashCreator;
              }
            }
          }
          
          // 检查 URL 搜索参数（哈希前的部分）
          if (index === undefined) {
            const searchIndex = url.searchParams.get('index');
            if (searchIndex !== null && searchIndex !== '') {
              index = searchIndex;
              console.log('🔍 从 URL 搜索参数解析到 index:', index);
            }
          }
          
          if (!tokenAddress) {
            const searchTokenAddress = url.searchParams.get('tokenAddress');
            if (searchTokenAddress) {
              tokenAddress = searchTokenAddress;
              console.log('🔍 从 URL 搜索参数解析到 tokenAddress:', tokenAddress);
            }
          }
          
        } catch (e) {
          console.warn('⚠️ 解析 URL 参数失败:', e);
        }
      }

      console.log('📋 最终解析的参数:', { tokenId, tokenAddress, presaleAddress, creator, index });
      return { tokenId, tokenAddress, presaleAddress, creator, index };
    },

    // 将 URL 中（无论在 # 前还是 # 后）的 index/id 同步到 Vue Router 的 $route
    syncUrlParamsToRouter() {
      try {
        const { tokenId, index, tokenAddress, presaleAddress, creator } = this.getUrlParams();
        const curr = this.$route;
        
        // 检查是否需要同步各种参数
        const needIndexSync = index !== undefined && curr.query.index !== index;
        const needIdSync = tokenId && curr.params.id !== tokenId;
        const needTokenAddressSync = tokenAddress && curr.query.tokenAddress !== tokenAddress;
        const needPresaleAddressSync = presaleAddress && curr.query.presaleAddress !== presaleAddress;
        const needCreatorSync = creator && curr.query.creator !== creator;

        if (needIndexSync || needIdSync || needTokenAddressSync || needPresaleAddressSync || needCreatorSync) {
          // 构建新的查询参数
          const newQuery = { ...curr.query };
          if (index !== undefined) newQuery.index = index.toString();
          if (tokenAddress) newQuery.tokenAddress = tokenAddress;
          if (presaleAddress) newQuery.presaleAddress = presaleAddress;
          if (creator) newQuery.creator = creator;

          // 构建新的路径参数
          const newParams = { ...curr.params };
          if (tokenId) newParams.id = tokenId;

          this.$router.replace({
            name: curr.name || 'tokenDetail',
            params: newParams,
            query: newQuery
          }).catch(() => {});
          
          console.log('🔁 已将 URL 参数同步到路由:', { 
            tokenId, 
            index, 
            tokenAddress,
            presaleAddress,
            creator,
            fullPath: this.$route.fullPath 
          });
        }
      } catch (e) {
        console.warn('⚠️ 同步 URL 参数到路由失败:', e);
      }
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

    /**
     * 导航到指定索引的代币
     * @param {number} index - 目标索引
     */
    async navigateToTokenIndex(index) {
      console.log(`🔄 导航到代币索引: ${this.currentTokenIndex} → ${index}`);
      console.log(`📊 当前状态: 总数=${this.totalTokenCount}, 当前索引=${this.currentTokenIndex}`);

      this.loading = true;

      try {
        await this.loadTokenByIndex(index);
        console.log(`✅ 导航成功: 新索引=${this.currentTokenIndex}`);
      } catch (error) {
        console.error('❌ 导航到代币索引失败:', error);
        this.$toast('切换代币失败');
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取当前代币索引
     */
    getCurrentTokenIndex() {
      // 优先使用本地状态，如果没有则从URL参数获取
      if (this.currentTokenIndex !== undefined) {
        return this.currentTokenIndex;
      }

      const params = this.getUrlParams();
      const indexFromUrl = params.index ? parseInt(params.index) : 0;
      this.currentTokenIndex = indexFromUrl;
      return indexFromUrl;
    },

    /**
     * 导航到下一个代币
     */
    async navigateToNextToken() {
      const currentIndex = this.currentTokenIndex;
      const nextIndex = currentIndex + 1;

      console.log(`🔄 导航到下一个代币: ${currentIndex} → ${nextIndex}`);

      if (nextIndex < this.totalTokenCount) {
        await this.navigateToTokenIndex(nextIndex);
      } else {
        console.warn(`⚠️ 已经是最后一个代币 (索引 ${currentIndex})`);
        this.$toast('已经是最后一个代币');
      }
    },

    /**
     * 导航到上一个代币
     */
    async navigateToPreviousToken() {
      const currentIndex = this.currentTokenIndex;
      const prevIndex = currentIndex - 1;

      console.log(`🔄 导航到上一个代币: ${currentIndex} → ${prevIndex}`);

      if (prevIndex >= 0) {
        await this.navigateToTokenIndex(prevIndex);
      } else {
        console.warn(`⚠️ 已经是第一个代币 (索引 ${currentIndex})`);
        this.$toast('已经是第一个代币');
      }
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
          const balanceInTrx = window.tronWeb.fromSun(balance);
          this.trxBalance = balanceInTrx;
          this.userTrxBalance = balanceInTrx; // 同时更新绑定曲线预售的余额
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

    // === 绑定曲线预售相关方法 ===

    // 格式化余额显示
    formatBalance(balance) {
      if (!balance) return '0';
      return Number(balance).toLocaleString();
    },

    // 验证预售金额
    validatePresaleAmount() {
      this.presaleValidationError = '';

      const amount = parseFloat(this.presaleAmount);

      if (!this.presaleAmount || isNaN(amount)) {
        return;
      }

      if (amount <= 0) {
        this.presaleValidationError = '金额必须大于0';
        return;
      }

      if (amount > this.userTrxBalance) {
        this.presaleValidationError = '余额不足';
        return;
      }

      if (amount > this.maxPresaleAmount) {
        this.presaleValidationError = `超过最大可投入金额 ${this.maxPresaleAmount.toFixed(2)} TRX`;
        return;
      }

      // 检查最小投入限制
      // const minBuy = parseFloat(this.tokenInfo.minBuy?.replace(/[^\d.]/g, '') || '1');
      const minBuy = 1; // 固定最小投入金额为1 TRX
      if (amount < minBuy) {
        this.presaleValidationError = `最小投入金额为 ${minBuy} TRX`;
        return;
      }
    },

    // 设置最大金额
    setMaxAmount() {
      this.presaleAmount = this.maxPresaleAmount.toString();
      this.validatePresaleAmount();
    },

    // 获取用户TRX余额
    async getUserTrxBalance() {
      try {
        if (!this.isWalletConnected) {
          this.userTrxBalance = 0;
          return;
        }

        const tronWeb = window.tronWeb;
        if (!tronWeb) {
          throw new Error('TronWeb not available');
        }

        const balance = await tronWeb.trx.getBalance(tronWeb.defaultAddress.base58);
        this.userTrxBalance = tronWeb.fromSun(balance);

      } catch (error) {
        console.error('Failed to get TRX balance:', error);
        this.userTrxBalance = 0;
      }
    },

    // 参与预售
    async enterPresale() {
      if (!this.canEnterPresale) {
        return;
      }

      this.presaleLoading = true;
      this.presaleSuccess = false;

      try {
        // 检查钱包连接
        if (!this.isWalletConnected) {
          throw new Error('请先连接钱包');
        }

        const tronWeb = window.tronWeb;
        if (!tronWeb) {
          throw new Error('TronWeb not available');
        }

        // 验证金额
        this.validatePresaleAmount();
        if (this.presaleValidationError) {
          throw new Error(this.presaleValidationError);
        }

        const amount = parseFloat(this.presaleAmount);
        const amountInSun = tronWeb.toSun(amount);

        // 获取预售合约地址
        const presaleAddress = await this.getPresaleContractAddress();
        if (!presaleAddress) {
          throw new Error('预售合约地址未找到');
        }

        // 检查预售状态
        await this.checkPresaleStatus(presaleAddress);

        // 调用预售合约
        const contract = await tronWeb.contract(presaleABI, presaleAddress);

        // 调用preSale方法参与预售
        const result = await contract.preSale().send({
          callValue: amountInSun,
          feeLimit: 100000000 // 100 TRX fee limit
        });

        console.log('Presale transaction result:', result);

        // 等待交易确认
        await this.waitForTransaction(result);

        // 成功处理
        this.presaleSuccess = true;
        this.$toast('预售参与成功！');

        // 更新余额和进度
        await this.getUserTrxBalance();
        await this.updateFundingProgress();

        // 清空输入
        setTimeout(() => {
          this.presaleAmount = '';
          this.presaleSuccess = false;
        }, 3000);

      } catch (error) {
        console.error('Presale failed:', error);
        this.$toast(error.message || '预售参与失败');
      } finally {
        this.presaleLoading = false;
      }
    },

    // 获取预售合约地址
    async getPresaleContractAddress() {
      try {
        // 如果已经缓存了地址，且与当前代币一致，直接返回
        if (this.presaleContractAddress && this.presaleAddressToken && this.presaleAddressToken === this.tokenInfo.contractAddress) {
          console.log('✅ 使用缓存的预售合约地址:', this.presaleContractAddress, 'for token:', this.presaleAddressToken);
          return this.presaleContractAddress;
        }

        console.log('🔍 开始获取预售合约地址...');

        // 使用已有的预售地址获取逻辑（与loadPresaleInfo中的逻辑保持一致）
        const tokenAddress = this.tokenInfo.contractAddress;
        if (!tokenAddress) {
          throw new Error('代币合约地址未找到');
        }

        // 调用已有的预售地址获取方法
        const presaleAddress = await this.getPresaleAddressWithFallback(tokenAddress);

        if (!presaleAddress || !this.validateAddress(presaleAddress)) {
          throw new Error('获取到的预售合约地址无效');
        }

        // 缓存有效的预售地址，并绑定到当前代币
        this.presaleContractAddress = presaleAddress;
        this.presaleAddressToken = tokenAddress;
        console.log('✅ 预售合约地址获取成功:', presaleAddress, 'for token:', tokenAddress);

        return presaleAddress;

      } catch (error) {
        console.error('❌ 获取预售合约地址失败:', error);
        throw new Error(`无法获取预售合约地址: ${error.message}`);
      }
    },

    // 检查预售状态
    async checkPresaleStatus(presaleAddress) {
      try {
        console.log('🔍 检查预售状态...');

        // 创建预售服务实例
        const presaleService = new PresaleService(presaleAddress);

        // 获取预售状态
        const presaleStatus = await presaleService.getPresaleStatus();
        console.log('📊 当前预售状态:', presaleStatus);

        // 状态验证
        if (presaleStatus === 0) {
          throw new Error('预售尚未开始，请等待发行方开启预售');
        } else if (presaleStatus >= 2) {
          throw new Error('预售已结束，无法继续参与');
        } else if (presaleStatus === 1) {
          console.log('✅ 预售进行中，可以参与');
          return true;
        } else {
          throw new Error(`预售状态异常 (${presaleStatus})，请联系发行方`);
        }

      } catch (error) {
        console.error('❌ 预售状态检查失败:', error);
        throw error;
      }
    },

    // 等待交易确认
    async waitForTransaction(txId, timeout = 60000) {
      console.log('⏳ 开始等待交易确认, TxID:', txId);
      const startTime = Date.now();
      let retryCount = 0;
      const maxRetries = Math.floor(timeout / 2000); // 每2秒重试一次

      while (Date.now() - startTime < timeout && retryCount < maxRetries) {
        try {
          retryCount++;
          console.log(`🔄 第${retryCount}次查询交易状态...`);

          const tronWeb = window.tronWeb;

          // 先尝试获取交易信息
          const txInfo = await tronWeb.trx.getTransactionInfo(txId);
          console.log('📋 交易信息:', txInfo);

          // 检查交易是否已确认
          if (txInfo && txInfo.id) {
            // 更完善的成功判断逻辑
            const isSuccess = this.isTransactionSuccess(txInfo);

            if (isSuccess) {
              console.log('✅ 交易确认成功!');
              console.log('📊 交易详情:', {
                id: txInfo.id,
                blockNumber: txInfo.blockNumber,
                fee: txInfo.fee,
                result: txInfo.result,
                receipt: txInfo.receipt
              });
              return txInfo;
            } else if (this.isTransactionFailed(txInfo)) {
              console.error('❌ 交易执行失败:', txInfo);
              throw new Error(`交易执行失败: ${this.getFailureReason(txInfo)}`);
            } else {
              console.log('⏳ 交易仍在处理中...');
            }
          } else {
            // 如果没有交易信息，尝试获取交易详情
            try {
              const tx = await tronWeb.trx.getTransaction(txId);
              if (tx && tx.txID) {
                console.log('📄 交易已广播，等待打包确认...');
              } else {
                console.log('⚠️ 交易尚未广播');
              }
            } catch (e) {
              console.log('⚠️ 无法获取交易详情:', e.message);
            }
          }

          // 等待2秒后重试
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.warn(`⚠️ 第${retryCount}次查询失败:`, error.message);

          // 如果是查询错误，继续等待
          if (error.message.includes('Transaction not found') ||
              error.message.includes('Invalid transaction id') ||
              error.message.includes('timeout') ||
              error.message.includes('network')) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }

          // 其他错误直接抛出
          throw error;
        }
      }

      // 超时后给出更友好的提示
      console.warn('⏰ 交易确认超时，但交易可能仍在处理中');
      throw new Error(`交易确认超时，请在区块链浏览器中查看交易状态: ${txId}`);
    },

    // 判断交易是否成功
    isTransactionSuccess(txInfo) {
      // 检查多种成功条件
      if (!txInfo || !txInfo.id) {
        return false;
      }

      // 1. 检查 result 字段（字符串形式）
      if (txInfo.result === 'SUCCESS') {
        return true;
      }

      // 2. 检查 receipt 对象中的 result 字段
      if (txInfo.receipt && txInfo.receipt.result === 'SUCCESS') {
        return true;
      }

      // 3. 检查是否有 blockNumber（已打包到区块）且没有失败标记
      if (txInfo.blockNumber && txInfo.blockNumber > 0) {
        // 如果有区块号但没有明确的失败标记，通常表示成功
        if (!txInfo.result || txInfo.result === '' || txInfo.result === 'SUCCESS') {
          return true;
        }

        // 检查 receipt 中的结果
        if (txInfo.receipt) {
          if (txInfo.receipt.result === 'SUCCESS' ||
              (txInfo.receipt.result === '' && !txInfo.receipt.revert)) {
            return true;
          }
        }
      }

      // 4. 检查费用是否已扣除（表明交易已执行）
      if (txInfo.fee && txInfo.fee > 0 && txInfo.blockNumber) {
        // 有费用且有区块号，检查是否有失败标记
        if (!this.hasFailureIndicators(txInfo)) {
          return true;
        }
      }

      return false;
    },

    // 判断交易是否失败
    isTransactionFailed(txInfo) {
      if (!txInfo || !txInfo.id) {
        return false;
      }

      // 检查明确的失败标记
      if (txInfo.result === 'FAILED' || txInfo.result === 'REVERT') {
        return true;
      }

      if (txInfo.receipt) {
        if (txInfo.receipt.result === 'FAILED' ||
            txInfo.receipt.result === 'REVERT' ||
            txInfo.receipt.revert) {
          return true;
        }
      }

      return false;
    },

    // 检查是否有失败指示器
    hasFailureIndicators(txInfo) {
      if (txInfo.result && (txInfo.result === 'FAILED' || txInfo.result === 'REVERT')) {
        return true;
      }

      if (txInfo.receipt && (
          txInfo.receipt.result === 'FAILED' ||
          txInfo.receipt.result === 'REVERT' ||
          txInfo.receipt.revert
      )) {
        return true;
      }

      return false;
    },

    // 获取失败原因
    getFailureReason(txInfo) {
      if (txInfo.receipt && txInfo.receipt.revert) {
        return '合约执行被回滚';
      }

      if (txInfo.result === 'FAILED') {
        return '交易执行失败';
      }

      if (txInfo.result === 'REVERT') {
        return '交易被回滚';
      }

      return '未知错误';
    },

    // ==================== 控制台预售管理命令 ====================

    // 注册控制台命令
    registerConsoleCommands() {
      try {
        // 将预售管理方法绑定到全局window对象
        window.presaleAdmin = {
          // 查询预售状态
          getStatus: this.consoleGetPresaleStatus.bind(this),
          // 查询预售价格
          getPrice: this.consoleGetPresalePrice.bind(this),
          // 直接查询 preSaleEthAmount
          getPreSaleEthAmount: this.consoleGetPreSaleEthAmount.bind(this),
          // 查询详细预售信息
          getDetailedInfo: this.consoleGetDetailedPresaleInfo.bind(this),
          // 查询用户预售记录
          getUserInfo: this.consoleGetUserPresaleInfo.bind(this),
          // 查询预售总览
          getTotalInfo: this.consoleGetTotalPresaleInfo.bind(this),
          // 查询指定地址
          checkAddress: this.consoleCheckAddress.bind(this),
          // 开启预售
          start: this.consoleStartPresale.bind(this),
          // 结束预售
          end: this.consoleEndPresale.bind(this),
          // 检查管理员权限
          checkOwner: this.consoleCheckOwner.bind(this),
          // 帮助信息
          help: this.consoleShowHelp.bind(this)
        };

        console.log('🎮 预售管理控制台已激活！');
        console.log('📖 输入 presaleAdmin.help() 查看可用命令');
        
        // 添加全局快捷命令
        window.checkTotal = this.consoleGetTotalPresaleInfo.bind(this);
        window.checkAddress = this.consoleCheckAddress.bind(this);
        console.log('💡 输入 checkTotal() 快速查询预售总览');
        console.log('💡 输入 checkAddress("地址") 查询指定地址的预售信息');

      } catch (error) {
        console.error('❌ 注册控制台命令失败:', error);
      }
    },

    // 清理控制台命令
    unregisterConsoleCommands() {
      try {
        if (window.presaleAdmin) {
          delete window.presaleAdmin;
          console.log('🧹 预售管理控制台已清理');
        }
      } catch (error) {
        console.error('❌ 清理控制台命令失败:', error);
      }
    },

    // 控制台命令：显示帮助信息
    consoleShowHelp() {
      console.log(`
🎮 预售管理控制台命令帮助
═══════════════════════════════════════

📊 查询命令：
  presaleAdmin.getStatus()     - 查询当前预售状态
  presaleAdmin.getPrice()      - 查询预售价格 (preSaleEthAmount)
  presaleAdmin.getPreSaleEthAmount() - 直接查询 preSaleEthAmount 存储变量
  presaleAdmin.getDetailedInfo() - 查询详细预售信息和配置
  presaleAdmin.getUserInfo()   - 查询用户预售记录 (preSaleAddress mapping)
  presaleAdmin.getTotalInfo()  - 查询预售总览信息
  presaleAdmin.checkAddress()  - 查询指定地址的预售信息
  presaleAdmin.checkOwner()    - 检查当前钱包是否为管理员

🎛️ 管理命令（仅管理员）：
  presaleAdmin.start()         - 开启预售（设置状态为1）
  presaleAdmin.end()           - 结束预售（设置状态为2）

📖 其他命令：
  presaleAdmin.help()          - 显示此帮助信息

📝 状态说明：
  0 = 未开始    1 = 进行中    2 = 已结束

⚠️ 注意：管理命令需要管理员权限且会消耗TRX作为手续费
═══════════════════════════════════════
      `);
    },

    // 控制台命令：查询预售状态
    async consoleGetPresaleStatus() {
      try {
        console.log('🔍 正在查询预售状态...');

        const presaleAddress = await this.getPresaleContractAddress();
        if (!presaleAddress) {
          console.error('❌ 无法获取预售合约地址');
          return;
        }

        const presaleService = new PresaleService(presaleAddress);
        const status = await presaleService.getPresaleStatus();

        const statusText = presaleService.getPresaleStatusText(status);

        console.log(`
📊 预售状态查询结果
═══════════════════════════════════════
🏷️  合约地址: ${presaleAddress}
📈  当前状态: ${status} (${statusText})
⏰  查询时间: ${new Date().toLocaleString()}
═══════════════════════════════════════
        `);

        return { status, statusText, contractAddress: presaleAddress };

      } catch (error) {
        console.error('❌ 查询预售状态失败:', error);
        console.error('💡 请确保钱包已连接且网络正常');
      }
    },

    // 控制台命令：查询预售价格
    async consoleGetPresalePrice() {
      try {
        console.log('💰 正在查询预售价格...');

        const presaleAddress = await this.getPresaleContractAddress();
        if (!presaleAddress) {
          console.error('❌ 无法获取预售合约地址');
          return;
        }

        const presaleService = new PresaleService(presaleAddress);
        
        // 尝试多种方式获取预售价格
        let priceInfo = null;
        let error = null;
        
        // 方法1：尝试调用 getPresalePriceInfo
        try {
          priceInfo = await presaleService.getPresalePriceInfo();
          console.log('✅ 通过 getPresalePriceInfo 获取价格成功');
        } catch (err) {
          console.warn('⚠️ getPresalePriceInfo 调用失败，尝试直接读取存储变量');
          error = err;
        }
        
        // 方法2：如果方法1失败，尝试直接读取存储变量
        if (!priceInfo) {
          try {
            console.log('🔍 尝试直接读取预售价格存储变量...');
            
            // 直接调用合约的 preSaleEthAmount_ 存储变量
            const preSaleEthAmount = await presaleService.callMethod('preSaleEthAmount_');
            const tradeEthAmount = await presaleService.callMethod('tradeEthAmount_');
            const coinAmount = await presaleService.callMethod('coinAmount_');
            
            priceInfo = {
              preSaleEthAmount: preSaleEthAmount,
              tradeEthAmount: tradeEthAmount,
              coinAmount: coinAmount,
              tokenPrice: 'N/A',
              marketCap: 'N/A'
            };
            
            console.log('✅ 通过直接读取存储变量获取价格成功');
          } catch (directErr) {
            console.error('❌ 直接读取存储变量也失败:', directErr);
            throw new Error(`无法获取预售价格信息。错误1: ${error?.message}, 错误2: ${directErr?.message}`);
          }
        }

        // 修复：正确处理单位转换和BigInt类型
        const preSaleEthAmount = priceInfo.preSaleEthAmount;
        const coinAmount = priceInfo.coinAmount;
        
        // 处理BigInt类型，转换为字符串后再转换为数字
        const preSaleEthAmountNum = typeof preSaleEthAmount === 'bigint' 
          ? parseFloat(preSaleEthAmount.toString()) 
          : parseFloat(preSaleEthAmount);
        const coinAmountNum = typeof coinAmount === 'bigint' 
          ? parseFloat(coinAmount.toString()) 
          : parseFloat(coinAmount);
        
        // 合约中存储的是SUN单位，需要转换为TRX单位
        const preSaleEthAmountInTrx = preSaleEthAmountNum / 1000000; // SUN -> TRX
        const coinAmountInTrx = coinAmountNum / 1000000; // SUN -> TRX
        
        // 重新理解变量含义：
        // preSaleEthAmount: 预售价格（以SUN为单位）
        // coinAmount: 总代币数量（以SUN为单位）
        // 预售价格 = preSaleEthAmountInTrx TRX（动态获取）
        // 每TRX可买代币数量 = coinAmountInTrx / preSaleEthAmountInTrx
        
        // 格式化显示
        const preSaleEthAmountFormatted = this.formatTrxAmount(preSaleEthAmount, false, true);
        const coinAmountFormatted = this.formatTrxAmount(coinAmount, false, false);

        // 计算每TRX可买到的代币数量
        const tokensPerTrx = coinAmountInTrx / preSaleEthAmountInTrx;
        
        console.log(`
💰 预售价格查询结果
═══════════════════════════════════════
🏷️  合约地址: ${presaleAddress}
💎  预售价格: ${preSaleEthAmountInTrx.toFixed(6)} TRX (动态获取)
📊  预售价格(SUN): ${preSaleEthAmount}
🔄  预售价格(TRX): ${preSaleEthAmountInTrx.toFixed(6)} TRX
🪙  总代币数量(SUN): ${coinAmount}
🔄  总代币数量(TRX): ${coinAmountInTrx.toFixed(6)} 个
💱  每TRX可买代币: ${tokensPerTrx.toFixed(2)} 个
💱  实际代币数量: ${(coinAmountInTrx / 1000000).toFixed(0)} 个
💱  交易价格: ${this.formatTrxAmount(priceInfo.tradeEthAmount, false, true)} TRX
⏰  查询时间: ${new Date().toLocaleString()}
═══════════════════════════════════════
        `);

        return { 
          preSaleEthAmount, 
          preSaleEthAmountFormatted, 
          preSaleEthAmountInTrx,
          coinAmount,
          coinAmountInTrx,
          tokensPerTrx,
          actualTokenAmount: (coinAmountInTrx / 1000000).toFixed(0),
          contractAddress: presaleAddress,
          priceInfo 
        };

      } catch (error) {
        console.error('❌ 查询预售价格失败:', error);
        console.error('💡 请确保钱包已连接且网络正常');
        console.error('🔍 详细错误信息:', error.message);
      }
    },

    // 控制台命令：直接查询 preSaleEthAmount 存储变量
    async consoleGetPreSaleEthAmount() {
      try {
        console.log('🔍 正在直接查询 preSaleEthAmount 存储变量...');

        const presaleAddress = await this.getPresaleContractAddress();
        if (!presaleAddress) {
          console.error('❌ 无法获取预售合约地址');
          return;
        }

        const presaleService = new PresaleService(presaleAddress);
        
        // 调用 getPoolData 方法获取预售信息
        const poolData = await presaleService.callMethod('getPoolData');
        
        // getPoolData 返回一个数组，第一个元素是 presaleEthAmount_
        const preSaleEthAmount = poolData[0];
        const tradeEthAmount = poolData[1];
        const maxTotalNum = poolData[2];
        const presaleMaxNum = poolData[3];
        const coinAmount = poolData[4];
        const stageUnlockRate = poolData[5];
        
        const preSaleEthAmountFormatted = this.formatTrxAmount(preSaleEthAmount, false, true);

        console.log(`
🔍 preSaleEthAmount 查询结果
═══════════════════════════════════════
🏷️  合约地址: ${presaleAddress}
💎  预售价格: ${preSaleEthAmountFormatted} TRX
📊  原始数值: ${preSaleEthAmount}
  💱  交易价格: ${this.formatTrxAmount(tradeEthAmount, false, true)} TRX
🪙  代币数量: ${coinAmount} 个/TRX
📈  最大总量: ${maxTotalNum}
🎯  预售最大数量: ${presaleMaxNum}
🔓  阶段解锁比例: ${stageUnlockRate}
⏰  查询时间: ${new Date().toLocaleString()}
═══════════════════════════════════════
        `);

        return { 
          preSaleEthAmount, 
          preSaleEthAmountFormatted, 
          contractAddress: presaleAddress,
          poolData: {
            preSaleEthAmount,
            tradeEthAmount,
            maxTotalNum,
            presaleMaxNum,
            coinAmount,
            stageUnlockRate
          }
        };

      } catch (error) {
        console.error('❌ 查询 preSaleEthAmount 失败:', error);
        console.error('💡 请确保钱包已连接且网络正常');
        console.error('🔍 详细错误信息:', error.message);
      }
    },

    // 控制台命令：查询详细预售信息
    async consoleGetDetailedPresaleInfo() {
      try {
        console.log('🔍 正在查询详细预售信息...');

        const presaleAddress = await this.getPresaleContractAddress();
        if (!presaleAddress) {
          console.error('❌ 无法获取预售合约地址');
          return;
        }

        const presaleService = new PresaleService(presaleAddress);
        
        // 获取预售状态
        const status = await presaleService.getPresaleStatus();
        const statusText = presaleService.getPresaleStatusText ? 
          presaleService.getPresaleStatusText(status) : 
          ['未开始', '进行中', '已结束', '已结束', '已结束'][status] || '未知状态';
        
        // 获取预售配置
        const poolData = await presaleService.callMethod('getPoolData');
        const [
          preSaleEthAmount,
          tradeEthAmount,
          maxTotalNum,
          presaleMaxNum,
          coinAmount,
          stageUnlockRate
        ] = poolData;
        
        // 获取LGE配置
        let lgeConfig = null;
        try {
          lgeConfig = await presaleService.callMethod('getLGEConfig');
        } catch (err) {
          console.warn('⚠️ 无法获取LGE配置:', err.message);
        }
        
        // 获取合约余额
        let contractBalances = null;
        try {
          contractBalances = await presaleService.callMethod('getContractBalances');
        } catch (err) {
          console.warn('⚠️ 无法获取合约余额:', err.message);
        }
        
        // 获取已处理的BNB数量
        let processedBNB = null;
        try {
          processedBNB = await presaleService.callMethod('processedBNB');
        } catch (err) {
          console.warn('⚠️ 无法获取已处理BNB数量:', err.message);
        }

        console.log(`
🔍 详细预售信息查询结果
═══════════════════════════════════════
🏷️  合约地址: ${presaleAddress}
📊  预售状态: ${status} (${statusText})

💰 价格配置:
  💎  预售价格: ${this.formatTrxAmount(preSaleEthAmount, false, true)} TRX
  💱  交易价格: ${this.formatTrxAmount(tradeEthAmount, false, true)} TRX
  🪙  代币数量: ${coinAmount} 个/TRX

📈 数量配置:
  📊  最大总量: ${maxTotalNum}
  🎯  预售最大数量: ${presaleMaxNum}
  🔓  阶段解锁比例: ${stageUnlockRate}

${lgeConfig ? `
🎯 LGE配置:
  ⏰  开始时间: ${lgeConfig[5] ? new Date(lgeConfig[5] * 1000).toLocaleString() : 'N/A'}
  🎯  硬顶: ${lgeConfig[6] ? this.formatTrxAmount(lgeConfig[6], true) : 'N/A'} TRX
  👤  最大购买/钱包: ${lgeConfig[7] ? this.formatTrxAmount(lgeConfig[7], true) : 'N/A'} TRX
` : ''}

${contractBalances ? `
💼 合约余额:
  🪙  代币余额: ${contractBalances[0] || contractBalances.tokenBalance || 'N/A'}
  💰  TRX余额: ${contractBalances[1] ? this.formatTrxAmount(contractBalances[1]) : 'N/A'} TRX
` : ''}

${processedBNB ? `
📊 已处理BNB: ${this.formatTrxAmount(processedBNB)} TRX
` : ''}

⏰  查询时间: ${new Date().toLocaleString()}
═══════════════════════════════════════
        `);

        return { 
          status,
          statusText,
          contractAddress: presaleAddress,
          poolData: {
            preSaleEthAmount,
            tradeEthAmount,
            maxTotalNum,
            presaleMaxNum,
            coinAmount,
            stageUnlockRate
          },
          lgeConfig,
          contractBalances,
          processedBNB
        };

      } catch (error) {
        console.error('❌ 查询详细预售信息失败:', error);
        console.error('💡 请确保钱包已连接且网络正常');
        console.error('🔍 详细错误信息:', error.message);
      }
    },

    // 控制台命令：检查管理员权限
    async consoleCheckOwner() {
      try {
        console.log('🔐 正在检查管理员权限...');

        if (!this.isWalletConnected) {
          console.error('❌ 钱包未连接，请先连接钱包');
          return false;
        }

        const presaleAddress = await this.getPresaleContractAddress();
        if (!presaleAddress) {
          console.error('❌ 无法获取预售合约地址');
          return false;
        }

        const presaleService = new PresaleService(presaleAddress);
        const currentAddress = window.tronWeb.defaultAddress.base58;
        const isOwner = await presaleService.isOwner(currentAddress);

        console.log(`
🔐 管理员权限检查结果
═══════════════════════════════════════
🏷️  合约地址: ${presaleAddress}
👤  当前钱包: ${currentAddress}
🛡️  管理员权限: ${isOwner ? '✅ 是' : '❌ 否'}
⏰  检查时间: ${new Date().toLocaleString()}
═══════════════════════════════════════
        `);

        return isOwner;

      } catch (error) {
        console.error('❌ 检查管理员权限失败:', error);
        console.error('💡 请确保钱包已连接且网络正常');
        return false;
      }
    },

    // 控制台命令：查询用户预售记录 (preSaleAddress mapping)
    async consoleGetUserPresaleInfo(userAddress = null) {
      try {
        console.log('🔍 正在查询用户预售记录...');

        if (!this.isWalletConnected) {
          console.error('❌ 钱包未连接，请先连接钱包');
          return null;
        }

        const presaleAddress = await this.getPresaleContractAddress();
        if (!presaleAddress) {
          console.error('❌ 无法获取预售合约地址');
          return null;
        }

        // 如果没有指定用户地址，使用当前连接的钱包地址
        const targetAddress = userAddress || window.tronWeb.defaultAddress.base58;
        console.log(`👤 查询地址: ${targetAddress}`);

        const presaleService = new PresaleService(presaleAddress);
        
        // 直接调用合约的 preSaleAddress mapping
        const result = await presaleService.callMethod('preSaleAddress', [targetAddress]);
        
        // 解析返回结果
        const userInfo = {
          user: result.user || result[0],
          preSaleCount: result.preSaleCount || result[1],
          hasUnlockAmount: result.hasUnlockAmount || result[2],
          stage: result.stage || result[3],
          verify: result.verify || result[4]
        };

        if (userInfo.preSaleCount > 0) {
          console.log(`
✅ 找到预售记录！
═══════════════════════════════════════
🏷️  合约地址: ${presaleAddress}
👤  用户地址: ${targetAddress}
💰  预售数量: ${userInfo.preSaleCount}
🔓  已解锁数量: ${userInfo.hasUnlockAmount}
📊  当前阶段: ${userInfo.stage}
✅  验证状态: ${userInfo.verify ? '已验证' : '未验证'}
⏰  查询时间: ${new Date().toLocaleString()}
═══════════════════════════════════════
          `);
        } else {
          console.log(`
❌ 未找到预售记录
═══════════════════════════════════════
🏷️  合约地址: ${presaleAddress}
👤  用户地址: ${targetAddress}
💡  该地址未参与预售或预售数量为0
⏰  查询时间: ${new Date().toLocaleString()}
═══════════════════════════════════════
          `);
        }

        return userInfo;

              } catch (error) {
          console.error('❌ 查询用户预售记录失败:', error);
          console.error('💡 请确保钱包已连接且网络正常');
          return null;
        }
      },

      // 控制台命令：查询预售总览信息
      async consoleGetTotalPresaleInfo() {
        try {
          console.log('📊 正在查询预售总览信息...');

          if (!this.isWalletConnected) {
            console.error('❌ 钱包未连接，请先连接钱包');
            return null;
          }

          const presaleAddress = await this.getPresaleContractAddress();
          if (!presaleAddress) {
            console.error('❌ 无法获取预售合约地址');
            return null;
          }

          const presaleService = new PresaleService(presaleAddress);
          
          // 获取预售相关的总量信息
          const [
            totalPresaleBNB,      // 预售阶段累积的BNB
            accumulatedBNB,       // 累积的BNB总量
            processedBNB,         // 已处理的BNB数量
            presaleStatus,        // 预售状态
            startTime,            // 预售开始时间
            hardcap               // 硬顶限制
          ] = await Promise.all([
            presaleService.callMethod('totalPresaleBNB'),
            presaleService.callMethod('accumulatedBNB'),
            presaleService.callMethod('processedBNB'),
            presaleService.callMethod('presaleStatus'),
            presaleService.callMethod('startTime'),
            presaleService.callMethod('hardcap')
          ]);

          // 格式化BNB金额（从Sun单位转换为TRX）
          const formatBNB = (amount) => {
            if (!amount) return '0';
            const bnbAmount = Number(amount) / 1e6; // TRON使用6位小数
            return bnbAmount.toFixed(6);
          };

          // 格式化时间
          const formatTime = (timestamp) => {
            if (!timestamp || timestamp === '0') return 'N/A';
            const date = new Date(Number(timestamp));
            return date.toLocaleString();
          };

          // 获取状态文本
          const getStatusText = (status) => {
            switch (status) {
              case '0': return '未开始';
              case '1': return '进行中';
              case '2': return '已结束';
              default: return '未知状态';
            }
          };

          console.log(`
📊 预售总览信息
═══════════════════════════════════════
🏷️  合约地址: ${presaleAddress}
📈  当前状态: ${presaleStatus} (${getStatusText(presaleStatus)})
💰  预售总金额: ${formatBNB(totalPresaleBNB)} TRX
💎  累积总金额: ${formatBNB(accumulatedBNB)} TRX
🔄  已处理金额: ${formatBNB(processedBNB)} TRX
🎯  硬顶限制: ${formatBNB(hardcap)} TRX
⏰  开始时间: ${formatTime(startTime)}
⏰  查询时间: ${new Date().toLocaleString()}
═══════════════════════════════════════
          `);

          return {
            presaleAddress,
            presaleStatus,
            totalPresaleBNB: formatBNB(totalPresaleBNB),
            accumulatedBNB: formatBNB(accumulatedBNB),
            processedBNB: formatBNB(processedBNB),
            hardcap: formatBNB(hardcap),
            startTime: formatTime(startTime)
          };

        } catch (error) {
          console.error('❌ 查询预售总览信息失败:', error);
          console.error('💡 请确保钱包已连接且网络正常');
          return null;
        }
      },

      // 控制台命令：查询指定地址的预售信息
      async consoleCheckAddress(address = null) {
        try {
          if (!address) {
            console.error('❌ 请提供要查询的地址');
            console.log('💡 使用方法: checkAddress("地址")');
            console.log('💡 例如: checkAddress("TK57586sko7cTQxgNUGqpzMGWTwWBsr6iu")');
            return null;
          }

          console.log(`🔍 正在查询地址 ${address} 的预售信息...`);

          if (!this.isWalletConnected) {
            console.error('❌ 钱包未连接，请先连接钱包');
            return null;
          }

          const presaleAddress = await this.getPresaleContractAddress();
          if (!presaleAddress) {
            console.error('❌ 无法获取预售合约地址');
            return null;
          }

          const presaleService = new PresaleService(presaleAddress);
          
          // 获取该地址的预售信息
          const presaleInfo = await presaleService.callMethod('preSaleAddress', [address]);

          // 解析返回结果
          const userInfo = {
            user: presaleInfo.user || presaleInfo[0],
            preSaleCount: presaleInfo.preSaleCount || presaleInfo[1],
            hasUnlockAmount: presaleInfo.hasUnlockAmount || presaleInfo[2],
            stage: presaleInfo.stage || presaleInfo[3],
            verify: presaleInfo.verify || presaleInfo[4]
          };

          if (userInfo.preSaleCount > 0) {
            console.log(`
✅ 找到预售记录！
═══════════════════════════════════════
🏷️  合约地址: ${presaleAddress}
👤  查询地址: ${address}
💰  预售数量: ${userInfo.preSaleCount}
🔓  已解锁数量: ${userInfo.hasUnlockAmount}
📊  当前阶段: ${userInfo.stage}
✅  验证状态: ${userInfo.verify ? '已验证' : '未验证'}
⏰  查询时间: ${new Date().toLocaleString()}
═══════════════════════════════════════
            `);
          } else {
            console.log(`
❌ 未找到预售记录
═══════════════════════════════════════
🏷️  合约地址: ${presaleAddress}
👤  查询地址: ${address}
💡  该地址未参与预售或预售数量为0
⏰  查询时间: ${new Date().toLocaleString()}
═══════════════════════════════════════
            `);
          }

          return userInfo;

        } catch (error) {
          console.error('❌ 查询地址预售信息失败:', error);
          console.error('💡 请确保钱包已连接且网络正常');
          return null;
        }
      },

    // 控制台命令：开启预售
    async consoleStartPresale() {
      try {
        console.log('🚀 正在开启预售...');

        // 检查权限
        const isOwner = await this.consoleCheckOwner();
        if (!isOwner) {
          console.error('❌ 权限不足：只有合约管理员才能开启预售');
          return false;
        }

        const presaleAddress = await this.getPresaleContractAddress();
        const presaleService = new PresaleService(presaleAddress);

        // 检查当前状态
        const currentStatus = await presaleService.getPresaleStatus();
        if (currentStatus === 1) {
          console.warn('⚠️ 预售已经在进行中，无需重复开启');
          return false;
        }

        console.log('📝 正在提交开启预售交易...');
        const result = await presaleService.startPresale();

        console.log(`
🚀 预售开启成功！
═══════════════════════════════════════
🏷️  合约地址: ${presaleAddress}
📈  新状态: 1 (进行中)
🔗  交易哈希: ${result}
⏰  操作时间: ${new Date().toLocaleString()}
═══════════════════════════════════════
        `);

        // 刷新页面数据
        setTimeout(() => {
          this.loadPresaleInfo();
        }, 3000);

        return true;

      } catch (error) {
        console.error('❌ 开启预售失败:', error);
        console.error('💡 请检查网络连接和TRX余额');
        return false;
      }
    },

    // 控制台命令：结束预售
    async consoleEndPresale() {
      try {
        console.log('🛑 正在结束预售...');

        // 检查权限
        const isOwner = await this.consoleCheckOwner();
        if (!isOwner) {
          console.error('❌ 权限不足：只有合约管理员才能结束预售');
          return false;
        }

        const presaleAddress = await this.getPresaleContractAddress();
        const presaleService = new PresaleService(presaleAddress);

        // 检查当前状态
        const currentStatus = await presaleService.getPresaleStatus();
        if (currentStatus >= 2) {
          console.warn('⚠️ 预售已经结束，无需重复操作');
          return false;
        }

        console.log('📝 正在提交结束预售交易...');
        const result = await presaleService.endPresale();

        console.log(`
🛑 预售结束成功！
═══════════════════════════════════════
🏷️  合约地址: ${presaleAddress}
📈  新状态: 2 (已结束)
🔗  交易哈希: ${result}
⏰  操作时间: ${new Date().toLocaleString()}
═══════════════════════════════════════
        `);

        // 刷新页面数据
        setTimeout(() => {
          this.loadPresaleInfo();
        }, 3000);

        return true;

      } catch (error) {
        console.error('❌ 结束预售失败:', error);
        console.error('💡 请检查网络连接和TRX余额');
        return false;
      }
    },

    // 更新资金进度
    async updateFundingProgress() {
      try {
        const presaleAddress = await this.getPresaleContractAddress();
        if (!presaleAddress) return;

        const tronWeb = window.tronWeb;
        const contract = await tronWeb.contract(presaleABI, presaleAddress);

        // 获取总筹集金额
        const totalRaised = await contract.totalPresaleBNB().call();
        const hardCap = parseFloat(this.tokenInfo.hardCap?.replace(/[^\d.]/g, '') || '1000');

        // 更新进度百分比
        const raisedInTrx = tronWeb.fromSun(totalRaised);
        this.fundingPercentage = Math.min((raisedInTrx / hardCap) * 100, 100);

      } catch (error) {
        console.error('Failed to update funding progress:', error);
      }
    },

    // 监听钱包连接状态
    watchWalletConnection() {
      // 初始检查
      this.checkWalletConnection();

      // 定期检查钱包连接状态
      this.walletWatcher = setInterval(() => {
        this.checkWalletConnection();
      }, 2000);
    },

    // 检查钱包连接状态
    async checkWalletConnection() {
      const wasConnected = this.isWalletConnected;
      const isNowConnected = !!(window.tronWeb && window.tronWeb.defaultAddress?.base58);

      if (!wasConnected && isNowConnected) {
        // 钱包刚连接，更新余额
        await this.getUserTrxBalance();
      } else if (wasConnected && !isNowConnected) {
        // 钱包断开连接，重置余额
        this.userTrxBalance = 0;
        this.presaleAmount = '';
        this.presaleValidationError = '';
      }
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
    },

    // ==================== 数据格式化工具方法 ====================

    // 格式化时间戳
    formatTimestamp(timestamp) {
      if (!timestamp) return '2025/08/15 14:14(4d 2h)'

      try {
        const date = new Date(parseInt(timestamp) * 1000)
        const now = new Date()
        const diffMs = date.getTime() - now.getTime()
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
        const diffHours = Math.ceil((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

        const dateStr = date.toLocaleDateString('zh-CN').replace(/\//g, '/')
        const timeStr = date.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })
        const relativeStr = diffMs > 0 ? `(${diffDays}d ${diffHours}h)` : '(已开始)'

        return `${dateStr} ${timeStr}${relativeStr}`
      } catch (error) {
        console.error('时间格式化失败:', error)
        return '2025/08/15 14:14(4d 2h)'
      }
    },

    // 格式化持续时间
    formatDuration(seconds) {
      if (!seconds) return '90 days'

      try {
        const days = Math.floor(parseInt(seconds) / (24 * 60 * 60))
        return `${days} days`
      } catch (error) {
        return '10 days'
      }
    },

    // 格式化 TRX 金额 - 修复：正确处理SUN到TRX转换，避免二次格式化
    formatTrxAmount(amount, isHardCapOrMaxBuy = false, isPresalePrice = false) {
      if (!amount) return '0 TRX'

      try {
        // 处理BigInt类型
        let numericAmount = amount
        if (typeof amount === 'bigint') {
          numericAmount = amount.toString()
        }

        // 转换为数字
        let trxAmount = parseFloat(numericAmount)
        
        // 添加详细的调试日志
        console.log(`🔍 formatTrxAmount 输入详情:`, {
          原始输入: amount,
          转换后数值: trxAmount,
          输入类型: typeof amount,
          是否硬顶或最大购买量: isHardCapOrMaxBuy,
          是否预售价格: isPresalePrice
        })
        
        // 如果是预售价格，且数值异常大，可能需要特殊处理
        if (isPresalePrice && trxAmount > 1e15) {
          console.log(`🔧 检测到预售价格异常大数值: ${trxAmount}，尝试智能单位转换`)
          // 预售价格可能是wei单位，需要除以1e18
          if (trxAmount > 1e18) {
            console.log(`🔄 预售价格应用wei到ether转换: ${trxAmount} / 1e18`)
            trxAmount = trxAmount / 1e18
          } else if (trxAmount > 1e12) {
            console.log(`🔄 预售价格应用sun到trx转换: ${trxAmount} / 1e6`)
            trxAmount = trxAmount / 1e6
          }
        }
        // 如果是硬顶或最大购买量，且数值异常大，需要额外除以10^6
        else if (isHardCapOrMaxBuy && trxAmount > 1000000000000) { // 提高阈值到1万亿
          console.log(`🔧 检测到硬顶/最大购买量异常大数值: ${trxAmount}，应用额外单位转换`)
          // 检查是否已经是TRX单位（通过检查数值范围）
          if (trxAmount > 1e18) { // 如果超过1e18，可能是wei单位，需要除以1e18
            console.log(`🔄 检测到可能是wei单位，应用wei到ether转换`)
            trxAmount = trxAmount / 1e18
          } else if (trxAmount > 1e6) { // 如果超过1e6，可能是sun单位，需要除以1e6
            console.log(`🔄 检测到可能是sun单位，应用sun到trx转换`)
            trxAmount = trxAmount / 1e6
          } else {
            // 其他情况，应用额外的10^6转换
            trxAmount = trxAmount / 1000000
          }
        } else {
          // 普通情况：处理SUN到TRX的转换
          trxAmount = trxAmount / 1000000 // 转换 SUN 到 TRX
        }
        
        // 添加更详细的调试信息
        if (isHardCapOrMaxBuy) {
          console.log(`🔍 硬顶/最大购买量处理详情:`, {
            原始数值: numericAmount,
            转换后数值: trxAmount,
            是否应用额外转换: trxAmount > 1000000000000,
            最终数值: trxAmount
          })
        }

        // 添加详细调试日志
        console.log(`💰 TRX金额转换详情:`, {
          原始输入: amount,
          转换后数值: trxAmount,
          输入类型: typeof amount,
          是否硬顶或最大购买量: isHardCapOrMaxBuy
        })

        // 修复：合理的格式化阈值，避免正常数值被错误格式化
        if (isHardCapOrMaxBuy && trxAmount >= 1000000000) { // 硬顶/最大购买量：10亿以上使用B单位
          return `${(trxAmount / 1000000000).toFixed(2)}B TRX`
        } else if (isHardCapOrMaxBuy && trxAmount >= 1000000) { // 硬顶/最大购买量：100万以上使用M单位
          return `${(trxAmount / 1000000).toFixed(2)}M TRX`
        } else if (trxAmount >= 10000000) { // 普通情况：1千万TRX以上才使用M单位
          return `${(trxAmount / 1000000).toFixed(2)}M TRX`
        } else if (trxAmount >= 10000) { // 1万TRX以上才使用K单位
          return `${(trxAmount / 1000).toFixed(2)}K TRX`
        } else {
          // 对于正常范围的数值（如1000 TRX），直接显示
          return `${Math.round(trxAmount).toLocaleString()} TRX`
        }
      } catch (error) {
        console.warn('⚠️ TRX金额格式化失败:', error, 'amount:', amount)
        return '0 TRX'
      }
    },

    // 安全转换 BigInt 到数字
    safeBigIntToNumber(value) {
      if (typeof value === 'bigint') {
        return parseFloat(value.toString())
      }
      return parseFloat(value) || 0
    },

    // 格式化代币数量 - 修复：正确处理decimals参数和BigInt类型
    formatTokenAmount(amount, decimals = 18) {
      if (!amount) return '100%'

      try {
        // 添加详细的调试日志
        console.log(`🔍 formatTokenAmount 输入详情:`, {
          amount: amount,
          类型: typeof amount,
          是否为BigInt: typeof amount === 'bigint',
          数值: amount.toString()
        })

        // 如果amount是字符串且包含小数点，说明已经格式化过了
        if (typeof amount === 'string' && amount.includes('.')) {
          const num = parseFloat(amount)
          return `${num.toLocaleString()}`
        }

        // 处理BigInt类型
        let amountToProcess = amount
        if (typeof amount === 'bigint') {
          amountToProcess = amount.toString()
        }

        // 使用TokenService的静态方法正确处理decimals
        const formattedAmount = TokenService.formatTokenAmount(amountToProcess, decimals)
        console.log(`🔍 TokenService.formatTokenAmount 结果:`, {
          输入: amountToProcess,
          decimals: decimals,
          输出: formattedAmount
        })

        const num = parseFloat(formattedAmount)
        console.log(`🔍 最终数值:`, {
          格式化后: formattedAmount,
          解析后: num,
          是否为NaN: isNaN(num)
        })

        if (isNaN(num) || num === 0) {
          console.warn('⚠️ 解析后的数值无效，返回原始值')
          return amountToProcess
        }

        return `${num.toLocaleString()}`
      } catch (error) {
        console.warn('⚠️ 代币数量格式化失败:', error, 'amount:', amount, 'decimals:', decimals)
        return '100%'
      }
    },

    // 格式化兑换比例
    formatExchangeRate(amount) {
      if (!amount) return '1 TST=1 TRX'

      try {
        const rate = parseInt(amount) / 1000000 // 转换 SUN 到 TRX
        return `1 TST=${rate} TRX`
      } catch (error) {
        return '1 TST=1 TRX'
      }
    },

    // 格式化背书信息
    formatBackingInfo(backingShare, backingReceiver) {
      if (!backingShare || parseInt(backingShare) === 0) {
        return '25% TRX / 50% union'
      }

      try {
        const percentage = parseInt(backingShare)
        const receiverShort = backingReceiver ?
          `${backingReceiver.slice(0, 6)}...${backingReceiver.slice(-4)}` :
          'union'
        return `${percentage}% TRX / ${100 - percentage}% ${receiverShort}`
      } catch (error) {
        return '25% TRX / 50% union'
      }
    },

    // 格式化 LP 分配
    formatLpDistribution(userShare, devShare) {
      try {
        const userPercent = parseInt(userShare) / 100 || 75
        const devPercent = parseInt(devShare) / 100 || 25
        return `${userPercent}% TRX / ${devPercent}% union`
      } catch (error) {
        return '25% TRX / 50% union'
      }
    },

    // 计算结束时间
    calculateEndTime(startTime, duration) {
      if (!startTime || !duration) return '2025/08/15 14:14(4d 2h)'

      try {
        const start = parseInt(startTime)
        const durationSec = parseInt(duration)
        const endTimestamp = start + durationSec
        return this.formatTimestamp(endTimestamp)
      } catch (error) {
        return '2025/08/15 14:14(4d 2h)'
      }
    },

    // 计算持续时间（按天显示）- 修复：简化逻辑，提高可靠性
    calculateDuration(startTime, endTime) {
      if (!startTime) {
        console.log('⚠️ 开始时间为空，使用默认持续时间')
        return '90 days'
      }

      try {
        let startTimestamp = startTime
        let endTimestamp = endTime

        // 统一转换为时间戳（秒）
        if (typeof startTime === 'string') {
          startTimestamp = this.parseTimestampFromString(startTime)
        } else if (typeof startTime === 'number') {
          startTimestamp = startTime
        }

        if (typeof endTime === 'string') {
          // 先尝试从格式化字符串中提取天数
          const dayMatch = endTime.match(/\((\d+)d/)
          if (dayMatch) {
            const days = parseInt(dayMatch[1])
            console.log(`✅ 从格式化字符串提取持续时间: ${days} days`)
            return `${days} days`
          }
          // 如果没有找到天数，尝试解析为时间戳
          endTimestamp = this.parseTimestampFromString(endTime)
        } else if (typeof endTime === 'number') {
          endTimestamp = endTime
        }

        // 如果成功获取到两个时间戳，计算差值
        if (startTimestamp && endTimestamp && typeof startTimestamp === 'number' && typeof endTimestamp === 'number') {
          const diffSeconds = Math.abs(endTimestamp - startTimestamp)
          const days = Math.floor(diffSeconds / (24 * 60 * 60))
          console.log(`✅ 计算持续时间成功: ${startTimestamp} -> ${endTimestamp} = ${days} days`)
          return `${days} days`
        }

        console.log('⚠️ 无法计算持续时间，参数类型不匹配:', {
          startTime: typeof startTime,
          endTime: typeof endTime,
          startTimestamp,
          endTimestamp
        })
        return '90 days'
      } catch (error) {
        console.error('❌ 计算持续时间失败:', error)
        return '90 days'
      }
    },

    // 从格式化的时间字符串中解析时间戳
    parseTimestampFromString(timeString) {
      try {
        // 尝试从字符串中提取日期部分，例如 "2025/08/15 14:14(4d 2h)"
        const dateMatch = timeString.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{1,2})/)
        if (dateMatch) {
          const [, year, month, day, hour, minute] = dateMatch
          const date = new Date(year, month - 1, day, hour, minute)
          return Math.floor(date.getTime() / 1000)
        }
        return null
      } catch (error) {
        console.error('❌ 解析时间字符串失败:', error)
        return null
      }
    },

    // 计算解锁轮次
    calculateVestingRounds(vestingRate) {
      if (!vestingRate) return '5 rounds'

      try {
        const rate = parseInt(vestingRate.replace('%', ''))
        const rounds = Math.ceil(100 / rate)
        return `${rounds} rounds`
      } catch (error) {
        return '5 rounds'
      }
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

/* === 增强的绑定曲线样式 === */
.bonding-curve-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.bonding-curve-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.curve-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.percentage-badge {
  background: rgba(255, 255, 255, 0.9);
  color: #1a1a1a;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.enhanced-progress-container {
  margin-bottom: 20px;
}

.progress-track {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
  border-radius: 4px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-20px); opacity: 0; }
  50% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(20px); opacity: 0; }
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 18px;
  height: 18px;
  background: #ffffff;
  border: 3px solid #6366f1;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.curve-status-info {
  text-align: center;
}

.status-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.4;
}

.funding-stats {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 16px;
  color: #ffffff;
  font-weight: 700;
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

  /* 绑定曲线响应式调整 */
  .bonding-curve-card {
    padding: 16px;
  }

  .bonding-curve-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }

  .curve-title {
    font-size: 16px;
  }

  .percentage-badge {
    padding: 6px 12px;
    font-size: 14px;
    align-self: flex-end;
  }

  .funding-stats {
    gap: 16px;
  }

  .stat-value {
    font-size: 14px;
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

/* === 预售参与区域样式 === */
.presale-participation-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
  margin-top: 20px;
}

.presale-section-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
}

.presale-input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.amount-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.presale-amount-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 14px 80px 14px 16px;
  color: #ffffff;
  font-size: 16px;
  outline: none;
  transition: all 0.2s ease;
}

.presale-amount-input:focus {
  border-color: #00d4ff;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
}

.presale-amount-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.presale-amount-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.max-button {
  position: absolute;
  right: 8px;
  background: #00d4ff;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
}

.max-button:hover:not(:disabled) {
  background: #00b8e6;
  transform: scale(1.05);
}

.max-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.balance-display {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  text-align: left;
  padding-left: 4px;
}

.validation-error {
  color: #ff6b6b;
  font-size: 13px;
  padding-left: 4px;
  margin-top: -4px;
}

.enter-presale-button {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.enter-presale-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.enter-presale-button:active:not(:disabled) {
  transform: translateY(0);
}

.enter-presale-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.enter-presale-button.loading {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  cursor: not-allowed;
}

.enter-presale-button.success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  animation: successPulse 0.6s ease-out;
}

@keyframes successPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 大屏幕适配 */
@media (min-width: 768px) {
  .token-detail-page {
    max-width: 480px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  }
}

/* 响应式调整 */
@media (max-width: 375px) {
  .presale-participation-section {
    padding-top: 16px;
    margin-top: 16px;
  }

  .presale-section-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .presale-amount-input {
    padding: 12px 70px 12px 14px;
    font-size: 15px;
  }

  .max-button {
    padding: 6px 12px;
    font-size: 13px;
  }

  .enter-presale-button {
    padding: 14px 20px;
    font-size: 15px;
    min-height: 48px;
  }
}

/* === 代币导航控件样式 === */
.token-navigation {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 8px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.token-index-display {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .token-navigation {
    gap: 8px;
  }

  .nav-btn {
    padding: 6px;
    min-width: 28px;
    height: 28px;
  }

  .token-index-display {
    font-size: 12px;
    padding: 4px 8px;
    min-width: 50px;
  }
}
</style>