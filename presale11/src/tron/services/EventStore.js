/**
 * 事件数据存储管理器
 * 负责事件数据的缓存、持久化存储和去重机制
 */

class EventStore {
  constructor(options = {}) {
    this.options = {
      maxCacheSize: options.maxCacheSize || 1000,
      maxStorageSize: options.maxStorageSize || 5000,
      storageKey: options.storageKey || 'tron_events',
      expirationTime: options.expirationTime || 7 * 24 * 60 * 60 * 1000,
      enablePersistence: options.enablePersistence !== false,
      enableDeduplication: options.enableDeduplication !== false,
      autoCleanup: options.autoCleanup !== false,
      cleanupInterval: options.cleanupInterval || 60 * 60 * 1000,
      ...options
    }

    this.cache = new Map()
    this.eventIndex = new Map()
    this.duplicateIndex = new Set()

    this.stats = {
      totalEvents: 0,
      cacheHits: 0,
      cacheMisses: 0,
      duplicatesBlocked: 0,
      lastCleanup: Date.now()
    }

    this.initialize()
    console.log('💾 EventStore 初始化完成', this.options)
  }

  async initialize() {
    try {
      if (this.options.enablePersistence) {
        await this.loadFromStorage()
      }

      if (this.options.autoCleanup) {
        this.startAutoCleanup()
      }

      console.log('✅ EventStore 初始化成功')
    } catch (error) {
      console.error('❌ EventStore 初始化失败:', error)
    }
  }

  addEvent(event) {
    try {
      if (!this.validateEvent(event)) {
        console.warn('⚠️ 无效的事件数据:', event)
        return false
      }

      if (this.options.enableDeduplication && this.isDuplicate(event)) {
        this.stats.duplicatesBlocked++
        console.log(`🔄 重复事件已跳过: ${event.id}`)
        return false
      }

      this.cache.set(event.id, event)
      this.updateIndexes(event)
      this.stats.totalEvents++
      this.enforceCacheLimit()

      if (this.options.enablePersistence) {
        this.saveToStorage()
      }

      console.log(`✅ 事件已添加: ${event.id} [${event.eventName}]`)
      return true

    } catch (error) {
      console.error('❌ 添加事件失败:', error)
      return false
    }
  }

  addEvents(events) {
    if (!Array.isArray(events)) {
      return 0
    }

    let successCount = 0
    for (const event of events) {
      if (this.addEvent(event)) {
        successCount++
      }
    }

    console.log(`📦 批量添加事件完成: ${successCount}/${events.length}`)
    return successCount
  }

  getEvent(eventId) {
    if (this.cache.has(eventId)) {
      this.stats.cacheHits++
      return this.cache.get(eventId)
    }

    this.stats.cacheMisses++
    return null
  }

  queryEvents(filters = {}, options = {}) {
    const {
      limit = 100,
      offset = 0,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = options

    let events = Array.from(this.cache.values())
    events = this.applyFilters(events, filters)
    events = this.sortEvents(events, sortBy, sortOrder)

    const total = events.length
    events = events.slice(offset, offset + limit)

    return {
      events,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    }
  }

  applyFilters(events, filters) {
    return events.filter(event => {
      if (filters.contractAddress && event.contractAddress !== filters.contractAddress) {
        return false
      }

      if (filters.eventName && event.eventName !== filters.eventName) {
        return false
      }

      if (filters.category && event.category !== filters.category) {
        return false
      }

      if (filters.priority && event.priority !== filters.priority) {
        return false
      }

      if (filters.fromTime && event.timestamp < filters.fromTime) {
        return false
      }
      if (filters.toTime && event.timestamp > filters.toTime) {
        return false
      }

      if (filters.fromBlock && event.blockNumber < filters.fromBlock) {
        return false
      }
      if (filters.toBlock && event.blockNumber > filters.toBlock) {
        return false
      }

      return true
    })
  }

  sortEvents(events, sortBy, sortOrder) {
    return events.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (typeof aValue === 'string' && !isNaN(aValue)) {
        aValue = parseFloat(aValue)
        bValue = parseFloat(bValue)
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      }
    })
  }

  getLatestEvents(count = 10, filters = {}) {
    const result = this.queryEvents(filters, {
      limit: count,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    })
    return result.events
  }

  getContractEvents(contractAddress, limit = 50) {
    return this.queryEvents(
      { contractAddress },
      { limit, sortBy: 'timestamp', sortOrder: 'desc' }
    ).events
  }

  getEventStats(filters = {}) {
    const events = this.applyFilters(Array.from(this.cache.values()), filters)
    
    const stats = {
      total: events.length,
      byCategory: {},
      byPriority: {},
      byContract: {},
      byEventName: {},
      timeRange: {
        earliest: null,
        latest: null
      },
      recentActivity: this.getRecentActivity(events)
    }

    events.forEach(event => {
      stats.byCategory[event.category] = (stats.byCategory[event.category] || 0) + 1
      stats.byPriority[event.priority] = (stats.byPriority[event.priority] || 0) + 1
      stats.byContract[event.contractAddress] = (stats.byContract[event.contractAddress] || 0) + 1
      stats.byEventName[event.eventName] = (stats.byEventName[event.eventName] || 0) + 1
      
      if (!stats.timeRange.earliest || event.timestamp < stats.timeRange.earliest) {
        stats.timeRange.earliest = event.timestamp
      }
      if (!stats.timeRange.latest || event.timestamp > stats.timeRange.latest) {
        stats.timeRange.latest = event.timestamp
      }
    })

    return stats
  }

  getRecentActivity(events) {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    const oneDay = 24 * oneHour

    return {
      lastHour: events.filter(e => now - e.timestamp < oneHour).length,
      lastDay: events.filter(e => now - e.timestamp < oneDay).length,
      lastWeek: events.filter(e => now - e.timestamp < 7 * oneDay).length
    }
  }

  validateEvent(event) {
    return event &&
           typeof event === 'object' &&
           event.id &&
           event.eventName &&
           event.contractAddress &&
           typeof event.timestamp === 'number'
  }

  isDuplicate(event) {
    return this.duplicateIndex.has(event.id)
  }

  updateIndexes(event) {
    this.duplicateIndex.add(event.id)
    
    const indexKey = `${event.contractAddress}_${event.eventName}`
    if (!this.eventIndex.has(indexKey)) {
      this.eventIndex.set(indexKey, [])
    }
    this.eventIndex.get(indexKey).push(event.id)
  }

  enforceCacheLimit() {
    if (this.cache.size <= this.options.maxCacheSize) {
      return
    }

    const events = Array.from(this.cache.values())
      .sort((a, b) => a.timestamp - b.timestamp)
    
    const toRemove = events.slice(0, this.cache.size - this.options.maxCacheSize)
    
    for (const event of toRemove) {
      this.removeEvent(event.id)
    }

    console.log(`🧹 缓存清理完成，移除 ${toRemove.length} 个旧事件`)
  }

  removeEvent(eventId) {
    const event = this.cache.get(eventId)
    if (event) {
      this.cache.delete(eventId)
      this.duplicateIndex.delete(eventId)
      
      const indexKey = `${event.contractAddress}_${event.eventName}`
      const indexArray = this.eventIndex.get(indexKey)
      if (indexArray) {
        const index = indexArray.indexOf(eventId)
        if (index > -1) {
          indexArray.splice(index, 1)
        }
      }
    }
  }

  async loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.options.storageKey)
      if (!stored) {
        console.log('📂 没有找到存储的事件数据')
        return
      }

      const data = JSON.parse(stored)
      if (data.events && Array.isArray(data.events)) {
        let loadedCount = 0
        for (const event of data.events) {
          if (this.isEventExpired(event)) {
            continue
          }
          
          this.cache.set(event.id, event)
          this.updateIndexes(event)
          loadedCount++
        }
        
        this.stats.totalEvents = loadedCount
        console.log(`📂 从存储加载了 ${loadedCount} 个事件`)
      }

      if (data.stats) {
        this.stats = { ...this.stats, ...data.stats }
      }

    } catch (error) {
      console.error('❌ 从存储加载数据失败:', error)
    }
  }

  async saveToStorage() {
    try {
      const events = Array.from(this.cache.values())
        .filter(event => !this.isEventExpired(event))
        .slice(-this.options.maxStorageSize)

      const data = {
        events,
        stats: this.stats,
        timestamp: Date.now(),
        version: '1.0'
      }

      localStorage.setItem(this.options.storageKey, JSON.stringify(data))
      console.log(`💾 已保存 ${events.length} 个事件到存储`)

    } catch (error) {
      console.error('❌ 保存到存储失败:', error)
      
      if (error.name === 'QuotaExceededError') {
        this.clearExpiredEvents()
        try {
          const events = Array.from(this.cache.values()).slice(-100)
          const data = { events, stats: this.stats, timestamp: Date.now() }
          localStorage.setItem(this.options.storageKey, JSON.stringify(data))
          console.log('💾 存储空间不足，已保存精简数据')
        } catch (retryError) {
          console.error('❌ 重试保存失败:', retryError)
        }
      }
    }
  }

  isEventExpired(event) {
    return Date.now() - event.timestamp > this.options.expirationTime
  }

  clearExpiredEvents() {
    const beforeCount = this.cache.size
    const expiredIds = []

    for (const [id, event] of this.cache) {
      if (this.isEventExpired(event)) {
        expiredIds.push(id)
      }
    }

    for (const id of expiredIds) {
      this.removeEvent(id)
    }

    const removedCount = beforeCount - this.cache.size
    if (removedCount > 0) {
      console.log(`🧹 清理了 ${removedCount} 个过期事件`)
      this.stats.lastCleanup = Date.now()
    }
  }

  startAutoCleanup() {
    setInterval(() => {
      this.clearExpiredEvents()
      if (this.options.enablePersistence) {
        this.saveToStorage()
      }
    }, this.options.cleanupInterval)

    console.log(`🔄 自动清理已启动，间隔: ${this.options.cleanupInterval}ms`)
  }

  clear() {
    this.cache.clear()
    this.eventIndex.clear()
    this.duplicateIndex.clear()
    this.stats = {
      totalEvents: 0,
      cacheHits: 0,
      cacheMisses: 0,
      duplicatesBlocked: 0,
      lastCleanup: Date.now()
    }

    if (this.options.enablePersistence) {
      localStorage.removeItem(this.options.storageKey)
    }

    console.log('🧹 EventStore 已清空')
  }

  getStatus() {
    return {
      cacheSize: this.cache.size,
      indexSize: this.eventIndex.size,
      duplicateIndexSize: this.duplicateIndex.size,
      stats: this.stats,
      options: this.options
    }
  }

  destroy() {
    if (this.options.enablePersistence) {
      this.saveToStorage()
    }
    this.clear()
    console.log('🗑️ EventStore 已销毁')
  }
}

export default EventStore
