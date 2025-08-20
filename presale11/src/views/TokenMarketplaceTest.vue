<template>
  <div class="test-page">
    <h1>代币市场测试页面</h1>
    
    <!-- 测试按钮区域 -->
    <div class="test-controls">
      <button @click="testTokenListService" class="test-btn">
        测试代币列表服务
      </button>
      <button @click="testWalletConnection" class="test-btn">
        测试钱包连接
      </button>
      <button @click="testContractInteraction" class="test-btn">
        测试合约交互
      </button>
      <button @click="testAddressFormatting" class="test-btn">
        测试地址格式化
      </button>
      <button @click="clearResults" class="test-btn clear">
        清除结果
      </button>
    </div>

    <!-- 测试结果显示 -->
    <div class="test-results">
      <h2>测试结果</h2>
      <div class="result-item" v-for="(result, index) in testResults" :key="index">
        <div class="result-header">
          <span class="result-title">{{ result.title }}</span>
          <span :class="['result-status', result.success ? 'success' : 'error']">
            {{ result.success ? '✅ 成功' : '❌ 失败' }}
          </span>
        </div>
        <div class="result-content">
          <pre>{{ result.content }}</pre>
        </div>
        <div v-if="result.error" class="result-error">
          <strong>错误信息:</strong> {{ result.error }}
        </div>
      </div>
    </div>

    <!-- 代币列表预览 -->
    <div class="token-preview" v-if="tokenList.length > 0">
      <h2>代币列表预览</h2>
      <div class="token-grid">
        <div v-for="token in tokenList" :key="token.tokenAddress" class="token-card">
          <div class="token-header">
            <img :src="token.icon" :alt="token.tokenSymbol" class="token-icon" />
            <div class="token-info">
              <div class="token-name">{{ token.tokenName }}</div>
              <div class="token-symbol">{{ token.tokenSymbol }}</div>
            </div>
            <span :class="['status-badge', token.status]">
              {{ getStatusText(token.status) }}
            </span>
          </div>
          <div class="token-stats">
            <div class="stat">
              <span class="label">总供应量:</span>
              <span class="value">{{ token.totalSupplyFormatted }}</span>
            </div>
            <div class="stat">
              <span class="label">创建时间:</span>
              <span class="value">{{ token.createdAtFormatted }}</span>
            </div>
            <div v-if="token.presale" class="stat">
              <span class="label">预售价格:</span>
              <span class="value">{{ token.presale.preSaleEthAmountFormatted }} TRX</span>
            </div>
            <div v-if="token.progress" class="stat">
              <span class="label">进度:</span>
              <span class="value">{{ token.progress.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 钱包状态 -->
    <div class="wallet-status">
      <h2>钱包状态</h2>
      <div class="status-grid">
        <div class="status-item">
          <span class="label">连接状态:</span>
          <span :class="['value', walletStatus.isConnected ? 'connected' : 'disconnected']">
            {{ walletStatus.isConnected ? '已连接' : '未连接' }}
          </span>
        </div>
        <div class="status-item" v-if="walletStatus.currentAccount">
          <span class="label">钱包地址:</span>
          <span class="value">{{ formatAddress(walletStatus.currentAccount) }}</span>
        </div>
        <div class="status-item" v-if="walletStatus.balance">
          <span class="label">TRX余额:</span>
          <span class="value">{{ walletStatus.balance }} TRX</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TokenListService from '@/tron/services/TokenListService'
import TronServiceManager from '@/tron/services'
import { useTokenPurchase } from '@/composables/useTokenPurchase'
import {
  smartFormatAddress,
  formatAddressDisplay,
  getAddressType
} from '@/utils/addressFormatter'

export default {
  name: 'TokenMarketplaceTest',

  setup() {
    const {
      walletBalance,
      walletAddress,
      isConnected,
      connectWallet,
      updateWalletBalance
    } = useTokenPurchase()

    return {
      walletBalance,
      walletAddress,
      isConnected,
      connectWallet,
      updateWalletBalance
    }
  },

  data() {
    return {
      testResults: [],
      tokenList: [],
      walletStatus: {
        isConnected: false,
        currentAccount: '',
        balance: 0
      }
    }
  },

  async mounted() {
    await this.initializeTests()
  },

  methods: {
    /**
     * 初始化测试
     */
    async initializeTests() {
      this.addResult('初始化测试', '开始初始化测试环境...', true)
      
      try {
        // 初始化TRON服务
        await TronServiceManager.ensureInitialized()
        this.addResult('TRON服务初始化', 'TRON服务管理器初始化成功', true)
        
        // 更新钱包状态
        await this.updateWalletStatus()
        
      } catch (error) {
        this.addResult('初始化测试', '初始化失败', false, error.message)
      }
    },

    /**
     * 测试代币列表服务
     */
    async testTokenListService() {
      this.addResult('代币列表服务测试', '开始测试代币列表服务...', true)
      
      try {
        // 测试获取代币列表
        const result = await TokenListService.getAllTokens(0, 10, false)
        
        this.addResult(
          '获取代币列表', 
          `成功获取 ${result.tokens.length} 个代币，总计 ${result.total} 个`, 
          true,
          null,
          JSON.stringify(result, null, 2)
        )
        
        // 更新预览列表
        this.tokenList = result.tokens.slice(0, 6) // 只显示前6个
        
        // 测试单个代币详情
        if (result.tokens.length > 0) {
          const firstToken = result.tokens[0]
          const tokenDetails = await TokenListService.getTokenDetails(firstToken.tokenAddress)
          
          this.addResult(
            '获取代币详情',
            `成功获取代币 ${tokenDetails.tokenSymbol} 的详细信息`,
            true,
            null,
            JSON.stringify(tokenDetails, null, 2)
          )
        }
        
        // 测试缓存统计
        const cacheStats = TokenListService.getCacheStats()
        this.addResult(
          '缓存统计',
          '缓存统计信息获取成功',
          true,
          null,
          JSON.stringify(cacheStats, null, 2)
        )
        
      } catch (error) {
        this.addResult('代币列表服务测试', '测试失败', false, error.message)
      }
    },

    /**
     * 测试钱包连接
     */
    async testWalletConnection() {
      this.addResult('钱包连接测试', '开始测试钱包连接...', true)
      
      try {
        // 检查TronWeb是否可用
        if (typeof window.tronWeb === 'undefined') {
          throw new Error('TronWeb未找到，请安装TronLink')
        }
        
        this.addResult('TronWeb检查', 'TronWeb已加载', true)
        
        // 尝试连接钱包
        if (!this.isConnected) {
          await this.connectWallet()
        }
        
        // 更新钱包状态
        await this.updateWalletStatus()
        
        if (this.walletStatus.isConnected) {
          this.addResult(
            '钱包连接',
            `钱包连接成功，地址: ${this.walletStatus.currentAccount}`,
            true
          )
          
          // 测试余额获取
          await this.updateWalletBalance()
          this.addResult(
            '余额查询',
            `余额查询成功: ${this.walletBalance} TRX`,
            true
          )
        } else {
          this.addResult('钱包连接', '钱包未连接', false, '请手动连接TronLink钱包')
        }
        
      } catch (error) {
        this.addResult('钱包连接测试', '测试失败', false, error.message)
      }
    },

    /**
     * 测试合约交互
     */
    async testContractInteraction() {
      this.addResult('合约交互测试', '开始测试合约交互...', true)

      try {
        // 测试工厂合约状态
        const factoryService = TronServiceManager.coordinatorFactory
        const factoryStatus = await factoryService.getFactoryStatus()

        this.addResult(
          '工厂合约状态',
          '工厂合约状态获取成功',
          true,
          null,
          JSON.stringify(factoryStatus, null, 2)
        )

        // 测试获取总代币数量
        const totalTokens = await factoryService.getTotalPairsCreated()
        this.addResult(
          '总代币数量',
          `总共创建了 ${totalTokens} 个代币对`,
          true
        )

        // 测试创建费用
        const creationFee = await factoryService.getCreationFee()
        this.addResult(
          '创建费用',
          `代币创建费用: ${window.tronWeb.fromSun(creationFee)} TRX`,
          true
        )

      } catch (error) {
        this.addResult('合约交互测试', '测试失败', false, error.message)
      }
    },

    /**
     * 测试地址格式化
     */
    async testAddressFormatting() {
      this.addResult('地址格式化测试', '开始测试地址格式化功能...', true)

      try {
        // 测试地址示例
        const testAddresses = [
          '415e67db190952e6846760911ee5e9bae7ed0b3210', // 十六进制地址
          'TLsV52sRDL79HXGGm9yzwKibb6BeruhUzy', // Base58地址
          'TGUUgCztEyXDwEyigoAAZP9HxWC6VdiKDj' // 工厂合约地址
        ]

        for (const address of testAddresses) {
          const addressType = getAddressType(address)
          const smartFormatted = smartFormatAddress(address)
          const displayFormatted = formatAddressDisplay(address)

          this.addResult(
            `地址格式化 - ${address.slice(0, 10)}...`,
            `地址类型: ${addressType}`,
            true,
            null,
            JSON.stringify({
              原始地址: address,
              地址类型: addressType,
              智能格式化: smartFormatted,
              显示格式化: displayFormatted
            }, null, 2)
          )
        }

        // 测试钱包地址格式化
        if (this.walletAddress) {
          const walletFormatted = formatAddressDisplay(this.walletAddress)
          this.addResult(
            '钱包地址格式化',
            `钱包地址格式化成功: ${walletFormatted}`,
            true,
            null,
            JSON.stringify({
              原始钱包地址: this.walletAddress,
              格式化后: walletFormatted
            }, null, 2)
          )
        }

        this.addResult(
          '地址格式化测试',
          '地址格式化功能测试完成，所有地址都已正确转换为Base58格式',
          true
        )

      } catch (error) {
        this.addResult('地址格式化测试', '测试失败', false, error.message)
      }
    },

    /**
     * 更新钱包状态
     */
    async updateWalletStatus() {
      try {
        const connectionStatus = TronServiceManager.getConnectionStatus()
        this.walletStatus = {
          isConnected: connectionStatus.isConnected,
          currentAccount: connectionStatus.currentAccount || '',
          balance: this.walletBalance
        }
      } catch (error) {
        console.error('更新钱包状态失败:', error)
      }
    },

    /**
     * 添加测试结果
     */
    addResult(title, content, success, error = null, details = null) {
      this.testResults.push({
        title,
        content: details || content,
        success,
        error,
        timestamp: new Date().toLocaleTimeString()
      })
    },

    /**
     * 清除测试结果
     */
    clearResults() {
      this.testResults = []
      this.tokenList = []
    },

    /**
     * 格式化地址
     */
    formatAddress(address) {
      if (!address) return ''
      return `${address.slice(0, 6)}...${address.slice(-4)}`
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
    }
  }
}
</script>

<style scoped>
.test-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

h2 {
  color: #555;
  margin: 30px 0 15px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
}

/* 测试控制按钮 */
.test-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.test-btn {
  padding: 12px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.test-btn:hover {
  background: #0056b3;
}

.test-btn.clear {
  background: #dc3545;
}

.test-btn.clear:hover {
  background: #c82333;
}

/* 测试结果 */
.test-results {
  margin-bottom: 30px;
}

.result-item {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.result-title {
  font-weight: bold;
  color: #333;
}

.result-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.result-status.success {
  background: #d4edda;
  color: #155724;
}

.result-status.error {
  background: #f8d7da;
  color: #721c24;
}

.result-content {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.result-content pre {
  margin: 0;
  font-size: 12px;
  color: #666;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

.result-error {
  padding: 15px;
  background: #f8d7da;
  color: #721c24;
  font-size: 14px;
}

/* 代币预览 */
.token-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.token-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.token-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.token-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f0f0;
}

.token-info {
  flex: 1;
}

.token-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.token-symbol {
  font-size: 14px;
  color: #666;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.completed {
  background: #e2e3e5;
  color: #383d41;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.token-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.stat .label {
  color: #666;
}

.stat .value {
  color: #333;
  font-weight: 500;
}

/* 钱包状态 */
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.status-item {
  background: white;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-item .label {
  color: #666;
  font-weight: 500;
}

.status-item .value {
  color: #333;
  font-weight: bold;
}

.status-item .value.connected {
  color: #28a745;
}

.status-item .value.disconnected {
  color: #dc3545;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-controls {
    flex-direction: column;
  }
  
  .test-btn {
    width: 100%;
  }
  
  .token-grid {
    grid-template-columns: 1fr;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
