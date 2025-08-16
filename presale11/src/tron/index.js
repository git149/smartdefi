/**
 * TRON Vue插件
 * 将TRON服务集成到Vue应用中
 */

import TronServiceManager, { 
  TronWebService, 
  CoordinatorFactoryService, 
  PresaleService, 
  TokenService,
  Utils,
  Config
} from './services'

/**
 * TRON Vue插件
 */
const TronPlugin = {
  /**
   * 安装插件
   * @param {Object} Vue - Vue构造函数
   * @param {Object} options - 插件选项
   */
  install(Vue, options = {}) {
    // 合并配置
    const config = {
      autoInit: true,
      ...options
    }

    // 添加全局属性
    Vue.prototype.$tron = TronServiceManager
    Vue.prototype.$tronWeb = TronWebService
    Vue.prototype.$tronUtils = Utils
    Vue.prototype.$tronConfig = Config

    // 添加全局方法
    Vue.prototype.$createTronServices = function(tokenAddress, presaleAddress) {
      return {
        token: tokenAddress ? TronServiceManager.getTokenService(tokenAddress) : null,
        presale: presaleAddress ? TronServiceManager.getPresaleService(presaleAddress) : null,
        factory: CoordinatorFactoryService
      }
    }

    // 添加响应式状态
    Vue.prototype.$tronState = Vue.observable({
      isConnected: false,
      currentAccount: null,
      isInitialized: false,
      networkConfig: null
    })

    // 监听连接状态变化
    TronWebService.on('accountChanged', (account) => {
      Vue.prototype.$tronState.currentAccount = account
      Vue.prototype.$tronState.isConnected = !!account
    })

    TronWebService.on('disconnected', () => {
      Vue.prototype.$tronState.isConnected = false
      Vue.prototype.$tronState.currentAccount = null
    })

    // 自动初始化
    if (config.autoInit) {
      Vue.nextTick(async () => {
        try {
          await TronServiceManager.initialize()
          Vue.prototype.$tronState.isInitialized = true
          Vue.prototype.$tronState.networkConfig = Config.getCurrentNetworkConfig()
          
          // 检查连接状态
          const status = TronWebService.getStatus()
          Vue.prototype.$tronState.isConnected = status.isConnected
          Vue.prototype.$tronState.currentAccount = status.currentAccount
          
          console.log('✅ TRON插件初始化成功')
        } catch (error) {
          console.error('❌ TRON插件初始化失败:', error)
        }
      })
    }

    // 添加全局混入
    Vue.mixin({
      methods: {
        /**
         * 连接TRON钱包
         */
        async $connectTronWallet() {
          try {
            const account = await TronServiceManager.connectWallet()
            this.$tronState.isConnected = true
            this.$tronState.currentAccount = account
            return account
          } catch (error) {
            console.error('连接钱包失败:', error)
            throw error
          }
        },

        /**
         * 断开TRON钱包连接
         */
        $disconnectTronWallet() {
          TronWebService.disconnect()
          this.$tronState.isConnected = false
          this.$tronState.currentAccount = null
        },

        /**
         * 获取TRON余额
         */
        async $getTronBalance(address = null) {
          try {
            return await TronWebService.getBalance(address)
          } catch (error) {
            console.error('获取余额失败:', error)
            throw error
          }
        },

        /**
         * 创建代币和预售
         */
        async $createTokenAndPresale(tokenConfig, presaleConfig, options = {}) {
          try {
            return await TronServiceManager.createTokenAndPresale(
              tokenConfig, 
              presaleConfig, 
              options
            )
          } catch (error) {
            console.error('创建代币和预售失败:', error)
            throw error
          }
        },

        /**
         * 格式化TRON地址
         */
        $formatTronAddress(address, startLength = 6, endLength = 4) {
          return Utils.AddressUtils.shortenAddress(address, startLength, endLength)
        },

        /**
         * 格式化数字
         */
        $formatNumber(value, decimals = 2) {
          return Utils.NumberUtils.formatNumber(value, decimals)
        },

        /**
         * 获取交易链接
         */
        $getTronTxLink(txHash, network = 'mainnet') {
          return Utils.TransactionUtils.getTxLink(txHash, network)
        },

        /**
         * 获取地址链接
         */
        $getTronAddressLink(address, network = 'mainnet') {
          return Utils.TransactionUtils.getAddressLink(address, network)
        }
      }
    })

    // 添加全局过滤器
    Vue.filter('tronAddress', function(address, startLength = 6, endLength = 4) {
      return Utils.AddressUtils.shortenAddress(address, startLength, endLength)
    })

    Vue.filter('tronNumber', function(value, decimals = 2) {
      return Utils.NumberUtils.formatNumber(value, decimals)
    })

    Vue.filter('tronTime', function(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
      return Utils.TimeUtils.formatTimestamp(timestamp, format)
    })

    Vue.filter('tronRelativeTime', function(timestamp) {
      return Utils.TimeUtils.getRelativeTime(timestamp)
    })

    console.log('🔌 TRON Vue插件已安装')
  }
}

// 自动安装插件（如果在浏览器环境中）
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(TronPlugin)
}

export default TronPlugin

// 导出服务和工具供直接使用
export {
  TronServiceManager,
  TronWebService,
  CoordinatorFactoryService,
  PresaleService,
  TokenService,
  Utils,
  Config
}
