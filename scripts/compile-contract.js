#!/usr/bin/env node

/**
 * 智能合约编译脚本
 * 
 * 功能：
 * 1. 编译 StagedTokenFactory.sol 合约
 * 2. 提取 ABI 和字节码
 * 3. 生成部署所需的配置文件
 * 
 * 使用方法：
 * node scripts/compile-contract.js
 */

const fs = require('fs');
const path = require('path');
const solc = require('solc');

// 合约文件路径
const CONTRACT_PATH = path.join(__dirname, '..', 'contracts', 'Acon', 'StagedTokenFactory.sol');
const INTERFACES_PATH = path.join(__dirname, '..', 'contracts', 'Acon', 'Interfaces.sol');

/**
 * 读取合约源码
 */
function readContractSource(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`合约文件不存在: ${filePath}`);
    }
    return fs.readFileSync(filePath, 'utf8');
}

/**
 * 编译合约
 */
function compileContract() {
    console.log('📝 开始编译智能合约...');
    
    // 读取合约源码
    const stagedTokenFactorySource = readContractSource(CONTRACT_PATH);
    const interfacesSource = readContractSource(INTERFACES_PATH);
    
    // 准备编译输入
    const input = {
        language: 'Solidity',
        sources: {
            'StagedTokenFactory.sol': {
                content: stagedTokenFactorySource
            },
            'Interfaces.sol': {
                content: interfacesSource
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object']
                }
            },
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    };
    
    // 编译
    console.log('🔨 正在编译...');
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    // 检查编译错误
    if (output.errors) {
        const errors = output.errors.filter(error => error.severity === 'error');
        if (errors.length > 0) {
            console.error('❌ 编译失败:');
            errors.forEach(error => console.error(error.formattedMessage));
            throw new Error('合约编译失败');
        }
        
        // 显示警告
        const warnings = output.errors.filter(error => error.severity === 'warning');
        if (warnings.length > 0) {
            console.log('⚠️ 编译警告:');
            warnings.forEach(warning => console.log(warning.formattedMessage));
        }
    }
    
    console.log('✅ 编译成功!');
    return output;
}

/**
 * 提取合约信息
 */
function extractContractInfo(compiledOutput) {
    const contracts = compiledOutput.contracts['StagedTokenFactory.sol'];
    
    if (!contracts) {
        throw new Error('未找到编译后的合约');
    }
    
    const result = {};
    
    // 提取 StagedTokenFactory
    if (contracts.StagedTokenFactory) {
        result.StagedTokenFactory = {
            abi: contracts.StagedTokenFactory.abi,
            bytecode: '0x' + contracts.StagedTokenFactory.evm.bytecode.object,
            deployedBytecode: '0x' + contracts.StagedTokenFactory.evm.deployedBytecode.object
        };
    }
    
    // 提取 StagedCustomToken
    if (contracts.StagedCustomToken) {
        result.StagedCustomToken = {
            abi: contracts.StagedCustomToken.abi,
            bytecode: '0x' + contracts.StagedCustomToken.evm.bytecode.object,
            deployedBytecode: '0x' + contracts.StagedCustomToken.evm.deployedBytecode.object
        };
    }
    
    return result;
}

/**
 * 保存编译结果
 */
function saveCompiledContracts(contractInfo) {
    const outputDir = path.join(__dirname, '..', 'compiled');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 保存完整的编译信息
    const fullOutputPath = path.join(outputDir, 'contracts.json');
    fs.writeFileSync(fullOutputPath, JSON.stringify(contractInfo, null, 2));
    console.log(`📄 完整编译信息已保存: ${fullOutputPath}`);
    
    // 为每个合约单独保存文件
    Object.keys(contractInfo).forEach(contractName => {
        const contract = contractInfo[contractName];
        
        // 保存 ABI
        const abiPath = path.join(outputDir, `${contractName}.abi.json`);
        fs.writeFileSync(abiPath, JSON.stringify(contract.abi, null, 2));
        
        // 保存字节码
        const bytecodePath = path.join(outputDir, `${contractName}.bytecode.txt`);
        fs.writeFileSync(bytecodePath, contract.bytecode);
        
        console.log(`📄 ${contractName} ABI: ${abiPath}`);
        console.log(`📄 ${contractName} 字节码: ${bytecodePath}`);
    });
    
    return fullOutputPath;
}

/**
 * 生成部署配置文件
 */
function generateDeploymentConfig(contractInfo) {
    const config = {
        timestamp: new Date().toISOString(),
        compiler: {
            version: solc.version(),
            optimizer: {
                enabled: true,
                runs: 200
            }
        },
        contracts: contractInfo,
        networks: {
            bscTestnet: {
                chainId: 97,
                rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
                blockExplorer: 'https://testnet.bscscan.com'
            }
        }
    };
    
    const configPath = path.join(__dirname, '..', 'compiled', 'deployment-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`📄 部署配置已保存: ${configPath}`);
    
    return configPath;
}

/**
 * 更新部署脚本中的字节码
 */
function updateDeploymentScript(contractInfo) {
    const deployScriptPath = path.join(__dirname, 'deploy-staged-token-factory.js');
    
    if (!fs.existsSync(deployScriptPath)) {
        console.log('⚠️ 部署脚本不存在，跳过更新');
        return;
    }
    
    let scriptContent = fs.readFileSync(deployScriptPath, 'utf8');
    
    // 更新字节码
    if (contractInfo.StagedTokenFactory) {
        const oldBytecode = 'const STAGED_TOKEN_FACTORY_BYTECODE = "0x608060405234801561001057600080fd5b50..."; // 实际字节码需要编译获得';
        const newBytecode = `const STAGED_TOKEN_FACTORY_BYTECODE = "${contractInfo.StagedTokenFactory.bytecode}";`;
        
        scriptContent = scriptContent.replace(oldBytecode, newBytecode);
        
        // 更新ABI（如果需要）
        const abiString = JSON.stringify(contractInfo.StagedTokenFactory.abi, null, 4);
        // 这里可以添加ABI更新逻辑，但由于ABI较长，暂时跳过自动更新
    }
    
    fs.writeFileSync(deployScriptPath, scriptContent);
    console.log(`✅ 部署脚本已更新: ${deployScriptPath}`);
}

/**
 * 主函数
 */
async function main() {
    try {
        console.log('🚀 智能合约编译脚本启动');
        console.log('='.repeat(50));
        
        // 检查 solc 是否安装
        try {
            console.log(`📋 Solidity 编译器版本: ${solc.version()}`);
        } catch (error) {
            throw new Error('Solidity 编译器未安装，请运行: npm install solc');
        }
        
        // 编译合约
        const compiledOutput = compileContract();
        
        // 提取合约信息
        const contractInfo = extractContractInfo(compiledOutput);
        
        // 保存编译结果
        const outputPath = saveCompiledContracts(contractInfo);
        
        // 生成部署配置
        const configPath = generateDeploymentConfig(contractInfo);
        
        // 更新部署脚本
        updateDeploymentScript(contractInfo);
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 编译完成!');
        console.log('='.repeat(50));
        console.log(`📁 输出目录: ${path.dirname(outputPath)}`);
        console.log(`📄 配置文件: ${configPath}`);
        console.log('\n📖 下一步:');
        console.log('   运行部署脚本: node scripts/deploy-staged-token-factory.js');
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('❌ 编译失败:', error.message);
        process.exit(1);
    }
}

// 脚本入口
if (require.main === module) {
    main();
}

module.exports = {
    compileContract,
    extractContractInfo,
    saveCompiledContracts
};
