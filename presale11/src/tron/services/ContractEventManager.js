/**
 * 多合约事件管理器
 * 统一管理 CoordinatorFactory 及其创建的所有合约的事件监听
 */

import EventListenerService from './EventListenerService.js'
import EventDataProcessor from './EventDataProcessor.js'
import EventStore from './EventStore.js'

class ContractEventManager {
  constructor(tronWeb, options = {}) {
    this.tronWeb = tronWeb
    this.options = {
      coordinatorAddress: options.coordinatorAddress || 'TTMTNpZPeaxV9aT3mDuhMT7t6Suu1NtMrc',
      enableAutoDiscovery: options.enableAutoDiscovery !== false,
      discoveryInterval: options.discoveryInterval || 30000,
      maxContracts: options.maxContracts || 100,
      ...options
    }

    this.eventListener = new EventListenerService(options.listenerOptions)
    this.dataProcessor = new EventDataProcessor(tronWeb)
    this.eventStore = new EventStore(options.storeOptions)

    this.contracts = new Map()
    this.contractRelations = new Map()
    this.listeners = new Map()
    this.eventCallbacks = new Set()
    this.abiCache = new Map()

    this.isRunning = false
    this.discoveryTimer = null

    console.log('🎛️ ContractEventManager 初始化完成')
  }

  async initialize() {
    try {
      await this.eventListener.initialize(this.tronWeb)
      await this.eventStore.initialize()
      await this.loadContractABIs()
      await this.addCoordinatorFactoryListener()

      if (this.options.enableAutoDiscovery) {
        this.startAutoDiscovery()
      }

      console.log('✅ ContractEventManager 初始化成功')
      return true

    } catch (error) {
      console.error('❌ ContractEventManager 初始化失败:', error)
      throw error
    }
  }

  async loadContractABIs() {
    try {
      // 使用相对路径加载ABI文件
      const coordinatorABI = await this.loadABI('./contract/CoordinatorFactoryABI.json')
      this.abiCache.set('CoordinatorFactory', coordinatorABI)

      const tokenABI = await this.loadABI('./contract/tokenABI.json')
      this.abiCache.set('Token', tokenABI)

      const presaleABI = await this.loadABI('./contract/presaleABI.json')
      this.abiCache.set('Presale', presaleABI)

      console.log('📋 合约ABI加载完成')
    } catch (error) {
      console.error('❌ 加载合约ABI失败:', error)
      // 使用内置的基础ABI作为备用
      this.loadFallbackABIs()
    }
  }

  loadFallbackABIs() {
    // 基础的事件ABI定义
    const basicEventABI = [
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "token", "type": "address"},
          {"indexed": true, "name": "presale", "type": "address"},
          {"indexed": true, "name": "creator", "type": "address"},
          {"indexed": false, "name": "totalSupply", "type": "uint256"}
        ],
        "name": "TokenPresalePairCreated",
        "type": "event"
      }
    ]

    this.abiCache.set('CoordinatorFactory', basicEventABI)
    this.abiCache.set('Token', basicEventABI)
    this.abiCache.set('Presale', basicEventABI)
    
    console.log('📋 使用备用ABI配置')
  }

  async loadABI(path) {
    try {
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`❌ 加载ABI失败 [${path}]:`, error)
      throw error
    }
  }

  async addCoordinatorFactoryListener() {
    try {
      const coordinatorABI = this.abiCache.get('CoordinatorFactory')
      if (!coordinatorABI) {
        throw new Error('CoordinatorFactory ABI 未加载')
      }

      const listenerId = await this.eventListener.addContractListener(
        this.options.coordinatorAddress,
        coordinatorABI,
        [],
        (event) => this.handleCoordinatorEvent(event)
      )

      this.listeners.set('coordinator', listenerId)

      this.contracts.set(this.options.coordinatorAddress, {
        type: 'CoordinatorFactory',
        address: this.options.coordinatorAddress,
        abi: coordinatorABI,
        listenerId,
        addedAt: Date.now()
      })

      console.log(`📡 CoordinatorFactory 监听器已添加: ${this.options.coordinatorAddress}`)

    } catch (error) {
      console.error('❌ 添加 CoordinatorFactory 监听器失败:', error)
      throw error
    }
  }

  async handleCoordinatorEvent(rawEvent) {
    try {
      const processedEvent = this.dataProcessor.processEvent(rawEvent)
      this.eventStore.addEvent(processedEvent)
      await this.handleContractCreationEvent(processedEvent)
      this.dispatchEvent(processedEvent)

      console.log(`📨 CoordinatorFactory 事件处理完成: ${processedEvent.eventName}`)

    } catch (error) {
      console.error('❌ 处理 CoordinatorFactory 事件失败:', error)
    }
  }

  async handleContractCreationEvent(event) {
    try {
      if (event.eventName === 'TokenPresalePairCreated') {
        const { token, presale, creator } = event.parameters

        this.contractRelations.set(token, {
          presale,
          creator,
          createdAt: event.timestamp
        })

        await this.addTokenContractListener(token)
        await this.addPresaleContractListener(presale)

        console.log(`🎯 新合约对已发现: Token=${token}, Presale=${presale}`)
      }
    } catch (error) {
      console.error('❌ 处理合约创建事件失败:', error)
    }
  }

  async addTokenContractListener(tokenAddress) {
    try {
      if (this.contracts.has(tokenAddress)) {
        console.log(`⚠️ Token 合约已在监听: ${tokenAddress}`)
        return
      }

      const tokenABI = this.abiCache.get('Token')
      if (!tokenABI) {
        throw new Error('Token ABI 未加载')
      }

      const listenerId = await this.eventListener.addContractListener(
        tokenAddress,
        tokenABI,
        ['Transfer', 'Approval', 'PresaleContractSet', 'ExcludeFeeSet'],
        (event) => this.handleTokenEvent(event, tokenAddress)
      )

      this.contracts.set(tokenAddress, {
        type: 'Token',
        address: tokenAddress,
        abi: tokenABI,
        listenerId,
        addedAt: Date.now()
      })

      console.log(`📡 Token 监听器已添加: ${tokenAddress}`)

    } catch (error) {
      console.error(`❌ 添加 Token 监听器失败 [${tokenAddress}]:`, error)
    }
  }

  async addPresaleContractListener(presaleAddress) {
    try {
      if (this.contracts.has(presaleAddress)) {
        console.log(`⚠️ Presale 合约已在监听: ${presaleAddress}`)
        return
      }

      const presaleABI = this.abiCache.get('Presale')
      if (!presaleABI) {
        throw new Error('Presale ABI 未加载')
      }

      const listenerId = await this.eventListener.addContractListener(
        presaleAddress,
        presaleABI,
        ['TokensPurchased', 'TokensClaimed', 'PresaleStateChanged', 'LiquidityAdded'],
        (event) => this.handlePresaleEvent(event, presaleAddress)
      )

      this.contracts.set(presaleAddress, {
        type: 'Presale',
        address: presaleAddress,
        abi: presaleABI,
        listenerId,
        addedAt: Date.now()
      })

      console.log(`📡 Presale 监听器已添加: ${presaleAddress}`)

    } catch (error) {
      console.error(`❌ 添加 Presale 监听器失败 [${presaleAddress}]:`, error)
    }
  }

  async handleTokenEvent(rawEvent, tokenAddress) {
    try {
      const processedEvent = this.dataProcessor.processEvent(rawEvent)
      processedEvent.contractType = 'Token'
      processedEvent.relatedContracts = this.getRelatedContracts(tokenAddress)
      
      this.eventStore.addEvent(processedEvent)
      this.dispatchEvent(processedEvent)

      console.log(`📨 Token 事件处理完成: ${processedEvent.eventName} [${tokenAddress}]`)

    } catch (error) {
      console.error(`❌ 处理 Token 事件失败 [${tokenAddress}]:`, error)
    }
  }

  async handlePresaleEvent(rawEvent, presaleAddress) {
    try {
      const processedEvent = this.dataProcessor.processEvent(rawEvent)
      processedEvent.contractType = 'Presale'
      processedEvent.relatedContracts = this.getRelatedContracts(presaleAddress)
      
      this.eventStore.addEvent(processedEvent)
      this.dispatchEvent(processedEvent)

      console.log(`📨 Presale 事件处理完成: ${processedEvent.eventName} [${presaleAddress}]`)

    } catch (error) {
      console.error(`❌ 处理 Presale 事件失败 [${presaleAddress}]:`, error)
    }
  }

  getRelatedContracts(contractAddress) {
    const related = {}
    
    for (const [token, relation] of this.contractRelations) {
      if (token === contractAddress) {
        related.presale = relation.presale
        related.creator = relation.creator
        break
      }
      if (relation.presale === contractAddress) {
        related.token = token
        related.creator = relation.creator
        break
      }
    }
    
    return related
  }

  dispatchEvent(event) {
    for (const callback of this.eventCallbacks) {
      try {
        callback(event)
      } catch (error) {
        console.error('❌ 事件回调执行失败:', error)
      }
    }
  }

  addEventListener(callback) {
    if (typeof callback === 'function') {
      this.eventCallbacks.add(callback)
      console.log('📞 事件回调已添加')
    }
  }

  removeEventListener(callback) {
    this.eventCallbacks.delete(callback)
    console.log('📞 事件回调已移除')
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ ContractEventManager 已在运行')
      return
    }

    try {
      await this.eventListener.startListening()
      this.isRunning = true
      console.log('🚀 ContractEventManager 已启动')
    } catch (error) {
      console.error('❌ 启动 ContractEventManager 失败:', error)
      throw error
    }
  }

  stop() {
    this.eventListener.stopListening()
    this.stopAutoDiscovery()
    this.isRunning = false
    console.log('🛑 ContractEventManager 已停止')
  }

  startAutoDiscovery() {
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer)
    }

    this.discoveryTimer = setInterval(async () => {
      await this.discoverNewContracts()
    }, this.options.discoveryInterval)

    console.log(`🔍 自动发现已启动，间隔: ${this.options.discoveryInterval}ms`)
  }

  stopAutoDiscovery() {
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer)
      this.discoveryTimer = null
      console.log('🔍 自动发现已停止')
    }
  }

  async discoverNewContracts() {
    try {
      const recentEvents = this.eventStore.queryEvents(
        { 
          eventName: 'TokenPresalePairCreated',
          fromTime: Date.now() - this.options.discoveryInterval * 2
        },
        { limit: 10, sortBy: 'timestamp', sortOrder: 'desc' }
      )

      for (const event of recentEvents.events) {
        const { token, presale } = event.parameters
        
        if (!this.contracts.has(token)) {
          await this.addTokenContractListener(token)
        }
        if (!this.contracts.has(presale)) {
          await this.addPresaleContractListener(presale)
        }
      }

    } catch (error) {
      console.error('❌ 发现新合约失败:', error)
    }
  }

  getContracts() {
    return Array.from(this.contracts.values())
  }

  getContractRelations() {
    return Array.from(this.contractRelations.entries()).map(([token, relation]) => ({
      token,
      ...relation
    }))
  }

  getEventStats(filters = {}) {
    return this.eventStore.getEventStats(filters)
  }

  queryEvents(filters = {}, options = {}) {
    return this.eventStore.queryEvents(filters, options)
  }

  getLatestEvents(count = 10, filters = {}) {
    return this.eventStore.getLatestEvents(count, filters)
  }

  getContractEvents(contractAddress, limit = 50) {
    return this.eventStore.getContractEvents(contractAddress, limit)
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      contractCount: this.contracts.size,
      relationCount: this.contractRelations.size,
      listenerCount: this.listeners.size,
      callbackCount: this.eventCallbacks.size,
      eventListenerStatus: this.eventListener.getListenerStatus(),
      eventStoreStatus: this.eventStore.getStatus(),
      options: this.options
    }
  }

  destroy() {
    this.stop()
    this.eventListener.destroy()
    this.eventStore.destroy()
    
    this.contracts.clear()
    this.contractRelations.clear()
    this.listeners.clear()
    this.eventCallbacks.clear()
    this.abiCache.clear()

    console.log('🗑️ ContractEventManager 已销毁')
  }
}

export default ContractEventManager
