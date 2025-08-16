/**
 * 余额检查和问题诊断工具
 * 用于解决 "balance is not sufficient" 错误
 */

// 检查账户余额和资源
async function checkAccountBalance() {
  try {
    console.log('🔍 检查账户余额和资源...');
    
    if (typeof tronWeb === 'undefined' || !tronWeb.ready) {
      throw new Error('TronLink 未连接');
    }
    
    const account = tronWeb.defaultAddress.base58;
    console.log('📝 当前账户:', account);
    
    // 1. 检查TRX余额
    const balance = await tronWeb.trx.getBalance(account);
    const trxBalance = balance / 1000000; // 转换为TRX
    console.log(`💰 TRX余额: ${trxBalance} TRX`);
    
    // 2. 检查账户资源
    const resources = await tronWeb.trx.getAccountResources(account);
    console.log('⚡ 账户资源:');
    console.log(`  Energy: ${resources.EnergyUsed || 0}/${resources.EnergyLimit || 0}`);
    console.log(`  Bandwidth: ${resources.NetUsed || 0}/${resources.NetLimit || 0}`);
    
    // 3. 分析问题
    const analysis = analyzeBalance(trxBalance, resources);
    console.log('\n📊 问题分析:');
    analysis.forEach(item => {
      console.log(`${item.status} ${item.message}`);
    });
    
    // 4. 提供解决方案
    const solutions = getSolutions(trxBalance, resources);
    console.log('\n🛠️ 解决方案:');
    solutions.forEach((solution, index) => {
      console.log(`${index + 1}. ${solution}`);
    });
    
    return {
      account,
      trxBalance,
      resources,
      analysis,
      solutions
    };
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
    throw error;
  }
}

// 分析余额问题
function analyzeBalance(trxBalance, resources) {
  const analysis = [];
  
  // TRX余额检查
  if (trxBalance < 100) {
    analysis.push({
      status: '❌',
      message: `TRX余额过低 (${trxBalance} TRX)，建议至少500 TRX`
    });
  } else if (trxBalance < 500) {
    analysis.push({
      status: '⚠️',
      message: `TRX余额较低 (${trxBalance} TRX)，可能不足以支付高Gas费用`
    });
  } else {
    analysis.push({
      status: '✅',
      message: `TRX余额充足 (${trxBalance} TRX)`
    });
  }
  
  // Energy检查 - 更精确的分析
  const energyAvailable = (resources.EnergyLimit || 0) - (resources.EnergyUsed || 0);
  if (energyAvailable < 50000) {
    analysis.push({
      status: '❌',
      message: `Energy严重不足 (可用: ${energyAvailable})，无法执行任何合约操作`
    });
  } else if (energyAvailable < 100000) {
    analysis.push({
      status: '⚠️',
      message: `Energy极低 (可用: ${energyAvailable})，只能执行简单操作`
    });
  } else if (energyAvailable < 1000000) {
    analysis.push({
      status: '⚠️',
      message: `Energy不足 (可用: ${energyAvailable})，合约创建可能失败`
    });
  } else {
    analysis.push({
      status: '✅',
      message: `Energy充足 (可用: ${energyAvailable})`
    });
  }
  
  // Bandwidth检查
  const bandwidthAvailable = (resources.NetLimit || 0) - (resources.NetUsed || 0);
  if (bandwidthAvailable < 1000) {
    analysis.push({
      status: '⚠️',
      message: `Bandwidth较低 (可用: ${bandwidthAvailable})`
    });
  } else {
    analysis.push({
      status: '✅',
      message: `Bandwidth充足 (可用: ${bandwidthAvailable})`
    });
  }
  
  return analysis;
}

// 获取解决方案
function getSolutions(trxBalance, resources) {
  const solutions = [];
  
  if (trxBalance < 500) {
    solutions.push('🚰 获取更多测试TRX: https://nile.tronscan.org/#/tools/tron-faucet');
    solutions.push('💎 从其他账户转入TRX');
  }
  
  const energyAvailable = (resources.EnergyLimit || 0) - (resources.EnergyUsed || 0);
  if (energyAvailable < 1000000) {
    solutions.push('⚡ 质押TRX获取Energy (质押100 TRX ≈ 获得1M Energy)');
    solutions.push('🔄 等待Energy自然恢复 (每24小时重置)');
  }
  
  solutions.push('💰 降低创建费用 (减少callValue从50 TRX到20 TRX)');
  solutions.push('🔧 使用低Gas版本的合约创建');
  
  return solutions;
}

// 获取测试TRX
async function getTestTRX() {
  const account = tronWeb.defaultAddress.base58;
  console.log('🚰 获取测试TRX指南:');
  console.log(`1. 访问水龙头: https://nile.tronscan.org/#/tools/tron-faucet`);
  console.log(`2. 输入您的地址: ${account}`);
  console.log(`3. 点击获取测试TRX`);
  console.log(`4. 等待1-2分钟到账`);
  
  // 打开水龙头页面
  if (typeof window !== 'undefined') {
    window.open('https://nile.tronscan.org/#/tools/tron-faucet', '_blank');
  }
}

// 质押TRX获取Energy
async function stakeForEnergy(amount = 100) {
  try {
    console.log(`⚡ 质押 ${amount} TRX 获取Energy...`);
    
    const account = tronWeb.defaultAddress.base58;
    
    // 构建质押交易
    const transaction = await tronWeb.transactionBuilder.freezeBalance(
      amount * 1000000, // 转换为sun
      3, // 质押天数
      'ENERGY', // 资源类型
      account,
      account
    );
    
    // 签名并发送
    const signedTx = await tronWeb.trx.sign(transaction);
    const result = await tronWeb.trx.sendRawTransaction(signedTx);
    
    console.log('✅ 质押成功!');
    console.log('📄 交易哈希:', result.txid);
    console.log('⏳ 等待几分钟后Energy将增加');
    
    return result;
    
  } catch (error) {
    console.error('❌ 质押失败:', error);
    throw error;
  }
}

// 低成本创建合约
async function createWithLowCost() {
  try {
    console.log('💰 使用低成本方式创建合约...');
    
    // 检查余额
    const balanceCheck = await checkAccountBalance();
    if (balanceCheck.trxBalance < 50) {
      throw new Error('TRX余额不足50，无法创建合约');
    }
    
    const contract = await tronWeb.contract(COMPLETE_ABI, CONTRACT_ADDRESS);
    const currentAccount = tronWeb.defaultAddress.base58;
    
    // 使用较低的参数
    const tokenConfig = [
      "LowCostToken",            // name
      "LCT",                     // symbol
      "100000000000000000000000", // totalSupply (100K tokens)
      200,                       // feeBuy (2%)
      200,                       // feeSell (2%)
      currentAccount,            // feeRecipient
      false,                     // lpBurnEnabled
      0, 0, 0, 0, 0, false, 0   // 其他参数
    ];
    
    const presaleConfig = [
      "50000",                   // presaleEthAmount (0.05 TRX)
      "25000",                   // tradeEthAmount (0.025 TRX)
      50,                        // maxTotalNum (减少)
      5,                         // presaleMaxNum (减少)
      "500000000"                // marketDisAmount (减少)
    ];
    
    console.log('📝 使用低成本参数:');
    console.log('TokenConfig:', tokenConfig);
    console.log('PresaleConfig:', presaleConfig);
    
    // 使用较低的费用
    const result = await contract.createTokenAndPresale(
      tokenConfig,
      presaleConfig
    ).send({
      feeLimit: 150000000,       // 150 TRX (降低)
      callValue: 20000000,       // 20 TRX (降低)
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

// 诊断和修复工具
async function diagnoseAndFix() {
  console.log('🔧 开始诊断和修复...');
  
  try {
    // 1. 检查余额
    const balanceInfo = await checkAccountBalance();
    
    // 2. 自动修复
    if (balanceInfo.trxBalance < 100) {
      console.log('💡 建议获取更多测试TRX');
      await getTestTRX();
      return { action: 'get_trx', message: '请先获取测试TRX' };
    }
    
    const energyAvailable = (balanceInfo.resources.EnergyLimit || 0) - (balanceInfo.resources.EnergyUsed || 0);
    if (energyAvailable < 100000 && balanceInfo.trxBalance >= 200) {
      console.log('💡 Energy严重不足，建议质押200 TRX获取Energy');
      const stakeResult = await stakeForEnergy(200);
      return { action: 'stake_energy', result: stakeResult };
    } else if (energyAvailable < 1000000 && balanceInfo.trxBalance >= 100) {
      console.log('💡 Energy不足，建议质押100 TRX获取Energy');
      const stakeResult = await stakeForEnergy(100);
      return { action: 'stake_energy', result: stakeResult };
    }
    
    // 3. 尝试低成本创建
    if (balanceInfo.trxBalance >= 50) {
      console.log('💡 尝试低成本创建');
      const createResult = await createWithLowCost();
      return { action: 'low_cost_create', result: createResult };
    }
    
  } catch (error) {
    console.error('❌ 诊断修复失败:', error);
    return { action: 'failed', error: error.message };
  }
}

// 导出函数
if (typeof window !== 'undefined') {
  window.checkAccountBalance = checkAccountBalance;
  window.getTestTRX = getTestTRX;
  window.stakeForEnergy = stakeForEnergy;
  window.createWithLowCost = createWithLowCost;
  window.diagnoseAndFix = diagnoseAndFix;
}

// 自动提示
console.log('🔧 余额检查工具已加载！');
console.log('💡 可用命令:');
console.log('  checkAccountBalance() - 检查余额和资源');
console.log('  getTestTRX() - 获取测试TRX');
console.log('  stakeForEnergy(100) - 质押TRX获取Energy');
console.log('  createWithLowCost() - 低成本创建合约');
console.log('  diagnoseAndFix() - 自动诊断和修复');
