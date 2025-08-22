<template>
  <div class="launch-rwa-demo">
    <LaunchRWA 
      @menu-click="handleMenuClick"
      @launch-click="handleLaunchClick"
      @detail-click="handleDetailClick"
    />
    
    <!-- 演示说明 -->
    <div class="demo-content">
      <div class="content-section">
        <h2>Launch RWA 组件演示</h2>
        <p>这是一个完整的Launch RWA区域组件，包含：</p>
        <ul>
          <li>左侧四个点菜单按钮</li>
          <li>右侧Launch RWA渐变按钮</li>
          <li>募资信息显示（2300 TRX）</li>
          <li>赛博朋克风格的主展示卡片</li>
          <li>右下角详情箭头按钮</li>
        </ul>
      </div>
      
      <div class="content-section">
        <h3>功能特性</h3>
        <div class="feature-grid">
          <div class="feature-item">
            <div class="feature-icon">🎨</div>
            <div class="feature-text">赛博朋克背景</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✨</div>
            <div class="feature-text">霓虹灯效果</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🏗️</div>
            <div class="feature-text">城市建筑剪影</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💫</div>
            <div class="feature-text">浮动元素动画</div>
          </div>
        </div>
      </div>
      
      <div class="content-section">
        <h3>事件回调</h3>
        <div class="event-list">
          <div class="event-item">
            <span class="event-name">menu-click</span>
            <span class="event-desc">四个点菜单按钮被点击</span>
          </div>
          <div class="event-item">
            <span class="event-name">launch-click</span>
            <span class="event-desc">Launch RWA按钮被点击</span>
          </div>
          <div class="event-item">
            <span class="event-name">detail-click</span>
            <span class="event-desc">详情箭头按钮被点击</span>
          </div>
        </div>
      </div>
      
      <div class="content-section">
        <h3>使用方法</h3>
        <pre><code>&lt;LaunchRWA 
  @menu-click="handleMenuClick"
  @launch-click="handleLaunchClick"
  @detail-click="handleDetailClick"
/&gt;</code></pre>
        <p>组件会触发三个事件，你可以在父组件中监听并处理相应的逻辑。</p>
      </div>
    </div>
  </div>
</template>

<script>
import LaunchRWA from './LaunchRWA.vue'

export default {
  name: 'LaunchRWADemo',
  components: {
    LaunchRWA
  },
  methods: {
    handleMenuClick() {
      alert('四个点菜单按钮被点击了！')
      console.log('LaunchRWA menu-click event triggered')
    },
    
    handleLaunchClick() {
      alert('Launch RWA按钮被点击了！')
      console.log('LaunchRWA launch-click event triggered')
    },
    
    handleDetailClick() {
      alert('详情按钮被点击了！')
      console.log('LaunchRWA detail-click event triggered')
    }
  }
}
</script>

<style scoped>
.launch-rwa-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  color: white;
}

.demo-content {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.content-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.content-section h2 {
  color: #00d4ff;
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 28px;
}

.content-section h3 {
  color: #ff6b6b;
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 20px;
}

.content-section p {
  line-height: 1.6;
  margin-bottom: 16px;
  color: #e0e0e0;
}

.content-section ul {
  padding-left: 20px;
  color: #e0e0e0;
}

.content-section li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feature-item {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(0, 212, 255, 0.3);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.feature-text {
  font-weight: 500;
  color: #ffffff;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.event-name {
  background: linear-gradient(45deg, #00d4ff, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.event-desc {
  color: #e0e0e0;
  font-size: 14px;
}

pre {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

code {
  color: #00d4ff;
  font-family: 'Courier New', monospace;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-content {
    padding: 16px;
  }
  
  .content-section {
    padding: 20px;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .event-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .demo-content {
    padding: 12px;
  }
  
  .content-section {
    padding: 16px;
  }
  
  .content-section h2 {
    font-size: 24px;
  }
  
  .content-section h3 {
    font-size: 18px;
  }
}
</style>
