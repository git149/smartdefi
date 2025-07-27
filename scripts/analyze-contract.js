const { ethers } = require('ethers');

async function analyzeContract(contractAddress) {
    console.log('🔍 分析合约:', contractAddress);
    
    try {
        const provider = new ethers.JsonRpcProvider('https://bsc-testnet-rpc.publicnode.com');
        
        // 获取合约代码
        const code = await provider.getCode(contractAddress);
        console.log('📋 合约代码长度:', code.length);
        
        // 尝试不同的可能方法
        const possibleMethods = [
            // 原始方法
            {
                name: 'creationFee',
                signature: 'creationFee()',
                selector: '0x' + ethers.keccak256(ethers.toUtf8Bytes('creationFee()')).slice(2, 10)
            },
            {
                name: 'totalTokensCreated', 
                signature: 'totalTokensCreated()',
                selector: '0x' + ethers.keccak256(ethers.toUtf8Bytes('totalTokensCreated()')).slice(2, 10)
            },
            // 可能的替代方法
            {
                name: 'fee',
                signature: 'fee()',
                selector: '0x' + ethers.keccak256(ethers.toUtf8Bytes('fee()')).slice(2, 10)
            },
            {
                name: 'createToken',
                signature: 'createToken(string,string,uint256)',
                selector: '0x' + ethers.keccak256(ethers.toUtf8Bytes('createToken(string,string,uint256)')).slice(2, 10)
            },
            {
                name: 'createSimpleToken',
                signature: 'createSimpleToken(string,string,uint256)',
                selector: '0x' + ethers.keccak256(ethers.toUtf8Bytes('createSimpleToken(string,string,uint256)')).slice(2, 10)
            }
        ];
        
        console.log('\n🔍 检查方法选择器:');
        for (const method of possibleMethods) {
            console.log(`${method.name}: ${method.selector}`);
            
            // 检查合约代码中是否包含这个选择器
            if (code.includes(method.selector.slice(2))) {
                console.log(`  ✅ 找到方法: ${method.name}`);
            } else {
                console.log(`  ❌ 未找到方法: ${method.name}`);
            }
        }
        
        // 尝试调用一些基础方法
        console.log('\n🔍 尝试调用基础方法:');
        
        // 尝试获取owner
        try {
            const ownerSelector = '0x8da5cb5b'; // owner()
            const result = await provider.call({
                to: contractAddress,
                data: ownerSelector
            });
            if (result !== '0x') {
                const owner = ethers.AbiCoder.defaultAbiCoder().decode(['address'], result)[0];
                console.log('👤 合约所有者:', owner);
            }
        } catch (error) {
            console.log('❌ 获取owner失败');
        }
        
        // 尝试获取name (如果是代币合约)
        try {
            const nameSelector = '0x06fdde03'; // name()
            const result = await provider.call({
                to: contractAddress,
                data: nameSelector
            });
            if (result !== '0x') {
                const name = ethers.AbiCoder.defaultAbiCoder().decode(['string'], result)[0];
                console.log('📝 合约名称:', name);
            }
        } catch (error) {
            console.log('❌ 获取name失败');
        }
        
    } catch (error) {
        console.log('❌ 分析失败:', error.message);
    }
}

async function main() {
    await analyzeContract('0xd843065e4C28Df8f0Dd4539949EF5cee9A1E4AEa');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { analyzeContract };
