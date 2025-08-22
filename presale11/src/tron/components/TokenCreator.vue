<template>
  <div class="token-creator">


    <!-- 主要内容区域 -->
    <main class="main-content">

      
      <!-- 页面标题和步骤指示器 -->
      <div class="page-header">
        <h1 class="main-title">Launch <span class="gradient-text">your token</span> on RWAunion</h1>
        <div class="step-indicator">
          <div class="step-container">
            <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
              <div class="step-dot"></div>
              <div class="step-label">Token details</div>
            </div>
            <div class="step-connector"></div>
            <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
              <div class="step-dot"></div>
              <div class="step-label">LGE information</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 双栏布局容器 -->
      <div class="layout-container">
        <!-- 结果展示页面 -->
        <section v-if="showResultPage && result" class="result-page">
          <div class="result-container">
            <!-- 成功标题 -->
            <div class="success-header">
              <div class="success-icon">🎉</div>
              <h1>代币创建成功！</h1>
              <p>您的代币和预售合约已成功部署到TRON Nile测试网</p>
            </div>

            <!-- 代币信息卡片 -->
            <div class="token-info-card">
              <div class="card-header">
                <h2>代币信息</h2>
                <div class="token-logo">
                  <span class="token-symbol">{{ tokenConfig.symbol }}</span>
                </div>
              </div>
              <div class="card-content">
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">代币名称</span>
                    <span class="value">{{ tokenConfig.name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">代币符号</span>
                    <span class="value">{{ tokenConfig.symbol }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">总供应量</span>
                    <span class="value">{{ formatSupply(tokenConfig.totalSupply) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">买入税率</span>
                    <span class="value">{{ (tokenConfig.feeBuy / 100).toFixed(1) }}%</span>
                  </div>
                  <div class="info-item">
                    <span class="label">卖出税率</span>
                    <span class="value">{{ (tokenConfig.feeSell / 100).toFixed(1) }}%</span>
                  </div>
                  <div class="info-item">
                    <span class="label">网络</span>
                    <span class="value">TRON Nile测试网</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 合约地址卡片 -->
            <div class="contracts-card">
              <div class="card-header">
                <h2>合约地址</h2>
              </div>
              <div class="card-content">
                <div class="contract-item">
                  <div class="contract-info">
                    <span class="contract-label">代币合约</span>
                    <span class="contract-description">ERC20代币合约地址</span>
                  </div>
                  <div class="contract-address">
                    <span class="address-text">{{ result.contractAddresses?.tokenAddress || 'N/A' }}</span>
                    <button @click="copyAddress(result.contractAddresses?.tokenAddress)" class="copy-btn">
                      📋 复制
                    </button>
                  </div>
                </div>

                <div class="contract-item">
                  <div class="contract-info">
                    <span class="contract-label">预售合约</span>
                    <span class="contract-description">代币预售合约地址</span>
                  </div>
                  <div class="contract-address">
                    <span class="address-text">{{ result.contractAddresses?.presaleAddress || 'N/A' }}</span>
                    <button @click="copyAddress(result.contractAddresses?.presaleAddress)" class="copy-btn">
                      📋 复制
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 交易信息卡片 -->
            <div class="transaction-card">
              <div class="card-header">
                <h2>交易信息</h2>
              </div>
              <div class="card-content">
                <div class="transaction-grid">
                  <div class="transaction-item">
                    <span class="label">交易哈希</span>
                    <div class="transaction-hash">
                      <a :href="getTronTxLink(result.txHash)" target="_blank" class="tx-link">
                        {{ formatAddress(result.txHash, 8, 8) }}
                      </a>
                      <button @click="copyAddress(result.txHash)" class="copy-btn-small">📋</button>
                    </div>
                  </div>
                  <div class="transaction-item">
                    <span class="label">Gas消耗</span>
                    <span class="value">{{ result.gasUsed || 'N/A' }}</span>
                  </div>
                  <div class="transaction-item">
                    <span class="label">交易费用</span>
                    <span class="value">{{ result.fee || 'N/A' }}</span>
                  </div>
                  <div class="transaction-item">
                    <span class="label">创建时间</span>
                    <span class="value">{{ new Date().toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="result-actions">
              <button @click="viewOnExplorer" class="action-btn primary">
                🔍 在区块浏览器中查看
              </button>
              <button @click="createAnother" class="action-btn secondary">
                ➕ 创建另一个代币
              </button>
              <button @click="shareResult" class="action-btn secondary">
                📤 分享结果
              </button>
            </div>
          </div>
        </section>

        <!-- 左侧主内容区 -->
        <section v-else class="main-column">
          <!-- 步骤1：Token详情 -->
          <section v-if="currentStep === 1" class="config-section token-details">
            <!-- Logo上传区域 -->
            <div class="form-group logo-group">
              <label class="form-label">Logo</label>
              <div
                class="logo-uploader"
                :class="{
                  'has-image': tokenDetails.logoPreview,
                  'drag-over': ui.isDragOver,
                  'error': validationErrors.logo
                }"
                @click="triggerFileInput"
                @dragover.prevent="handleDragOver"
                @dragleave.prevent="handleDragLeave"
                @drop.prevent="handleDrop"
              >
                <input
                  ref="logoInput"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  @change="handleFileSelect"
                  style="display: none;"
                />

                <div v-if="!tokenDetails.logoPreview" class="logo-placeholder">
                  <div class="upload-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.2647 15.9377L12.5473 14.2346C12.2326 13.9202 11.7674 13.9202 11.4527 14.2346L9.73533 15.9377C9.42066 16.2524 9.42066 16.7176 9.73533 17.0323C10.05 17.347 10.5152 17.347 10.8299 17.0323L11.5 16.3622V21.5C11.5 21.9142 11.8358 22.25 12.25 22.25H12.75C13.1642 22.25 13.5 21.9142 13.5 21.5V16.3622L14.1701 17.0323C14.4848 17.347 14.95 17.347 15.2647 17.0323C15.5793 16.7176 15.5793 16.2524 15.2647 15.9377H14.2647Z" fill="currentColor"/>
                      <path d="M19.5 12.5C19.5 11.1193 18.3807 10 17 10H16.1716C15.9672 8.91168 15.4546 7.91371 14.6967 7.11612C13.6193 5.96875 12.1250 5.25 10.5 5.25C8.87500 5.25 7.38068 5.96875 6.30330 7.11612C5.54545 7.91371 5.03284 8.91168 4.82841 10H4C2.61929 10 1.5 11.1193 1.5 12.5C1.5 13.8807 2.61929 15 4 15H6.25C6.66421 15 7 14.6642 7 14.25C7 13.8358 6.66421 13.5 6.25 13.5H4C3.44772 13.5 3 13.0523 3 12.5C3 11.9477 3.44772 11.5 4 11.5H5.5C5.91421 11.5 6.25 11.1642 6.25 10.75C6.25 9.23122 7.48122 8 9 8C10.5188 8 11.75 9.23122 11.75 10.75C11.75 11.1642 12.0858 11.5 12.5 11.5H17C17.5523 11.5 18 11.9477 18 12.5C18 13.0523 17.5523 13.5 17 13.5H14.75C14.3358 13.5 14 13.8358 14 14.25C14 14.6642 14.3358 15 14.75 15H17C18.3807 15 19.5 13.8807 19.5 12.5Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div class="upload-text">JPEG/PNG/WEBP/GIF</div>
                  <div class="upload-hint">Less Than 4MB</div>
                </div>

                <div v-else class="logo-preview">
                  <img :src="tokenDetails.logoPreview" alt="Logo预览" />
                  <div class="logo-overlay">
                    <button type="button" @click.stop="removeLogo" class="remove-btn">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <small v-if="validationErrors.logo" class="error-text">{{ validationErrors.logo }}</small>
            </div>

            <!-- Token Name -->
            <div class="form-group">
              <label class="form-label">
                Token Name *
                <span class="char-count">{{ tokenDetails.name.length }}/20</span>
              </label>
              <input
                v-model="tokenDetails.name"
                type="text"
                placeholder="Token name"
                maxlength="20"
                class="form-input"
                :class="{ error: validationErrors.name }"
                @input="validateName"
                @blur="validateName"
              />
              <small v-if="validationErrors.name" class="error-text">{{ validationErrors.name }}</small>
            </div>

            <!-- Token Symbol -->
            <div class="form-group">
              <label class="form-label">
                Token Symbol($Ticker) *
                <span class="char-count">{{ tokenDetails.symbol.length }}/10</span>
              </label>
              <input
                v-model="tokenDetails.symbol"
                type="text"
                placeholder="Token Symbol"
                maxlength="10"
                class="form-input"
                :class="{ error: validationErrors.symbol }"
                @input="formatSymbol"
                @blur="validateSymbol"
              />
              <small v-if="validationErrors.symbol" class="error-text">{{ validationErrors.symbol }}</small>
            </div>

            <!-- Supply -->
            <div class="form-group">
              <label class="form-label">Supply *</label>
              <input
                v-model="tokenDetails.totalSupply"
                type="text"
                placeholder="Ex.210000000"
                class="form-input"
                :class="{ error: validationErrors.totalSupply }"
                @input="formatSupply"
                @blur="validateTotalSupply"
              />
              <small v-if="validationErrors.totalSupply" class="error-text">{{ validationErrors.totalSupply }}</small>
              <small v-else class="hint-text">输入代币总量（不含小数位）</small>
            </div>

            <!-- Tokenomic Preset -->
            <div class="form-group">
              <label class="form-label">Choose Tokenomic preset</label>
              <div class="custom-dropdown" :class="{ open: ui.dropdownOpen }">
                <div
                  class="dropdown-trigger"
                  :class="{ selected: tokenDetails.tokenomicPreset }"
                  @click="toggleDropdown"
                >
                  <div class="trigger-content">
                    <div v-if="tokenDetails.tokenomicPreset" class="selected-preset">
                      <div class="preset-color-dot" :style="{ backgroundColor: selectedPreset.color }"></div>
                      <span class="preset-text">{{ selectedPreset.label }} ({{ selectedPreset.buy }}% / {{ selectedPreset.sell }}%)</span>
                    </div>
                    <span v-else class="placeholder">请选择预设</span>
                  </div>
                  <div class="dropdown-arrow" :class="{ rotated: ui.dropdownOpen }">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>

                <div v-if="ui.dropdownOpen" class="dropdown-menu">
                  <div
                    v-for="preset in presets"
                    :key="preset.key"
                    class="dropdown-option"
                    :class="{ active: tokenDetails.tokenomicPreset === preset.key }"
                    @click="selectPreset(preset.key)"
                  >
                    <div class="option-content">
                      <div class="preset-color-dot" :style="{ backgroundColor: preset.color }"></div>
                      <div class="option-text">
                        <span class="option-label">{{ preset.label }}</span>
                        <span class="option-rates">({{ preset.buy }}% / {{ preset.sell }}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="tokenDetails.tokenomicPreset" class="preset-preview">
                <div class="preset-header">
                  <div class="preset-color-dot" :style="{ backgroundColor: selectedPreset.color }"></div>
                  <span class="preset-label">{{ selectedPreset.label }}</span>
                  <span class="preset-badge">{{ selectedPreset.buy }}% / {{ selectedPreset.sell }}%</span>
                </div>
                <div class="preset-description">{{ getPresetDescription(selectedPreset.key) }}</div>
              </div>
            </div>

            <!-- Token Description -->
            <div class="form-group">
              <label class="form-label">
                Token Description *
                <span class="char-count">{{ tokenDetails.description.length }}/256</span>
              </label>
              <textarea
                v-model="tokenDetails.description"
                rows="4"
                placeholder="Token Description"
                maxlength="256"
                class="form-textarea"
                :class="{ error: validationErrors.description }"
                @input="validateDescription"
                @blur="validateDescription"
              ></textarea>
              <small v-if="validationErrors.description" class="error-text">{{ validationErrors.description }}</small>
            </div>

            <!-- Website -->
            <div class="form-group">
              <label class="form-label">Website</label>
              <input
                v-model="tokenDetails.website"
                type="url"
                placeholder="Optional"
                class="form-input"
                :class="{ error: validationErrors.website }"
                @blur="validateWebsite"
              />
              <small v-if="validationErrors.website" class="error-text">{{ validationErrors.website }}</small>
            </div>

            <!-- Telegram -->
            <div class="form-group">
              <label class="form-label">Telegram</label>
              <input
                v-model="tokenDetails.telegram"
                type="text"
                placeholder="Optional"
                class="form-input"
                :class="{ error: validationErrors.telegram }"
                @blur="validateTelegram"
              />
              <small v-if="validationErrors.telegram" class="error-text">{{ validationErrors.telegram }}</small>
            </div>

            <!-- Twitter -->
            <div class="form-group">
              <label class="form-label">Twitter</label>
              <input
                v-model="tokenDetails.twitter"
                type="text"
                placeholder="Optional"
                class="form-input"
                :class="{ error: validationErrors.twitter }"
                @blur="validateTwitter"
              />
              <small v-if="validationErrors.twitter" class="error-text">{{ validationErrors.twitter }}</small>
            </div>

            <!-- Backing Asset Info -->
            <div class="backing-asset-info">
              <span class="backing-label">Backing asset:</span>
              <div class="asset-chip">
                <span class="trx-icon">TRX</span>
              </div>
            </div>

            <!-- 步骤1底部按钮 -->
            <div class="form-bottom-actions">
              <button
                @click="nextStep"
                :disabled="!canProceedToStep2"
                class="create-token-btn primary"
                :title="getCreateButtonTooltip()"
              >
                {{ getCreateButtonText() }}
              </button>


            </div>
        </section>

          <!-- 步骤2：LGE信息 -->
          <section v-else-if="currentStep === 2" class="config-section lge-info">
            <!-- Token for LGE -->
            <div class="form-group">
              <label class="form-label">* Token for LGE (Token amount)</label>
              <div class="token-input-container">
                <div class="token-input-field">
                  <div class="token-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1L9.5 5.5L14 7L9.5 8.5L8 13L6.5 8.5L2 7L6.5 5.5L8 1Z" fill="currentColor"/>
                    </svg>
                    <span class="token-name">{{ tokenDetails.symbol || 'union' }}</span>
                  </div>
                  <div class="token-amount">
                    <span class="amount-value">{{ formatTokenAmount(lgeInfo.tokenForLGE) }}</span>
                  </div>
                </div>
                <div class="balance-info">
                  <span class="balance-text">Balance: {{ formatBalance(tokenDetails.totalSupply) }} MAX</span>
                  <span class="percentage-used">{{ calculatePercentageUsed() }} ({{ calculatePercentageUsed() }}%)</span>
                </div>
                <div class="percentage-buttons">
                  <button 
                    v-for="percentage in [10, 25, 50, 75, 'Max']" 
                    :key="percentage"
                    class="percentage-btn"
                    :class="{ active: selectedPercentage === percentage }"
                    @click="selectPercentage(percentage)"
                  >
                    {{ percentage === 'Max' ? 'Max' : percentage + '%' }}
                  </button>
                </div>
              </div>
              <small v-if="validationErrors.tokenForLGE" class="error-text">{{ validationErrors.tokenForLGE }}</small>
              <small v-else class="hint-text">用于LGE的代币数量</small>
            </div>

            <!-- Hard Cap -->
            <div class="form-group">
              <label class="form-label">Hard Cap (TRX) *</label>
              <input
                v-model="lgeInfo.hardCap"
                type="text"
                placeholder="1000"
                class="form-input"
                :class="{ error: validationErrors.hardCap }"
                @input="validateHardCap"
                @blur="validateHardCap"
              />
              <small v-if="validationErrors.hardCap" class="error-text">{{ validationErrors.hardCap }}</small>
              <small v-else class="hint-text">预售硬顶限制（TRX）</small>
            </div>

            <!-- Soft Cap -->
            <div class="form-group">
              <label class="form-label">Soft Cap (TRX) *</label>
              <input
                v-model="lgeInfo.softCap"
                type="text"
                placeholder="500"
                class="form-input"
                :class="{ error: validationErrors.softCap }"
                @input="validateSoftCap"
                @blur="validateSoftCap"
              />
              <small v-if="validationErrors.softCap" class="error-text">{{ validationErrors.softCap }}</small>
              <small v-else class="hint-text">预售软顶限制（TRX）</small>
            </div>

            <!-- Max Buy -->
            <div class="form-group">
              <label class="form-label">Max Buy (TRX) *</label>
              <input
                v-model="lgeInfo.maxBuy"
                type="text"
                placeholder="100"
                class="form-input"
                :class="{ error: validationErrors.maxBuy }"
                @input="validateMaxBuy"
                @blur="validateMaxBuy"
              />
              <small v-if="validationErrors.maxBuy" class="error-text">{{ validationErrors.maxBuy }}</small>
              <small v-else class="hint-text">每个钱包最大购买量（TRX）</small>
            </div>

            <!-- Supply for LPs% -->
            <div class="form-group">
              <label class="form-label">Supply for LPs%</label>
              <input
                v-model="lgeInfo.supplyForLPs"
                type="text"
                placeholder="80"
                class="form-input"
              />
              <small class="hint-text">用于流动性池的代币供应比例</small>
            </div>

            <!-- Rate -->
            <div class="form-group">
              <label class="form-label">Rate (Tokens per TRX) *</label>
              <input
                v-model="lgeInfo.rate"
                type="text"
                placeholder="1000"
                class="form-input"
                :class="{ error: validationErrors.rate }"
                @input="validateRate"
                @blur="validateRate"
              />
              <small v-if="validationErrors.rate" class="error-text">{{ validationErrors.rate }}</small>
              <small v-else class="hint-text">每1 TRX可兑换的代币数量</small>
            </div>

            <!-- Start date and time -->
            <div class="form-group">
              <label class="form-label">Start date and time *</label>
              <div class="datetime-container">
                <input
                  v-model="lgeInfo.startDate"
                  type="datetime-local"
                  class="form-input datetime-input"
                  :class="{ error: validationErrors.startDate }"
                  @input="onStartDateChange"
                  @blur="validateStartDate"
                />
                <div class="datetime-icon">📅</div>
              </div>
              <small v-if="validationErrors.startDate" class="error-text">{{ validationErrors.startDate }}</small>
              <small v-else class="hint-text">预售开始时间</small>
            </div>

            <!-- End date and time -->
            <div class="form-group">
              <label class="form-label">End date and time *</label>
              <div class="datetime-container">
                <input
                  v-model="lgeInfo.endDate"
                  type="datetime-local"
                  class="form-input datetime-input"
                  :class="{ error: validationErrors.endDate }"
                  @input="onEndDateChange"
                  @blur="validateEndDate"
                />
                <div class="datetime-icon">📅</div>
              </div>
              <small v-if="validationErrors.endDate" class="error-text">{{ validationErrors.endDate }}</small>
              <small v-else class="hint-text">预售结束时间</small>
            </div>

            <!-- Time Summary Display -->
            <div class="form-group">
              <label class="form-label">Time Summary</label>
              <div class="time-summary-container">
                <div class="time-summary-row">
                  <span class="time-label">Start time</span>
                  <span class="time-value">{{ formatDisplayTime(lgeInfo.startDate) }}</span>
                </div>
                <div class="time-summary-row">
                  <span class="time-label">End time</span>
                  <span class="time-value">{{ formatDisplayTime(lgeInfo.endDate) }}</span>
                </div>
                <div class="time-summary-row">
                  <span class="time-label">Duration</span>
                  <span class="time-value duration-value">{{ calculatedDuration }}D</span>
                </div>
              </div>
              <small class="hint-text">预售时间汇总信息</small>
            </div>

            <!-- Vesting配置 -->
            <div class="form-group">
              <label class="form-label">Vesting Configuration</label>
              <div class="vesting-config">
                <div class="vesting-row">
                  <label>Vesting Delay (Days)</label>
                  <input
                    v-model="lgeInfo.vestingDelay"
                    type="number"
                    placeholder="7"
                    min="0"
                    max="90"
                    class="form-input"
                  />
                </div>
                <div class="vesting-row">
                  <label>Vesting Rate (%)</label>
                  <input
                    v-model="lgeInfo.vestingRate"
                    type="number"
                    placeholder="10"
                    min="0"
                    max="100"
                    class="form-input"
                  />
                </div>
              </div>
              <small class="hint-text">代币释放配置（可选）</small>
            </div>

            <!-- Backing/Dev Share -->
            <div class="form-group">
              <label class="form-label">Backing & Dev Share</label>
              <div class="share-config">
                <div class="share-row">
                  <label>Backing Share (%)</label>
                  <input
                    v-model="lgeInfo.backingShare"
                    type="number"
                    placeholder="0"
                    min="0"
                    max="50"
                    class="form-input"
                  />
                </div>
                <div class="share-row">
                  <label>Dev Share (%)</label>
                  <input
                    v-model="lgeInfo.devShare"
                    type="number"
                    placeholder="20"
                    min="0"
                    max="50"
                    class="form-input"
                  />
                </div>
              </div>
              <small class="hint-text">资产支撑和开发团队分配比例</small>
            </div>

            <!-- 步骤2底部按钮 -->
            <div class="form-bottom-actions">
              <button
                @click="createToken"
                :disabled="!canCreateToken || creating"
                class="create-token-btn primary"
                :title="getCreateButtonTooltip()"
              >
                {{ getCreateButtonText() }}
              </button>
            </div>
          </section>

        </section>

        <!-- 右侧边栏 - 简化版 -->
        <aside class="sidebar">





          <!-- 错误信息 -->
          <div v-if="error" class="side-card error-card">
            <h4>错误</h4>
            <p>{{ error }}</p>
          </div>

          <!-- 成功信息 -->
          <div v-if="result" class="side-card success-card">
            <h4>创建成功！</h4>
            <div class="result-details">
              <div class="result-row">
                <span>交易哈希:</span>
                <a :href="getTronTxLink(result.txHash)" target="_blank" class="tx-link">
                  {{ formatAddress(result.txHash, 6, 6) }}
                </a>
              </div>

              <div v-if="result.contractAddresses" class="contract-addresses">
                <div class="address-row">
                  <span>代币地址:</span>
                  <div class="address-chip" @click="copyAddress(result.contractAddresses.tokenAddress)">
                    {{ formatAddress(result.contractAddresses.tokenAddress, 6, 4) }}
                    <span class="copy-icon">📋</span>
                  </div>
                </div>

                <div class="address-row">
                  <span>预售地址:</span>
                  <div class="address-chip" @click="copyAddress(result.contractAddresses.presaleAddress)">
                    {{ formatAddress(result.contractAddresses.presaleAddress, 6, 4) }}
                    <span class="copy-icon">📋</span>
                  </div>
                </div>
              </div>

              <!-- 预售操作按钮 -->
              <div v-if="result.contractAddresses" class="presale-actions">
                <button
                  @click="goToPresale"
                  class="presale-btn primary"
                  :disabled="!result.contractAddresses.presaleAddress"
                >
                  🚀 查看预售
                </button>
                <button
                  @click="goToPresaleManager"
                  class="presale-btn secondary"
                  :disabled="!result.contractAddresses.presaleAddress"
                >
                  ⚙️ 管理预售
                </button>
                <p class="presale-hint">查看预售页面进行众筹，或管理预售状态</p>
              </div>
            </div>
          </div>


        </aside>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'TokenCreator',

  data() {
    // 获取开发配置
    const isDev = process.env.VUE_APP_DEV_MODE === 'true'
    const minStartTimeMinutes = isDev ? 0 : 15

    return {
      // 开发配置
      developmentConfig: {
        isDev,
        minStartTimeMinutes
      },

      tokenConfig: {
        name: '',
        symbol: '',
        totalSupply: '',
        feeBuy: 300,  // 3%
        feeSell: 300, // 3%
        feeRecipient: ''
      },

      presaleConfig: {
        presaleEthAmount: '100000',
        tradeEthAmount: '50000',
        maxTotalNum: 100,
        presaleMaxNum: 10,
        marketDisAmount: '1000000000'
      },

      // LP分配配置
      lpDistributionConfig: {
        enabled: false,              // 是否启用LP分配功能
        userShare: 80,              // 用户分配比例 (%)
        devShare: 20,               // 开发团队分配比例 (%)
        devReceiver: '',            // 开发团队接收地址
      },

      // === LGE集成配置（基于LEG.txt） ===
      lgeConfig: {
        enabled: false,             // 是否启用LGE功能

        // 基础配置
        startTime: null,            // 预售开始时间
        hardcap: '1000',            // 硬顶限制 (TRX)
        maxBuyPerWallet: '100',     // 每个钱包最大购买量 (TRX)
        duration: 7,                // 预售持续时间 (天)

        // Vesting配置
        vestingEnabled: false,      // 是否启用vesting
        vestingDelay: 7,            // 释放延迟 (天)
        vestingRate: 10,            // 释放比例 (%)

        // Backing配置
        backingEnabled: false,      // 是否启用backing
        backingShare: 0,            // 资产支撑份额 (%)
        backingReceiver: '',        // 资产支撑接收地址
        fecShare: 30,               // FEC分配比例 (%)
      },

      // 步骤控制
      currentStep: 1,
      maxStep: 2,
      
      // 百分比选择器状态
      selectedPercentage: 10,

      // 步骤1：Token详情
      tokenDetails: {
        logo: null,
        logoPreview: '',
        name: '',
        symbol: '',
        totalSupply: '',
        tokenomicPreset: '',
        description: '',
        website: '',
        telegram: '',
        twitter: ''
      },

      // 步骤2：LGE信息
      lgeInfo: {
        tokenForLGE: '100000',      // Token amount for LGE
        hardCap: '1000',            // Hard Cap (TRX)
        softCap: '500',             // Soft Cap (TRX)
        maxBuy: '100',              // Max Buy per wallet (TRX)
        supplyForLPs: '80',         // Supply for LPs%
        rate: '1000',               // Rate (tokens per TRX)
        startDate: null,            // Start date
        endDate: null,              // End date
        duration: 7,                // Duration in days (auto-calculated)
        vestingDelay: 7,            // Vesting delay (days)
        vestingRate: 10,            // Vesting rate (%)
        backingShare: 0,            // Backing share (%)
        devShare: 20                // Dev share (%)
      },

      ui: {
        dropdownOpen: false, // 自定义下拉框状态
        isDragOver: false
      },
      presets: [
        { key: 'meme', label: 'Meme Category', buy: 0.5, sell: 0.5, color: '#FF6B6B' },
        { key: 'utility', label: 'Utility Token', buy: 1.0, sell: 1.5, color: '#4ECDC4' },
        { key: 'defi', label: 'DeFi Protocol', buy: 2.0, sell: 3.0, color: '#45B7D1' },
        { key: 'gaming', label: 'Gaming Token', buy: 1.5, sell: 2.0, color: '#9B59B6' },
        { key: 'nft', label: 'NFT Collection', buy: 2.5, sell: 3.5, color: '#E67E22' }
      ],
      validationErrors: {
        // 步骤1验证错误
        name: '',
        symbol: '',
        totalSupply: '',
        description: '',
        logo: '',
        website: '',
        telegram: '',
        twitter: '',

        // 步骤2验证错误
        tokenForLGE: '',
        hardCap: '',
        softCap: '',
        maxBuy: '',
        rate: '',
        startDate: '',
        endDate: ''
      },


      creationFee: null,
      creationFeeUpdatedAt: null,
      loading: false,
      creating: false,
      connecting: false,
      walletBalance: null,
      error: null,
      result: null,
      showResultPage: false
    }
  },

  computed: {
    selectedPreset() {
      return this.presets.find(p => p.key === this.tokenDetails.tokenomicPreset) || {}
    },
    isStep1Valid() {
      // 第一步：Token详情验证
      const hasRequiredFields = this.tokenDetails.name &&
                               this.tokenDetails.symbol &&
                               this.tokenDetails.totalSupply &&
                               this.tokenDetails.tokenomicPreset &&
                               this.tokenDetails.description

      const hasNoErrors = !this.validationErrors.name &&
                         !this.validationErrors.symbol &&
                         !this.validationErrors.totalSupply &&
                         !this.validationErrors.description

      const isValid = hasRequiredFields && hasNoErrors

      // 添加调试信息
      if (this.currentStep === 2) {
        console.log('🔍 步骤1验证状态:', {
          hasRequiredFields,
          hasNoErrors,
          isValid,
          tokenDetails: {
            name: this.tokenDetails.name,
            symbol: this.tokenDetails.symbol,
            totalSupply: this.tokenDetails.totalSupply,
            tokenomicPreset: this.tokenDetails.tokenomicPreset,
            description: this.tokenDetails.description
          },
          validationErrors: {
            name: this.validationErrors.name,
            symbol: this.validationErrors.symbol,
            totalSupply: this.validationErrors.totalSupply,
            description: this.validationErrors.description
          }
        })
      }

      return isValid
    },

    isStep2Valid() {
      // 第二步：LGE信息验证
      const hasRequiredFields = this.lgeInfo.tokenForLGE &&
                               this.lgeInfo.hardCap &&
                               this.lgeInfo.softCap &&
                               this.lgeInfo.maxBuy &&
                               this.lgeInfo.rate &&
                               this.lgeInfo.startDate &&
                               this.lgeInfo.endDate

      const hasNoErrors = !this.validationErrors.tokenForLGE &&
                         !this.validationErrors.hardCap &&
                         !this.validationErrors.softCap &&
                         !this.validationErrors.maxBuy &&
                         !this.validationErrors.rate &&
                         !this.validationErrors.startDate &&
                         !this.validationErrors.endDate

      const isValid = hasRequiredFields && hasNoErrors

      // 添加调试信息
      if (this.currentStep === 2) {
        console.log('🔍 步骤2验证状态:', {
          hasRequiredFields,
          hasNoErrors,
          isValid,
          lgeInfo: {
            tokenForLGE: this.lgeInfo.tokenForLGE,
            hardCap: this.lgeInfo.hardCap,
            softCap: this.lgeInfo.softCap,
            maxBuy: this.lgeInfo.maxBuy,
            rate: this.lgeInfo.rate,
            startDate: this.lgeInfo.startDate
          },
          validationErrors: {
            tokenForLGE: this.validationErrors.tokenForLGE,
            hardCap: this.validationErrors.hardCap,
            softCap: this.validationErrors.softCap,
            maxBuy: this.validationErrors.maxBuy,
            rate: this.validationErrors.rate,
            startDate: this.validationErrors.startDate
          }
        })
      }

      return isValid
    },

    canProceedToStep2() {
      return this.currentStep === 1 && this.isStep1Valid
    },

    canCreateToken() {
      // 只控制按钮的可点击状态，不控制显示状态
      return this.isStep1Valid && this.isStep2Valid && this.$tronState.isConnected && !this.creating
    },

    shouldShowCreateButton() {
      // 在步骤2时始终显示创建按钮
      return this.currentStep === 2
    },

    isFormValid() {
      return !Object.values(this.validationErrors).some(error => error !== '')
    },

    // 计算持续时间（天数）
    calculatedDuration() {
      if (!this.lgeInfo.startDate || !this.lgeInfo.endDate) {
        return this.lgeInfo.duration || 7
      }

      const startTime = new Date(this.lgeInfo.startDate).getTime()
      const endTime = new Date(this.lgeInfo.endDate).getTime()

      if (endTime <= startTime) {
        return 0
      }

      const diffMs = endTime - startTime
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

      return diffDays
    }
  },

  watch: {
    '$tronState.currentAccount'(newVal, oldVal) {
      if (newVal && !this.tokenConfig.feeRecipient) {
        this.tokenConfig.feeRecipient = newVal
      }
      // 当账户变为已连接时，静默尝试加载创建费用；断开时清空显示
      if (newVal && !oldVal) {
        this.loadCreationFee()
      }
      if (!newVal) {
        this.creationFee = null
      }
    },
    'tokenDetails.tokenomicPreset'(newVal) {
      if (newVal) {
        const preset = this.presets.find(p => p.key === newVal)
        if (preset) {
          this.tokenConfig.feeBuy = preset.buy * 100 // 转换为基点
          this.tokenConfig.feeSell = preset.sell * 100 // 转换为基点
        }
      }
    },
    'tokenDetails.name'() {
      this.validateName()
    },
    'tokenDetails.symbol'() {
      this.validateSymbol()
    },
    'tokenDetails.totalSupply'() {
      this.validateTotalSupply()
    },
    'tokenDetails.description'() {
      this.validateDescription()
    },

    // LGE信息字段验证监听
    'lgeInfo.tokenForLGE'() {
      this.validateTokenForLGE()
    },
    'lgeInfo.hardCap'() {
      this.validateHardCap()
    },
    'lgeInfo.softCap'() {
      this.validateSoftCap()
    },
    'lgeInfo.maxBuy'() {
      this.validateMaxBuy()
    },
    'lgeInfo.rate'() {
      this.validateRate()
    },
    'lgeInfo.startDate'() {
      this.validateStartDate()
    }
  },

  mounted() {
    // 初始状态调试输出
    console.log('🛰️ Tron 状态初始化: ', {
      isConnected: this.$tronState.isConnected,
      currentAccount: this.$tronState.currentAccount,
      tronWebReady: !!this.$tronWeb,
      network: this.$tronState.networkConfig?.name
    })

    // 设置默认手续费接收地址
    if (this.$tronState.currentAccount) {
      this.tokenConfig.feeRecipient = this.$tronState.currentAccount
    }

    // 若已连接钱包才自动加载创建费用和余额
    if (this.$tronState.isConnected) {
      this.loadCreationFee()
      this.loadWalletBalance()
    }

    // 监听钱包状态变化
    this.$watch('$tronState.isConnected', (newVal) => {
      console.log('🔁 isConnected 状态变化:', newVal, '账户:', this.$tronState.currentAccount)
      if (newVal) {
        this.tokenConfig.feeRecipient = this.$tronState.currentAccount
        this.loadCreationFee()
        this.loadWalletBalance()
      } else {
        this.walletBalance = null
        this.creationFee = null
      }
    })

    this.$watch('$tronState.currentAccount', (newVal) => {
      console.log('🔁 currentAccount 变化:', newVal)
      if (newVal) {
        this.tokenConfig.feeRecipient = newVal
        this.loadWalletBalance()
      }
    })

    // 初始化验证
    this.$nextTick(() => {
      this.validateName()
      this.validateSymbol()
      this.validateTotalSupply()
      this.validateDescription()
      this.validateTokenForLGE()
      this.validateHardCap()
      this.validateSoftCap()
      this.validateMaxBuy()
      this.validateRate()
      this.validateStartDate()
      
      // 初始化百分比选择器
      this.initializePercentageSelector()
    })

    // 添加点击外部关闭下拉框的事件监听
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeDestroy() {
    // 移除事件监听
    document.removeEventListener('click', this.handleClickOutside)
  },

  methods: {
    // 步骤导航方法
    nextStep() {
      if (this.currentStep < this.maxStep && this.canProceedToStep2) {
        this.currentStep++
      }
    },

    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },

    // 自定义下拉框方法
    toggleDropdown() {
      this.ui.dropdownOpen = !this.ui.dropdownOpen
    },

    selectPreset(presetKey) {
      this.tokenDetails.tokenomicPreset = presetKey
      this.ui.dropdownOpen = false

      // 同步税率到tokenConfig
      const preset = this.presets.find(p => p.key === presetKey)
      if (preset) {
        this.tokenConfig.feeBuy = preset.buy * 100 // 转换为基点
        this.tokenConfig.feeSell = preset.sell * 100 // 转换为基点
      }
    },

    // 点击外部关闭下拉框
    handleClickOutside(event) {
      const dropdown = this.$el.querySelector('.custom-dropdown')
      if (dropdown && !dropdown.contains(event.target)) {
        this.ui.dropdownOpen = false
      }
    },

    // 连接钱包
    async connectWallet() {
      if (this.connecting) return

      this.connecting = true
      this.error = null

      try {
        await this.$connectTronWallet()
        // 连接成功后加载相关数据
        if (this.$tronState.isConnected) {
          await this.loadCreationFee()
          await this.loadWalletBalance()
        }
      } catch (error) {
        this.error = `钱包连接失败: ${error.message}`
        console.error('钱包连接失败:', error)
      } finally {
        this.connecting = false
      }
    },

    // 获取创建按钮的文本
    getCreateButtonText() {
      if (this.creating) return '创建中...'
      if (this.currentStep === 1) {
        // 步骤1：始终显示"Next"，不再根据表单状态改变文字
        return 'Next'
      } else {
        // 步骤2：始终显示创建按钮，根据状态显示不同文本
        // 添加调试信息
        console.log('🔍 按钮状态调试:', {
          isConnected: this.$tronState.isConnected,
          currentAccount: this.$tronState.currentAccount,
          isStep1Valid: this.isStep1Valid,
          isStep2Valid: this.isStep2Valid,
          currentStep: this.currentStep
        })

        // 文案不再依赖是否连接钱包；未连接时按钮仍显示，但会被禁用且 tooltip 提示连接钱包
        if (!this.isStep1Valid) {
          console.log('❌ 步骤1验证失败')
          return '请完善Token详情'
        } else if (!this.isStep2Valid) {
          console.log('❌ 步骤2验证失败')
          return '请完善LGE信息'
        } else {
          console.log('✅ 表单通过校验, isConnected =', this.$tronState.isConnected)
          return '创建代币'
        }
      }
    },

    // 获取创建按钮的提示信息
    getCreateButtonTooltip() {
      if (this.currentStep === 1 && !this.isStep1Valid) {
        const missing = []
        if (!this.tokenDetails.name) missing.push('代币名称')
        if (!this.tokenDetails.symbol) missing.push('代币符号')
        if (!this.tokenDetails.totalSupply) missing.push('总供应量')
        if (!this.tokenDetails.description) missing.push('代币描述')
        if (!this.tokenDetails.tokenomicPreset) missing.push('税率预设')
        return `请填写: ${missing.join(', ')}`
      }

      if (this.currentStep === 2) {
        if (!this.$tronState.isConnected) {
          return '请先连接TronLink钱包'
        } else if (!this.isStep1Valid) {
          return '请返回步骤1完善Token详情信息'
        } else if (!this.isStep2Valid) {
          const missing = []
          if (!this.lgeInfo.tokenForLGE) missing.push('LGE代币数量')
          if (!this.lgeInfo.hardCap) missing.push('硬顶限制')
          if (!this.lgeInfo.softCap) missing.push('软顶限制')
          if (!this.lgeInfo.maxBuy) missing.push('最大购买量')
          if (!this.lgeInfo.rate) missing.push('兑换比例')
          if (!this.lgeInfo.startDate) missing.push('开始时间')
          return `请填写: ${missing.join(', ')}`
        } else {
          return '点击创建代币和预售合约'
        }
      }

      return this.currentStep === 1 ? '进入下一步配置LGE信息' : '点击创建代币和预售合约'
    },

    // 结果页面辅助方法
    formatSupply(supply) {
      const num = parseInt(supply)
      if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K'
      }
      return num.toLocaleString()
    },

    formatAddress(address, start = 6, end = 4) {
      if (!address) return 'N/A'
      if (address.length <= start + end) return address
      return `${address.slice(0, start)}...${address.slice(-end)}`
    },

    getTronTxLink(txHash) {
      return `https://nile.tronscan.org/#/transaction/${txHash}`
    },

    async copyAddress(address) {
      if (!address) return

      try {
        await navigator.clipboard.writeText(address)
        // 可以添加一个临时的成功提示
        console.log('地址已复制到剪贴板:', address)
      } catch (error) {
        console.error('复制失败:', error)
        // 降级方案：选择文本
        const textArea = document.createElement('textarea')
        textArea.value = address
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
    },

    // 跳转到预售页面
    goToPresale() {
      if (!this.result || !this.result.contractAddresses) {
        console.error('缺少合约地址信息')
        return
      }

      const { tokenAddress, presaleAddress } = this.result.contractAddresses

      // 构建预售页面URL，传递必要的参数
      const presaleUrl = `/?token=${tokenAddress}&presale=${presaleAddress}&name=${encodeURIComponent(this.tokenConfig.name)}&symbol=${encodeURIComponent(this.tokenConfig.symbol)}`

      // 跳转到预售页面
      window.location.href = presaleUrl

      console.log('跳转到预售页面:', presaleUrl)
    },

    // 跳转到预售管理页面
    goToPresaleManager() {
      if (!this.result || !this.result.contractAddresses) {
        console.error('缺少合约地址信息')
        return
      }

      const { tokenAddress, presaleAddress } = this.result.contractAddresses

      // 构建预售管理页面URL
      const managerUrl = `/#/presale-manager?token=${tokenAddress}&presale=${presaleAddress}&name=${encodeURIComponent(this.tokenConfig.name)}&symbol=${encodeURIComponent(this.tokenConfig.symbol)}`

      // 跳转到预售管理页面
      window.location.href = managerUrl

      console.log('跳转到预售管理页面:', managerUrl)
    },

    viewOnExplorer() {
      if (this.result?.txHash) {
        window.open(this.getTronTxLink(this.result.txHash), '_blank')
      }
    },

    createAnother() {
      // 重置所有状态，开始新的创建流程
      this.showResultPage = false
      this.result = null
      this.error = null
      this.creating = false

      // 重置表单数据
      this.tokenDetails = {
        logo: null,
        logoPreview: '',
        name: '',
        symbol: '',
        totalSupply: '',
        tokenomicPreset: '',
        description: '',
        website: '',
        telegram: '',
        twitter: ''
      }

      this.lgeInfo = {
        tokenForLGE: '100000',
        hardCap: '1000',
        softCap: '500',
        maxBuy: '100',
        supplyForLPs: '80',
        rate: '1000',
        startDate: null,
        endDate: null,
        duration: 7,
        vestingDelay: 7,
        vestingRate: 10,
        backingShare: 0,
        devShare: 20
      }

      this.tokenConfig = {
        name: '',
        symbol: '',
        totalSupply: '',
        feeBuy: 300,
        feeSell: 300,
        feeRecipient: this.$tronState.currentAccount || ''
      }

      this.currentStep = 1

      // 滚动到页面顶部
      window.scrollTo(0, 0)
    },

    // Logo相关方法
    triggerFileInput() {
      this.$refs.logoInput.click()
    },

    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.processLogoFile(file)
      }
    },

    handleDragOver(event) {
      event.preventDefault()
      this.ui.isDragOver = true
    },

    handleDragLeave(event) {
      event.preventDefault()
      this.ui.isDragOver = false
    },

    handleDrop(event) {
      event.preventDefault()
      this.ui.isDragOver = false

      const files = event.dataTransfer.files
      if (files.length > 0) {
        this.processLogoFile(files[0])
      }
    },

    processLogoFile(file) {
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        this.validationErrors.logo = '请选择有效的图片格式（JPEG、PNG、WEBP、GIF）'
        return
      }

      // 验证文件大小（4MB）
      if (file.size > 4 * 1024 * 1024) {
        this.validationErrors.logo = '图片大小不能超过4MB'
        return
      }

      // 清除错误
      this.validationErrors.logo = ''

      // 保存文件并创建预览
      this.tokenDetails.logo = file

      const reader = new FileReader()
      reader.onload = (e) => {
        this.tokenDetails.logoPreview = e.target.result
      }
      reader.readAsDataURL(file)
    },

    removeLogo() {
      this.tokenDetails.logo = null
      this.tokenDetails.logoPreview = ''
      this.validationErrors.logo = ''

      // 清空文件输入
      if (this.$refs.logoInput) {
        this.$refs.logoInput.value = ''
      }
    },

    // 获取预设描述
    getPresetDescription(presetKey) {
      const descriptions = {
        'meme': '适合Meme代币，低税率，注重社区传播',
        'utility': '实用代币，平衡的税率设置，支持项目发展',
        'defi': 'DeFi协议代币，较高税率用于协议发展和流动性激励',
        'gaming': '游戏代币，中等税率，平衡游戏经济和项目发展',
        'nft': 'NFT项目代币，较高税率支持NFT生态系统发展'
      }
      return descriptions[presetKey] || ''
    },

    shareResult() {
      if (!this.result) return

      const shareText = `🎉 我刚刚在TRON Nile测试网上成功创建了代币！

代币名称: ${this.tokenConfig.name}
代币符号: ${this.tokenConfig.symbol}
总供应量: ${this.formatSupply(this.tokenConfig.totalSupply)}

代币合约: ${this.result.contractAddresses?.tokenAddress || 'N/A'}
预售合约: ${this.result.contractAddresses?.presaleAddress || 'N/A'}

交易哈希: ${this.result.txHash}
查看详情: ${this.getTronTxLink(this.result.txHash)}

#TRON #DeFi #TokenLaunch`

      if (navigator.share) {
        navigator.share({
          title: '代币创建成功',
          text: shareText
        })
      } else {
        // 降级方案：复制到剪贴板
        this.copyAddress(shareText)
      }
    },

    // 钱包相关方法
    async loadWalletBalance() {
      if (!this.$tronState.currentAccount) return

      try {
        const balance = await this.$tronWeb.getBalance(this.$tronState.currentAccount)
        this.walletBalance = (balance / 1000000).toFixed(2) // 转换为TRX
      } catch (error) {
        console.error('获取钱包余额失败:', error)
        this.walletBalance = null
      }
    },

    formatAddress(address) {
      if (!address) return ''
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    },

    // 税率调节
    inc(c, side) {
      const v = Number(c[side] || 0)
      const stepSize = this.getTaxStepSize(c.key)
      const maxRate = this.getMaxTaxRate(c.key)
      c[side] = Math.min(maxRate, +(v + stepSize).toFixed(1))
      this.syncFeesToConfig()
    },
    dec(c, side) {
      const v = Number(c[side] || 0)
      const stepSize = this.getTaxStepSize(c.key)
      c[side] = Math.max(0, +(v - stepSize).toFixed(1))
      this.syncFeesToConfig()
    },

    // 获取税种的步长
    getTaxStepSize(taxKey) {
      switch (taxKey) {
        case 'backing':
          return 0.1 // backing 使用更精细的步长
        default:
          return 0.5 // 其他税种使用默认步长
      }
    },

    // 获取税种的最大费率
    getMaxTaxRate(taxKey) {
      switch (taxKey) {
        case 'backing':
          return 25 // backing 最大 25%
        default:
          return 100 // 其他税种最大 100%
      }
    },

    // 处理直接输入
    handleDirectInput(c, side, event) {
      if (c.key !== 'backing') return // 只有 backing 允许直接输入

      const value = parseFloat(event.target.value)
      if (!isNaN(value)) {
        const maxRate = this.getMaxTaxRate(c.key)
        c[side] = Math.min(maxRate, Math.max(0, +value.toFixed(1)))
        this.syncFeesToConfig()
      }
    },

    // 验证税率输入
    validateTaxInput(c, side) {
      if (c.key !== 'backing') return

      const value = Number(c[side])
      const maxRate = this.getMaxTaxRate(c.key)

      if (value < 0) {
        c[side] = 0
      } else if (value > maxRate) {
        c[side] = maxRate
      }

      c[side] = +c[side].toFixed(1)
      this.syncFeesToConfig()
    },

    // LP分配验证方法
    validateLPShares() {
      this.validationErrors.lpUserShare = ''
      this.validationErrors.lpDevShare = ''

      if (!this.lpDistributionConfig.enabled) return

      const userShare = Number(this.lpDistributionConfig.userShare)
      const devShare = Number(this.lpDistributionConfig.devShare)

      if (isNaN(userShare) || userShare < 0 || userShare > 100) {
        this.validationErrors.lpUserShare = '用户分配比例必须在0-100%之间'
      }

      if (isNaN(devShare) || devShare < 0 || devShare > 100) {
        this.validationErrors.lpDevShare = '开发团队分配比例必须在0-100%之间'
      }

      if (userShare + devShare !== 100) {
        this.validationErrors.lpUserShare = '用户和开发团队分配比例总和必须为100%'
        this.validationErrors.lpDevShare = '用户和开发团队分配比例总和必须为100%'
      }

      // 自动调整devShare以确保总和为100%
      if (!this.validationErrors.lpUserShare && !this.validationErrors.lpDevShare) {
        if (userShare + devShare !== 100) {
          this.lpDistributionConfig.devShare = 100 - userShare
        }
      }
    },

    validateLPDevReceiver() {
      this.validationErrors.lpDevReceiver = ''

      if (!this.lpDistributionConfig.enabled) return

      const address = this.lpDistributionConfig.devReceiver.trim()

      if (!address) {
        this.validationErrors.lpDevReceiver = '请输入开发团队LP接收地址'
        return
      }

      // TRON地址验证（简单验证：以T开头，长度34）
      if (!address.startsWith('T') || address.length !== 34) {
        this.validationErrors.lpDevReceiver = '请输入有效的TRON地址'
        return
      }

      // 不能是合约自身地址
      if (address === this.$tronState.currentAccount) {
        this.validationErrors.lpDevReceiver = '不能使用当前账户地址'
        return
      }
    },

    // === LGE验证方法 ===

    validateLGEHardcap() {
      this.validationErrors.lgeHardcap = ''

      if (!this.lgeConfig.enabled) return

      const hardcap = Number(this.lgeConfig.hardcap)
      if (isNaN(hardcap) || hardcap <= 0) {
        this.validationErrors.lgeHardcap = '硬顶限制必须大于0'
      }
    },

    validateLGEMaxBuy() {
      this.validationErrors.lgeMaxBuyPerWallet = ''

      if (!this.lgeConfig.enabled) return

      const maxBuy = Number(this.lgeConfig.maxBuyPerWallet)
      const hardcap = Number(this.lgeConfig.hardcap)

      if (isNaN(maxBuy) || maxBuy <= 0) {
        this.validationErrors.lgeMaxBuyPerWallet = '最大购买量必须大于0'
        return
      }

      if (hardcap > 0 && maxBuy > hardcap) {
        this.validationErrors.lgeMaxBuyPerWallet = '最大购买量不能超过硬顶限制'
      }
    },

    validateLGEStartTime() {
      this.validationErrors.lgeStartTime = ''

      if (!this.lgeConfig.enabled || !this.lgeConfig.startTime) return

      const startTime = new Date(this.lgeConfig.startTime).getTime()
      const minTime = Date.now() + (this.developmentConfig.minStartTimeMinutes * 60 * 1000)

      if (startTime < minTime) {
        const modeText = this.developmentConfig.isDev ? '开发模式' : '生产模式'
        this.validationErrors.lgeStartTime = `开始时间必须至少在当前时间${this.developmentConfig.minStartTimeMinutes}分钟之后 (${modeText})`
      }
    },

    validateLGEVestingDelay() {
      this.validationErrors.lgeVestingDelay = ''

      if (!this.lgeConfig.enabled || !this.lgeConfig.vestingEnabled) return

      const delay = Number(this.lgeConfig.vestingDelay)
      if (isNaN(delay) || delay < 7 || delay > 90) {
        this.validationErrors.lgeVestingDelay = 'Vesting延迟必须在7-90天之间'
      }
    },

    validateLGEVestingRate() {
      this.validationErrors.lgeVestingRate = ''

      if (!this.lgeConfig.enabled || !this.lgeConfig.vestingEnabled) return

      const rate = Number(this.lgeConfig.vestingRate)
      if (isNaN(rate) || rate < 5 || rate > 20) {
        this.validationErrors.lgeVestingRate = 'Vesting释放比例必须在5-20%之间'
      }
    },

    validateLGEBackingShare() {
      this.validationErrors.lgeBackingShare = ''

      if (!this.lgeConfig.enabled || !this.lgeConfig.backingEnabled) return

      const share = Number(this.lgeConfig.backingShare)
      if (isNaN(share) || share < 0 || share > 50) {
        this.validationErrors.lgeBackingShare = 'Backing份额必须在0-50%之间'
      }
    },

    validateLGEBackingReceiver() {
      this.validationErrors.lgeBackingReceiver = ''

      if (!this.lgeConfig.enabled || !this.lgeConfig.backingEnabled) return

      const address = this.lgeConfig.backingReceiver.trim()

      if (!address) {
        this.validationErrors.lgeBackingReceiver = '请输入Backing接收地址'
        return
      }

      if (!address.startsWith('T') || address.length !== 34) {
        this.validationErrors.lgeBackingReceiver = '请输入有效的TRON地址'
        return
      }
    },

    validateLGEDuration() {
      this.validationErrors.lgeDuration = ''

      if (!this.lgeConfig.enabled) return

      const duration = Number(this.lgeConfig.duration)
      if (isNaN(duration) || duration < 7 || duration > 90) {
        this.validationErrors.lgeDuration = '预售持续时间必须在7-90天之间'
      }
    },

    validateLGEFecShare() {
      this.validationErrors.lgeFecShare = ''

      if (!this.lgeConfig.enabled || !this.lgeConfig.backingEnabled) return

      const share = Number(this.lgeConfig.fecShare)
      if (isNaN(share) || share < 30 || share > 100) {
        this.validationErrors.lgeFecShare = 'FEC份额必须在30-100%之间'
      }
    },

    getMinStartTime() {
      const now = new Date()
      now.setMinutes(now.getMinutes() + this.developmentConfig.minStartTimeMinutes)
      return now.toISOString().slice(0, 16) // 格式化为 datetime-local 格式
    },
    syncFeesToConfig() {
      // 将总买卖税映射到 tokenConfig 的 feeBuy/feeSell（百分比到整数）
      this.tokenConfig.feeBuy = this.buyTaxTotal
      this.tokenConfig.feeSell = this.sellTaxTotal
    },

    // 步骤1字段验证方法
    validateName() {
      const name = this.tokenDetails.name.trim()
      if (!name) {
        this.validationErrors.name = '代币名称不能为空'
      } else if (name.length < 2) {
        this.validationErrors.name = '代币名称至少需要2个字符'
      } else if (name.length > 20) {
        this.validationErrors.name = '代币名称不能超过20个字符'
      } else {
        this.validationErrors.name = ''
      }
      // 同步到tokenConfig
      this.tokenConfig.name = this.tokenDetails.name
    },

    validateSymbol() {
      const symbol = this.tokenDetails.symbol.trim().toUpperCase()
      if (!symbol) {
        this.validationErrors.symbol = '代币符号不能为空'
      } else if (symbol.length < 2) {
        this.validationErrors.symbol = '代币符号至少需要2个字符'
      } else if (symbol.length > 10) {
        this.validationErrors.symbol = '代币符号不能超过10个字符'
      } else if (!/^[A-Z0-9]+$/.test(symbol)) {
        this.validationErrors.symbol = '代币符号只能包含大写字母和数字'
      } else {
        this.validationErrors.symbol = ''
      }
      // 同步到tokenConfig
      this.tokenConfig.symbol = this.tokenDetails.symbol
    },

    validateTotalSupply() {
      const supply = this.tokenDetails.totalSupply.trim()
      if (!supply) {
        this.validationErrors.totalSupply = '总供应量不能为空'
      } else if (!/^\d+$/.test(supply)) {
        this.validationErrors.totalSupply = '总供应量必须是正整数'
      } else {
        const num = parseInt(supply)
        if (num < 1000) {
          this.validationErrors.totalSupply = '总供应量不能少于1000'
        } else if (num > 1000000000000) {
          this.validationErrors.totalSupply = '总供应量不能超过1万亿'
        } else {
          this.validationErrors.totalSupply = ''
        }
      }
      // 同步到tokenConfig
      this.tokenConfig.totalSupply = this.tokenDetails.totalSupply
    },

    validateDescription() {
      const desc = this.tokenDetails.description.trim()
      if (!desc) {
        this.validationErrors.description = '代币描述不能为空'
      } else if (desc.length < 10) {
        this.validationErrors.description = '代币描述至少需要10个字符'
      } else if (desc.length > 256) {
        this.validationErrors.description = '代币描述不能超过256个字符'
      } else {
        this.validationErrors.description = ''
      }
    },

    validateWebsite() {
      const website = this.tokenDetails.website.trim()
      if (website && !/^https?:\/\/.+\..+/.test(website)) {
        this.validationErrors.website = '请输入有效的网站地址（以 http:// 或 https:// 开头）'
      } else {
        this.validationErrors.website = ''
      }
    },

    validateTelegram() {
      const telegram = this.tokenDetails.telegram.trim()
      if (telegram) {
        if (!/^(@[a-zA-Z0-9_]{5,32}|https?:\/\/(t\.me|telegram\.me)\/[a-zA-Z0-9_]{5,32})$/.test(telegram)) {
          this.validationErrors.telegram = '请输入有效的 Telegram 用户名（@username）或链接'
        } else {
          this.validationErrors.telegram = ''
        }
      } else {
        this.validationErrors.telegram = ''
      }
    },

    validateTwitter() {
      const twitter = this.tokenDetails.twitter.trim()
      if (twitter) {
        if (!/^(@[a-zA-Z0-9_]{1,15}|https?:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]{1,15})$/.test(twitter)) {
          this.validationErrors.twitter = '请输入有效的 Twitter 用户名（@username）或链接'
        } else {
          this.validationErrors.twitter = ''
        }
      } else {
        this.validationErrors.twitter = ''
      }
    },

    // 步骤2字段验证方法
    validateTokenForLGE() {
      const tokenForLGE = Number(this.lgeInfo.tokenForLGE)
      if (!this.lgeInfo.tokenForLGE || isNaN(tokenForLGE) || tokenForLGE <= 0) {
        this.validationErrors.tokenForLGE = 'Token for LGE必须大于0'
      } else {
        this.validationErrors.tokenForLGE = ''
      }
    },
    validateHardCap() {
      const hardCap = Number(this.lgeInfo.hardCap)
      if (!this.lgeInfo.hardCap || isNaN(hardCap) || hardCap <= 0) {
        this.validationErrors.hardCap = '硬顶限制必须大于0'
      } else {
        this.validationErrors.hardCap = ''
      }
    },

    validateSoftCap() {
      const softCap = Number(this.lgeInfo.softCap)
      const hardCap = Number(this.lgeInfo.hardCap)
      if (!this.lgeInfo.softCap || isNaN(softCap) || softCap <= 0) {
        this.validationErrors.softCap = '软顶限制必须大于0'
      } else if (hardCap > 0 && softCap >= hardCap) {
        this.validationErrors.softCap = '软顶限制必须小于硬顶限制'
      } else {
        this.validationErrors.softCap = ''
      }
    },

    validateMaxBuy() {
      const maxBuy = Number(this.lgeInfo.maxBuy)
      const hardCap = Number(this.lgeInfo.hardCap)
      if (!this.lgeInfo.maxBuy || isNaN(maxBuy) || maxBuy <= 0) {
        this.validationErrors.maxBuy = '最大购买量必须大于0'
      } else if (hardCap > 0 && maxBuy > hardCap) {
        this.validationErrors.maxBuy = '最大购买量不能超过硬顶限制'
      } else {
        this.validationErrors.maxBuy = ''
      }
    },

    validateRate() {
      const rate = Number(this.lgeInfo.rate)
      if (!this.lgeInfo.rate || isNaN(rate) || rate <= 0) {
        this.validationErrors.rate = '兑换比例必须大于0'
      } else {
        this.validationErrors.rate = ''
      }
    },

    // === 百分比选择器相关方法 ===
    
    // 选择百分比
    selectPercentage(percentage) {
      this.selectedPercentage = percentage;
      if (percentage === 'Max') {
        this.lgeInfo.tokenForLGE = this.tokenDetails.totalSupply;
      } else {
        const totalSupply = parseFloat(this.tokenDetails.totalSupply.replace(/[^\d]/g, ''));
        this.lgeInfo.tokenForLGE = (totalSupply * percentage / 100).toString();
      }
      this.validateTokenForLGE();
    },

    // 格式化代币数量显示
    formatTokenAmount(value) {
      if (!value) return '0.00';
      const num = parseFloat(value.toString().replace(/[^\d]/g, ''));
      if (isNaN(num)) return '0.00';
      
      if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
      } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
      }
      return num.toLocaleString();
    },

    // 格式化余额显示
    formatBalance(totalSupply) {
      if (!totalSupply) return '0';
      const num = parseFloat(totalSupply.toString().replace(/[^\d]/g, ''));
      if (isNaN(num)) return '0';
      
      if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
      } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
      }
      return num.toLocaleString();
    },

    // 计算已使用百分比
    calculatePercentageUsed() {
      if (!this.tokenDetails.totalSupply || !this.lgeInfo.tokenForLGE) return '0.00';
      
      const totalSupply = parseFloat(this.tokenDetails.totalSupply.replace(/[^\d]/g, ''));
      const tokenForLGE = parseFloat(this.lgeInfo.tokenForLGE.toString().replace(/[^\d]/g, ''));
      
      if (isNaN(totalSupply) || isNaN(tokenForLGE) || totalSupply === 0) return '0.00';
      
      const percentage = (tokenForLGE / totalSupply) * 100;
      return percentage.toFixed(2);
    },

    // 初始化百分比选择器
    initializePercentageSelector() {
      if (this.tokenDetails.totalSupply && this.lgeInfo.tokenForLGE) {
        const totalSupply = parseFloat(this.tokenDetails.totalSupply.replace(/[^\d]/g, ''));
        const tokenForLGE = parseFloat(this.lgeInfo.tokenForLGE.toString().replace(/[^\d]/g, ''));
        
        if (totalSupply > 0 && tokenForLGE > 0) {
          const percentage = (tokenForLGE / totalSupply) * 100;
          
          // 找到最接近的预设百分比
          if (percentage >= 100) {
            this.selectedPercentage = 'Max';
          } else if (percentage >= 75) {
            this.selectedPercentage = 75;
          } else if (percentage >= 50) {
            this.selectedPercentage = 50;
          } else if (percentage >= 25) {
            this.selectedPercentage = 25;
          } else if (percentage >= 10) {
            this.selectedPercentage = 10;
          } else {
            this.selectedPercentage = 10;
          }
        }
      }
    },

    // === 时间处理方法 ===

    onStartDateChange() {
      this.validateStartDate()
      this.updateDurationFromDates()
    },

    onEndDateChange() {
      this.validateEndDate()
      this.updateDurationFromDates()
    },

    updateDurationFromDates() {
      if (this.lgeInfo.startDate && this.lgeInfo.endDate) {
        const calculatedDays = this.calculatedDuration
        if (calculatedDays > 0) {
          this.lgeInfo.duration = calculatedDays
        }
      }
    },

    formatDisplayTime(dateTimeString) {
      if (!dateTimeString) {
        return '--'
      }

      try {
        const date = new Date(dateTimeString)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')

        // 计算距离现在的时间差
        const now = new Date()
        const diffMs = date.getTime() - now.getTime()
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))

        let timeInfo = ''
        if (diffDays > 0) {
          timeInfo = `(${diffDays}d ${diffHours % 24}h)`
        } else if (diffHours > 0) {
          timeInfo = `(${diffHours}h)`
        } else {
          timeInfo = '(已过期)'
        }

        return `${year}/${month}/${day} ${hours}:${minutes}${timeInfo}`
      } catch (error) {
        return '--'
      }
    },

    validateStartDate() {
      if (!this.lgeInfo.startDate) {
        this.validationErrors.startDate = '请选择开始时间'
      } else {
        const startTime = new Date(this.lgeInfo.startDate).getTime()
        const minTime = Date.now() + (this.developmentConfig.minStartTimeMinutes * 60 * 1000)

        // 在开发模式下，如果minStartTimeMinutes为0，则允许任何时间
        if (this.developmentConfig.isDev && this.developmentConfig.minStartTimeMinutes === 0) {
          this.validationErrors.startDate = ''
        } else if (startTime < minTime) {
          const modeText = this.developmentConfig.isDev ? '开发模式' : '生产模式'
          this.validationErrors.startDate = `开始时间必须至少在当前时间${this.developmentConfig.minStartTimeMinutes}分钟之后 (${modeText})`
        } else {
          this.validationErrors.startDate = ''
        }
      }
    },

    validateEndDate() {
      this.validationErrors.endDate = ''

      if (!this.lgeInfo.endDate) {
        this.validationErrors.endDate = '请选择结束时间'
        return
      }

      const endTime = new Date(this.lgeInfo.endDate)
      const now = new Date()

      // 检查结束时间是否在未来
      if (endTime <= now) {
        this.validationErrors.endDate = '结束时间必须在当前时间之后'
        return
      }

      // 检查结束时间是否晚于开始时间
      if (this.lgeInfo.startDate) {
        const startTime = new Date(this.lgeInfo.startDate)
        if (endTime <= startTime) {
          this.validationErrors.endDate = '结束时间必须晚于开始时间'
          return
        }

        // 检查持续时间是否在有效范围内
        const diffMs = endTime.getTime() - startTime.getTime()
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays < 7) {
          this.validationErrors.endDate = '预售持续时间不能少于7天'
          return
        }

        if (diffDays > 90) {
          this.validationErrors.endDate = '预售持续时间不能超过90天'
          return
        }
      }
    },

    // 增强的字段验证
    validateAllFields() {
      // 步骤1字段验证
      this.validateName()
      this.validateSymbol()
      this.validateTotalSupply()
      this.validateDescription()
      this.validateWebsite()
      this.validateTelegram()
      this.validateTwitter()

      // 步骤2字段验证
      this.validateTokenForLGE()
      this.validateHardCap()
      this.validateSoftCap()
      this.validateMaxBuy()
      this.validateRate()
      this.validateStartDate()
      this.validateEndDate()
    },

    // 安全的数值转换方法，避免科学计数法
    safeToWei(value) {
      try {
        // 确保输入是字符串或数字
        const cleanValue = String(value).replace(/[^\d]/g, '')
        if (!cleanValue || cleanValue === '0') {
          return '0'
        }

        // 直接返回清理后的数值，不需要转换为SUN单位
        // token数量应该保持原样，合约会自动处理18位小数精度
        return cleanValue
      } catch (error) {
        console.error('数值转换错误:', error, 'input:', value)
        return '0'
      }
    },

    // 格式化方法
    formatSymbol() {
      this.tokenDetails.symbol = this.tokenDetails.symbol.toUpperCase()
      this.tokenConfig.symbol = this.tokenDetails.symbol
    },

    formatSupply() {
      // 移除非数字字符
      this.tokenDetails.totalSupply = this.tokenDetails.totalSupply.replace(/[^\d]/g, '')
      this.tokenConfig.totalSupply = this.tokenDetails.totalSupply
    },



    /**
     * 加载创建费用
     */
    async loadCreationFee() {
      if (!this.$tronState.isConnected) {
        // 未连接时静默跳过，避免重复错误刷屏
        this.error = null
        this.creationFee = null
        return
      }

      this.loading = true
      this.error = null

      try {
        const fee = await this.$tron.coordinatorFactory.getCreationFee()
        // 显式转换为普通数字，避免在模板渲染时 BigInt 与 Number 混用导致错误
        this.creationFee = typeof fee === 'bigint' ? Number(fee) : Number(fee)
        this.creationFeeUpdatedAt = Date.now()
      } catch (error) {
        this.error = '获取创建费用失败: ' + error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建代币和预售
     */
    async createToken() {
      // 最终验证检查 - 确保所有条件都满足
      if (!this.isStep1Valid) {
        this.error = '请先完善Token详情信息'
        return
      }

      if (!this.isStep2Valid) {
        this.error = '请完善LGE信息'
        return
      }

      // 如果钱包未连接，先尝试连接钱包
      if (!this.$tronState.isConnected) {
        try {
          await this.connectWallet()
          if (!this.$tronState.isConnected) {
            this.error = '请先连接TronLink钱包'
            return
          }
        } catch (error) {
          this.error = `钱包连接失败: ${error.message}`
          return
        }
      }

      // 防止重复提交
      if (this.creating) {
        return
      }

      this.creating = true
      this.error = null
      this.result = null

      try {
        // 确保使用计算出的持续时间
        this.updateDurationFromDates()

        // 验证所有字段
        this.validateAllFields()

        if (!this.isStep1Valid || !this.isStep2Valid) {
          throw new Error('请检查表单输入')
        }

        // 确保预设税率已同步
        if (this.tokenDetails.tokenomicPreset) {
          const preset = this.presets.find(p => p.key === this.tokenDetails.tokenomicPreset)
          if (preset) {
            this.tokenConfig.feeBuy = preset.buy * 100 // 转换为基点
            this.tokenConfig.feeSell = preset.sell * 100 // 转换为基点
          }
        }

        // 准备代币配置
        const tokenConfig = {
          name: this.tokenDetails.name.trim(),
          symbol: this.tokenDetails.symbol.trim().toUpperCase(),
          totalSupply: this.safeToWei(this.tokenDetails.totalSupply),
          feeBuy: this.tokenConfig.feeBuy || 50, // 默认0.5% = 50基点
          feeSell: this.tokenConfig.feeSell || 50, // 默认0.5% = 50基点
          feeRecipient: this.tokenConfig.feeRecipient || this.$tronState.currentAccount,
          // 默认高级参数
          lpBurnEnabled: false,
          lpBurnFrequency: 0,
          percentForLPBurn: 0,
          burnLimit: 0,
          protectTime: 0,
          protectFee: 0,
          isInsideSell: false,
          swapThreshold: 0
        }

        console.log('创建简单代币配置:', tokenConfig)

        // 调用创建方法（仅创建代币，不创建预售）
        const txOptions = {}
        if (this.creationFee != null) {
          txOptions.callValue = this.creationFee
        }

        // 根据LGE信息配置预售参数
        const presaleConfig = {
          presaleEthAmount: this.safeToWei(this.lgeInfo.rate),                    // 预售价格（每TRX可买代币数量）
          tradeEthAmount: this.safeToWei((parseFloat(this.lgeInfo.rate) * 0.5).toString()), // 内场交易价格（预售价格的一半）
          maxTotalNum: Number(this.lgeInfo.hardCap),                              // Hard cap
          presaleMaxNum: Number(this.lgeInfo.maxBuy),                             // Max buy per wallet
          marketDisAmount: this.lgeInfo.tokenForLGE,                             // 使用LGE代币数量
          // LP分配参数
          userLPShare: Math.round((100 - this.lgeInfo.devShare) * 100), // 用户LP份额（基点）
          devLPShare: Math.round(this.lgeInfo.devShare * 100),          // 开发团队LP份额（基点）
          devLPReceiver: this.$tronState.currentAccount,                // 开发团队接收地址
          lpDistributionEnabled: this.lgeInfo.devShare > 0,             // 是否启用LP分配
          // LGE集成参数
          startTime: Math.floor(new Date(this.lgeInfo.startDate).getTime() / 1000), // 开始时间
          hardcap: this.safeToWei(this.lgeInfo.hardCap),               // 硬顶限制
          maxBuyPerWallet: this.safeToWei(this.lgeInfo.maxBuy),        // 每个钱包最大购买量
          // Vesting参数
          vestingDelay: this.lgeInfo.vestingDelay * 24 * 60 * 60,      // Vesting延迟（秒）
          vestingRate: this.lgeInfo.vestingRate,                       // Vesting比例
          vestingEnabled: this.lgeInfo.vestingDelay > 0 && this.lgeInfo.vestingRate > 0, // 是否启用Vesting
          // Backing参数
          backingShare: this.lgeInfo.backingShare,                     // Backing份额
          backingReceiver: this.$tronState.currentAccount              // Backing接收地址
        }

        const result = await this.$createTokenAndPresale(tokenConfig, presaleConfig, txOptions)

        this.result = result
        this.$emit('created', result)

      } catch (error) {
        this.error = this.getErrorMessage(error)
        this.$emit('error', error)
      } finally {
        this.creating = false
      }
    },





    /**
     * 复制地址
     */
    async copyAddress(address) {
      try {
        await navigator.clipboard.writeText(address)
        if (this.$message) {
          this.$message.success('地址已复制')
        }
      } catch (error) {
        console.error('复制失败:', error)
      }
    },

    /**
     * 时间格式化
     */
    formatTime(ts) {
      const d = new Date(ts)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    },

    handleDragLeave(event) {
      event.preventDefault()
      this.ui.isDragOver = false
    },

    handleDrop(event) {
      event.preventDefault()
      this.ui.isDragOver = false

      const files = event.dataTransfer.files
      if (files.length > 0) {
        this.processLogoFile(files[0])
      }
    },

    processLogoFile(file) {
      // 重置错误状态
      this.validationErrors.logo = ''

      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        this.validationErrors.logo = '请选择 JPEG、PNG、WEBP 或 GIF 格式的图片'
        return
      }

      // 验证文件大小 (4MB = 4 * 1024 * 1024 bytes)
      const maxSize = 4 * 1024 * 1024
      if (file.size > maxSize) {
        this.validationErrors.logo = '图片大小不能超过 4MB'
        return
      }

      // 创建预览
      const reader = new FileReader()
      reader.onload = (e) => {
        this.ui.logoPreview = e.target.result
        this.ui.logoFile = file
      }
      reader.onerror = () => {
        this.validationErrors.logo = '图片读取失败，请重试'
      }
      reader.readAsDataURL(file)
    },

    removeLogo() {
      this.ui.logoFile = null
      this.ui.logoPreview = ''
      this.validationErrors.logo = ''
      if (this.$refs.logoInput) {
        this.$refs.logoInput.value = ''
      }
    },

    // 预设相关方法
    getPresetDescription(key) {
      const descriptions = {
        meme: '适合社区驱动的模因代币，低税率鼓励交易活跃度',
        utility: '平衡的实用代币设置，适合有实际用途的项目',
        defi: '适合 DeFi 协议代币，较高税率支持协议发展',
        gaming: '专为游戏项目设计，中等税率平衡游戏经济',
        nft: '适合 NFT 项目，支持创作者和平台收益分配'
      }
      return descriptions[key] || ''
    },

    // Tab 切换相关方法
    switchTab(tabName) {
      if (this.ui.activeTab === tabName) return

      // 切换前同步数据
      this.syncTabData(this.ui.activeTab, tabName)

      // 执行切换
      this.ui.activeTab = tabName

      // 如果切换到高级模式，重置到第一步
      if (tabName === 'Advanced') {
        this.ui.advancedStep = 1
      }

      // 切换后验证数据一致性
      this.$nextTick(() => {
        this.validateTabDataConsistency()
      })
    },

    /**
     * 跳转到高级代币创建页面
     */
    navigateToFeeSettings() {
      // 确保预设税率已同步到tokenConfig
      if (this.ui.simplePreset) {
        const preset = this.presets.find(p => p.key === this.ui.simplePreset)
        if (preset) {
          this.tokenConfig.feeBuy = preset.buy
          this.tokenConfig.feeSell = preset.sell
        }
      }

      // 准备代币配置数据
      const tokenConfig = {
        name: this.tokenConfig.name.trim(),
        symbol: this.tokenConfig.symbol.trim().toUpperCase(),
        totalSupply: this.tokenConfig.totalSupply.trim(),
        feeBuy: this.tokenConfig.feeBuy || 0.5, // 默认0.5%
        feeSell: this.tokenConfig.feeSell || 0.5, // 默认0.5%
        feeRecipient: this.tokenConfig.feeRecipient || this.$tronState.currentAccount,
        description: this.ui.description?.trim() || '',
        website: this.ui.website?.trim() || '',
        telegram: this.ui.telegram?.trim() || '',
        twitter: this.ui.twitter?.trim() || '',
        logoFile: this.ui.logoFile,
        logoPreview: this.ui.logoPreview,
        simplePreset: this.ui.simplePreset
      }

      console.log('传递代币配置到高级创建页面:', tokenConfig)

      // 跳转到高级代币创建页面，传递代币配置
      this.$router.push({
        name: 'advancedTokenCreation',
        params: { tokenConfig }
      })
    },

    syncTabData(fromTab, toTab) {
      if (fromTab === 'Simple' && toTab === 'Advanced') {
        // Simple -> Advanced: 确保预设税率同步到 Advanced 的详细设置
        if (this.ui.simplePreset) {
          const preset = this.presets.find(p => p.key === this.ui.simplePreset)
          if (preset) {
            // 同步总税率
            this.buyTaxTotal = preset.buy
            this.sellTaxTotal = preset.sell

            // 重新分配税率到各个项目（保持比例）
            this.redistributeTaxes()
          }
        }
      } else if (fromTab === 'Advanced' && toTab === 'Simple') {
        // Advanced -> Simple: 根据当前税率总和找到最接近的预设
        const currentBuyTotal = this.buyTaxTotal
        const currentSellTotal = this.sellTaxTotal

        // 查找最接近的预设
        let closestPreset = this.presets[0]
        let minDifference = Math.abs(closestPreset.buy - currentBuyTotal) + Math.abs(closestPreset.sell - currentSellTotal)

        this.presets.forEach(preset => {
          const difference = Math.abs(preset.buy - currentBuyTotal) + Math.abs(preset.sell - currentSellTotal)
          if (difference < minDifference) {
            minDifference = difference
            closestPreset = preset
          }
        })

        // 如果差异很小，自动选择预设；否则清空预设选择
        if (minDifference <= 1) {
          this.ui.simplePreset = closestPreset.key
        } else {
          this.ui.simplePreset = ''
        }
      }
    },

    redistributeTaxes() {
      // 重新分配税率，保持各项目的相对比例
      // 计算当前总税率（排除协议费用）
      const currentBuyTotal = this.taxes.reduce((sum, tax) => sum + Number(tax.buy || 0), 0)
      const currentSellTotal = this.taxes.reduce((sum, tax) => sum + Number(tax.sell || 0), 0)

      // 目标税率（排除协议费用）
      const targetBuyTotal = Math.max(0, this.buyTaxTotal - this.ui.protocolFee.buy)
      const targetSellTotal = Math.max(0, this.sellTaxTotal - this.ui.protocolFee.sell)

      if (currentBuyTotal > 0 && targetBuyTotal > 0) {
        this.taxes.forEach(tax => {
          const ratio = Number(tax.buy || 0) / currentBuyTotal
          tax.buy = Math.round(targetBuyTotal * ratio * 2) / 2 // 保持 0.5% 步长
        })
      }

      if (currentSellTotal > 0 && targetSellTotal > 0) {
        this.taxes.forEach(tax => {
          const ratio = Number(tax.sell || 0) / currentSellTotal
          tax.sell = Math.round(targetSellTotal * ratio * 2) / 2 // 保持 0.5% 步长
        })
      }
    },

    validateTabDataConsistency() {
      // 验证数据一致性，确保 tokenConfig 中的值与当前显示一致
      const expectedBuyTax = this.buyTaxTotal
      const expectedSellTax = this.sellTaxTotal

      // 同步税率到 tokenConfig（避免直接赋值给计算属性）
      if (Math.abs(this.tokenConfig.feeBuy - expectedBuyTax) > 0.1) {
        this.tokenConfig.feeBuy = expectedBuyTax
      }

      if (Math.abs(this.tokenConfig.feeSell - expectedSellTax) > 0.1) {
        this.tokenConfig.feeSell = expectedSellTax
      }
    },

    /**
     * 获取错误消息
     */
    getErrorMessage(error) {
      if (error.message?.includes('insufficient balance')) {
        return '余额不足，请确保有足够的TRX支付创建费用和Gas费'
      } else if (error.message?.includes('revert')) {
        return '交易被拒绝，请检查参数是否正确'
      } else {
        return error.message || '创建失败'
      }
    }
  }
}
</script>

<style scoped>
.token-creator {
  /* CSS变量定义 - 基于UI设计图规范 */
  --bg-primary: #0B0F1A;
  --bg-secondary: #0A0E18;
  --panel-bg: rgba(19, 24, 33, 0.72);
  --panel-border: rgba(255, 255, 255, 0.08);
  --panel-border-hover: rgba(255, 255, 255, 0.15);
  --panel-blur: 10px;

  --text-primary: #E6EDF3;
  --text-secondary: #8A93A1;
  --text-muted: #6B7280;

  --primary: #6E7CFF;
  --primary-light: #8B9AFF;
  --accent: #2BD4FF;
  --accent-light: #5CE1FF;
  --accent-hover: #1DB4E8;

  /* 按钮渐变色彩 - 基于UI设计图 */
  --gradient-primary-start: #8B5CF6;
  --gradient-primary-end: #2BD4FF;
  --gradient-primary-hover-start: #7C3AED;
  --gradient-primary-hover-end: #1DB4E8;

  --success: #16C784;
  --success-light: #34D399;
  --danger: #FF4D4F;
  --danger-light: #FF6B6B;
  --warning: #F59E0B;

  /* 间距规范 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 32px;

  /* 圆角规范 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* 字体规范 */
  --font-xs: 10px;
  --font-sm: 12px;
  --font-base: 14px;
  --font-lg: 16px;
  --font-xl: 18px;
  --font-2xl: 24px;
  --font-3xl: 28px;

  min-height: 100vh;
  color: var(--text-primary);
  background:
    radial-gradient(1200px 600px at -10% -20%, rgba(110, 124, 255, 0.15), transparent 60%),
    radial-gradient(1200px 600px at 110% -10%, rgba(43, 212, 255, 0.12), transparent 60%),
    linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  background-attachment: fixed;
}

/* 顶部导航栏 */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(11, 15, 26, 0.95);
  backdrop-filter: blur(var(--panel-blur));
  border-bottom: 1px solid var(--panel-border);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-2xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  font-size: var(--font-xl);
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--text-primary);
}

/* 主要内容区域 - 移动端优化 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  min-height: 100vh;
}

@media (min-width: 768px) {
  .main-content {
    padding: var(--spacing-xl);
  }
}

@media (min-width: 1024px) {
  .main-content {
    padding: var(--spacing-2xl);
  }
}

/* 页面标题和Tab切换器 */
.page-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.main-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-2xl) 0;
  line-height: 1.2;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 步骤指示器 */
.step-indicator {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-2xl);
}

.step-container {
  display: flex;
  align-items: center;
  gap: 0;
  position: relative;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  position: relative;
  z-index: 2;
}

.step-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4a5568;
  transition: all 0.3s ease;
  position: relative;
}

.step.active .step-dot {
  background: #8b5cf6;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
}

.step.completed .step-dot {
  background: #8b5cf6;
}

.step-label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #9ca3af;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.step.active .step-label {
  color: #ffffff;
}

.step-connector {
  width: 150px;
  height: 2px;
  background: #4a5568;
  position: relative;
  margin: 0 -10px;
  z-index: 1;
}

.step.active ~ .step .step-connector {
  background: #8b5cf6;
}

/* Tab切换器（保留用于兼容性） */
.tab-switcher {
  display: inline-flex;
  gap: var(--spacing-xs);
  background: rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xs);
  border: 1px solid var(--panel-border);
  position: relative;
}

.tab-switcher .tab {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-2xl);
  border-radius: var(--radius-md);
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: var(--font-base);
  position: relative;
  z-index: 2;
  text-align: center;
  min-width: 120px;
}

.tab-switcher .tab:hover {
  color: var(--text-primary);
}

.tab-switcher .tab.active {
  color: white;
}

.tab-indicator {
  position: absolute;
  top: var(--spacing-xs);
  left: var(--spacing-xs);
  bottom: var(--spacing-xs);
  width: calc(50% - var(--spacing-xs));
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: var(--radius-md);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  box-shadow: 0 2px 8px rgba(43, 212, 255, 0.3);
}

.tab-indicator.advanced {
  transform: translateX(100%);
}

/* 状态横幅 */
.status-banner {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--panel-border);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.status-banner:hover {
  border-color: var(--panel-border-hover);
}

.status-banner .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
}

.status-banner.off .dot {
  background: var(--danger);
}

.status-banner .addr {
  color: var(--text-secondary);
  font-family: ui-monospace, monospace;
  font-size: var(--font-sm);
}

/* 双栏布局容器 - 移动端优先 */
.layout-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

@media (min-width: 768px) {
  .layout-container {
    grid-template-columns: 2fr 1fr;
    gap: var(--spacing-xl);
  }
}

@media (min-width: 1024px) {
  .layout-container {
    grid-template-columns: 3fr 2fr;
    gap: var(--spacing-2xl);
  }
}

/* 主列和侧边栏 */
.main-column,
.sidebar {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
/* 配置区域样式 - 移动端优化 */
.config-section {
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(var(--panel-blur));
  background: var(--panel-bg);
  transition: all 0.2s ease;
}

.config-section:hover {
  border-color: var(--panel-border-hover);
}

@media (min-width: 768px) {
  .config-section {
    padding: var(--spacing-xl);
    border-radius: var(--radius-xl);
  }
}

/* 表单组件样式 - 移动端优化 */
.form-group {
  margin-bottom: var(--spacing-lg);
}

@media (min-width: 768px) {
  .form-group {
    margin-bottom: var(--spacing-xl);
  }
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-base);
  position: relative;
}

.char-count {
  float: right;
  color: var(--text-secondary);
  font-size: var(--font-sm);
  font-weight: normal;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(43, 212, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
}

.form-input.error,
.form-textarea.error {
  border-color: var(--danger);
  background: rgba(255, 77, 79, 0.1);
  animation: shake 0.3s ease-in-out;
}

.form-input.error:focus,
.form-textarea.error:focus {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

/* Logo上传器样式 */
.logo-group {
  margin-bottom: var(--spacing-2xl);
}

.logo-uploader {
  width: 120px;
  height: 120px;
  border: 2px dashed var(--panel-border);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.logo-uploader:hover {
  border-color: var(--accent);
  background: rgba(43, 212, 255, 0.1);
  transform: translateY(-2px);
}

.logo-uploader.drag-over {
  border-color: var(--accent);
  background: rgba(43, 212, 255, 0.15);
  transform: scale(1.02);
}

.logo-uploader.has-image {
  border-style: solid;
  border-color: var(--panel-border-hover);
}

.logo-uploader.error {
  border-color: var(--danger);
  background: rgba(255, 77, 79, 0.1);
}

/* Logo占位符样式 */
.logo-placeholder {
  text-align: center;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.upload-icon {
  color: var(--text-muted);
  opacity: 0.7;
}

.upload-text {
  font-size: var(--font-sm);
  font-weight: 500;
}

.upload-hint {
  font-size: var(--font-xs);
  opacity: 0.8;
  line-height: 1.3;
}

/* Logo预览样式 */
.logo-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: calc(var(--radius-lg) - 2px);
}

.logo-overlay {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: calc(var(--radius-lg) - 2px);
}

.logo-uploader:hover .logo-overlay {
  opacity: 1;
}

.remove-btn {
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: var(--danger-light);
  transform: scale(1.1);
}
.simple-config select {
  width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px; background: rgba(255,255,255,.04); color: var(--text);
}
.simple-config textarea {
  width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px; background: rgba(255,255,255,.04); color: var(--text);
  resize: vertical; min-height: 80px;
}

/* 动画和过渡效果 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 错误和提示文本样式 */
.error-text {
  color: var(--danger);
  font-size: var(--font-sm);
  margin-top: var(--spacing-xs);
  display: block;
  animation: fadeIn 0.2s ease-in-out;
}

.hint-text {
  color: var(--text-secondary);
  font-size: var(--font-sm);
  margin-top: var(--spacing-xs);
  display: block;
}

/* 页面切换动画 */
.config-section {
  animation: slideIn 0.3s ease-out;
}

/* 悬停效果增强 */
.form-input:hover,
.form-textarea:hover {
  border-color: var(--panel-border-hover);
  background: rgba(255, 255, 255, 0.06);
}

.tax-btn:active {
  transform: scale(0.95);
}

.toggle-switch:hover .toggle-slider {
  background: rgba(255, 255, 255, 0.3);
}

.toggle-switch input:checked:hover + .toggle-slider {
  background: var(--success-light);
}

/* 加载状态动画 */
.action-btn:disabled {
  position: relative;
  overflow: hidden;
}

.action-btn:disabled::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* 自定义下拉框样式 */
.custom-dropdown {
  position: relative;
  width: 100%;
}

.dropdown-trigger {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
}

.dropdown-trigger:hover {
  border-color: var(--accent);
  background: rgba(43, 212, 255, 0.05);
}

.dropdown-trigger.selected {
  border-color: var(--accent);
  background: rgba(43, 212, 255, 0.1);
}

.custom-dropdown.open .dropdown-trigger {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(43, 212, 255, 0.2);
}

.trigger-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.selected-preset {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.preset-text {
  font-size: var(--font-base);
  color: var(--text-primary);
}

.placeholder {
  color: var(--text-secondary);
  font-size: var(--font-base);
}

.dropdown-arrow {
  color: var(--text-secondary);
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--bg-secondary);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  animation: dropdownFadeIn 0.2s ease;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-option {
  padding: var(--spacing-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.dropdown-option:last-child {
  border-bottom: none;
}

.dropdown-option:hover {
  background: rgba(43, 212, 255, 0.1);
}

.dropdown-option.active {
  background: rgba(43, 212, 255, 0.2);
}

.option-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-label {
  font-size: var(--font-base);
  color: var(--text-primary);
  font-weight: 500;
}

.option-rates {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

/* 颜色点样式 */
.preset-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 表单底部按钮样式 */
.form-bottom-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--panel-border);
}

.create-token-btn {
  flex: 1;
  max-width: 280px;
  min-height: 48px;
  padding: var(--spacing-lg) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-xl);
  font-weight: 600;
  font-size: var(--font-lg);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
}

.create-token-btn.primary {
  background: linear-gradient(135deg, var(--gradient-primary-start), var(--gradient-primary-end));
  color: white;
  box-shadow:
    0 8px 24px rgba(139, 92, 246, 0.4),
    0 4px 12px rgba(43, 212, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.create-token-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--gradient-primary-hover-start), var(--gradient-primary-hover-end));
  transform: translateY(-3px);
  box-shadow:
    0 12px 32px rgba(139, 92, 246, 0.5),
    0 6px 20px rgba(43, 212, 255, 0.4);
}

.create-token-btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  border: 1px solid var(--panel-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.create-token-btn.secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.create-token-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  filter: grayscale(0.3);
}

.create-token-btn:active:not(:disabled) {
  transform: translateY(-1px);
  transition: all 0.1s ease;
}

/* 焦点状态 - 无障碍支持 */
.create-token-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* 按钮文字渐变效果（可选） */
.create-token-btn.primary.gradient-text {
  background: linear-gradient(135deg, var(--gradient-primary-start), var(--gradient-primary-end));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

/* 单个按钮时全宽显示 */
.form-bottom-actions:has(.create-token-btn:only-child) {
  justify-content: stretch;
}

.form-bottom-actions .create-token-btn:only-child {
  max-width: 100%;
  width: 100%;
}



/* 按钮状态提示 */
.button-status-hint {
  margin-top: var(--spacing-sm);
}

.status-hint {
  font-size: var(--font-sm);
  margin: 0;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  text-align: center;
}

.status-hint.wallet {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.status-hint.form {
  background: rgba(108, 117, 125, 0.1);
  color: var(--text-secondary);
  border: 1px solid rgba(108, 117, 125, 0.3);
}





/* 结果页面样式 */
.result-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.result-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* 成功标题 */
.success-header {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.success-header h1 {
  color: var(--accent);
  font-size: 2.5rem;
  margin: 0 0 var(--spacing-md) 0;
  font-weight: 700;
}

.success-header p {
  color: var(--text-secondary);
  font-size: var(--font-lg);
  margin: 0;
  line-height: 1.5;
}

/* 卡片通用样式 */
.token-info-card,
.contracts-card,
.transaction-card {
  background: var(--bg-secondary);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: rgba(43, 212, 255, 0.1);
  border-bottom: 1px solid var(--panel-border);
  padding: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  color: var(--accent);
  font-size: var(--font-xl);
  margin: 0;
  font-weight: 600;
}

.token-logo {
  width: 48px;
  height: 48px;
  background: var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: var(--font-lg);
}

.card-content {
  padding: var(--spacing-lg);
}

/* 代币信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-item .label {
  color: var(--text-secondary);
  font-size: var(--font-sm);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  color: var(--text-primary);
  font-size: var(--font-lg);
  font-weight: 600;
}

/* 合约地址样式 */
.contract-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.contract-item:last-child {
  margin-bottom: 0;
}

.contract-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.contract-label {
  color: var(--text-primary);
  font-weight: 600;
  font-size: var(--font-base);
}

.contract-description {
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.contract-address {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.address-text {
  font-family: 'Courier New', monospace;
  color: var(--accent);
  font-size: var(--font-sm);
  background: rgba(43, 212, 255, 0.1);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.copy-btn,
.copy-btn-small {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-xs);
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover,
.copy-btn-small:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

/* 交易信息网格 */
.transaction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.transaction-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.transaction-hash {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.tx-link {
  color: var(--accent);
  text-decoration: none;
  font-family: 'Courier New', monospace;
  font-size: var(--font-sm);
  background: rgba(43, 212, 255, 0.1);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.tx-link:hover {
  background: rgba(43, 212, 255, 0.2);
  transform: translateY(-1px);
}

/* 操作按钮 */
.result-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--spacing-xl);
}

.result-actions .action-btn {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-base);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.result-actions .action-btn.primary {
  background: linear-gradient(135deg, var(--gradient-primary-start), var(--gradient-primary-end));
  color: white;
  box-shadow:
    0 8px 24px rgba(139, 92, 246, 0.4),
    0 4px 12px rgba(43, 212, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.result-actions .action-btn.primary:hover {
  background: linear-gradient(135deg, var(--gradient-primary-hover-start), var(--gradient-primary-hover-end));
  transform: translateY(-3px);
  box-shadow:
    0 12px 32px rgba(139, 92, 246, 0.5),
    0 6px 20px rgba(43, 212, 255, 0.4);
}

.result-actions .action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 1px solid var(--panel-border);
}

.result-actions .action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--accent);
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .result-page {
    padding: var(--spacing-lg);
  }

  .success-header h1 {
    font-size: 2rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .transaction-grid {
    grid-template-columns: 1fr;
  }

  .contract-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .result-actions {
    flex-direction: column;
  }

  .result-actions .action-btn {
    max-width: none;
  }
}

/* 帮助指南样式 */
.help-guide {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-md);
}

.guide-header h4 {
  color: #4caf50;
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-lg);
  font-weight: 600;
}

.guide-header p {
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-sm);
  line-height: 1.4;
}

.guide-links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.guide-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  text-decoration: none;
  font-size: var(--font-sm);
  transition: all 0.2s ease;
}

.guide-link:hover {
  background: rgba(76, 175, 80, 0.1);
  border-color: #4caf50;
  transform: translateY(-1px);
}

/* 指南弹窗样式 */
.guide-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.guide-modal {
  background: var(--bg-primary);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-lg);
  max-width: 800px;
  max-height: 90vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--panel-border);
}

.modal-header h3 {
  color: var(--accent);
  margin: 0;
  font-size: var(--font-xl);
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-xl);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.guide-content h4 {
  color: var(--accent);
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-lg);
  font-weight: 600;
}

.step-section {
  margin-bottom: var(--spacing-xl);
}

.step-section h5 {
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-base);
  font-weight: 600;
}

.step-section ol,
.step-section ul {
  margin: 0;
  padding-left: var(--spacing-lg);
}

.step-section li {
  margin-bottom: var(--spacing-sm);
  line-height: 1.6;
}

.step-section li strong {
  color: var(--accent);
}

.step-section li p {
  margin: var(--spacing-xs) 0 0 0;
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.step-section a {
  color: var(--accent);
  text-decoration: none;
}

.step-section a:hover {
  text-decoration: underline;
}

.modal-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--panel-border);
  display: flex;
  justify-content: flex-end;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--accent);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .guide-modal-overlay {
    padding: var(--spacing-md);
  }

  .guide-modal {
    max-height: 95vh;
  }

  .modal-content {
    padding: var(--spacing-md);
  }

  .modal-header,
  .modal-footer {
    padding: var(--spacing-md);
  }
}

/* 预设预览样式 */
.preset-preview {
  margin-top: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(var(--panel-blur));
}

.preset-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.preset-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

.preset-label {
  color: var(--text-primary);
  font-weight: 600;
  font-size: var(--font-base);
  flex: 1;
}

.preset-badge {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  font-weight: 500;
}

.preset-description {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  line-height: 1.4;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--accent);
}

/* Advanced页面样式 */
.advanced-config {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* 开关控制区域 */
.toggle-section {
  display: flex;
  gap: var(--spacing-2xl);
  align-items: center;
  padding: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-lg);
  border: 1px solid var(--panel-border);
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background: var(--success);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.toggle-label {
  color: var(--text-primary);
  font-weight: 500;
  font-size: var(--font-base);
}

/* 税率配置卡片 */
.tax-configuration-card {
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(var(--panel-blur));
}

.tax-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.tax-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-lg);
  font-weight: 600;
}

.tax-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: var(--font-base);
  font-weight: 500;
}

.tax-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

.tax-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--spacing-lg);
  align-items: center;
  padding: var(--spacing-sm) 0;
}

.tax-row.protocol-fee {
  opacity: 0.75;
  border-top: 1px solid var(--panel-border);
  padding-top: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.tax-label {
  color: var(--text-primary);
  font-size: var(--font-base);
  font-weight: 500;
}

.tax-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.tax-control.readonly {
  justify-content: center;
}

.tax-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--panel-border);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.tax-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--panel-border-hover);
}

.tax-input {
  width: 60px;
  text-align: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--panel-border);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-xs);
  font-size: var(--font-base);
  font-weight: 500;
}

.tax-summary {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--panel-border);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-base);
}

.summary-item strong {
  color: var(--accent);
  font-weight: 600;
}

/* 信息汇总卡片 */
.info-summary-card {
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(var(--panel-blur));
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  color: var(--text-secondary);
  font-size: var(--font-base);
}

.info-row:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row strong {
  color: var(--text-primary);
  font-weight: 600;
}

.asset-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.trx-badge {
  background: var(--accent);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  font-weight: 600;
}

.asset-info svg {
  color: var(--text-secondary);
}

.layout { display:grid; grid-template-columns: 1fr; gap: 20px; }
@media (min-width: 1024px) { .layout { grid-template-columns: 3fr 2fr; } }
.layout > .col { min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.col.main { gap: 20px; }
.col.side { position: relative; }

/* 侧边栏样式 */
@media (min-width: 1024px) {
  .sidebar {
    position: sticky;
    top: calc(80px + var(--spacing-2xl));
    height: fit-content;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  /* 自定义滚动条样式 */
  .sidebar::-webkit-scrollbar {
    width: 6px;
  }
  .sidebar::-webkit-scrollbar-track {
    background: transparent;
  }
  .sidebar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  .sidebar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

/* 侧边栏卡片 */
.side-card {
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(var(--panel-blur));
  transition: all 0.2s ease;
}

.side-card:hover {
  border-color: var(--panel-border-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}



/* Backing Asset Info */
.backing-asset-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.backing-label {
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.asset-chip {
  background: rgba(255, 255, 255, 0.1);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.trx-icon {
  color: var(--accent);
  font-weight: 600;
  font-size: var(--font-sm);
}

/* 步骤指示器 */
.step-indicator {
  margin-bottom: var(--spacing-xl);
}

.step-progress {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  z-index: 2;
  position: relative;
}

.step-dot.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.step-dot.completed {
  background: var(--success);
  border-color: var(--success);
  color: white;
}

.progress-line {
  position: absolute;
  top: 50%;
  left: 16px;
  right: 16px;
  height: 2px;
  background: var(--success);
  transform: translateY(-50%);
  transition: width 0.3s ease;
  z-index: 1;
}

.step-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-sm);
}

.step-labels span {
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.step-labels span.active {
  color: var(--accent);
  font-weight: 600;
}

/* 步骤内容 */
.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 高级模式操作按钮 */
.advanced-actions {
  display: flex;
  gap: var(--spacing-md);
}

.advanced-actions .action-btn {
  flex: 1;
}





/* 费用卡片 */
.fee-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.fee-card h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-lg);
  font-weight: 600;
}

.refresh-btn {
  background: transparent;
  color: var(--accent);
  border: 1px solid rgba(43, 212, 255, 0.35);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-sm);
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(43, 212, 255, 0.1);
  border-color: var(--accent);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fee-details .fee-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-base);
}

.fee-row.total {
  color: var(--text-primary);
  font-weight: 600;
  border-top: 1px solid var(--panel-border);
  padding-top: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.fee-row strong {
  color: var(--accent);
  font-weight: 600;
}

.connect-prompt {
  color: var(--text-secondary);
  margin: 0;
  text-align: center;
  font-style: italic;
}

.last-updated {
  color: var(--text-muted);
  font-size: var(--font-sm);
  margin: var(--spacing-sm) 0 0;
  text-align: center;
}

.config-section {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid transparent;
  backdrop-filter: blur(var(--panel-blur));
  box-shadow: 0 10px 30px rgba(0,0,0,.25);
  background-image:
    linear-gradient(180deg, rgba(19,24,33,0.92), rgba(19,24,33,0.72)),
    linear-gradient(180deg, rgba(120,80,255,.55), rgba(43,212,255,.45));
  background-origin: padding-box, border-box;
  background-clip: padding-box, border-box;
}

.config-section h3 { margin: 0 0 14px 0; color: var(--text); }

.form-group { margin-bottom: 14px; }

.form-row { display:grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.form-group label {
  display:block; margin-bottom:6px; font-weight: 600; color: var(--text);
}

.form-group input {
  width: 100%; padding: 12px 12px; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px; font-size: 14px; background: rgba(255,255,255,0.04);
  color: var(--text); outline: none; transition: all .2s ease;
}
.form-group input:focus { border-color: rgba(43,212,255,0.55); box-shadow: 0 0 0 3px rgba(43,212,255,0.2); }

.form-group small { display:block; margin-top:6px; color: var(--subtext); font-size:12px; }

/* 操作按钮区域 */
.side-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  position: sticky;
  bottom: var(--spacing-lg);
  z-index: 10;
}

.simple-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.action-btn {
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--font-base);
  font-weight: 600;
  transition: all 0.2s ease;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--gradient-primary-start), var(--gradient-primary-end));
  color: #FFFFFF;
  box-shadow:
    0 8px 24px rgba(139, 92, 246, 0.4),
    0 4px 12px rgba(43, 212, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 48px;
  border-radius: var(--radius-xl);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.action-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--gradient-primary-hover-start), var(--gradient-primary-hover-end));
  transform: translateY(-3px);
  box-shadow:
    0 12px 32px rgba(139, 92, 246, 0.5),
    0 6px 20px rgba(43, 212, 255, 0.4);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  border: 1px solid var(--panel-border);
}

.action-btn.secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--panel-border-hover);
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* 错误和成功卡片 */
.error-card {
  background: rgba(255, 77, 79, 0.15);
  border-color: rgba(255, 77, 79, 0.35);
}

.error-card h4 {
  margin: 0 0 var(--spacing-sm);
  color: var(--danger-light);
  font-size: var(--font-lg);
}

.error-card p {
  margin: 0;
  color: var(--danger-light);
  line-height: 1.5;
}

.success-card {
  background: rgba(22, 199, 132, 0.15);
  border-color: rgba(22, 199, 132, 0.35);
}

.success-card h4 {
  margin: 0 0 var(--spacing-md);
  color: var(--success-light);
  font-size: var(--font-lg);
}

.result-details .result-row {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
}
.tx-link { color: var(--accent); text-decoration: none; }
.tx-link:hover { text-decoration: underline; }

/* 预售按钮样式 */
.presale-actions {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.presale-btn {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.presale-btn.primary {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow:
    0 8px 24px rgba(34, 197, 94, 0.4),
    0 4px 12px rgba(34, 197, 94, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  min-height: 48px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.presale-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #16a34a, #15803d);
  transform: translateY(-3px);
  box-shadow:
    0 12px 32px rgba(34, 197, 94, 0.5),
    0 6px 20px rgba(34, 197, 94, 0.4);
}

.presale-btn.secondary {
  background: linear-gradient(135deg, var(--gradient-primary-start), var(--gradient-primary-end));
  box-shadow:
    0 8px 24px rgba(139, 92, 246, 0.4),
    0 4px 12px rgba(43, 212, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  min-height: 48px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.presale-btn.secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--gradient-primary-hover-start), var(--gradient-primary-hover-end));
  transform: translateY(-3px);
  box-shadow:
    0 12px 32px rgba(139, 92, 246, 0.5),
    0 6px 20px rgba(43, 212, 255, 0.4);
}

.presale-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.presale-hint {
  margin: var(--spacing-sm) 0 0;
  font-size: var(--font-sm);
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 移动端适配 - 按钮并排显示 */
@media (min-width: 480px) {
  .presale-actions {
    flex-direction: row;
    gap: var(--spacing-md);
  }

  .presale-btn {
    flex: 1;
  }
}

.contract-addresses { margin-top: 12px; }
.address-row {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
}
.address-chip {
  display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,.06);
  padding: 4px 8px; border-radius: 8px; cursor: pointer; font-family: ui-monospace, monospace;
  font-size: 12px; border: 1px solid var(--panel-border);
}
.address-chip:hover { background: rgba(255,255,255,.1); }
.copy-icon { opacity: .7; }

/* 响应式适配 */

/* 平板端适配 (768px - 1023px) */
@media (max-width: 1023px) {
  .main-content {
    padding: var(--spacing-lg);
  }

  .layout-container {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }

  .sidebar {
    order: -1;
  }

  .main-title {
    font-size: 1.3rem;
  }

  .tab-switcher .tab {
    min-width: 100px;
    padding: var(--spacing-sm) var(--spacing-lg);
  }

  /* 平板端税率栅格优化 */
  .tax-grid {
    gap: var(--spacing-sm);
  }

  .tax-row {
    grid-template-columns: 1fr auto auto;
    gap: var(--spacing-md);
  }

  .tax-control {
    gap: var(--spacing-xs);
  }

  .tax-btn {
    width: 28px;
    height: 28px;
  }

  .tax-input {
    width: 50px;
  }

  .toggle-section {
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: flex-start;
  }
}

/* 移动端适配 (< 768px) */
@media (max-width: 767px) {
  .token-creator {
    min-height: 100vh;
  }

  .header-content {
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .brand {
    font-size: var(--font-lg);
  }

  .main-content {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .page-header {
    margin-bottom: var(--spacing-xl);
  }

  .main-title {
    font-size: 1.1rem;
    margin-bottom: var(--spacing-lg);
  }

  /* 移动端按钮优化 */
  .create-token-btn {
    min-height: 56px;
    padding: var(--spacing-lg) var(--spacing-xl);
    font-size: 16px; /* 防止iOS缩放 */
    max-width: none;
    width: 100%;
  }

  .action-btn {
    min-height: 56px;
    font-size: 16px; /* 防止iOS缩放 */
    padding: var(--spacing-lg);
  }

  .tab-switcher {
    width: 100%;
  }

  .tab-switcher .tab {
    min-width: auto;
    flex: 1;
    padding: var(--spacing-md);
    font-size: var(--font-base);
  }

  .layout-container {
    gap: var(--spacing-lg);
  }

  .config-section {
    padding: var(--spacing-lg);
  }

  /* 移动端表单优化 */
  .form-group {
    margin-bottom: var(--spacing-lg);
  }

  .form-input,
  .form-textarea,
  .dropdown-trigger {
    font-size: 16px; /* 防止 iOS 缩放 */
  }

  .logo-uploader {
    width: 100px;
    height: 100px;
    margin: 0 auto;
  }

  /* 移动端税率栅格 */
  .tax-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
    text-align: center;
    padding: var(--spacing-md) 0;
  }

  .tax-columns {
    grid-template-columns: 1fr;
    text-align: center;
    gap: var(--spacing-sm);
  }

  .tax-control {
    justify-content: center;
  }

  .tax-btn {
    width: 36px;
    height: 36px;
    font-size: var(--font-lg);
  }

  .tax-input {
    width: 50px;
    font-size: var(--font-lg);
  }

  .tax-summary {
    flex-direction: column;
    gap: var(--spacing-sm);
    text-align: center;
  }

  .toggle-section {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: center;
    text-align: center;
  }

  .toggle-item {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  /* 移动端侧边栏 */
  .sidebar {
    order: -1;
  }

  .side-card {
    padding: var(--spacing-lg);
  }

  .action-btn {
    padding: var(--spacing-lg);
    font-size: var(--font-lg);
    min-height: 56px; /* 移动端友好的触摸目标 */
  }

  .side-actions {
    position: static; /* 移动端不使用粘性定位 */
    margin-top: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: rgba(11, 15, 26, 0.95);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    border-top: 1px solid var(--panel-border);
  }

  /* 移动端信息卡片 */
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .asset-info {
    align-self: flex-end;
  }

  /* 移动端步骤指示器 */
  .step-indicator {
    margin-bottom: var(--spacing-lg);
  }

  .step-connector {
    width: 100px;
  }

  .step-dot {
    width: 16px;
    height: 16px;
  }

  .step-label {
    font-size: 0.75rem;
  }

  /* 移动端高级模式操作按钮 */
  .advanced-actions {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .advanced-actions .action-btn {
    width: 100%;
    order: 2; /* Next/Create 按钮在下方 */
  }

  .advanced-actions .action-btn.secondary {
    order: 1; /* Back 按钮在上方 */
    background: transparent;
    border: 1px solid var(--panel-border);
    color: var(--text-secondary);
  }



  /* 移动端backing asset */
  .backing-asset-info {
    padding: var(--spacing-md);
    margin-top: var(--spacing-md);
  }

  .backing-label {
    font-size: var(--font-sm);
  }

  /* 移动端预售配置 */
  .presale-config-section h3 {
    font-size: var(--font-lg);
    margin-bottom: var(--spacing-lg);
    text-align: center;
  }

  .form-row {
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  /* 移动端信息汇总卡片 */
  .info-summary-card h4 {
    font-size: var(--font-lg);
    margin-bottom: var(--spacing-md);
    text-align: center;
  }
}

/* Enhanced tax control styles */
.enhanced-control {
  position: relative;
}

.enhanced-control .tax-input.editable {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--accent-color);
  color: var(--text-primary);
  cursor: text;
}

.enhanced-control .tax-input.editable:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.enhanced-control .tax-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
}

.enhanced-control .tax-btn:not(:disabled):hover {
  background: var(--accent-color);
  transform: scale(1.05);
}

.tax-hint {
  grid-column: 1 / -1;
  margin-top: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(52, 152, 219, 0.1);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--accent-color);
}

.tax-hint .hint-text {
  color: var(--text-secondary);
  font-size: var(--font-xs);
  line-height: 1.4;
}

/* LP Distribution Styles */
.lp-distribution-section {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-lg);
  border: 1px solid var(--panel-border);
}

.lp-distribution-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.lp-distribution-section h3 {
  color: var(--text-primary);
  font-size: var(--font-lg);
  font-weight: 600;
  margin: 0;
}

.lp-config-content {
  animation: fadeIn 0.3s ease-in-out;
}

.lp-preview {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: rgba(52, 152, 219, 0.1);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent-color);
}

.lp-preview h4 {
  color: var(--text-primary);
  font-size: var(--font-md);
  margin: 0 0 var(--spacing-sm) 0;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) 0;
  color: var(--text-secondary);
}

.preview-row.total {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: var(--spacing-xs);
  padding-top: var(--spacing-sm);
  font-weight: 600;
}

.preview-row.total.error {
  color: var(--error-color);
}

.preview-row strong {
  color: var(--text-primary);
}

.lp-disabled-hint {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive enhancements for mobile */
@media (max-width: 768px) {
  .enhanced-control .tax-input {
    min-width: 60px;
    font-size: var(--font-sm);
  }

  .enhanced-control .tax-btn {
    min-width: 32px;
    height: 32px;
    font-size: var(--font-sm);
  }

  .tax-hint {
    margin-top: var(--spacing-sm);
    padding: var(--spacing-sm);
  }

  .lp-distribution-section .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .lp-preview {
    padding: var(--spacing-sm);
  }
}

/* === 步骤2：LGE信息样式 === */

.vesting-config,
.share-config {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-md);
  border: 1px solid var(--panel-border);
}

.vesting-row,
.share-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.vesting-row label,
.share-row label {
  flex: 1;
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.vesting-row .form-input,
.share-row .form-input {
  flex: 1;
  max-width: 120px;
}

.button-group {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.button-group .create-token-btn {
  flex: 1;
}

.button-group .create-token-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 1px solid var(--panel-border);
}

.button-group .create-token-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--primary);
}

/* === LGE Configuration Styles === */
.lge-configuration-section {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-lg);
  border: 1px solid var(--panel-border);
}

.lge-configuration-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.lge-configuration-section h3 {
  color: var(--text-primary);
  font-size: var(--font-lg);
  font-weight: 600;
  margin: 0;
}

.lge-config-content {
  animation: fadeIn 0.3s ease-in-out;
}

.config-subsection {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.01);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent-color);
}

.config-subsection h4 {
  color: var(--text-primary);
  font-size: var(--font-md);
  margin: 0 0 var(--spacing-md) 0;
}

.subsection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.range-input {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-color);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.range-input::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-color);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.range-display {
  text-align: center;
  margin-top: var(--spacing-xs);
  font-weight: 600;
  color: var(--accent-color);
  font-size: var(--font-sm);
}

.lge-preview {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: rgba(52, 152, 219, 0.1);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent-color);
}

.lge-preview h4 {
  color: var(--text-primary);
  font-size: var(--font-md);
  margin: 0 0 var(--spacing-sm) 0;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-sm);
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) 0;
  color: var(--text-secondary);
}

.preview-item strong {
  color: var(--text-primary);
}

.lge-disabled-hint {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
}

.vesting-config,
.backing-config {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-sm);
}

/* Responsive LGE styles */
@media (max-width: 768px) {
  .lge-configuration-section .section-header,
  .subsection-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .config-subsection {
    padding: var(--spacing-sm);
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }

  .range-input {
    height: 8px;
  }

  .range-input::-webkit-slider-thumb {
    width: 24px;
    height: 24px;
  }

  .range-input::-moz-range-thumb {
    width: 24px;
    height: 24px;
  }
}

/* 新的高级表单字段样式 */
.advanced-form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-md) 0;
}

.advanced-form-fields .form-group {
  margin-bottom: 0;
}

.advanced-form-fields .form-label {
  font-size: var(--font-md);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  display: block;
}

.advanced-form-fields .form-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  font-size: var(--font-md);
  transition: all 0.2s ease;
}

.advanced-form-fields .form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(43, 212, 255, 0.2);
  outline: none;
}

.advanced-form-fields .form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* 带后缀的输入框 */
.input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-suffix .form-input {
  padding-right: 40px;
}

.input-suffix {
  position: absolute;
  right: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: var(--font-md);
  pointer-events: none;
}

/* 带图标的输入框 */
.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon .form-input {
  padding-right: 40px;
}

.input-icon {
  position: absolute;
  right: 16px;
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
}

/* 全宽按钮 */
.create-token-btn.full-width {
  width: 100%;
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-lg);
  font-weight: 600;
  border-radius: var(--radius-xl);
  margin-top: var(--spacing-lg);
  min-height: 56px;
}

/* 按钮加载状态动画增强 */
.create-token-btn:disabled::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: buttonLoading 1.5s infinite;
}

@keyframes buttonLoading {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* 按钮脉冲动画 - 用于重要CTA */
.create-token-btn.pulse::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, var(--gradient-primary-start), var(--gradient-primary-end));
  opacity: 0.7;
  animation: buttonPulse 2s infinite;
  z-index: -1;
}

@keyframes buttonPulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

/* 按钮成功状态动画 */
.create-token-btn.success {
  background: linear-gradient(135deg, #22c55e, #16a34a) !important;
  animation: successPulse 0.6s ease-out;
}

@keyframes successPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* 提示文本样式 */
.advanced-form-fields .hint-text {
  font-size: var(--font-sm);
  color: rgba(255, 255, 255, 0.6);
  margin-top: var(--spacing-xs);
  display: block;
}

.advanced-form-fields .error-text {
  font-size: var(--font-sm);
  color: var(--danger);
  margin-top: var(--spacing-xs);
  display: block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .advanced-form-fields {
    gap: var(--spacing-md);
    padding: var(--spacing-sm) 0;
  }

  .advanced-form-fields .form-input {
    padding: 12px 14px;
    font-size: 16px; /* 防止iOS缩放 */
  }

  .input-with-suffix .form-input,
  .input-with-icon .form-input {
    padding-right: 36px;
  }

  .input-suffix,
  .input-icon {
    right: 14px;
  }
}

/* === 时间设置样式 === */
.datetime-container {
  position: relative;
  display: flex;
  align-items: center;
}

.datetime-input {
  flex: 1;
  padding-right: 40px !important;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
}

.datetime-input:focus {
  border-color: #00d4ff;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
}

.datetime-icon {
  position: absolute;
  right: 12px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
}

/* 时间汇总显示样式 */
.time-summary-container {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-top: 4px;
}

.time-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.time-summary-row:last-child {
  border-bottom: none;
}

.time-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
}

.time-value {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.duration-value {
  color: #00d4ff;
  font-size: 16px;
  font-weight: 700;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .time-summary-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .time-value {
    font-size: 13px;
  }

  .duration-value {
    font-size: 15px;
  }
}

/* Token输入容器样式 */
.token-input-container {
  background: rgba(19, 24, 33, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.token-input-container:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

.token-input-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
}

.token-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #E6EDF3;
}

.token-icon svg {
  color: #2BD4FF;
}

.token-name {
  font-weight: 600;
  font-size: 14px;
  color: #E6EDF3;
}

.token-amount {
  display: flex;
  align-items: center;
}

.amount-value {
  font-size: 16px;
  font-weight: 700;
  color: #E6EDF3;
}

.balance-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 12px;
  color: #8A93A1;
}

.balance-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.percentage-used {
  color: #E6EDF3;
  font-weight: 500;
}

.percentage-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.percentage-btn {
  flex: 1;
  min-width: 60px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: transparent;
  color: #8A93A1;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.percentage-btn:hover {
  border-color: #2BD4FF;
  color: #2BD4FF;
}

.percentage-btn.active {
  background: linear-gradient(135deg, #6E7CFF, #2BD4FF);
  border-color: #2BD4FF;
  color: white;
  box-shadow: 0 2px 8px rgba(43, 212, 255, 0.3);
}

.percentage-btn.active:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(43, 212, 255, 0.4);
}


</style>