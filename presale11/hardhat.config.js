require("@nomicfoundation/hardhat-toolbox");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        count: 20,
        accountsBalance: "10000000000000000000000" // 10000 ETH per account
      },
      gas: 50000000,
      gasPrice: 8000000000,
      blockGasLimit: 50000000,
      allowUnlimitedContractSize: true
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC || "https://bsc-testnet.4everland.org/v1/37fa9972c1b1cd5fab542c7bdd4cde2f",
      chainId: 97,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 8000000,
      gasPrice: 20000000000,
      timeout: 60000,
      confirmations: 2
    },
    bscMainnet: {
      url: "https://bsc-dataseed1.binance.org/",
      chainId: 56,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 30000000,
      gasPrice: 5000000000
    },
      // TRX主网配置
  trxMainnet: {
    url: process.env.TRX_MAINNET_RPC || "https://api.trongrid.io",
    chainId: 1,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    gas: 8000000,
    gasPrice: 1000000000, // 1 Gwei (TRX使用不同的gas单位)
    timeout: 60000,
    confirmations: 2
  },
  
  // TRX测试网配置 (Nile测试网) - 使用标准以太坊兼容RPC
  trxTestnet: {
    url: process.env.TRX_TESTNET_RPC || "https://nile.trongrid.io",
    chainId: 3448148188,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    gas: 30000000,
    gasPrice: 1000000000,
    timeout: 180000,
    confirmations: 3,
    allowUnlimitedContractSize: true
  },
  
  // TRX Shasta测试网配置
  trxShasta: {
    url: process.env.TRX_SHASTA_RPC || "https://api.shasta.trongrid.io",
    chainId: 2,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    gas: 8000000,
    gasPrice: 1000000000,
    timeout: 60000,
    confirmations: 2
  }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 5, // BSC gas price in gwei
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "BNB",
    gasPriceApi: "https://api.bscscan.com/api?module=proxy&action=eth_gasPrice",
    showTimeSpent: true,
    showMethodSig: true,
    maxMethodDiff: 10
  },
  etherscan: {
    apiKey: {
      bsc: process.env.BSCSCAN_API_KEY || "dummy-key",
      bscTestnet: process.env.BSCSCAN_API_KEY || "dummy-key"
    }
  },
  mocha: {
    timeout: 120000, // 2 minutes
    reporter: "spec",
    slow: 10000
  },
  paths: {
    sources: "./contract",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
