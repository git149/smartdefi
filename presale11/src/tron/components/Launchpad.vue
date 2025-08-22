<template>
  <div class="launchpad">
    <!-- 标题 - 精确匹配参考图 -->
    <div class="launchpad-title">
      <h2>Launchpad</h2>
    </div>
    
    <!-- 项目卡片 -->
    <div class="project-card">
      <!-- 项目图片区域 -->
      <div class="project-image-section">
        <div class="project-image">
          <!-- 项目图片 -->
          <img src="@/assets/image.png" alt="Project Image" class="project-main-image" />
        </div>
        
        <!-- 涨幅标签 - 精确匹配参考图 -->
        <div class="gain-tag">
          <span class="gain-percentage">+208.81%</span>
          <span class="gain-arrow">↑</span>
        </div>

        <!-- 火焰图标 - 精确匹配参考图 -->
        <div class="flame-icon">
          <div class="flame">🔥</div>
          <span class="flame-number">5</span>
        </div>
      </div>
      
      <!-- 项目信息区域 -->
      <div class="project-info">
        <!-- 代币名称 -->
        <div class="currency-name">
          Currency Name: <span class="token-symbol">CHOU</span>
        </div>
        
        <!-- 项目描述 -->
        <div class="project-description">
          PEPE visits all northern countries and regions in 2025 - Alaska, Canada, Greenland, Iceland, Norway, Sweden, Finland and Siberia. He is not scare from the cold and polar bears. PEPE enjoys the beautiful north nature and the northern lights.
        </div>
        
        <!-- 社交媒体按钮 - 精确匹配参考图 -->
        <div class="social-buttons">
          <button class="social-btn share-btn" @click="handleTelegramClick" aria-label="Share">
            <div class="social-icon">📤</div>
          </button>
          <button class="social-btn close-btn" @click="handleTwitterClick" aria-label="Close">
            <div class="social-icon">✕</div>
          </button>
        </div>
        
        <!-- 市值信息 - 精确匹配参考图 -->
        <div class="market-cap-info">
          <div class="market-cap-text">
            Market Cap: <span class="market-cap-amount">3000 TRX</span>
            <span class="market-cap-percentage">(30.87%)</span>
          </div>
          <!-- 进度条 - 280px长度，4px高度 -->
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: '30.87%' }"></div>
          </div>
        </div>
        
        <!-- 合约地址 - 精确匹配参考图 -->
        <div class="contract-address">
          <span class="ca-label">CA:</span>
          <span class="ca-address">0xbDd4A37C18327652BbbF6d9088A2f3969e4d6e1</span>
        </div>
        
        <!-- 购买按钮 -->
        <button class="buy-now-btn" @click="handleBuyNow">
          BUY NOW
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Launchpad',
  data() {
    return {
      marketCapPercentage: 30.87,
      contractAddress: '0xbDd4A37C18327652BobF6d90888A2f3969e4d6e1'
    }
  },
  methods: {
    handleTelegramClick() {
      this.$emit('telegram-click')
      console.log('Telegram button clicked')
    },
    
    handleTwitterClick() {
      this.$emit('twitter-click')
      console.log('Twitter button clicked')
    },
    
    handleBuyNow() {
      this.$emit('buy-now-click')
      console.log('Buy Now button clicked')
    },
    
    copyAddress() {
      navigator.clipboard.writeText(this.contractAddress).then(() => {
        // 可以添加复制成功的提示
        console.log('Contract address copied to clipboard')
        this.$emit('address-copied', this.contractAddress)
      }).catch(err => {
        console.error('Failed to copy address:', err)
      })
    }
  }
}
</script>

<style scoped>
.launchpad {
  padding: 20px;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  min-height: 600px;
}

/* 标题 - 精确匹配参考图 */
.launchpad-title {
  text-align: center;
  margin-bottom: 16px; /* 底部16px留白 */
}

.launchpad-title h2 {
  color: #ffffff;
  font-size: 24px; /* 24px字号 */
  font-weight: 700; /* 粗体 */
  margin: 0;
}

/* 项目卡片 - 调整高度以显示完整内容 */
.project-card {
  width: 343px;
  min-height: 500px; /* 改为最小高度，确保内容完整显示 */
  background: linear-gradient(135deg, #2d1b69 0%, #1a0f3a 100%);
  border-radius: 16px;
  overflow: visible; /* 改为visible，避免内容被裁剪 */
  border: 2px solid #ff8c00; /* 橙色边框 */
  box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 20px rgba(255,140,0,0.3);
  margin: 0 auto;
  display: flex;
  flex-direction: column; /* 使用flex布局确保内容正确排列 */
}

/* 项目图片区域 - 300px×180px */
.project-image-section {
  position: relative;
  width: 300px;
  height: 180px;
  margin: 0 auto;
  background: linear-gradient(180deg, #1a0f3a 0%, #2d1b69 100%);
  overflow: hidden;
}

.project-image {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-main-image {
  width: 300px;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
}







/* 涨幅标签 - 绿色标签配向上箭头 */
.gain-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #00ff88;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 2px;
}

.gain-percentage {
  font-size: 12px;
}

.gain-arrow {
  color: #ffffff;
  font-size: 12px;
}

/* 火焰图标 - 右侧火焰图标带数字"5" */
.flame-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 4;
}

.flame {
  font-size: 16px;
}

.flame-number {
  color: #ff8c00;
  font-weight: 700;
  font-size: 14px;
}

/* 项目信息区域 */
.project-info {
  padding: 24px;
  flex: 1; /* 占据剩余空间 */
  display: flex;
  flex-direction: column;
  gap: 16px; /* 统一元素间距 */
}

/* 代币名称 */
.currency-name {
  color: #ffffff;
  font-size: 16px;
}

.token-symbol {
  color: #00d4ff;
  font-weight: 700;
}

/* 项目描述 */
.project-description {
  color: #e0e0e0;
  font-size: 14px;
  line-height: 1.6;
  text-align: justify;
}

/* 社交媒体按钮 - 分享和关闭图标，白色圆形按钮24px×24px */
.social-buttons {
  display: flex;
  gap: 12px;
}

.social-btn {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.social-icon {
  font-size: 12px;
  color: #333333;
}

/* 市值信息 - margin由父容器的gap控制 */

.market-cap-text {
  color: #ffffff;
  font-size: 14px;
  margin-bottom: 8px;
}

.market-cap-amount {
  color: #00d4ff;
  font-weight: 700;
}

.market-cap-percentage {
  color: #ff8c00;
  font-weight: 600;
}

/* 进度条 - 280px长度，4px高度，紫色填充 */
.progress-bar {
  position: relative;
  width: 280px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: #8a2be2; /* 紫色填充 */
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 合约地址 - 灰色10px文字 */
.contract-address {
  font-family: 'Courier New', monospace;
}

.ca-label {
  color: #888888;
  font-size: 10px;
  font-weight: 600;
  margin-right: 4px;
}

.ca-address {
  color: #888888;
  font-size: 10px;
  word-break: break-all;
}

/* 购买按钮 - 310px×44px，圆角22px，蓝紫渐变背景，白色文字16px粗体 */
.buy-now-btn {
  width: 310px;
  height: 44px;
  background: linear-gradient(135deg, #8a2be2, #00d4ff);
  border: none;
  border-radius: 22px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 16px rgba(138, 43, 226, 0.4);
  margin: 0 auto;
  display: block;
}

.buy-now-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(138, 43, 226, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .launchpad {
    padding: 16px;
  }
  
  .launchpad-title h2 {
    font-size: 24px;
  }
  
  .project-info {
    padding: 20px;
  }
  
  .project-image-section {
    height: 180px;
  }
  

  
  .gain-tag {
    font-size: 12px;
    padding: 4px 10px;
  }
  
  .flame-icon {
    font-size: 14px;
  }
  
  .flame-number {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .launchpad {
    padding: 12px;
  }
  
  .launchpad-title h2 {
    font-size: 20px;
  }
  
  .project-info {
    padding: 16px;
  }
  
  .project-image-section {
    height: 160px;
  }
  

  
  .gain-tag {
    font-size: 11px;
    padding: 3px 8px;
  }
  
  .flame-icon {
    font-size: 12px;
  }
  
  .flame-number {
    font-size: 11px;
  }
  
  .currency-name {
    font-size: 14px;
  }
  
  .project-description {
    font-size: 13px;
  }
  
  .buy-now-btn {
    font-size: 16px;
    padding: 14px;
  }
}
</style>
