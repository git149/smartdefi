/**
 * TRON地址格式化工具
 * 处理十六进制地址到Base58格式的转换
 */

/**
 * 检查地址是否为十六进制格式
 * @param {string} address - 地址
 * @returns {boolean} 是否为十六进制格式
 */
export function isHexAddress(address) {
  if (!address || typeof address !== 'string') return false
  
  // 移除0x前缀（如果有）
  const cleanAddress = address.replace(/^0x/i, '')
  
  // 检查是否为42字符的十六进制字符串（TRON地址）
  return /^[0-9a-fA-F]{42}$/.test(cleanAddress)
}

/**
 * 检查地址是否为Base58格式
 * @param {string} address - 地址
 * @returns {boolean} 是否为Base58格式
 */
export function isBase58Address(address) {
  if (!address || typeof address !== 'string') return false
  
  // TRON Base58地址通常以T开头，长度为34字符
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)
}

/**
 * 将十六进制地址转换为Base58格式
 * @param {string} hexAddress - 十六进制地址
 * @returns {string} Base58格式地址
 */
export function hexToBase58(hexAddress) {
  try {
    if (!hexAddress) return ''
    
    // 如果已经是Base58格式，直接返回
    if (isBase58Address(hexAddress)) {
      return hexAddress
    }
    
    // 如果不是十六进制格式，返回原地址
    if (!isHexAddress(hexAddress)) {
      return hexAddress
    }
    
    // 确保有TronWeb实例
    if (typeof window !== 'undefined' && window.tronWeb && window.tronWeb.address) {
      // 移除0x前缀（如果有）
      const cleanHex = hexAddress.replace(/^0x/i, '')
      
      // 添加41前缀（TRON地址标识）
      const fullHex = cleanHex.startsWith('41') ? cleanHex : '41' + cleanHex
      
      // 转换为Base58
      const base58Address = window.tronWeb.address.fromHex(fullHex)
      
      console.log('🔄 地址转换:', {
        原始: hexAddress,
        十六进制: fullHex,
        Base58: base58Address
      })
      
      return base58Address
    }
    
    // 如果没有TronWeb，返回原地址
    console.warn('⚠️ TronWeb未初始化，无法转换地址:', hexAddress)
    return hexAddress
    
  } catch (error) {
    console.error('❌ 地址转换失败:', error)
    return hexAddress // 转换失败时返回原地址
  }
}

/**
 * 将Base58地址转换为十六进制格式
 * @param {string} base58Address - Base58地址
 * @returns {string} 十六进制地址
 */
export function base58ToHex(base58Address) {
  try {
    if (!base58Address) return ''
    
    // 如果已经是十六进制格式，直接返回
    if (isHexAddress(base58Address)) {
      return base58Address
    }
    
    // 如果不是Base58格式，返回原地址
    if (!isBase58Address(base58Address)) {
      return base58Address
    }
    
    // 确保有TronWeb实例
    if (typeof window !== 'undefined' && window.tronWeb && window.tronWeb.address) {
      const hexAddress = window.tronWeb.address.toHex(base58Address)
      
      console.log('🔄 地址转换:', {
        Base58: base58Address,
        十六进制: hexAddress
      })
      
      return hexAddress
    }
    
    // 如果没有TronWeb，返回原地址
    console.warn('⚠️ TronWeb未初始化，无法转换地址:', base58Address)
    return base58Address
    
  } catch (error) {
    console.error('❌ 地址转换失败:', error)
    return base58Address // 转换失败时返回原地址
  }
}

/**
 * 格式化地址显示（缩短显示）
 * @param {string} address - 地址
 * @param {number} startLength - 开头显示长度，默认6
 * @param {number} endLength - 结尾显示长度，默认4
 * @returns {string} 格式化后的地址
 */
export function formatAddressDisplay(address, startLength = 6, endLength = 4) {
  if (!address || typeof address !== 'string') return ''
  
  // 确保地址是Base58格式
  const base58Address = hexToBase58(address)
  
  if (base58Address.length <= startLength + endLength) {
    return base58Address
  }
  
  return `${base58Address.slice(0, startLength)}...${base58Address.slice(-endLength)}`
}

/**
 * 智能地址格式化 - 自动检测格式并转换为用户友好的显示
 * @param {string} address - 地址
 * @param {boolean} shortened - 是否缩短显示，默认false
 * @returns {string} 格式化后的地址
 */
export function smartFormatAddress(address, shortened = false) {
  if (!address) return ''
  
  // 转换为Base58格式
  const base58Address = hexToBase58(address)
  
  // 如果需要缩短显示
  if (shortened) {
    return formatAddressDisplay(base58Address)
  }
  
  return base58Address
}

/**
 * 批量转换地址格式
 * @param {Array} addresses - 地址数组
 * @returns {Array} 转换后的地址数组
 */
export function batchConvertAddresses(addresses) {
  if (!Array.isArray(addresses)) return []
  
  return addresses.map(address => hexToBase58(address))
}

/**
 * 验证TRON地址格式
 * @param {string} address - 地址
 * @returns {boolean} 是否为有效的TRON地址
 */
export function isValidTronAddress(address) {
  if (!address || typeof address !== 'string') return false
  
  // 检查Base58格式
  if (isBase58Address(address)) {
    return true
  }
  
  // 检查十六进制格式
  if (isHexAddress(address)) {
    return true
  }
  
  return false
}

/**
 * 获取地址类型
 * @param {string} address - 地址
 * @returns {string} 地址类型：'base58', 'hex', 'invalid'
 */
export function getAddressType(address) {
  if (!address || typeof address !== 'string') return 'invalid'
  
  if (isBase58Address(address)) return 'base58'
  if (isHexAddress(address)) return 'hex'
  
  return 'invalid'
}

// 默认导出主要函数
export default {
  hexToBase58,
  base58ToHex,
  formatAddressDisplay,
  smartFormatAddress,
  batchConvertAddresses,
  isValidTronAddress,
  getAddressType,
  isHexAddress,
  isBase58Address
}
