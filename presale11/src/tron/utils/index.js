/**
 * TRON工具函数集合
 * 提供地址处理、数值转换、格式化等通用功能
 */

import { sunToTrx, trxToSun } from '../config'

/**
 * 地址工具类
 */
export class AddressUtils {
  /**
   * 验证TRON地址格式
   * @param {string} address - 地址
   * @returns {boolean} 是否有效
   */
  static isValidAddress(address) {
    if (!address || typeof address !== 'string') {
      return false
    }
    
    // TRON地址以T开头，长度为34
    return /^T[A-Za-z0-9]{33}$/.test(address)
  }

  /**
   * 缩短地址显示
   * @param {string} address - 完整地址
   * @param {number} startLength - 开始显示的长度
   * @param {number} endLength - 结尾显示的长度
   * @returns {string} 缩短后的地址
   */
  static shortenAddress(address, startLength = 6, endLength = 4) {
    if (!address || !this.isValidAddress(address)) {
      return ''
    }
    
    if (address.length <= startLength + endLength) {
      return address
    }
    
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
  }

  /**
   * 比较两个地址是否相同
   * @param {string} addr1 - 地址1
   * @param {string} addr2 - 地址2
   * @returns {boolean} 是否相同
   */
  static isSameAddress(addr1, addr2) {
    if (!addr1 || !addr2) return false
    return addr1.toLowerCase() === addr2.toLowerCase()
  }
}

/**
 * 数值工具类
 */
export class NumberUtils {
  /**
   * 安全的BigInt转换
   * @param {any} value - 要转换的值
   * @returns {bigint} BigInt值
   */
  static toBigInt(value) {
    if (typeof value === 'bigint') {
      return value
    }
    
    if (typeof value === 'string' || typeof value === 'number') {
      return BigInt(value)
    }
    
    throw new Error(`无法转换为BigInt: ${value}`)
  }

  /**
   * 格式化大数字显示
   * @param {string|number|bigint} value - 数值
   * @param {number} decimals - 小数位数
   * @returns {string} 格式化后的字符串
   */
  static formatNumber(value, decimals = 2) {
    const num = Number(value)
    
    if (num >= 1e9) {
      return (num / 1e9).toFixed(decimals) + 'B'
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(decimals) + 'M'
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(decimals) + 'K'
    }
    
    return num.toFixed(decimals)
  }

  /**
   * 添加千分位分隔符
   * @param {string|number} value - 数值
   * @returns {string} 格式化后的字符串
   */
  static addCommas(value) {
    return Number(value).toLocaleString()
  }

  /**
   * 计算百分比
   * @param {string|number} part - 部分值
   * @param {string|number} total - 总值
   * @param {number} decimals - 小数位数
   * @returns {string} 百分比字符串
   */
  static calculatePercentage(part, total, decimals = 2) {
    if (Number(total) === 0) return '0.00%'
    
    const percentage = (Number(part) / Number(total)) * 100
    return percentage.toFixed(decimals) + '%'
  }
}

/**
 * 时间工具类
 */
export class TimeUtils {
  /**
   * 格式化时间戳
   * @param {number} timestamp - 时间戳(秒)
   * @param {string} format - 格式
   * @returns {string} 格式化后的时间
   */
  static formatTimestamp(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
    const date = new Date(timestamp * 1000)
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  }

  /**
   * 获取相对时间
   * @param {number} timestamp - 时间戳(秒)
   * @returns {string} 相对时间描述
   */
  static getRelativeTime(timestamp) {
    const now = Math.floor(Date.now() / 1000)
    const diff = now - timestamp
    
    if (diff < 60) {
      return '刚刚'
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)}分钟前`
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)}小时前`
    } else if (diff < 2592000) {
      return `${Math.floor(diff / 86400)}天前`
    } else {
      return this.formatTimestamp(timestamp, 'YYYY-MM-DD')
    }
  }
}

/**
 * 交易工具类
 */
export class TransactionUtils {
  /**
   * 生成交易链接
   * @param {string} txHash - 交易哈希
   * @param {string} network - 网络类型
   * @returns {string} 交易链接
   */
  static getTxLink(txHash, network = 'mainnet') {
    const baseUrls = {
      mainnet: 'https://tronscan.org/#/transaction/',
      shasta: 'https://shasta.tronscan.org/#/transaction/',
      nile: 'https://nile.tronscan.org/#/transaction/'
    }
    
    return baseUrls[network] + txHash
  }

  /**
   * 生成地址链接
   * @param {string} address - 地址
   * @param {string} network - 网络类型
   * @returns {string} 地址链接
   */
  static getAddressLink(address, network = 'mainnet') {
    const baseUrls = {
      mainnet: 'https://tronscan.org/#/address/',
      shasta: 'https://shasta.tronscan.org/#/address/',
      nile: 'https://nile.tronscan.org/#/address/'
    }
    
    return baseUrls[network] + address
  }

  /**
   * 解析交易错误
   * @param {Error} error - 错误对象
   * @returns {string} 用户友好的错误信息
   */
  static parseTransactionError(error) {
    const message = error.message || error.toString()
    
    if (message.includes('insufficient balance')) {
      return '余额不足'
    } else if (message.includes('gas')) {
      return '能量不足'
    } else if (message.includes('revert')) {
      return '交易被拒绝'
    } else if (message.includes('timeout')) {
      return '交易超时'
    } else if (message.includes('network')) {
      return '网络错误'
    }
    
    return '交易失败'
  }
}

/**
 * 存储工具类
 */
export class StorageUtils {
  /**
   * 设置本地存储
   * @param {string} key - 键
   * @param {any} value - 值
   */
  static setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('设置本地存储失败:', error)
    }
  }

  /**
   * 获取本地存储
   * @param {string} key - 键
   * @param {any} defaultValue - 默认值
   * @returns {any} 存储的值
   */
  static getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('获取本地存储失败:', error)
      return defaultValue
    }
  }

  /**
   * 移除本地存储
   * @param {string} key - 键
   */
  static removeItem(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('移除本地存储失败:', error)
    }
  }

  /**
   * 清空本地存储
   */
  static clear() {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('清空本地存储失败:', error)
    }
  }
}

/**
 * 验证工具类
 */
export class ValidationUtils {
  /**
   * 验证金额格式
   * @param {string} amount - 金额
   * @returns {boolean} 是否有效
   */
  static isValidAmount(amount) {
    if (!amount || typeof amount !== 'string') {
      return false
    }
    
    return /^\d+(\.\d+)?$/.test(amount) && Number(amount) > 0
  }

  /**
   * 验证整数
   * @param {any} value - 值
   * @returns {boolean} 是否为有效整数
   */
  static isValidInteger(value) {
    return Number.isInteger(Number(value)) && Number(value) >= 0
  }

  /**
   * 验证百分比
   * @param {any} value - 值
   * @returns {boolean} 是否为有效百分比(0-100)
   */
  static isValidPercentage(value) {
    const num = Number(value)
    return !isNaN(num) && num >= 0 && num <= 100
  }
}

// 导出所有工具类
export default {
  AddressUtils,
  NumberUtils,
  TimeUtils,
  TransactionUtils,
  StorageUtils,
  ValidationUtils,
  sunToTrx,
  trxToSun
}
