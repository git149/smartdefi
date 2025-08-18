/**
 * 全局事件监控器
 * 在应用启动时自动开始监听链上事件并在控制台显示
 * 
 * 功能特性：
 * - 自动初始化和启动事件监听
 * - 控制台实时显示事件
 * - 全局错误处理
 * - 自动重连机制
 * - 性能监控
 */

import ContractEventManager from './ContractEventManager.js'
import ConsoleEventLogger from './ConsoleEventLogger.js'
import TronWebService from './TronWebService.js'

class GlobalEventMonitor {
  constructor() {
    this.eventManager = null
    this.logger = null
    this.tronWebService = null
    this.isRunning = false
    this.initializationAttempts = 0
    this.maxInitializationAttempts = 3
    
    // 配置选项
    this.config = {
      coordinatorAddress: 'TTMTNpZPeaxV9aT3mDuhMT7t6Suu1NtMrc',
      enableAutoStart: true,
      enableConsoleLogging: true,
      loggerOptions: {
        enableColors: true,
        showTimestamp: true,
        showDetails: true,
        logLevel: 'info'
      },
      eventManagerOptions: {
        enableAutoDiscovery: true,
        discoveryInterval: 30000,
        listenerOptions: {
          useWebSocket: true,
          enablePolling: true,
          pollingInterval: 10000,
          maxReconnectAttempts: 5,
          reconnectDelay: 3000
        },
        storeOptions: {
          maxCacheSize: 1000,
          enablePersistence: true,
          expirationTime: 7 * 24 * 60 * 60 * 1000
        }
      }
    }

    // 绑定到全局对象，方便调试
    if (typeof window !== 'undefined') {
      window.eventMonitor = this
    } else if (typeof global !== 'undefined') {
      global.eventMonitor = this
    }
  }

  /**
   * 初始化监控器
   */
  async initialize() {
    try {
      this.initializationAttempts++
      
      console.log('🚀 正在初始化全局事件监控器...')
      
      // 1. 初始化控制台日志记录器
      this.logger = new ConsoleEventLogger(this.config.loggerOptions)
      this.logger.logInfo('控制台日志记录器已初始化')
      
      // 2. 初始化 TronWeb 服务
      this.tronWebService = new TronWebService()
      await this.tronWebService.initialize()
      
      if (!this.tronWebService.isConnected) {
        throw new Error('TronWeb 连接失败')
      }
      
      this.logger.logInfo('TronWeb 服务已连接')
      this.logger.logConnectionStatus('connected')
      
      // 3. 初始化事件管理器
      this.eventManager = new ContractEventManager(
        this.tronWebService.tronWeb,
        this.config.eventManagerOptions
      )
      
      // 4. 设置事件回调
      this.eventManager.addEventListener((event) => {
        this.handleEvent(event)
      })
      
      // 5. 初始化事件管理器
      await this.eventManager.initialize()
      this.logger.logInfo('事件管理器已初始化')
      
      // 6. 启动事件监听
      await this.eventManager.start()
      this.logger.logInfo('事件监听已启动')
      
      this.isRunning = true
      this.initializationAttempts = 0
      
      // 显示启动成功信息
      this.showStartupInfo()
      
      // 设置错误处理
      this.setupErrorHandling()
      
      console.log('✅ 全局事件监控器启动成功！')
      
    } catch (error) {
      console.error('❌ 全局事件监控器初始化失败:', error)
      this.logger?.logError('初始化失败', error)
      
      // 如果还有重试机会，延迟重试
      if (this.initializationAttempts < this.maxInitializationAttempts) {
        const delay = this.initializationAttempts * 5000 // 递增延迟
        console.log(`🔄 ${delay/1000}秒后重试初始化 (${this.initializationAttempts}/${this.maxInitializationAttempts})`)
        
        setTimeout(() => {
          this.initialize()
        }, delay)
      } else {
        console.error('💥 初始化重试次数已用完，请检查网络连接和配置')
      }
    }
  }

  /**
   * 处理事件
   */
  handleEvent(event) {
    try {
      // 记录到控制台
      if (this.logger) {
        this.logger.logEvent(event)
      }
      
      // 可以在这里添加其他事件处理逻辑
      this.processSpecialEvents(event)
      
    } catch (error) {
      console.error('❌ 处理事件失败:', error)
      this.logger?.logError('事件处理失败', error)
    }
  }

  /**
   * 处理特殊事件
   */
  processSpecialEvents(event) {
    // 处理代币创建事件
    if (event.eventName === 'TokenPresalePairCreated') {
      this.logger?.logInfo(`🎉 新代币对创建: ${event.parameters.token}`)
    }
    
    // 处理大额交易
    if (event.eventName === 'TokensPurchased') {
      const amount = parseFloat(event.parameters.amount || 0)
      if (amount > 1000) { // 大于1000 TRX的交易
        this.logger?.logInfo(`💰 大额购买: ${amount} TRX`)
      }
    }
    
    // 处理预售状态变更
    if (event.eventName === 'PresaleStateChanged') {
      this.logger?.logInfo(`🔄 预售状态变更: ${event.parameters.newState}`)
    }
  }

  /**
   * 设置错误处理
   */
  setupErrorHandling() {
    // 监听 TronWeb 连接状态变化
    if (this.tronWebService) {
      this.tronWebService.on('connectionChanged', (isConnected) => {
        const status = isConnected ? 'connected' : 'disconnected'
        this.logger?.logConnectionStatus(status)
        
        if (!isConnected) {
          this.logger?.logWarn('TronWeb 连接已断开，尝试重连...')
        }
      })
    }
    
    // 全局错误处理
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logger?.logError('全局错误', event.error)
      })
      
      window.addEventListener('unhandledrejection', (event) => {
        this.logger?.logError('未处理的Promise拒绝', event.reason)
      })
    }
  }

  /**
   * 显示启动信息
   */
  showStartupInfo() {
    console.log('\n🎯 ===== 事件监控器启动信息 =====')
    console.log(`📡 监听合约: ${this.config.coordinatorAddress}`)
    console.log(`🔧 WebSocket: ${this.config.eventManagerOptions.listenerOptions.useWebSocket ? '启用' : '禁用'}`)
    console.log(`🔄 轮询备用: ${this.config.eventManagerOptions.listenerOptions.enablePolling ? '启用' : '禁用'}`)
    console.log(`🔍 自动发现: ${this.config.eventManagerOptions.enableAutoDiscovery ? '启用' : '禁用'}`)
    console.log(`💾 数据持久化: ${this.config.eventManagerOptions.storeOptions.enablePersistence ? '启用' : '禁用'}`)
    console.log('================================\n')
    
    // 显示可用的调试命令
    console.log('🔧 可用的调试命令:')
    console.log('  eventMonitor.getStatus()     - 获取监控器状态')
    console.log('  eventMonitor.getStats()      - 获取事件统计')
    console.log('  eventMonitor.restart()       - 重启监控器')
    console.log('  eventMonitor.stop()          - 停止监控器')
    console.log('  eventMonitor.logger.showHelp() - 显示日志命令')
    console.log('')
  }

  /**
   * 获取监控器状态
   */
  getStatus() {
    const status = {
      isRunning: this.isRunning,
      initializationAttempts: this.initializationAttempts,
      tronWebConnected: this.tronWebService?.isConnected || false,
      eventManagerStatus: this.eventManager?.getStatus() || null,
      loggerStats: this.logger?.getStats() || null
    }
    
    console.log('📊 监控器状态:', status)
    return status
  }

  /**
   * 获取事件统计
   */
  getStats() {
    if (this.eventManager) {
      const stats = this.eventManager.getEventStats()
      console.log('📈 事件统计:', stats)
      return stats
    } else {
      console.log('⚠️ 事件管理器未初始化')
      return null
    }
  }

  /**
   * 获取最新事件
   */
  getLatestEvents(count = 10) {
    if (this.eventManager) {
      const events = this.eventManager.getLatestEvents(count)
      console.log(`📋 最新 ${count} 个事件:`, events)
      return events
    } else {
      console.log('⚠️ 事件管理器未初始化')
      return []
    }
  }

  /**
   * 重启监控器
   */
  async restart() {
    console.log('🔄 正在重启事件监控器...')
    
    try {
      await this.stop()
      await new Promise(resolve => setTimeout(resolve, 2000)) // 等待2秒
      await this.initialize()
      console.log('✅ 事件监控器重启成功')
    } catch (error) {
      console.error('❌ 重启失败:', error)
      this.logger?.logError('重启失败', error)
    }
  }

  /**
   * 停止监控器
   */
  async stop() {
    console.log('🛑 正在停止事件监控器...')
    
    try {
      this.isRunning = false
      
      if (this.eventManager) {
        this.eventManager.stop()
        this.eventManager.destroy()
        this.eventManager = null
      }
      
      if (this.tronWebService) {
        // TronWebService 通常不需要显式停止
        this.tronWebService = null
      }
      
      this.logger?.logInfo('事件监控器已停止')
      console.log('✅ 事件监控器已停止')
      
    } catch (error) {
      console.error('❌ 停止监控器时出错:', error)
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    console.log('⚙️ 配置已更新:', this.config)
    
    // 如果正在运行，建议重启
    if (this.isRunning) {
      console.log('💡 配置已更新，建议执行 eventMonitor.restart() 以应用新配置')
    }
  }
}

// 创建全局实例
const globalEventMonitor = new GlobalEventMonitor()

// 自动启动（如果启用）
if (globalEventMonitor.config.enableAutoStart) {
  // 延迟启动，确保其他服务已初始化
  setTimeout(() => {
    globalEventMonitor.initialize().catch(error => {
      console.error('自动启动失败:', error)
    })
  }, 2000)
}

export default globalEventMonitor
