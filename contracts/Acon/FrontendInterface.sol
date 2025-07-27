// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./DeploymentManager.sol";
import "./StagedTokenFactory.sol";
import "./PresaleManager.sol";

/**
 * @title FrontendInterface
 * @dev 前端集成接口合约，提供简化的API供前端调用
 * 基于FEG SmartDeFi架构设计，支持一键部署和管理
 */
contract FrontendInterface {
    
    // === 核心合约引用 ===
    DeploymentManager public deploymentManager;
    
    // === 事件定义（供前端监听） ===
    event TokenDeploymentInitiated(address indexed user, string name, string symbol);
    event TokenDeploymentCompleted(address indexed user, address token, address presale);
    event PresaleStatusUpdated(address indexed presale, uint256 status);
    event TradingEnabled(address indexed token);

    constructor(address _deploymentManager) {
        deploymentManager = DeploymentManager(payable(_deploymentManager));
    }

    // === 前端调用的主要函数 ===

    /**
     * @dev 前端一键部署接口
     * @param params 部署参数结构体
     */
    struct DeploymentParams {
        // 代币基本信息
        string name;            // 代币名称
        string symbol;          // 代币符号
        uint256 totalSupply;    // 总供应量（不含小数位）
        uint8 decimals;         // 小数位数（固定18）
        
        // 费用配置
        uint256 buyFee;         // 买入手续费（百分比，如1表示1%）
        uint256 sellFee;        // 卖出手续费（百分比，如4表示4%）
        
        // 预售参数
        uint256 presalePrice;   // 预售价格（每ETH可购买的代币数量）
        uint256 hardCap;        // 硬顶（ETH）
        uint256 softCap;        // 软顶（ETH）
        uint256 maxBuyPerWallet; // 每钱包最大购买量（ETH）
        uint256 presaleDuration; // 预售持续时间（秒）
        
        // DEX配置
        uint256 liquidityPercent; // 流动性百分比
        uint256 listingPrice;     // 上市价格
        bool autoListing;         // 是否自动上市
    }

    /**
     * @dev 简化的部署函数（供前端调用）
     */
    function deployToken(DeploymentParams memory params) external payable returns (address token, address presale) {
        emit TokenDeploymentInitiated(msg.sender, params.name, params.symbol);
        
        // 准备参数数组
        string[] memory tokenParams = new string[](2);
        tokenParams[0] = params.name;
        tokenParams[1] = params.symbol;
        
        uint256[] memory tokenValues = new uint256[](3);
        tokenValues[0] = params.totalSupply;
        tokenValues[1] = params.buyFee;
        tokenValues[2] = params.sellFee;
        
        uint256[] memory presaleParams = new uint256[](5);
        presaleParams[0] = 1 ether / params.presalePrice; // presaleEthAmount
        presaleParams[1] = 0.29 ether; // tradeEthAmount
        presaleParams[2] = params.hardCap / presaleParams[0]; // maxTotalNum
        presaleParams[3] = params.maxBuyPerWallet / presaleParams[0]; // presaleMaxNum
        presaleParams[4] = 150000 ether; // marketDisAmount (15万美元)
        
        // 调用部署管理器
        (token, presale) = deploymentManager.deployTokenAndPresale{value: msg.value}(
            tokenParams,
            tokenValues,
            presaleParams
        );
        
        emit TokenDeploymentCompleted(msg.sender, token, presale);
        return (token, presale);
    }

    /**
     * @dev 获取部署费用估算
     */
    function getDeploymentCost() external view returns (
        uint256 tokenCreationFee,
        uint256 presaleCreationFee,
        uint256 platformFee,
        uint256 totalCost
    ) {
        return deploymentManager.calculateDeploymentFee();
    }

    /**
     * @dev 获取用户的部署信息
     */
    function getUserTokenInfo(address user) external view returns (
        address token,
        address presale,
        uint256 deploymentTime,
        bool isActive
    ) {
        DeploymentManager.DeploymentRecord memory record = deploymentManager.getUserDeployment(user);
        return (record.token, record.presale, record.timestamp, record.active);
    }

    /**
     * @dev 获取代币详细信息
     */
    function getTokenDetails(address tokenAddress) external view returns (
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 decimals,
        bool tradingEnabled,
        address owner
    ) {
        StagedCustomToken token = StagedCustomToken(payable(tokenAddress));
        return (
            token.name(),
            token.symbol(),
            token.totalSupply(),
            token.decimals(),
            token.tradingEnabled(),
            token.owner()
        );
    }

    /**
     * @dev 获取预售详细信息
     */
    function getPresaleDetails(address presaleAddress) external view returns (
        uint256 presaleStatus,
        uint256 presaleEthAmount,
        uint256 maxTotalNum,
        uint256 totalNum,
        uint256 currentStage,
        uint256 marketPrice
    ) {
        PresaleManager presale = PresaleManager(payable(presaleAddress));
        (presaleStatus, presaleEthAmount, , totalNum, maxTotalNum, , , , , ) = presale.getPresaleData();
        
        return (
            presaleStatus,
            presaleEthAmount,
            maxTotalNum,
            totalNum,
            presale.nowStage(),
            presale.getMarketPrice()
        );
    }

    /**
     * @dev 获取用户预售参与信息
     */
    function getUserPresaleInfo(address presaleAddress, address user) external view returns (
        uint256 presaleCount,
        uint256 tokenAmount,
        uint256 hasUnlockAmount,
        uint256 stage,
        bool verified
    ) {
        PresaleManager presale = PresaleManager(payable(presaleAddress));
        (address userAddr, uint256 pCount, uint256 tAmount, uint256 unlocked, uint256 userStage, bool isVerified) = presale.presaleAddress(user);
        
        return (pCount, tAmount, unlocked, userStage, isVerified);
    }

    // === 管理功能（供代币创建者使用） ===

    /**
     * @dev 启动代币交易（仅代币所有者）
     */
    function enableTrading(address tokenAddress) external {
        StagedCustomToken token = StagedCustomToken(payable(tokenAddress));
        require(token.owner() == msg.sender, "Not token owner");

        token.enableTrading();
        emit TradingEnabled(tokenAddress);
    }

    /**
     * @dev 更新预售状态（仅预售所有者）
     */
    function updatePresaleStatus(address presaleAddress, uint256 newStatus) external {
        PresaleManager presale = PresaleManager(payable(presaleAddress));
        require(presale.owner() == msg.sender, "Not presale owner");
        
        presale.setPresaleStatus(newStatus);
        emit PresaleStatusUpdated(presaleAddress, newStatus);
    }

    /**
     * @dev 推进解锁阶段（仅预售所有者）
     */
    function advanceUnlockStage(address presaleAddress) external {
        PresaleManager presale = PresaleManager(payable(presaleAddress));
        require(presale.owner() == msg.sender, "Not presale owner");
        
        presale.advanceStage();
    }

    // === 批量查询功能（供前端展示使用） ===

    /**
     * @dev 获取最新部署的代币列表
     */
    function getLatestTokens(uint256 count) external view returns (
        address[] memory tokens,
        string[] memory names,
        string[] memory symbols,
        uint256[] memory timestamps
    ) {
        (uint256 totalDeployments, , , ) = deploymentManager.getDeploymentStats();
        uint256 startIndex = totalDeployments > count ? totalDeployments - count : 0;
        
        tokens = new address[](count);
        names = new string[](count);
        symbols = new string[](count);
        timestamps = new uint256[](count);
        
        for (uint256 i = 0; i < count && startIndex + i < totalDeployments; i++) {
            address creator = deploymentManager.allDeployments(startIndex + i);
            DeploymentManager.DeploymentRecord memory record = deploymentManager.getUserDeployment(creator);
            
            tokens[i] = record.token;
            timestamps[i] = record.timestamp;
            
            if (record.token != address(0)) {
                StagedCustomToken token = StagedCustomToken(payable(record.token));
                names[i] = token.name();
                symbols[i] = token.symbol();
            }
        }
        
        return (tokens, names, symbols, timestamps);
    }

    /**
     * @dev 获取网络配置信息
     */
    function getNetworkInfo() external view returns (
        uint256 chainId,
        string memory chainName,
        bool isSupported,
        address router,
        address wbnb,
        address usdt
    ) {
        chainId = block.chainid;
        DeploymentManager.ChainConfig memory config = deploymentManager.getChainConfig(chainId);
        
        return (
            chainId,
            config.name,
            config.supported,
            config.router,
            config.wbnb,
            config.usdt
        );
    }

    /**
     * @dev 获取平台统计信息
     */
    function getPlatformStats() external view returns (
        uint256 totalTokensCreated,
        uint256 totalPresalesCreated,
        uint256 totalDeployments,
        uint256 currentChainId
    ) {
        return deploymentManager.getDeploymentStats();
    }

    // === 实用工具函数 ===

    /**
     * @dev 计算预售参数
     */
    function calculatePresaleParams(
        uint256 presalePrice,    // 每ETH购买的代币数量
        uint256 hardCapETH,      // 硬顶ETH数量
        uint256 maxBuyETH        // 每钱包最大购买ETH
    ) external pure returns (
        uint256 presaleEthAmount,  // 单次预售ETH数量
        uint256 maxTotalNum,       // 总预售次数
        uint256 presaleMaxNum      // 每钱包最大预售次数
    ) {
        presaleEthAmount = 1 ether / presalePrice;
        maxTotalNum = hardCapETH / presaleEthAmount;
        presaleMaxNum = maxBuyETH / presaleEthAmount;
        
        return (presaleEthAmount, maxTotalNum, presaleMaxNum);
    }

    /**
     * @dev 验证部署参数
     */
    function validateDeploymentParams(DeploymentParams memory params) external pure returns (bool valid, string memory error) {
        if (bytes(params.name).length == 0) {
            return (false, "Token name cannot be empty");
        }
        if (bytes(params.symbol).length == 0) {
            return (false, "Token symbol cannot be empty");
        }
        if (params.totalSupply == 0) {
            return (false, "Total supply must be greater than 0");
        }
        if (params.buyFee > 10 || params.sellFee > 10) {
            return (false, "Fees cannot exceed 10%");
        }
        if (params.hardCap <= params.softCap) {
            return (false, "Hard cap must be greater than soft cap");
        }
        if (params.maxBuyPerWallet > params.hardCap) {
            return (false, "Max buy per wallet cannot exceed hard cap");
        }
        
        return (true, "");
    }

    // === 紧急功能 ===

    /**
     * @dev 检查合约状态
     */
    function getSystemStatus() external view returns (
        bool deploymentEnabled,
        bool tokenFactoryEnabled,
        bool presaleFactoryEnabled,
        address deploymentManagerAddress
    ) {
        StagedTokenFactory tokenFactory = StagedTokenFactory(deploymentManager.tokenFactory());
        PresaleFactory presaleFactory = PresaleFactory(deploymentManager.presaleFactory());
        
        return (
            true, // 假设部署管理器总是启用的
            tokenFactory.factoryEnabled(),
            presaleFactory.factoryEnabled(),
            address(deploymentManager)
        );
    }
}

/**
 * @title FrontendHelper
 * @dev 前端辅助合约，提供额外的实用功能
 */
contract FrontendHelper {
    
    /**
     * @dev 批量查询代币余额
     */
    function getTokenBalances(
        address[] memory tokens,
        address user
    ) external view returns (uint256[] memory balances) {
        balances = new uint256[](tokens.length);
        
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] != address(0)) {
                try IERC20(tokens[i]).balanceOf(user) returns (uint256 balance) {
                    balances[i] = balance;
                } catch {
                    balances[i] = 0;
                }
            }
        }
        
        return balances;
    }

    /**
     * @dev 批量查询代币信息
     */
    function getTokensInfo(
        address[] memory tokens
    ) external view returns (
        string[] memory names,
        string[] memory symbols,
        uint256[] memory totalSupplies,
        uint8[] memory decimalsArray
    ) {
        names = new string[](tokens.length);
        symbols = new string[](tokens.length);
        totalSupplies = new uint256[](tokens.length);
        decimalsArray = new uint8[](tokens.length);
        
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] != address(0)) {
                try IERC20Metadata(tokens[i]).name() returns (string memory name) {
                    names[i] = name;
                } catch {
                    names[i] = "Unknown";
                }
                
                try IERC20Metadata(tokens[i]).symbol() returns (string memory symbol) {
                    symbols[i] = symbol;
                } catch {
                    symbols[i] = "UNK";
                }
                
                try IERC20(tokens[i]).totalSupply() returns (uint256 supply) {
                    totalSupplies[i] = supply;
                } catch {
                    totalSupplies[i] = 0;
                }
                
                try IERC20Metadata(tokens[i]).decimals() returns (uint8 dec) {
                    decimalsArray[i] = dec;
                } catch {
                    decimalsArray[i] = 18;
                }
            }
        }
        
        return (names, symbols, totalSupplies, decimalsArray);
    }

    /**
     * @dev 计算代币价格（基于DEX储备）
     */
    function getTokenPrice(
        address token,
        address pair,
        address baseToken
    ) external view returns (uint256 price) {
        try IPancakePair(pair).getReserves() returns (
            uint112 reserve0,
            uint112 reserve1,
            uint32
        ) {
            address token0 = IPancakePair(pair).token0();
            
            if (token0 == token) {
                // token是token0，baseToken是token1
                price = uint256(reserve1) * 1e18 / uint256(reserve0);
            } else {
                // token是token1，baseToken是token0
                price = uint256(reserve0) * 1e18 / uint256(reserve1);
            }
        } catch {
            price = 0;
        }
        
        return price;
    }
}
