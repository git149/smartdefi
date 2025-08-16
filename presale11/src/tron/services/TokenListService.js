/**
 * 代币列表服务类
 * 负责获取、管理和缓存已创建的代币列表
 */

import CoordinatorFactoryService from './CoordinatorFactoryService'
import PresaleService from './PresaleService'
import TokenService from './TokenService'
import { sunToTrx } from '../config'
import { hexToBase58, smartFormatAddress } from '@/utils/addressFormatter'

class TokenListService {
  constructor() {
    this.tokenCache = new Map()
    this.presaleCache = new Map()
    this.lastUpdateTime = 0
    this.cacheTimeout = 30000 // 30秒缓存
  }

  /**
   * 获取所有代币预售对列表
   * @param {number} offset - 偏移量
   * @param {number} limit - 限制数量
   * @param {boolean} useCache - 是否使用缓存
   * @returns {Promise<Object>} 代币列表和总数
   */
  async getAllTokens(offset = 0, limit = 50, useCache = true) {
    try {
      const cacheKey = `all_tokens_${offset}_${limit}`
      
      // 检查缓存
      if (useCache && this.isValidCache(cacheKey)) {
        console.log('📋 使用缓存的代币列表')
        return this.tokenCache.get(cacheKey)
      }

      console.log('🔍 获取代币列表:', { offset, limit })

      // 从工厂合约获取代币对
      const result = await CoordinatorFactoryService.getAllTokenPresalePairs(offset, limit)

      if (!result) {
        console.warn('⚠️ 合约返回空结果')
        return {
          tokens: [],
          total: 0,
          offset,
          limit,
          timestamp: Date.now()
        }
      }

      if (!result.pairs) {
        console.warn('⚠️ 合约返回结果中没有pairs字段')
        return {
          tokens: [],
          total: result.total || 0,
          offset,
          limit,
          timestamp: Date.now()
        }
      }

      // 处理代币数据
      const processedTokens = await this.processTokenPairs(result.pairs)

      const finalResult = {
        tokens: processedTokens,
        total: result.total || result[1] || 0,
        offset,
        limit,
        timestamp: Date.now()
      }

      // 缓存结果
      this.tokenCache.set(cacheKey, finalResult)
      this.lastUpdateTime = Date.now()

      console.log('✅ 代币列表获取成功:', {
        count: processedTokens.length,
        total: finalResult.total
      })

      return finalResult

    } catch (error) {
      console.error('❌ 获取代币列表失败:', error)
      throw error
    }
  }

  /**
   * 按创建者获取代币列表
   * @param {string} creator - 创建者地址
   * @param {number} offset - 偏移量
   * @param {number} limit - 限制数量
   * @returns {Promise<Object>} 代币列表
   */
  async getTokensByCreator(creator, offset = 0, limit = 50) {
    try {
      console.log('🔍 获取创建者代币列表:', { creator, offset, limit })

      const result = await CoordinatorFactoryService.getTokenPresalePairsByCreator(
        creator, 
        offset, 
        limit
      )

      if (!result || !result.pairs) {
        return { tokens: [], total: 0, offset, limit }
      }

      const processedTokens = await this.processTokenPairs(result.pairs)

      return {
        tokens: processedTokens,
        total: result.total || result[1] || 0,
        offset,
        limit,
        creator,
        timestamp: Date.now()
      }

    } catch (error) {
      console.error('❌ 获取创建者代币列表失败:', error)
      throw error
    }
  }

  /**
   * 获取单个代币的详细信息
   * @param {string} tokenAddress - 代币地址
   * @param {boolean} useCache - 是否使用缓存
   * @returns {Promise<Object>} 代币详细信息
   */
  async getTokenDetails(tokenAddress, useCache = true) {
    try {
      const cacheKey = `token_details_${tokenAddress}`

      // 检查缓存
      if (useCache && this.isValidCache(cacheKey)) {
        return this.tokenCache.get(cacheKey)
      }

      console.log('🔍 获取代币详情:', tokenAddress)

      // 获取代币基本信息
      const tokenPair = await CoordinatorFactoryService.getTokenPresalePairDetails(tokenAddress)
      
      if (!tokenPair) {
        throw new Error('代币不存在')
      }

      // 处理单个代币
      const processedToken = await this.processTokenPair(tokenPair)

      // 缓存结果
      this.tokenCache.set(cacheKey, processedToken)

      return processedToken

    } catch (error) {
      console.error('❌ 获取代币详情失败:', error)
      throw error
    }
  }

  /**
   * 处理代币对数组
   * @param {Array} pairs - 代币对数组
   * @returns {Promise<Array>} 处理后的代币数组
   */
  async processTokenPairs(pairs) {
    const processedTokens = []

    for (const pair of pairs) {
      try {
        const processedToken = await this.processTokenPair(pair)
        processedTokens.push(processedToken)
      } catch (error) {
        console.warn('⚠️ 处理代币对失败:', error.message)
        // 继续处理其他代币，不中断整个流程
      }
    }

    return processedTokens
  }

  /**
   * 处理单个代币对
   * @param {Object} pair - 代币对信息
   * @returns {Promise<Object>} 处理后的代币信息
   */
  async processTokenPair(pair) {
    try {
      // 提取基本信息
      const rawTokenInfo = {
        tokenAddress: pair.tokenAddress || pair[0],
        presaleAddress: pair.presaleAddress || pair[1],
        creator: pair.creator || pair[2],
        createdAt: pair.createdAt || pair[3],
        tokenName: pair.tokenName || pair[4],
        tokenSymbol: pair.tokenSymbol || pair[5],
        totalSupply: pair.totalSupply || pair[6]
      }

      // 格式化地址为Base58格式
      const tokenInfo = {
        ...rawTokenInfo,
        tokenAddress: hexToBase58(rawTokenInfo.tokenAddress),
        presaleAddress: hexToBase58(rawTokenInfo.presaleAddress),
        creator: hexToBase58(rawTokenInfo.creator)
      }

      // 获取预售状态信息
      let presaleInfo = null
      if (tokenInfo.presaleAddress) {
        try {
          presaleInfo = await this.getPresaleInfo(tokenInfo.presaleAddress)
        } catch (presaleError) {
          console.warn('⚠️ 获取预售信息失败:', presaleError.message)
        }
      }

      // 格式化数据
      const formattedToken = {
        ...tokenInfo,
        // 格式化总供应量
        totalSupplyFormatted: this.formatTokenAmount(tokenInfo.totalSupply),
        // 创建时间格式化
        createdAtFormatted: this.formatTimestamp(tokenInfo.createdAt),
        // 预售信息
        presale: presaleInfo,
        // 状态信息
        status: this.determineTokenStatus(presaleInfo),
        // 显示用的图标（可以后续添加）
        icon: this.getTokenIcon(tokenInfo.tokenSymbol),
        // 进度信息
        progress: this.calculateProgress(presaleInfo)
      }

      return formattedToken

    } catch (error) {
      console.error('❌ 处理代币对失败:', error)
      throw error
    }
  }

  /**
   * 获取预售信息
   * @param {string} presaleAddress - 预售合约地址
   * @returns {Promise<Object>} 预售信息
   */
  async getPresaleInfo(presaleAddress) {
    try {
      const cacheKey = `presale_info_${presaleAddress}`

      // 检查缓存
      if (this.isValidCache(cacheKey)) {
        return this.presaleCache.get(cacheKey)
      }

      // 创建预售服务实例
      const presaleService = new PresaleService(presaleAddress)

      // 获取预售基本信息
      const [basicInfo, priceInfo] = await Promise.all([
        presaleService.getPresaleBasicInfo(),
        presaleService.getPresalePriceInfo()
      ])

      const presaleInfo = {
        ...basicInfo,
        ...priceInfo,
        // 格式化价格信息
        preSaleEthAmountFormatted: sunToTrx(priceInfo.preSaleEthAmount),
        // 计算进度百分比
        progressPercentage: this.calculateProgressPercentage(basicInfo.buyNumber, basicInfo.totalNumber)
      }

      // 缓存结果
      this.presaleCache.set(cacheKey, presaleInfo)

      return presaleInfo

    } catch (error) {
      console.error('❌ 获取预售信息失败:', error)
      throw error
    }
  }

  /**
   * 计算进度百分比
   * @param {number} current - 当前数量
   * @param {number} total - 总数量
   * @returns {number} 进度百分比
   */
  calculateProgressPercentage(current, total) {
    if (!total || total === 0) return 0
    return Math.min(Math.round((current / total) * 100), 100)
  }

  /**
   * 计算进度信息
   * @param {Object} presaleInfo - 预售信息
   * @returns {Object} 进度信息
   */
  calculateProgress(presaleInfo) {
    if (!presaleInfo) {
      return { percentage: 0, status: 'unknown' }
    }

    const percentage = this.calculateProgressPercentage(
      presaleInfo.buyNumber, 
      presaleInfo.totalNumber
    )

    return {
      percentage,
      current: presaleInfo.buyNumber || 0,
      total: presaleInfo.totalNumber || 0,
      status: percentage >= 100 ? 'completed' : 'active'
    }
  }

  /**
   * 确定代币状态
   * @param {Object} presaleInfo - 预售信息
   * @returns {string} 状态
   */
  determineTokenStatus(presaleInfo) {
    if (!presaleInfo) return 'unknown'

    switch (presaleInfo.openState) {
      case 0: return 'pending'    // 未开始
      case 1: return 'active'     // 进行中
      case 2:
      case 3:
      case 4: return 'completed'  // 已结束
      default: return 'unknown'
    }
  }

  /**
   * 获取代币图标
   * @param {string} symbol - 代币符号
   * @returns {string} 图标URL
   */
  getTokenIcon(symbol) {
    // 这里可以根据代币符号返回对应的图标
    // 返回一个默认的SVG图标
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGMEYwRjAiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjNjY2Ii8+Cjwvc3ZnPgo8L3N2Zz4K'
  }

  /**
   * 格式化代币数量
   * @param {string|number} amount - 数量
   * @returns {string} 格式化后的数量
   */
  formatTokenAmount(amount) {
    if (!amount) return '0'
    
    const num = Number(amount)
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B'
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M'
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K'
    }
    
    return num.toLocaleString()
  }

  /**
   * 格式化时间戳
   * @param {number} timestamp - 时间戳
   * @returns {string} 格式化后的时间
   */
  formatTimestamp(timestamp) {
    if (!timestamp) return ''
    
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleDateString()
  }

  /**
   * 检查缓存是否有效
   * @param {string} key - 缓存键
   * @returns {boolean} 是否有效
   */
  isValidCache(key) {
    const cached = this.tokenCache.get(key) || this.presaleCache.get(key)
    if (!cached) return false

    const now = Date.now()
    const cacheTime = cached.timestamp || 0
    
    return (now - cacheTime) < this.cacheTimeout
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.tokenCache.clear()
    this.presaleCache.clear()
    this.lastUpdateTime = 0
    console.log('🗑️ 代币列表缓存已清除')
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getCacheStats() {
    return {
      tokenCacheSize: this.tokenCache.size,
      presaleCacheSize: this.presaleCache.size,
      lastUpdateTime: this.lastUpdateTime,
      cacheTimeout: this.cacheTimeout
    }
  }
}

// 创建单例实例
const tokenListService = new TokenListService()

export default tokenListService
