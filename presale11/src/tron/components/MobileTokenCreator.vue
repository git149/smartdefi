<template>
  <div class="mobile-token-creator">
    <!-- 顶部导航 -->
    <div class="mobile-header">
      <button class="back-btn" @click="$emit('back')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="app-name">RWAunion</span>
    </div>

    <!-- 主标题 -->
    <div class="main-title">
      <h1>Launch your token<br>on RWAunion</h1>
    </div>

    <!-- 步骤指示器 -->
    <div class="step-indicator">
      <div class="step-dots">
        <div 
          v-for="step in totalSteps" 
          :key="step"
          class="step-dot"
          :class="{ active: step <= currentStep }"
        ></div>
      </div>
      <div class="step-labels">
        <span :class="{ active: currentStep === 1 }">Token details</span>
        <span :class="{ active: currentStep === 2 }">LGE information</span>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-container">
      <!-- 第一步：Token Details -->
      <div v-if="currentStep === 1" class="step-content">
        <!-- Logo 上传 -->
        <div class="form-group">
          <label class="form-label">* Logo</label>
          <div class="logo-upload" @click="triggerFileInput">
            <input 
              ref="logoInput" 
              type="file" 
              accept="image/*" 
              @change="handleLogoUpload"
              style="display: none;"
            >
            <div v-if="!logoPreview" class="logo-placeholder">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="8" y="12" width="24" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                <circle cx="14" cy="18" r="2" stroke="currentColor" stroke-width="2"/>
                <path d="M32 24L26 18L20 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div class="upload-text">
                <div>JPEG/PNG/WEBP/GIF</div>
                <div class="upload-hint">Less Than 4MB</div>
              </div>
            </div>
            <div v-else class="logo-preview">
              <img :src="logoPreview" alt="Logo" />
            </div>
          </div>
        </div>

        <!-- Token Name -->
        <div class="form-group">
          <label class="form-label">
            * Token Name
            <span class="char-count">{{ tokenForm.name.length }}/20</span>
          </label>
          <input 
            v-model="tokenForm.name"
            type="text" 
            placeholder="Token name"
            maxlength="20"
            class="form-input"
          >
        </div>

        <!-- Token Symbol -->
        <div class="form-group">
          <label class="form-label">
            * Token Symbol($Ticker)
            <span class="char-count">{{ tokenForm.symbol.length }}/10</span>
          </label>
          <input 
            v-model="tokenForm.symbol"
            type="text" 
            placeholder="Token Symbol"
            maxlength="10"
            class="form-input"
          >
        </div>

        <!-- Supply -->
        <div class="form-group">
          <label class="form-label">* Supply</label>
          <input 
            v-model="tokenForm.supply"
            type="text" 
            placeholder="Ex.210000000"
            class="form-input"
          >
        </div>

        <!-- Tokenomic Preset -->
        <div class="form-group">
          <label class="form-label">* Choose Tokenomic preset</label>
          <div class="preset-selector" @click="togglePresetDropdown">
            <div class="preset-display">
              <div v-if="selectedPreset" class="preset-info">
                <span class="preset-name">{{ selectedPreset.name }}</span>
                <span class="preset-tax">{{ selectedPreset.buyTax }}% / {{ selectedPreset.sellTax }}%</span>
              </div>
              <span v-else class="preset-placeholder">Choose preset</span>
              <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
          </div>
          
          <!-- Preset Dropdown -->
          <div v-if="showPresetDropdown" class="preset-dropdown">
            <div 
              v-for="preset in presets" 
              :key="preset.id"
              class="preset-option"
              @click="selectPreset(preset)"
            >
              <div class="preset-content">
                <span class="preset-category">{{ preset.name }}</span>
                <span class="preset-description">{{ preset.description }}</span>
                <span class="preset-rates">{{ preset.buyTax }}% / {{ preset.sellTax }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Token Description -->
        <div class="form-group">
          <label class="form-label">
            * Token Description
            <span class="char-count">{{ tokenForm.description.length }}/256</span>
          </label>
          <textarea 
            v-model="tokenForm.description"
            placeholder="Token Description"
            maxlength="256"
            rows="4"
            class="form-textarea"
          ></textarea>
        </div>

        <!-- Website -->
        <div class="form-group">
          <label class="form-label">Website</label>
          <input 
            v-model="tokenForm.website"
            type="url" 
            placeholder="Optional"
            class="form-input"
          >
        </div>

        <!-- Telegram -->
        <div class="form-group">
          <label class="form-label">Telegram</label>
          <input 
            v-model="tokenForm.telegram"
            type="text" 
            placeholder="Optional"
            class="form-input"
          >
        </div>

        <!-- Twitter -->
        <div class="form-group">
          <label class="form-label">Twitter</label>
          <input 
            v-model="tokenForm.twitter"
            type="text" 
            placeholder="Optional"
            class="form-input"
          >
        </div>

        <!-- Backing Asset -->
        <div class="backing-asset">
          <span class="backing-label">Backing asset</span>
          <div class="asset-chip">
            <span class="trx-icon">TRX</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 9L10.5 4.5L15 9" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 第二步：LGE Information -->
      <div v-if="currentStep === 2" class="step-content">
        <!-- LGE 表单字段将在这里添加 -->
        <div class="form-group">
          <label class="form-label">* Token for LGE (%)</label>
          <input 
            v-model="lgeForm.tokenForLGE"
            type="number" 
            placeholder="0.00"
            class="form-input"
          >
        </div>
        
        <!-- 更多 LGE 字段... -->
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-actions">
      <button 
        v-if="currentStep === 1"
        class="action-btn primary"
        :disabled="!isStep1Valid"
        @click="nextStep"
      >
        Next
      </button>
      
      <button 
        v-if="currentStep === 2"
        class="action-btn primary"
        :disabled="!isStep2Valid"
        @click="createToken"
      >
        Create token
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MobileTokenCreator',
  
  data() {
    return {
      currentStep: 1,
      totalSteps: 2,
      logoPreview: null,
      showPresetDropdown: false,
      
      tokenForm: {
        name: '',
        symbol: '',
        supply: '',
        description: '',
        website: '',
        telegram: '',
        twitter: ''
      },
      
      lgeForm: {
        tokenForLGE: ''
      },
      
      selectedPreset: null,
      
      presets: [
        {
          id: 'meme',
          name: 'Meme Category',
          description: 'Memes Tax',
          buyTax: 0.5,
          sellTax: 0.5
        },
        // 更多预设...
      ]
    }
  },
  
  computed: {
    isStep1Valid() {
      return this.tokenForm.name && 
             this.tokenForm.symbol && 
             this.tokenForm.supply && 
             this.tokenForm.description &&
             this.selectedPreset
    },
    
    isStep2Valid() {
      return this.lgeForm.tokenForLGE
    }
  },
  
  methods: {
    triggerFileInput() {
      this.$refs.logoInput.click()
    },
    
    handleLogoUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.logoPreview = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    
    togglePresetDropdown() {
      this.showPresetDropdown = !this.showPresetDropdown
    },
    
    selectPreset(preset) {
      this.selectedPreset = preset
      this.showPresetDropdown = false
    },
    
    nextStep() {
      if (this.isStep1Valid) {
        this.currentStep = 2
      }
    },
    
    createToken() {
      if (this.isStep2Valid) {
        // 创建代币逻辑
        this.$emit('create-token', {
          token: this.tokenForm,
          lge: this.lgeForm,
          preset: this.selectedPreset,
          logo: this.logoPreview
        })
      }
    }
  }
}
</script>

<style scoped>
.mobile-token-creator {
  min-height: 100vh;
  background: #000000;
  color: #ffffff;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部导航 */
.mobile-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: #000000;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  color: #ffffff;
  padding: 8px;
  margin-right: 12px;
  cursor: pointer;
}

.app-name {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

/* 主标题 */
.main-title {
  padding: 20px 20px 30px;
  text-align: center;
}

.main-title h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
}

.main-title h1 br {
  display: block;
}

/* 步骤指示器 */
.step-indicator {
  padding: 0 20px 30px;
}

.step-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #333333;
  transition: background-color 0.3s ease;
}

.step-dot.active {
  background: #8B5CF6;
}

.step-labels {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666666;
}

.step-labels span.active {
  color: #ffffff;
  font-weight: 500;
}

/* 表单容器 */
.form-container {
  padding: 0 20px;
  flex: 1;
}

.step-content {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 表单组件 */
.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 8px;
}

.char-count {
  font-size: 14px;
  color: #666666;
  font-weight: 400;
}

.form-input,
.form-textarea {
  width: 100%;
  background: #1a1a1a;
  border: 1px solid #333333;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  color: #ffffff;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #8B5CF6;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #666666;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Logo 上传 */
.logo-upload {
  width: 100%;
  height: 120px;
  background: #1a1a1a;
  border: 2px dashed #333333;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.logo-upload:hover {
  border-color: #8B5CF6;
}

.logo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #666666;
}

.upload-text {
  text-align: center;
  font-size: 14px;
}

.upload-hint {
  font-size: 12px;
  color: #888888;
}

.logo-preview {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 预设选择器 */
.preset-selector {
  position: relative;
}

.preset-display {
  background: #1a1a1a;
  border: 1px solid #333333;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.preset-display:hover {
  border-color: #8B5CF6;
}

.preset-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preset-name {
  font-size: 16px;
  color: #ffffff;
}

.preset-tax {
  font-size: 14px;
  color: #8B5CF6;
}

.preset-placeholder {
  color: #666666;
}

.dropdown-arrow {
  color: #666666;
  transition: transform 0.3s ease;
}

.preset-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #1a1a1a;
  border: 1px solid #333333;
  border-radius: 12px;
  margin-top: 4px;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.preset-option {
  padding: 16px;
  border-bottom: 1px solid #333333;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.preset-option:last-child {
  border-bottom: none;
}

.preset-option:hover {
  background: #2a2a2a;
}

.preset-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preset-category {
  font-size: 16px;
  color: #ffffff;
  font-weight: 500;
}

.preset-description {
  font-size: 14px;
  color: #666666;
}

.preset-rates {
  font-size: 14px;
  color: #8B5CF6;
}

/* Backing Asset */
.backing-asset {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #333333;
  margin-top: 20px;
}

.backing-label {
  font-size: 16px;
  color: #ffffff;
}

.asset-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1a1a1a;
  border: 1px solid #333333;
  border-radius: 8px;
  padding: 8px 12px;
}

.trx-icon {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

/* 底部按钮 */
.bottom-actions {
  padding: 20px;
  background: #000000;
  position: sticky;
  bottom: 0;
}

.action-btn {
  width: 100%;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
}

.action-btn:disabled {
  background: #333333;
  color: #666666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .main-title h1 {
    font-size: 24px;
  }

  .form-container {
    padding: 0 16px;
  }

  .mobile-header {
    padding: 12px 16px;
  }

  .bottom-actions {
    padding: 16px;
  }
}

/* 安全区域适配 */
@supports (padding: max(0px)) {
  .mobile-header {
    padding-top: max(12px, env(safe-area-inset-top));
  }

  .bottom-actions {
    padding-bottom: max(20px, env(safe-area-inset-bottom));
  }
}
</style>
