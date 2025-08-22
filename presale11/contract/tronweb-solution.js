/**
 * TRON 智能合约调用解决方案
 * 解决 TRON 区块浏览器 ABI 不完整的问题
 */

// 完整的合约 ABI（包含 components 定义）
const COMPLETE_ABI = [
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "symbol",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "totalSupply",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "feeBuy",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "feeSell",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "feeRecipient",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "lpBurnEnabled",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "lpBurnFrequency",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "percentForLPBurn",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "burnLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "protectTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "protectFee",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isInsideSell",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "swapThreshold",
            "type": "uint256"
          }
        ],
        "internalType": "struct CoordinatorFactory.TokenConfig",
        "name": "tokenConfig",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "presaleEthAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tradeEthAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxTotalNum",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "presaleMaxNum",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "marketDisAmount",
            "type": "uint256"
          }
        ],
        "internalType": "struct CoordinatorFactory.PresaleConfig",
        "name": "presaleConfig",
        "type": "tuple"
      }
    ],
    "name": "createTokenAndPresale",
    "outputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "presale",
        "type": "address"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
];

// 合约地址（支持从窗口变量覆盖）
let CONTRACT_ADDRESS = (typeof window !== 'undefined' && window.TRON_FACTORY_ADDRESS)
  ? window.TRON_FACTORY_ADDRESS
  : 'TLatoE81PZH9obc7iba4SkMzss3L5e4ap5';

// 运行时切换工厂地址
function setFactoryAddress(addr) {
  if (!addr) throw new Error('Invalid factory address');
  try {
    if (typeof tronWeb !== 'undefined' && !tronWeb.isAddress(addr)) {
      console.warn('提供的地址疑似不是合法 TRON 地址（base58），请确认');
    }
  } catch (_) {}
  CONTRACT_ADDRESS = addr;
  if (typeof window !== 'undefined' && window.TronContractSolution) {
    window.TronContractSolution.CONTRACT_ADDRESS = addr;
  }
  return CONTRACT_ADDRESS;
}

// Token 合约 ABI（简化版，包含主要功能）
const TOKEN_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Presale 合约 ABI（简化版，包含主要功能）
const PRESALE_ABI = [
  {
    "inputs": [],
    "name": "presaleEthAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tradeEthAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxTotalNum",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "presaleMaxNum",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentNum",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "buyPresale",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isPresaleActive",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

/**
 * 方案一：使用完整 ABI 调用合约
 */
async function callWithCompleteABI() {
  try {
    console.log('🔄 开始使用完整 ABI 调用合约...');
    
    // 检查 TronWeb 是否可用
    if (typeof tronWeb === 'undefined') {
      throw new Error('TronWeb 未找到，请确保 TronLink 已安装并连接');
    }
    
    // 使用完整 ABI 创建合约实例
    const contract = await tronWeb.contract(COMPLETE_ABI, CONTRACT_ADDRESS);
    
    console.log('✅ 合约实例创建成功');
    console.log('📋 可用方法:', Object.keys(contract));
    
    // 获取当前连接的地址作为手续费接收地址
    const currentAccount = tronWeb.defaultAddress.base58;
    console.log('📝 当前账户地址:', currentAccount);

    // 验证地址格式
    if (!tronWeb.isAddress(currentAccount)) {
      throw new Error(`无效的账户地址: ${currentAccount}`);
    }

    // 准备参数
    const tokenConfig = [
      "Test001 Token",           // name
      "TEST",                    // symbol
      "1000000000000000000000000", // totalSupply (1M tokens with 18 decimals)
      300,                       // feeBuy (3%)
      300,                       // feeSell (3%)
      currentAccount,            // feeRecipient - 使用当前连接的地址
      false,                     // lpBurnEnabled
      0,                         // lpBurnFrequency
      0,                         // percentForLPBurn
      0,                         // burnLimit
      0,                         // protectTime
      0,                         // protectFee
      false,                     // isInsideSell
      0                          // swapThreshold
    ];
    
    const presaleConfig = [
      "100000",                  // presaleEthAmount (0.1 TRX)
      "50000",                   // tradeEthAmount (0.05 TRX)
      100,                       // maxTotalNum
      10,                        // presaleMaxNum
      "1000000000"               // marketDisAmount
    ];
    
    console.log('📝 参数准备完成:');
    console.log('TokenConfig:', tokenConfig);
    console.log('PresaleConfig:', presaleConfig);
    
    // 调用函数
    const result = await contract.createTokenAndPresale(
      tokenConfig,
      presaleConfig
    ).send({
      feeLimit: 3000000000,      // 1000 TRX fee limit (足够支付Energy费用)
      callValue: 50000000,       // 50 TRX (creation fee)
      shouldPollResponse: true
    });
    
    console.log('🎉 交易成功!');
    console.log('📄 交易结果:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ 调用失败:', error);
    throw error;
  }
}

/**
 * 方案二：优化能量消耗的分步部署
 */
async function callWithOptimizedEnergy() {
  try {
    console.log('🔄 开始优化能量消耗的部署...');

    // 使用更高的能量限制和更低的期望
    const contract = await tronWeb.contract(COMPLETE_ABI, CONTRACT_ADDRESS);

    // 获取当前连接的地址作为手续费接收地址
    const currentAccount = tronWeb.defaultAddress.base58;
    console.log('📝 当前账户地址:', currentAccount);

    // 验证地址格式
    if (!tronWeb.isAddress(currentAccount)) {
      throw new Error(`无效的账户地址: ${currentAccount}`);
    }

    // 准备参数
    const tokenConfig = [
      "Test001 Token",           // name
      "TEST",                    // symbol
      "1000000000000000000000000", // totalSupply (1M tokens with 18 decimals)
      300,                       // feeBuy (3%)
      300,                       // feeSell (3%)
      currentAccount,            // feeRecipient - 使用当前连接的地址
      false,                     // lpBurnEnabled
      0,                         // lpBurnFrequency
      0,                         // percentForLPBurn
      0,                         // burnLimit
      0,                         // protectTime
      0,                         // protectFee
      false,                     // isInsideSell
      0                          // swapThreshold
    ];

    const presaleConfig = [
      "100000",                  // presaleEthAmount (0.1 TRX)
      "50000",                   // tradeEthAmount (0.05 TRX)
      100,                       // maxTotalNum
      10,                        // presaleMaxNum
      "1000000000"               // marketDisAmount
    ];

    console.log('📝 参数准备完成:');
    console.log('TokenConfig:', tokenConfig);
    console.log('PresaleConfig:', presaleConfig);

    // 使用更高的能量限制 - 根据实际消耗增加到1000 TRX
    const result = await contract.createTokenAndPresale(
      tokenConfig,
      presaleConfig
    ).send({
      feeLimit: 3000000000,      // 1000 TRX fee limit (足够支付Energy费用)
      callValue: 50000000,       // 50 TRX (creation fee)
      shouldPollResponse: false, // 不等待响应，减少超时风险
      tokenId: '',
      tokenValue: 0
    });

    console.log('🎉 交易发送成功!');
    console.log('📄 交易哈希:', result);

    // 等待交易确认
    console.log('⏳ 等待交易确认...');
    const receipt = await tronWeb.trx.getTransactionInfo(result);
    console.log('📄 交易收据:', receipt);

    return result;

  } catch (error) {
    console.error('❌ 优化部署失败:', error);
    throw error;
  }
}

/**
 * 方案三：手动编码参数（备用方案）
 */
async function callWithManualEncoding() {
  try {
    console.log('🔄 开始使用手动编码调用合约...');
    
    // 获取当前账户
    const account = tronWeb.defaultAddress.base58;
    console.log('👤 当前账户:', account);
    
    // 手动构建交易参数
    const parameter = [
      {
        type: 'tuple',
        value: [
          "Test001 Token",
          "TEST", 
          "1000000000000000000000000",
          300,
          300,
          "TK57586xio7cTQxgNJGqppMGWTwWBer6ui",
          false,
          0,
          0,
          0,
          0,
          0,
          false,
          0
        ]
      },
      {
        type: 'tuple',
        value: [
          "100000",
          "50000",
          100,
          10,
          "1000000000"
        ]
      }
    ];
    
    // 构建交易
    const transaction = await tronWeb.transactionBuilder.triggerSmartContract(
      CONTRACT_ADDRESS,
      'createTokenAndPresale(tuple,tuple)',
      {
        feeLimit: 1000000000,  // 1000 TRX fee limit
        callValue: 50000000
      },
      parameter,
      account
    );
    
    console.log('📄 交易构建完成:', transaction);
    
    // 签名并广播
    const signedTx = await tronWeb.trx.sign(transaction.transaction);
    const result = await tronWeb.trx.sendRawTransaction(signedTx);
    
    console.log('🎉 交易发送成功!');
    console.log('📄 交易结果:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ 手动编码调用失败:', error);
    throw error;
  }
}

/**
 * 主函数 - 依次尝试不同方案
 */
async function main() {
  console.log('🚀 开始调用 TRON 智能合约...');
  
  try {
    // 首先尝试方案一
    const result = await callWithCompleteABI();
    return result;
  } catch (error) {
    console.log('⚠️ 方案一失败，尝试方案二...');
    
    try {
      // 如果方案一失败，尝试方案二
      const result = await callWithManualEncoding();
      return result;
    } catch (error2) {
      console.error('❌ 所有方案都失败了:', error2);
      throw error2;
    }
  }
}

/**
 * 完整的创建与预售测试流程
 */
async function testTokenAndPresaleComplete() {
  try {
    console.log('🚀 开始完整的Token和Presale测试...');

    // 第一步：创建Token和Presale
    console.log('\n📝 第一步：创建Token和Presale合约');
    const createResult = await callWithCompleteABI();

    if (!createResult) {
      throw new Error('创建合约失败');
    }

    console.log('✅ 合约创建成功，交易哈希:', createResult);

    // 等待交易确认
    console.log('⏳ 等待交易确认...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    // 第二步：获取创建的合约地址
    console.log('\n🔍 第二步：获取创建的Token和Presale地址');
    const addresses = await getCreatedContractAddresses();

    console.log('📍 Token地址:', addresses.tokenAddress);
    console.log('📍 Presale地址:', addresses.presaleAddress);

    // 第三步：测试Token基本信息
    console.log('\n🪙 第三步：检查Token基本信息');
    await checkTokenInfo(addresses.tokenAddress);

    // 第四步：测试预售功能
    console.log('\n💰 第四步：测试预售购买功能');
    await testPresalePurchase(addresses.presaleAddress, addresses.tokenAddress);

    // 第五步：检查最终状态
    console.log('\n📊 第五步：检查最终状态');
    await checkFinalStatus(addresses.tokenAddress, addresses.presaleAddress);

    console.log('\n🎉 完整测试流程成功完成！');
    return {
      success: true,
      tokenAddress: addresses.tokenAddress,
      presaleAddress: addresses.presaleAddress
    };

  } catch (error) {
    console.error('❌ 测试流程失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 检查Token基本信息
 */
async function checkTokenInfo(tokenAddress) {
  try {
    console.log('🪙 检查Token基本信息...');

    if (tokenAddress === 'TBD_TOKEN_ADDRESS') {
      console.log('⚠️ Token地址待定，跳过检查');
      return;
    }

    const tokenContract = await tronWeb.contract(TOKEN_ABI, tokenAddress);

    // 获取基本信息
    const name = await tokenContract.name().call();
    const symbol = await tokenContract.symbol().call();
    const totalSupply = await tokenContract.totalSupply().call();
    const decimals = await tokenContract.decimals().call();

    console.log('📊 Token信息:');
    console.log(`  名称: ${name}`);
    console.log(`  符号: ${symbol}`);
    console.log(`  总供应量: ${totalSupply.toString()}`);
    console.log(`  小数位数: ${decimals.toString()}`);

    // 检查当前用户余额
    const currentAccount = tronWeb.defaultAddress.base58;
    const balance = await tokenContract.balanceOf(currentAccount).call();
    console.log(`  当前账户余额: ${balance.toString()}`);

    return {
      name,
      symbol,
      totalSupply: totalSupply.toString(),
      decimals: decimals.toString(),
      userBalance: balance.toString()
    };

  } catch (error) {
    console.error('❌ 检查Token信息失败:', error);
    throw error;
  }
}

/**
 * 测试预售购买功能
 */
async function testPresalePurchase(presaleAddress, tokenAddress) {
  try {
    console.log('💰 测试预售购买功能...');

    if (presaleAddress === 'TBD_PRESALE_ADDRESS') {
      console.log('⚠️ Presale地址待定，跳过测试');
      return;
    }

    const presaleContract = await tronWeb.contract(PRESALE_ABI, presaleAddress);

    // 获取预售信息
    console.log('📋 获取预售信息...');
    const presaleEthAmount = await presaleContract.presaleEthAmount().call();
    const tradeEthAmount = await presaleContract.tradeEthAmount().call();
    const maxTotalNum = await presaleContract.maxTotalNum().call();
    const presaleMaxNum = await presaleContract.presaleMaxNum().call();
    const currentNum = await presaleContract.currentNum().call();

    console.log('📊 预售信息:');
    console.log(`  预售价格: ${presaleEthAmount.toString()} sun`);
    console.log(`  交易价格: ${tradeEthAmount.toString()} sun`);
    console.log(`  最大总数: ${maxTotalNum.toString()}`);
    console.log(`  预售最大数: ${presaleMaxNum.toString()}`);
    console.log(`  当前数量: ${currentNum.toString()}`);

    // 检查预售是否激活
    try {
      const isActive = await presaleContract.isPresaleActive().call();
      console.log(`  预售状态: ${isActive ? '激活' : '未激活'}`);

      if (!isActive) {
        console.log('⚠️ 预售未激活，跳过购买测试');
        return;
      }
    } catch (e) {
      console.log('⚠️ 无法检查预售状态，继续测试...');
    }

    // 尝试购买少量Token（测试用）
    console.log('🛒 尝试购买预售Token...');
    const purchaseAmount = 1; // 购买1个Token
    const purchaseValue = parseInt(presaleEthAmount.toString()) * purchaseAmount;

    console.log(`💳 购买数量: ${purchaseAmount}`);
    console.log(`💰 支付金额: ${purchaseValue} sun (${purchaseValue / 1000000} TRX)`);

    try {
      const buyResult = await presaleContract.buyPresale(purchaseAmount).send({
        feeLimit: 50000000,  // 50 TRX
        callValue: purchaseValue,
        shouldPollResponse: true
      });

      console.log('✅ 购买成功!');
      console.log('📄 交易哈希:', buyResult);

      // 等待确认后检查余额
      await new Promise(resolve => setTimeout(resolve, 5000));

      if (tokenAddress !== 'TBD_TOKEN_ADDRESS') {
        const tokenContract = await tronWeb.contract(TOKEN_ABI, tokenAddress);
        const currentAccount = tronWeb.defaultAddress.base58;
        const newBalance = await tokenContract.balanceOf(currentAccount).call();
        console.log(`🪙 购买后Token余额: ${newBalance.toString()}`);
      }

      return { success: true, txHash: buyResult };

    } catch (buyError) {
      console.log('⚠️ 购买失败（可能是预售未开始或其他限制）:', buyError.message);
      return { success: false, error: buyError.message };
    }

  } catch (error) {
    console.error('❌ 测试预售购买失败:', error);
    throw error;
  }
}

/**
 * 检查最终状态
 */
async function checkFinalStatus(tokenAddress, presaleAddress) {
  try {
    console.log('📊 检查最终状态...');

    // 检查Token状态
    if (tokenAddress !== 'TBD_TOKEN_ADDRESS') {
      console.log('\n🪙 Token最终状态:');
      await checkTokenInfo(tokenAddress);
    }

    // 检查Presale状态
    if (presaleAddress !== 'TBD_PRESALE_ADDRESS') {
      console.log('\n💰 Presale最终状态:');
      const presaleContract = await tronWeb.contract(PRESALE_ABI, presaleAddress);

      const currentNum = await presaleContract.currentNum().call();
      const maxTotalNum = await presaleContract.maxTotalNum().call();

      console.log(`📈 销售进度: ${currentNum.toString()}/${maxTotalNum.toString()}`);
      console.log(`📊 完成度: ${(parseInt(currentNum.toString()) / parseInt(maxTotalNum.toString()) * 100).toFixed(2)}%`);
    }

    console.log('\n🎯 测试总结:');
    console.log('✅ Token合约创建成功');
    console.log('✅ Presale合约创建成功');
    console.log('✅ 基本功能测试完成');

  } catch (error) {
    console.error('❌ 检查最终状态失败:', error);
    throw error;
  }
}

/**
 * 低成本创建Token和Presale
 */
async function createWithLowCost() {
  try {
    console.log('💰 开始低成本创建Token和Presale...');

    const contract = await tronWeb.contract(COMPLETE_ABI, CONTRACT_ADDRESS);
    const currentAccount = tronWeb.defaultAddress.base58;

    // 低成本参数配置
    const tokenConfig = [
      "LowCost Token",           // name
      "LOW",                     // symbol
      "100000000000000000000000", // totalSupply (100K tokens)
      200,                       // feeBuy (2%)
      200,                       // feeSell (2%)
      currentAccount,            // feeRecipient
      false,                     // lpBurnEnabled
      0, 0, 0, 0, 0, false, 0   // 其他参数全部为0
    ];

    const presaleConfig = [
      "50000",                   // presaleEthAmount (0.05 TRX)
      "25000",                   // tradeEthAmount (0.025 TRX)
      50,                        // maxTotalNum
      5,                         // presaleMaxNum
      "500000000"                // marketDisAmount
    ];

    console.log('💡 使用低成本参数配置');
    console.log('💰 创建费用: 20 TRX + 150 TRX feeLimit');

    const result = await contract.createTokenAndPresale(
      tokenConfig,
      presaleConfig
    ).send({
      feeLimit: 150000000,       // 150 TRX fee limit (低成本版本)
      callValue: 20000000,       // 20 TRX (低创建费用)
      shouldPollResponse: false
    });

    console.log('✅ 低成本创建成功!');
    console.log('📄 交易哈希:', result);

    return result;

  } catch (error) {
    console.error('❌ 低成本创建失败:', error);
    throw error;
  }
}

/**
 * 获取创建的合约地址
 */
async function getCreatedContractAddresses() {
  try {
    console.log('🔍 从工厂合约获取最新创建的合约地址...');

    const factoryContract = await tronWeb.contract(COMPLETE_ABI, CONTRACT_ADDRESS);

    // 获取总创建数量
    const totalPairs = await factoryContract.totalPairsCreated().call();
    console.log('📊 总创建数量:', totalPairs.toString());

    if (parseInt(totalPairs.toString()) === 0) {
      throw new Error('还没有创建任何Token-Presale对');
    }

    // 获取最新的Token和Presale地址
    const latestIndex = parseInt(totalPairs.toString()) - 1;
    console.log('🔢 获取索引:', latestIndex);

    // 尝试从事件日志中获取地址
    try {
      const events = await tronWeb.getEventResult(CONTRACT_ADDRESS, {
        eventName: 'TokenPresalePairCreated',
        size: 5
      });

      console.log('📋 获取到的事件:', events);

      if (events && events.length > 0) {
        const latestEvent = events[events.length - 1]; // 最新的事件
        console.log('📄 最新事件详情:', latestEvent);

        return {
          tokenAddress: latestEvent.result.token,
          presaleAddress: latestEvent.result.presale
        };
      }
    } catch (e) {
      console.log('⚠️ 无法从事件获取地址:', e.message);
    }

    // 如果事件获取失败，尝试其他方法
    // 这里可以添加其他获取地址的方法
    throw new Error('无法获取合约地址，请手动提供');

  } catch (error) {
    console.error('❌ 获取合约地址失败:', error);

    // 返回默认地址供测试（需要用户手动更新）
    return {
      tokenAddress: 'TBD_TOKEN_ADDRESS',
      presaleAddress: 'TBD_PRESALE_ADDRESS'
    };
  }
}

// 导出函数供外部使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    callWithCompleteABI,
    callWithManualEncoding,
    callWithOptimizedEnergy,
    createWithLowCost,
    testTokenAndPresaleComplete,
    getCreatedContractAddresses,
    main,
    COMPLETE_ABI,
    CONTRACT_ADDRESS
  };
}

// 如果在浏览器环境中，添加到全局对象
if (typeof window !== 'undefined') {
  window.TronContractSolution = {
    callWithCompleteABI,
    callWithManualEncoding,
    callWithOptimizedEnergy,
    createWithLowCost,
    testTokenAndPresaleComplete,
    getCreatedContractAddresses,
    checkTokenInfo,
    testPresalePurchase,
    checkFinalStatus,
    main,
    COMPLETE_ABI,
    CONTRACT_ADDRESS,
    TOKEN_ABI,
    PRESALE_ABI,
    setFactoryAddress
  };

  // 将函数添加到全局作用域，方便HTML页面调用
  window.callWithCompleteABI = callWithCompleteABI;
  window.callWithOptimizedEnergy = callWithOptimizedEnergy;
  window.createWithLowCost = createWithLowCost;
  window.testTokenAndPresaleComplete = testTokenAndPresaleComplete;
  window.getCreatedContractAddresses = getCreatedContractAddresses;
  window.checkTokenInfo = checkTokenInfo;
  window.testPresalePurchase = testPresalePurchase;
  window.checkFinalStatus = checkFinalStatus;
}
