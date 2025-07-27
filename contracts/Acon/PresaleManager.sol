// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Interfaces.sol";

library TransferHelper {
    function safeApprove(address token, address to, uint value) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x095ea7b3, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: APPROVE_FAILED');
    }

    function safeTransfer(address token, address to, uint value) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FAILED');
    }

    function safeTransferFrom(address token, address from, address to, uint value) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
    }

    function safeTransferETH(address to, uint value) internal {
        (bool success,) = to.call{value:value}(new bytes(0));
        require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
    }
}

interface ICustomToken {
    function pairUSDT() external view returns (address);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

/**
 * @title PresaleManager
 * @dev 预售和交易管理合约，基于FEG SmartDeFi架构设计
 * 集成预售功能、分阶段解锁、内部交易、价格发现等机制
 */
contract PresaleManager is Ownable {

    // === 网络配置 ===
    address public USDT;
    IPancakeRouter02 public router;

    // === 核心地址 ===
    address public tokenAddress;
    address public lpAddress;
    address public platformETHAddress;
    address public platformBNBAddress;

    // === 权限管理 ===
    mapping(address => bool) public managerList;
    mapping(address => bool) public canTrade;

    // === 预售数据结构 ===
    struct PresaleStruct {
        address user;
        uint256 presaleCount;
        uint256 tokenAmount;
        uint256 hasUnlockAmount;
        uint256 stage;
        bool verified;
    }

    mapping(address => PresaleStruct) public presaleAddress;
    mapping(address => uint256) public lockAmount;
    mapping(uint256 => address) public addressIndex;
    mapping(address => uint256) public tradeCount;

    // === 预售参数 ===
    uint256 private presaleEthAmount;  // 单次预售ETH数量
    uint256 private tradeEthAmount;    // 内部交易ETH数量
    uint256 private tokenAmount;       // 代币数量
    uint256 private presaleMaxNum;     // 预售最大次数
    uint256 private maxTotalNum;       // 总预售上限
    uint256 private totalNum = 0;      // 当前预售总数
    
    uint256 public insideType = 2;     // 内部交易类型
    uint256 public presaleType = 1;    // 预售类型
    uint256 private allTradeBNB;       // 总交易BNB
    uint256 private allTradeAmount;    // 总交易代币数量

    // === 状态控制 ===
    uint256 public presaleStatus = 0;  // 预售状态 0-5
    uint256 public lastIndex = 0;      // 最后索引
     
    // === 解锁机制 ===
    uint256 public nowStage = 0;              // 当前阶段
    uint256 public stageUnlockRate = 10;      // 阶段解锁率 10 = 1%
    uint256 public marketDisAmount = 150000 ether; // 市场价格增长触发量（15万美元）
    uint256 public supply = 21000000 ether;   // 供应量
    uint256 public lastMarketAmount = 0;      // 上次市场价格

    // === 费用配置 ===
    uint256 public feeTotal = 8000;    // 总费用 8000 = 80%
    uint256 public maxInsideNum = 1;   // 最大内部交易次数

    // === 事件定义 ===
    event Minted(address indexed to, uint256 amount, uint256 ethAmount);
    event Unlock(address indexed to, uint256 ethAmount, uint256 tokenAmount, uint256 time);
    event StageAdvanced(uint256 newStage, uint256 price, uint256 time);
    event PresaleStatusChanged(uint256 newStatus);

    constructor() Ownable() {
        // 设置默认预售参数
        setPoolData(0.3 ether, 0.29 ether, 500, 1, 0 ether, 10);
        
        // 设置网络配置（BSC主网）
        USDT = 0x55d398326f99059fF775485246999027B3197955;
        router = IPancakeRouter02(0x10ED43C718714eb63d5aA57B78B54704E256024E);
    }
    
    modifier onlyManager() {
        require(managerList[msg.sender], "Caller is not manager");
        _;
    }
    
    // === 管理员功能 ===

    /**
     * @dev 设置管理员
     */
    function setManager(address _address, bool isManager) public onlyOwner {
        managerList[_address] = isManager;
    }

    /**
     * @dev 设置代币地址
     */
    function setTokenAddress(address _token) external onlyOwner {
        tokenAddress = _token;
        IPancakeFactory factory = IPancakeFactory(router.factory());
        lpAddress = factory.getPair(USDT, tokenAddress);
    }

    /**
     * @dev 设置费用率
     */
    function setFeeRate(uint256 _feeRate) external onlyOwner {
        require(_feeRate < 10000, "Rate error");
        feeTotal = _feeRate;
    }

    /**
     * @dev 设置预售状态
     */
    function setPresaleStatus(uint256 _presaleStatus) external onlyOwner {
        presaleStatus = _presaleStatus;
        emit PresaleStatusChanged(_presaleStatus);
    }

    /**
     * @dev 设置市场价格增长触发量
     */
    function setMarketDisAmount(uint256 _dis) external onlyOwner {
        marketDisAmount = _dis;
    }

    /**
     * @dev 设置最大内部交易次数
     */
    function setMaxInsideNum(uint256 _maxInsideNum) external onlyOwner {
        maxInsideNum = _maxInsideNum;
    }

    /**
     * @dev 设置供应量
     */
    function setSupply(uint256 _supply) external onlyOwner {
        supply = _supply;
    }
    
    /**
     * @dev 设置预售池参数
     */
    function setPoolData(
        uint256 _single,
        uint256 _trade, 
        uint256 _total, 
        uint256 _max, 
        uint256 _token, 
        uint256 _rate
    ) public onlyOwner {
        presaleEthAmount = _single;
        tradeEthAmount = _trade;
        maxTotalNum = _total;
        presaleMaxNum = _max;
        tokenAmount = _token;
        stageUnlockRate = _rate;
    }

    // === 价格发现机制 ===

    /**
     * @dev 获取市场价格 - 基于FEG的价格计算逻辑
     * 使用公式: price = supply * USDT_balance / token_balance
     */
    function getMarketPrice() public view returns(uint256) {
        require(tokenAddress != address(0), "Token not set");
        
        address pairUSDT = ICustomToken(tokenAddress).pairUSDT();
        uint256 _amount = IERC20(USDT).balanceOf(pairUSDT);
        uint256 _token = IERC20(tokenAddress).balanceOf(pairUSDT);
        
        if (_token == 0) return 0;
        
        // 关键价格计算逻辑：supply * _amount / _token
        uint256 price = supply * _amount / _token;
        return price;                    
    }

    /**
     * @dev 获取内部交易价格
     */
    function getInsidePrice() public view returns(uint256) {
        if (allTradeBNB == 0) return 0;
        return allTradeAmount / allTradeBNB;
    }

    /**
     * @dev 推进解锁阶段
     */
    function advanceStage() external onlyOwner {
        uint256 price = getMarketPrice();
        if (price - lastMarketAmount >= marketDisAmount) {
            require(nowStage < 1000/stageUnlockRate, "Max stage reached");
            nowStage++;
            lastMarketAmount = lastMarketAmount + marketDisAmount;
            emit StageAdvanced(nowStage, price, block.timestamp);
        }
    }

    // === 预售功能 ===

    /**
     * @dev 预售功能
     */
    function presale() external payable {
        require(presaleType == 1, "Presale type error");
        PresaleStruct memory _p = presaleAddress[msg.sender];
        uint256 _pNum = _p.presaleCount;
        uint256 _copies = msg.value / presaleEthAmount;

        // 状态检查
        if (presaleStatus == 0 || _copies == 0) {
            payable(platformETHAddress).transfer(msg.value);
            return;
        }
                
        if (presaleStatus >= 2 || totalNum >= maxTotalNum) {
           payable(platformETHAddress).transfer(msg.value);
           return;
        }

        // 限制检查
        if ((_pNum + _copies) <= presaleMaxNum && (totalNum + _copies) <= maxTotalNum) {
            payable(platformETHAddress).transfer(msg.value);
            
            if (_p.user == address(0)) {
                _p.user = msg.sender;
                _p.presaleCount = _copies;
                _p.tokenAmount = 0;
                _p.verified = true;
                addressIndex[lastIndex] = msg.sender;
                lastIndex++;
            } else {
                _p.presaleCount = _pNum + _copies;
                _p.tokenAmount = 0;
            }

            presaleAddress[msg.sender] = _p;
            totalNum = totalNum + _copies;

            emit Minted(msg.sender, _pNum + _copies, msg.value);
        } else {
            payable(platformETHAddress).transfer(msg.value);
        }
    }

    /**
     * @dev 设置用户验证状态
     */
    function setVerify(address _addr, bool verify) external onlyOwner payable {
        PresaleStruct memory _p = presaleAddress[_addr];
        uint256 _pNum = _p.presaleCount;
        require(_pNum != 0 && _p.hasUnlockAmount == 0, "Not presaled");

        _p.verified = verify;
        if (verify == false && presaleType == 1) {
            _p.presaleCount = 0;
            require(msg.value >= _pNum * presaleEthAmount, "Not enough");
            payable(_addr).transfer(_pNum * presaleEthAmount);
        }
        presaleAddress[_addr] = _p;
    }

    // === 解锁功能 ===

    /**
     * @dev 解锁代币
     */
    function unlock() external {     
        require(presaleStatus >= 3, "In presale");
        require(tokenAmount != 0, "Not LP");
        
        PresaleStruct memory _p = presaleAddress[msg.sender];
        require(_p.verified == true && msg.sender == _p.user, "Not verified");
        require(_p.presaleCount != 0 && _p.hasUnlockAmount < tokenAmount, "Not presaled");
        
        uint256 _dis = nowStage - _p.stage;
        uint256 _unlockAmount = tokenAmount * _dis * stageUnlockRate / 1000;

        // 移除流动性
        IPancakePair(lpAddress).approve(address(router), _unlockAmount);
        (uint256 amount, uint256 amountUSDT) = router.removeLiquidity(
            tokenAddress,
            USDT,
            _unlockAmount,
            0,
            0,
            address(this),
            block.timestamp
        );

        require(amount != 0 && amountUSDT != 0, "Remove liquidity failed");
     
        // 分配收益
        TransferHelper.safeTransfer(tokenAddress, address(0xdead), amount);
        TransferHelper.safeTransfer(USDT, platformETHAddress, (amountUSDT * 10) / 100);
        TransferHelper.safeTransfer(USDT, msg.sender, (amountUSDT * 90) / 100);

        // 更新状态
        _p.stage = nowStage;
        _p.hasUnlockAmount = _p.hasUnlockAmount + _unlockAmount;
        presaleAddress[msg.sender] = _p;

        emit Unlock(msg.sender, tokenAmount, _unlockAmount, block.timestamp);
    }

    // === 内部交易功能 ===

    /**
     * @dev 内部交易
     */
    function trade() external payable {
        require(presaleStatus == 3, "Cannot trade");
        require(msg.value != 0, "Zero value");
       
        uint256 _pNum = tradeCount[msg.sender];
        uint256 _copies = msg.value / tradeEthAmount;

        // 权限检查
        if (canTrade[msg.sender] == false) {
            PresaleStruct memory _p = presaleAddress[msg.sender];
            require(_p.presaleCount != 0 && _p.verified == true, "No verify");
        }

        if (_copies == 0 || (_copies + _pNum) > maxInsideNum) {
            revert("Cannot trade");
        }

        // 分配资金
        uint256 _amount2 = (msg.value * 50) / 100;
        uint256 _amount3 = (msg.value * 50) / 100;

        // 购买代币
        uint256 _cAmount1 = swapETHToToken(tokenAddress, _amount2, address(this));
        uint256 _cAmount2 = swapETHToTokenFIRST(tokenAddress, _amount3, address(this));
        require(_cAmount1 != 0 && _cAmount2 != 0, "Swap failed");

        // 处理代币
        if (insideType == 1) {
            TransferHelper.safeTransfer(tokenAddress, msg.sender, _cAmount1 + _cAmount2);
        } else {
            TransferHelper.safeTransfer(tokenAddress, platformETHAddress, _cAmount1 + _cAmount2);
            allTradeAmount = allTradeAmount + _cAmount1 + _cAmount2;
            allTradeBNB = allTradeBNB + msg.value;
        }
       
        tradeCount[msg.sender] = _copies + _pNum;
    } 

    /**
     * @dev 内部交易解锁
     */
    function tradeUnlock() external {
        require(insideType == 2 && presaleStatus >= 4, "In inside");
        uint256 _pNum = tradeCount[msg.sender];
        require(_pNum != 0, "Not trade inside");

        uint256 _amount = _pNum * getInsidePrice() * tradeEthAmount;
        require(_amount != 0, "Price zero");
        tradeCount[msg.sender] = 0;

        TransferHelper.safeTransfer(tokenAddress, msg.sender, _amount);
    }

    /**
     * @dev 卖出代币
     */
    function sellToken(uint256 _amount) external {
        require(_amount != 0 && insideType == 2 && presaleStatus == 5, "Error: transfer failed");
        
        uint256 beforeBalance = ERC20(tokenAddress).balanceOf(address(this));
        TransferHelper.safeTransferFrom(tokenAddress, msg.sender, address(this), _amount);
        uint256 afterBalance = ERC20(tokenAddress).balanceOf(address(this));

        uint256 _outAmount = afterBalance - beforeBalance;
        require(_outAmount != 0, "Error: transfer failed");        
        
        // 收取费用
        uint256 fee = (_outAmount * feeTotal) / 10000;
        TransferHelper.safeTransfer(tokenAddress, platformBNBAddress, fee);
        _outAmount -= fee;    

        // 交换为USDT
        IERC20(tokenAddress).approve(address(router), _outAmount);
        address[] memory path = new address[](2);
        path[0] = tokenAddress;
        path[1] = USDT;
    
        uint256 _beforeU = ERC20(USDT).balanceOf(address(this));
        router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            _outAmount, 1, path, address(this), block.timestamp
        );
        uint256 _afterU = ERC20(USDT).balanceOf(address(this));
        uint256 amountOut = _afterU - _beforeU;

        if (amountOut > 0) {
            TransferHelper.safeTransfer(USDT, msg.sender, amountOut);
        }
    }

    // === 辅助功能 ===

    /**
     * @dev ETH换代币
     */
    function swapETHToToken(address token, uint256 amount, address to) private returns (uint256 amountOut) {
        address[] memory path = new address[](3);
        path[0] = router.WETH();
        path[1] = USDT;
        path[2] = token;

        IERC20 erc20 = IERC20(token);
        uint256 beforeBalance = erc20.balanceOf(to);
        router.swapExactETHForTokensSupportingFeeOnTransferTokens{value: amount}(
            0, path, to, block.timestamp
        );
        uint256 afterBalance = erc20.balanceOf(to);

        amountOut = afterBalance - beforeBalance;
    }

    /**
     * @dev ETH换代币（第一种方式）
     */
    function swapETHToTokenFIRST(address token, uint256 amount, address to) private returns (uint256 amountOut) {
        address[] memory path = new address[](3);
        path[0] = router.WETH();
        path[1] = USDT;
        path[2] = token;

        IERC20 erc20 = IERC20(token);
        uint256 beforeBalance = erc20.balanceOf(to);
        router.swapExactETHForTokensSupportingFeeOnTransferTokens{value: amount}(
            0, path, to, block.timestamp
        );
        uint256 afterBalance = erc20.balanceOf(to);

        amountOut = afterBalance - beforeBalance;
    }

    // === 管理员批量操作 ===

    /**
     * @dev 批量设置用户解锁数量
     */
    function setUserUnlockAmount(address[] memory _addrList) external onlyManager {
        for (uint256 i = 0; i < _addrList.length; i++) {
            presaleAddress[_addrList[i]] = PresaleStruct(_addrList[i], 1, 0, 0, 0, true);
        }
    }

    /**
     * @dev 批量设置用户交易权限
     */
    function setUserCanTrade(address[] memory _addrList, bool _state) external onlyManager {
        for (uint256 i = 0; i < _addrList.length; i++) {
            canTrade[_addrList[i]] = _state;
        }
    }

    // === 查询功能 ===

    /**
     * @dev 获取指定索引的预售数据
     */
    function getIndexData(uint256 _index) public view returns (PresaleStruct memory) {
        PresaleStruct memory _p = presaleAddress[addressIndex[_index]];
        return _p;
    }

    /**
     * @dev 获取预售数据
     */
    function getPresaleData() public view returns (
        uint256, uint256, uint256, uint256, uint256, 
        uint256, uint256, uint256, uint256, uint256
    ) {
        return (
            presaleStatus, presaleEthAmount, presaleMaxNum, totalNum, maxTotalNum,
            tokenAmount, insideType, presaleType, tradeEthAmount, maxInsideNum
        );
    }

    // === 接收函数 ===

    receive() external payable {}
    fallback() external payable {}
}

/**
 * @title PresaleFactory
 * @dev 预售工厂合约，用于创建和管理预售合约
 * 基于FEG SmartDeFi架构设计，支持统一的预售管理
 */
contract PresaleFactory is Ownable {

    // === 状态变量 ===
    bool public factoryEnabled = true;
    uint256 public creationFee = 0.05 ether; // 创建预售费用
    uint256 public totalPresalesCreated = 0;

    // === 网络配置 ===
    struct NetworkConfig {
        address router;     // DEX路由器地址
        address usdt;       // USDT地址
        bool enabled;       // 是否启用
    }

    mapping(uint256 => NetworkConfig) public networkConfigs; // 链ID => 配置
    mapping(address => address) public presaleCreators;      // 预售合约 => 创建者
    mapping(address => address) public tokenPresales;       // 代币 => 预售合约
    mapping(address => bool) public isFactoryPresale;       // 是否工厂创建的预售
    address[] public allPresales;                           // 所有创建的预售合约

    // === 事件定义 ===
    event PresaleCreated(
        address indexed presale,
        address indexed creator,
        address indexed token,
        uint256 timestamp
    );
    event NetworkConfigUpdated(uint256 chainId, address router, address usdt);
    event FactoryStatusChanged(bool enabled);

    constructor() Ownable() {
        // BSC 主网配置
        networkConfigs[56] = NetworkConfig({
            router: 0x10ED43C718714eb63d5aA57B78B54704E256024E,
            usdt: 0x55d398326f99059fF775485246999027B3197955,
            enabled: true
        });

        // BSC 测试网配置
        networkConfigs[97] = NetworkConfig({
            router: 0xD99D1c33F9fC3444f8101754aBC46c52416550D1,
            usdt: 0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684,
            enabled: true
        });
    }

    /**
     * @dev 创建预售合约
     * @param _token 代币地址
     * @param _presaleEthAmount 单次预售ETH数量
     * @param _tradeEthAmount 内部交易ETH数量
     * @param _maxTotalNum 总预售上限
     * @param _presaleMaxNum 预售最大次数
     * @param _marketDisAmount 市场价格增长触发量
     */
    function createPresale(
        address _token,
        uint256 _presaleEthAmount,
        uint256 _tradeEthAmount,
        uint256 _maxTotalNum,
        uint256 _presaleMaxNum,
        uint256 _marketDisAmount
    ) external payable returns (address) {
        require(factoryEnabled, "Factory disabled");
        require(msg.value >= creationFee, "Insufficient fee");
        require(_token != address(0), "Invalid token");
        require(tokenPresales[_token] == address(0), "Presale exists");

        uint256 chainId = block.chainid;
        NetworkConfig memory config = networkConfigs[chainId];
        require(config.enabled, "Chain not supported");

        // 创建预售合约
        PresaleManager presale = new PresaleManager();

        // 配置预售合约
        presale.setTokenAddress(_token);
        presale.setPoolData(_presaleEthAmount, _tradeEthAmount, _maxTotalNum, _presaleMaxNum, 0, 10);
        presale.setMarketDisAmount(_marketDisAmount);

        // 转移所有权给创建者
        presale.transferOwnership(msg.sender);

        // 记录信息
        address presaleAddress = address(presale);
        presaleCreators[presaleAddress] = msg.sender;
        tokenPresales[_token] = presaleAddress;
        isFactoryPresale[presaleAddress] = true;
        allPresales.push(presaleAddress);
        totalPresalesCreated++;

        // 发射事件
        emit PresaleCreated(presaleAddress, msg.sender, _token, block.timestamp);

        return presaleAddress;
    }

    // === 管理员功能 ===

    /**
     * @dev 设置网络配置
     */
    function setNetworkConfig(
        uint256 _chainId,
        address _router,
        address _usdt,
        bool _enabled
    ) external onlyOwner {
        networkConfigs[_chainId] = NetworkConfig({
            router: _router,
            usdt: _usdt,
            enabled: _enabled
        });
        emit NetworkConfigUpdated(_chainId, _router, _usdt);
    }

    /**
     * @dev 设置工厂状态
     */
    function setFactoryEnabled(bool _enabled) external onlyOwner {
        factoryEnabled = _enabled;
        emit FactoryStatusChanged(_enabled);
    }

    /**
     * @dev 设置创建费用
     */
    function setCreationFee(uint256 _fee) external onlyOwner {
        creationFee = _fee;
    }

    /**
     * @dev 提取费用
     */
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // === 查询功能 ===

    /**
     * @dev 获取所有预售合约数量
     */
    function getAllPresalesLength() external view returns (uint256) {
        return allPresales.length;
    }

    /**
     * @dev 获取指定范围的预售合约
     */
    function getPresales(uint256 _start, uint256 _end) external view returns (address[] memory) {
        require(_start < _end && _end <= allPresales.length, "Invalid range");

        address[] memory presales = new address[](_end - _start);
        for (uint256 i = _start; i < _end; i++) {
            presales[i - _start] = allPresales[i];
        }
        return presales;
    }

    /**
     * @dev 检查是否为工厂创建的预售
     */
    function isCreatedByFactory(address _presale) external view returns (bool) {
        return isFactoryPresale[_presale];
    }

    /**
     * @dev 获取代币的预售合约
     */
    function getTokenPresale(address _token) external view returns (address) {
        return tokenPresales[_token];
    }

    /**
     * @dev 获取预售合约创建者
     */
    function getPresaleCreator(address _presale) external view returns (address) {
        return presaleCreators[_presale];
    }

    /**
     * @dev 接收ETH
     */
    receive() external payable {}
}
