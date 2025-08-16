/**
 * TRON服务统一入口
 * 提供所有TRON相关服务的统一访问接口
 */

import TronWebService from './TronWebService'
import CoordinatorFactoryService from './CoordinatorFactoryService'
import PresaleService from './PresaleService'
import TokenService from './TokenService'
import Utils from '../utils'
import Config from '../config'

/**
 * TRON服务管理器
 */
class TronServiceManager {
  constructor() {
    this.tronWeb = TronWebService
    this.coordinatorFactory = CoordinatorFactoryService
    this.presaleServices = new Map() // 缓存预售服务实例
    this.tokenServices = new Map()   // 缓存代币服务实例
    this.isInitialized = false
  }

  /**
   * 初始化所有服务
   * @returns {Promise<boolean>} 初始化是否成功
   */
  async initialize() {
    try {
      console.log('🚀 初始化TRON服务管理器...')

      // 初始化TronWeb服务（允许失败）
      const tronWebInitialized = await this.tronWeb.initialize()

      if (tronWebInitialized) {
        // 只有TronWeb初始化成功才初始化工厂服务
        try {
          await this.coordinatorFactory.initialize()
        } catch (factoryError) {
          console.warn('⚠️ 工厂服务初始化失败，但应用可以继续运行:', factoryError.message)
        }
      } else {
        console.warn('⚠️ TronWeb未初始化，某些功能可能不可用')
      }

      this.isInitialized = true
      console.log('✅ TRON服务管理器初始化完成')

      return true
    } catch (error) {
      console.error('❌ TRON服务管理器初始化失败:', error)
      // 不抛出错误，允许应用继续运行
      this.isInitialized = true // 标记为已初始化，避免重复尝试
      return false
    }
  }

  /**
   * 确保服务已初始化
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize()
    }
  }

  /**
   * 获取预售服务实例
   * @param {string} presaleAddress - 预售合约地址
   * @returns {PresaleService} 预售服务实例
   */
  getPresaleService(presaleAddress) {
    if (!presaleAddress) {
      throw new Error('预售合约地址不能为空')
    }

    if (!this.presaleServices.has(presaleAddress)) {
      const service = new PresaleService(presaleAddress)
      this.presaleServices.set(presaleAddress, service)
    }

    return this.presaleServices.get(presaleAddress)
  }

  /**
   * 获取代币服务实例
   * @param {string} tokenAddress - 代币合约地址
   * @returns {TokenService} 代币服务实例
   */
  getTokenService(tokenAddress) {
    if (!tokenAddress) {
      throw new Error('代币合约地址不能为空')
    }

    if (!this.tokenServices.has(tokenAddress)) {
      const service = new TokenService(tokenAddress)
      this.tokenServices.set(tokenAddress, service)
    }

    return this.tokenServices.get(tokenAddress)
  }

  /**
   * 创建代币和预售合约
   * @param {Object} tokenConfig - 代币配置
   * @param {Object} presaleConfig - 预售配置
   * @param {Object} options - 交易选项
   * @returns {Promise<Object>} 创建结果
   */
  async createTokenAndPresale(tokenConfig, presaleConfig, options = {}) {
    await this.ensureInitialized()
    
    return await this.coordinatorFactory.createTokenAndPresale(
      tokenConfig, 
      presaleConfig, 
      options
    )
  }

  /**
   * 获取用户完整信息
   * @param {string} userAddress - 用户地址
   * @param {string} tokenAddress - 代币地址
   * @param {string} presaleAddress - 预售地址
   * @returns {Promise<Object>} 用户完整信息
   */
  async getUserFullInfo(userAddress, tokenAddress = null, presaleAddress = null) {
    await this.ensureInitialized()

    const result = {
      userAddress,
      balance: await this.tronWeb.getBalance(userAddress)
    }

    // 获取代币信息
    if (tokenAddress) {
      const tokenService = this.getTokenService(tokenAddress)
      result.tokenInfo = await tokenService.getUserTokenInfo(userAddress)
    }

    // 获取预售信息
    if (presaleAddress) {
      const presaleService = this.getPresaleService(presaleAddress)
      result.presaleInfo = await presaleService.getUserFullInfo(userAddress)
    }

    return result
  }

  /**
   * 获取项目完整状态
   * @param {string} tokenAddress - 代币地址
   * @param {string} presaleAddress - 预售地址
   * @returns {Promise<Object>} 项目完整状态
   */
  async getProjectFullStatus(tokenAddress, presaleAddress) {
    await this.ensureInitialized()

    const [tokenService, presaleService] = [
      this.getTokenService(tokenAddress),
      this.getPresaleService(presaleAddress)
    ]

    const [tokenStatus, presaleStatus, factoryStatus] = await Promise.all([
      tokenService.getTokenFullStatus(),
      presaleService.getPresaleFullStatus(),
      this.coordinatorFactory.getFactoryStatus()
    ])

    return {
      token: tokenStatus,
      presale: presaleStatus,
      factory: factoryStatus,
      addresses: {
        token: tokenAddress,
        presale: presaleAddress,
        factory: this.coordinatorFactory.contractAddress
      }
    }
  }

  /**
   * 连接钱包
   * @returns {Promise<string>} 连接的账户地址
   */
  async connectWallet() {
    return await this.tronWeb.connectWallet()
  }

  /**
   * 获取连接状态
   * @returns {Object} 连接状态
   */
  getConnectionStatus() {
    return this.tronWeb.getStatus()
  }

  /**
   * 监听账户变化
   * @param {Function} callback - 回调函数
   */
  onAccountChanged(callback) {
    this.tronWeb.on('accountChanged', callback)
  }

  /**
   * 移除账户变化监听
   * @param {Function} callback - 回调函数
   */
  offAccountChanged(callback) {
    this.tronWeb.off('accountChanged', callback)
  }

  /**
   * 清理缓存的服务实例
   */
  clearCache() {
    this.presaleServices.clear()
    this.tokenServices.clear()
    console.log('🧹 服务缓存已清理')
  }

  /**
   * 获取服务统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      cachedPresaleServices: this.presaleServices.size,
      cachedTokenServices: this.tokenServices.size,
      connectionStatus: this.getConnectionStatus()
    }
  }
}

// 创建单例实例
const tronServiceManager = new TronServiceManager()

// 导出服务和工具
export {
  TronWebService,
  CoordinatorFactoryService,
  PresaleService,
  TokenService,
  Utils,
  Config
}

// 导出新增的服务
export { default as TokenListService } from './TokenListService'

// 默认导出服务管理器
export default tronServiceManager
