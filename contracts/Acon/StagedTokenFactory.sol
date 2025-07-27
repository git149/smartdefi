// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Interfaces.sol";

/**
 * @title StagedCustomToken
 * @dev 基于FEG SmartDeFi分阶段初始化模式的代币合约
 * 解决构造函数复杂性导致的部署失败问题
 */
contract StagedCustomToken is ERC20, Ownable {

    // === 阶段状态管理 ===
    enum InitStage {
        BASIC,          // 基础初始化完成
        DEX_READY,      // DEX配置完成
        FULLY_ACTIVE    // 完全激活
    }

    // === 第一优先级扩展配置结构体 ===
    struct BasicAdvancedConfig {
        address feeRecipient;      // 费用接收地址，address(0)表示使用默认值（代币创建者）
        uint256 maxTxPercent;      // 最大交易限制百分比（1-100），0表示使用默认值（100，无限制）
        uint256 maxWalletPercent;  // 最大钱包持有限制百分比（1-100），0表示使用默认值（100，无限制）
        uint256 swapThreshold;     // 自动swap阈值，0表示使用默认值（总供应量/10000）
    }
    
    InitStage public currentStage = InitStage.BASIC;
    bool public tradingEnabled = false;
    bool private swapIng;

    // === 基础配置 ===
    uint256 public feeBuy;
    uint256 public feeSell;
    uint256 public minSwapFee = 100 ether;
    address public factoryAddress;

    // === 第一优先级扩展参数 ===
    address public feeRecipient;        // 费用接收地址
    uint256 public maxTxAmount;         // 最大交易数量
    uint256 public maxWalletAmount;     // 最大钱包持有数量
    uint256 public swapThreshold;       // 自动swap阈值

    // === DEX配置 (阶段2初始化) ===
    IPancakeRouter02 public router;
    address private WBNB;
    address private USDT;
    address public pairBNB;
    address public pairUSDT;
    
    // === 映射和列表 ===
    mapping(address => bool) public _autoPair;
    mapping(address => bool) private excludeFeeList;

    // === 事件定义 ===
    event StageAdvanced(InitStage newStage, uint256 timestamp);
    event DEXIntegrationCompleted(address pairBNB, address pairUSDT);
    event TradingEnabled(uint256 timestamp);
    event AdvancedConfigSet(address feeRecipient, uint256 maxTxAmount, uint256 maxWalletAmount, uint256 swapThreshold);

    /**
     * @dev 阶段1：基础构造函数 - 支持第一优先级扩展参数
     * 遵循FEG SmartDeFi的分阶段初始化模式，同时添加低风险的高级功能
     * @param _name 代币名称
     * @param _symbol 代币符号
     * @param _totalSupply 总供应量
     * @param _owner 代币所有者
     * @param _feeBuy 买入费用（0-10%）
     * @param _feeSell 卖出费用（0-10%）
     * @param _config 高级配置参数，使用默认值请传入零值
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        address _owner,
        uint256 _feeBuy,
        uint256 _feeSell,
        BasicAdvancedConfig memory _config
    ) ERC20(_name, _symbol) Ownable() {
        // 基础参数验证
        require(_feeBuy <= 10, "Buy fee too high");
        require(_feeSell <= 10, "Sell fee too high");
        require(_totalSupply > 0, "Invalid total supply");

        // 转移所有权给指定地址
        _transferOwnership(_owner);

        // 设置基础配置
        feeBuy = _feeBuy;
        feeSell = _feeSell;
        factoryAddress = msg.sender;

        // 计算实际总供应量
        uint256 totalSupply = _totalSupply * 10**decimals();

        // 配置第一优先级扩展参数
        _configureAdvancedBasics(_config, _owner, totalSupply);

        // 设置费用豁免
        excludeFeeList[address(this)] = true;
        excludeFeeList[_owner] = true;
        excludeFeeList[factoryAddress] = true;
        excludeFeeList[feeRecipient] = true; // 费用接收地址也豁免费用

        // 简单的代币分配 - 100%给所有者
        _mint(_owner, totalSupply);

        emit StageAdvanced(InitStage.BASIC, block.timestamp);
    }

    /**
     * @dev 配置第一优先级扩展参数
     * @param _config 高级配置参数
     * @param _owner 代币所有者地址
     * @param _totalSupply 代币总供应量
     */
    function _configureAdvancedBasics(
        BasicAdvancedConfig memory _config,
        address _owner,
        uint256 _totalSupply
    ) private {
        // 配置费用接收地址
        feeRecipient = _config.feeRecipient != address(0) ? _config.feeRecipient : _owner;

        // 配置最大交易限制（百分比转换为实际数量）
        uint256 maxTxPercent = _config.maxTxPercent == 0 ? 100 : _config.maxTxPercent;
        require(maxTxPercent >= 1 && maxTxPercent <= 100, "Invalid max tx percent");
        maxTxAmount = (_totalSupply * maxTxPercent) / 100;

        // 配置最大钱包持有限制（百分比转换为实际数量）
        uint256 maxWalletPercent = _config.maxWalletPercent == 0 ? 100 : _config.maxWalletPercent;
        require(maxWalletPercent >= 1 && maxWalletPercent <= 100, "Invalid max wallet percent");
        maxWalletAmount = (_totalSupply * maxWalletPercent) / 100;

        // 配置自动swap阈值
        swapThreshold = _config.swapThreshold == 0 ? _totalSupply / 10000 : _config.swapThreshold;
        require(swapThreshold <= _totalSupply / 100, "Swap threshold too high");

        // 发出配置事件
        emit AdvancedConfigSet(feeRecipient, maxTxAmount, maxWalletAmount, swapThreshold);
    }

    /**
     * @dev 阶段2：DEX集成初始化 - 安全地设置DEX配置
     * 类似FEG的afterConstructor模式
     */
    function initializeDEX(
        address _router,
        address _wbnb,
        address _usdt
    ) external onlyOwner {
        require(currentStage == InitStage.BASIC, "Wrong stage");
        require(_router != address(0), "Invalid router");
        require(_wbnb != address(0), "Invalid WBNB");
        require(_usdt != address(0), "Invalid USDT");

        // 存储DEX配置但不立即创建交易对
        router = IPancakeRouter02(_router);
        WBNB = _wbnb;
        USDT = _usdt;

        // 推进到下一阶段
        currentStage = InitStage.DEX_READY;
        emit StageAdvanced(InitStage.DEX_READY, block.timestamp);
    }

    /**
     * @dev 阶段3：创建交易对 - 在安全的环境中创建交易对
     * 分离交易对创建逻辑，避免构造函数失败
     */
    function createTradingPairs() external onlyOwner {
        require(currentStage == InitStage.DEX_READY, "Wrong stage");
        require(address(router) != address(0), "DEX not initialized");

        IPancakeFactory factory = IPancakeFactory(router.factory());
        
        // 安全创建BNB交易对
        pairBNB = factory.getPair(address(this), WBNB);
        if (pairBNB == address(0)) {
            pairBNB = factory.createPair(address(this), WBNB);
        }
        require(pairBNB != address(0), "BNB pair creation failed");

        // 安全创建USDT交易对
        pairUSDT = factory.getPair(address(this), USDT);
        if (pairUSDT == address(0)) {
            pairUSDT = factory.createPair(address(this), USDT);
        }
        require(pairUSDT != address(0), "USDT pair creation failed");

        // 设置自动交易对
        _autoPair[pairBNB] = true;
        _autoPair[pairUSDT] = true;

        // 推进到完全激活状态
        currentStage = InitStage.FULLY_ACTIVE;
        emit DEXIntegrationCompleted(pairBNB, pairUSDT);
        emit StageAdvanced(InitStage.FULLY_ACTIVE, block.timestamp);
    }

    /**
     * @dev 启用交易 - 只有在完全激活后才能启用
     */
    function enableTrading() external onlyOwner {
        require(currentStage == InitStage.FULLY_ACTIVE, "DEX not ready");
        require(!tradingEnabled, "Already enabled");
        
        tradingEnabled = true;
        emit TradingEnabled(block.timestamp);
    }

    /**
     * @dev 重写转账函数 - 实现费用机制和交易限制
     * 只有在DEX集成完成后才应用复杂逻辑
     */
    function _transfer(address from, address to, uint256 amount) internal virtual override {
        // 阶段1：基础转账，应用基础限制但无费用
        if (currentStage == InitStage.BASIC) {
            _applyBasicLimits(from, to, amount);
            super._transfer(from, to, amount);
            return;
        }

        // 阶段2+：应用费用机制和完整限制
        if (!tradingEnabled && !isExcludeFee(from) && !isExcludeFee(to)) {
            require(from == address(0) || to == address(0), "Trading not enabled");
        }

        // 如果是铸造/销毁或豁免账户，直接转账
        if (from == address(0) || to == address(0) ||
            isExcludeFee(from) || isExcludeFee(to)) {
            super._transfer(from, to, amount);
            return;
        }

        // 应用交易限制
        _applyBasicLimits(from, to, amount);

        // 应用费用逻辑（仅在完全激活状态）
        if (currentStage == InitStage.FULLY_ACTIVE &&
            (_autoPair[from] || _autoPair[to])) {

            uint256 feeRate = _autoPair[to] ? feeSell : feeBuy; // 卖出或买入
            uint256 feeAmount = (amount * feeRate) / 100;
            uint256 transferAmount = amount - feeAmount;

            if (feeAmount > 0) {
                super._transfer(from, feeRecipient, feeAmount); // 费用发送到指定接收地址
            }
            super._transfer(from, to, transferAmount);
        } else {
            super._transfer(from, to, amount);
        }
    }

    /**
     * @dev 应用基础交易限制
     * @param from 发送地址
     * @param to 接收地址
     * @param amount 转账数量
     */
    function _applyBasicLimits(address from, address to, uint256 amount) private view {
        // 跳过铸造/销毁和豁免账户
        if (from == address(0) || to == address(0) ||
            isExcludeFee(from) || isExcludeFee(to)) {
            return;
        }

        // 检查最大交易限制
        if (maxTxAmount < totalSupply()) { // 只有在设置了限制时才检查
            require(amount <= maxTxAmount, "Transfer amount exceeds max tx");
        }

        // 检查最大钱包持有限制（仅对接收方）
        if (maxWalletAmount < totalSupply() && to != address(0)) { // 只有在设置了限制时才检查
            require(balanceOf(to) + amount <= maxWalletAmount, "Transfer would exceed max wallet");
        }
    }

    // === 管理函数 ===

    /**
     * @dev 设置费用豁免
     */
    function setExcludeFee(address account, bool excluded) external onlyOwner {
        excludeFeeList[account] = excluded;
    }

    /**
     * @dev 批量设置费用豁免
     */
    function setExcludeFeeBatch(address[] calldata accounts, bool excluded) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            excludeFeeList[accounts[i]] = excluded;
        }
    }

    /**
     * @dev 更新费用
     */
    function updateFees(uint256 _feeBuy, uint256 _feeSell) external onlyOwner {
        require(_feeBuy <= 10, "Buy fee too high");
        require(_feeSell <= 10, "Sell fee too high");

        feeBuy = _feeBuy;
        feeSell = _feeSell;
    }

    /**
     * @dev 更新费用接收地址
     */
    function updateFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");

        // 移除旧地址的费用豁免，添加新地址的费用豁免
        excludeFeeList[feeRecipient] = false;
        excludeFeeList[_feeRecipient] = true;

        feeRecipient = _feeRecipient;
    }

    /**
     * @dev 更新交易限制
     */
    function updateTradingLimits(uint256 _maxTxPercent, uint256 _maxWalletPercent) external onlyOwner {
        require(_maxTxPercent >= 1 && _maxTxPercent <= 100, "Invalid max tx percent");
        require(_maxWalletPercent >= 1 && _maxWalletPercent <= 100, "Invalid max wallet percent");

        uint256 _totalSupply = totalSupply();
        maxTxAmount = (_totalSupply * _maxTxPercent) / 100;
        maxWalletAmount = (_totalSupply * _maxWalletPercent) / 100;
    }

    /**
     * @dev 更新自动swap阈值
     */
    function updateSwapThreshold(uint256 _swapThreshold) external onlyOwner {
        require(_swapThreshold <= totalSupply() / 100, "Swap threshold too high");
        swapThreshold = _swapThreshold;
    }

    /**
     * @dev 提取合约中的代币费用
     */
    function withdrawFees() external onlyOwner {
        uint256 contractBalance = balanceOf(address(this));
        require(contractBalance > 0, "No fees to withdraw");

        _transfer(address(this), owner(), contractBalance);
    }

    // === 查询函数 ===

    /**
     * @dev 检查是否费用豁免
     */
    function isExcludeFee(address account) public view returns (bool) {
        return excludeFeeList[account];
    }

    /**
     * @dev 获取当前阶段信息
     */
    function getStageInfo() external view returns (
        InitStage stage,
        bool dexReady,
        bool tradingActive,
        address bnbPair,
        address usdtPair
    ) {
        return (
            currentStage,
            currentStage >= InitStage.DEX_READY,
            tradingEnabled,
            pairBNB,
            pairUSDT
        );
    }

    /**
     * @dev 获取高级配置信息
     */
    function getAdvancedConfig() external view returns (
        address _feeRecipient,
        uint256 _maxTxAmount,
        uint256 _maxWalletAmount,
        uint256 _swapThreshold,
        uint256 _maxTxPercent,
        uint256 _maxWalletPercent
    ) {
        uint256 _totalSupply = totalSupply();
        return (
            feeRecipient,
            maxTxAmount,
            maxWalletAmount,
            swapThreshold,
            _totalSupply > 0 ? (maxTxAmount * 100) / _totalSupply : 100,
            _totalSupply > 0 ? (maxWalletAmount * 100) / _totalSupply : 100
        );
    }

    /**
     * @dev 检查是否可以进行下一阶段
     */
    function canAdvanceStage() external view returns (bool, string memory) {
        if (currentStage == InitStage.BASIC) {
            return (true, "Ready for DEX initialization");
        } else if (currentStage == InitStage.DEX_READY) {
            return (address(router) != address(0), "DEX configuration required");
        } else {
            return (false, "Already fully active");
        }
    }

    /**
     * @dev 接收ETH
     */
    receive() external payable {}
}

/**
 * @title StagedTokenFactory
 * @dev 基于FEG分阶段初始化模式的代币工厂
 * 解决复杂构造函数导致的部署失败问题
 */
contract StagedTokenFactory is Ownable {

    // === 状态变量 ===
    bool public factoryEnabled = true;
    uint256 public creationFee = 0.03 ether; // 降低费用
    uint256 public totalTokensCreated = 0;

    // === 网络配置 ===
    struct NetworkConfig {
        address router;
        address wbnb;
        address usdt;
        bool enabled;
    }

    mapping(uint256 => NetworkConfig) public networkConfigs;
    mapping(address => address) public tokenCreators;
    mapping(address => bool) public isFactoryToken;
    address[] public allTokens;

    // === 事件定义 ===
    event TokenCreated(
        address indexed token,
        address indexed creator,
        string name,
        string symbol,
        uint256 totalSupply,
        uint256 timestamp
    );
    event TokenDEXInitialized(address indexed token, address creator);
    event TokenFullyActivated(address indexed token, address creator);

    constructor() Ownable() {
        // BSC 测试网配置
        networkConfigs[97] = NetworkConfig({
            router: 0xB6BA90af76D139AB3170c7df0139636dB6120F7e,
            wbnb: 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd,
            usdt: 0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684,
            enabled: true
        });
    }

    /**
     * @dev 阶段1：创建基础代币 (极简，提高成功率) - 向后兼容版本
     */
    function createToken(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _feeBuy,
        uint256 _feeSell
    ) external payable returns (address) {
        // 使用默认配置创建代币
        StagedCustomToken.BasicAdvancedConfig memory defaultConfig = StagedCustomToken.BasicAdvancedConfig({
            feeRecipient: address(0),    // 使用默认值（代币创建者）
            maxTxPercent: 0,             // 使用默认值（100%，无限制）
            maxWalletPercent: 0,         // 使用默认值（100%，无限制）
            swapThreshold: 0             // 使用默认值（总供应量/10000）
        });

        return _createTokenWithConfig(_name, _symbol, _totalSupply, _feeBuy, _feeSell, defaultConfig);
    }

    /**
     * @dev 阶段1：创建高级配置代币 (支持第一优先级扩展参数)
     */
    function createAdvancedToken(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _feeBuy,
        uint256 _feeSell,
        StagedCustomToken.BasicAdvancedConfig memory _config
    ) external payable returns (address) {
        // 高级功能需要额外费用（20%）
        require(msg.value >= creationFee * 120 / 100, "Insufficient fee for advanced features");

        return _createTokenWithConfig(_name, _symbol, _totalSupply, _feeBuy, _feeSell, _config);
    }

    /**
     * @dev 内部函数：使用配置创建代币
     */
    function _createTokenWithConfig(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _feeBuy,
        uint256 _feeSell,
        StagedCustomToken.BasicAdvancedConfig memory _config
    ) private returns (address) {
        require(factoryEnabled, "Factory disabled");
        require(msg.value >= creationFee, "Insufficient fee");
        require(_totalSupply > 0, "Invalid supply");
        require(_feeBuy <= 10 && _feeSell <= 10, "Fee too high");

        // 创建代币 - 支持高级配置
        StagedCustomToken token = new StagedCustomToken(
            _name,
            _symbol,
            _totalSupply,
            msg.sender,
            _feeBuy,
            _feeSell,
            _config
        );

        // 记录信息
        address tokenAddress = address(token);
        tokenCreators[tokenAddress] = msg.sender;
        isFactoryToken[tokenAddress] = true;
        allTokens.push(tokenAddress);
        totalTokensCreated++;

        emit TokenCreated(
            tokenAddress,
            msg.sender,
            _name,
            _symbol,
            _totalSupply,
            block.timestamp
        );

        return tokenAddress;
    }

    /**
     * @dev 阶段2：初始化DEX配置 (可选，由用户决定)
     */
    function initializeTokenDEX(address tokenAddress) external {
        require(isFactoryToken[tokenAddress], "Not factory token");
        require(tokenCreators[tokenAddress] == msg.sender, "Not token creator");

        uint256 chainId = block.chainid;
        NetworkConfig memory config = networkConfigs[chainId];
        require(config.enabled, "Chain not supported");

        StagedCustomToken token = StagedCustomToken(payable(tokenAddress));
        token.initializeDEX(config.router, config.wbnb, config.usdt);

        emit TokenDEXInitialized(tokenAddress, msg.sender);
    }

    /**
     * @dev 阶段3：创建交易对并完全激活 (高级功能)
     */
    function activateTokenTrading(address tokenAddress) external {
        require(isFactoryToken[tokenAddress], "Not factory token");
        require(tokenCreators[tokenAddress] == msg.sender, "Not token creator");

        StagedCustomToken token = StagedCustomToken(payable(tokenAddress));

        // 创建交易对
        token.createTradingPairs();

        // 启用交易
        token.enableTrading();

        emit TokenFullyActivated(tokenAddress, msg.sender);
    }

    /**
     * @dev 一键完整部署 (高级用户使用，风险较高) - 基础版本
     */
    function createAndActivateToken(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _feeBuy,
        uint256 _feeSell
    ) external payable returns (address) {
        // 阶段1：创建基础代币
        address tokenAddress = this.createToken{value: msg.value}(
            _name, _symbol, _totalSupply, _feeBuy, _feeSell
        );

        // 阶段2：初始化DEX
        this.initializeTokenDEX(tokenAddress);

        // 阶段3：激活交易
        this.activateTokenTrading(tokenAddress);

        return tokenAddress;
    }

    /**
     * @dev 一键完整部署 (高级用户使用，风险较高) - 高级配置版本
     */
    function createAndActivateAdvancedToken(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _feeBuy,
        uint256 _feeSell,
        StagedCustomToken.BasicAdvancedConfig memory _config
    ) external payable returns (address) {
        // 阶段1：创建高级配置代币
        address tokenAddress = this.createAdvancedToken{value: msg.value}(
            _name, _symbol, _totalSupply, _feeBuy, _feeSell, _config
        );

        // 阶段2：初始化DEX
        this.initializeTokenDEX(tokenAddress);

        // 阶段3：激活交易
        this.activateTokenTrading(tokenAddress);

        return tokenAddress;
    }

    // === 管理员功能 ===

    function setNetworkConfig(
        uint256 _chainId,
        address _router,
        address _wbnb,
        address _usdt,
        bool _enabled
    ) external onlyOwner {
        networkConfigs[_chainId] = NetworkConfig({
            router: _router,
            wbnb: _wbnb,
            usdt: _usdt,
            enabled: _enabled
        });
    }

    function setFactoryEnabled(bool _enabled) external onlyOwner {
        factoryEnabled = _enabled;
    }

    function setCreationFee(uint256 _fee) external onlyOwner {
        creationFee = _fee;
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // === 查询功能 ===

    function getAllTokensLength() external view returns (uint256) {
        return allTokens.length;
    }

    function getTokens(uint256 _start, uint256 _end) external view returns (address[] memory) {
        require(_start < _end && _end <= allTokens.length, "Invalid range");

        address[] memory tokens = new address[](_end - _start);
        for (uint256 i = _start; i < _end; i++) {
            tokens[i - _start] = allTokens[i];
        }
        return tokens;
    }

    function getTokenStage(address tokenAddress) external view returns (
        StagedCustomToken.InitStage stage,
        bool dexReady,
        bool tradingActive
    ) {
        if (!isFactoryToken[tokenAddress]) {
            return (StagedCustomToken.InitStage.BASIC, false, false);
        }

        StagedCustomToken token = StagedCustomToken(payable(tokenAddress));
        (stage, dexReady, tradingActive,,) = token.getStageInfo();
        return (stage, dexReady, tradingActive);
    }

    receive() external payable {}
}
