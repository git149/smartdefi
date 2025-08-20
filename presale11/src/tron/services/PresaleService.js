/**
 * Presale合约服务类
 * 负责预售相关的所有操作
 */

import BaseContractService from './BaseContractService'
import { getContractABI } from '../contracts/abis'
import { DEFAULT_TRANSACTION_PARAMS } from '../config'

class PresaleService extends BaseContractService {
  constructor(presaleAddress = null) {
    const abi = getContractABI('PRESALE')
    super(presaleAddress, abi, 'Presale')
  }

  /**
   * 获取默认交易参数
   * @param {string} methodName - 方法名
   * @returns {Object} 默认参数
   */
  getDefaultTxParams(methodName) {
    switch (methodName) {
      case 'preSale':
      case 'trade':
        return DEFAULT_TRANSACTION_PARAMS.PRESALE_PURCHASE
      default:
        return DEFAULT_TRANSACTION_PARAMS.VIEW_CALL
    }
  }

  /**
   * 参与预售
   * @param {number} frequency - 购买数量倍数
   * @param {Object} options - 交易选项
   * @returns {Promise<Object>} 交易结果
   */
  async participatePresale(frequency = 1, options = {}) {
    try {
      console.log('💰 参与预售...', { frequency, options })

      // 调用预售合约的preSale方法
      return await this.sendTransaction('preSale', [], options)
    } catch (error) {
      console.error('❌ 参与预售失败:', error)
      throw error
    }
  }

  /**
   * 进行交易
   * @param {Object} options - 交易选项
   * @returns {Promise<Object>} 交易结果
   */
  async trade(options = {}) {
    try {
      console.log('🔄 进行交易...')

      return await this.sendTransaction('trade', [], options)
    } catch (error) {
      console.error('❌ 交易失败:', error)
      throw error
    }
  }



  /**
   * 出售代币
   * @param {string} amount - 出售数量
   * @returns {Promise<Object>} 交易结果
   */
  async sellTokens(amount) {
    try {
      console.log('💸 出售代币:', amount)

      return await this.sendTransaction('sellToken', [amount])
    } catch (error) {
      console.error('❌ 出售代币失败:', error)
      throw error
    }
  }

  /**
   * 获取代币地址
   * @returns {Promise<string>} 代币地址
   */
  async getCoinAddress() {
    return await this.callMethod('coinAddress')
  }



  /**
   * 获取用户预售信息
   * @param {string} userAddress - 用户地址
   * @returns {Promise<Object>} 用户预售信息
   */
  async getUserPresaleInfo(userAddress) {
    const result = await this.callMethod('preSaleAddress', [userAddress])

    return {
      user: result.user || result[0],
      preSaleCount: result.preSaleCount || result[1],
      hasUnlockAmount: result.hasUnlockAmount || result[2],
      stage: result.stage || result[3],
      verify: result.verify || result[4]
    }
  }

  /**
   * 获取用户交易次数
   * @param {string} userAddress - 用户地址
   * @returns {Promise<string>} 交易次数
   */
  async getUserTradeCount(userAddress) {
    return await this.callMethod('tradeCount', [userAddress])
  }

  /**
   * 获取最大内部数量
   * @returns {Promise<string>} 最大内部数量
   */
  async getMaxInsideNum() {
    return await this.callMethod('maxInsideNum')
  }

  /**
   * 获取总预售BNB数量
   * @returns {Promise<string>} 总预售BNB数量
   */
  async getTotalPresaleBNB() {
    return await this.callMethod('totalPresaleBNB')
  }

  /**
   * 获取市场价格
   * @returns {Promise<Object>} 市场价格信息
   */
  async getMarketPrice() {
    const result = await this.callMethod('getMarketPrice')

    return {
      tokenPrice: result.tokenPrice || result[0],
      marketCap: result.marketCap || result[1]
    }
  }

  /**
   * 获取合约所有者
   * @returns {Promise<string>} 所有者地址
   */
  async getOwner() {
    return await this.callMethod('owner')
  }



  /**
   * 设置用户验证状态 (需要支付费用)
   * @param {string} userAddress - 用户地址
   * @param {boolean} verify - 验证状态
   * @param {Object} options - 交易选项
   * @returns {Promise<Object>} 交易结果
   */
  async setUserVerify(userAddress, verify, options = {}) {
    try {
      console.log('✅ 设置用户验证状态:', userAddress, verify)

      return await this.sendTransaction('setVerify', [userAddress, verify], options)
    } catch (error) {
      console.error('❌ 设置用户验证状态失败:', error)
      throw error
    }
  }

  /**
   * 完成预售并添加流动性 (仅所有者)
   * @returns {Promise<Object>} 交易结果
   */
  async finalizePresaleAndAddLiquidity() {
    try {
      console.log('🏁 完成预售并添加流动性...')

      return await this.sendTransaction('finalizePresaleAndAddLiquidity')
    } catch (error) {
      console.error('❌ 完成预售失败:', error)
      throw error
    }
  }

  /**
   * 获取完成状态
   * @returns {Promise<Object>} 完成状态信息
   */
  async getFinalizationStatus() {
    const result = await this.callMethod('getFinalizationStatus')

    return {
      isFinalized: result.isFinalized || result[0],
      autoEnabled: result.autoEnabled || result[1],
      tokenAmount: result.tokenAmount || result[2],
      bnbAmount: result.bnbAmount || result[3],
      liquidityAdded: result.liquidityAdded_ || result[4],
      lpTokens: result.lpTokens || result[5]
    }
  }

  /**
   * 获取预售完整状态
   * @returns {Promise<Object>} 完整状态信息
   */
  async getPresaleFullStatus() {
    try {
      const [
        presaleStatus,
        maxInsideNum,
        totalPresaleBNB,
        marketPrice,
        finalizationStatus,
        owner
      ] = await this.batchCall([
        { method: 'presaleStatus' },
        { method: 'maxInsideNum' },
        { method: 'totalPresaleBNB' },
        { method: 'getMarketPrice' },
        { method: 'getFinalizationStatus' },
        { method: 'owner' }
      ])

      // 转换BigInt为普通数字类型
      const convertBigInt = (value) => {
        if (typeof value === 'bigint') {
          return Number(value)
        }
        return value
      }

      return {
        presaleStatus: convertBigInt(presaleStatus),
        maxInsideNum: convertBigInt(maxInsideNum),
        totalPresaleBNB: convertBigInt(totalPresaleBNB),
        marketPrice: {
          tokenPrice: convertBigInt(marketPrice.tokenPrice || marketPrice[0]),
          marketCap: convertBigInt(marketPrice.marketCap || marketPrice[1])
        },
        finalizationStatus: {
          isFinalized: finalizationStatus.isFinalized || finalizationStatus[0],
          autoEnabled: finalizationStatus.autoEnabled || finalizationStatus[1],
          tokenAmount: convertBigInt(finalizationStatus.tokenAmount || finalizationStatus[2]),
          bnbAmount: convertBigInt(finalizationStatus.bnbAmount || finalizationStatus[3]),
          liquidityAdded: finalizationStatus.liquidityAdded_ || finalizationStatus[4],
          lpTokens: convertBigInt(finalizationStatus.lpTokens || finalizationStatus[5])
        },
        owner
      }
    } catch (error) {
      console.error('❌ 获取预售完整状态失败:', error)
      throw error
    }
  }

  /**
   * 获取用户完整信息
   * @param {string} userAddress - 用户地址
   * @returns {Promise<Object>} 用户完整信息
   */
  async getUserFullInfo(userAddress) {
    try {
      const [
        presaleInfo,
        tradeCount
      ] = await this.batchCall([
        { method: 'preSaleAddress', params: [userAddress] },
        { method: 'tradeCount', params: [userAddress] }
      ])

      // 转换BigInt为普通数字类型
      const convertBigInt = (value) => {
        if (typeof value === 'bigint') {
          return Number(value)
        }
        return value
      }

      return {
        presaleInfo: {
          user: presaleInfo.user || presaleInfo[0],
          preSaleCount: convertBigInt(presaleInfo.preSaleCount || presaleInfo[1]),
          hasUnlockAmount: convertBigInt(presaleInfo.hasUnlockAmount || presaleInfo[2]),
          stage: convertBigInt(presaleInfo.stage || presaleInfo[3]),
          verify: presaleInfo.verify || presaleInfo[4]
        },
        tradeCount: convertBigInt(tradeCount)
      }
    } catch (error) {
      console.error('❌ 获取用户完整信息失败:', error)
      throw error
    }
  }

  /**
   * 获取预售基本信息 (适配internalTrade页面需求)
   * @returns {Promise<Object>} 预售基本信息
   */
  async getPresaleBasicInfo() {
    try {
      const [
        presaleStatus,
        maxInsideNum,
        totalPresaleBNB,
        marketDisAmount,
        stageUnlockRate,
        nowStage,
        coinAddress,
        owner
      ] = await this.batchCall([
        { method: 'presaleStatus' },
        { method: 'maxInsideNum' },
        { method: 'totalPresaleBNB' },
        { method: 'marketDisAmount' },
        { method: 'stageUnlockRate' },
        { method: 'nowStage' },
        { method: 'coinAddress' },
        { method: 'owner' }
      ])

      // 转换BigInt为普通数字类型，避免类型混合错误
      const convertBigInt = (value) => {
        if (typeof value === 'bigint') {
          return Number(value)
        }
        return value
      }

      // 安全的进度计算，处理BigInt类型
      const calculateProgress = () => {
        try {
          const maxNum = convertBigInt(maxInsideNum)
          const totalBNB = convertBigInt(totalPresaleBNB)

          if (maxNum > 0) {
            return Math.round((totalBNB / maxNum) * 100)
          }
          return 0
        } catch (error) {
          console.warn('⚠️ 进度计算失败:', error)
          return 0
        }
      }

      return {
        openState: convertBigInt(presaleStatus), // 预售状态 (0=未开始, 1=进行中, 2/3/4=已结束)
        preSaleMaxNum: convertBigInt(maxInsideNum), // 最大预售数量
        buyNumber: convertBigInt(totalPresaleBNB), // 已购买数量
        totalNumber: convertBigInt(maxInsideNum), // 总数量
        marketDisAmount: convertBigInt(marketDisAmount), // 市场分发数量
        stageUnlockRate: convertBigInt(stageUnlockRate), // 阶段解锁率
        nowStage: convertBigInt(nowStage), // 当前阶段
        coinAddress, // 代币地址
        owner, // 合约所有者
        progressValue: calculateProgress() // 进度百分比
      }
    } catch (error) {
      console.error('❌ 获取预售基本信息失败:', error)
      throw error
    }
  }

  /**
   * 获取预售价格信息
   * @returns {Promise<Object>} 价格信息
   */
  async getPresalePriceInfo() {
    try {
      // 使用更可靠的 getPoolData 方法
      const poolData = await this.callMethod('getPoolData')
      
      // getPoolData 返回数组: [presaleEthAmount_, tradeEthAmount_, maxTotalNum_, presaleMaxNum_, coinAmount_, stageUnlockRate_]
      const [
        preSaleEthAmount,
        tradeEthAmount,
        maxTotalNum,
        presaleMaxNum,
        coinAmount,
        stageUnlockRate
      ] = poolData

      return {
        preSaleEthAmount: preSaleEthAmount, // 预售价格 (TRX)
        tradeEthAmount: tradeEthAmount, // 交易价格 (TRX)
        coinAmount: coinAmount, // 每TRX可购买的代币数量
        maxTotalNum: maxTotalNum, // 最大总量
        presaleMaxNum: presaleMaxNum, // 预售最大数量
        stageUnlockRate: stageUnlockRate, // 阶段解锁比例
        tokenPrice: 'N/A', // 暂时不提供
        marketCap: 'N/A' // 暂时不提供
      }
    } catch (error) {
      console.error('❌ 获取预售价格信息失败:', error)
      throw error
    }
  }

  /**
   * 获取合约余额信息
   * @returns {Promise<Object>} 余额信息
   */
  async getContractBalances() {
    try {
      const result = await this.callMethod('getContractBalances')

      return {
        tokenBalance: result.tokenBalance || result[0],
        bnbBalance: result.bnbBalance || result[1]
      }
    } catch (error) {
      console.error('❌ 获取合约余额失败:', error)
      throw error
    }
  }

  // ==================== 预售状态管理方法 ====================

  /**
   * 获取预售状态
   * @returns {Promise<number>} 预售状态 (0=未开始, 1=进行中, 2/3/4=已结束)
   */
  async getPresaleStatus() {
    try {
      console.log('🔍 开始获取预售状态...')
      console.log('📍 预售合约地址:', this.contractAddress)

      const status = await this.callMethod('presaleStatus')
      console.log('📊 合约返回的原始状态:', status)

      const parsedStatus = parseInt(status)
      console.log('📊 解析后的预售状态:', parsedStatus)

      return parsedStatus
    } catch (error) {
      console.error('❌ 获取预售状态失败:', error)

      // 提供更详细的错误信息
      if (error.message && error.message.includes('owner_address')) {
        console.error('🚨 检测到owner_address参数错误，这是一个配置问题')
        console.error('💡 建议：检查TronWeb配置和合约调用参数')
      }

      throw new Error(`presaleStatus: 交易失败，请重试`)
    }
  }

  /**
   * 设置预售状态 (仅合约所有者可调用)
   * @param {number} status - 预售状态 (0=未开始, 1=进行中, 2=已结束)
   * @param {Object} options - 交易选项
   * @returns {Promise<Object>} 交易结果
   */
  async setPresaleStatus(status, options = {}) {
    try {
      console.log('🔄 设置预售状态:', status)

      const txOptions = {
        feeLimit: 50000000, // 50 TRX
        ...options
      }

      const result = await this.sendTransaction('setPresaleStatus', [status], txOptions)

      console.log('✅ 预售状态设置成功:', result)
      return result
    } catch (error) {
      console.error('❌ 设置预售状态失败:', error)
      throw error
    }
  }

  /**
   * 开始预售 (设置状态为1)
   * @param {Object} options - 交易选项
   * @returns {Promise<Object>} 交易结果
   */
  async startPresale(options = {}) {
    return this.setPresaleStatus(1, options)
  }

  /**
   * 结束预售 (设置状态为2)
   * @param {Object} options - 交易选项
   * @returns {Promise<Object>} 交易结果
   */
  async endPresale(options = {}) {
    return this.setPresaleStatus(2, options)
  }

  /**
   * 获取预售状态描述
   * @param {number} status - 状态数值
   * @returns {string} 状态描述
   */
  getPresaleStatusText(status) {
    const statusMap = {
      0: '未开始',
      1: '进行中',
      2: '已结束',
      3: '已结束',
      4: '已结束'
    }
    return statusMap[status] || '未知状态'
  }

  /**
   * 检查是否为合约所有者
   * @param {string} address - 要检查的地址
   * @returns {Promise<boolean>} 是否为所有者
   */
  async isOwner(address) {
    try {
      const owner = await this.callMethod('owner')

      // 导入地址工具
      const { AddressUtils } = await import('../config/index.js')

      // 使用地址工具进行格式转换
      const ownerBase58 = AddressUtils.toBase58(owner)
      const addressBase58 = AddressUtils.toBase58(address)

      // 详细的调试信息
      console.log('🔍 权限检查详情:', {
        合约地址: this.contractAddress,
        合约Owner原始: owner,
        合约Owner_base58: ownerBase58,
        当前钱包原始: address,
        当前钱包_base58: addressBase58,
        Owner格式: AddressUtils.isHexAddress(owner) ? 'hex' : AddressUtils.isBase58Address(owner) ? 'base58' : 'unknown',
        钱包格式: AddressUtils.isHexAddress(address) ? 'hex' : AddressUtils.isBase58Address(address) ? 'base58' : 'unknown',
        地址匹配: AddressUtils.isEqual(owner, address)
      })

      if (!owner) {
        console.warn('⚠️ 无法获取合约owner地址')
        return false
      }

      if (!address) {
        console.warn('⚠️ 当前钱包地址为空')
        return false
      }

      // 使用地址工具进行比较
      const isOwnerResult = AddressUtils.isEqual(owner, address)
      console.log(isOwnerResult ? '✅ 权限验证通过：您是合约所有者' : '❌ 权限验证失败：您不是合约所有者')

      return isOwnerResult
    } catch (error) {
      console.error('❌ 检查所有者权限失败:', error)
      return false
    }
  }

  // ==================== 代币解锁功能 ====================

  /**
   * 解锁代币 (用户调用)
   * @param {Object} options - 交易选项
   * @returns {Promise<Object>} 交易结果
   */
  async unlockTokens(options = {}) {
    try {
      console.log('🔓 开始解锁代币...')

      const txOptions = {
        feeLimit: 50000000, // 50 TRX
        ...options
      }

      const result = await this.sendTransaction('unlock', [], txOptions)

      console.log('✅ 代币解锁成功:', result)
      return result
    } catch (error) {
      console.error('❌ 代币解锁失败:', error)
      throw error
    }
  }

  /**
   * 获取用户可解锁的代币数量
   * @param {string} userAddress - 用户地址
   * @returns {Promise<Object>} 解锁信息
   */
  async getUserUnlockInfo(userAddress) {
    try {
      const userInfo = await this.callMethod('preSaleAddress', userAddress)

      return {
        hasUnlockAmount: userInfo.hasUnlockAmount || userInfo[2], // 可解锁数量
        stage: userInfo.stage || userInfo[3], // 当前解锁阶段
        preSaleCount: userInfo.preSaleCount || userInfo[1], // 预售购买数量
        verify: userInfo.verify || userInfo[4] // 验证状态
      }
    } catch (error) {
      console.error('❌ 获取用户解锁信息失败:', error)
      throw error
    }
  }

  /**
   * 获取解锁进度信息
   * @param {string} userAddress - 用户地址
   * @returns {Promise<Object>} 解锁进度
   */
  async getUnlockProgress(userAddress) {
    try {
      const [unlockInfo, stageUnlockRate, nowStage] = await this.batchCall([
        { method: 'preSaleAddress', params: [userAddress] },
        { method: 'stageUnlockRate' },
        { method: 'nowStage' }
      ])

      const hasUnlockAmount = unlockInfo.hasUnlockAmount || unlockInfo[2]
      const preSaleCount = unlockInfo.preSaleCount || unlockInfo[1]
      const userStage = unlockInfo.stage || unlockInfo[3]

      // 计算解锁进度
      const totalPurchased = parseInt(preSaleCount) || 0
      const alreadyUnlocked = parseInt(hasUnlockAmount) || 0
      const remainingToUnlock = totalPurchased - alreadyUnlocked

      // 计算当前阶段可解锁的数量
      const currentStageRate = parseInt(stageUnlockRate) || 0
      const currentStageUnlockable = Math.floor(totalPurchased * currentStageRate / 100)

      return {
        totalPurchased, // 总购买数量
        alreadyUnlocked, // 已解锁数量
        remainingToUnlock, // 剩余待解锁数量
        currentStageUnlockable, // 当前阶段可解锁数量
        unlockProgress: totalPurchased > 0 ? (alreadyUnlocked / totalPurchased * 100) : 0, // 解锁进度百分比
        currentStage: parseInt(nowStage) || 0, // 当前全局阶段
        userStage: parseInt(userStage) || 0, // 用户解锁阶段
        stageUnlockRate: currentStageRate // 阶段解锁率
      }
    } catch (error) {
      console.error('❌ 获取解锁进度失败:', error)
      throw error
    }
  }

  /**
   * 检查用户是否可以解锁
   * @param {string} userAddress - 用户地址
   * @returns {Promise<Object>} 解锁检查结果
   */
  async checkUnlockEligibility(userAddress) {
    try {
      const [presaleStatus, unlockProgress] = await Promise.all([
        this.getPresaleStatus(),
        this.getUnlockProgress(userAddress)
      ])

      const canUnlock = presaleStatus >= 2 && // 预售已结束
        unlockProgress.remainingToUnlock > 0 && // 还有代币可解锁
        unlockProgress.currentStageUnlockable > unlockProgress.alreadyUnlocked // 当前阶段有可解锁的代币

      return {
        canUnlock,
        reason: !canUnlock ? this.getUnlockBlockReason(presaleStatus, unlockProgress) : null,
        unlockProgress
      }
    } catch (error) {
      console.error('❌ 检查解锁资格失败:', error)
      throw error
    }
  }

  /**
   * 获取无法解锁的原因
   * @param {number} presaleStatus - 预售状态
   * @param {Object} unlockProgress - 解锁进度
   * @returns {string} 无法解锁的原因
   */
  getUnlockBlockReason(presaleStatus, unlockProgress) {
    if (presaleStatus < 2) {
      return '预售尚未结束'
    }
    if (unlockProgress.remainingToUnlock <= 0) {
      return '所有代币已解锁'
    }
    if (unlockProgress.currentStageUnlockable <= unlockProgress.alreadyUnlocked) {
      return '当前阶段暂无可解锁代币'
    }
    return '暂时无法解锁'
  }

  // ==================== 预售配置信息获取方法 ====================

  /**
   * 获取 LGE 配置信息
   * @returns {Promise<Object>} LGE 配置
   */
  async getLGEConfig() {
    try {
      console.log('🔍 获取 LGE 配置...')
      const result = await this.callMethod('getLGEConfig')

      return {
        vestingDelay: result.vestingDelay_ || result[0],
        vestingRate: result.vestingRate_ || result[1],
        vestingEnabled: result.vestingEnabled_ || result[2],
        backingShare: result.backingShare_ || result[3],
        backingReceiver: result.backingReceiver_ || result[4],
        startTime: result.startTime_ || result[5],
        hardcap: result.hardcap_ || result[6],
        maxBuyPerWallet: result.maxBuyPerWallet_ || result[7]
      }
    } catch (error) {
      console.error('❌ 获取 LGE 配置失败:', error)
      throw error
    }
  }

  /**
   * 获取 LP 分配配置信息
   * @returns {Promise<Object>} LP 分配配置
   */
  async getLPDistributionConfig() {
    try {
      console.log('🔍 获取 LP 分配配置...')
      const result = await this.callMethod('getLPDistributionConfig')

      return {
        userShare: result.userShare || result[0],
        devShare: result.devShare || result[1],
        devReceiver: result.devReceiver || result[2],
        enabled: result.enabled || result[3],
        shareBase: result.shareBase || result[4]
      }
    } catch (error) {
      console.error('❌ 获取 LP 分配配置失败:', error)
      throw error
    }
  }

  /**
   * 获取预售基础配置信息
   * @returns {Promise<Object>} 预售基础配置
   */
  async getPresaleConfig() {
    try {
      console.log('🔍 获取预售基础配置...')
      const r = await this.callMethod('getPoolData')
      const arr = Array.isArray(r) ? r : [r.presaleEthAmount_, r.tradeEthAmount_, r.maxTotalNum_, r.presaleMaxNum_, r.coinAmount_, r.stageUnlockRate_]
      return {
        preSaleEthAmount: arr[0],
        preSaleMaxNum: arr[3],
        totalNumber: arr[2],
        coinAmount: arr[4],
        stageUnlockRate: arr[5],
        tradeEthAmount: arr[1]
      }
    } catch (error) {
      console.error('❌ 获取预售基础配置失败:', error)
      throw error
    }
  }
  async getPresaleUnit() {
  return await this.callMethod('getPresaleUnit')
}
async getPresaleConfig() {
  const r = await this.callMethod('getPoolData')
  const a = Array.isArray(r) ? r : [r[0],r[1],r[2],r[3],r[4],r[5]]
  return {
    preSaleEthAmount: a[0],
    tradeEthAmount:  a[1],
    maxTotalNum:     a[2],
    preSaleMaxNum:   a[3],
    coinAmount:      a[4],
    stageUnlockRate: a[5],
  }
}
  /**
   * 获取交易配置信息
   * @returns {Promise<Object>} 交易配置
   */
  async getTradeConfig() {
    try {
      console.log('🔍 获取交易配置...')
      const result = await this.callMethod('trade')

      return {
        tradeEthAmount: result.tradeEthAmount || result[0],
        tradeMaxNum: result.tradeMaxNum || result[1],
        totalNumber: result.totalNumber || result[2]
      }
    } catch (error) {
      console.error('❌ 获取交易配置失败:', error)
      throw error
    }
  }

  /**
   * 获取完整的预售配置信息（并行获取所有配置）
   * @returns {Promise<Object>} 完整配置信息
   */
  async getFullPresaleConfig() {
    try {
      console.log('🔍 获取完整预售配置...')

      const [lgeConfig, lpConfig, presaleConfig, tradeConfig] = await Promise.all([
        this.getLGEConfig().catch(err => {
          console.warn('⚠️ LGE 配置获取失败:', err)
          return null
        }),
        this.getLPDistributionConfig().catch(err => {
          console.warn('⚠️ LP 配置获取失败:', err)
          return null
        }),
        this.getPresaleConfig().catch(err => {
          console.warn('⚠️ 预售配置获取失败:', err)
          return null
        }),
        this.getTradeConfig().catch(err => {
          console.warn('⚠️ 交易配置获取失败:', err)
          return null
        })
      ])

      console.log('📊 完整配置获取结果:', {
        hasLGE: !!lgeConfig,
        hasLP: !!lpConfig,
        hasPresale: !!presaleConfig,
        hasTrade: !!tradeConfig
      })

      return {
        lgeConfig,
        lpConfig,
        presaleConfig,
        tradeConfig
      }
    } catch (error) {
      console.error('❌ 获取完整预售配置失败:', error)
      throw error
    }
  }
}

export default PresaleService
