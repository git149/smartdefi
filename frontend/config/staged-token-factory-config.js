/**
 * StagedTokenFactory 合约配置
 * 部署时间: 2025-07-26T16:42:42.712Z
 * 网络: BSC Testnet (Chain ID: 97)
 */

// 合约地址
export const FACTORY_CONTRACT_ADDRESS = '0x073faD54A73333EC1671522b9cCCbbBd153DA265';

// 网络配置
export const NETWORK_CONFIG = {
  name: 'BSC Testnet',
  chainId: 97,
  rpcUrl: 'https://bsc-testnet-rpc.publicnode.com',
  blockExplorer: 'https://testnet.bscscan.com',
  currency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  }
};

// 合约信息
export const CONTRACT_INFO = {
  address: FACTORY_CONTRACT_ADDRESS,
  deployerAddress: '0x297D4bf23F702F2b3B11dAA47b156731a41C4059',
  transactionHash: '0x14d7f80515f659f09a6b8d1bb4e64951dec30447df45cdde550283945e17eac2',
  creationFee: '0.03', // BNB
  bscscanUrl: `https://testnet.bscscan.com/address/${FACTORY_CONTRACT_ADDRESS}`
};

// 主要功能函数的ABI（用于前端调用）
export const FACTORY_ABI_ESSENTIAL = [
  // 查询函数
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
    "name": "getAllTokensLength",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [{"type": "uint256", "name": ""}]
  },
  // 代币创建函数
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
  // 事件
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
];

// 使用示例
export const USAGE_EXAMPLES = {
  // Web3.js 示例
  web3js: `
import Web3 from 'web3';
import { FACTORY_CONTRACT_ADDRESS, FACTORY_ABI_ESSENTIAL, NETWORK_CONFIG } from './staged-token-factory-config.js';

// 初始化 Web3
const web3 = new Web3(NETWORK_CONFIG.rpcUrl);
const contract = new web3.eth.Contract(FACTORY_ABI_ESSENTIAL, FACTORY_CONTRACT_ADDRESS);

// 查询创建费用
const creationFee = await contract.methods.creationFee().call();
console.log('创建费用:', web3.utils.fromWei(creationFee, 'ether'), 'BNB');

// 创建代币
const accounts = await web3.eth.getAccounts();
const receipt = await contract.methods.createToken(
  'My Token',
  'MTK', 
  '1000000',
  1, // 1% 买入费
  4  // 4% 卖出费
).send({
  from: accounts[0],
  value: creationFee
});
`,
  
  // Ethers.js 示例
  ethersjs: `
import { ethers } from 'ethers';
import { FACTORY_CONTRACT_ADDRESS, FACTORY_ABI_ESSENTIAL, NETWORK_CONFIG } from './staged-token-factory-config.js';

// 初始化 Provider 和 Contract
const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
const contract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_ABI_ESSENTIAL, provider);

// 查询创建费用
const creationFee = await contract.creationFee();
console.log('创建费用:', ethers.formatEther(creationFee), 'BNB');

// 创建代币（需要连接钱包）
const signer = await provider.getSigner();
const contractWithSigner = contract.connect(signer);
const tx = await contractWithSigner.createToken(
  'My Token',
  'MTK',
  '1000000',
  1, // 1% 买入费
  4, // 4% 卖出费
  { value: creationFee }
);
await tx.wait();
`
};

export default {
  FACTORY_CONTRACT_ADDRESS,
  NETWORK_CONFIG,
  CONTRACT_INFO,
  FACTORY_ABI_ESSENTIAL,
  USAGE_EXAMPLES
};
