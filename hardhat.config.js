require("@nomicfoundation/hardhat-ethers");
require('dotenv').config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    bscTestnet: {
      url: "https://bsc-testnet-rpc.publicnode.com",
      accounts: process.env.BSC_TESTNET_DEPLOYER_KEY ? [process.env.BSC_TESTNET_DEPLOYER_KEY] : (process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []),
      chainId: 97,
      gasPrice: 10000000000, // 10 gwei
      gas: 5000000
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  // 添加导入路径映射以支持IDE
  remappings: [
    "@openzeppelin/contracts/=node_modules/@openzeppelin/contracts/"
  ]
};
