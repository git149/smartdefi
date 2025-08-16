/**
 * Token合约服务类
 * 负责代币相关的所有操作
 */

import BaseContractService from './BaseContractService'
import { getContractABI } from '../contracts/abis'
import { DEFAULT_TRANSACTION_PARAMS } from '../config'

class TokenService extends BaseContractService {
  constructor(tokenAddress = null) {
    const abi = getContractABI('TOKEN')
    super(tokenAddress, abi, 'Token')
  }

  /**
   * 获取默认交易参数
   * @param {string} methodName - 方法名
   * @returns {Object} 默认参数
   */
  getDefaultTxParams(methodName) {
    switch (methodName) {
      case 'transfer':
      case 'transferFrom':
      case 'approve':
        return DEFAULT_TRANSACTION_PARAMS.TOKEN_TRANSFER
      default:
        return DEFAULT_TRANSACTION_PARAMS.VIEW_CALL
    }
  }

  /**
   * 获取代币基本信息
   * @returns {Promise<Object>} 代币基本信息
   */
  async getTokenInfo() {
    try {
      const [name, symbol, totalSupply, decimals] = await this.batchCall([
        { method: 'name' },
        { method: 'symbol' },
        { method: 'totalSupply' },
        { method: 'decimals' }
      ])

      return {
        name,
        symbol,
        totalSupply,
        decimals,
        address: this.contractAddress
      }
    } catch (error) {
      console.error('❌ 获取代币信息失败:', error)
      throw error
    }
  }

  /**
   * 获取代币名称
   * @returns {Promise<string>} 代币名称
   */
  async getName() {
    return await this.callMethod('name')
  }

  /**
   * 获取代币符号
   * @returns {Promise<string>} 代币符号
   */
  async getSymbol() {
    return await this.callMethod('symbol')
  }

  /**
   * 获取总供应量
   * @returns {Promise<string>} 总供应量
   */
  async getTotalSupply() {
    return await this.callMethod('totalSupply')
  }

  /**
   * 获取小数位数
   * @returns {Promise<number>} 小数位数
   */
  async getDecimals() {
    return await this.callMethod('decimals')
  }

  /**
   * 获取账户余额
   * @param {string} account - 账户地址
   * @returns {Promise<string>} 账户余额
   */
  async getBalance(account) {
    return await this.callMethod('balanceOf', [account])
  }

  /**
   * 获取授权额度
   * @param {string} owner - 所有者地址
   * @param {string} spender - 支出者地址
   * @returns {Promise<string>} 授权额度
   */
  async getAllowance(owner, spender) {
    return await this.callMethod('allowance', [owner, spender])
  }

  /**
   * 转账
   * @param {string} to - 接收者地址
   * @param {string} amount - 转账金额
   * @returns {Promise<Object>} 交易结果
   */
  async transfer(to, amount) {
    try {
      console.log('💸 转账:', { to, amount })
      
      // 验证地址
      if (!this.tronWebService.isValidAddress(to)) {
        throw new Error('无效的接收者地址')
      }

      return await this.sendTransaction('transfer', [to, amount])
    } catch (error) {
      console.error('❌ 转账失败:', error)
      throw error
    }
  }

  /**
   * 授权转账
   * @param {string} from - 发送者地址
   * @param {string} to - 接收者地址
   * @param {string} amount - 转账金额
   * @returns {Promise<Object>} 交易结果
   */
  async transferFrom(from, to, amount) {
    try {
      console.log('🔄 授权转账:', { from, to, amount })
      
      // 验证地址
      if (!this.tronWebService.isValidAddress(from) || !this.tronWebService.isValidAddress(to)) {
        throw new Error('无效的地址')
      }

      return await this.sendTransaction('transferFrom', [from, to, amount])
    } catch (error) {
      console.error('❌ 授权转账失败:', error)
      throw error
    }
  }

  /**
   * 授权
   * @param {string} spender - 支出者地址
   * @param {string} amount - 授权金额
   * @returns {Promise<Object>} 交易结果
   */
  async approve(spender, amount) {
    try {
      console.log('✅ 授权:', { spender, amount })
      
      // 验证地址
      if (!this.tronWebService.isValidAddress(spender)) {
        throw new Error('无效的支出者地址')
      }

      return await this.sendTransaction('approve', [spender, amount])
    } catch (error) {
      console.error('❌ 授权失败:', error)
      throw error
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
   * 检查交易是否启用
   * @returns {Promise<boolean>} 交易是否启用
   */
  async isTradingEnabled() {
    return await this.callMethod('tradingEnabled')
  }

  /**
   * 启用交易 (仅所有者)
   * @returns {Promise<Object>} 交易结果
   */
  async enableTrading() {
    try {
      console.log('🚀 启用交易...')
      
      return await this.sendTransaction('enableTrading')
    } catch (error) {
      console.error('❌ 启用交易失败:', error)
      throw error
    }
  }

  /**
   * 设置预售合约地址 (仅所有者)
   * @param {string} presaleContract - 预售合约地址
   * @returns {Promise<Object>} 交易结果
   */
  async setPresaleContract(presaleContract) {
    try {
      console.log('⚙️ 设置预售合约地址:', presaleContract)
      
      // 验证地址
      if (!this.tronWebService.isValidAddress(presaleContract)) {
        throw new Error('无效的预售合约地址')
      }

      return await this.sendTransaction('setPresaleContract', [presaleContract])
    } catch (error) {
      console.error('❌ 设置预售合约地址失败:', error)
      throw error
    }
  }

  /**
   * 设置交易对地址 (仅所有者)
   * @param {string} pairAddress - 交易对地址
   * @returns {Promise<Object>} 交易结果
   */
  async setPairAddress(pairAddress) {
    try {
      console.log('⚙️ 设置交易对地址:', pairAddress)
      
      // 验证地址
      if (!this.tronWebService.isValidAddress(pairAddress)) {
        throw new Error('无效的交易对地址')
      }

      return await this.sendTransaction('setPairAddress', [pairAddress])
    } catch (error) {
      console.error('❌ 设置交易对地址失败:', error)
      throw error
    }
  }

  /**
   * 获取用户代币信息
   * @param {string} userAddress - 用户地址
   * @returns {Promise<Object>} 用户代币信息
   */
  async getUserTokenInfo(userAddress) {
    try {
      const [tokenInfo, balance] = await Promise.all([
        this.getTokenInfo(),
        this.getBalance(userAddress)
      ])

      return {
        ...tokenInfo,
        userBalance: balance,
        userAddress
      }
    } catch (error) {
      console.error('❌ 获取用户代币信息失败:', error)
      throw error
    }
  }

  /**
   * 获取代币完整状态
   * @returns {Promise<Object>} 代币完整状态
   */
  async getTokenFullStatus() {
    try {
      const [
        tokenInfo,
        owner,
        tradingEnabled
      ] = await Promise.all([
        this.getTokenInfo(),
        this.getOwner(),
        this.isTradingEnabled()
      ])

      return {
        ...tokenInfo,
        owner,
        tradingEnabled
      }
    } catch (error) {
      console.error('❌ 获取代币完整状态失败:', error)
      throw error
    }
  }

  /**
   * 检查用户是否有足够余额
   * @param {string} userAddress - 用户地址
   * @param {string} amount - 需要的金额
   * @returns {Promise<boolean>} 是否有足够余额
   */
  async hasEnoughBalance(userAddress, amount) {
    try {
      const balance = await this.getBalance(userAddress)
      return BigInt(balance) >= BigInt(amount)
    } catch (error) {
      console.error('❌ 检查余额失败:', error)
      return false
    }
  }

  /**
   * 检查授权是否足够
   * @param {string} owner - 所有者地址
   * @param {string} spender - 支出者地址
   * @param {string} amount - 需要的金额
   * @returns {Promise<boolean>} 授权是否足够
   */
  async hasEnoughAllowance(owner, spender, amount) {
    try {
      const allowance = await this.getAllowance(owner, spender)
      return BigInt(allowance) >= BigInt(amount)
    } catch (error) {
      console.error('❌ 检查授权失败:', error)
      return false
    }
  }

  /**
   * 格式化代币金额
   * @param {string} amount - 原始金额
   * @param {number} decimals - 小数位数
   * @returns {string} 格式化后的金额
   */
  static formatTokenAmount(amount, decimals = 18) {
    const divisor = BigInt(10) ** BigInt(decimals)
    const quotient = BigInt(amount) / divisor
    const remainder = BigInt(amount) % divisor
    
    if (remainder === BigInt(0)) {
      return quotient.toString()
    }
    
    const remainderStr = remainder.toString().padStart(decimals, '0')
    const trimmedRemainder = remainderStr.replace(/0+$/, '')
    
    return trimmedRemainder ? `${quotient}.${trimmedRemainder}` : quotient.toString()
  }

  /**
   * 解析代币金额
   * @param {string} amount - 格式化的金额
   * @param {number} decimals - 小数位数
   * @returns {string} 原始金额
   */
  static parseTokenAmount(amount, decimals = 18) {
    const [integer, decimal = ''] = amount.split('.')
    const paddedDecimal = decimal.padEnd(decimals, '0').slice(0, decimals)
    return (BigInt(integer) * (BigInt(10) ** BigInt(decimals)) + BigInt(paddedDecimal)).toString()
  }
}

export default TokenService
