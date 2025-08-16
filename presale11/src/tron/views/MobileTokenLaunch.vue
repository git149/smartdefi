<template>
  <div class="mobile-token-launch">
    <!-- 移动端代币创建器 -->
    <MobileTokenCreator
      @back="handleBack"
      @create-token="handleCreateToken"
    />
    
    <!-- 加载状态 -->
    <div v-if="isCreating" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Creating your token...</p>
      </div>
    </div>
    
    <!-- 成功提示 -->
    <div v-if="showSuccess" class="success-modal">
      <div class="success-content">
        <div class="success-icon">✓</div>
        <h3>Token Created Successfully!</h3>
        <p>Your token has been deployed to TRON network</p>
        <div class="token-info">
          <p><strong>Token:</strong> {{ createdToken.name }} ({{ createdToken.symbol }})</p>
          <p><strong>Contract:</strong> {{ createdToken.address }}</p>
        </div>
        <button @click="viewToken" class="view-token-btn">View Token</button>
      </div>
    </div>
  </div>
</template>

<script>
import MobileTokenCreator from '../components/MobileTokenCreator.vue'

export default {
  name: 'MobileTokenLaunch',
  
  components: {
    MobileTokenCreator
  },
  
  data() {
    return {
      isCreating: false,
      showSuccess: false,
      createdToken: null
    }
  },
  
  methods: {
    handleBack() {
      // 返回上一页或主页
      this.$router.go(-1)
    },
    
    async handleCreateToken(tokenData) {
      this.isCreating = true
      
      try {
        // 调用代币创建服务
        const result = await this.createTokenOnTron(tokenData)
        
        this.createdToken = {
          name: tokenData.token.name,
          symbol: tokenData.token.symbol,
          address: result.contractAddress
        }
        
        this.showSuccess = true
        
      } catch (error) {
        console.error('Token creation failed:', error)
        this.$toast.error('Failed to create token: ' + error.message)
        
      } finally {
        this.isCreating = false
      }
    },
    
    async createTokenOnTron(tokenData) {
      // 这里集成实际的 TRON 代币创建逻辑
      // 参考现有的 TokenCreator.vue 中的实现
      
      // 示例实现：
      const { token, lge, preset, logo } = tokenData
      
      // 1. 上传 logo 到 IPFS
      let logoUrl = null
      if (logo) {
        logoUrl = await this.uploadToIPFS(logo)
      }
      
      // 2. 准备合约参数
      const contractParams = {
        name: token.name,
        symbol: token.symbol,
        totalSupply: token.supply,
        description: token.description,
        logoUrl,
        website: token.website,
        telegram: token.telegram,
        twitter: token.twitter,
        buyTax: preset.buyTax,
        sellTax: preset.sellTax,
        tokenForLGE: lge.tokenForLGE
      }
      
      // 3. 部署合约
      const contractAddress = await this.deployContract(contractParams)
      
      return {
        contractAddress,
        transactionHash: 'mock-tx-hash'
      }
    },
    
    async uploadToIPFS(logoFile) {
      // IPFS 上传逻辑
      // 返回 IPFS URL
      return 'ipfs://mock-hash'
    },
    
    async deployContract(params) {
      // 合约部署逻辑
      // 返回合约地址
      return 'TRX1234567890ABCDEF'
    },
    
    viewToken() {
      // 跳转到代币详情页
      this.$router.push(`/token/${this.createdToken.address}`)
    }
  }
}
</script>

<style scoped>
.mobile-token-launch {
  position: relative;
  min-height: 100vh;
  background: #000000;
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  text-align: center;
  color: #ffffff;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333333;
  border-top: 3px solid #8B5CF6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 成功模态框 */
.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.success-content {
  background: #1a1a1a;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  color: #ffffff;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: #10B981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
  margin: 0 auto 20px;
}

.success-content h3 {
  font-size: 24px;
  margin: 0 0 12px;
  color: #ffffff;
}

.success-content p {
  color: #cccccc;
  margin: 0 0 20px;
  line-height: 1.5;
}

.token-info {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 16px;
  margin: 20px 0;
  text-align: left;
}

.token-info p {
  margin: 8px 0;
  font-size: 14px;
  word-break: break-all;
}

.token-info strong {
  color: #8B5CF6;
}

.view-token-btn {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.view-token-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
}
</style>
