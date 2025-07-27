// // SPDX-License-Identifier: MIT

// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/utils/Address.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// interface IPancakePair {
//     event Approval(
//         address indexed owner,
//         address indexed spender,
//         uint256 value
//     );
//     event Transfer(address indexed from, address indexed to, uint256 value);

//     function name() external pure returns (string memory);

//     function symbol() external pure returns (string memory);

//     function decimals() external pure returns (uint8);

//     function totalSupply() external view returns (uint256);

//     function balanceOf(address owner) external view returns (uint256);

//     function allowance(address owner, address spender)
//         external
//         view
//         returns (uint256);

//     function approve(address spender, uint256 value) external returns (bool);

//     function transfer(address to, uint256 value) external returns (bool);

//     function transferFrom(
//         address from,
//         address to,
//         uint256 value
//     ) external returns (bool);

//     function factory() external view returns (address);

//     function token0() external view returns (address);

//     function token1() external view returns (address);

//     function getReserves()
//         external
//         view
//         returns (
//             uint112 reserve0,
//             uint112 reserve1,
//             uint32 blockTimestampLast
//         );

//     function price0CumulativeLast() external view returns (uint256);

//     function price1CumulativeLast() external view returns (uint256);

//     function mint(address to) external returns (uint256 liquidity);

//     function burn(address to)
//         external
//         returns (uint256 amount0, uint256 amount1);

//     function swap(
//         uint256 amount0Out,
//         uint256 amount1Out,
//         address to,
//         bytes calldata data
//     ) external;

//     function skim(address to) external;

//     function sync() external;

//     function initialize(address, address) external;
// }

// interface IPancakeFactory {
//     event PairCreated(
//         address indexed token0,
//         address indexed token1,
//         address pair,
//         uint256
//     );

//     function getPair(address tokenA, address tokenB)
//         external
//         view
//         returns (address pair);

//     function createPair(address tokenA, address tokenB)
//         external
//         returns (address pair);
// }

// interface IPancakeRouter {
//     function factory() external pure returns (address);
//     function addLiquidity(
//         address tokenA,
//         address tokenB,
//         uint256 amountADesired,
//         uint256 amountBDesired,
//         uint256 amountAMin,
//         uint256 amountBMin,
//         address to,
//         uint256 deadline
//     ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);
//     function addLiquidityETH(
//         address token,
//         uint256 amountTokenDesired,
//         uint256 amountTokenMin,
//         uint256 amountETHMin,
//         address to,
//         uint256 deadline
//     ) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity);
//     function swapExactTokensForTokensSupportingFeeOnTransferTokens(
//         uint amountIn,
//         uint amountOutMin,
//         address[] calldata path,
//         address to,
//         uint deadline
//     ) external;
//     function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);    
// }

// contract TEST is ERC20, Ownable {
//     using SafeMath for uint256;
//     using Address for address;

//     bool addLiquidityFlag = false;
//     bool swapIng;
//     bool public tradingEnable = false;
//     uint256 tradeStartTime;

//     uint256 public _minWallet = 1 ether;
//     uint256 public minSwapFee = 100 ether;

//     uint256 public maxPancakeBuy  = 500000 ether;
//     uint256 public maxPancakeSell = 500000 ether;
//     uint256 public burnLimit      = 2000000 ether;

//     uint256 public feeBuy = 1; // 1%
//     uint256 public feeSell = 1; // 1%

//     mapping(address => bool) _autoPair;
//     mapping(address => bool) private excludeFeeList;    

//     address public lpAddress;
//     address public marketAddress;
//     address public basePricePoolAddress;


//     address private USDT = 0x55d398326f99059fF775485246999027B3197955;
//     address public pairUSDT;

//     IPancakeRouter router = IPancakeRouter(0x10ED43C718714eb63d5aA57B78B54704E256024E);
    
//     bool public lpBurnEnabled = true;
//     uint256 public lpBurnFrequency = 4 hours;
//     uint256 public lastLpBurnTime;
//     uint256 public percentForLPBurn = 5;
//     uint256 public percentDiv = 1000;

//     event AutoNukeLP(uint256 lpBalance, uint256 burnAmount, uint256 time);
//     event SwapTokenForFee(uint256 ethFeeAmount, uint256 time);


//     constructor(address _owner) ERC20("TEST", "TEST") Ownable(_owner) {
//         IPancakeFactory factory = IPancakeFactory(router.factory());
//         pairUSDT = factory.createPair(address(this), USDT);

//         _autoPair[pairUSDT] = true;

//         excludeFeeList[address(this)] = true;
//         excludeFeeList[lpAddress] = true;
//         excludeFeeList[marketAddress] = true;
//         excludeFeeList[basePricePoolAddress] = true;

//         _mint(_owner, 21000000 ether);
//         _mint(marketAddress, 189000000 ether);
//     }



//     function setBase(address _base,uint256 _limit,uint256 _min)  external onlyOwner {
//         basePricePoolAddress = _base;
//         burnLimit = _limit;
//         minSwapFee = _min;
//     }

//     function _transfer(
//         address from,
//         address to,
//         uint256 amount
//     ) internal virtual override {
//         if(tradingEnable) {
//             if(block.timestamp > tradeStartTime.add(3600)) {
//                 maxPancakeBuy = 0;
//                 maxPancakeSell = 0;
//             }
//         }

//         if(from != address(this) && balanceOf(from).sub(amount) < _minWallet) {
//             amount = balanceOf(from).sub(_minWallet);
//         }

//         if(_autoPair[from] || _autoPair[to]) {
//             address _user;

//             uint256 _fee;
//             //buy
//             if(_autoPair[from]) {
//                 _user = to;
//                 if(maxPancakeBuy != 0  && _user != address(this) && !excludeFeeList[_user]){
//                     require(amount <= maxPancakeBuy, "Fail: more than max");
//                 }
//                 _fee = feeBuy;
//             }
//             //sell
//             else if(_autoPair[to]) {
//                 _user = from;
//                 if(maxPancakeSell != 0 && amount > maxPancakeSell && _user != address(this) && !excludeFeeList[_user]){
//                     amount = maxPancakeSell;
//                 }
//                 _fee = feeSell;
//             }

//             if (!isExcludeFee(_user)) {
//                 require(tradingEnable, "not Launch");      
//             }

//             if (!isExcludeFee(from) && !isExcludeFee(to)) {
//                 uint256 fee = (amount * _fee) / 100;
//                 super._transfer(from, address(this), fee);
            
//                 if(_autoPair[to]){
//                     autoBurnUniswapPair();
//                     if (!swapIng) {
//                         swapIng = true;
//                         swapTokenForFee();
//                         swapIng = false;
//                     }
//                 }
//             }
//         }
//         super._transfer(from, to, amount);
//     }

//     function autoBurnUniswapPair() internal {
//         if(lpBurnEnabled) {
//             if (block.timestamp - lastLpBurnTime > lpBurnFrequency && balanceOf(pairUSDT) > burnLimit) {
//                 burnPair(pairUSDT);
//                 lastLpBurnTime = block.timestamp;
//             }
//         }     
//     }

//     function burnPair(address _pair) internal {
//         uint256 liquidityPairBalance = balanceOf(_pair);
//         uint256 amountToBurn = (liquidityPairBalance * percentForLPBurn) /
//             percentDiv;

//         if (amountToBurn > 0) {
//             super._transfer(_pair, address(0xdead), amountToBurn);
//             IPancakePair(_pair).sync();
//             emit AutoNukeLP(
//                 liquidityPairBalance,
//                 amountToBurn,
//                 block.timestamp
//             );
//         }
//     }

//     function swapTokenForFee() private {
//         uint256 balance = balanceOf(address(this));
//         if (balance >= minSwapFee) {
//             safeTransfer(address(this),address(0xdead),balance / 4);

//             uint256 amountOut = swapTokenToU(balanceOf(address(this)));
//             if(amountOut > 0) {
//                 safeTransfer(USDT,lpAddress,amountOut / 3);
//                 safeTransfer(USDT,marketAddress,amountOut / 3);
//                 safeTransfer(USDT,basePricePoolAddress,amountOut / 3);
//                 emit SwapTokenForFee(amountOut, block.timestamp);
//             }
//         }
//     }


//     function swapTokenToU(uint256 tokenAmount) private returns (uint256 amountOut) {
//         address[] memory path = new address[](2);
//         path[0] = address(this);
//         path[1] = USDT;

//         uint256 beforeEthBalance = IERC20(USDT).balanceOf(address(this));
//         router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
//             tokenAmount,
//             0,
//             path,
//             address(this),
//             block.timestamp
//         );  
//         uint256 afterEthBalance = IERC20(USDT).balanceOf(address(this));

//         amountOut = afterEthBalance.sub(beforeEthBalance);
//     }

//     function isExcludeFee(address account) public view returns (bool) {
//         return excludeFeeList[account];
//     }

//     function setExcludeFee(
//         address[] calldata addrs,
//         bool value
//     ) external onlyOwner {
//         for (uint256 i = 0; i < addrs.length; i++) {
//             excludeFeeList[addrs[i]] = value;
//         }
//     }

//     function setLaunch() external onlyOwner {
//         require(tradingEnable == false, "launched");
//         tradingEnable = true;
//         tradeStartTime = block.timestamp;    
//     }


//     function safeTransfer(address token, address to, uint value) internal {
//         (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
//         require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FAILED');
//     }

//     function safeTransferFrom(address token, address from, address to, uint value) internal {
//         (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
//         require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
//     }

//     receive() external payable {}



// }
