/**
 * CoordinatorFactory合约服务类
 * 负责代币和预售合约的创建和管理
 */

import BaseContractService from './BaseContractService'
import { getContractABI } from '../contracts/abis'
import {
  getCurrentContractAddresses,
  DEFAULT_TRANSACTION_PARAMS,
  DEFAULT_TOKEN_CONFIG,
  DEFAULT_PRESALE_CONFIG,
  LGE_VALIDATION_RULES,
  DEVELOPMENT_CONFIG
} from '../config'

class CoordinatorFactoryService extends BaseContractService {
  constructor() {
    try {
      const addresses = getCurrentContractAddresses()
      const abi = getContractABI('COORDINATOR_FACTORY')

      // 添加调试信息
      console.log('🔍 CoordinatorFactoryService constructor:', {
        addresses,
        coordinatorFactory: addresses?.COORDINATOR_FACTORY,
        abiLoaded: !!abi
      })

      // 验证地址和ABI
      if (!addresses) {
        throw new Error('无法获取合约地址配置')
      }

      if (!addresses.COORDINATOR_FACTORY) {
        throw new Error('CoordinatorFactory合约地址未配置')
      }

      if (!abi) {
        throw new Error('CoordinatorFactory ABI未找到')
      }

      super(addresses.COORDINATOR_FACTORY, abi, 'CoordinatorFactory')
    } catch (error) {
      console.error('❌ CoordinatorFactoryService初始化失败:', error)
      throw error
    }
  }

  /**
   * 获取默认交易参数
   * @param {string} methodName - 方法名
   * @returns {Object} 默认参数
   */
  getDefaultTxParams(methodName) {
    switch (methodName) {
      case 'createTokenAndPresale':
        return DEFAULT_TRANSACTION_PARAMS.CREATE_TOKEN_PRESALE
      default:
        return DEFAULT_TRANSACTION_PARAMS.VIEW_CALL
    }
  }

  /**
   * 创建代币和预售合约对
   * @param {Object} tokenConfig - 代币配置
   * @param {Object} presaleConfig - 预售配置
   * @param {Object} options - 交易选项
   * @returns {Promise<Object>} 创建结果
   */
  async createTokenAndPresale(tokenConfig, presaleConfig, options = {}) {
    try {
      console.log('🚀 开始创建代币和预售合约...')
      console.log('📋 原始配置:')
      console.log('  tokenConfig:', tokenConfig)
      console.log('  presaleConfig:', presaleConfig)
      console.log('  options:', options)

      // 验证配置参数
      console.log('🔍 验证配置参数...')
      this.validateTokenConfig(tokenConfig)
      this.validatePresaleConfig(presaleConfig)
      console.log('✅ 参数验证通过')

      // 准备合约参数
      console.log('🔧 准备合约参数...')
      const tokenParams = this.prepareTokenConfig(tokenConfig)
      const presaleParams = this.preparePresaleConfig(presaleConfig)

      console.log('📝 最终合约参数:')
      console.log('Token参数数量:', tokenParams.length)
      console.log('Token配置:', tokenParams)
      console.log('Presale参数数量:', presaleParams.length)
      console.log('Presale配置:', presaleParams)

      // 验证参数数量
      if (tokenParams.length !== 14) {
        throw new Error(`Token参数数量错误: 期望14个，实际${tokenParams.length}个`)
      }
      if (presaleParams.length !== 17) {
        throw new Error(`Presale参数数量错误: 期望17个，实际${presaleParams.length}个`)
      }

      // 发送交易
      console.log('📤 发送合约交易...')
      const result = await this.sendTransaction(
        'createTokenAndPresale',
        [tokenParams, presaleParams],
        options
      )

      // 获取创建的合约地址
      let contractAddresses = null
      if (result.txResult && result.txResult.success) {
        try {
          contractAddresses = await this.getCreatedContractAddresses()
        } catch (error) {
          console.warn('⚠️ 无法自动获取合约地址:', error.message)
        }
      }

      return {
        ...result,
        contractAddresses,
        tokenConfig: tokenParams,
        presaleConfig: presaleParams
      }

    } catch (error) {
      console.error('❌ 创建代币和预售合约失败:', error)
      throw error
    }
  }

  /**
   * 准备代币配置参数
   * @param {Object} config - 用户配置
   * @returns {Array} 合约参数数组
   */
  prepareTokenConfig(config) {
    const mergedConfig = { ...DEFAULT_TOKEN_CONFIG, ...config }
    
    return [
      mergedConfig.name,
      mergedConfig.symbol,
      mergedConfig.totalSupply,
      mergedConfig.feeBuy,
      mergedConfig.feeSell,
      mergedConfig.feeRecipient || this.tronWebService.currentAccount,
      mergedConfig.lpBurnEnabled,
      mergedConfig.lpBurnFrequency,
      mergedConfig.percentForLPBurn,
      mergedConfig.burnLimit,
      mergedConfig.protectTime,
      mergedConfig.protectFee,
      mergedConfig.isInsideSell,
      mergedConfig.swapThreshold
    ]
  }

  /**
   * 准备预售配置参数
   * @param {Object} config - 用户配置
   * @returns {Array} 合约参数数组
   */
  preparePresaleConfig(config) {
    const mergedConfig = { ...DEFAULT_PRESALE_CONFIG, ...config }

    // 如果没有设置开始时间，设置为当前时间+配置的分钟数
    if (!mergedConfig.startTime || mergedConfig.startTime === 0) {
      const minMinutes = DEVELOPMENT_CONFIG.MIN_START_TIME_MINUTES
      // 开发模式下添加30秒缓冲，避免时间验证冲突
      const bufferSeconds = DEVELOPMENT_CONFIG.IS_DEV_MODE ? 30 : 0
      mergedConfig.startTime = Math.floor(Date.now() / 1000) + (minMinutes * 60) + bufferSeconds
      console.log(`🕐 自动设置开始时间为 ${minMinutes} 分钟${bufferSeconds > 0 ? ` + ${bufferSeconds}秒缓冲` : ''}后 (${DEVELOPMENT_CONFIG.IS_DEV_MODE ? '开发模式' : '生产模式'})`)
    }

    return [
      mergedConfig.presaleEthAmount,
      mergedConfig.tradeEthAmount,
      mergedConfig.maxTotalNum,
      mergedConfig.presaleMaxNum,
      mergedConfig.marketDisAmount,
      mergedConfig.userLPShare,
      mergedConfig.devLPShare,
      mergedConfig.devLPReceiver,
      mergedConfig.lpDistributionEnabled,
      // === LGE集成参数 ===
      mergedConfig.startTime,
      mergedConfig.hardcap,
      mergedConfig.maxBuyPerWallet,
      mergedConfig.vestingDelay,
      mergedConfig.vestingRate,
      mergedConfig.vestingEnabled,
      mergedConfig.backingShare,
      mergedConfig.backingReceiver
    ]
  }

  /**
   * 验证代币配置
   * @param {Object} config - 代币配置
   */
  validateTokenConfig(config) {
    const required = ['name', 'symbol', 'totalSupply']
    
    for (const field of required) {
      if (!config[field]) {
        throw new Error(`代币配置缺少必需字段: ${field}`)
      }
    }

    // 验证数值范围
    if (config.feeBuy && (config.feeBuy < 0 || config.feeBuy > 10000)) {
      throw new Error('买入手续费必须在0-10000之间 (0-100%)')
    }

    if (config.feeSell && (config.feeSell < 0 || config.feeSell > 10000)) {
      throw new Error('卖出手续费必须在0-10000之间 (0-100%)')
    }
  }

  /**
   * 验证预售配置
   * @param {Object} config - 预售配置
   */
  validatePresaleConfig(config) {
    console.log('🔍 开始验证预售配置...')
    console.log('📋 配置详情:', {
      ...config,
      startTime: config.startTime ? `${config.startTime} (${new Date(config.startTime * 1000).toLocaleString()})` : '未设置'
    })
    console.log('⚙️ 开发模式配置:', DEVELOPMENT_CONFIG)

    const required = ['presaleEthAmount', 'tradeEthAmount', 'maxTotalNum', 'presaleMaxNum']

    for (const field of required) {
      if (config[field] === undefined || config[field] === null) {
        throw new Error(`预售配置缺少必需字段: ${field}`)
      }
    }

    // 验证数值逻辑
    if (parseInt(config.presaleMaxNum) > parseInt(config.maxTotalNum)) {
      throw new Error('预售最大数量不能超过总最大数量')
    }

    // 验证LP分配配置（如果启用）
    if (config.lpDistributionEnabled) {
      const userShare = parseInt(config.userLPShare) || 0
      const devShare = parseInt(config.devLPShare) || 0

      if (userShare < 0 || userShare > 10000) {
        throw new Error('用户LP分配比例必须在0-10000基点之间')
      }

      if (devShare < 0 || devShare > 10000) {
        throw new Error('开发团队LP分配比例必须在0-10000基点之间')
      }

      if (userShare + devShare !== 10000) {
        throw new Error('LP分配比例总和必须为10000基点(100%)')
      }

      if (devShare > 0 && (!config.devLPReceiver || config.devLPReceiver === '0x0000000000000000000000000000000000000000')) {
        throw new Error('启用开发团队LP分配时必须提供有效的接收地址')
      }

      // TRON地址验证
      if (config.devLPReceiver && config.devLPReceiver !== '0x0000000000000000000000000000000000000000') {
        if (!config.devLPReceiver.startsWith('T') || config.devLPReceiver.length !== 34) {
          throw new Error('开发团队LP接收地址必须是有效的TRON地址')
        }
      }
    }

    // === LGE参数验证（基于LEG.txt规则） ===

    // Vesting参数验证
    if (config.vestingEnabled) {
      const vestingDelay = parseInt(config.vestingDelay) || 0
      const vestingRate = parseInt(config.vestingRate) || 0

      if (vestingDelay < LGE_VALIDATION_RULES.vestingDelay.min ||
          vestingDelay > LGE_VALIDATION_RULES.vestingDelay.max) {
        throw new Error(`Vesting延迟必须在${LGE_VALIDATION_RULES.vestingDelay.min / (24*60*60)}-${LGE_VALIDATION_RULES.vestingDelay.max / (24*60*60)}天之间`)
      }

      if (vestingRate < LGE_VALIDATION_RULES.vestingRate.min ||
          vestingRate > LGE_VALIDATION_RULES.vestingRate.max) {
        throw new Error(`Vesting释放比例必须在${LGE_VALIDATION_RULES.vestingRate.min}-${LGE_VALIDATION_RULES.vestingRate.max}%之间`)
      }
    }

    // Backing参数验证
    if (config.backingShare > 0) {
      const backingShare = parseInt(config.backingShare) || 0

      if (backingShare < LGE_VALIDATION_RULES.backingShare.min ||
          backingShare > LGE_VALIDATION_RULES.backingShare.max) {
        throw new Error(`Backing份额必须在${LGE_VALIDATION_RULES.backingShare.min}-${LGE_VALIDATION_RULES.backingShare.max}%之间`)
      }

      if (!config.backingReceiver || config.backingReceiver === '0x0000000000000000000000000000000000000000') {
        throw new Error('启用Backing时必须提供有效的接收地址')
      }

      // TRON地址验证
      if (!config.backingReceiver.startsWith('T') || config.backingReceiver.length !== 34) {
        throw new Error('Backing接收地址必须是有效的TRON地址')
      }
    }

    // 开发团队份额验证（基于LGE规则）
    if (config.devLPShare > 0) {
      const devSharePercent = (parseInt(config.devLPShare) || 0) / 100 // 转换为百分比
      if (devSharePercent > LGE_VALIDATION_RULES.devShare.max) {
        throw new Error(`开发团队LP份额不能超过${LGE_VALIDATION_RULES.devShare.max}%`)
      }
    }

    // 时间验证
    if (config.startTime && config.startTime > 0) {
      const startTime = parseInt(config.startTime)
      const minMinutes = DEVELOPMENT_CONFIG.MIN_START_TIME_MINUTES
      const currentTime = Math.floor(Date.now() / 1000)

      // 开发模式下允许10秒的时间容差，生产模式严格验证
      const tolerance = DEVELOPMENT_CONFIG.IS_DEV_MODE ? 10 : 0
      const minStartTime = currentTime + (minMinutes * 60) - tolerance

      if (startTime < minStartTime) {
        const modeText = DEVELOPMENT_CONFIG.IS_DEV_MODE ? '开发模式' : '生产模式'
        const actualDelay = Math.max(0, Math.floor((startTime - currentTime) / 60))

        console.error('❌ 时间验证失败:')
        console.error(`  当前时间: ${new Date(currentTime * 1000).toLocaleString()}`)
        console.error(`  设置时间: ${new Date(startTime * 1000).toLocaleString()}`)
        console.error(`  要求延迟: ${minMinutes}分钟`)
        console.error(`  实际延迟: ${actualDelay}分钟`)

        throw new Error(`预售开始时间必须至少在当前时间${minMinutes}分钟之后 (${modeText})`)
      }

      console.log(`✅ 时间验证通过: 预售将在 ${new Date(startTime * 1000).toLocaleString()} 开始`)
    }

    // 硬顶和最大购买量验证
    if (config.maxBuyPerWallet && config.hardcap) {
      const maxBuy = parseInt(config.maxBuyPerWallet) || 0
      const hardcap = parseInt(config.hardcap) || 0

      if (maxBuy > hardcap) {
        throw new Error('每个钱包最大购买量不能超过硬顶限制')
      }
    }
  }

  /**
   * 获取创建费用
   * @returns {Promise<string>} 创建费用(SUN)
   */
  async getCreationFee() {
    return await this.callMethod('creationFee')
  }

  /**
   * 检查工厂是否启用
   * @returns {Promise<boolean>} 是否启用
   */
  async isFactoryEnabled() {
    return await this.callMethod('factoryEnabled')
  }

  /**
   * 获取总创建数量
   * @returns {Promise<string>} 总创建数量
   */
  async getTotalPairsCreated() {
    return await this.callMethod('totalPairsCreated')
  }

  /**
   * 获取工厂地址信息
   * @returns {Promise<Object>} 工厂地址信息
   */
  async getFactoryAddresses() {
    const result = await this.callMethod('getFactoryAddresses')
    return {
      tokenFactory: result._tokenFactory || result[0],
      presaleFactory: result._presaleFactory || result[1]
    }
  }

  /**
   * 根据代币地址获取预售地址
   * @param {string} tokenAddress - 代币地址
   * @returns {Promise<string>} 预售地址
   */
  async getTokenPresale(tokenAddress) {
    return await this.callMethod('getTokenPresale', [tokenAddress])
  }

  /**
   * 根据预售地址获取代币地址
   * @param {string} presaleAddress - 预售地址
   * @returns {Promise<string>} 代币地址
   */
  async getPresaleToken(presaleAddress) {
    return await this.callMethod('getPresaleToken', [presaleAddress])
  }

  /**
   * 获取代币创建者
   * @param {string} tokenAddress - 代币地址
   * @returns {Promise<string>} 创建者地址
   */
  async getTokenCreator(tokenAddress) {
    return await this.callMethod('getTokenCreator', [tokenAddress])
  }

  /**
   * 获取最新创建的合约地址
   * @returns {Promise<Object>} 合约地址信息
   */
  async getCreatedContractAddresses() {
    try {
      // 方法1: 通过事件获取
      const events = await this.getEvents('TokenPresalePairCreated', { size: 1 })
      
      if (events && events.length > 0) {
        const latestEvent = events[0]
        return {
          tokenAddress: latestEvent.result.token,
          presaleAddress: latestEvent.result.presale,
          creator: latestEvent.result.creator,
          totalSupply: latestEvent.result.totalSupply
        }
      }

      // 方法2: 如果事件获取失败，返回提示
      throw new Error('无法从事件中获取合约地址，请手动查询')

    } catch (error) {
      console.error('❌ 获取创建的合约地址失败:', error)
      throw error
    }
  }

  /**
   * 获取所有代币预售对
   * @param {number} offset - 偏移量
   * @param {number} limit - 限制数量
   * @returns {Promise<Object>} 代币对列表和总数
   */
  async getAllTokenPresalePairs(offset = 0, limit = 50) {
    try {
      console.log('🔍 获取所有代币预售对:', { offset, limit })
      console.log('🏭 合约地址:', this.contractAddress)
      console.log('🔧 合约类型:', this.contractType)

      // 确保合约已初始化
      await this.ensureInitialized()
      console.log('✅ 合约已初始化')

      // 首先检查总数量
      console.log('📊 检查总代币对数量...')
      const totalPairs = await this.getTotalPairsCreated()
      console.log('📊 总代币对数量:', totalPairs)

      if (totalPairs === 0) {
        console.log('ℹ️ 暂无代币对，返回空结果')
        return {
          pairs: [],
          total: 0
        }
      }

      // 如果offset超过总数，返回空结果
      if (offset >= totalPairs) {
        console.log('ℹ️ 偏移量超过总数，返回空结果')
        return {
          pairs: [],
          total: totalPairs
        }
      }

      console.log('📞 调用 getAllTokenPresalePairs 方法...')
      const result = await this.callMethod('getAllTokenPresalePairs', [offset, limit])

      console.log('📋 原始合约返回结果:', result)
      console.log('📋 结果类型:', typeof result)
      console.log('📋 是否为数组:', Array.isArray(result))

      // 解析结果 - 根据ABI，返回结构应该是 (TokenPresalePair[] pairs, uint256 total)
      let pairs, total

      if (Array.isArray(result)) {
        // 如果返回的是数组，第一个元素是pairs，第二个是total
        pairs = result[0] || []
        total = result[1] || 0
        console.log('📋 数组解析 - pairs:', pairs, 'total:', total)
      } else if (result && typeof result === 'object') {
        // 如果返回的是对象
        pairs = result.pairs || result[0] || []
        total = result.total || result[1] || 0
        console.log('📋 对象解析 - pairs:', pairs, 'total:', total)
      } else {
        pairs = []
        total = 0
        console.log('📋 默认解析 - 空结果')
      }

      console.log('✅ 解析后的结果:', {
        pairsCount: Array.isArray(pairs) ? pairs.length : 0,
        total: total.toString()
      })

      return {
        pairs: Array.isArray(pairs) ? pairs.map(pair => this.formatTokenPair(pair)) : [],
        total: parseInt(total.toString()) || 0
      }

    } catch (error) {
      console.error('❌ 获取代币预售对失败:', error)
      console.error('❌ 错误详情:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })

      // 如果是因为没有代币对而失败，返回空结果
      if (error.message && (error.message.includes('revert') || error.message.includes('REVERT'))) {
        console.log('ℹ️ 合约返回revert，可能是没有代币对')
        return {
          pairs: [],
          total: 0
        }
      }

      throw error
    }
  }

  /**
   * 按创建者获取代币预售对
   * @param {string} creator - 创建者地址
   * @param {number} offset - 偏移量
   * @param {number} limit - 限制数量
   * @returns {Promise<Object>} 代币对列表和总数
   */
  async getTokenPresalePairsByCreator(creator, offset = 0, limit = 50) {
    try {
      console.log('🔍 按创建者获取代币预售对:', { creator, offset, limit })

      const result = await this.callMethod('getTokenPresalePairsByCreator', [creator, offset, limit])

      const pairs = result.pairs || result[0] || []
      const total = result.total || result[1] || 0

      return {
        pairs: pairs.map(pair => this.formatTokenPair(pair)),
        total: parseInt(total.toString())
      }

    } catch (error) {
      console.error('❌ 按创建者获取代币预售对失败:', error)
      throw error
    }
  }

  /**
   * 获取代币预售对详情
   * @param {string} tokenAddress - 代币地址
   * @returns {Promise<Object>} 代币对详情
   */
  async getTokenPresalePairDetails(tokenAddress) {
    try {
      console.log('🔍 获取代币预售对详情:', tokenAddress)

      const result = await this.callMethod('getTokenPresalePairDetails', [tokenAddress])

      return this.formatTokenPair(result)

    } catch (error) {
      console.error('❌ 获取代币预售对详情失败:', error)
      throw error
    }
  }

  /**
   * 获取总创建数量
   * @returns {Promise<number>} 总数量
   */
  async getTotalPairsCreated() {
    try {
      console.log('📞 调用 totalPairsCreated 方法...')

      // 确保合约已初始化
      await this.ensureInitialized()

      // 确保TronWeb已初始化
      if (!this.tronWebService.tronWeb) {
        await this.tronWebService.initialize()
      }

      // 检查连接状态
      console.log('🔗 TronWeb连接状态:', {
        isConnected: this.tronWebService.isConnected,
        currentAccount: this.tronWebService.currentAccount,
        defaultAddress: this.tronWebService.tronWeb?.defaultAddress?.base58
      })

      const result = await this.callMethod('totalPairsCreated')
      console.log('📊 totalPairsCreated 原始结果:', result)

      const total = parseInt(result.toString()) || 0
      console.log('📊 解析后的总代币对数量:', total)
      return total
    } catch (error) {
      console.error('❌ 获取总创建数量失败:', error)
      console.error('❌ 错误详情:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      })

      // 如果是地址相关错误，尝试重新连接
      if (error.message && error.message.includes('owner_address')) {
        console.log('🔄 检测到地址错误，尝试重新初始化...')
        try {
          await this.tronWebService.connectWallet()
          const retryResult = await this.callMethod('totalPairsCreated')
          const retryTotal = parseInt(retryResult.toString()) || 0
          console.log('🔄 重试成功，总数量:', retryTotal)
          return retryTotal
        } catch (retryError) {
          console.error('❌ 重试也失败了:', retryError)
        }
      }

      // 如果获取失败，返回0而不是抛出错误
      return 0
    }
  }

  /**
   * 获取创建费用
   * @returns {Promise<string>} 创建费用（以sun为单位）
   */
  async getCreationFee() {
    try {
      const result = await this.callMethod('creationFee')
      return result.toString()
    } catch (error) {
      console.error('❌ 获取创建费用失败:', error)
      throw error
    }
  }

  /**
   * 格式化代币对数据
   * @param {Object} pair - 原始代币对数据
   * @returns {Object} 格式化后的数据
   */
  formatTokenPair(pair) {
    try {
      // 处理不同的数据结构
      if (Array.isArray(pair)) {
        return {
          tokenAddress: pair[0],
          presaleAddress: pair[1],
          creator: pair[2],
          createdAt: pair[3] ? parseInt(pair[3].toString()) : 0,
          tokenName: pair[4] || '',
          tokenSymbol: pair[5] || '',
          totalSupply: pair[6] ? pair[6].toString() : '0'
        }
      } else if (typeof pair === 'object' && pair !== null) {
        return {
          tokenAddress: pair.tokenAddress || pair._tokenAddress,
          presaleAddress: pair.presaleAddress || pair._presaleAddress,
          creator: pair.creator || pair._creator,
          createdAt: pair.createdAt ? parseInt(pair.createdAt.toString()) : 0,
          tokenName: pair.tokenName || pair._tokenName || '',
          tokenSymbol: pair.tokenSymbol || pair._tokenSymbol || '',
          totalSupply: pair.totalSupply ? pair.totalSupply.toString() : '0'
        }
      }

      throw new Error('无效的代币对数据格式')
    } catch (error) {
      console.error('❌ 格式化代币对数据失败:', error)
      return {
        tokenAddress: '',
        presaleAddress: '',
        creator: '',
        createdAt: 0,
        tokenName: 'Unknown',
        tokenSymbol: 'UNK',
        totalSupply: '0'
      }
    }
  }

  /**
   * 获取工厂状态信息
   * @returns {Promise<Object>} 工厂状态
   */
  async getFactoryStatus() {
    try {
      const [
        isEnabled,
        creationFee,
        totalPairs,
        factoryAddresses
      ] = await this.batchCall([
        { method: 'factoryEnabled' },
        { method: 'creationFee' },
        { method: 'totalPairsCreated' },
        { method: 'getFactoryAddresses' }
      ])

      return {
        isEnabled,
        creationFee,
        totalPairs,
        factoryAddresses: {
          tokenFactory: factoryAddresses._tokenFactory || factoryAddresses[0],
          presaleFactory: factoryAddresses._presaleFactory || factoryAddresses[1]
        }
      }
    } catch (error) {
      console.error('❌ 获取工厂状态失败:', error)
      throw error
    }
  }
}

// 创建单例实例
const coordinatorFactoryService = new CoordinatorFactoryService()

export default coordinatorFactoryService
