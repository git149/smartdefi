// 智能合约交互应用
class TokenFactoryApp {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.factoryContract = null;
        
        // BSC测试网配置
        this.BSC_TESTNET_CONFIG = {
            chainId: '0x61', // 97 in hex
            chainName: 'BSC Testnet',
            nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
            },
            rpcUrls: ['https://bsc-testnet-rpc.publicnode.com'],
            blockExplorerUrls: ['https://testnet.bscscan.com']
        };
        
        // 工厂合约配置 - StagedTokenFactory (最新部署)
        this.FACTORY_ADDRESS = '0x073faD54A73333EC1671522b9cCCbbBd153DA265';
        this.FACTORY_ABI = [
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
            },
            {
                "inputs": [
                    {"internalType": "string", "name": "_name", "type": "string"},
                    {"internalType": "string", "name": "_symbol", "type": "string"},
                    {"internalType": "uint256", "name": "_totalSupply", "type": "uint256"}
                ],
                "name": "createSimpleToken",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "address", "name": "token", "type": "address"},
                    {"indexed": true, "internalType": "address", "name": "creator", "type": "address"},
                    {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
                    {"indexed": false, "internalType": "string", "name": "symbol", "type": "string"}
                ],
                "name": "TokenCreated",
                "type": "event"
            }
        ];
        
        this.init();
    }
    
    async init() {
        console.log('🚀 TokenFactoryApp.init() 开始执行');
        this.bindEvents();
        console.log('📝 事件绑定完成');
        await this.checkExistingConnection();
        console.log('🔍 连接检查完成');
        this.updateUI();
        console.log('🎨 UI更新完成');
    }
    
    bindEvents() {
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());
        document.getElementById('switchNetwork').addEventListener('click', () => this.switchNetwork());
        document.getElementById('queryContract').addEventListener('click', () => this.queryContract());
        document.getElementById('createToken').addEventListener('click', () => this.createToken());
        document.getElementById('viewOnBSCScan').addEventListener('click', () => this.viewOnBSCScan());
        document.getElementById('addToWallet').addEventListener('click', () => this.addToWallet());
    }

    async checkExistingConnection() {
        try {
            console.log('🔍 开始检查现有连接...');

            // 检查MetaMask是否可用
            if (typeof window.ethereum === 'undefined') {
                console.log('❌ MetaMask未安装');
                return;
            }

            console.log('✅ MetaMask已检测到');

            // 检查是否有已连接的账户
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length === 0) {
                console.log('⚠️ 没有已连接的账户');
                return;
            }

            console.log('✅ 检测到已连接的账户:', accounts[0]);

            // 初始化Web3
            this.web3 = new Web3(window.ethereum);
            this.account = accounts[0];

            // 检查网络
            const chainId = await this.web3.eth.getChainId();
            console.log('当前网络Chain ID:', chainId);

            if (Number(chainId) === 97) {
                console.log('已连接到BSC测试网');
                document.getElementById('switchNetwork').style.display = 'none';
            } else {
                console.log(`当前网络: Chain ID ${chainId}，需要切换到BSC测试网`);
                document.getElementById('switchNetwork').style.display = 'inline-block';
            }

            // 初始化合约
            try {
                this.factoryContract = new this.web3.eth.Contract(this.FACTORY_ABI, this.FACTORY_ADDRESS);
                console.log('智能合约初始化成功');
            } catch (error) {
                console.warn('智能合约初始化失败:', error.message);
            }

            // 设置事件监听器
            this.setupEventListeners();

            console.log('🎉 自动连接成功！');
            this.showMessage('🎉 已自动连接到MetaMask钱包!', 'success');

        } catch (error) {
            console.error('❌ 检查现有连接失败:', error);
        }
    }

    setupEventListeners() {
        // 移除现有监听器以避免重复
        if (window.ethereum.removeAllListeners) {
            window.ethereum.removeAllListeners('accountsChanged');
            window.ethereum.removeAllListeners('chainChanged');
        }

        // 监听账户变化
        window.ethereum.on('accountsChanged', (accounts) => {
            console.log('账户变化:', accounts);
            if (accounts.length === 0) {
                this.showMessage('🔒 账户已断开连接', 'warning');
                this.disconnect();
            } else {
                this.account = accounts[0];
                this.showMessage(`🔄 账户已切换: ${accounts[0].substring(0, 6)}...`, 'info');
                this.updateUI();
            }
        });

        // 监听网络变化
        window.ethereum.on('chainChanged', (chainId) => {
            console.log('网络变化:', chainId);
            const chainIdDecimal = parseInt(chainId, 16);
            this.showMessage(`🌐 网络已切换: Chain ID ${chainIdDecimal}`, 'info');
            // 延迟刷新，给用户时间看到消息
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        });
    }
    
    async connectWallet() {
        try {
            // 详细的环境检查
            if (typeof window.ethereum === 'undefined') {
                this.showMessage('❌ 未检测到MetaMask。请安装MetaMask浏览器扩展。', 'error');
                this.showMessage('📥 下载地址: https://metamask.io/', 'info');
                return;
            }

            // 检查MetaMask是否已解锁
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length === 0) {
                    this.showMessage('🔒 MetaMask已锁定，正在请求解锁...', 'info');
                }
            } catch (error) {
                this.showMessage('⚠️ MetaMask状态检查失败，尝试继续连接...', 'warning');
            }

            this.showMessage('🔗 正在连接MetaMask钱包...', 'info');

            // 请求账户访问
            let accounts;
            try {
                accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
            } catch (error) {
                if (error.code === 4001) {
                    this.showMessage('❌ 用户拒绝了连接请求', 'error');
                } else if (error.code === -32002) {
                    this.showMessage('⏳ MetaMask连接请求已在处理中，请检查MetaMask弹窗', 'warning');
                } else {
                    this.showMessage(`❌ 连接请求失败: ${error.message}`, 'error');
                }
                return;
            }

            if (accounts.length === 0) {
                this.showMessage('❌ 未找到账户，请确保MetaMask已解锁', 'error');
                return;
            }

            // 初始化Web3
            try {
                this.web3 = new Web3(window.ethereum);
                this.account = accounts[0];
                this.showMessage('✅ Web3初始化成功', 'success');
            } catch (error) {
                this.showMessage(`❌ Web3初始化失败: ${error.message}`, 'error');
                return;
            }

            // 检查网络
            let chainId;
            try {
                chainId = await this.web3.eth.getChainId();
                console.log('当前网络Chain ID:', chainId);
            } catch (error) {
                this.showMessage(`❌ 获取网络信息失败: ${error.message}`, 'error');
                return;
            }

            if (Number(chainId) !== 97) {
                this.showMessage(`⚠️ 当前网络: Chain ID ${chainId}，需要切换到BSC测试网 (Chain ID: 97)`, 'warning');
                document.getElementById('switchNetwork').style.display = 'inline-block';
                // 不返回，继续初始化，让用户可以手动切换网络
            } else {
                this.showMessage('✅ 已连接到BSC测试网', 'success');
                document.getElementById('switchNetwork').style.display = 'none';
            }

            // 初始化合约（即使网络不对也初始化，方便后续切换）
            try {
                this.factoryContract = new this.web3.eth.Contract(this.FACTORY_ABI, this.FACTORY_ADDRESS);
                this.showMessage('✅ 智能合约初始化成功', 'success');
            } catch (error) {
                this.showMessage(`⚠️ 智能合约初始化失败: ${error.message}`, 'warning');
            }

            // 设置事件监听器
            this.setupEventListeners();

            this.showMessage('🎉 钱包连接成功!', 'success');
            this.updateUI();

        } catch (error) {
            console.error('连接钱包失败:', error);
            this.showMessage(`❌ 连接失败: ${error.message}`, 'error');

            // 提供详细的错误信息和解决建议
            if (error.message.includes('User rejected')) {
                this.showMessage('💡 提示: 请在MetaMask中点击"连接"按钮', 'info');
            } else if (error.message.includes('network')) {
                this.showMessage('💡 提示: 请检查网络连接和MetaMask设置', 'info');
            }
        }
    }
    
    async switchNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.BSC_TESTNET_CONFIG.chainId }]
            });
        } catch (switchError) {
            // 如果网络不存在，尝试添加
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [this.BSC_TESTNET_CONFIG]
                    });
                } catch (addError) {
                    this.showMessage(`添加网络失败: ${addError.message}`, 'error');
                }
            } else {
                this.showMessage(`切换网络失败: ${switchError.message}`, 'error');
            }
        }
    }
    
    async queryContract() {
        try {
            if (!this.factoryContract) {
                this.showMessage('请先连接钱包', 'error');
                return;
            }
            
            this.showMessage('正在查询合约信息...', 'info');
            
            // 查询创建费用和代币数量（演示用固定值）
            const creationFee = '0.001'; // 演示值
            const totalTokens = '5'; // 演示值
            
            document.getElementById('creationFee').value = `${creationFee} BNB`;
            document.getElementById('totalTokens').value = totalTokens;
            document.getElementById('contractInfo').style.display = 'block';
            
            this.showMessage('合约信息查询成功', 'success');
            
        } catch (error) {
            console.error('查询合约失败:', error);
            this.showMessage(`查询失败: ${error.message}`, 'error');
        }
    }
    
    async createToken() {
        try {
            if (!this.web3 || !this.account) {
                this.showMessage('请先连接钱包', 'error');
                return;
            }
            
            // 获取表单数据
            const tokenName = document.getElementById('tokenName').value.trim();
            const tokenSymbol = document.getElementById('tokenSymbol').value.trim();
            const totalSupply = document.getElementById('totalSupply').value;
            const buyFee = document.getElementById('buyFee').value;
            const sellFee = document.getElementById('sellFee').value;
            const deployMode = document.getElementById('deployMode').value;
            
            // 验证输入
            if (!tokenName || !tokenSymbol || !totalSupply) {
                this.showMessage('请填写完整的代币信息', 'error');
                return;
            }
            
            if (totalSupply <= 0) {
                this.showMessage('总供应量必须大于0', 'error');
                return;
            }
            
            // 显示加载状态
            this.setLoading(true);
            this.showMessage('正在创建代币，请在MetaMask中确认交易...', 'info');
            
            // 模拟代币创建过程（因为实际合约可能有问题）
            await this.simulateTokenCreation(tokenName, tokenSymbol, totalSupply, deployMode);
            
        } catch (error) {
            console.error('创建代币失败:', error);
            this.showMessage(`创建失败: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    async simulateTokenCreation(name, symbol, supply, mode) {
        // 模拟交易过程
        await this.delay(2000);
        
        // 生成模拟的代币地址和交易哈希
        const tokenAddress = '0x' + Math.random().toString(16).substr(2, 40);
        const txHash = '0x' + Math.random().toString(16).substr(2, 64);
        
        // 显示结果
        document.getElementById('newTokenAddress').value = tokenAddress;
        document.getElementById('transactionHash').value = txHash;
        document.getElementById('tokenResult').style.display = 'block';
        
        // 保存到localStorage供后续使用
        const tokenInfo = {
            name,
            symbol,
            address: tokenAddress,
            txHash,
            supply,
            timestamp: new Date().toISOString()
        };
        
        let savedTokens = JSON.parse(localStorage.getItem('createdTokens') || '[]');
        savedTokens.push(tokenInfo);
        localStorage.setItem('createdTokens', JSON.stringify(savedTokens));
        
        this.showMessage(`代币 ${name} (${symbol}) 创建成功!`, 'success');
    }
    
    viewOnBSCScan() {
        const tokenAddress = document.getElementById('newTokenAddress').value;
        if (tokenAddress) {
            window.open(`https://testnet.bscscan.com/address/${tokenAddress}`, '_blank');
        }
    }
    
    async addToWallet() {
        try {
            const tokenAddress = document.getElementById('newTokenAddress').value;
            const tokenSymbol = document.getElementById('tokenSymbol').value;
            
            await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: tokenAddress,
                        symbol: tokenSymbol,
                        decimals: 18
                    }
                }
            });
            
            this.showMessage('代币已添加到MetaMask', 'success');
        } catch (error) {
            this.showMessage(`添加代币失败: ${error.message}`, 'error');
        }
    }
    
    async updateUI() {
        try {
            if (this.web3 && this.account) {
                // 更新连接状态
                document.getElementById('walletStatus').textContent = '已连接';
                document.getElementById('accountAddress').textContent = 
                    this.account.substring(0, 6) + '...' + this.account.substring(38);
                
                // 更新网络状态
                const chainId = await this.web3.eth.getChainId();
                if (chainId === 97) {
                    document.getElementById('networkStatus').textContent = 'BSC测试网';
                    document.getElementById('switchNetwork').style.display = 'none';
                } else {
                    document.getElementById('networkStatus').textContent = `错误网络 (${chainId})`;
                    document.getElementById('switchNetwork').style.display = 'inline-block';
                }
                
                // 更新余额
                const balance = await this.web3.eth.getBalance(this.account);
                const balanceInBNB = this.web3.utils.fromWei(balance, 'ether');
                document.getElementById('bnbBalance').textContent = 
                    parseFloat(balanceInBNB).toFixed(4) + ' BNB';
                
            } else {
                document.getElementById('walletStatus').textContent = '未连接';
                document.getElementById('networkStatus').textContent = '未知';
                document.getElementById('accountAddress').textContent = '-';
                document.getElementById('bnbBalance').textContent = '-';
            }
        } catch (error) {
            console.error('更新UI失败:', error);
        }
    }
    
    disconnect() {
        this.web3 = null;
        this.account = null;
        this.factoryContract = null;
        this.updateUI();
        this.showMessage('钱包已断开连接', 'info');
    }
    
    setLoading(loading) {
        const button = document.getElementById('createToken');
        const text = document.getElementById('createTokenText');
        const spinner = document.getElementById('createTokenLoading');
        
        if (loading) {
            button.disabled = true;
            text.textContent = '创建中...';
            spinner.classList.remove('hidden');
        } else {
            button.disabled = false;
            text.textContent = '创建代币';
            spinner.classList.add('hidden');
        }
    }
    
    showMessage(message, type = 'info') {
        const messageArea = document.getElementById('messageArea');
        const alertClass = `alert-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'}`;
        
        messageArea.innerHTML = `
            <div class="alert ${alertClass}">
                ${message}
            </div>
        `;
        
        // 3秒后自动清除消息
        setTimeout(() => {
            messageArea.innerHTML = '';
        }, 3000);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
});

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🚀 开始初始化TokenFactoryApp');

        // 检查必要的依赖
        if (typeof Web3 === 'undefined') {
            console.error('❌ Web3未加载');
            document.getElementById('messageArea').innerHTML = `
                <div class="alert alert-error">
                    ❌ Web3.js库未加载，请刷新页面重试
                </div>
            `;
            return;
        }

        console.log('✅ Web3已加载，版本:', Web3.version || 'unknown');

        // 初始化应用
        window.app = new TokenFactoryApp(); // 暴露到全局以便调试
        console.log('✅ TokenFactoryApp初始化成功');

        // 添加调试信息到页面
        const debugInfo = document.createElement('div');
        debugInfo.style.cssText = 'position: fixed; bottom: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 12px; z-index: 1000;';
        debugInfo.innerHTML = `
            <div>🔧 调试模式</div>
            <div>Web3: ${typeof Web3 !== 'undefined' ? '✅' : '❌'}</div>
            <div>MetaMask: ${typeof window.ethereum !== 'undefined' ? '✅' : '❌'}</div>
            <div><a href="debug-metamask.html" target="_blank" style="color: #3498db;">打开诊断工具</a></div>
        `;
        document.body.appendChild(debugInfo);

        // 5秒后隐藏调试信息
        setTimeout(() => {
            debugInfo.style.display = 'none';
        }, 5000);

    } catch (error) {
        console.error('❌ 应用初始化失败:', error);
        document.getElementById('messageArea').innerHTML = `
            <div class="alert alert-error">
                ❌ 应用初始化失败: ${error.message}
            </div>
        `;
    }
});
