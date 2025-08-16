/**
 * TronWeb服务类
 * 负责TronWeb的初始化、连接管理和基础操作
 */

import {
  getCurrentNetworkConfig,
  ERROR_CODES,
  getErrorMessage,
  sunToTrx,
  trxToSun
} from '../config'

class TronWebService {
  constructor() {
    this.tronWeb = null
    this.isConnected = false
    this.currentAccount = null
    this.networkConfig = null
    this.eventListeners = new Map()
    // 连接状态轮询与事件桥接
    this._connectionWatcher = null
  }

  /**
   * 初始化TronWeb
   * @returns {Promise<boolean>} 初始化是否成功
   */
  async initialize() {
    try {
      // 更宽松的TronWeb检测
      const tronWebAvailable = await this.waitForTronWebWithTimeout(5000)

      if (!tronWebAvailable) {
        console.warn('⚠️ TronWeb未在5秒内加载，可能需要手动连接TronLink')
        // 不抛出错误，允许后续手动连接
        return false
      }

      this.tronWeb = window.tronWeb
      this.networkConfig = getCurrentNetworkConfig()

      // 检查连接状态（不强制要求连接）
      try {
        await this.checkConnection()
      } catch (connectionError) {
        console.warn('⚠️ TronLink未连接，用户可以稍后手动连接')
      }

      // 安装 TronLink 注入的地址变化事件监听（若可用）
      try {
        const provider = window.tronLink || window.tronWeb?.provider
        if (provider && provider.on && typeof provider.on === 'function') {
          // TronLink 事件: accountsChanged
          provider.on('accountsChanged', (accounts) => {
            const account = Array.isArray(accounts) ? accounts[0] : accounts
            this.currentAccount = account || null
            this.isConnected = !!account
            console.log('🔔 TronLink accountsChanged:', accounts)
            this.emit('accountChanged', this.currentAccount)
          })
        }
      } catch (e) {
        console.warn('⚠️ 未能注册 TronLink 账户变更事件:', e?.message)
      }

      // 兜底轮询：每2秒同步一次 window.tronWeb.defaultAddress
      this.startConnectionWatcher()

      console.log('✅ TronWeb初始化成功')
      return true

    } catch (error) {
      console.error('❌ TronWeb初始化失败:', error)
      // 不抛出错误，允许应用继续运行
      return false
    }
  }

  /**
   * 等待TronWeb加载完成（带超时，不抛出错误）
   * @param {number} timeout - 超时时间(毫秒)
   * @returns {Promise<boolean>} TronWeb是否已加载
   */
  async waitForTronWebWithTimeout(timeout = 5000) {
    return new Promise((resolve) => {
      const startTime = Date.now()

      const checkTronWeb = () => {
        if (window.tronWeb) {
          resolve(true)
        } else if (Date.now() - startTime > timeout) {
          resolve(false) // 超时返回false而不是抛出错误
        } else {
          setTimeout(checkTronWeb, 100)
        }
      }

      checkTronWeb()
    })
  }

  /**
   * 等待TronWeb加载完成
   * @param {number} timeout - 超时时间(毫秒)
   * @returns {Promise<void>}
   */
  async waitForTronWeb(timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()

      const checkTronWeb = () => {
        if (window.tronWeb && window.tronWeb.ready) {
          resolve()
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('TronWeb加载超时'))
        } else {
          setTimeout(checkTronWeb, 100)
        }
      }

      checkTronWeb()
    })
  }

  /**
   * 检查连接状态
   * @returns {Promise<boolean>}
   */
  async checkConnection() {
    try {
      if (!this.tronWeb) {
        this.isConnected = false
        return false
      }

      // 检查是否有默认地址
      if (!this.tronWeb.defaultAddress.base58) {
        this.isConnected = false
        this.currentAccount = null
        return false
      }

      this.currentAccount = this.tronWeb.defaultAddress.base58
      this.isConnected = true

      console.log('📱 钱包已连接:', this.currentAccount)
      return true

    } catch (error) {
      console.error('❌ 检查连接状态失败:', error)
      this.isConnected = false
      this.currentAccount = null
      return false
    }
  }

  /**
   * 请求连接钱包
   * @returns {Promise<string>} 连接的账户地址
   */
  async connectWallet() {
    try {
      if (!this.tronWeb) {
        await this.initialize()
      }

      // 请求账户权限
      if (this.tronWeb.request) {
        await this.tronWeb.request({
          method: 'tron_requestAccounts'
        })
      }

      // 检查连接状态
      const connected = await this.checkConnection()
      if (!connected) {
        throw new Error(getErrorMessage(ERROR_CODES.WALLET_NOT_CONNECTED))
      }

      this.emit('accountChanged', this.currentAccount)
      return this.currentAccount

    } catch (error) {
      console.error('❌ 连接钱包失败:', error)
      throw error
    }
  }

  /**
   * 获取账户余额
   * @param {string} address - 账户地址，默认为当前账户
   * @returns {Promise<Object>} 余额信息
   */
  async getBalance(address = null) {
    try {
      const targetAddress = address || this.currentAccount
      if (!targetAddress) {
        throw new Error(getErrorMessage(ERROR_CODES.WALLET_NOT_CONNECTED))
      }

      const balance = await this.tronWeb.trx.getBalance(targetAddress)

      return {
        sun: balance,
        trx: sunToTrx(balance),
        formatted: `${sunToTrx(balance).toFixed(6)} TRX`
      }

    } catch (error) {
      console.error('❌ 获取余额失败:', error)
      throw error
    }
  }

  /**
   * 验证地址格式
   * @param {string} address - 要验证的地址
   * @returns {boolean} 是否为有效地址
   */
  isValidAddress(address) {
    try {
      // 如果TronWeb可用，使用TronWeb验证
      if (this.tronWeb && this.tronWeb.isAddress) {
        return this.tronWeb.isAddress(address)
      }

      // 如果TronWeb不可用，使用基本的格式验证
      if (!address || typeof address !== 'string') {
        return false
      }

      // TRON地址基本格式验证
      // Base58格式：T开头，34位字符
      const base58Regex = /^T[A-Za-z1-9]{33}$/
      if (base58Regex.test(address)) {
        return true
      }

      // Hex格式：41开头，42位十六进制字符
      const hexRegex = /^41[0-9a-fA-F]{40}$/
      if (hexRegex.test(address)) {
        return true
      }

      return false
    } catch (error) {
      console.warn('⚠️ 地址验证失败:', error)
      return false
    }
  }

  /**
   * 地址格式转换
   * @param {string} address - 地址
   * @returns {Object} 转换后的地址格式
   */
  convertAddress(address) {
    try {
      if (!this.isValidAddress(address)) {
        throw new Error(getErrorMessage(ERROR_CODES.INVALID_ADDRESS))
      }

      return {
        base58: this.tronWeb.address.fromHex(address),
        hex: this.tronWeb.address.toHex(address)
      }
    } catch (error) {
      console.error('❌ 地址转换失败:', error)
      throw error
    }
  }

  /**
   * 获取交易信息
   * @param {string} txHash - 交易哈希
   * @returns {Promise<Object>} 交易信息
   */
  async getTransaction(txHash) {
    try {
      const transaction = await this.tronWeb.trx.getTransaction(txHash)
      const transactionInfo = await this.tronWeb.trx.getTransactionInfo(txHash)

      return {
        transaction,
        transactionInfo,
        success: transactionInfo.receipt && transactionInfo.receipt.result === 'SUCCESS'
      }
    } catch (error) {
      console.error('❌ 获取交易信息失败:', error)
      throw error
    }
  }

  /**
   * 等待交易确认
   * @param {string} txHash - 交易哈希
   * @param {number} timeout - 超时时间(毫秒)
   * @returns {Promise<Object>} 交易结果
   */
  async waitForTransaction(txHash, timeout = 180000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      let checkCount = 0

      const checkTransaction = async () => {
        try {
          checkCount++
          console.log(`🔍 检查交易状态 (${checkCount}次):`, txHash)

          const result = await this.getTransaction(txHash)

          if (result.transactionInfo && result.transactionInfo.id) {
            console.log('✅ 交易确认成功:', result.transactionInfo.id)
            resolve(result)
          } else if (Date.now() - startTime > timeout) {
            console.error('❌ 交易确认超时，可能原因：')
            console.error('  1. 网络拥堵导致交易处理缓慢')
            console.error('  2. Gas费用不足')
            console.error('  3. 合约执行失败')
            console.error('  4. 交易已过期')
            reject(new Error(`交易确认超时 (${timeout/1000}秒)`))
          } else {
            // 动态调整检查间隔：前30秒每2秒检查，之后每5秒检查
            const interval = (Date.now() - startTime) < 30000 ? 2000 : 5000
            setTimeout(checkTransaction, interval)
          }
        } catch (error) {
          console.warn(`⚠️ 检查交易时出错 (${checkCount}次):`, error.message)
          if (Date.now() - startTime > timeout) {
            reject(new Error(`交易确认失败: ${error.message}`))
          } else {
            setTimeout(checkTransaction, 5000)
          }
        }
      }

      checkTransaction()
    })
  }

  /**
   * 事件监听器
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  /**
   * 移除事件监听器
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('事件回调执行失败:', error)
        }
      })
    }
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      currentAccount: this.currentAccount,
      networkConfig: this.networkConfig,
      tronWebReady: !!this.tronWeb
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    this.isConnected = false
    this.currentAccount = null
    this.emit('disconnected')
  }
}

/**
 * 启动连接状态轮询器，确保 $tronState 与 TronLink 同步
 */
TronWebService.prototype.startConnectionWatcher = function () {
  if (this._connectionWatcher) return
  this._connectionWatcher = setInterval(() => {
    try {
      if (!window.tronWeb) return
      const base58 = window.tronWeb?.defaultAddress?.base58 || null
      const changed = base58 !== this.currentAccount
      if (changed) {
        this.currentAccount = base58
        this.isConnected = !!base58
        console.log('🔄 轮询同步账户变化:', base58)
        this.emit('accountChanged', this.currentAccount)
      }
    } catch (e) {
      console.warn('⚠️ 轮询同步失败:', e?.message)
    }
  }, 2000)
}

/**
 * 停止连接状态轮询器
 */
TronWebService.prototype.stopConnectionWatcher = function () {
  if (this._connectionWatcher) {
    clearInterval(this._connectionWatcher)
    this._connectionWatcher = null
  }
}


// 创建单例实例
const tronWebService = new TronWebService()

export default tronWebService
