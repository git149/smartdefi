// // SPDX-License-Identifier: MIT

// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/utils/math/SafeMath.sol";
// import "@openzeppelin/contracts/utils/Address.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// library TransferHelper {
//     function safeApprove(address token, address to, uint value) internal {
//         // bytes4(keccak256(bytes('approve(address,uint256)')));
//         (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x095ea7b3, to, value));
//         require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: APPROVE_FAILED');
//     }

//     function safeTransfer(address token, address to, uint value) internal {
//         // bytes4(keccak256(bytes('transfer(address,uint256)')));
//         (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
//         require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FAILED');
//     }

//     function safeTransferFrom(address token, address from, address to, uint value) internal {
//         // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
//         (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
//         require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
//     }

//     function safeTransferETH(address to, uint value) internal {
//         (bool success,) = to.call{value:value}(new bytes(0));
//         require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
//     }
// }

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

// interface IPancakeRouter01 {
//     function factory() external pure returns (address);
//     function WETH() external pure returns (address);

//     function addLiquidity(
//         address tokenA,
//         address tokenB,
//         uint amountADesired,
//         uint amountBDesired,
//         uint amountAMin,
//         uint amountBMin,
//         address to,
//         uint deadline
//     ) external returns (uint amountA, uint amountB, uint liquidity);
//     function addLiquidityETH(
//         address token,
//         uint amountTokenDesired,
//         uint amountTokenMin,
//         uint amountETHMin,
//         address to,
//         uint deadline
//     ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
//     function removeLiquidity(
//         address tokenA,
//         address tokenB,
//         uint liquidity,
//         uint amountAMin,
//         uint amountBMin,
//         address to,
//         uint deadline
//     ) external returns (uint amountA, uint amountB);
//     function removeLiquidityETH(
//         address token,
//         uint liquidity,
//         uint amountTokenMin,
//         uint amountETHMin,
//         address to,
//         uint deadline
//     ) external returns (uint amountToken, uint amountETH);
//     function removeLiquidityWithPermit(
//         address tokenA,
//         address tokenB,
//         uint liquidity,
//         uint amountAMin,
//         uint amountBMin,
//         address to,
//         uint deadline,
//         bool approveMax, uint8 v, bytes32 r, bytes32 s
//     ) external returns (uint amountA, uint amountB);
//     function removeLiquidityETHWithPermit(
//         address token,
//         uint liquidity,
//         uint amountTokenMin,
//         uint amountETHMin,
//         address to,
//         uint deadline,
//         bool approveMax, uint8 v, bytes32 r, bytes32 s
//     ) external returns (uint amountToken, uint amountETH);
//     function swapExactTokensForTokens(
//         uint amountIn,
//         uint amountOutMin,
//         address[] calldata path,
//         address to,
//         uint deadline
//     ) external returns (uint[] memory amounts);
//     function swapTokensForExactTokens(
//         uint amountOut,
//         uint amountInMax,
//         address[] calldata path,
//         address to,
//         uint deadline
//     ) external returns (uint[] memory amounts);
//     function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
//         external
//         payable
//         returns (uint[] memory amounts);
//     function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
//         external
//         returns (uint[] memory amounts);
//     function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
//         external
//         returns (uint[] memory amounts);
//     function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
//         external
//         payable
//         returns (uint[] memory amounts);

//     function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
//     function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
//     function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn);
//     function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
//     function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
// }

// interface IPancakeRouter02 is IPancakeRouter01 {
//     function removeLiquidityETHSupportingFeeOnTransferTokens(
//         address token,
//         uint liquidity,
//         uint amountTokenMin,
//         uint amountETHMin,
//         address to,
//         uint deadline
//     ) external returns (uint amountETH);
//     function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
//         address token,
//         uint liquidity,
//         uint amountTokenMin,
//         uint amountETHMin,
//         address to,
//         uint deadline,
//         bool approveMax, uint8 v, bytes32 r, bytes32 s
//     ) external returns (uint amountETH);

//     function swapExactTokensForTokensSupportingFeeOnTransferTokens(
//         uint amountIn,
//         uint amountOutMin,
//         address[] calldata path,
//         address to,
//         uint deadline
//     ) external;
//     function swapExactETHForTokensSupportingFeeOnTransferTokens(
//         uint amountOutMin,
//         address[] calldata path,
//         address to,
//         uint deadline
//     ) external payable;
//     function swapExactTokensForETHSupportingFeeOnTransferTokens(
//         uint amountIn,
//         uint amountOutMin,
//         address[] calldata path,
//         address to,
//         uint deadline
//     ) external;
// }

// interface CCoin {
//     function pairUSDT() external pure returns (address);
// }



// contract PRESALE is Ownable {
//     using SafeMath for uint256;
//     using Address for address;

//     address public USDT = 0x55d398326f99059fF775485246999027B3197955;
//     IPancakeRouter02 router = IPancakeRouter02(0x10ED43C718714eb63d5aA57B78B54704E256024E);

//     address public coinAddress;
//     address public lpAddress;
//     address public platformETHAddress ;
//     address public platformBNBAddress;

//     mapping(address=>bool) public managerList;
//     mapping(address => preSaleStruct) public preSaleAddress;
//     mapping(address => uint256) public lockAmount;
//     mapping(uint256 => address) public addressIndex;
//     mapping(address => uint256) public tradeCount;
//     mapping(address => bool) public canTrade;

//     uint256 private preSaleEthAmount; 
//     uint256 private tadeEthAmount; 
//     uint256 private coinAmount;
//     uint256 private preSaleMaxNum;
//     uint256 private maxTotalNum;
//     uint256 private totalNum = 0;
    
//     uint256 public insideType = 2;
//     uint256 public presaleType = 1;
//     uint256 private allTradeBNB;
//     uint256 private allTradeAmount;

//     uint256 public presaleStatus = 0;
//     uint256 public lastIndex = 0;
     
//     uint256 public nowStage = 0;
//     uint256 public stageUnlockRate = 10;
//     uint256 public marketDisAmount = 1500000 ether;
//     uint256 public supply = 21000000 ether;
//     uint256 public lastMarketAmount = 0;

//     uint256 public feeTotal = 8000;

//     uint256 public maxInsideNum = 1;

//     struct preSaleStruct{
//         address user;
//         uint256 preSaleCount;
//         uint256 coinAmount;
//         uint256 hasUnlockAmount;
//         uint256 stage;
//         bool verify;
//     }

//     event Minted(address indexed to, uint256 amount, uint256 ethAmount);
//     event Unlock(address indexed to, uint256 ethAmount, uint256 coinAmount, uint256 time);

//     constructor() Ownable(msg.sender){
//         setPoolData(0.3 ether, 0.29 ether, 500, 1, 0 ether, 10);
//     }
    
//     modifier onlyManager() {
//         require( managerList[msg.sender] , "Ownable: caller is not the manager");
//         _;
//     }
    
//     function setManager(address _address , bool isManager) public onlyOwner{
//         managerList[_address]=isManager;
//     }

//     function getIndexData(uint256 _index) public view  returns (preSaleStruct memory) {
//         preSaleStruct memory _p = preSaleAddress[addressIndex[_index]];
//         return  _p;
//     }

//     function getPreSaleDate() public view returns (uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256){
//         return (presaleStatus,preSaleEthAmount,preSaleMaxNum,totalNum,maxTotalNum,coinAmount,insideType,presaleType,tadeEthAmount,maxInsideNum);
//     }

//     function setVerify(address _addr, bool verify) external onlyOwner payable {
//         preSaleStruct memory _p = preSaleAddress[_addr];
//         uint256 _pNum = _p.preSaleCount;
//         require(_pNum != 0 && _p.hasUnlockAmount == 0, "Not presaled");

//         _p.verify = verify;
//         if(verify == false && presaleType == 1){
//              _p.preSaleCount = 0;
//             require(msg.value >= _pNum.mul(preSaleEthAmount), "Not enough");
//             payable(_addr).transfer(_pNum.mul(preSaleEthAmount));
//         }
//         preSaleAddress[_addr] = _p;
//     }

//     function setCoinAddress(address _coin) external onlyOwner {
//         coinAddress = _coin;
//         IPancakeFactory factory = IPancakeFactory(router.factory());
//         lpAddress = factory.getPair(USDT, coinAddress);
//     }

//     function setFeeRate(uint256 _feeRate) external onlyOwner {
//         require(_feeRate < 10000, "rate error");
//         feeTotal = _feeRate;
//     }

//     function setCoinAmount(uint256 _coinAmount) external onlyOwner {
//         coinAmount = _coinAmount;
//     }

//     function setPresaleStatus(uint256 _presaleStatus) external onlyOwner {
//         presaleStatus = _presaleStatus;
//     }

//     function setMarketDisAmount(uint256 _dis) external onlyOwner {
//         marketDisAmount = _dis;
//     }

//     function setMaxInsideNum(uint256 _maxInsideNum) external onlyOwner {
//         maxInsideNum = _maxInsideNum;
//     }

//     function setSupply(uint256 _supply) external onlyOwner {
//         supply = _supply;
//     }
    
//     function setPoolData(uint256 _single,uint256 _trade, uint256 _total, uint256 _max, uint256 _coin, uint256 _rate) public onlyOwner {
//         preSaleEthAmount = _single;
//         tadeEthAmount = _trade;
//         maxTotalNum = _total;
//         preSaleMaxNum = _max;
//         coinAmount = _coin;
//         stageUnlockRate = _rate;
//     }

//     function getMarketPrice() public view returns(uint256){

//         uint256 _amount = IERC20(USDT).balanceOf(CCoin(coinAddress).pairUSDT());
//         uint256 _coin = IERC20(coinAddress).balanceOf(CCoin(coinAddress).pairUSDT());
        
//         uint256 price = supply.mul(_amount).div(_coin);

//         return price;                    
//     }

//     function getInsidePrice() public view returns(uint256){
//         return allTradeAmount.div(allTradeBNB); 
//     }

//     function advanceStage() external onlyOwner{
//         uint price = getMarketPrice();
//         if(price - lastMarketAmount >= marketDisAmount){
//             require(nowStage < 1000/stageUnlockRate, "max");
//             nowStage++;
//             lastMarketAmount = lastMarketAmount + marketDisAmount;
//         }
//     }

//     function unlock() external {     
//         require(presaleStatus >= 3, "In presale");
//         require(coinAmount != 0,  "Not lp");
//         preSaleStruct memory _p = preSaleAddress[msg.sender];
//         require(_p.verify == true && msg.sender == _p.user, "Not verified");
//         require(_p.preSaleCount != 0 && _p.hasUnlockAmount < coinAmount, "Not presaled");
//         uint256 _dis = nowStage.sub(_p.stage);
//         uint256 _unlockAmount = coinAmount.mul(_dis).mul(stageUnlockRate).div(1000);

//         IPancakePair(lpAddress).approve(address(router), _unlockAmount);
//         (uint256 amount, uint256 amountUSDT) = router.removeLiquidity(
//             coinAddress,
//             USDT,
//             _unlockAmount,
//             0,
//             0,
//             address(this),
//             block.timestamp
//         );

//        require(amount != 0 && amountUSDT != 0, "Error");
     
//         TransferHelper.safeTransfer(coinAddress,address(0xdead),amount);
//         TransferHelper.safeTransfer(USDT,platformETHAddress,amountUSDT.mul(10).div(100));
//         TransferHelper.safeTransfer(USDT,msg.sender,amountUSDT.mul(90).div(100));

//         _p.stage = nowStage;
//         _p.hasUnlockAmount = _p.hasUnlockAmount.add(_unlockAmount);
//         preSaleAddress[msg.sender] = _p;

//         emit Unlock(msg.sender, coinAmount, _unlockAmount, block.timestamp);
//     }

//     receive() external payable {

//     }

//     fallback() external payable { 

//     }

//     function swapETHToToken(
//         address token,
//         uint256 amount,
//         address to
//     ) private returns (uint256 amountOut) {
//         address[] memory path = new address[](3);
//         path[0] = router.WETH();
//         path[1] = USDT;
//         path[2] = token;

//         IERC20 erc20 = IERC20(token);
//         uint256 beforeBlanace = erc20.balanceOf(to);
//         router.swapExactETHForTokensSupportingFeeOnTransferTokens{
//             value: amount
//         }(0, path, to, block.timestamp);
//         uint256 afterBlanace = erc20.balanceOf(to);

//         amountOut = afterBlanace.sub(beforeBlanace);
//     }

//     function swapETHToTokenFIRST(
//         address token,
//         uint256 amount,
//         address to
//     ) private returns (uint256 amountOut) {
//         address[] memory path = new address[](3);
//         path[0] = router.WETH();
//         path[1] = USDT;
//         path[2] = token;

//         IERC20 erc20 = IERC20(token);
//         uint256 beforeBlanace = erc20.balanceOf(to);
//         router.swapExactETHForTokensSupportingFeeOnTransferTokens{
//             value: amount
//         }(0, path, to, block.timestamp);
//         uint256 afterBlanace = erc20.balanceOf(to);

//         amountOut = afterBlanace.sub(beforeBlanace);
//     }

//     function preSale() external payable{
//         require(presaleType == 1,"Error");
//         preSaleStruct memory _p = preSaleAddress[msg.sender];
//         uint256 _pNum = _p.preSaleCount;
//         uint256 _copies = msg.value.div(preSaleEthAmount);

//         if(presaleStatus == 0 || _copies == 0){
//             payable(platformETHAddress).transfer(msg.value);
//             return;
//         }
                
//         if(presaleStatus >= 2 || totalNum >= maxTotalNum){
//            payable(platformETHAddress).transfer(msg.value);
//            return;
//         }

//         if ((_pNum+_copies) <= preSaleMaxNum && (totalNum+_copies) <= maxTotalNum ){
//             payable(platformETHAddress).transfer(msg.value);
//             if(_p.user == address(0)){
//                 _p.user = msg.sender;
//                 _p.preSaleCount = _copies;
//                 _p.coinAmount = 0;
//                 _p.verify = true;
//                 addressIndex[lastIndex] = msg.sender;
//                 lastIndex++;

//             }else {
//                 _p.preSaleCount = _pNum.add(_copies);
//                 _p.coinAmount = 0;
//             }
//             preSaleAddress[msg.sender] = _p;
//             totalNum = totalNum.add(_copies);

//             emit Minted(msg.sender,_pNum+_copies,msg.value);

//         }else {
//             payable(platformETHAddress).transfer(msg.value);
//         }
//     }

//     function trade() external payable{
//         require(presaleStatus == 3 , "Cant trade");
//         require(msg.value != 0, "Zero");
       
//         uint256 _pNum = tradeCount[msg.sender];
//         uint256 _copies = msg.value.div(tadeEthAmount);

//         if(canTrade[msg.sender] == false){
//             preSaleStruct memory _p = preSaleAddress[msg.sender];
//             require(_p.preSaleCount != 0 && _p.verify == true, "No verify");
//         }
        
//         if(_copies == 0 || (_copies+_pNum) > maxInsideNum){
//             revert("Cant trade");
//         }
        


//         uint256 _amount2 = msg.value.mul(50).div(100);
//         uint256 _amount3 = msg.value.mul(50).div(100);



//         uint256 _cAmount1 = swapETHToToken(coinAddress, _amount2, address(this));
//         uint256 _cAmount2 = swapETHToTokenFIRST(coinAddress, _amount3, address(this));
//         require(_cAmount1 != 0 && _cAmount2 != 0 ,"Error, no swap");


//         if(insideType == 1){
//             TransferHelper.safeTransfer(coinAddress,msg.sender,_cAmount1.add(_cAmount2));
//         }else {
//             TransferHelper.safeTransfer(coinAddress,platformETHAddress,_cAmount1.add(_cAmount2));
//             allTradeAmount = allTradeAmount.add(_cAmount1).add(_cAmount2);
//             allTradeBNB = allTradeBNB.add(msg.value);
//         }
       
//         tradeCount[msg.sender]=_copies+_pNum;
//     } 

//     function tradeUnlock() external {
//         require(insideType == 2 && presaleStatus >= 4, "In inside");
//         uint256 _pNum = tradeCount[msg.sender];
//         require(_pNum != 0, "Not trade inside");

//         uint256 _amount = _pNum.mul(getInsidePrice()).mul(tadeEthAmount);
//         require(_amount != 0, "Price zero");
//         tradeCount[msg.sender] = 0;

//         TransferHelper.safeTransfer(coinAddress,msg.sender,_amount);

//     }

//     function sellToken(uint256 _amount) external {
//         require(_amount != 0 && insideType == 2 && presaleStatus == 5,"Error: transfer failed");
//         uint256 beforeBlanace = ERC20(coinAddress).balanceOf(address(this));
//         TransferHelper.safeTransferFrom(coinAddress,msg.sender,address(this),_amount);
//         uint256 afterBlanace = ERC20(coinAddress).balanceOf(address(this));

//         uint256 _outAmount = afterBlanace.sub(beforeBlanace);
//         require(_outAmount != 0,"Error: transfer failed");        
//         uint256 fee = (_outAmount * feeTotal) / 10000;
//         TransferHelper.safeTransfer(coinAddress,platformBNBAddress,fee);
//         _outAmount -= fee;    

//         IERC20(coinAddress).approve(address(router), _outAmount);
//         address[] memory path = new address[](2);
//         path[0] = coinAddress;
//         path[1] = USDT;
    
//         uint256 _beforeU =  ERC20(USDT).balanceOf(address(this));
//         router.swapExactTokensForTokensSupportingFeeOnTransferTokens(_outAmount,1, path, address(this), block.timestamp);
//         uint256 _afterU = ERC20(USDT).balanceOf(address(this));
//         uint256 amountOut = _afterU.sub(_beforeU);

//         if(amountOut > 0) {
//             TransferHelper.safeTransfer(USDT,msg.sender,amountOut);
//         }

//     }
    
//     function setUserUnlockAmount(address[] memory _addrList) external onlyManager{
//         for (uint256 i = 0;i < _addrList.length;i++){
//             preSaleAddress[_addrList[i]] = preSaleStruct(_addrList[i],1,0,0,0,true);
//         }
//     }

//     function setUserCanTrade(address[] memory _addrList, bool _state) external onlyManager{
//         for (uint256 i = 0;i < _addrList.length;i++){
//             canTrade[_addrList[i]] = _state;
//         }
//     }



// }