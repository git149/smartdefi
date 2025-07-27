const { ethers } = require('ethers');

async function verifyContract(contractAddress) {
    console.log('🔍 验证合约地址:', contractAddress);
    
    try {
        // 连接到BSC测试网
        const provider = new ethers.JsonRpcProvider('https://bsc-testnet-rpc.publicnode.com');
        
        // 检查合约代码
        const code = await provider.getCode(contractAddress);
        
        if (code === '0x' || code === '0x0') {
            console.log('❌ 合约不存在或地址无效');
            return false;
        }
        
        console.log('✅ 合约存在，代码长度:', code.length);
        
        // 尝试调用合约方法
        const abi = [
            {
                "inputs": [],
                "name": "creationFee",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "totalTokensCreated",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        
        const contract = new ethers.Contract(contractAddress, abi, provider);
        
        try {
            const fee = await contract.creationFee();
            console.log('💰 创建费用:', ethers.formatEther(fee), 'BNB');
        } catch (error) {
            console.log('❌ creationFee() 方法调用失败:', error.message);
        }
        
        try {
            const total = await contract.totalTokensCreated();
            console.log('📊 已创建代币数量:', total.toString());
        } catch (error) {
            console.log('❌ totalTokensCreated() 方法调用失败:', error.message);
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ 验证失败:', error.message);
        return false;
    }
}

async function main() {
    const contractAddress = '0xd843065e4C28Df8f0Dd4539949EF5cee9A1E4AEa';
    
    console.log('🔍 开始验证当前合约地址...');
    const isValid = await verifyContract(contractAddress);
    
    if (!isValid) {
        console.log('\n💡 建议解决方案:');
        console.log('1. 部署新的合约: npm run deploy:simple-factory');
        console.log('2. 使用其他已知的代币工厂合约地址');
        console.log('3. 检查网络连接和RPC节点状态');
    } else {
        console.log('\n✅ 合约验证通过，可以正常使用');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { verifyContract };
