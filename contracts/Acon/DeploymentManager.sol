// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

// 导入我们的工厂合约
import "./StagedTokenFactory.sol";
import "./PresaleManager.sol";

/**
 * @title DeploymentManager
 * @dev 统一部署管理合约，基于FEG SmartDeFi架构设计
 * 提供一站式代币发行和预售创建服务
 */
contract DeploymentManager is Ownable {

    // === 工厂合约地址 ===
    StagedTokenFactory public tokenFactory;
    PresaleFactory public presaleFactory;

    // === 部署记录 ===
    struct DeploymentRecord {
        address token;          // 代币地址
        address presale;        // 预售地址
        address creator;        // 创建者
        uint256 timestamp;      // 创建时间
        bool active;           // 是否活跃
    }

    mapping(address => DeploymentRecord) public deployments; // 创建者 => 部署记录
    mapping(address => address) public tokenToCreator;      // 代币 => 创建者
    address[] public allDeployments;                        // 所有部署记录

    // === 网络配置 ===
    struct ChainConfig {
        string name;            // 链名称
        address router;         // DEX路由器
        address wbnb;          // 包装代币
        address usdt;          // 稳定币
        uint256 chainId;       // 链ID
        bool supported;        // 是否支持
    }

    mapping(uint256 => ChainConfig) public chainConfigs;
    uint256[] public supportedChains;

    // === 费用配置 ===
    uint256 public deploymentFee = 0.15 ether; // 总部署费用
    uint256 public platformFeeRate = 1000;     // 平台费用率 10%
    address public feeRecipient;               // 费用接收地址

    // === 事件定义 ===
    event FullDeploymentCreated(
        address indexed creator,
        address indexed token,
        address indexed presale,
        string tokenName,
        string tokenSymbol,
        uint256 timestamp
    );
    event ChainConfigUpdated(uint256 chainId, string name, address router);
    event DeploymentFeeUpdated(uint256 newFee);

    constructor() Ownable() {
        feeRecipient = msg.sender;

        // 部署工厂合约
        tokenFactory = new StagedTokenFactory();
        presaleFactory = new PresaleFactory();

        // 初始化链配置
        _initializeChainConfigs();
    }

    /**
     * @dev 初始化链配置
     */
    function _initializeChainConfigs() private {
        // BSC 主网
        chainConfigs[56] = ChainConfig({
            name: "BSC Mainnet",
            router: 0x10ED43C718714eb63d5aA57B78B54704E256024E,
            wbnb: 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c,
            usdt: 0x55d398326f99059fF775485246999027B3197955,
            chainId: 56,
            supported: true
        });
        supportedChains.push(56);

        // BSC 测试网
        chainConfigs[97] = ChainConfig({
            name: "BSC Testnet",
            router: 0xD99D1c33F9fC3444f8101754aBC46c52416550D1,
            wbnb: 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd,
            usdt: 0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684,
            chainId: 97,
            supported: true
        });
        supportedChains.push(97);

        // TRON 主网 (示例配置)
        chainConfigs[728126428] = ChainConfig({
            name: "TRON Mainnet",
            router: address(0), // 需要配置TRON的DEX路由器
            wbnb: address(0),   // WTRX地址
            usdt: address(0),   // USDT-TRC20地址
            chainId: 728126428,
            supported: false    // 暂不支持，需要适配
        });
    }

    /**
     * @dev 一键部署代币和预售系统
     * @param tokenParams 代币参数 [name, symbol, totalSupply, feeBuy, feeSell]
     * @param presaleParams 预售参数 [presaleEthAmount, tradeEthAmount, maxTotalNum, presaleMaxNum, marketDisAmount]
     */
    function deployTokenAndPresale(
        string[] memory tokenParams,    // [name, symbol]
        uint256[] memory tokenValues,   // [totalSupply, feeBuy, feeSell]
        uint256[] memory presaleParams  // [presaleEthAmount, tradeEthAmount, maxTotalNum, presaleMaxNum, marketDisAmount]
    ) external payable returns (address token, address presale) {
        require(msg.value >= deploymentFee, "Insufficient deployment fee");
        require(deployments[msg.sender].token == address(0), "Already deployed");
        require(tokenParams.length == 2, "Invalid token params");
        require(tokenValues.length == 3, "Invalid token values");
        require(presaleParams.length == 5, "Invalid presale params");

        uint256 chainId = block.chainid;
        require(chainConfigs[chainId].supported, "Chain not supported");

        // 计算费用分配
        uint256 tokenCreationFee = tokenFactory.creationFee();
        uint256 presaleCreationFee = presaleFactory.creationFee();
        uint256 totalRequiredFee = tokenCreationFee + presaleCreationFee;

        require(msg.value >= totalRequiredFee, "Insufficient fee for factories");

        // 创建代币
        token = tokenFactory.createToken{value: tokenCreationFee}(
            tokenParams[0],  // name
            tokenParams[1],  // symbol
            tokenValues[0],  // totalSupply
            tokenValues[1],  // feeBuy
            tokenValues[2]   // feeSell
        );

        // 创建预售
        presale = presaleFactory.createPresale{value: presaleCreationFee}(
            token,
            presaleParams[0], // presaleEthAmount
            presaleParams[1], // tradeEthAmount
            presaleParams[2], // maxTotalNum
            presaleParams[3], // presaleMaxNum
            presaleParams[4]  // marketDisAmount
        );

        // 记录部署信息
        deployments[msg.sender] = DeploymentRecord({
            token: token,
            presale: presale,
            creator: msg.sender,
            timestamp: block.timestamp,
            active: true
        });

        tokenToCreator[token] = msg.sender;
        allDeployments.push(msg.sender);

        // 处理剩余费用
        uint256 remainingFee = msg.value - totalRequiredFee;
        if (remainingFee > 0) {
            uint256 platformFee = (remainingFee * platformFeeRate) / 10000;
            payable(feeRecipient).transfer(platformFee);

            // 剩余费用退还给用户
            if (remainingFee > platformFee) {
                payable(msg.sender).transfer(remainingFee - platformFee);
            }
        }

        emit FullDeploymentCreated(
            msg.sender,
            token,
            presale,
            tokenParams[0],
            tokenParams[1],
            block.timestamp
        );

        return (token, presale);
    }

    /**
     * @dev 批量部署（适用于多个项目）
     */
    function batchDeploy(
        string[][] memory tokenParamsArray,
        uint256[][] memory tokenValuesArray,
        uint256[][] memory presaleParamsArray,
        address[] memory creators
    ) external payable onlyOwner returns (address[] memory tokens, address[] memory presales) {
        require(tokenParamsArray.length == creators.length, "Length mismatch");
        require(tokenValuesArray.length == creators.length, "Length mismatch");
        require(presaleParamsArray.length == creators.length, "Length mismatch");

        tokens = new address[](creators.length);
        presales = new address[](creators.length);

        for (uint256 i = 0; i < creators.length; i++) {
            // 临时转移调用者身份（仅用于演示，实际应用中需要更安全的方式）
            (tokens[i], presales[i]) = _deployForUser(
                tokenParamsArray[i],
                tokenValuesArray[i],
                presaleParamsArray[i],
                creators[i]
            );
        }

        return (tokens, presales);
    }

    /**
     * @dev 为指定用户部署（内部函数）
     */
    function _deployForUser(
        string[] memory tokenParams,
        uint256[] memory tokenValues,
        uint256[] memory presaleParams,
        address creator
    ) private returns (address token, address presale) {
        // 创建代币（使用合约余额支付费用）
        token = tokenFactory.createToken{value: tokenFactory.creationFee()}(
            tokenParams[0],
            tokenParams[1],
            tokenValues[0],
            tokenValues[1],
            tokenValues[2]
        );

        // 创建预售
        presale = presaleFactory.createPresale{value: presaleFactory.creationFee()}(
            token,
            presaleParams[0],
            presaleParams[1],
            presaleParams[2],
            presaleParams[3],
            presaleParams[4]
        );

        // 记录部署信息
        deployments[creator] = DeploymentRecord({
            token: token,
            presale: presale,
            creator: creator,
            timestamp: block.timestamp,
            active: true
        });

        tokenToCreator[token] = creator;
        allDeployments.push(creator);

        emit FullDeploymentCreated(
            creator,
            token,
            presale,
            tokenParams[0],
            tokenParams[1],
            block.timestamp
        );

        return (token, presale);
    }

    // === 管理员功能 ===

    /**
     * @dev 更新链配置
     */
    function updateChainConfig(
        uint256 _chainId,
        string memory _name,
        address _router,
        address _wbnb,
        address _usdt,
        bool _supported
    ) external onlyOwner {
        chainConfigs[_chainId] = ChainConfig({
            name: _name,
            router: _router,
            wbnb: _wbnb,
            usdt: _usdt,
            chainId: _chainId,
            supported: _supported
        });

        // 添加到支持列表（如果不存在）
        bool exists = false;
        for (uint256 i = 0; i < supportedChains.length; i++) {
            if (supportedChains[i] == _chainId) {
                exists = true;
                break;
            }
        }
        if (!exists && _supported) {
            supportedChains.push(_chainId);
        }

        emit ChainConfigUpdated(_chainId, _name, _router);
    }

    /**
     * @dev 设置部署费用
     */
    function setDeploymentFee(uint256 _fee) external onlyOwner {
        deploymentFee = _fee;
        emit DeploymentFeeUpdated(_fee);
    }

    /**
     * @dev 设置费用接收地址
     */
    function setFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient");
        feeRecipient = _recipient;
    }

    /**
     * @dev 设置平台费用率
     */
    function setPlatformFeeRate(uint256 _rate) external onlyOwner {
        require(_rate <= 5000, "Rate too high"); // 最高50%
        platformFeeRate = _rate;
    }

    /**
     * @dev 紧急暂停部署
     */
    function emergencyPause() external onlyOwner {
        tokenFactory.setFactoryEnabled(false);
        presaleFactory.setFactoryEnabled(false);
    }

    /**
     * @dev 恢复部署
     */
    function resumeDeployment() external onlyOwner {
        tokenFactory.setFactoryEnabled(true);
        presaleFactory.setFactoryEnabled(true);
    }

    /**
     * @dev 提取合约余额
     */
    function withdrawBalance() external onlyOwner {
        payable(feeRecipient).transfer(address(this).balance);
    }

    // === 查询功能 ===

    /**
     * @dev 获取用户部署信息
     */
    function getUserDeployment(address _user) external view returns (DeploymentRecord memory) {
        return deployments[_user];
    }

    /**
     * @dev 获取支持的链列表
     */
    function getSupportedChains() external view returns (uint256[] memory) {
        return supportedChains;
    }

    /**
     * @dev 获取链配置
     */
    function getChainConfig(uint256 _chainId) external view returns (ChainConfig memory) {
        return chainConfigs[_chainId];
    }

    /**
     * @dev 获取当前链是否支持
     */
    function isCurrentChainSupported() external view returns (bool) {
        return chainConfigs[block.chainid].supported;
    }

    /**
     * @dev 获取部署统计
     */
    function getDeploymentStats() external view returns (
        uint256 totalDeployments,
        uint256 totalTokens,
        uint256 totalPresales,
        uint256 currentChainId
    ) {
        return (
            allDeployments.length,
            tokenFactory.totalTokensCreated(),
            presaleFactory.totalPresalesCreated(),
            block.chainid
        );
    }

    /**
     * @dev 计算部署费用
     */
    function calculateDeploymentFee() external view returns (
        uint256 tokenFee,
        uint256 presaleFee,
        uint256 platformFee,
        uint256 totalFee
    ) {
        tokenFee = tokenFactory.creationFee();
        presaleFee = presaleFactory.creationFee();
        platformFee = (deploymentFee * platformFeeRate) / 10000;
        totalFee = tokenFee + presaleFee + platformFee;

        return (tokenFee, presaleFee, platformFee, totalFee);
    }

    /**
     * @dev 接收ETH
     */
    receive() external payable {}
}
