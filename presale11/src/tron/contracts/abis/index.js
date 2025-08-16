/**
 * TRON智能合约ABI统一导入入口
 * 提供所有合约ABI的统一访问接口
 */

import CoordinatorFactoryABI from './CoordinatorFactoryABI.json'
import PresaleABI from './presaleABI.json'
import TokenABI from './tokenABI.json'

/**
 * 合约ABI映射
 */
export const CONTRACT_ABIS = {
  COORDINATOR_FACTORY: CoordinatorFactoryABI,
  PRESALE: PresaleABI,
  TOKEN: TokenABI
}

/**
 * 获取指定合约的ABI
 * @param {string} contractType - 合约类型 (COORDINATOR_FACTORY, PRESALE, TOKEN)
 * @returns {Array} 合约ABI数组
 */
export function getContractABI(contractType) {
  const abi = CONTRACT_ABIS[contractType]
  if (!abi) {
    throw new Error(`未找到合约类型 ${contractType} 的ABI`)
  }
  return abi
}

/**
 * 验证ABI是否有效
 * @param {Array} abi - 合约ABI
 * @returns {boolean} 是否有效
 */
export function validateABI(abi) {
  if (!Array.isArray(abi)) {
    return false
  }
  
  // 检查是否包含基本的合约元素
  const hasConstructor = abi.some(item => item.type === 'constructor')
  const hasFunctions = abi.some(item => item.type === 'function')
  
  return hasConstructor || hasFunctions
}

/**
 * 获取合约中的所有函数名
 * @param {string} contractType - 合约类型
 * @returns {Array} 函数名数组
 */
export function getContractFunctions(contractType) {
  const abi = getContractABI(contractType)
  return abi
    .filter(item => item.type === 'function')
    .map(item => item.name)
}

/**
 * 获取合约中的所有事件名
 * @param {string} contractType - 合约类型
 * @returns {Array} 事件名数组
 */
export function getContractEvents(contractType) {
  const abi = getContractABI(contractType)
  return abi
    .filter(item => item.type === 'event')
    .map(item => item.name)
}

/**
 * 检查合约是否包含指定函数
 * @param {string} contractType - 合约类型
 * @param {string} functionName - 函数名
 * @returns {boolean} 是否包含该函数
 */
export function hasFunction(contractType, functionName) {
  const functions = getContractFunctions(contractType)
  return functions.includes(functionName)
}

/**
 * 获取函数的详细信息
 * @param {string} contractType - 合约类型
 * @param {string} functionName - 函数名
 * @returns {Object|null} 函数详细信息
 */
export function getFunctionDetails(contractType, functionName) {
  const abi = getContractABI(contractType)
  return abi.find(item => item.type === 'function' && item.name === functionName) || null
}

// 导出所有ABI
export {
  CoordinatorFactoryABI,
  PresaleABI,
  TokenABI
}

// 默认导出
export default CONTRACT_ABIS
