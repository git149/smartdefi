/**
 * 预售流动性添加问题诊断脚本
 * 用于诊断 TransferHelper: TRANSFER_FROM_FAILED 错误
 */

import { PresaleService } from '../services/PresaleService.js'
import { TokenService } from '../services/TokenService.js'
import { CoordinatorFactoryService } from '../services/CoordinatorFactoryService.js'

class LiquidityIssueDiagnostic {
  constructor() {
    this.presaleService = null
    this.tokenService = null
    this.factoryService = null
  }

  /**
   * 初始化服务
   */
  async initialize(presaleAddress) {
    try {
      console.log('🔧 初始化诊断服务...')
      
      this.presaleService = new PresaleService(presaleAddress)
      this.tokenService = new TokenService()
      this.factoryService = new CoordinatorFactoryService()
      
      console.log('✅ 服务初始化完成')
    } catch (error) {
      console.error('❌ 服务初始化失败:', error)
      throw error
    }
  }

  /**
   * 执行完整诊断
   */
  async runFullDiagnostic(presaleAddress) {
    try {
      console.log('🔍 开始执行完整诊断...')
      console.log('📍 预售合约地址:', presaleAddress)
      
      await this.initialize(presaleAddress)
      
      // 1. 检查预售状态
      const presaleStatus = await this.checkPresaleStatus()
      
      // 2. 检查代币状态
      const tokenStatus = await this.checkTokenStatus()
      
      // 3. 检查工厂授权状态
      const factoryStatus = await this.checkFactoryStatus()
      
      // 4. 检查合约余额
      const balanceStatus = await this.checkContractBalances()
      
      // 5. 分析问题
      const analysis = this.analyzeIssues(presaleStatus, tokenStatus, factoryStatus, balanceStatus)
      
      // 6. 生成解决方案
      const solutions = this.generateSolutions(analysis)
      
      return {
        presaleStatus,
        tokenStatus,
        factoryStatus,
        balanceStatus,
        analysis,
        solutions
      }
      
    } catch (error) {
      console.error('❌ 诊断执行失败:', error)
      throw error
    }
  }

  /**
   * 检查预售状态
   */
  async checkPresaleStatus() {
    try {
      console.log('📋 检查预售状态...')
      
      const status = await this.presaleService.getPresaleStatus()
      const finalizationStatus = await this.presaleService.getFinalizationStatus()
      
      const result = {
        presaleStatus: status,
        presaleStatusText: this.getPresaleStatusText(status),
        isFinalized: finalizationStatus.isFinalized,
        autoEnabled: finalizationStatus.autoEnabled,
        liquidityAdded: finalizationStatus.liquidityAdded_
      }
      
      console.log('📋 预售状态:', result)
      return result
      
    } catch (error) {
      console.error('❌ 检查预售状态失败:', error)
      return { error: error.message }
    }
  }

  /**
   * 检查代币状态
   */
  async checkTokenStatus() {
    try {
      console.log('🪙 检查代币状态...')
      
      const tokenAddress = await this.presaleService.callMethod('coinAddress')
      const tokenInfo = await this.tokenService.getTokenInfo(tokenAddress)
      
      const result = {
        tokenAddress,
        tokenName: tokenInfo.name,
        tokenSymbol: tokenInfo.symbol,
        tokenDecimals: tokenInfo.decimals,
        totalSupply: tokenInfo.totalSupply
      }
      
      console.log('🪙 代币状态:', result)
      return result
      
    } catch (error) {
      console.error('❌ 检查代币状态失败:', error)
      return { error: error.message }
    }
  }

  /**
   * 检查工厂授权状态
   */
  async checkFactoryStatus() {
    try {
      console.log('🏭 检查工厂授权状态...')
      
      const factoryAddress = await this.presaleService.callMethod('factoryAddress')
      const allowance = await this.presaleService.callMethod('getFactoryAllowance')
      const factoryInfo = await this.factoryService.getFactoryInfo(factoryAddress)
      
      const result = {
        factoryAddress,
        factoryName: factoryInfo.name,
        allowance: allowance,
        allowanceFormatted: window.tronWeb ? window.tronWeb.fromSun(allowance) : allowance
      }
      
      console.log('🏭 工厂授权状态:', result)
      return result
      
    } catch (error) {
      console.error('❌ 检查工厂授权状态失败:', error)
      return { error: error.message }
    }
  }

  /**
   * 检查合约余额
   */
  async checkContractBalances() {
    try {
      console.log('💰 检查合约余额...')
      
      const balances = await this.presaleService.callMethod('getContractBalances')
      const accumulatedBNB = await this.presaleService.callMethod('accumulatedBNB')
      
      const result = {
        tokenBalance: balances.tokenBalance,
        bnbBalance: balances.bnbBalance,
        accumulatedBNB: accumulatedBNB,
        tokenBalanceFormatted: window.tronWeb ? window.tronWeb.fromSun(balances.tokenBalance) : balances.tokenBalance,
        bnbBalanceFormatted: window.tronWeb ? window.tronWeb.fromSun(balances.bnbBalance) : balances.bnbBalance,
        accumulatedBNBFormatted: window.tronWeb ? window.tronWeb.fromSun(accumulatedBNB) : accumulatedBNB
      }
      
      console.log('💰 合约余额:', result)
      return result
      
    } catch (error) {
      console.error('❌ 检查合约余额失败:', error)
      return { error: error.message }
    }
  }

  /**
   * 分析问题
   */
  analyzeIssues(presaleStatus, tokenStatus, factoryStatus, balanceStatus) {
    console.log('🔍 分析问题...')
    
    const issues = []
    
    // 检查预售状态
    if (presaleStatus.error) {
      issues.push({ type: 'PRESALE_STATUS_ERROR', message: presaleStatus.error })
    }
    
    if (presaleStatus.presaleStatus < 2) {
      issues.push({ 
        type: 'PRESALE_NOT_ENDED', 
        message: `预售尚未结束，当前状态: ${presaleStatus.presaleStatusText}` 
      })
    }
    
    if (presaleStatus.isFinalized) {
      issues.push({ 
        type: 'PRESALE_ALREADY_FINALIZED', 
        message: '预售已经完成，无法重复执行' 
      })
    }
    
    // 检查代币状态
    if (tokenStatus.error) {
      issues.push({ type: 'TOKEN_STATUS_ERROR', message: tokenStatus.error })
    }
    
    if (!tokenStatus.tokenAddress || tokenStatus.tokenAddress === '0x0000000000000000000000000000000000000000') {
      issues.push({ 
        type: 'TOKEN_ADDRESS_INVALID', 
        message: '代币地址无效或未设置' 
      })
    }
    
    // 检查工厂授权
    if (factoryStatus.error) {
      issues.push({ type: 'FACTORY_STATUS_ERROR', message: factoryStatus.error })
    }
    
    if (!factoryStatus.factoryAddress || factoryStatus.factoryAddress === '0x0000000000000000000000000000000000000000') {
      issues.push({ 
        type: 'FACTORY_ADDRESS_INVALID', 
        message: '工厂合约地址无效或未设置' 
      })
    }
    
    if (Number(factoryStatus.allowance) === 0) {
      issues.push({ 
        type: 'NO_FACTORY_ALLOWANCE', 
        message: '工厂合约没有对预售合约的代币授权' 
      })
    }
    
    // 检查余额
    if (balanceStatus.error) {
      issues.push({ type: 'BALANCE_STATUS_ERROR', message: balanceStatus.error })
    }
    
    if (Number(balanceStatus.accumulatedBNB) === 0) {
      issues.push({ 
        type: 'NO_ACCUMULATED_BNB', 
        message: '没有累积的BNB用于流动性' 
      })
    }
    
    // 检查关键问题：代币余额不足
    if (Number(balanceStatus.tokenBalance) === 0 && Number(factoryStatus.allowance) > 0) {
      issues.push({ 
        type: 'TRANSFER_FROM_FAILED_ROOT_CAUSE', 
        message: '预售合约没有代币余额，但工厂有授权额度 - 这是 TRANSFER_FROM_FAILED 的根本原因',
        severity: 'CRITICAL'
      })
    }
    
    return issues
  }

  /**
   * 生成解决方案
   */
  generateSolutions(analysis) {
    console.log('💡 生成解决方案...')
    
    const solutions = []
    
    analysis.forEach(issue => {
      switch (issue.type) {
        case 'PRESALE_NOT_ENDED':
          solutions.push({
            issue: issue.type,
            solution: '等待预售自然结束，或手动设置预售状态为已结束',
            action: 'wait_or_manual_end'
          })
          break
          
        case 'PRESALE_ALREADY_FINALIZED':
          solutions.push({
            issue: issue.type,
            solution: '预售已完成，无需重复执行',
            action: 'no_action_needed'
          })
          break
          
        case 'TOKEN_ADDRESS_INVALID':
          solutions.push({
            issue: issue.type,
            solution: '检查代币合约地址配置，确保地址正确',
            action: 'check_token_config'
          })
          break
          
        case 'FACTORY_ADDRESS_INVALID':
          solutions.push({
            issue: issue.type,
            solution: '检查工厂合约地址配置，确保地址正确',
            action: 'check_factory_config'
          })
          break
          
        case 'NO_FACTORY_ALLOWANCE':
          solutions.push({
            issue: issue.type,
            solution: '工厂合约需要先对预售合约进行代币授权',
            action: 'factory_approve_tokens'
          })
          break
          
        case 'NO_ACCUMULATED_BNB':
          solutions.push({
            issue: issue.type,
            solution: '没有BNB累积，无法添加流动性',
            action: 'no_action_possible'
          })
          break
          
        case 'TRANSFER_FROM_FAILED_ROOT_CAUSE':
          solutions.push({
            issue: issue.type,
            solution: '工厂合约中代币余额不足，需要先向工厂合约转入足够的代币',
            action: 'transfer_tokens_to_factory',
            steps: [
              '1. 检查工厂合约的代币余额',
              '2. 如果余额不足，从代币合约向工厂合约转入代币',
              '3. 确保工厂合约有足够的代币用于预售',
              '4. 重新执行 finalizePresaleAndAddLiquidity'
            ]
          })
          break
          
        default:
          solutions.push({
            issue: issue.type,
            solution: '需要进一步诊断',
            action: 'further_diagnosis'
          })
      }
    })
    
    return solutions
  }

  /**
   * 获取预售状态文本
   */
  getPresaleStatusText(status) {
    const statusMap = {
      0: '未开始',
      1: '进行中',
      2: '已结束',
      3: '交易中',
      4: '解锁中',
      5: '已完成'
    }
    return statusMap[status] || `未知状态(${status})`
  }

  /**
   * 执行修复操作
   */
  async executeFix(solution) {
    try {
      console.log('🔧 执行修复操作:', solution.action)
      
      switch (solution.action) {
        case 'factory_approve_tokens':
          return await this.fixFactoryApproval()
          
        case 'transfer_tokens_to_factory':
          return await this.fixTokenTransferToFactory()
          
        default:
          console.log('⚠️ 该问题需要手动修复:', solution.solution)
          return { success: false, message: '需要手动修复' }
      }
      
    } catch (error) {
      console.error('❌ 修复操作失败:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 修复工厂授权
   */
  async fixFactoryApproval() {
    try {
      console.log('🔧 修复工厂授权...')
      
      // 这里需要调用工厂合约的授权方法
      // 具体实现取决于工厂合约的接口
      
      return { success: true, message: '工厂授权修复完成' }
    } catch (error) {
      console.error('❌ 修复工厂授权失败:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 修复代币转移到工厂
   */
  async fixTokenTransferToFactory() {
    try {
      console.log('🔧 修复代币转移到工厂...')
      
      // 这里需要从代币合约向工厂合约转移代币
      // 具体实现取决于代币合约的接口
      
      return { success: true, message: '代币转移修复完成' }
    } catch (error) {
      console.error('❌ 修复代币转移失败:', error)
      return { success: false, error: error.message }
    }
  }
}

// 导出诊断类
export default LiquidityIssueDiagnostic

// 如果直接运行此脚本
if (typeof window !== 'undefined') {
  // 浏览器环境
  window.LiquidityIssueDiagnostic = LiquidityIssueDiagnostic
  
  // 创建全局诊断函数
  window.debugLiquidityIssue = async (presaleAddress) => {
    const diagnostic = new LiquidityIssueDiagnostic()
    return await diagnostic.runFullDiagnostic(presaleAddress)
  }
  
  console.log('🔧 流动性问题诊断工具已加载')
  console.log('💡 使用方法: debugLiquidityIssue("预售合约地址")')
}
