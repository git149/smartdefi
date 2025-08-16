/**
 * 合约服务基类
 * 提供通用的合约操作方法
 */

import TronWebService from './TronWebService'
import { 
  DEFAULT_TRANSACTION_PARAMS, 
  ERROR_CODES, 
  getErrorMessage 
} from '../config'

class BaseContractService {
  constructor(contractAddress, contractABI, contractType) {
    this.contractAddress = contractAddress
    this.contractABI = contractABI
    this.contractType = contractType
    this.contract = null
    this.tronWebService = TronWebService

    // 添加调试信息
    console.log('🔍 BaseContractService constructor:', {
      contractType,
      contractAddress,
      addressType: typeof contractAddress,
      addressLength: contractAddress ? contractAddress.length : 0
    })

    // 验证合约地址不为空
    if (!contractAddress || contractAddress.trim() === '') {
      throw new Error(`合约地址不能为空 (${contractType})`)
    }
  }

  /**
   * 初始化合约实例
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // 确保TronWeb已初始化
      if (!this.tronWebService.tronWeb) {
        await this.tronWebService.initialize()
      }

      // 验证合约地址
      if (!this.tronWebService.isValidAddress(this.contractAddress)) {
        throw new Error(`无效的合约地址: ${this.contractAddress}`)
      }

      // 创建合约实例
      if (this.tronWebService.tronWeb) {
        // 如果TronWeb可用，使用TronWeb创建合约实例
        this.contract = await this.tronWebService.tronWeb.contract(
          this.contractABI,
          this.contractAddress
        )
        console.log(`✅ ${this.contractType}合约初始化成功:`, this.contractAddress)
      } else {
        // 如果TronWeb不可用，创建一个模拟的合约对象用于只读调用
        console.warn(`⚠️ TronWeb不可用，创建模拟合约实例用于只读调用`)
        this.contract = this.createMockContract()
        console.log(`⚠️ ${this.contractType}模拟合约初始化:`, this.contractAddress)
      }

    } catch (error) {
      console.error(`❌ ${this.contractType}合约初始化失败:`, error)
      throw error
    }
  }

  /**
   * 创建模拟合约对象（用于TronWeb不可用时的只读调用）
   * @returns {Object} 模拟合约对象
   */
  createMockContract() {
    const mockContract = {}

    // 为每个ABI方法创建模拟函数
    this.contractABI.forEach(item => {
      if (item.type === 'function') {
        mockContract[item.name] = (...params) => ({
          call: async () => {
            throw new Error(`TronWeb不可用，无法调用合约方法 ${item.name}`)
          }
        })
      }
    })

    return mockContract
  }

  /**
   * 确保合约已初始化
   * @returns {Promise<void>}
   */
  async ensureInitialized() {
    if (!this.contract) {
      await this.initialize()
    }
  }

  /**
   * 调用合约只读方法
   * @param {string} methodName - 方法名
   * @param {Array} params - 参数数组
   * @param {Object} options - 调用选项
   * @returns {Promise<any>} 调用结果
   */
  async callMethod(methodName, params = [], options = {}) {
    try {
      await this.ensureInitialized()
      
      console.log(`📞 调用${this.contractType}合约方法:`, methodName, params)

      const method = this.contract[methodName]
      if (!method) {
        throw new Error(`方法 ${methodName} 不存在`)
      }

      // 合并默认选项
      const callOptions = {
        ...DEFAULT_TRANSACTION_PARAMS.VIEW_CALL,
        ...options
      }

      // 设置调用者地址（如果TronWeb已连接）
      if (this.tronWebService.isConnected && this.tronWebService.currentAccount) {
        callOptions.from = this.tronWebService.currentAccount
      } else if (this.tronWebService.tronWeb?.defaultAddress?.base58) {
        callOptions.from = this.tronWebService.tronWeb.defaultAddress.base58
      }

      // 对于只读调用，移除交易相关参数
      delete callOptions.callValue
      delete callOptions.feeLimit

      console.log(`🔧 调用选项:`, callOptions)
      console.log(`🔗 合约地址:`, this.contractAddress)
      console.log(`🌐 TronWeb状态:`, {
        available: !!this.tronWebService.tronWeb,
        connected: this.tronWebService.isConnected,
        defaultAddress: this.tronWebService.tronWeb?.defaultAddress?.base58
      })

      let result
      if (params.length === 0) {
        result = await method().call(callOptions)
      } else {
        result = await method(...params).call(callOptions)
      }

      console.log(`✅ ${methodName} 调用成功:`, result)
      return result

    } catch (error) {
      console.error(`❌ ${methodName} 调用失败:`, error)
      console.error(`❌ 错误详情:`, {
        message: error.message,
        code: error.code,
        data: error.data
      })
      throw this.handleError(error, methodName)
    }
  }

  /**
   * 发送合约交易
   * @param {string} methodName - 方法名
   * @param {Array} params - 参数数组
   * @param {Object} options - 交易选项
   * @returns {Promise<string>} 交易哈希
   */
  async sendTransaction(methodName, params = [], options = {}) {
    const maxRetries = options.maxRetries || 3
    const retryDelay = options.retryDelay || 5000

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.ensureInitialized()

        // 检查钱包连接
        if (!this.tronWebService.isConnected) {
          await this.tronWebService.connectWallet()
        }

        console.log(`📤 发送${this.contractType}合约交易 (尝试 ${attempt}/${maxRetries}):`, methodName, params)

        const method = this.contract[methodName]
        if (!method) {
          throw new Error(`方法 ${methodName} 不存在`)
        }

        // 合并默认交易参数
        const txOptions = {
          ...this.getDefaultTxParams(methodName),
          ...options
        }

        let result
        if (params.length === 0) {
          result = await method().send(txOptions)
        } else {
          result = await method(...params).send(txOptions)
        }

        console.log(`✅ ${methodName} 交易发送成功 (尝试 ${attempt}):`, result)

        // 如果需要等待确认
        if (txOptions.shouldPollResponse) {
          console.log('⏳ 等待交易确认...')
          const txResult = await this.tronWebService.waitForTransaction(result, txOptions.timeout)
          console.log('📄 交易确认完成:', txResult)
          return { txHash: result, txResult }
        }

        return { txHash: result }

      } catch (error) {
        console.error(`❌ ${methodName} 交易失败 (尝试 ${attempt}/${maxRetries}):`, error)

        // 检查是否是可重试的错误
        const isRetryableError = this.isRetryableError(error)

        if (attempt === maxRetries || !isRetryableError) {
          throw this.handleError(error, methodName)
        }

        console.log(`⏳ ${retryDelay/1000}秒后重试...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }

  /**
   * 判断错误是否可重试
   * @param {Error} error - 错误对象
   * @returns {boolean} 是否可重试
   */
  isRetryableError(error) {
    const retryableMessages = [
      'transaction expired',
      'network error',
      'timeout',
      'connection failed',
      'server error'
    ]

    const errorMessage = error.message.toLowerCase()
    return retryableMessages.some(msg => errorMessage.includes(msg))
  }

  /**
   * 获取默认交易参数
   * @param {string} methodName - 方法名
   * @returns {Object} 默认参数
   */
  getDefaultTxParams(methodName) {
    // 子类可以重写此方法来提供特定的默认参数
    return DEFAULT_TRANSACTION_PARAMS.VIEW_CALL
  }

  /**
   * 批量调用只读方法
   * @param {Array} calls - 调用配置数组 [{method, params}, ...]
   * @returns {Promise<Array>} 结果数组
   */
  async batchCall(calls) {
    try {
      const promises = calls.map(call => 
        this.callMethod(call.method, call.params || [], call.options || {})
      )
      
      return await Promise.all(promises)
    } catch (error) {
      console.error('❌ 批量调用失败:', error)
      throw error
    }
  }

  /**
   * 获取合约事件
   * @param {string} eventName - 事件名
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 事件数组
   */
  async getEvents(eventName, options = {}) {
    try {
      await this.ensureInitialized()

      const defaultOptions = {
        size: 20,
        page: 1,
        ...options
      }

      const events = await this.tronWebService.tronWeb.getEventResult(
        this.contractAddress,
        {
          eventName,
          ...defaultOptions
        }
      )

      console.log(`📋 获取${eventName}事件:`, events)
      return events || []

    } catch (error) {
      console.error(`❌ 获取${eventName}事件失败:`, error)
      throw error
    }
  }

  /**
   * 错误处理
   * @param {Error} error - 原始错误
   * @param {string} methodName - 方法名
   * @returns {Error} 处理后的错误
   */
  handleError(error, methodName) {
    let errorCode = ERROR_CODES.TRANSACTION_FAILED
    let errorMessage = error.message

    // 详细记录错误信息用于调试
    console.error(`🔍 ${methodName} 详细错误信息:`, {
      message: error.message,
      code: error.code,
      data: error.data,
      stack: error.stack,
      originalError: error
    })

    // 根据错误类型进行分类
    if (errorMessage.includes('insufficient balance')) {
      errorCode = ERROR_CODES.INSUFFICIENT_BALANCE
    } else if (errorMessage.includes('invalid address')) {
      errorCode = ERROR_CODES.INVALID_ADDRESS
    } else if (errorMessage.includes('network')) {
      errorCode = ERROR_CODES.NETWORK_ERROR
    } else if (errorMessage.includes('REVERT opcode executed')) {
      // 特殊处理REVERT错误
      console.error(`🚨 合约执行REVERT - 可能的原因:`)
      console.error(`   1. 参数验证失败（数值范围、地址格式等）`)
      console.error(`   2. 合约状态不满足执行条件（如factoryEnabled=false）`)
      console.error(`   3. 余额不足支付创建费用`)
      console.error(`   4. 权限检查失败`)
      console.error(`   5. 合约内部逻辑验证失败`)

      // 尝试提取更具体的错误信息
      if (error.data) {
        console.error(`   错误数据:`, error.data)
      }

      errorMessage = `合约执行失败: ${errorMessage}`
    }

    const enhancedError = new Error(`${methodName}: ${getErrorMessage(errorCode)} - ${errorMessage}`)
    enhancedError.code = errorCode
    enhancedError.originalError = error
    enhancedError.methodName = methodName
    enhancedError.contractType = this.contractType

    return enhancedError
  }

  /**
   * 获取合约信息
   * @returns {Object} 合约信息
   */
  getContractInfo() {
    return {
      address: this.contractAddress,
      type: this.contractType,
      isInitialized: !!this.contract,
      abi: this.contractABI
    }
  }

  /**
   * 设置新的合约地址
   * @param {string} newAddress - 新地址
   */
  async setContractAddress(newAddress) {
    if (!this.tronWebService.isValidAddress(newAddress)) {
      throw new Error(`无效的合约地址: ${newAddress}`)
    }

    this.contractAddress = newAddress
    this.contract = null // 重置合约实例，下次调用时重新初始化
    
    console.log(`📍 ${this.contractType}合约地址已更新:`, newAddress)
  }
}

export default BaseContractService
