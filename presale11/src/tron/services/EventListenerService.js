/**
 * TRON 链上事件监听服务
 * 提供实时事件监听功能，支持 WebSocket 和轮询两种方式
 */

class EventListenerService {
  constructor(options = {}) {
    this.tronWeb = null
    this.isListening = false
    this.listeners = new Map()
    this.eventCallbacks = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5
    this.reconnectDelay = options.reconnectDelay || 3000
    this.pollingInterval = options.pollingInterval || 10000
    this.lastBlockNumber = 0
    this.eventHistory = new Set()
    this.eventListeners = new Map() // 事件监听器
    
    this.options = {
      useWebSocket: options.useWebSocket !== false,
      enablePolling: options.enablePolling !== false,
      enableDeduplication: options.enableDeduplication !== false,
      maxHistorySize: options.maxHistorySize || 1000,
      ...options
    }

    console.log('🎧 EventListenerService 初始化完成', this.options)
  }

  /**
   * 初始化服务
   */
  async initialize(tronWeb) {
    try {
      if (!tronWeb) {
        throw new Error('TronWeb 实例不能为空')
      }

      this.tronWeb = tronWeb
      
      try {
        const currentBlock = await this.tronWeb.trx.getCurrentBlock()
        this.lastBlockNumber = currentBlock.block_header.raw_data.number
        console.log('📊 当前区块高度:', this.lastBlockNumber)
      } catch (error) {
        console.warn('⚠️ 获取当前区块高度失败:', error.message)
        this.lastBlockNumber = 0
      }

      console.log('✅ EventListenerService 初始化成功')
      return true
    } catch (error) {
      console.error('❌ EventListenerService 初始化失败:', error)
      throw error
    }
  }

  /**
   * 添加合约事件监听
   */
  async addContractListener(contractAddress, contractABI, eventNames = [], callback) {
    try {
      if (!this.tronWeb) {
        throw new Error('TronWeb 未初始化')
      }

      if (!this.tronWeb.isAddress(contractAddress)) {
        throw new Error(`无效的合约地址: ${contractAddress}`)
      }

      const contract = await this.tronWeb.contract(contractABI, contractAddress)
      const listenerId = `${contractAddress}_${Date.now()}`
      
      this.listeners.set(listenerId, {
        contractAddress,
        contract,
        eventNames: eventNames.length > 0 ? eventNames : this.extractEventNames(contractABI),
        callback,
        isActive: false
      })

      this.eventCallbacks.set(listenerId, callback)

      console.log(`📡 添加合约监听器: ${contractAddress}`, {
        listenerId,
        eventNames: this.listeners.get(listenerId).eventNames
      })

      return listenerId
    } catch (error) {
      console.error('❌ 添加合约监听器失败:', error)
      throw error
    }
  }

  /**
   * 开始监听事件
   */
  async startListening() {
    if (this.isListening) {
      console.log('⚠️ 事件监听已在运行中')
      return
    }

    this.isListening = true
    console.log('🚀 开始事件监听...')

    try {
      if (this.options.useWebSocket) {
        await this.startWebSocketListening()
      }

      if (this.options.enablePolling) {
        this.startPollingListening()
      }

      console.log('✅ 事件监听启动成功')
    } catch (error) {
      console.error('❌ 启动事件监听失败:', error)
      this.isListening = false
      throw error
    }
  }

  /**
   * WebSocket 事件监听
   */
  async startWebSocketListening() {
    try {
      for (const [listenerId, listener] of this.listeners) {
        await this.startContractWebSocketListener(listenerId, listener)
      }
    } catch (error) {
      console.error('❌ WebSocket 监听启动失败:', error)
      if (!this.options.enablePolling) {
        throw error
      }
    }
  }

  /**
   * 启动单个合约的 WebSocket 监听
   */
  async startContractWebSocketListener(listenerId, listener) {
    try {
      const { contract, eventNames, callback } = listener

      for (const eventName of eventNames) {
        try {
          const eventListener = contract[eventName]()

          eventListener.watch((error, result) => {
            if (error) {
              console.error(`❌ 事件监听错误 [${eventName}]:`, error)
              this.handleListenerError(listenerId, error)
              return
            }

            if (result) {
              this.handleEvent(listenerId, eventName, result, callback)
            }
          })

          listener.isActive = true
          console.log(`✅ WebSocket 监听已启动: ${listener.contractAddress} - ${eventName}`)

        } catch (error) {
          console.error(`❌ 启动事件监听失败 [${eventName}]:`, error)
        }
      }
    } catch (error) {
      console.error(`❌ 启动合约 WebSocket 监听失败:`, error)
      throw error
    }
  }

  /**
   * 轮询事件监听
   */
  startPollingListening() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer)
    }

    this.pollingTimer = setInterval(async () => {
      if (!this.isListening) return

      try {
        await this.pollEvents()
      } catch (error) {
        console.error('❌ 轮询事件失败:', error)
      }
    }, this.pollingInterval)

    console.log(`🔄 轮询监听已启动，间隔: ${this.pollingInterval}ms`)
  }

  /**
   * 轮询获取事件
   */
  async pollEvents() {
    try {
      const currentBlock = await this.tronWeb.trx.getCurrentBlock()
      const currentBlockNumber = currentBlock.block_header.raw_data.number

      if (currentBlockNumber <= this.lastBlockNumber) {
        return
      }

      for (const [listenerId, listener] of this.listeners) {
        await this.pollContractEvents(listenerId, listener, this.lastBlockNumber + 1, currentBlockNumber)
      }

      this.lastBlockNumber = currentBlockNumber
    } catch (error) {
      console.error('❌ 轮询事件失败:', error)
    }
  }

  /**
   * 轮询单个合约的事件
   */
  async pollContractEvents(listenerId, listener, fromBlock, toBlock) {
    try {
      const { contract, eventNames, callback } = listener

      for (const eventName of eventNames) {
        try {
          const events = await contract[eventName]().get({
            fromBlock,
            toBlock
          })

          if (events && events.length > 0) {
            for (const event of events) {
              this.handleEvent(listenerId, eventName, event, callback)
            }
          }
        } catch (error) {
          console.warn(`⚠️ 轮询事件失败 [${eventName}]:`, error.message)
        }
      }
    } catch (error) {
      console.error(`❌ 轮询合约事件失败:`, error)
    }
  }

  /**
   * 处理事件
   */
  handleEvent(listenerId, eventName, eventData, callback) {
    try {
      if (this.options.enableDeduplication) {
        const eventId = this.generateEventId(eventData)
        if (this.eventHistory.has(eventId)) {
          return
        }
        this.eventHistory.add(eventId)
        
        if (this.eventHistory.size > this.options.maxHistorySize) {
          const firstItem = this.eventHistory.values().next().value
          this.eventHistory.delete(firstItem)
        }
      }

      const formattedEvent = this.formatEventData(eventName, eventData)
      
      console.log(`📨 收到事件 [${eventName}]:`, formattedEvent)

      if (callback && typeof callback === 'function') {
        callback(formattedEvent)
      }
    } catch (error) {
      console.error('❌ 处理事件失败:', error)
    }
  }

  /**
   * 格式化事件数据
   */
  formatEventData(eventName, eventData) {
    return {
      eventName,
      contractAddress: eventData.contract || eventData.address,
      blockNumber: eventData.block || eventData.blockNumber,
      transactionHash: eventData.transaction || eventData.transactionHash,
      timestamp: eventData.timestamp || Date.now(),
      result: eventData.result || eventData.returnValues || eventData,
      raw: eventData
    }
  }

  /**
   * 生成事件唯一ID用于去重
   */
  generateEventId(eventData) {
    const txHash = eventData.transaction || eventData.transactionHash || ''
    const blockNumber = eventData.block || eventData.blockNumber || 0
    const logIndex = eventData.logIndex || 0
    return `${txHash}_${blockNumber}_${logIndex}`
  }

  /**
   * 从ABI中提取事件名称
   */
  extractEventNames(abi) {
    return abi
      .filter(item => item.type === 'event')
      .map(item => item.name)
  }

  /**
   * 处理监听器错误
   */
  handleListenerError(listenerId, error) {
    console.error(`❌ 监听器错误 [${listenerId}]:`, error)
    
    if (this.isNetworkError(error)) {
      this.attemptReconnect(listenerId)
    }
  }

  /**
   * 判断是否为网络错误
   */
  isNetworkError(error) {
    const networkErrorMessages = [
      'network error', 'connection failed', 'timeout', 'disconnected', 'ECONNRESET', 'ENOTFOUND'
    ]
    
    const errorMessage = error.message || error.toString()
    return networkErrorMessages.some(msg => 
      errorMessage.toLowerCase().includes(msg.toLowerCase())
    )
  }

  /**
   * 尝试重连
   */
  async attemptReconnect(listenerId) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`❌ 重连次数已达上限 [${listenerId}]`)
      this.emit('maxReconnectAttemptsReached', { listenerId })
      return
    }

    this.reconnectAttempts++
    console.log(`🔄 尝试重连 [${listenerId}] (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    this.emit('reconnectAttempt', { 
      listenerId, 
      attempt: this.reconnectAttempts, 
      maxAttempts: this.maxReconnectAttempts 
    })

    const backoffDelay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000
    )

    setTimeout(async () => {
      try {
        const listener = this.listeners.get(listenerId)
        if (listener) {
          await this.startContractWebSocketListener(listenerId, listener)
          this.reconnectAttempts = 0
          console.log(`✅ 重连成功 [${listenerId}]`)
          this.emit('reconnectSuccess', { listenerId })
        }
      } catch (error) {
        console.error(`❌ 重连失败 [${listenerId}]:`, error)
        this.emit('reconnectFailed', { listenerId, error })
        this.attemptReconnect(listenerId)
      }
    }, backoffDelay)
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

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('❌ 事件回调执行失败:', error)
        }
      })
    }
  }

  /**
   * 停止监听事件
   */
  stopListening() {
    this.isListening = false
    
    for (const [listenerId, listener] of this.listeners) {
      this.stopContractListener(listenerId)
    }

    if (this.pollingTimer) {
      clearInterval(this.pollingTimer)
      this.pollingTimer = null
    }

    console.log('🛑 事件监听已停止')
  }

  stopContractListener(listenerId) {
    const listener = this.listeners.get(listenerId)
    if (listener) {
      listener.isActive = false
      console.log(`🛑 停止监听器: ${listenerId}`)
    }
  }

  getListenerStatus() {
    const status = {
      isListening: this.isListening,
      totalListeners: this.listeners.size,
      activeListeners: 0,
      lastBlockNumber: this.lastBlockNumber,
      eventHistorySize: this.eventHistory.size,
      reconnectAttempts: this.reconnectAttempts
    }

    for (const listener of this.listeners.values()) {
      if (listener.isActive) {
        status.activeListeners++
      }
    }

    return status
  }

  destroy() {
    this.stopListening()
    this.listeners.clear()
    this.eventCallbacks.clear()
    this.eventHistory.clear()
    this.eventListeners.clear()
    console.log('🧹 EventListenerService 已清理')
  }
}

export default EventListenerService
