<template>
  <div class="presale-manager">
    <!-- 页面标题 -->
    <div class="header">
      <h1 class="title">预售管理</h1>
      <p class="subtitle">管理您的代币预售状态</p>
    </div>

    <!-- 合约地址输入界面 -->
    <div v-if="!presaleAddress" class="address-input-section">
      <div class="input-card">
        <div class="card-header">
          <h3>📝 输入预售合约地址</h3>
          <p>请输入您要管理的预售合约地址</p>
        </div>

        <div class="address-input-form">
          <div class="input-group">
            <label>预售合约地址</label>
            <input
              v-model="inputAddress"
              type="text"
              placeholder="输入TRON预售合约地址 (T开头的34位地址)"
              class="address-input"
              :class="{ 'error': addressError }"
              @input="onAddressInput"
            />
            <div v-if="addressError" class="error-text">{{ addressError }}</div>
          </div>

          <div class="recent-addresses" v-if="recentAddresses.length > 0">
            <h4>最近使用的地址</h4>
            <div class="address-list">
              <div
                v-for="(addr, index) in recentAddresses"
                :key="index"
                class="address-item"
                @click="selectRecentAddress(addr)"
              >
                <div class="address-info">
                  <div class="address-text">{{ formatAddress(addr.address) }}</div>
                  <div class="address-time">{{ addr.time }}</div>
                </div>
                <button class="select-btn">选择</button>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button
              @click="loadPresaleContract"
              class="load-btn"
              :disabled="!inputAddress || addressError || loading"
            >
              <span v-if="loading" class="loading-spinner">⏳</span>
              {{ loading ? '加载中...' : '加载预售合约' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 钱包连接状态 -->
    <div v-else-if="!isWalletConnected" class="wallet-prompt">
      <div class="prompt-card">
        <div class="prompt-icon">🔗</div>
        <h3>请连接钱包</h3>
        <p>需要连接TronLink钱包来管理预售状态</p>
        <button @click="connectWallet" class="connect-btn">连接钱包</button>
      </div>
    </div>

    <!-- 主要内容 -->
    <div v-else class="main-content">
      <!-- 预售信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <h3>预售信息</h3>
          <button @click="refreshStatus" class="refresh-btn" :disabled="loading">
            <span class="refresh-icon" :class="{ spinning: loading }">🔄</span>
          </button>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label>预售合约地址</label>
            <div class="address-display">
              {{ formatAddress(presaleAddress) }}
              <button @click="copyAddress(presaleAddress)" class="copy-btn">📋</button>
            </div>
          </div>

          <div class="info-item">
            <label>当前状态</label>
            <div class="status-display" :class="statusClass">
              <span class="status-dot"></span>
              {{ statusText }}
            </div>
          </div>

          <div class="info-item">
            <label>权限检查</label>
            <div class="permission-display" :class="{ 'has-permission': isOwner }">
              {{ isOwner ? '✅ 您是合约所有者' : '❌ 您不是合约所有者' }}
            </div>
            <button @click="debugContractOwner" class="debug-btn" :disabled="loading">
              🔍 调试Owner地址
            </button>
          </div>
        </div>
      </div>

      <!-- 状态管理操作 -->
      <div class="action-card">
        <div class="card-header">
          <h3>状态管理</h3>
        </div>

        <div v-if="!isOwner" class="no-permission">
          <div class="warning-icon">⚠️</div>
          <p>只有合约所有者可以管理预售状态</p>
        </div>

        <div v-else class="action-buttons">
          <button 
            @click="startPresale" 
            class="action-btn start-btn"
            :disabled="loading || presaleStatus === 1"
          >
            <span class="btn-icon">🚀</span>
            开始预售
          </button>

          <button 
            @click="endPresale" 
            class="action-btn end-btn"
            :disabled="loading || presaleStatus !== 1"
          >
            <span class="btn-icon">🛑</span>
            结束预售
          </button>
        </div>

        <div class="action-hints">
          <p v-if="presaleStatus === 0" class="hint">
            💡 点击"开始预售"来启动代币预售
          </p>
          <p v-else-if="presaleStatus === 1" class="hint">
            💡 预售正在进行中，可以点击"结束预售"来停止
          </p>
          <p v-else class="hint">
            💡 预售已结束，用户可以解锁代币
          </p>
        </div>
      </div>

      <!-- 操作历史 -->
      <div class="history-card">
        <div class="card-header">
          <h3>操作历史</h3>
        </div>
        <div class="history-list">
          <div v-if="operationHistory.length === 0" class="no-history">
            暂无操作记录
          </div>
          <div 
            v-for="(operation, index) in operationHistory" 
            :key="index"
            class="history-item"
          >
            <div class="history-time">{{ operation.time }}</div>
            <div class="history-action">{{ operation.action }}</div>
            <div class="history-status" :class="operation.success ? 'success' : 'failed'">
              {{ operation.success ? '成功' : '失败' }}
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
  name: 'PresaleManager',
  data() {
    return {
      // 基本状态
      isWalletConnected: false,
      walletAddress: '',
      presaleAddress: '',

      // 地址输入相关
      inputAddress: '',
      addressError: '',
      recentAddresses: [],

      // 预售状态
      presaleStatus: 0,
      isOwner: false,

      // UI状态
      loading: false,
      loadingText: '',

      // 操作历史
      operationHistory: []
    }
  },

  computed: {
    statusText() {
      const statusMap = {
        0: '未开始',
        1: '进行中', 
        2: '已结束',
        3: '已结束',
        4: '已结束'
      }
      return statusMap[this.presaleStatus] || '未知状态'
    },

    statusClass() {
      return {
        'status-pending': this.presaleStatus === 0,
        'status-active': this.presaleStatus === 1,
        'status-ended': this.presaleStatus >= 2
      }
    }
  },

  async mounted() {
    await this.initializeManager()
  },

  methods: {
    // 初始化管理器
    async initializeManager() {
      try {
        // 从URL参数获取预售地址
        const urlParams = new URLSearchParams(window.location.search)
        this.presaleAddress = urlParams.get('presale')
        
        if (this.presaleAddress) {
          this.inputAddress = this.presaleAddress
        }

        // 加载最近使用的地址
        this.loadRecentAddresses()

        // 如果没有预售地址，让用户输入
        if (!this.presaleAddress) {
          return
        }

        // 检查钱包连接
        await this.checkWalletConnection()
        
        if (this.isWalletConnected) {
          await this.loadPresaleInfo()
        }
      } catch (error) {
        console.error('❌ 初始化预售管理器失败:', error)
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

        // 等待用户连接
        await new Promise(resolve => setTimeout(resolve, 1000))
        await this.checkWalletConnection()
        
        if (this.isWalletConnected) {
          await this.loadPresaleInfo()
        }
      } catch (error) {
        console.error('❌ 连接钱包失败:', error)
        alert('连接钱包失败: ' + error.message)
      }
    },

    // 加载预售信息
    async loadPresaleInfo() {
      try {
        this.loading = true
        this.loadingText = '加载预售信息...'

        console.log('🔄 开始加载预售信息:', {
          预售合约地址: this.presaleAddress,
          钱包地址: this.walletAddress,
          钱包连接状态: this.isWalletConnected
        })

        // 导入预售服务
        const { default: PresaleService } = await import('../services/PresaleService')
        const presaleService = new PresaleService(this.presaleAddress)

        // 获取预售状态
        console.log('📋 获取预售状态...')
        this.presaleStatus = await presaleService.getPresaleStatus()
        console.log('📋 预售状态:', this.presaleStatus)

        // 检查所有者权限
        console.log('🔍 开始权限检查...')
        this.isOwner = await presaleService.isOwner(this.walletAddress)
        console.log('🔍 权限检查结果:', this.isOwner)

        // 显示最终结果
        console.log('📊 预售信息加载完成:', {
          预售合约地址: this.presaleAddress,
          当前状态: this.presaleStatus,
          是否为所有者: this.isOwner,
          钱包地址: this.walletAddress
        })

        // 在页面上显示权限检查结果
        if (this.isOwner) {
          console.log('✅ 您是合约所有者，可以管理预售状态')
        } else {
          console.log('❌ 您不是合约所有者，无法管理预售状态')
        }

      } catch (error) {
        console.error('❌ 加载预售信息失败:', error)
        alert('加载预售信息失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    // 刷新状态
    async refreshStatus() {
      await this.loadPresaleInfo()
    },

    // 开始预售
    async startPresale() {
      if (!confirm('确定要开始预售吗？')) return

      try {
        this.loading = true
        this.loadingText = '开始预售中...'

        const { default: PresaleService } = await import('../services/PresaleService')
        const presaleService = new PresaleService(this.presaleAddress)

        const result = await presaleService.startPresale()
        
        // 记录操作
        this.addOperationHistory('开始预售', true)
        
        // 刷新状态
        await this.loadPresaleInfo()
        
        alert('预售已成功开始！')
      } catch (error) {
        console.error('❌ 开始预售失败:', error)
        this.addOperationHistory('开始预售', false)
        alert('开始预售失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    // 结束预售
    async endPresale() {
      if (!confirm('确定要结束预售吗？此操作不可撤销。')) return

      try {
        this.loading = true
        this.loadingText = '结束预售中...'

        const { default: PresaleService } = await import('../services/PresaleService')
        const presaleService = new PresaleService(this.presaleAddress)

        const result = await presaleService.endPresale()
        
        // 记录操作
        this.addOperationHistory('结束预售', true)
        
        // 刷新状态
        await this.loadPresaleInfo()
        
        alert('预售已成功结束！')
      } catch (error) {
        console.error('❌ 结束预售失败:', error)
        this.addOperationHistory('结束预售', false)
        alert('结束预售失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    // 添加操作历史
    addOperationHistory(action, success) {
      const operation = {
        time: new Date().toLocaleString(),
        action,
        success
      }
      this.operationHistory.unshift(operation)
      
      // 只保留最近10条记录
      if (this.operationHistory.length > 10) {
        this.operationHistory = this.operationHistory.slice(0, 10)
      }
    },

    // 格式化地址
    formatAddress(address) {
      if (!address) return ''
      return address.replace(/([\w]{6})[\w\W]+([\w]{4})$/, '$1...$2')
    },

    // ==================== 地址输入相关方法 ====================

    // 处理地址输入
    onAddressInput() {
      this.validateAddress()
    },

    // 验证地址格式
    validateAddress() {
      const address = this.inputAddress.trim()

      if (!address) {
        this.addressError = ''
        return
      }

      // TRON地址格式验证
      const tronAddressRegex = /^T[A-Za-z1-9]{33}$/
      if (!tronAddressRegex.test(address)) {
        this.addressError = '无效的TRON地址格式（应为T开头的34位地址）'
        return
      }

      this.addressError = ''
    },

    // 加载预售合约
    async loadPresaleContract() {
      if (!this.inputAddress || this.addressError) {
        return
      }

      try {
        this.loading = true
        this.loadingText = '验证合约地址...'

        // 设置预售地址
        this.presaleAddress = this.inputAddress.trim()

        // 保存到最近使用
        this.saveToRecentAddresses(this.presaleAddress)

        // 检查钱包连接
        await this.checkWalletConnection()

        if (this.isWalletConnected) {
          await this.loadPresaleInfo()
        }

        console.log('✅ 预售合约加载成功:', this.presaleAddress)
      } catch (error) {
        console.error('❌ 加载预售合约失败:', error)
        alert('加载预售合约失败: ' + error.message)
        this.presaleAddress = ''
      } finally {
        this.loading = false
      }
    },

    // 加载最近使用的地址
    loadRecentAddresses() {
      try {
        const recent = localStorage.getItem('recentPresaleAddresses')
        if (recent) {
          this.recentAddresses = JSON.parse(recent)
        }
      } catch (error) {
        console.error('❌ 加载最近地址失败:', error)
      }
    },

    // 保存到最近使用
    saveToRecentAddresses(address) {
      try {
        const recent = this.recentAddresses.filter(item => item.address !== address)
        recent.unshift({
          address,
          time: new Date().toLocaleString()
        })
        this.recentAddresses = recent.slice(0, 5) // 只保留最近5个
        localStorage.setItem('recentPresaleAddresses', JSON.stringify(this.recentAddresses))
      } catch (error) {
        console.error('❌ 保存最近地址失败:', error)
      }
    },

    // 选择最近使用的地址
    selectRecentAddress(addressItem) {
      this.inputAddress = addressItem.address
      this.validateAddress()
    },

    // 调试方法：直接查询合约owner
    async debugContractOwner() {
      try {
        console.log('🔍 开始调试合约owner...')

        if (!this.presaleAddress) {
          console.error('❌ 预售合约地址为空')
          return
        }

        // 导入预售服务
        const { default: PresaleService } = await import('../services/PresaleService')
        const presaleService = new PresaleService(this.presaleAddress)

        // 直接调用合约的owner方法
        console.log('📞 调用合约owner()方法...')
        const contractOwner = await presaleService.callMethod('owner')

        // 地址格式转换
        let ownerBase58 = contractOwner
        let walletBase58 = this.walletAddress

        // 如果owner是hex格式，转换为base58
        if (contractOwner && contractOwner.length === 42 && contractOwner.startsWith('41')) {
          try {
            ownerBase58 = window.tronWeb.address.fromHex(contractOwner)
            console.log('🔄 Owner地址转换:', {
              hex: contractOwner,
              base58: ownerBase58
            })
          } catch (error) {
            console.warn('⚠️ Owner地址转换失败:', error)
          }
        }

        console.log('📊 合约owner调试信息:', {
          预售合约地址: this.presaleAddress,
          合约Owner原始: contractOwner,
          合约Owner_base58: ownerBase58,
          当前钱包地址: this.walletAddress,
          TronWeb可用: !!window.tronWeb,
          TronWeb默认地址: window.tronWeb?.defaultAddress?.base58,
          地址匹配: ownerBase58 && walletBase58 ?
            ownerBase58.toLowerCase() === walletBase58.toLowerCase() : false
        })

        // 验证您提供的地址
        const yourAddress = 'TK57586sko7cTQxgNUGqpzMGWTwWBsr6iu'
        const yourAddressHex = window.tronWeb.address.toHex(yourAddress)

        console.log('🎯 地址验证:', {
          您的地址_base58: yourAddress,
          您的地址_hex: yourAddressHex,
          合约Owner_hex: contractOwner,
          hex地址匹配: yourAddressHex.toLowerCase() === contractOwner.toLowerCase(),
          base58地址匹配: yourAddress.toLowerCase() === ownerBase58.toLowerCase()
        })

        // 在页面上也显示这些信息
        const message = `
合约Owner (原始): ${contractOwner}
合约Owner (base58): ${ownerBase58}
当前钱包: ${this.walletAddress}
您的地址: ${yourAddress}
地址匹配: ${ownerBase58 && walletBase58 ? ownerBase58.toLowerCase() === walletBase58.toLowerCase() : false}
与您地址匹配: ${yourAddress.toLowerCase() === ownerBase58.toLowerCase()}
        `
        alert(message)

      } catch (error) {
        console.error('❌ 调试合约owner失败:', error)
        alert('调试失败: ' + error.message)
      }
    },

    // 复制地址
    async copyAddress(address) {
      try {
        await navigator.clipboard.writeText(address)
        alert('地址已复制到剪贴板')
      } catch (error) {
        console.error('复制失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.presale-manager {
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

/* 合约地址输入界面 */
.address-input-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.input-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 600px;
  width: 100%;
}

.input-card .card-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: none;
  padding-bottom: 0;
}

.input-card .card-header h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.input-card .card-header p {
  color: #666;
  margin: 0;
}

.address-input-form {
  margin-top: 30px;
}

.input-group {
  margin-bottom: 25px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.address-input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 16px;
  font-family: 'Courier New', monospace;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.address-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.address-input.error {
  border-color: #dc3545;
}

.error-text {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 5px;
}

.recent-addresses {
  margin: 30px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.recent-addresses h4 {
  margin: 0 0 15px 0;
  font-size: 1rem;
  color: #333;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.address-item:hover {
  background: #e9ecef;
}

.address-info {
  flex: 1;
}

.address-text {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.address-time {
  font-size: 0.8rem;
  color: #666;
}

.select-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-btn:hover {
  background: #5a67d8;
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.load-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.load-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.load-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
.info-card, .action-card, .history-card {
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

/* 信息网格 */
.info-grid {
  display: grid;
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 地址显示 */
.address-display {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: #e9ecef;
}

/* 状态显示 */
.status-display {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 600;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-pending .status-dot {
  background: #ffc107;
}

.status-active {
  background: #d1ecf1;
  color: #0c5460;
}

.status-active .status-dot {
  background: #17a2b8;
  animation: pulse 2s infinite;
}

.status-ended {
  background: #d4edda;
  color: #155724;
}

.status-ended .status-dot {
  background: #28a745;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 权限显示 */
.permission-display {
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 600;
  background: #f8d7da;
  color: #721c24;
}

.permission-display.has-permission {
  background: #d4edda;
  color: #155724;
}

/* 调试按钮 */
.debug-btn {
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.875rem;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s ease;
}

.debug-btn:hover:not(:disabled) {
  background: #138496;
}

.debug-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(40, 167, 69, 0.3);
}

.end-btn {
  background: linear-gradient(135deg, #dc3545, #e83e8c);
  color: white;
}

.end-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(220, 53, 69, 0.3);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-icon {
  font-size: 1.2rem;
}

/* 无权限提示 */
.no-permission {
  text-align: center;
  padding: 30px;
  color: #856404;
}

.warning-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

/* 操作提示 */
.action-hints {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
}

.hint {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* 操作历史 */
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

.history-action {
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
  .presale-manager {
    padding: 15px;
  }

  .title {
    font-size: 2rem;
  }

  .info-card, .action-card, .history-card {
    padding: 20px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .history-item {
    grid-template-columns: 1fr;
    gap: 8px;
    text-align: center;
  }
}
</style>
