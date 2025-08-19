/**
 * 测试地址转换功能
 * 验证十六进制地址到Base58地址的转换
 */

console.log('🧪 测试地址转换功能');
console.log('═'.repeat(50));

// 测试地址转换
function testAddressConversion() {
  // 从日志中获取的十六进制地址
  const hexAddress = '414bcd378802cf469de8468c08f78ab579cca3d82e';
  
  console.log('📍 原始十六进制地址:', hexAddress);
  
  // 检查是否在浏览器环境中且有TronWeb
  if (typeof window !== 'undefined' && window.tronWeb) {
    try {
      // 使用TronWeb进行地址转换
      const base58Address = window.tronWeb.address.fromHex(hexAddress);
      console.log('✅ 转换后的Base58地址:', base58Address);
      
      // 验证地址格式
      const isValid = window.tronWeb.isAddress(base58Address);
      console.log('🔍 地址格式验证:', isValid ? '✅ 有效' : '❌ 无效');
      
      // 反向验证
      const backToHex = window.tronWeb.address.toHex(base58Address);
      console.log('🔄 反向转换验证:', backToHex.toLowerCase() === hexAddress.toLowerCase() ? '✅ 一致' : '❌ 不一致');
      
      return {
        hexAddress,
        base58Address,
        isValid,
        conversionSuccess: backToHex.toLowerCase() === hexAddress.toLowerCase()
      };
      
    } catch (error) {
      console.error('❌ 地址转换失败:', error);
      return null;
    }
  } else {
    console.log('❌ TronWeb未可用，无法进行转换测试');
    console.log('💡 请在TokenDetailPage页面的浏览器控制台中运行此测试');
    return null;
  }
}

// 测试预售地址获取
function testPresaleAddressRetrieval() {
  console.log('\n🔍 测试预售地址获取...');
  
  if (typeof window !== 'undefined' && window.presaleAdmin) {
    console.log('✅ 预售管理控制台可用');
    
    // 运行地址转换测试
    const conversionResult = testAddressConversion();
    
    if (conversionResult && conversionResult.isValid) {
      console.log('\n🎯 预期的预售合约地址:', conversionResult.base58Address);
      console.log('💡 现在运行 presaleAdmin.getStatus() 应该能获取到这个地址的预售状态');
    }
    
    return conversionResult;
  } else {
    console.log('❌ 预售管理控制台未可用');
    return null;
  }
}

// 如果在浏览器环境中，直接运行测试
if (typeof window !== 'undefined') {
  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testPresaleAddressRetrieval);
  } else {
    setTimeout(testPresaleAddressRetrieval, 1000);
  }
}

export { testAddressConversion, testPresaleAddressRetrieval };
