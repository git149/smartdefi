<template>
  <div class="tron-example">
    <!-- 钱包连接器 - 隐藏但保持功能 -->
    <TronWalletConnector
      ref="walletConnector"
      @connected="onWalletConnected"
      @disconnected="onWalletDisconnected"
      @error="onError"
      style="display: none;"
    />

    <!-- 代币创建器 - 始终显示 -->
    <TokenCreator
      @created="onTokenCreated"
      @error="onError"
    />
  </div>
</template>

<script>
import TronWalletConnector from '../tron/components/TronWalletConnector.vue'
import TokenCreator from '../tron/components/TokenCreator.vue'

export default {
  name: 'TronExample',
  
  components: {
    TronWalletConnector,
    TokenCreator
  },

  data() {
    return {
      loading: false,

      // 合约状态 - 仅用于内部逻辑，不显示在UI
      factoryStatus: null,
      tokenInfo: null,
      presaleInfo: null,

      // 输入地址 - 仅用于内部逻辑
      tokenAddress: '',
      presaleAddress: ''
    }
  },

  mounted() {
    // 设置控制台命令
    this.setupConsoleCommands()

    // 自动尝试连接钱包
    this.autoConnectWallet()
  },

  methods: {
    /**
     * 钱包连接成功
     */
    onWalletConnected(account) {
      console.log(`✅ 钱包连接成功: ${this.$formatTronAddress(account)}`)
    },

    /**
     * 钱包断开连接
     */
    onWalletDisconnected() {
      console.log('🔌 钱包已断开连接')

      // 清理状态
      this.factoryStatus = null
      this.tokenInfo = null
      this.presaleInfo = null
    },

    /**
     * 代币创建成功
     */
    onTokenCreated(result) {
      console.log('🎉 代币和预售创建成功！', result)

      // 如果获取到了合约地址，自动填入查询框
      if (result.contractAddresses) {
        this.tokenAddress = result.contractAddresses.tokenAddress
        this.presaleAddress = result.contractAddresses.presaleAddress
        console.log('📝 合约地址已自动填入:', {
          token: result.contractAddresses.tokenAddress,
          presale: result.contractAddresses.presaleAddress
        })
      }
    },

    /**
     * 错误处理
     */
    onError(error) {
      console.error('❌ 错误:', error.message || error.toString())
    },

    /**
     * 加载工厂状态 - 仅控制台输出
     */
    async loadFactoryStatus() {
      this.loading = true

      try {
        this.factoryStatus = await this.$tron.coordinatorFactory.getFactoryStatus()
        console.log('🏭 工厂状态加载成功:', {
          isEnabled: this.factoryStatus.isEnabled,
          creationFee: `${this.$formatNumber(this.factoryStatus.creationFee / 1000000)} TRX`,
          totalPairs: this.factoryStatus.totalPairs
        })
      } catch (error) {
        this.onError(error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载代币信息 - 仅控制台输出
     */
    async loadTokenInfo() {
      if (!this.tokenAddress) return

      this.loading = true

      try {
        const tokenService = this.$tron.getTokenService(this.tokenAddress)
        this.tokenInfo = await tokenService.getUserTokenInfo(this.$tronState.currentAccount)
        console.log('🪙 代币信息加载成功:', {
          name: this.tokenInfo.name,
          symbol: this.tokenInfo.symbol,
          totalSupply: this.$formatNumber(this.tokenInfo.totalSupply),
          decimals: this.tokenInfo.decimals,
          userBalance: this.$formatNumber(this.tokenInfo.userBalance || 0),
          tradingEnabled: this.tokenInfo.tradingEnabled
        })
      } catch (error) {
        this.onError(error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载预售信息 - 仅控制台输出
     */
    async loadPresaleInfo() {
      if (!this.presaleAddress) return

      this.loading = true

      try {
        const presaleService = this.$tron.getPresaleService(this.presaleAddress)
        this.presaleInfo = await presaleService.getPresaleFullStatus()
        console.log('💰 预售信息加载成功:', {
          presaleStatus: this.getPresaleStatusText(this.presaleInfo.presaleStatus),
          maxInsideNum: this.presaleInfo.maxInsideNum,
          totalPresaleBNB: `${this.$formatNumber(this.presaleInfo.totalPresaleBNB / 1000000)} TRX`,
          isFinalized: this.presaleInfo.finalizationStatus.isFinalized,
          marketPrice: this.presaleInfo.marketPrice
        })
      } catch (error) {
        this.onError(error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取预售状态文本
     */
    getPresaleStatusText(status) {
      const statusMap = {
        0: '未开始',
        1: '进行中',
        2: '暂停',
        3: '已结束'
      }
      return statusMap[status] || '未知'
    },

    /**
     * 设置控制台命令
     */
    setupConsoleCommands() {
      // 将钱包操作方法暴露到全局，方便控制台调用
      window.tronWallet = {
        connect: () => {
          if (this.$refs.walletConnector) {
            this.$refs.walletConnector.connectWallet()
          } else {
            console.log('🔗 尝试自动连接钱包...')
            this.autoConnectWallet()
          }
        },
        disconnect: () => {
          if (this.$refs.walletConnector) {
            this.$refs.walletConnector.disconnectWallet()
          } else {
            this.$disconnectTronWallet()
            console.log('✅ 钱包已断开连接')
          }
        },
        refreshBalance: () => {
          if (this.$refs.walletConnector) {
            this.$refs.walletConnector.refreshBalance()
          }
        },
        getStatus: () => {
          console.log('📊 钱包状态:', {
            isConnected: this.$tronState.isConnected,
            currentAccount: this.$tronState.currentAccount ?
              this.$formatTronAddress(this.$tronState.currentAccount) : '未连接',
            network: this.$tronState.networkConfig?.name || '未知'
          })
        }
      }

      console.log(`
🎮 TRON钱包控制台命令已就绪:
  tronWallet.connect()      - 连接钱包
  tronWallet.disconnect()   - 断开连接
  tronWallet.refreshBalance() - 刷新余额
  tronWallet.getStatus()    - 查看状态
      `)
    },

    /**
     * 自动连接钱包
     */
    async autoConnectWallet() {
      try {
        // 检查是否有 TronLink
        if (typeof window.tronWeb !== 'undefined' && window.tronWeb.ready) {
          console.log('🔍 检测到 TronLink，尝试自动连接...')
          await this.$connectTronWallet()
        } else {
          console.log('⚠️  未检测到 TronLink 钱包，请手动连接')
          console.log('💡 使用 tronWallet.connect() 命令连接钱包')
        }
      } catch (error) {
        console.log('⚠️  自动连接失败，请手动连接:', error.message)
        console.log('💡 使用 tronWallet.connect() 命令连接钱包')
      }
    }
  }
}
</script>

<style scoped>
.tron-example {
  min-height: 100vh;
  background: #0B0F1A;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
}

.section {
  margin-bottom: 40px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.interaction-panel {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #f9f9f9;
}

.interaction-panel h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.form-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.form-group label {
  font-weight: bold;
  min-width: 80px;
}

.form-group input {
  flex: 1;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-group button:hover:not(:disabled) {
  background: #0056b3;
}

.form-group button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.status-info,
.token-info,
.presale-info {
  margin-top: 15px;
  padding: 15px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.status-info p,
.token-info p,
.presale-info p {
  margin: 8px 0;
}

.token-info h4,
.presale-info h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.error-message {
  padding: 15px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  margin-bottom: 20px;
}

.success-message {
  padding: 15px;
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .form-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-group label {
    min-width: auto;
  }
  
  .form-group input {
    min-width: auto;
  }
}
</style>
