<template>
  <div class="launch-rwa">
    <!-- 顶部操作区域 -->
    <div class="top-section">
      <!-- 左侧四个点菜单按钮 -->
      <div class="menu-button" @click="handleMenuClick">
        <div class="dots-container">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>

      <!-- 右侧区域：Launch按钮和募资信息 -->
      <div class="right-section">
        <!-- Launch RWA按钮 -->
        <div class="launch-button-container">
          <button class="launch-button" @click="handleLaunchClick">
            Launch RWA
          </button>
        </div>

        <!-- 募资信息 -->
        <div class="fundraising-info">
          <div class="fundraising-label">Fundraising</div>
          <div class="fundraising-amount">
            <span class="amount">2300</span>
            <span class="currency">TRX</span>
            <div class="tron-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FF0000"/>
                <path d="M2 17L12 22L22 17" fill="#FF0000"/>
                <path d="M2 12L12 17L22 12" fill="#FF0000"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 轮播图卡片 - 精确匹配参考图 -->
    <div class="carousel-card">
      <!-- 左侧科技感城市夜景图片 -->
      <div class="city-image">
        <div class="tech-city-bg">
          <!-- 科技感城市夜景插画 -->
          <div class="city-buildings">
            <div class="building building-1"></div>
            <div class="building building-2"></div>
            <div class="building building-3"></div>
            <div class="building building-4"></div>
          </div>
          <div class="neon-effects">
            <div class="neon-line"></div>
            <div class="neon-glow"></div>
          </div>
          <div class="tech-elements">
            <div class="circuit-pattern"></div>
            <div class="data-stream"></div>
          </div>
        </div>
      </div>

      <!-- 右侧文字内容 -->
      <div class="content-text">
        <div class="project-description">
          TRX PUMP and CHOU launch the first Chinese celebrity coin: CHOU
        </div>
      </div>

      <!-- 底部圆点指示器 -->
      <div class="carousel-indicators">
        <div class="dot active"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LaunchRWA',
  data() {
    return {
      fundraisingAmount: 2300
    }
  },
  methods: {
    handleMenuClick() {
      this.$emit('menu-click')
      console.log('Menu button clicked')
    },

    handleLaunchClick() {
      this.$emit('launch-click')
      console.log('Launch RWA button clicked')
    },

    handleDetailClick() {
      this.$emit('detail-click')
      console.log('Detail button clicked')
    }
  }
}
</script>

<style scoped>
.launch-rwa {
  padding: 20px;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  min-height: 320px; /* 贴近移动端原型高度 */
}

/* 顶部操作区域 */
.top-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px; /* 缩小顶部留白 */
}

/* 左侧四个点菜单按钮 */
.menu-button {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 0 12px rgba(0,212,255,0.22);
}

.menu-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
  border-color: rgba(0, 212, 255, 0.5);
}

.dots-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 4px;
  width: 24px;
  height: 24px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #ffffff;
  border-radius: 50%;
  opacity: 0.8;
}

/* 右侧区域：Launch按钮和募资信息 */
.right-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  margin-top: 0;
}

/* Launch RWA按钮 */
.launch-button {
  background: linear-gradient(45deg, #8a2be2, #00d4ff);
  background-size: 200% 200%;
  border: none;
  border-radius: 25px;
  padding: 14px 28px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(138, 43, 226, 0.3);
  animation: gradient-shift 3s ease infinite;
}

.launch-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(138, 43, 226, 0.4);
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* 募资信息 */
.fundraising-info {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  min-width: 140px;
  text-align: center;
  margin-top: 8px;
  box-shadow: 0 0 12px rgba(0,212,255,0.18);
}

.fundraising-label {
  color: #888;
  font-size: 11px;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fundraising-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.amount {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.currency {
  font-size: 14px;
  color: #00d4ff;
  font-weight: 600;
}

.tron-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.tron-logo svg {
  filter: drop-shadow(0 0 4px rgba(255, 0, 0, 0.6));
}

/* 轮播图卡片 - 精确匹配参考图 */
.carousel-card {
  position: relative;
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

/* 左侧科技感城市夜景图片区域 */
.city-image {
  width: 150px;
  height: 100px;
  position: relative;
  flex-shrink: 0;
  margin-right: 16px;
}

.tech-city-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 50%, #2a2a6e 100%);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.city-buildings {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70%;
}

.building {
  position: absolute;
  bottom: 0;
  background: linear-gradient(180deg, #3a3a6a 0%, #2a2a5a 100%);
  border: 1px solid rgba(0, 212, 255, 0.4);
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
}

.building-1 {
  left: 5%;
  width: 12%;
  height: 85%;
  border-radius: 2px 2px 0 0;
}

.building-2 {
  left: 25%;
  width: 10%;
  height: 65%;
  border-radius: 2px 2px 0 0;
}

.building-3 {
  left: 45%;
  width: 15%;
  height: 90%;
  border-radius: 2px 2px 0 0;
}

.building-4 {
  left: 70%;
  width: 12%;
  height: 75%;
  border-radius: 2px 2px 0 0;
}

.neon-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.neon-line {
  position: absolute;
  top: 30%;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  animation: neon-pulse 3s ease-in-out infinite;
}

.neon-glow {
  position: absolute;
  top: 20%;
  right: 15%;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #00d4ff 0%, transparent 70%);
  border-radius: 50%;
  animation: glow-pulse 2s ease-in-out infinite alternate;
}

@keyframes neon-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

@keyframes glow-pulse {
  0% { opacity: 0.3; transform: scale(1); }
  100% { opacity: 0.7; transform: scale(1.2); }
}

.tech-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.circuit-pattern {
  position: absolute;
  top: 10%;
  left: 5%;
  width: 30px;
  height: 30px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 2px;
  background: linear-gradient(45deg, transparent 40%, rgba(0, 212, 255, 0.1) 50%, transparent 60%);
}

.data-stream {
  position: absolute;
  bottom: 20%;
  right: 10%;
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, #00d4ff, transparent);
  animation: stream-flow 2s linear infinite;
}

@keyframes stream-flow {
  0% { opacity: 0; transform: translateY(20px); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-20px); }
}

/* 右侧文字内容区域 */
.content-text {
  flex: 1;
  display: flex;
  align-items: center;
  padding-right: 16px;
}

.project-description {
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* 底部圆点指示器 */
.carousel-indicators {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.dot.active {
  background: #ffffff;
  transform: scale(1.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .launch-rwa {
    padding: 16px;
  }

  .top-section {
    margin-bottom: 20px;
  }

  .menu-button {
    width: 44px;
    height: 44px;
  }

  .launch-button {
    padding: 14px 28px;
    font-size: 15px;
  }

  .right-section {
    gap: 12px;
  }

  .fundraising-info {
    padding: 10px 12px;
    min-width: 110px;
    margin-top: 6px;
  }

  .amount {
    font-size: 16px;
  }

  .currency {
    font-size: 12px;
  }

  .fundraising-label {
    font-size: 10px;
    margin-bottom: 3px;
  }

  .main-card {
    min-height: 250px;
  }

  .card-content {
    padding: 20px;
  }

  .project-description {
    font-size: 16px;
  }

  .detail-button.top-right {
    width: 44px;
    height: 44px;
    top: 12px;
    right: 12px;
  }
}

@media (max-width: 480px) {
  .launch-rwa {
    padding: 12px;
  }

  .top-section {
    margin-bottom: 16px;
  }

  .right-section {
    gap: 10px;
  }

  .launch-button {
    padding: 12px 24px;
    font-size: 14px;
  }

  .fundraising-info {
    padding: 8px 10px;
    min-width: 90px;
    margin-top: 4px;
  }

  .amount {
    font-size: 14px;
  }

  .currency {
    font-size: 10px;
  }

  .fundraising-label {
    font-size: 9px;
    margin-bottom: 2px;
  }

  .project-description {
    font-size: 15px;
    max-width: 90%;
  }
}
</style>
