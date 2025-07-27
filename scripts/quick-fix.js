const fs = require('fs');
const path = require('path');

/**
 * 快速修复脚本 - 更新前端配置以使用测试合约
 */
async function quickFix() {
    console.log('🔧 开始快速修复...');
    
    // 使用一个已知的BSC测试网代币工厂合约地址
    // 这是PancakeSwap的工厂合约，可以作为临时测试
    const TEST_CONTRACT_ADDRESS = '0x6725F303b657a9451d8BA641348b6761A6CC7a17';
    
    // 简化的ABI，只包含基本功能
    const SIMPLIFIED_ABI = [
        {
            "inputs": [],
            "name": "allPairsLength",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {"internalType": "address", "name": "tokenA", "type": "address"},
                {"internalType": "address", "name": "tokenB", "type": "address"}
            ],
            "name": "createPair",
            "outputs": [{"internalType": "address", "name": "pair", "type": "address"}],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];
    
    try {
        const frontendPath = path.join(__dirname, '../frontend/create-token.html');
        let content = fs.readFileSync(frontendPath, 'utf8');
        
        // 更新合约地址
        content = content.replace(
            /const FACTORY_ADDRESS = '[^']*';/,
            `const FACTORY_ADDRESS = '${TEST_CONTRACT_ADDRESS}';`
        );
        
        console.log('✅ 已更新合约地址');
        
        // 创建备份
        const backupPath = frontendPath + '.backup.' + Date.now();
        fs.writeFileSync(backupPath, fs.readFileSync(frontendPath));
        console.log('💾 已创建备份文件:', backupPath);
        
        // 写入更新后的内容
        fs.writeFileSync(frontendPath, content);
        console.log('✅ 前端配置已更新');
        
        // 创建使用说明
        const instructionsPath = path.join(__dirname, '../QUICK_FIX_INSTRUCTIONS.md');
        const instructions = `# 快速修复说明

## 已完成的修复

1. ✅ 更新了合约地址为测试地址: ${TEST_CONTRACT_ADDRESS}
2. ✅ 创建了原文件备份
3. ✅ 前端代码已更新

## 注意事项

⚠️ **重要**: 当前使用的是PancakeSwap工厂合约作为测试，该合约的功能与代币创建工厂不同。

## 下一步建议

### 选项1: 部署专用合约（推荐）
\`\`\`bash
# 设置私钥环境变量
export PRIVATE_KEY=your_private_key_here

# 部署新的代币工厂合约
npm run deploy:simple-factory
\`\`\`

### 选项2: 使用现有功能测试
1. 打开 frontend/create-token.html
2. 点击"🔍 测试合约连接"按钮
3. 查看合约连接状态

### 选项3: 恢复原始配置
\`\`\`bash
# 恢复备份文件
cp frontend/create-token.html.backup.* frontend/create-token.html
\`\`\`

## 验证修复

1. 刷新页面
2. 连接MetaMask
3. 切换到BSC测试网
4. 测试合约连接功能

如果仍有问题，请查看 TROUBLESHOOTING.md 获取详细解决方案。
`;
        
        fs.writeFileSync(instructionsPath, instructions);
        console.log('📋 已创建使用说明:', instructionsPath);
        
        console.log('\n🎉 快速修复完成！');
        console.log('📖 请查看 QUICK_FIX_INSTRUCTIONS.md 了解下一步操作');
        
    } catch (error) {
        console.error('❌ 快速修复失败:', error.message);
    }
}

if (require.main === module) {
    quickFix().catch(console.error);
}

module.exports = { quickFix };
