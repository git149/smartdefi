/**
 * TRON区块链配置文件
 * 包含网络配置、合约地址、交易参数等
 */

/**
 * TRON网络配置
 */
export const TRON_NETWORKS = {
  MAINNET: {
    name: 'TRON主网',
    fullHost: 'https://api.trongrid.io',
    solidityNode: 'https://api.trongrid.io',
    eventServer: 'https://api.trongrid.io',
    chainId: 1,
    networkId: 1
  },
  SHASTA: {
    name: 'Shasta测试网',
    fullHost: 'https://api.shasta.trongrid.io',
    solidityNode: 'https://api.shasta.trongrid.io',
    eventServer: 'https://api.shasta.trongrid.io',
    chainId: 2,
    networkId: 2
  },
  NILE: {
    name: 'Nile测试网',
    fullHost: 'https://nile.trongrid.io',
    solidityNode: 'https://nile.trongrid.io',
    eventServer: 'https://nile.trongrid.io',
    chainId: 3,
    networkId: 3
  }
}

/**
 * 当前使用的网络 (可通过环境变量覆盖)
 */
export const CURRENT_NETWORK = process.env.VUE_APP_TRON_NETWORK || 'NILE'

/**
 * 开发模式配置
 */
export const DEVELOPMENT_CONFIG = {
  // 开发模式下的最小开始时间间隔（分钟）
  MIN_START_TIME_MINUTES: process.env.VUE_APP_DEV_MODE === 'true' ? 0 : 15,
  // 是否启用开发模式
  IS_DEV_MODE: process.env.VUE_APP_DEV_MODE === 'true'
}

/**
 * 合约地址配置
 * 注意：这些地址需要根据实际部署情况进行更新
 */
export const CONTRACT_ADDRESSES = {
  MAINNET: {
    COORDINATOR_FACTORY: process.env.VUE_APP_COORDINATOR_FACTORY_MAINNET || '',
    // 其他合约地址将在创建后动态获取
  },
  SHASTA: {
    COORDINATOR_FACTORY: process.env.VUE_APP_COORDINATOR_FACTORY_SHASTA || 'TTestFactoryAddress',
  },
  NILE: {
    COORDINATOR_FACTORY: process.env.VUE_APP_COORDINATOR_FACTORY_NILE || 'TGUUgCztEyXDwEyigoAAZP9HxWC6VdiKDj',
  }
}

/**
 * 默认项目合约地址配置
 * 这些是您提供的具体项目合约地址
 */
export const DEFAULT_PROJECT_CONTRACTS = {
  NILE: {
    TOKEN_ADDRESS: 'TNmNmMMVS8BmWgTem7HExyjru1bv21sKRC',
    PRESALE_ADDRESS: 'TS6bcFFQuooYFmrufqd79qM6FSdEpY9gee',
    PROJECT_NAME: 'Default Token',
    PROJECT_SYMBOL: 'DTK',
    PROJECT_DESCRIPTION: '默认代币项目'
  },
  
  MAINNET: {
    TOKEN_ADDRESS: '',
    PRESALE_ADDRESS: '',
    PROJECT_NAME: '',
    PROJECT_SYMBOL: '',
    PROJECT_DESCRIPTION: ''
  },
  SHASTA: {
    TOKEN_ADDRESS: '',
    PRESALE_ADDRESS: '',
    PROJECT_NAME: '',
    PROJECT_SYMBOL: '',
    PROJECT_DESCRIPTION: ''
  }
}

/**
 * 默认交易参数
 */
export const DEFAULT_TRANSACTION_PARAMS = {
  // 创建代币和预售的参数
  CREATE_TOKEN_PRESALE: {
    feeLimit: 3000000000, // 3000 TRX (足够的能量限制)
    callValue: 50000000,  // 50 TRX (创建费用)
    shouldPollResponse: true,
    timeout: 180000, // 增加到120秒超时
    maxRetries: 3,   // 添加重试机制
    retryDelay: 5000 // 重试间隔5秒
  },
  
  // 预售购买参数
  PRESALE_PURCHASE: {
    feeLimit: 50000000,   // 50 TRX
    shouldPollResponse: true,
    timeout: 30000
  },
  
  // 代币转账参数
  TOKEN_TRANSFER: {
    feeLimit: 20000000,   // 20 TRX
    shouldPollResponse: true,
    timeout: 30000
  },
  
  // 查询操作参数
  VIEW_CALL: {
    feeLimit: 10000000,   // 10 TRX
    timeout: 15000
  }
}

/**
 * 代币配置默认值
 */
export const DEFAULT_TOKEN_CONFIG = {
  feeBuy: 300,        // 3% 买入手续费
  feeSell: 300,       // 3% 卖出手续费
  lpBurnEnabled: false,
  lpBurnFrequency: 0,
  percentForLPBurn: 0,
  burnLimit: 0,
  protectTime: 0,
  protectFee: 0,
  isInsideSell: false,
  swapThreshold: 0
}

/**
 * 预售配置默认值
 */
export const DEFAULT_PRESALE_CONFIG = {
  presaleEthAmount: "100000",    // 0.1 TRX
  tradeEthAmount: "50000",       // 0.05 TRX
  maxTotalNum: 100,
  presaleMaxNum: 10,
  marketDisAmount: "1000000000",
  // LP分配默认配置
  userLPShare: 10000,            // 100% = 10000基点
  devLPShare: 0,                 // 0% = 0基点
  devLPReceiver: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb", // TRON零地址
  lpDistributionEnabled: false,  // 默认不启用

  // === LGE集成默认配置（基于LEG.txt） ===
  startTime: 0,                  // 预售开始时间（将在创建时动态设置）
  hardcap: "1000000000",         // 硬顶限制（1000 TRX）
  maxBuyPerWallet: "100000000",  // 每个钱包最大购买量（100 TRX）

  // Vesting默认配置
  vestingDelay: 7 * 24 * 60 * 60, // 7天（秒）
  vestingRate: 10,               // 10%
  vestingEnabled: false,         // 默认不启用

  // Backing默认配置
  backingShare: 0,               // 0%
  backingReceiver: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb" // TRON零地址
}

/**
 * LGE参数验证规则（基于LEG.txt）
 */
export const LGE_VALIDATION_RULES = {
  vestingDelay: {
    min: 7 * 24 * 60 * 60,       // 7天（秒）
    max: 90 * 24 * 60 * 60       // 90天（秒）
  },
  vestingRate: {
    min: 5,                      // 5%
    max: 20                      // 20%
  },
  devShare: {
    max: 50                      // ≤50%
  },
  backingShare: {
    min: 0,                      // 0%
    max: 50                      // ≤50%
  },

}

/**
 * 错误代码映射
 */
export const ERROR_CODES = {
  TRONWEB_NOT_FOUND: 'TRONWEB_NOT_FOUND',
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  CONTRACT_NOT_FOUND: 'CONTRACT_NOT_FOUND',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  NETWORK_ERROR: 'NETWORK_ERROR'
}

/**
 * 错误消息映射
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.TRONWEB_NOT_FOUND]: 'TronWeb未找到，请安装TronLink钱包',
  [ERROR_CODES.WALLET_NOT_CONNECTED]: '钱包未连接，请连接TronLink钱包',
  [ERROR_CODES.INSUFFICIENT_BALANCE]: '余额不足，请检查账户余额',
  [ERROR_CODES.CONTRACT_NOT_FOUND]: '合约未找到，请检查合约地址',
  [ERROR_CODES.TRANSACTION_FAILED]: '交易失败，请重试',
  [ERROR_CODES.INVALID_ADDRESS]: '无效的地址格式',
  [ERROR_CODES.INVALID_AMOUNT]: '无效的金额',
  [ERROR_CODES.NETWORK_ERROR]: '网络错误，请检查网络连接'
}

/**
 * 获取当前网络配置
 */
export function getCurrentNetworkConfig() {
  return TRON_NETWORKS[CURRENT_NETWORK]
}

/**
 * 获取当前网络的合约地址
 */
export function getCurrentContractAddresses() {
  return CONTRACT_ADDRESSES[CURRENT_NETWORK] || CONTRACT_ADDRESSES.MAINNET
}

/**
 * 获取错误消息
 */
export function getErrorMessage(errorCode) {
  return ERROR_MESSAGES[errorCode] || '未知错误'
}

/**
 * 单位转换工具
 */
export const UNITS = {
  SUN_TO_TRX: 1000000,
  TRX_TO_SUN: 1000000
}

/**
 * 转换SUN到TRX
 */
export function sunToTrx(sun) {
  return sun / UNITS.SUN_TO_TRX
}

/**
 * 转换TRX到SUN
 */
export function trxToSun(trx) {
  return trx * UNITS.TRX_TO_SUN
}

/**
 * TRON地址格式转换工具
 */
export const AddressUtils = {
  /**
   * 检查是否为hex格式地址
   * @param {string} address - 地址
   * @returns {boolean} 是否为hex格式
   */
  isHexAddress(address) {
    return address && (
      (address.length === 42 && address.startsWith('41')) ||  // 完整hex格式
      (address.length === 40 && /^[0-9a-fA-F]+$/.test(address))  // 不带41前缀的hex
    )
  },

  /**
   * 检查是否为base58格式地址
   * @param {string} address - 地址
   * @returns {boolean} 是否为base58格式
   */
  isBase58Address(address) {
    return address && address.length === 34 && address.startsWith('T')
  },

  /**
   * 将地址转换为base58格式
   * @param {string} address - 地址（hex或base58）
   * @returns {string} base58格式地址
   */
  toBase58(address) {
    if (!address) return ''

    try {
      if (this.isBase58Address(address)) {
        return address
      } else if (this.isHexAddress(address)) {
        // 检查TronWeb是否可用
        if (!window.tronWeb || !window.tronWeb.address) {
          console.warn('⚠️ TronWeb不可用，无法转换地址格式')
          return address
        }

        // 如果是40位hex（不带41前缀），添加41前缀
        let hexAddress = address
        if (address.length === 40 && /^[0-9a-fA-F]+$/.test(address)) {
          hexAddress = '41' + address
        }
        return window.tronWeb.address.fromHex(hexAddress)
      } else {
        console.warn('⚠️ 未知的地址格式:', address)
        return address
      }
    } catch (error) {
      console.error('❌ 地址转换失败:', error)
      return address
    }
  },

  /**
   * 将地址转换为hex格式
   * @param {string} address - 地址（hex或base58）
   * @returns {string} hex格式地址
   */
  toHex(address) {
    if (!address) return ''

    try {
      if (this.isBase58Address(address)) {
        // 检查TronWeb是否可用
        if (!window.tronWeb || !window.tronWeb.address) {
          console.warn('⚠️ TronWeb不可用，无法转换地址格式')
          return address
        }
        return window.tronWeb.address.toHex(address)
      } else if (this.isHexAddress(address)) {
        // 确保返回完整的42位hex格式（带41前缀）
        if (address.length === 40 && /^[0-9a-fA-F]+$/.test(address)) {
          return '41' + address
        }
        return address
      } else {
        console.warn('⚠️ 未知的地址格式:', address)
        return address
      }
    } catch (error) {
      console.error('❌ 地址转换失败:', error)
      return address
    }
  },

  /**
   * 比较两个地址是否相等（自动处理格式转换）
   * @param {string} address1 - 地址1
   * @param {string} address2 - 地址2
   * @returns {boolean} 是否相等
   */
  isEqual(address1, address2) {
    if (!address1 || !address2) return false

    try {
      const base58_1 = this.toBase58(address1)
      const base58_2 = this.toBase58(address2)
      return base58_1.toLowerCase() === base58_2.toLowerCase()
    } catch (error) {
      console.error('❌ 地址比较失败:', error)
      return false
    }
  }
}

/**
 * 获取安全的预售开始时间
 * @param {number} customStartTime - 自定义开始时间（秒）
 * @returns {number} 安全的开始时间（秒）
 */
export function getSafeStartTime(customStartTime = null) {
  const now = Math.floor(Date.now() / 1000)
  const minDelay = DEVELOPMENT_CONFIG.IS_DEV_MODE ? 60 : 900 // 开发模式1分钟，生产模式15分钟

  if (customStartTime && customStartTime > now + minDelay) {
    return customStartTime
  }

  return now + minDelay
}

/**
 * 获取默认项目合约地址
 * @param {string} network - 网络名称，默认为当前网络
 * @returns {Object} 项目合约地址对象
 */
export function getDefaultProjectContracts(network = null) {
  const currentNetwork = network || CURRENT_NETWORK
  const contracts = DEFAULT_PROJECT_CONTRACTS[currentNetwork]

  if (!contracts) {
    throw new Error(`不支持的网络: ${currentNetwork}`)
  }

  return contracts
}

/**
 * 智能获取项目合约地址
 * 优先级：URL参数 > 默认配置
 * @param {URLSearchParams} urlParams - URL参数对象
 * @param {string} network - 网络名称
 * @returns {Object} 项目合约信息
 */
export function getProjectContracts(urlParams = null, network = null) {
  const currentNetwork = network || CURRENT_NETWORK

  // 尝试从URL参数获取
  if (urlParams) {
    const tokenAddress = urlParams.get('token')
    const presaleAddress = urlParams.get('presale')
    const projectName = urlParams.get('name')
    const projectSymbol = urlParams.get('symbol')

    if (tokenAddress && presaleAddress) {
      return {
        TOKEN_ADDRESS: tokenAddress,
        PRESALE_ADDRESS: presaleAddress,
        PROJECT_NAME: projectName || 'Custom Token',
        PROJECT_SYMBOL: projectSymbol || 'CTK',
        PROJECT_DESCRIPTION: '自定义代币项目',
        SOURCE: 'URL_PARAMS'
      }
    }
  }

  // 回退到默认配置
  const defaultContracts = getDefaultProjectContracts(currentNetwork)
  return {
    ...defaultContracts,
    SOURCE: 'DEFAULT_CONFIG'
  }
}

export default {
  TRON_NETWORKS,
  CURRENT_NETWORK,
  CONTRACT_ADDRESSES,
  DEFAULT_PROJECT_CONTRACTS,
  DEFAULT_TRANSACTION_PARAMS,
  DEFAULT_TOKEN_CONFIG,
  DEFAULT_PRESALE_CONFIG,
  ERROR_CODES,
  ERROR_MESSAGES,
  DEVELOPMENT_CONFIG,
  getCurrentNetworkConfig,
  getCurrentContractAddresses,
  getErrorMessage,
  getSafeStartTime,
  getDefaultProjectContracts,
  getProjectContracts,
  sunToTrx,
  trxToSun,
  AddressUtils
}
