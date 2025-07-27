const fs = require('fs');
const path = require('path');
const solc = require('solc');

async function testCompile() {
    console.log('🧪 测试编译StagedTokenFactory合约...');

    try {
        // 读取合约源码
        const contractPath = path.join(__dirname, '../contracts/Acon/StagedTokenFactory.sol');
        const interfacesPath = path.join(__dirname, '../contracts/Acon/Interfaces.sol');
        
        if (!fs.existsSync(contractPath)) {
            console.log('❌ 未找到StagedTokenFactory.sol文件');
            return false;
        }

        if (!fs.existsSync(interfacesPath)) {
            console.log('❌ 未找到Interfaces.sol文件');
            return false;
        }
        
        const stagedFactorySource = fs.readFileSync(contractPath, 'utf8');
        const interfacesSource = fs.readFileSync(interfacesPath, 'utf8');

        console.log('📝 开始编译...');

        // 简化的编译配置
        const input = {
            language: 'Solidity',
            sources: {
                'StagedTokenFactory.sol': {
                    content: stagedFactorySource
                },
                'Interfaces.sol': {
                    content: interfacesSource
                }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['abi', 'evm.bytecode.object']
                    }
                }
            }
        };

        const output = JSON.parse(solc.compile(JSON.stringify(input)));
        
        if (output.errors) {
            console.log('⚠️ 编译消息:');
            let hasErrors = false;
            output.errors.forEach(error => {
                if (error.severity === 'error') {
                    console.error('❌', error.formattedMessage);
                    hasErrors = true;
                } else {
                    console.warn('⚠️', error.formattedMessage);
                }
            });
            
            if (hasErrors) {
                console.log('❌ 编译失败');
                return false;
            }
        }

        // 检查合约是否编译成功
        const contracts = output.contracts['StagedTokenFactory.sol'];
        if (!contracts || !contracts['StagedTokenFactory']) {
            console.log('❌ 未找到StagedTokenFactory合约');
            return false;
        }

        const contract = contracts['StagedTokenFactory'];
        const abi = contract.abi;
        const bytecode = contract.evm.bytecode.object;

        console.log('✅ 编译成功！');
        console.log('📋 ABI方法数量:', abi.length);
        console.log('📦 字节码长度:', bytecode.length);

        // 检查关键方法
        const requiredMethods = ['creationFee', 'totalTokensCreated', 'createToken'];
        const foundMethods = abi.filter(item => 
            item.type === 'function' && requiredMethods.includes(item.name)
        );

        console.log('\n🔍 检查关键方法:');
        requiredMethods.forEach(method => {
            const found = foundMethods.find(m => m.name === method);
            if (found) {
                console.log(`✅ ${method}: 找到`);
            } else {
                console.log(`❌ ${method}: 未找到`);
            }
        });

        // 检查事件
        const tokenCreatedEvent = abi.find(item => 
            item.type === 'event' && item.name === 'TokenCreated'
        );
        
        if (tokenCreatedEvent) {
            console.log('✅ TokenCreated事件: 找到');
        } else {
            console.log('❌ TokenCreated事件: 未找到');
        }

        // 生成前端ABI
        const frontendABI = abi.filter(item => {
            if (item.type === 'function') {
                return requiredMethods.includes(item.name);
            }
            if (item.type === 'event') {
                return item.name === 'TokenCreated';
            }
            return false;
        });

        console.log('\n📋 前端ABI预览:');
        console.log(JSON.stringify(frontendABI, null, 2));

        // 保存编译结果
        const compileResult = {
            success: true,
            abi: abi,
            frontendABI: frontendABI,
            bytecode: bytecode,
            compiledAt: new Date().toISOString()
        };

        const resultPath = path.join(__dirname, '../deployments/compile-result.json');
        const deployDir = path.dirname(resultPath);
        if (!fs.existsSync(deployDir)) {
            fs.mkdirSync(deployDir, { recursive: true });
        }

        fs.writeFileSync(resultPath, JSON.stringify(compileResult, null, 2));
        console.log('\n💾 编译结果已保存到:', resultPath);

        console.log('\n🎉 测试编译完成！合约可以部署。');
        return true;

    } catch (error) {
        console.error('❌ 测试编译失败:', error.message);
        return false;
    }
}

if (require.main === module) {
    testCompile().catch(console.error);
}

module.exports = { testCompile };
