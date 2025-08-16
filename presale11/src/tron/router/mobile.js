// 移动端路由配置
export const mobileRoutes = [
  {
    path: '/mobile',
    name: 'MobileLayout',
    component: () => import('../layouts/MobileLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/mobile/home'
      },
      {
        path: 'home',
        name: 'MobileHome',
        component: () => import('../views/MobileHome.vue'),
        meta: {
          title: 'RWAunion - Token Launch Platform',
          requiresAuth: false
        }
      },
      {
        path: 'launch',
        name: 'MobileTokenLaunch',
        component: () => import('../views/MobileTokenLaunch.vue'),
        meta: {
          title: 'Launch Token - RWAunion',
          requiresAuth: true
        }
      },
      {
        path: 'token/:address',
        name: 'MobileTokenDetail',
        component: () => import('../views/MobileTokenDetail.vue'),
        meta: {
          title: 'Token Details - RWAunion',
          requiresAuth: false
        }
      },
      {
        path: 'presale/:address',
        name: 'MobilePresaleDetail',
        component: () => import('../views/MobilePresaleDetail.vue'),
        meta: {
          title: 'Presale Details - RWAunion',
          requiresAuth: false
        }
      },
      {
        path: 'wallet',
        name: 'MobileWallet',
        component: () => import('../views/MobileWallet.vue'),
        meta: {
          title: 'Wallet - RWAunion',
          requiresAuth: true
        }
      },
      {
        path: 'profile',
        name: 'MobileProfile',
        component: () => import('../views/MobileProfile.vue'),
        meta: {
          title: 'Profile - RWAunion',
          requiresAuth: true
        }
      }
    ]
  }
]

// 设备检测中间件
export function isMobileDevice() {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  
  // 检测移动设备
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  const isMobile = mobileRegex.test(userAgent)
  
  // 检测屏幕尺寸
  const isSmallScreen = window.innerWidth <= 768
  
  return isMobile || isSmallScreen
}

// 路由守卫 - 自动重定向到移动端
export function setupMobileRedirect(router) {
  router.beforeEach((to, from, next) => {
    const isMobile = isMobileDevice()
    
    // 如果是移动设备且访问桌面端路由，重定向到移动端
    if (isMobile && !to.path.startsWith('/mobile')) {
      const mobileRoute = getMobileRoute(to.path)
      if (mobileRoute) {
        next(mobileRoute)
        return
      }
    }
    
    // 如果是桌面设备且访问移动端路由，重定向到桌面端
    if (!isMobile && to.path.startsWith('/mobile')) {
      const desktopRoute = getDesktopRoute(to.path)
      if (desktopRoute) {
        next(desktopRoute)
        return
      }
    }
    
    next()
  })
}

// 路由映射函数
function getMobileRoute(desktopPath) {
  const routeMap = {
    '/': '/mobile/home',
    '/home': '/mobile/home',
    '/launch': '/mobile/launch',
    '/token': '/mobile/token',
    '/presale': '/mobile/presale',
    '/wallet': '/mobile/wallet',
    '/profile': '/mobile/profile'
  }
  
  // 处理动态路由
  for (const [desktop, mobile] of Object.entries(routeMap)) {
    if (desktopPath.startsWith(desktop)) {
      return desktopPath.replace(desktop, mobile)
    }
  }
  
  return null
}

function getDesktopRoute(mobilePath) {
  const routeMap = {
    '/mobile/home': '/',
    '/mobile/launch': '/launch',
    '/mobile/token': '/token',
    '/mobile/presale': '/presale',
    '/mobile/wallet': '/wallet',
    '/mobile/profile': '/profile'
  }
  
  // 处理动态路由
  for (const [mobile, desktop] of Object.entries(routeMap)) {
    if (mobilePath.startsWith(mobile)) {
      return mobilePath.replace(mobile, desktop)
    }
  }
  
  return null
}

// 移动端布局组件
export const MobileLayoutComponent = {
  template: `
    <div class="mobile-layout">
      <router-view />
      <MobileNavigation v-if="showNavigation" />
    </div>
  `,
  
  computed: {
    showNavigation() {
      // 在某些页面隐藏底部导航
      const hideNavRoutes = ['MobileTokenLaunch']
      return !hideNavRoutes.includes(this.$route.name)
    }
  }
}
