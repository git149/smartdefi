/**
 * 控制台事件日志记录器
 * 提供结构化的控制台日志输出，支持不同类型的日志消息
 * 
 * 功能特性：
 * - 分类日志记录（信息、成功、警告、错误、事件）
 * - 时间戳和格式化输出
 * - 事件详细信息解析
 * - 连接状态监控
 * - 性能统计
 */

class ConsoleEventLogger {
  constructor(options = {}) {
    this.options = {
      enableTimestamp: true,
      enableColors: true,
      enableEventDetails: true,
      maxLogHistory: 1000,
      logLevel: 'info', // debug, info, warn, error
      ...options
    }
    
    this.logHistory = []
    this.eventCount = 0
    this.errorCount = 0
    this.startTime = Date.now()
    
    // 日志级别优先级
    this.logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    }
    
    this.init()
  }

  init() {
    this.logInfo('控制台事件日志记录器已初始化')
  }

  /**
   * 获取格式化的时间戳
   */
  getTimestamp() {
    if (!this.options.enableTimestamp) return ''
    return `[${new Date().toLocaleTimeString()}]`
  }

  /**
   * 检查日志级别是否应该输出
   */
  shouldLog(level) {
    const currentLevel = this.logLevels[this.options.logLevel] || 1
    const messageLevel = this.logLevels[level] || 1
    return messageLevel >= currentLevel
  }

  /**
   * 添加日志到历史记录
   */
  addToHistory(type, message, data = null) {
    const logEntry = {
      timestamp: Date.now(),
      type,
      message,
      data
    }
    
    this.logHistory.push(logEntry)
    
    // 限制历史记录数量
    if (this.logHistory.length > this.options.maxLogHistory) {
      this.logHistory = this.logHistory.slice(-this.options.maxLogHistory)
    }
  }

  /**
   * 基础日志方法
   */
  log(level, message, category = null, data = null) {
    if (!this.shouldLog(level)) return

    const timestamp = this.getTimestamp()
    const categoryStr = category ? `[${category}]` : ''
    
    let logMessage = `${timestamp} ${categoryStr} ${message}`
    
    // 添加到历史记录
    this.addToHistory(level, message, data)
    
    // 根据级别选择控制台方法
    switch (level) {
      case 'debug':
        console.debug('🔍', logMessage, data || '')
        break
      case 'info':
        console.info('ℹ️', logMessage, data || '')
        break
      case 'warn':
        console.warn('⚠️', logMessage, data || '')
        break
      case 'error':
        console.error('❌', logMessage, data || '')
        this.errorCount++
        break
      default:
        console.log('📝', logMessage, data || '')
    }
  }

  /**
   * 信息日志
   */
  logInfo(message, category = '信息') {
    this.log('info', message, category)
  }

  /**
   * 成功日志
   */
  logSuccess(message, category = '成功') {
    this.log('info', `✅ ${message}`, category)
  }

  /**
   * 警告日志
   */
  logWarning(message, category = '警告') {
    this.log('warn', message, category)
  }

  /**
   * 错误日志
   */
  logError(message, category = '错误', error = null) {
    this.log('error', message, category, error)
  }

  /**
   * 调试日志
   */
  logDebug(message, category = '调试', data = null) {
    this.log('debug', message, category, data)
  }

  /**
   * 连接状态日志
   */
  logConnectionStatus(status) {
    const statusMessages = {
      connecting: '🔄 正在连接...',
      connected: '🟢 已连接',
      disconnected: '🔴 连接断开',
      error: '❌ 连接错误'
    }
    
    const message = statusMessages[status] || `状态: ${status}`
    this.logInfo(message, '连接')
  }

  /**
   * 事件日志 - 核心功能
   */
  logEvent(event) {
    try {
      this.eventCount++
      
      const eventName = event.eventName || event.event || '未知事件'
      const timestamp = this.getTimestamp()
      
      // 主事件日志
      console.group(`🎯 ${timestamp} 事件: ${eventName}`)
      
      // 基本信息
      this.logEventBasicInfo(event)
      
      // 事件参数
      if (this.options.enableEventDetails) {
        this.logEventParameters(event)
      }
      
      // 区块和交易信息
      this.logEventBlockInfo(event)
      
      console.groupEnd()
      
      // 添加到历史记录
      this.addToHistory('event', `事件: ${eventName}`, event)
      
    } catch (error) {
      this.logError(`处理事件日志失败: ${error.message}`, '事件日志', error)
    }
  }

  /**
   * 记录事件基本信息
   */
  logEventBasicInfo(event) {
    const eventName = event.eventName || event.event || '未知事件'
    const contractAddress = event.contractAddress || event.address || '未知合约'
    
    console.info('📍 事件名称:', eventName)
    console.info('📍 合约地址:', this.formatAddress(contractAddress))
  }

  /**
   * 记录事件参数
   */
  logEventParameters(event) {
    const params = event.result || event.returnValues || event.args || event.parameters
    
    if (params && typeof params === 'object') {
      console.info('📋 事件参数:')
      
      for (const [key, value] of Object.entries(params)) {
        if (!isNaN(key)) continue // 跳过数字索引
        
        const formattedValue = this.formatEventValue(key, value)
        console.info(`  ▸ ${key}:`, formattedValue)
      }
    }
  }

  /**
   * 记录区块和交易信息
   */
  logEventBlockInfo(event) {
    const blockNumber = event.blockNumber || event.block || event.block_number
    const transactionHash = event.transactionHash || event.transaction || event.transaction_id
    
    if (blockNumber) {
      console.info('📦 区块号:', blockNumber)
    }
    
    if (transactionHash) {
      console.info('🔗 交易ID:', this.formatTransactionHash(transactionHash))
    }
  }

  /**
   * 格式化地址显示
   */
  formatAddress(address) {
    if (!address || typeof address !== 'string') return '未知地址'
    if (address.length <= 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  /**
   * 格式化交易哈希
   */
  formatTransactionHash(hash) {
    if (!hash || typeof hash !== 'string') return '未知交易'
    if (hash.length <= 16) return hash
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  /**
   * 格式化事件值
   */
  formatEventValue(key, value) {
    // 处理地址
    if (typeof value === 'string' && value.length === 42 && value.startsWith('T')) {
      return this.formatAddress(value)
    }
    
    // 处理BigInt
    if (typeof value === 'bigint') {
      return value.toLocaleString()
    }
    
    // 处理大数字字符串
    if (typeof value === 'string' && /^\d+$/.test(value) && value.length > 10) {
      try {
        const num = BigInt(value)
        return num.toLocaleString()
      } catch (e) {
        return value
      }
    }
    
    return value
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const uptime = Date.now() - this.startTime
    
    return {
      eventCount: this.eventCount,
      errorCount: this.errorCount,
      logCount: this.logHistory.length,
      uptime: Math.floor(uptime / 1000), // 秒
      uptimeFormatted: this.formatUptime(uptime)
    }
  }

  /**
   * 格式化运行时间
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
    }
  }

  /**
   * 打印统计信息
   */
  printStats() {
    const stats = this.getStats()
    
    console.group('📊 事件监听器统计')
    console.info('🎯 事件总数:', stats.eventCount)
    console.info('❌ 错误总数:', stats.errorCount)
    console.info('📝 日志总数:', stats.logCount)
    console.info('⏱️ 运行时间:', stats.uptimeFormatted)
    console.groupEnd()
  }

  /**
   * 清空日志历史
   */
  clearHistory() {
    this.logHistory = []
    this.logInfo('日志历史已清空', '系统')
  }

  /**
   * 导出日志历史
   */
  exportHistory() {
    return {
      logs: this.logHistory,
      stats: this.getStats(),
      exportTime: new Date().toISOString()
    }
  }
}

export default ConsoleEventLogger
