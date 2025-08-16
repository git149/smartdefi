<template>
  <!-- 钱包连接器UI已隐藏，功能通过控制台操作 -->
  <div class="tron-wallet-connector" style="display: none;">
    <!-- 所有UI元素已隐藏，但保留DOM结构以维持功能 -->
  </div>
</template>

<script>
export default {
  name: 'TronWalletConnector',
  
  data() {
    return {
      connecting: false,
      refreshing: false,
      error: null,
      balance: null
    }
  },

  watch: {
    '$tronState.isConnected'(newVal) {
      if (newVal) {
        this.loadBalance()
      } else {
        this.balance = null
      }
    },

    '$tronState.currentAccount'(newVal) {
      if (newVal) {
        this.loadBalance()
      }
    }
  },

  mounted() {
    // 如果已经连接，加载余额
    if (this.$tronState.isConnected) {
      this.loadBalance()
    }
  },

  methods: {
    /**
     * 连接钱包 - 仅控制台输出
     */
    async connectWallet() {
      this.connecting = true
      console.log('🔗 开始连接TRON钱包...')

      try {
        await this.$connectTronWallet()
        console.log('✅ 钱包连接成功:', {
          address: this.$formatTronAddress(this.$tronState.currentAccount),
          network: this.$tronState.networkConfig?.name || '未知'
        })
        this.$emit('connected', this.$tronState.currentAccount)
      } catch (error) {
        console.error('❌ 钱包连接失败:', this.getErrorMessage(error))
        this.$emit('error', error)
      } finally {
        this.connecting = false
      }
    },

    /**
     * 断开钱包连接 - 仅控制台输出
     */
    disconnectWallet() {
      console.log('🔌 断开钱包连接...')
      this.$disconnectTronWallet()
      this.balance = null
      console.log('✅ 钱包已断开连接')
      this.$emit('disconnected')
    },

    /**
     * 加载余额
     */
    async loadBalance() {
      if (!this.$tronState.currentAccount) return

      try {
        this.balance = await this.$getTronBalance()
      } catch (error) {
        console.error('加载余额失败:', error)
      }
    },

    /**
     * 刷新余额 - 仅控制台输出
     */
    async refreshBalance() {
      this.refreshing = true
      console.log('🔄 刷新余额中...')

      try {
        await this.loadBalance()
        console.log('✅ 余额刷新成功:', this.balance?.formatted || '0 TRX')
        this.$emit('balanceRefreshed', this.balance)
      } catch (error) {
        console.error('❌ 刷新余额失败:', error)
        this.$emit('error', error)
      } finally {
        this.refreshing = false
      }
    },

    /**
     * 复制地址 - 仅控制台输出
     */
    async copyAddress() {
      try {
        await navigator.clipboard.writeText(this.$tronState.currentAccount)
        console.log('📋 地址已复制到剪贴板:', this.$formatTronAddress(this.$tronState.currentAccount))
        this.$emit('addressCopied')
      } catch (error) {
        console.error('❌ 复制地址失败:', error)
      }
    },

    /**
     * 获取错误消息
     */
    getErrorMessage(error) {
      if (error.message?.includes('TronWeb')) {
        return '请安装TronLink钱包'
      } else if (error.message?.includes('连接')) {
        return '钱包连接失败，请重试'
      } else {
        return error.message || '未知错误'
      }
    }
  }
}
</script>

<style scoped>
.tron-wallet-connector {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
}

.wallet-disconnected {
  text-align: center;
}

.wallet-info h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.wallet-info p {
  margin: 0 0 20px 0;
  color: #666;
}

.connect-button {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.connect-button:hover:not(:disabled) {
  background: #e55a2b;
}

.connect-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.wallet-connected {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.account-info,
.balance-info,
.network-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.label {
  font-weight: bold;
  color: #333;
}

.address {
  font-family: monospace;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.copy-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.balance {
  font-weight: bold;
  color: #28a745;
}

.network {
  color: #6c757d;
}

.wallet-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.refresh-button,
.disconnect-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.refresh-button {
  background: #28a745;
  color: white;
}

.refresh-button:hover:not(:disabled) {
  background: #218838;
}

.disconnect-button {
  background: #dc3545;
  color: white;
}

.disconnect-button:hover {
  background: #c82333;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.initializing {
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

@media (max-width: 768px) {
  .wallet-connected {
    flex-direction: column;
  }
  
  .wallet-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
