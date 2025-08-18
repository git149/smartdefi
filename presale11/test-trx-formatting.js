// TRX金额格式化测试脚本
// 用于验证修复后的formatTrxAmount方法

console.log('🧪 开始TRX金额格式化测试...\n');

// 模拟修复后的formatTrxAmount方法
function formatTrxAmount(amount) {
  if (!amount) return '0 TRX'

  try {
    // 处理BigInt类型
    let numericAmount = amount
    if (typeof amount === 'bigint') {
      numericAmount = amount.toString()
    }

    // 转换为数字并处理SUN到TRX的转换
    const sunAmount = parseFloat(numericAmount.toString())
    const trxAmount = sunAmount / 1000000 // 转换 SUN 到 TRX

    // 添加详细调试日志
    console.log(`💰 TRX金额转换详情:`, {
      原始输入: amount,
      SUN数值: sunAmount,
      TRX数值: trxAmount,
      输入类型: typeof amount
    })

    // 修复：合理的格式化阈值，避免正常数值被错误格式化
    if (trxAmount >= 10000000) { // 1千万TRX以上才使用M单位
      return `${(trxAmount / 1000000).toFixed(2)}M TRX`
    } else if (trxAmount >= 10000) { // 1万TRX以上才使用K单位
      return `${(trxAmount / 1000).toFixed(2)}K TRX`
    } else {
      // 对于正常范围的数值（如1000 TRX），直接显示
      return `${Math.round(trxAmount).toLocaleString()} TRX`
    }
  } catch (error) {
    console.warn('⚠️ TRX金额格式化失败:', error, 'amount:', amount)
    return '0 TRX'
  }
}

// 测试用例
const testCases = [
  {
    name: '硬顶测试 - 1000 TRX',
    input: '1000000000', // 1000 TRX in SUN
    expected: '1,000 TRX'
  },
  {
    name: '最大购买测试 - 100 TRX', 
    input: '100000000', // 100 TRX in SUN
    expected: '100 TRX'
  },
  {
    name: '小额测试 - 1 TRX',
    input: '1000000', // 1 TRX in SUN
    expected: '1 TRX'
  },
  {
    name: '大额测试 - 50K TRX',
    input: '50000000000', // 50,000 TRX in SUN
    expected: '50.00K TRX'
  },
  {
    name: '超大额测试 - 20M TRX',
    input: '20000000000000', // 20,000,000 TRX in SUN
    expected: '20.00M TRX'
  },
  {
    name: 'BigInt测试',
    input: BigInt('1000000000'),
    expected: '1,000 TRX'
  }
];

// 运行测试
testCases.forEach((testCase, index) => {
  console.log(`\n📋 测试 ${index + 1}: ${testCase.name}`);
  console.log(`输入: ${testCase.input}`);
  
  const result = formatTrxAmount(testCase.input);
  
  console.log(`结果: ${result}`);
  console.log(`期望: ${testCase.expected}`);
  console.log(`状态: ${result === testCase.expected ? '✅ 通过' : '❌ 失败'}`);
});

console.log('\n🎯 测试总结:');
console.log('修复要点:');
console.log('1. 提高了K单位和M单位的阈值');
console.log('2. 对于1000 TRX这样的正常数值，直接显示而不是格式化为K单位');
console.log('3. 添加了详细的调试日志来跟踪转换过程');
console.log('4. 使用Math.round()确保整数显示');
