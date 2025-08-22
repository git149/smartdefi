<template>
  <div class="token-list">
    <!-- 标题栏区域 - 精确匹配参考图 -->
    <div class="list-header">
      <div class="left"><h3>List</h3></div>
      <div class="center">
        <button v-for="i in 5" :key="i" class="tip-btn" @click="onTip(i)">Tips</button>
      </div>
      <div class="right">
        <button class="icon-btn bell" @click="onNotify" aria-label="notifications">🔔</button>
      </div>
    </div>

    <!-- 搜索栏区域 - 343px×40px，圆角8px，深灰色背景 -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input
        v-model="keyword"
        type="text"
        class="search-input"
        placeholder="Search for Tokens"
        aria-label="Search for Tokens"
      />
    </div>

    <!-- 筛选选项区域 - 白色框体复选框，三个白色24px×24px图标 -->
    <div class="filters">
      <!-- SunSwap 复选框 - 白色框体，未选中 -->
      <label class="sun-toggle">
        <input type="checkbox" v-model="listedOnSunSwap" aria-label="Listed on SunSwap" />
        <span class="checkbox-ui" aria-hidden="true"></span>
        <span class="toggle-text">Listed on SunSwap</span>
      </label>
      <div class="actions">
        <button class="circle-btn" @click="onFilter" aria-label="Filter" title="Filter">⚙️</button>
        <button class="circle-btn" @click="onSort" aria-label="Sort" title="Sort">☰</button>
        <button class="circle-btn" @click="onRefresh" aria-label="Refresh" title="Refresh">↻</button>
      </div>
    </div>

    <!-- 代币列表区域（使用模拟数据） -->
    <div class="cards">
      <div
        v-for="token in filteredTokens"
        :key="token.id"
        class="token-card"
        @click="emitToken(token)"
      >
        <!-- 左侧：Logo/占位 -->
        <div class="logo">
          <div class="logo-inner">{{ token.logoText }}</div>
        </div>

        <!-- 中间：信息块 -->
        <div class="info">
          <div class="name-row">
            <span class="label">Name:</span>
            <span class="name">{{ token.name }}</span>
          </div>

          <div class="desc" :title="token.description">
            {{ token.description }}
          </div>

          <div class="socials" @click.stop>
            <a v-for="link in token.socials" :key="link.type" :href="link.url" target="_blank" rel="noopener">
              <span class="social-icon">{{ socialIcon(link.type) }}</span>
            </a>
          </div>

          <div class="market-cap">
            <span class="mc-label">Market Cap:</span>
            <div class="mc-right">
              <span class="mc-amount">{{ token.marketCap }} TRX</span>
              <span class="mc-percent">({{ token.percent }}%)</span>
            </div>
          </div>

          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: token.percent + '%' }"></div>
            <div class="progress-handle" :style="{ left: token.percent + '%' }"></div>
          </div>

          <!-- 已在 SunSwap 上市 标签 - 浅紫背景，12px白色文字，配火箭图标 -->
          <div v-if="token.listedOnSunSwap" class="listed-tag">
            <span class="rocket">🚀</span>
            已在 SunSwap上市
          </div>

          <!-- 合约（Base58: TRX... 保留展示位） -->
          <div class="contract capsule" @click.stop>
            <span class="ca-label">CA:</span>
            <span class="ca-address" :title="token.contractBase58">{{ token.contractBase58 }}</span>
            <button class="copy-btn" aria-label="Copy contract address" @click.stop="copyCA(token.contractBase58)">📋</button>
          </div>
        </div>

        <!-- 右侧：涨跌幅标签 -->
        <div class="change-tag" :class="{ up: token.change >= 0, down: token.change < 0 }">
          {{ token.change >= 0 ? '+' + token.change : token.change }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 使用 <script setup> 以 Composition API（函数组件风格）实现
// TODO: 预留 ABI 调用对接位：
// 1) 基于合约 ABI 查询 TRON 链上代币信息（价格/市值/社交/是否上架 SunSwap 等）
// 2) 保证展示地址为 Base58 显示格式（TRX...开头）
import { ref, computed } from 'vue'

const emit = defineEmits(['token-click'])

const keyword = ref('')
const listedOnSunSwap = ref(true)
const sortDesc = ref(true)

// 模拟数据（静态 UI）
const tokens = ref([
  {
    id: 1,
    logoText: '🪙',
    name: 'CHOU',
    description:
      'PEPE visits all northern countries and regions in 2025... He is not scare from the cold and polar bears. Enjoys the northern lights.',
    socials: [
      { type: 'x', url: '#' },
      { type: 'tg', url: '#' }
    ],
    marketCap: 3000,
    percent: 30.87,
    change: 208.87,
    contractBase58: 'TRX9u2B1xQpYcD3LMkAbCdeFgHiJkLmNoPq',
    listedOnSunSwap: true
  },
  {
    id: 2,
    logoText: '💠',
    name: 'PEPE NORTH',
    description:
      'PEPE explores the arctic circle; memes meet frost and auroras. A long sentence to test ellipsis rendering in a single line.',
    socials: [
      { type: 'x', url: '#' }
    ],
    marketCap: 0,
    percent: 0,
    change: -20.87,
    contractBase58: 'TRX7Qc9sZrYxX3LpQ2WeRtYuIoPaSdFgHjK',
    listedOnSunSwap: false
  },
  {
    id: 3,
    logoText: '🧿',
    name: 'SUNSWAP DEMO',
    description:
      'Demo token on TRON to match UI requirements. This is placeholder content only.',
    socials: [
      { type: 'tg', url: '#' }
    ],
    marketCap: 1200,
    percent: 18.2,
    change: 12.3,
    contractBase58: 'TRX4Kp1WmN2BcV5R7TyUiOpAsDfGhJkLzXc',
    listedOnSunSwap: true
  }
])

const filteredTokens = computed(() => {
  let list = tokens.value
  if (listedOnSunSwap.value) {
    list = list.filter(t => t.listedOnSunSwap)
  }
  if (keyword.value.trim()) {
    const k = keyword.value.trim().toLowerCase()
    list = list.filter(
      t => t.name.toLowerCase().includes(k) || t.description.toLowerCase().includes(k)
    )
  }
  const sorted = [...list].sort((a, b) => (sortDesc.value ? b.percent - a.percent : a.percent - b.percent))
  return sorted
})

function emitToken(token) {
  emit('token-click', token)
}

function onTip(i) {
  console.log('Tip clicked', i)
}
function onNotify() {
  console.log('Bell clicked')
}
function onFilter() {
  console.log('Filter clicked')
}
function onSort() {
  sortDesc.value = !sortDesc.value
}
function onRefresh() {
  console.log('Refresh clicked')
  // 将来可触发 ABI 更新
}

function copyCA(text) {
  if (!text) return

  navigator.clipboard && navigator.clipboard.writeText(text)
}

function socialIcon(type) {
  if (type === 'x') return '𝕏'
  if (type === 'tg') return '✈️'
  return '🔗'
}
</script>

<style scoped>
.token-list {
  padding: 16px;
  color: #fff;
  max-width: 420px;
  margin: 0 auto;
  overflow-x: hidden;
}

/* 标题栏 - List白色18px粗体居左，右侧红色铃铛图标24px×24px */
.list-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.list-header .left h3 {
  margin: 0;
  font-size: 18px; /* 18px字号 */
  font-weight: 700; /* 粗体 */
  color: #ffffff; /* 白色 */
}

.list-header .center { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; min-width: 0; }

.list-header .center {
  display: flex;
  gap: 8px;
  align-items: center;
}
.tip-btn {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(128, 128, 128, 0.3); /* 浅灰背景 */
  color: #ffffff;
  border: none;
  font-size: 12px; /* 12px文字 */
  cursor: pointer;
}
.icon-btn.bell {
  width: 24px; /* 24px×24px */
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #ff0000; /* 红色铃铛图标 */
  font-size: 16px;
  cursor: pointer;
}
.icon-btn.bell:focus-visible,
.tip-btn:focus-visible,
.circle-btn:focus-visible { outline: 2px solid #00d4ff; outline-offset: 2px; }

/* 搜索栏 - 343px×40px，圆角8px，深灰色背景 */
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  width: 343px;
  height: 40px;
  background: rgba(64, 64, 64, 0.8); /* 深灰色背景 */
  border: none;
  border-radius: 8px; /* 圆角8px */
  padding: 0 14px 0 48px;
  margin-bottom: 16px;
}
.search-icon {
  position: absolute;
  left: 16px;
  color: #ffffff; /* 白色放大镜图标 */
  font-size: 16px;
}
.search-input {
  width: 100%;
  background: transparent;
  color: #fff;
  border: none;
  outline: none;
  font-size: 14px; /* 提示文字灰色14px */
}
.search-input::placeholder {
  color: #888888; /* 灰色提示文字 */
}

/* 筛选选项 */
.filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.sun-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #cfe1ff;
}
.sun-toggle input { position: absolute; opacity: 0; }
.sun-toggle .checkbox-ui {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff; /* 白色框体 */
  border-radius: 2px;
  position: relative;
  background: transparent; /* 未选中状态 */
  margin-right: 8px;
}
.sun-toggle input:checked + .checkbox-ui {
  background: #ffffff;
}
.sun-toggle input:checked + .checkbox-ui::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #333333;
  font-size: 12px;
  font-weight: bold;
}
.sun-toggle .toggle-text { font-size: 12px; }

.actions { display: flex; gap: 16px; } /* 间隔16px */
.circle-btn {
  width: 24px; /* 24px×24px */
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #ffffff; /* 白色图标 */
  font-size: 16px;
  cursor: pointer;
  transition: transform .15s ease;
}
.circle-btn:hover { transform: scale(1.1); }

/* 卡片列表 */
.cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.token-card {
  position: relative;
  display: grid;
  grid-template-columns: 60px 1fr; /* 60px×60px图标区域 */
  gap: 12px;
  padding: 12px;
  height: 120px; /* 每个高度120px */
  border-radius: 12px;
  background: linear-gradient(135deg, #2d1b69 0%, #1a0f3a 100%); /* 深紫色背景 */
  border: 2px solid #ff8c00; /* 橙色边框 */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255,140,0,0.3);
  margin-bottom: 12px; /* 间距12px */
}
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-inner {
  width: 60px; /* 60px×60px */
  height: 60px;
  border-radius: 8px; /* 方形圆角 */
  display: grid;
  place-items: center;
  background: radial-gradient(circle at 30% 30%, #8a2be2, #00d4ff);
  box-shadow: inset 0 0 12px rgba(255,255,255,0.15), 0 0 12px rgba(0,212,255,0.25);
  font-size: 24px; /* 图标大小 */
}
.info .name-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: #fff;
}
.label { color: #ffffff; font-size: 16px; } /* Name: 白色16px */
.name { color: #00d4ff; font-weight: 700; font-size: 16px; } /* CHOU 蓝色16px */
.desc {
  margin: 4px 0;
  color: #888888; /* 描述文字灰色12px */
  font-size: 12px;
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
}
.socials { display: flex; gap: 8px; margin-bottom: 6px; }
.socials a { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.08); box-shadow: 0 0 8px rgba(0,212,255,0.18); }
.social-icon { font-size: 14px; }
.market-cap { color: #fff; font-size: 12px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; }
.mc-label { color: #9aa4ff; }
.mc-right { display: inline-flex; gap: 6px; align-items: baseline; }
.mc-amount { color: #00d4ff; font-weight: 700; }
.mc-percent { color: #ff8c00; }

  /* SunSwap 上市标签样式 */
  .listed-tag { margin-top: 6px; display:inline-flex; align-items:center; gap:6px; padding: 4px 8px; border-radius: 999px; color:#fff; background: rgba(139,92,246,.25); border:1px solid rgba(139,92,246,.45); box-shadow: 0 0 12px rgba(139,92,246,.25); font-size:12px; }
  .listed-tag .rocket { font-size: 14px; }

.progress-bar { position: relative; height: 8px; background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(0,0,0,0.2)); border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #8a2be2, #00d4ff); }
.progress-handle { position: absolute; top: 50%; width: 14px; height: 14px; background: #fff; border-radius: 50%; transform: translate(-50%, -50%); box-shadow: 0 2px 6px rgba(0,0,0,0.45), 0 0 10px rgba(255,255,255,0.4); }

.contract { margin-top: 6px; color: #cfd8ff; font-family: 'Courier New', monospace; font-size: 12px; word-break: break-all; }
.ca-label { color: #8aa0ff; margin-right: 6px; }

.contract.capsule { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); border-radius: 10px; padding: 8px 10px; }
.ca-address { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.copy-btn { background: none; border: 1px solid rgba(255,255,255,0.18); border-radius: 6px; color: #00d4ff; padding: 4px 6px; box-shadow: 0 0 8px rgba(0,212,255,0.2); }
.copy-btn:hover { background: rgba(0,212,255,0.08); }

.change-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: #00ff88; /* 绿色背景 */
  display: flex;
  align-items: center;
  gap: 2px;
}
.change-tag::after { content:'↑'; color: #ffffff; }
.change-tag.down {
  background: #ff4d4f; /* 红色背景 */
}
.change-tag.down::after { content:'↓'; }


/* 响应式 */
@media (min-width: 768px) {
  .token-card { grid-template-columns: 60px 1fr; padding: 14px; }
}

@media (max-width: 768px) {
  .icon-btn.bell, .circle-btn { width: 40px; height: 40px; }
  .logo-inner { width: 44px; height: 44px; }
  .search-bar { padding-left: 46px; }
}

@media (max-width: 480px) {
  .token-card { grid-template-columns: 52px 1fr; }
  .desc { font-size: 12px; }
}

/* --- UI 优化覆盖：Tips 尺寸/折叠 + 文本展示 + 布局比例 --- */
/* 1) 调整 Tips 胶囊尺寸与间距 */
.list-header { margin-bottom: 10px; }
.list-header .center { gap: 6px; }
.tip-btn { padding: 4px 10px; font-size: 12px; }
/* 窄屏折叠：390 下仅显示 3 个，超出隐藏 */
@media (max-width: 390px) {
  .list-header .center .tip-btn:nth-child(n+4) { display: none; }
}
/* 超窄屏（320 附近）仅显示 2 个 */
@media (max-width: 340px) {
  .list-header .center .tip-btn:nth-child(n+3) { display: none; }
}

/* 2) 顶部按钮和间距优化，给内容区域腾出空间 */
.icon-btn.bell, .circle-btn { width: 32px; height: 32px; }
.search-bar { margin-bottom: 10px; }
.filters { margin-bottom: 12px; }
@media (max-width: 768px) {
  /* 覆盖先前 40px 设定，移动端更紧凑 */
  .icon-btn.bell, .circle-btn { width: 32px; height: 32px; }
}

/* 3) 文本展示优化：名称单行省略，描述两行智能截断 */
.info { min-width: 0; }
.name { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.desc {
  margin-top: 4px; /* 稍紧凑 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 两行截断 */
  -webkit-box-orient: vertical;
  white-space: normal; /* 允许换行 */
  overflow-wrap: anywhere; /* 极端长词兜底 */
}

/* 4) 卡片网格与轨道微调，进一步减小头部占比 */
.token-card { gap: 10px; }

/* --- 像素级还原：搜索栏视觉与筛选胶囊对齐 --- */
.search-bar {
  height: 44px;
  border-radius: 14px;
  padding-left: 54px; /* 放大放大镜容器后，为文本让位 */
  box-shadow: 0 8px 24px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.06);
}
.search-icon {
  width: 32px; height: 32px;
  left: 10px;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.22), rgba(255,255,255,0.08));
}
.search-input { font-size: 18px; line-height: 44px; }

/* 筛选区域按钮尺寸与圆角统一，间距贴近设计 */
.filters { gap: 10px; }
.sun-toggle .toggle-ui { width: 42px; height: 24px; border-radius: 16px; }
.circle-btn { width: 36px; height: 36px; border-radius: 12px; }

/* 卡片容器阴影与圆角统一 */
.token-card { border-radius: 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.25), 0 0 16px rgba(0,212,255,0.12); }

/* 断点细化 */
@media (max-width: 390px) {
  .search-input { font-size: 17px; }
}
@media (max-width: 340px) {
  .search-bar { height: 42px; }
  .search-input { font-size: 16px; }
}

.progress-bar { margin-top: 6px; }

</style>

