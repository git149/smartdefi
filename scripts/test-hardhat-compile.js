const { ethers } = require('hardhat');

async function main() {
    console.log('🧪 测试Hardhat编译StagedTokenFactory合约...');

    try {
        // 尝试获取合约工厂
        console.log('📝 编译合约...');
        const StagedTokenFactory = await ethers.getContractFactory("StagedTokenFactory");
        
        console.log('✅ 合约编译成功！');
        
        // 获取ABI信息
        const abi = StagedTokenFactory.interface.fragments;
        console.log('📋 ABI方法数量:', abi.length);
        
        // 检查关键方法
        const requiredMethods = ['creationFee', 'totalTokensCreated', 'createToken'];
        console.log('\n🔍 检查关键方法:');
        
        requiredMethods.forEach(methodName => {
            const method = abi.find(fragment => 
                fragment.type === 'function' && fragment.name === methodName
            );
            if (method) {
                console.log(`✅ ${methodName}: 找到`);
            } else {
                console.log(`❌ ${methodName}: 未找到`);
            }
        });
        
        // 检查事件
        const tokenCreatedEvent = abi.find(fragment => 
            fragment.type === 'event' && fragment.name === 'TokenCreated'
        );
        
        if (tokenCreatedEvent) {
            console.log('✅ TokenCreated事件: 找到');
        } else {
            console.log('❌ TokenCreated事件: 未找到');
        }
        
        // 显示所有可用方法
        console.log('\n📋 所有可用方法:');
        const functions = abi.filter(fragment => fragment.type === 'function');
        functions.forEach(func => {
            console.log(`  - ${func.name}(${func.inputs.map(input => input.type).join(', ')})`);
        });
        
        console.log('\n🎉 编译测试完成！合约可以部署。');
        return true;
        
    } catch (error) {
        console.error('❌ 编译测试失败:', error.message);
        
        if (error.message.includes('Could not find')) {
            console.log('\n💡 可能的解决方案:');
            console.log('1. 检查合约文件路径是否正确');
            console.log('2. 确保所有依赖的合约文件都存在');
            console.log('3. 检查import语句是否正确');
        }
        
        return false;
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { main };
