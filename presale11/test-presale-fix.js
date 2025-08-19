/**
 * 测试预售地址获取修复
 * 验证是否能正确获取 TE8EDTFy7CD2TXyrb7wCCHNaC8rao9HEiC 的预售合约地址
 */

console.log('🧪 测试预售地址获取修复');
console.log('目标代币地址: TE8EDTFy7CD2TXyrb7wCCHNaC8rao9HEiC');
console.log('═'.repeat(50));

// 模拟测试函数
function testPresaleAddressRetrieval() {
  // 检查页面是否已加载
  if (typeof window === 'undefined' || !window.presaleAdmin) {
    console.log('❌ 页面未加载或控制台命令未注册');
    console.log('💡 请在TokenDetailPage页面的浏览器控制台中运行此测试');
    return;
  }

  console.log('✅ 检测到预售管理控制台');
  console.log('🔍 开始测试预售状态查询...');
  
  // 调用预售状态查询
  window.presaleAdmin.getStatus()
    .then(result => {
      console.log('📊 测试结果:', result);
      
      if (result && result.contractAddress) {
        if (result.contractAddress === 'TE8EDTFy7CD2TXyrb7wCCHNaC8rao9HEiC') {
          console.log('✅ 修复成功！现在查询的是正确的代币合约');
        } else {
          console.log('❌ 修复未生效，仍在查询其他合约:', result.contractAddress);
          console.log('💡 可能需要刷新页面或检查代币地址配置');
        }
      } else {
        console.log('⚠️ 未获取到合约地址信息');
      }
    })
    .catch(error => {
      console.error('❌ 测试失败:', error);
    });
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

export { testPresaleAddressRetrieval };
