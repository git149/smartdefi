/**
 * 代币购买功能组合式函数
 * 集成现有的预售购买逻辑
 */

import { ref, computed } from 'vue'
import { Toast } from 'vant'
import PresaleService from '@/tron/services/PresaleService'
import TronServiceManager from '@/tron/services'
import { smartFormatAddress, formatAddressDisplay } from '@/utils/addressFormatter'

export function useTokenPurchase() {
  // 状态管理
  const isProcessing = ref(false)
  const transactionHash = ref('')
  const error = ref(null)
  const walletBalance = ref(0)
  const walletAddress = ref('')
  const isConnected = ref(false)

  // 计算属性
  const canPurchase = computed(() => {
    return isConnected.value && !isProcessing.value && walletBalance.value > 0
  })

  /**
   * 初始化钱包连接
   */
  const initializeWallet = async () => {
    try {
      console.log('🔗 初始化钱包连接...')
      
      // 确保TRON服务已初始化
      await TronServiceManager.ensureInitialized()
      
      // 检查TronWeb连接状态
      const connectionStatus = TronServiceManager.getConnectionStatus()
      
      if (connectionStatus.isConnected) {
        // 确保钱包地址是Base58格式
        walletAddress.value = smartFormatAddress(connectionStatus.currentAccount)
        isConnected.value = true
        
        // 获取余额
        await updateWalletBalance()
        
        console.log('✅ 钱包已连接:', walletAddress.value)
      } else {
        console.log('⚠️ 钱包未连接')
        isConnected.value = false
      }
      
    } catch (error) {
      console.error('❌ 初始化钱包失败:', error)
      error.value = error.message
    }
  }

  /**
   * 连接钱包
   */
  const connectWallet = async () => {
    try {
      console.log('🔗 连接钱包...')
      
      const tronWeb = TronServiceManager.tronWeb
      const account = await tronWeb.connectWallet()

      // 确保钱包地址是Base58格式
      walletAddress.value = smartFormatAddress(account)
      isConnected.value = true
      
      // 获取余额
      await updateWalletBalance()
      
      Toast('钱包连接成功')
      console.log('✅ 钱包连接成功:', account)
      
    } catch (error) {
      console.error('❌ 连接钱包失败:', error)
      error.value = error.message
      Toast('连接钱包失败: ' + error.message)
    }
  }

  /**
   * 更新钱包余额
   */
  const updateWalletBalance = async () => {
    try {
      if (!isConnected.value || !walletAddress.value) return

      const tronWeb = TronServiceManager.tronWeb
      const balanceResult = await tronWeb.getBalance(walletAddress.value)

      // TronWebService.getBalance返回对象 {sun, trx, formatted}
      const trxBalance = balanceResult.trx || 0
      walletBalance.value = parseFloat(trxBalance).toFixed(4)

      console.log('💰 钱包余额更新:', walletBalance.value, 'TRX')

    } catch (error) {
      console.error('❌ 获取余额失败:', error)
      walletBalance.value = '0.0000'
    }
  }

  /**
   * 参与预售购买
   * @param {Object} purchaseData - 购买数据
   * @param {Object} purchaseData.token - 代币信息
   * @param {number} purchaseData.amount - 购买数量
   * @param {string} purchaseData.totalCost - 总费用
   */
  const purchaseToken = async (purchaseData) => {
    try {
      // 验证参数
      if (!purchaseData || !purchaseData.token || !purchaseData.amount) {
        throw new Error('购买参数无效')
      }

      const { token, amount, totalCost } = purchaseData

      console.log('🛒 开始购买代币:', {
        tokenSymbol: token.tokenSymbol,
        amount,
        totalCost,
        presaleAddress: token.presaleAddress
      })

      // 检查钱包连接
      if (!isConnected.value) {
        await connectWallet()
        if (!isConnected.value) {
          throw new Error('请先连接钱包')
        }
      }

      // 检查余额
      await updateWalletBalance()
      const balance = parseFloat(walletBalance.value)
      const cost = parseFloat(totalCost)

      if (balance < cost) {
        throw new Error(`余额不足，需要 ${cost} TRX，当前余额 ${balance} TRX`)
      }

      // 开始购买流程
      isProcessing.value = true
      error.value = null
      transactionHash.value = ''

      Toast.loading({
        message: '正在发送交易...',
        forbidClick: true,
        duration: 0
      })

      // 创建预售服务实例
      const presaleService = new PresaleService(token.presaleAddress)

      // 计算需要支付的TRX数量（转换为Sun）
      const trxAmount = parseFloat(token.presale.preSaleEthAmountFormatted) * amount
      const sunAmount = window.tronWeb.toSun(trxAmount)

      console.log('💰 购买参数:', {
        amount,
        trxAmount,
        sunAmount,
        presaleAddress: token.presaleAddress
      })

      // 执行预售购买
      const result = await presaleService.participatePresale(amount, {
        callValue: sunAmount,
        feeLimit: 100000000 // 100 TRX fee limit
      })

      console.log('✅ 购买交易结果:', result)

      if (result && result.txid) {
        transactionHash.value = result.txid
        
        Toast.clear()
        Toast.success('购买成功！')
        
        // 更新余额
        setTimeout(async () => {
          await updateWalletBalance()
        }, 3000)

        return {
          success: true,
          txHash: result.txid,
          amount,
          totalCost
        }
      } else {
        throw new Error('交易失败，请重试')
      }

    } catch (error) {
      console.error('❌ 购买失败:', error)
      error.value = error.message
      
      Toast.clear()
      Toast.fail('购买失败: ' + error.message)
      
      return {
        success: false,
        error: error.message
      }
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 获取预售详细信息
   * @param {string} presaleAddress - 预售合约地址
   * @param {string} userAddress - 用户地址
   */
  const getPresaleUserInfo = async (presaleAddress, userAddress = null) => {
    try {
      const address = userAddress || walletAddress.value
      if (!address) return null

      const presaleService = new PresaleService(presaleAddress)
      const userInfo = await presaleService.getUserFullInfo(address)
      
      return userInfo
    } catch (error) {
      console.error('❌ 获取用户预售信息失败:', error)
      return null
    }
  }

  /**
   * 检查用户是否已参与预售
   * @param {string} presaleAddress - 预售合约地址
   * @param {string} userAddress - 用户地址
   */
  const checkUserParticipation = async (presaleAddress, userAddress = null) => {
    try {
      const userInfo = await getPresaleUserInfo(presaleAddress, userAddress)
      return userInfo && userInfo.presaleInfo && userInfo.presaleInfo.preSaleCount > 0
    } catch (error) {
      console.error('❌ 检查用户参与状态失败:', error)
      return false
    }
  }

  /**
   * 格式化地址显示
   * @param {string} address - 地址
   */
  const formatAddress = (address) => {
    if (!address) return ''
    // 使用地址格式化工具，确保显示Base58格式
    return formatAddressDisplay(smartFormatAddress(address), 6, 4)
  }

  /**
   * 清除错误
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 重置状态
   */
  const reset = () => {
    isProcessing.value = false
    transactionHash.value = ''
    error.value = null
  }

  /**
   * 获取交易状态
   * @param {string} txHash - 交易哈希
   */
  const getTransactionStatus = async (txHash) => {
    try {
      if (!txHash || !window.tronWeb) return null
      
      const transaction = await window.tronWeb.trx.getTransaction(txHash)
      return transaction
    } catch (error) {
      console.error('❌ 获取交易状态失败:', error)
      return null
    }
  }

  /**
   * 在区块浏览器中查看交易
   * @param {string} txHash - 交易哈希
   */
  const viewTransaction = (txHash) => {
    if (!txHash) return
    
    const explorerUrl = `https://nile.tronscan.org/#/transaction/${txHash}`
    window.open(explorerUrl, '_blank')
  }

  // 初始化
  initializeWallet()

  return {
    // 状态
    isProcessing,
    transactionHash,
    error,
    walletBalance,
    walletAddress,
    isConnected,
    
    // 计算属性
    canPurchase,
    
    // 方法
    initializeWallet,
    connectWallet,
    updateWalletBalance,
    purchaseToken,
    getPresaleUserInfo,
    checkUserParticipation,
    formatAddress,
    clearError,
    reset,
    getTransactionStatus,
    viewTransaction
  }
}
