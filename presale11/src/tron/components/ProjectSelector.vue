<template>
  <div class="project-selector">
    <!-- 页面标题 -->
    <div class="header">
      <h1 class="title">项目选择</h1>
      <p class="subtitle">选择或输入项目合约地址</p>
    </div>

    <!-- 默认项目选项 -->
    <div class="default-project-card">
      <div class="card-header">
        <h3>🚀 默认项目</h3>
      </div>
      
      <div class="project-info">
        <div class="info-row">
          <span class="label">项目名称:</span>
          <span class="value">{{ defaultProject.PROJECT_NAME }}</span>
        </div>
        <div class="info-row">
          <span class="label">代币符号:</span>
          <span class="value">{{ defaultProject.PROJECT_SYMBOL }}</span>
        </div>
        <div class="info-row">
          <span class="label">代币地址:</span>
          <span class="value address">{{ formatAddress(defaultProject.TOKEN_ADDRESS) }}</span>
        </div>
        <div class="info-row">
          <span class="label">预售地址:</span>
          <span class="value address">{{ formatAddress(defaultProject.PRESALE_ADDRESS) }}</span>
        </div>
      </div>

      <button @click="useDefaultProject" class="use-project-btn default">
        使用默认项目
      </button>
    </div>

    <!-- 自定义项目输入 -->
    <div class="custom-project-card">
      <div class="card-header">
        <h3>⚙️ 自定义项目</h3>
      </div>

      <div class="input-form">
        <div class="input-group">
          <label>项目名称</label>
          <input 
            v-model="customProject.name" 
            type="text" 
            placeholder="输入项目名称"
            class="form-input"
          />
        </div>

        <div class="input-group">
          <label>代币符号</label>
          <input 
            v-model="customProject.symbol" 
            type="text" 
            placeholder="输入代币符号"
            class="form-input"
          />
        </div>

        <div class="input-group">
          <label>代币合约地址</label>
          <input 
            v-model="customProject.tokenAddress" 
            type="text" 
            placeholder="输入代币合约地址 (T开头的34位地址)"
            class="form-input"
            :class="{ 'error': tokenAddressError }"
          />
          <div v-if="tokenAddressError" class="error-text">{{ tokenAddressError }}</div>
        </div>

        <div class="input-group">
          <label>预售合约地址</label>
          <input 
            v-model="customProject.presaleAddress" 
            type="text" 
            placeholder="输入预售合约地址 (T开头的34位地址)"
            class="form-input"
            :class="{ 'error': presaleAddressError }"
          />
          <div v-if="presaleAddressError" class="error-text">{{ presaleAddressError }}</div>
        </div>
      </div>

      <button 
        @click="useCustomProject" 
        class="use-project-btn custom"
        :disabled="!isCustomProjectValid"
      >
        使用自定义项目
      </button>
    </div>

    <!-- 最近使用的项目 -->
    <div v-if="recentProjects.length > 0" class="recent-projects-card">
      <div class="card-header">
        <h3>📋 最近使用</h3>
      </div>

      <div class="recent-list">
        <div 
          v-for="(project, index) in recentProjects" 
          :key="index"
          class="recent-item"
          @click="useRecentProject(project)"
        >
          <div class="recent-info">
            <div class="recent-name">{{ project.name }}</div>
            <div class="recent-symbol">{{ project.symbol }}</div>
          </div>
          <div class="recent-addresses">
            <div class="recent-address">{{ formatAddress(project.tokenAddress) }}</div>
            <div class="recent-address">{{ formatAddress(project.presaleAddress) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectSelector',
  data() {
    return {
      defaultProject: {},
      customProject: {
        name: '',
        symbol: '',
        tokenAddress: '',
        presaleAddress: ''
      },
      recentProjects: [],
      tokenAddressError: '',
      presaleAddressError: ''
    }
  },

  computed: {
    isCustomProjectValid() {
      return this.customProject.name && 
             this.customProject.symbol && 
             this.customProject.tokenAddress && 
             this.customProject.presaleAddress &&
             !this.tokenAddressError &&
             !this.presaleAddressError
    }
  },

  watch: {
    'customProject.tokenAddress'(newValue) {
      this.validateTronAddress(newValue, 'token')
    },
    'customProject.presaleAddress'(newValue) {
      this.validateTronAddress(newValue, 'presale')
    }
  },

  async mounted() {
    await this.loadDefaultProject()
    this.loadRecentProjects()
  },

  methods: {
    // 加载默认项目
    async loadDefaultProject() {
      try {
        const { getDefaultProjectContracts } = await import('../config/index.js')
        this.defaultProject = getDefaultProjectContracts()
      } catch (error) {
        console.error('❌ 加载默认项目失败:', error)
      }
    },

    // 加载最近使用的项目
    loadRecentProjects() {
      try {
        const recent = localStorage.getItem('recentProjects')
        if (recent) {
          this.recentProjects = JSON.parse(recent)
        }
      } catch (error) {
        console.error('❌ 加载最近项目失败:', error)
      }
    },

    // 保存到最近使用
    saveToRecent(project) {
      try {
        const recent = this.recentProjects.filter(p => 
          p.tokenAddress !== project.tokenAddress || 
          p.presaleAddress !== project.presaleAddress
        )
        recent.unshift(project)
        this.recentProjects = recent.slice(0, 5) // 只保留最近5个
        localStorage.setItem('recentProjects', JSON.stringify(this.recentProjects))
      } catch (error) {
        console.error('❌ 保存最近项目失败:', error)
      }
    },

    // 验证TRON地址
    validateTronAddress(address, type) {
      const errorField = type === 'token' ? 'tokenAddressError' : 'presaleAddressError'
      
      if (!address) {
        this[errorField] = ''
        return
      }

      // TRON地址格式验证
      const tronAddressRegex = /^T[A-Za-z1-9]{33}$/
      if (!tronAddressRegex.test(address)) {
        this[errorField] = '无效的TRON地址格式'
        return
      }

      this[errorField] = ''
    },

    // 使用默认项目
    useDefaultProject() {
      const url = `/?token=${this.defaultProject.TOKEN_ADDRESS}&presale=${this.defaultProject.PRESALE_ADDRESS}&name=${encodeURIComponent(this.defaultProject.PROJECT_NAME)}&symbol=${encodeURIComponent(this.defaultProject.PROJECT_SYMBOL)}`
      window.location.href = url
    },

    // 使用自定义项目
    useCustomProject() {
      if (!this.isCustomProjectValid) return

      const project = {
        name: this.customProject.name,
        symbol: this.customProject.symbol,
        tokenAddress: this.customProject.tokenAddress,
        presaleAddress: this.customProject.presaleAddress,
        timestamp: Date.now()
      }

      // 保存到最近使用
      this.saveToRecent(project)

      // 跳转到预售页面
      const url = `/?token=${project.tokenAddress}&presale=${project.presaleAddress}&name=${encodeURIComponent(project.name)}&symbol=${encodeURIComponent(project.symbol)}`
      window.location.href = url
    },

    // 使用最近项目
    useRecentProject(project) {
      const url = `/?token=${project.tokenAddress}&presale=${project.presaleAddress}&name=${encodeURIComponent(project.name)}&symbol=${encodeURIComponent(project.symbol)}`
      window.location.href = url
    },

    // 格式化地址显示
    formatAddress(address) {
      if (!address) return ''
      return address.replace(/([\w]{6})[\w\W]+([\w]{4})$/, '$1...$2')
    }
  }
}
</script>

<style scoped>
.project-selector {
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

/* 卡片通用样式 */
.default-project-card,
.custom-project-card,
.recent-projects-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.card-header {
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

/* 项目信息显示 */
.project-info {
  margin-bottom: 25px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 500;
  color: #666;
  min-width: 100px;
}

.value {
  font-weight: 600;
  color: #333;
  text-align: right;
}

.value.address {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 6px;
}

/* 表单输入 */
.input-form {
  margin-bottom: 25px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #dc3545;
}

.error-text {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 5px;
}

/* 按钮样式 */
.use-project-btn {
  width: 100%;
  padding: 15px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.use-project-btn.default {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.use-project-btn.custom {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.use-project-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.use-project-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 最近使用项目 */
.recent-list {
  max-height: 300px;
  overflow-y: auto;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recent-item:hover {
  background: #f8f9fa;
  border-color: #667eea;
}

.recent-item:last-child {
  margin-bottom: 0;
}

.recent-info {
  flex: 1;
}

.recent-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.recent-symbol {
  font-size: 0.9rem;
  color: #666;
}

.recent-addresses {
  text-align: right;
}

.recent-address {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 2px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .project-selector {
    padding: 15px;
  }

  .title {
    font-size: 2rem;
  }

  .default-project-card,
  .custom-project-card,
  .recent-projects-card {
    padding: 20px;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .value {
    text-align: left;
  }

  .recent-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .recent-addresses {
    text-align: left;
    width: 100%;
  }
}
</style>
