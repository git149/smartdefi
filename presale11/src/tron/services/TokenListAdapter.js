/**
 * TokenList数据适配器
 * 将TokenListService返回的链上数据格式转换为TokenList.vue组件期望的数据格式
 */

import { hexToBase58, smartFormatAddress } from '@/utils/addressFormatter'
import { sunToTrx } from '../config'

class TokenListAdapter {
  /**
   * 将TokenListService返回的代币数据转换为组件格式
   * @param {Array} chainTokens - 链上代币数据数组
   * @returns {Array} 转换后的代币数据数组
   */
  static adaptTokensForComponent(chainTokens) {
    if (!Array.isArray(chainTokens)) {
      console.warn('⚠️ adaptTokensForComponent: 输入数据不是数组')
      return []
    }

    return chainTokens.map((chainToken, index) => {
      try {
        return this.adaptSingleToken(chainToken, index)
      } catch (error) {
        console.error('❌ 适配代币数据失败:', error, chainToken)
        // 返回一个默认的代币对象，避免整个列表崩溃
        return this.createFallbackToken(chainToken, index)
      }
    }).filter(token => token !== null)
  }

  /**
   * 适配单个代币数据
   * @param {Object} chainToken - 链上代币数据
   * @param {number} index - 索引
   * @returns {Object} 适配后的代币数据
   */
  static adaptSingleToken(chainToken, index) {
    // 基础字段映射
    const adaptedToken = {
      // 基础信息
      id: chainToken.tokenAddress || `token_${index}`,
      logoText: this.generateLogoText(chainToken.tokenSymbol),
      name: chainToken.tokenSymbol || chainToken.tokenName || 'UNKNOWN',
      description: this.generateDescription(chainToken),
      
      // 社交媒体链接（暂时使用默认值，后续可从链上获取）
      socials: this.generateSocialLinks(chainToken),
      
      // 市值和进度信息
      marketCap: this.calculateMarketCap(chainToken),
      percent: this.calculateProgressPercent(chainToken),
      
      // 价格变化（暂时使用模拟数据，后续可集成价格API）
      change: this.calculatePriceChange(chainToken),
      
      // 合约地址（确保Base58格式）
      contractBase58: this.formatContractAddress(chainToken.tokenAddress),
      
      // SunSwap上市状态（暂时使用默认逻辑）
      listedOnSunSwap: this.determineSunSwapStatus(chainToken),
      
      // 额外的链上数据（保留原始数据供调试使用）
      _chainData: chainToken
    }

    return adaptedToken
  }

  /**
   * 生成代币图标文字
   * @param {string} symbol - 代币符号
   * @returns {string} 图标文字
   */
  static generateLogoText(symbol) {
    if (!symbol) return '🪙'
    
    // 根据代币符号生成不同的图标
    const iconMap = {
      'TRX': '⚡',
      'USDT': '💵',
      'USDC': '💰',
      'BTC': '₿',
      'ETH': '⟠',
      'PEPE': '🐸',
      'CHOU': '🪙',
      'SUN': '☀️'
    }
    
    return iconMap[symbol.toUpperCase()] || '🔷'
  }

  /**
   * 生成项目描述
   * @param {Object} chainToken - 链上代币数据
   * @returns {string} 项目描述
   */
  static generateDescription(chainToken) {
    // 如果有描述字段，直接使用
    if (chainToken.description) {
      return chainToken.description
    }
    
    // 否则生成默认描述
    const symbol = chainToken.tokenSymbol || 'Token'
    const name = chainToken.tokenName || symbol
    
    return `${name} (${symbol}) is a token created on TRON blockchain. Total supply: ${this.formatTokenAmount(chainToken.totalSupply || 0)}.`
  }

  /**
   * 生成社交媒体链接
   * @param {Object} chainToken - 链上代币数据
   * @returns {Array} 社交媒体链接数组
   */
  static generateSocialLinks(chainToken) {
    const socials = []
    
    // 如果链上数据包含社交媒体信息，使用它们
    if (chainToken.socialLinks) {
      if (chainToken.socialLinks.twitter) {
        socials.push({ type: 'x', url: chainToken.socialLinks.twitter })
      }
      if (chainToken.socialLinks.telegram) {
        socials.push({ type: 'tg', url: chainToken.socialLinks.telegram })
      }
    } else {
      // 默认添加一个占位符链接
      socials.push({ type: 'x', url: '#' })
    }
    
    return socials
  }

  /**
   * 计算市值
   * @param {Object} chainToken - 链上代币数据
   * @returns {number} 市值（TRX）
   */
  static calculateMarketCap(chainToken) {
    // 如果有预售信息，使用预售筹集的金额
    if (chainToken.presale && chainToken.presale.preSaleEthAmountFormatted) {
      return parseFloat(chainToken.presale.preSaleEthAmountFormatted) || 0
    }
    
    // 如果有总供应量和价格信息，计算市值
    if (chainToken.totalSupply && chainToken.price) {
      const supply = parseFloat(chainToken.totalSupply) || 0
      const price = parseFloat(chainToken.price) || 0
      return Math.round(supply * price)
    }
    
    // 默认返回0
    return 0
  }

  /**
   * 计算进度百分比
   * @param {Object} chainToken - 链上代币数据
   * @returns {number} 进度百分比
   */
  static calculateProgressPercent(chainToken) {
    // 如果有进度信息，直接使用
    if (chainToken.progress && typeof chainToken.progress.percentage === 'number') {
      return Math.min(Math.max(chainToken.progress.percentage, 0), 100)
    }
    
    // 如果有预售信息，计算预售进度
    if (chainToken.presale) {
      const current = parseFloat(chainToken.presale.buyNumber) || 0
      const total = parseFloat(chainToken.presale.totalNumber) || 0
      
      if (total > 0) {
        return Math.min(Math.round((current / total) * 100), 100)
      }
    }
    
    // 默认返回随机进度（模拟数据）
    return Math.floor(Math.random() * 100)
  }

  /**
   * 计算价格变化
   * @param {Object} chainToken - 链上代币数据
   * @returns {number} 价格变化百分比
   */
  static calculatePriceChange(chainToken) {
    // 如果有价格变化数据，直接使用
    if (typeof chainToken.priceChange === 'number') {
      return parseFloat(chainToken.priceChange.toFixed(2))
    }
    
    // 暂时返回模拟数据，后续可集成价格API
    const changes = [-50, -30, -20, -10, -5, 5, 10, 20, 30, 50, 100, 200]
    return changes[Math.floor(Math.random() * changes.length)]
  }

  /**
   * 格式化合约地址为Base58格式
   * @param {string} address - 合约地址
   * @returns {string} Base58格式地址
   */
  static formatContractAddress(address) {
    if (!address) return 'TUnknownAddress'
    
    try {
      // 如果已经是Base58格式（以T开头），直接返回
      if (address.startsWith('T') && address.length >= 34) {
        return address
      }
      
      // 如果是十六进制格式，转换为Base58
      if (address.startsWith('0x') || address.startsWith('41')) {
        return hexToBase58(address)
      }
      
      // 其他情况，尝试智能格式化
      return smartFormatAddress(address) || address
      
    } catch (error) {
      console.warn('⚠️ 地址格式化失败:', error, address)
      return address || 'TUnknownAddress'
    }
  }

  /**
   * 判断是否在SunSwap上市
   * @param {Object} chainToken - 链上代币数据
   * @returns {boolean} 是否上市
   */
  static determineSunSwapStatus(chainToken) {
    // 如果有明确的上市状态，使用它
    if (typeof chainToken.listedOnSunSwap === 'boolean') {
      return chainToken.listedOnSunSwap
    }
    
    // 根据预售状态判断
    if (chainToken.status === 'completed') {
      return true
    }
    
    // 根据市值判断（市值大于1000 TRX认为已上市）
    const marketCap = this.calculateMarketCap(chainToken)
    return marketCap > 1000
  }

  /**
   * 格式化代币数量
   * @param {string|number} amount - 代币数量
   * @returns {string} 格式化后的数量
   */
  static formatTokenAmount(amount) {
    if (!amount) return '0'
    
    const num = parseFloat(amount)
    if (isNaN(num)) return '0'
    
    if (num >= 1e9) {
      return (num / 1e9).toFixed(1) + 'B'
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + 'M'
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + 'K'
    } else {
      return num.toFixed(0)
    }
  }

  /**
   * 创建降级代币对象（当数据适配失败时使用）
   * @param {Object} chainToken - 原始链上数据
   * @param {number} index - 索引
   * @returns {Object} 降级代币对象
   */
  static createFallbackToken(chainToken, index) {
    return {
      id: `fallback_${index}`,
      logoText: '❓',
      name: 'UNKNOWN',
      description: 'Token data could not be loaded properly.',
      socials: [{ type: 'x', url: '#' }],
      marketCap: 0,
      percent: 0,
      change: 0,
      contractBase58: 'TUnknownAddress',
      listedOnSunSwap: false,
      _chainData: chainToken,
      _isFallback: true
    }
  }

  /**
   * 验证适配后的代币数据
   * @param {Object} token - 适配后的代币数据
   * @returns {boolean} 是否有效
   */
  static validateAdaptedToken(token) {
    const requiredFields = ['id', 'name', 'contractBase58']
    return requiredFields.every(field => token && token[field])
  }
}

export default TokenListAdapter
