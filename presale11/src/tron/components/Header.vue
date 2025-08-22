<template>
  <header class="header">
    <!-- 状态栏 -->
    <div class="status-bar">
      <span class="time">9:41</span>
      <div class="status-icons" aria-hidden="true">
        <span class="icon signal"></span>
        <span class="icon wifi"></span>
        <span class="icon battery"></span>
      </div>
    </div>

    <!-- 导航栏 -->
    <nav class="nav-bar">
      <button class="back-btn" @click="emitBack" aria-label="Back">←</button>
      <div class="title">RWAUnion</div>
      <!-- <button class="launch-btn" @click="emitLaunch">Launch RWA</button> -->
    </nav>
  </header>
</template>

<script setup>
// Vue 3 Composition API（<script setup>）
const emit = defineEmits(["back", "launch-click"])

function emitBack() { emit("back") }
function emitLaunch() { emit("launch-click") }
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: transparent;
  width: 100%;
  max-width: 375px;
  margin: 0 auto;
}

/* 状态栏 - 精确匹配参考图 */
.status-bar {
  height: 44px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
}

.time {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.status-icons {
  display: flex;
  gap: 6px;
  align-items: center;
}

.icon {
  display: inline-block;
  width: 16px;
  height: 10px;
  background: rgba(255,255,255,.9);
  border-radius: 2px;
}

.icon.signal {
  width: 18px;
  height: 12px;
  background: linear-gradient(to right,
    rgba(255,255,255,.9) 0%, rgba(255,255,255,.9) 25%,
    rgba(255,255,255,.7) 25%, rgba(255,255,255,.7) 50%,
    rgba(255,255,255,.5) 50%, rgba(255,255,255,.5) 75%,
    rgba(255,255,255,.3) 75%);
}

.icon.wifi {
  width: 16px;
  height: 12px;
  border-radius: 50% 50% 0 0;
  background: radial-gradient(circle at 50% 100%, rgba(255,255,255,.9), rgba(255,255,255,.4));
}

.icon.battery {
  width: 22px;
  height: 11px;
  position: relative;
  border-radius: 2px;
}

.icon.battery::after {
  content: "";
  position: absolute;
  right: -2px;
  top: 3px;
  width: 2px;
  height: 5px;
  background: rgba(255,255,255,.9);
  border-radius: 0 1px 1px 0;
}

/* 导航栏 - 精确匹配参考图 */
.nav-bar {
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.18);
  background: rgba(255,255,255,.08);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255,255,255,.15);
  transform: scale(1.05);
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.launch-btn {
  width: 120px;
  height: 36px;
  border-radius: 18px;
  border: none;
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  background: linear-gradient(135deg, #8a2be2, #4a00e0);
  box-shadow: 0 4px 12px rgba(138,43,226,.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.launch-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(138,43,226,.5);
}



/* 响应式设计 */
@media (max-width: 390px) {
  .title { font-size: 17px; }
  .launch-btn {
    width: 110px;
    height: 34px;
    font-size: 13px;
  }

}

@media (max-width: 320px) {
  .launch-btn {
    width: 100px;
    height: 32px;
    font-size: 12px;
  }

}
</style>
