/**
 * TRON 事件数据处理器
 * 负责解析、转换和分类 TRON 合约事件数据
 */

class EventDataProcessor {
  constructor(tronWeb) {
    this.tronWeb = tronWeb
    
    this.eventCategories = {
      'TokenPresalePairCreated': 'token_creation',
      'TokenPresaleLinked': 'token_linking',
      'OwnershipTransferred': 'ownership',
      'LGEConfigSet': 'lge_config',
      'VestingConfigSet': 'vesting_config', 
      'BackingConfigSet': 'backing_config',
      'CoordinatorInitialized': 'system',
      'Transfer': 'token_transfer',
      'Approval': 'token_approval',
      'PresaleContractSet': 'token_config',
      'ExcludeFeeSet': 'token_config',
      'PresaleStarted': 'presale_lifecycle',
      'PresaleEnded': 'presale_lifecycle',
      'TokensPurchased': 'presale_transaction',
      'TokensClaimed': 'presale_transaction',
      'LiquidityAdded': 'liquidity',
      'BNBAccumulated': 'presale_transaction',
      'PresaleStateChanged': 'presale_lifecycle'
    }

    this.eventPriority = {
      'TokenPresalePairCreated': 'high',
      'PresaleStarted': 'high',
      'PresaleEnded': 'high',
      'TokensPurchased': 'medium',
      'Transfer': 'low',
      'Approval': 'low'
    }

    console.log('🔧 EventDataProcessor 初始化完成')
  }

  /**
   * 处理原始事件数据
   */
  processEvent(rawEvent) {
    try {
      const baseData = this.extractBaseData(rawEvent)
      const parsedParams = this.parseEventParameters(rawEvent)
      const convertedData = this.convertAddresses(parsedParams)
      const category = this.categorizeEvent(baseData.eventName)
      const priority = this.calculatePriority(baseData.eventName)
      const formattedTimestamp = this.formatTimestamp(baseData.timestamp)
      
      const processedEvent = {
        id: this.generateEventId(rawEvent),
        eventName: baseData.eventName,
        contractAddress: baseData.contractAddress,
        blockNumber: baseData.blockNumber,
        transactionHash: baseData.transactionHash,
        timestamp: baseData.timestamp,
        formattedTime: formattedTimestamp,
        category,
        priority,
        parameters: convertedData,
        displayData: this.formatDisplayData(baseData.eventName, convertedData),
        raw: rawEvent
      }

      console.log(`✅ 事件处理完成 [${baseData.eventName}]:`, processedEvent.id)
      return processedEvent

    } catch (error) {
      console.error('❌ 事件处理失败:', error)
      return this.createErrorEvent(rawEvent, error)
    }
  }

  extractBaseData(rawEvent) {
    return {
      eventName: rawEvent.eventName || 'Unknown',
      contractAddress: this.normalizeAddress(rawEvent.contractAddress || rawEvent.address),
      blockNumber: rawEvent.blockNumber || rawEvent.block || 0,
      transactionHash: rawEvent.transactionHash || rawEvent.transaction || '',
      timestamp: rawEvent.timestamp || Date.now()
    }
  }

  parseEventParameters(rawEvent) {
    const result = rawEvent.result || rawEvent.returnValues || {}
    const parsed = {}

    if (typeof result === 'object') {
      for (const [key, value] of Object.entries(result)) {
        if (!isNaN(key)) continue
        parsed[key] = this.parseParameterValue(value)
      }
    }

    return parsed
  }

  parseParameterValue(value) {
    if (value && typeof value === 'object' && value._isBigNumber) {
      return value.toString()
    }
    
    if (Array.isArray(value)) {
      return value.map(item => this.parseParameterValue(item))
    }
    
    if (typeof value === 'string' && /^\d+$/.test(value)) {
      return value
    }
    
    return value
  }

  convertAddresses(data) {
    const converted = {}
    
    for (const [key, value] of Object.entries(data)) {
      if (this.isAddressField(key, value)) {
        converted[key] = this.normalizeAddress(value)
      } else {
        converted[key] = value
      }
    }
    
    return converted
  }

  isAddressField(key, value) {
    const addressFields = [
      'token', 'presale', 'creator', 'owner', 'to', 'from', 
      'recipient', 'sender', 'address', 'tokenAddress', 
      'presaleAddress', 'devLPReceiver', 'backingReceiver'
    ]
    
    const isAddressKey = addressFields.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    )
    
    const isAddressValue = typeof value === 'string' && 
      (value.startsWith('T') || value.startsWith('0x')) &&
      value.length >= 34
    
    return isAddressKey || isAddressValue
  }

  normalizeAddress(address) {
    if (!address || typeof address !== 'string') {
      return address
    }

    try {
      if (address.startsWith('0x')) {
        return this.tronWeb.address.fromHex(address)
      }
      
      if (address.startsWith('T') && this.tronWeb.isAddress(address)) {
        return address
      }
      
      return address
    } catch (error) {
      console.warn('⚠️ 地址格式转换失败:', address, error.message)
      return address
    }
  }

  categorizeEvent(eventName) {
    return this.eventCategories[eventName] || 'unknown'
  }

  calculatePriority(eventName) {
    return this.eventPriority[eventName] || 'medium'
  }

  formatTimestamp(timestamp) {
    try {
      const date = new Date(timestamp)
      return {
        iso: date.toISOString(),
        local: date.toLocaleString(),
        relative: this.getRelativeTime(date),
        unix: Math.floor(timestamp / 1000)
      }
    } catch (error) {
      console.warn('⚠️ 时间戳格式化失败:', timestamp)
      return {
        iso: new Date().toISOString(),
        local: new Date().toLocaleString(),
        relative: '刚刚',
        unix: Math.floor(Date.now() / 1000)
      }
    }
  }

  getRelativeTime(date) {
    const now = new Date()
    const diffMs = now - date
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return '刚刚'
    if (diffMin < 60) return `${diffMin}分钟前`
    if (diffHour < 24) return `${diffHour}小时前`
    if (diffDay < 7) return `${diffDay}天前`
    return date.toLocaleDateString()
  }

  formatDisplayData(eventName, parameters) {
    const formatters = {
      'TokenPresalePairCreated': this.formatTokenCreationEvent,
      'TokensPurchased': this.formatPurchaseEvent,
      'Transfer': this.formatTransferEvent,
      'PresaleStarted': this.formatPresaleLifecycleEvent,
      'PresaleEnded': this.formatPresaleLifecycleEvent
    }

    const formatter = formatters[eventName]
    if (formatter) {
      return formatter.call(this, parameters)
    }

    return this.formatGenericEvent(parameters)
  }

  formatTokenCreationEvent(params) {
    return {
      title: '新代币创建',
      description: `创建了新的代币预售对`,
      details: {
        '代币地址': this.formatAddress(params.token),
        '预售地址': this.formatAddress(params.presale),
        '创建者': this.formatAddress(params.creator),
        '总供应量': this.formatAmount(params.totalSupply)
      }
    }
  }

  formatPurchaseEvent(params) {
    return {
      title: '代币购买',
      description: `用户购买了代币`,
      details: {
        '购买者': this.formatAddress(params.user || params.buyer),
        '购买金额': this.formatAmount(params.amount),
        '代币数量': this.formatAmount(params.tokenAmount)
      }
    }
  }

  formatTransferEvent(params) {
    return {
      title: '代币转账',
      description: `代币转账交易`,
      details: {
        '发送方': this.formatAddress(params.from),
        '接收方': this.formatAddress(params.to),
        '数量': this.formatAmount(params.value)
      }
    }
  }

  formatPresaleLifecycleEvent(params) {
    return {
      title: '预售状态变更',
      description: `预售状态发生变化`,
      details: {
        '预售地址': this.formatAddress(params.presale),
        '新状态': params.newState || params.state,
        '操作者': this.formatAddress(params.operator)
      }
    }
  }

  formatGenericEvent(params) {
    const details = {}
    for (const [key, value] of Object.entries(params)) {
      details[key] = this.formatValue(value)
    }

    return {
      title: '合约事件',
      description: '合约事件触发',
      details
    }
  }

  formatAddress(address) {
    if (!address) return '未知地址'
    if (typeof address !== 'string') return address

    if (address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    return address
  }

  formatAmount(amount) {
    if (!amount) return '0'
    
    try {
      const num = parseFloat(amount.toString())
      if (num >= 1e18) {
        return `${(num / 1e18).toFixed(2)} (${amount})`
      }
      if (num >= 1e6) {
        return `${(num / 1e6).toFixed(2)}M`
      }
      if (num >= 1e3) {
        return `${(num / 1e3).toFixed(2)}K`
      }
      return num.toString()
    } catch (error) {
      return amount.toString()
    }
  }

  formatValue(value) {
    if (typeof value === 'string' && this.tronWeb.isAddress(value)) {
      return this.formatAddress(value)
    }
    if (typeof value === 'string' && /^\d+$/.test(value)) {
      return this.formatAmount(value)
    }
    return value
  }

  generateEventId(rawEvent) {
    const txHash = rawEvent.transactionHash || rawEvent.transaction || ''
    const blockNumber = rawEvent.blockNumber || rawEvent.block || 0
    const logIndex = rawEvent.logIndex || 0
    const eventName = rawEvent.eventName || 'unknown'
    
    return `${eventName}_${txHash}_${blockNumber}_${logIndex}_${Date.now()}`
  }

  createErrorEvent(rawEvent, error) {
    return {
      id: `error_${Date.now()}`,
      eventName: 'ProcessingError',
      contractAddress: rawEvent.contractAddress || 'unknown',
      blockNumber: rawEvent.blockNumber || 0,
      transactionHash: rawEvent.transactionHash || '',
      timestamp: Date.now(),
      category: 'error',
      priority: 'high',
      parameters: {},
      displayData: {
        title: '事件处理错误',
        description: `处理事件时发生错误: ${error.message}`,
        details: {
          '错误信息': error.message,
          '原始数据': JSON.stringify(rawEvent, null, 2)
        }
      },
      error: error.message,
      raw: rawEvent
    }
  }

  processEvents(rawEvents) {
    if (!Array.isArray(rawEvents)) {
      return []
    }

    return rawEvents.map(event => this.processEvent(event))
      .filter(event => event !== null)
  }

  getEventStats(events) {
    const stats = {
      total: events.length,
      byCategory: {},
      byPriority: {},
      byContract: {},
      timeRange: {
        earliest: null,
        latest: null
      }
    }

    events.forEach(event => {
      stats.byCategory[event.category] = (stats.byCategory[event.category] || 0) + 1
      stats.byPriority[event.priority] = (stats.byPriority[event.priority] || 0) + 1
      stats.byContract[event.contractAddress] = (stats.byContract[event.contractAddress] || 0) + 1
      
      if (!stats.timeRange.earliest || event.timestamp < stats.timeRange.earliest) {
        stats.timeRange.earliest = event.timestamp
      }
      if (!stats.timeRange.latest || event.timestamp > stats.timeRange.latest) {
        stats.timeRange.latest = event.timestamp
      }
    })

    return stats
  }
}

export default EventDataProcessor
