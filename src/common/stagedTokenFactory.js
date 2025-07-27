/**
 * StagedTokenFactory 智能合约集成
 * 用于 Vue.js 主应用
 */

import Web3 from 'web3'

// 合约配置
export const FACTORY_CONFIG = {
  address: '0x073faD54A73333EC1671522b9cCCbbBd153DA265',
  network: {
    name: 'BSC Testnet',
    chainId: 97,
    rpcUrl: 'https://bsc-testnet-rpc.publicnode.com',
    blockExplorer: 'https://testnet.bscscan.com',
    currency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  },
  creationFee: '0.03' // BNB
}

// 精简的 ABI（仅包含前端需要的方法）
export const FACTORY_ABI = [
  {
    "type": "function",
    "name": "creationFee",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [{"type": "uint256", "name": ""}]
  },
  {
    "type": "function",
    "name": "totalTokensCreated",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [{"type": "uint256", "name": ""}]
  },
  {
    "type": "function",
    "name": "factoryEnabled",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [{"type": "bool", "name": ""}]
  },
  {
    "type": "function",
    "name": "createToken",
    "constant": false,
    "stateMutability": "payable",
    "payable": true,
    "inputs": [
      {"type": "string", "name": "_name"},
      {"type": "string", "name": "_symbol"},
      {"type": "uint256", "name": "_totalSupply"},
      {"type": "uint256", "name": "_feeBuy"},
      {"type": "uint256", "name": "_feeSell"}
    ],
    "outputs": [{"type": "address", "name": ""}]
  },
  {
    "type": "function",
    "name": "createAndActivateToken",
    "constant": false,
    "stateMutability": "payable",
    "payable": true,
    "inputs": [
      {"type": "string", "name": "_name"},
      {"type": "string", "name": "_symbol"},
      {"type": "uint256", "name": "_totalSupply"},
      {"type": "uint256", "name": "_feeBuy"},
      {"type": "uint256", "name": "_feeSell"}
    ],
    "outputs": [{"type": "address", "name": ""}]
  },
  {
    "type": "function",
    "name": "getTokenStage",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [{"type": "address", "name": "tokenAddress"}],
    "outputs": [
      {"type": "uint8", "name": "stage"},
      {"type": "bool", "name": "dexReady"},
      {"type": "bool", "name": "tradingActive"}
    ]
  },
  {
    "type": "function",
    "name": "getTokens",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {"type": "uint256", "name": "_start"},
      {"type": "uint256", "name": "_end"}
    ],
    "outputs": [{"type": "address[]", "name": ""}]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "TokenCreated",
    "inputs": [
      {"type": "address", "name": "token", "indexed": true},
      {"type": "address", "name": "creator", "indexed": true},
      {"type": "string", "name": "name", "indexed": false},
      {"type": "string", "name": "symbol", "indexed": false},
      {"type": "uint256", "name": "totalSupply", "indexed": false},
      {"type": "uint256", "name": "timestamp", "indexed": false}
    ]
  }
]

// Web3 实例（从现有的 web3.js 导入）
let web3Instance = null

/**
 * 初始化 Web3 实例
 */
export function initWeb3(web3) {
  web3Instance = web3
  return web3Instance
}

/**
 * 获取工厂合约实例
 */
export function getFactoryContract(web3 = web3Instance) {
  if (!web3) {
    throw new Error('Web3 实例未初始化')
  }
  return new web3.eth.Contract(FACTORY_ABI, FACTORY_CONFIG.address)
}

/**
 * 查询创建费用
 */
export async function getCreationFee(web3 = web3Instance) {
  const contract = getFactoryContract(web3)
  const fee = await contract.methods.creationFee().call()
  return fee
}

/**
 * 查询已创建代币总数
 */
export async function getTotalTokensCreated(web3 = web3Instance) {
  const contract = getFactoryContract(web3)
  const total = await contract.methods.totalTokensCreated().call()
  return total
}

/**
 * 检查工厂是否启用
 */
export async function isFactoryEnabled(web3 = web3Instance) {
  const contract = getFactoryContract(web3)
  const enabled = await contract.methods.factoryEnabled().call()
  return enabled
}

/**
 * 创建代币
 */
export async function createToken(web3, userAddress, tokenConfig) {
  const contract = getFactoryContract(web3)
  const creationFee = await getCreationFee(web3)
  
  const { name, symbol, totalSupply, buyFee = 1, sellFee = 4 } = tokenConfig
  
  return await contract.methods.createToken(
    name,
    symbol,
    totalSupply,
    buyFee,
    sellFee
  ).send({
    from: userAddress,
    value: creationFee
  })
}

/**
 * 创建并激活代币（一键部署）
 */
export async function createAndActivateToken(web3, userAddress, tokenConfig) {
  const contract = getFactoryContract(web3)
  const creationFee = await getCreationFee(web3)
  
  const { name, symbol, totalSupply, buyFee = 1, sellFee = 4 } = tokenConfig
  
  return await contract.methods.createAndActivateToken(
    name,
    symbol,
    totalSupply,
    buyFee,
    sellFee
  ).send({
    from: userAddress,
    value: creationFee
  })
}

/**
 * 查询代币状态
 */
export async function getTokenStage(web3, tokenAddress) {
  const contract = getFactoryContract(web3)
  const result = await contract.methods.getTokenStage(tokenAddress).call()
  return {
    stage: parseInt(result.stage),
    dexReady: result.dexReady,
    tradingActive: result.tradingActive
  }
}

/**
 * 获取代币列表
 */
export async function getTokensList(web3, start = 0, count = 10) {
  const contract = getFactoryContract(web3)
  const total = await getTotalTokensCreated(web3)
  const end = Math.min(start + count, total)
  
  if (start >= total) {
    return []
  }
  
  const tokens = await contract.methods.getTokens(start, end).call()
  return tokens
}

/**
 * 监听代币创建事件
 */
export function watchTokenCreated(web3, callback) {
  const contract = getFactoryContract(web3)
  
  const subscription = contract.events.TokenCreated({
    fromBlock: 'latest'
  })
  .on('data', (event) => {
    callback({
      tokenAddress: event.returnValues.token,
      creator: event.returnValues.creator,
      name: event.returnValues.name,
      symbol: event.returnValues.symbol,
      totalSupply: event.returnValues.totalSupply,
      timestamp: event.returnValues.timestamp,
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber
    })
  })
  .on('error', (error) => {
    console.error('TokenCreated 事件监听错误:', error)
  })
  
  return subscription
}

// 导出默认配置
export default {
  FACTORY_CONFIG,
  FACTORY_ABI,
  initWeb3,
  getFactoryContract,
  getCreationFee,
  getTotalTokensCreated,
  isFactoryEnabled,
  createToken,
  createAndActivateToken,
  getTokenStage,
  getTokensList,
  watchTokenCreated
}
