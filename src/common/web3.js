import { Function } from 'core-js';
import { Toast, Dialog } from 'vant';

var Web3 = require("./web3.min.js");
var web3js = null;
let chainId;
var baseABI = [{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];
var NFT_abi = require("./abi/NFT_abi.json");
var DEF_abi = require("./abi/Def.json")

var pre_abi = require("./abi/pre.json")
var pre_old_abi = require("./abi/pre_old.json")
var inv_abi = require("./abi/Invite.json")
var router_abi = require("./abi/router.json")
var white_abi = require("./abi/white.json")
var white_abi2 = require("./abi/white2.json")

async function Init(callback) {
 
    if (typeof window.ethereum === "undefined" && typeof window.web3 === "undefined") {
        Toast("Looks like you need a Dapp browser to get started.");
        return false;
    }
    else {
        setWeb3Provider()
        if(chainId != null && chainId !=  Web3.utils.numberToHex(56)){
            Dialog.alert({
                message: 'Only support BSC',
                confirmButtonText: 'Sure',
                className: 'chainWarn',
                confirmButtonColor: '#333333'
            }).then(() => {
                switchChain()
              });
        }else{
            let accountsd = await window.ethereum.request({
                method: 'eth_requestAccounts'
            })
            let account = accountsd[0];
            callback(account)

            window.ethereum.on('accountsChanged', function (cAccounts) {
                callback(cAccounts[0])
            })
        }

        


    }
}

async function setWeb3Provider(){
    let web3Provider = null;
    if (window.ethereum) {
        web3Provider = window.ethereum;
        web3js = new Web3(web3Provider);
        chainId = web3Provider.chainId
    } else if (window.web3) {
        web3Provider = window.web3.currentProvider;
        web3js = new Web3(web3Provider);
        chainId = web3Provider.chainId
    }
}

async function switchChain(){
    try {
        await (window.ethereum).request({
            method: 'wallet_switchEthereumChain',
            params: [{
                chainId: Web3.utils.numberToHex(56)
            }]
        })
        } catch (error) {
        if (error.code === 4902) {
            try {
            await (window.ethereum).request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                    chainId: Web3.utils.numberToHex(56),
                    chainName: 'BNB',
                    nativeCurrency: {
                        name: 'BNB',
                        symbol: 'BNB',
                        decimals: 18
                    },
                    rpcUrls: ['https://bsc-dataseed3.ninicoin.io'],
                    blockExplorerUrls: ['https://bscscan.com']
                    }
                ]
                })
            } catch (error) {
            }
        } else if (error.code === 4001) return
        }
    
}


function sign(address,callback){
    var signstr = web3js.utils.fromUtf8(address)
    web3js.eth.personal.sign(signstr, address).then(t => {
        var recover = web3js.eth.accounts.recover(signstr, t);
        if(recover.toLowerCase() == address.toLowerCase()){
            Toast("Sign success");
            callback("success")
        }else{
            Toast("Unsigned certification");
            callback("failed")
        }
    }).catch(error => {
        Toast("Unsigned certification");
        callback("failed")
    })
}

function getBalance(addr, callback) {
    web3js.eth.getBalance(addr).catch(function (reason) {
    }).then(function (result) {
        callback(result/ Math.pow(10, 18));
    });
}

async function getDbBalance(addr, contractAddress,callback) {
    let contractobj = new web3js.eth.Contract(baseABI, contractAddress);
    contractobj.methods.balanceOf(addr).call({}, function (error, result) {
        if (!error) {
            callback(result);
        } else {
            callback(0);
        }
    });
}

function signMsg(address, str, callback){
    web3js.eth.personal.sign(web3js.utils.fromUtf8(str), address).then(t => {
        callback(t)
    }).catch(error => {
        Toast("Signed failed");
    })
}


async function Approve(addr, addrTo, value, contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(baseABI, contractAddress);
    var obj = contractobj.methods.approve(addrTo, value)

    try {
        var estimateGas = await obj.estimateGas({from: addr});
        obj.send({
            from: addr,
            gas: estimateGas,
        }, function (error, result) {
            Toast.clear()
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        Toast.clear()
        errorToast(error, "Approve failed")
    }
    


}


function Authorizeds(addr,routerAddress, contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(baseABI, contractAddress);
    contractobj.methods.allowance(addr, routerAddress).call({}, function (error, result) {
        if (!error) {
            callback(Number(result));
        } else {
            callback(0)
        }
    });
}



async function transfer(addr, toAddr, amount,callback){
    try {
        await web3js.eth.sendTransaction({
            from: addr,
            to: toAddr,
            value: amount
        }).then(function (result) {
            Toast.clear()
            if (result) {
                callback(result.transactionHash)
            }
        })
    }catch (error) {
        errorToast(error,"Transfer failed")
    }
}

async function transferCoin(addr, toAddr, amount, contractAddress, callback){
    try {
        let contractobj = new web3js.eth.Contract(baseABI, contractAddress);
        var obj = contractobj.methods.transfer(toAddr,amount);
        var estimateGas = await obj.estimateGas({from: addr});
        obj.send({
            from: addr,
            gas: estimateGas,
        }, function (error, result) {
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        errorToast(error,"Transfer failed")
    }
}


async function safeTransferFrom(from, to, tokenId, contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(NFT_abi, contractAddress);
    var obj = contractobj.methods.safeTransferFrom(from,to,tokenId)
    try {
        var estimateGas = await obj.estimateGas({from: from});
        obj.send({
            from: from,
            gas: estimateGas,
        }).on('receipt', function(confirmationNumber, receipt){
            Toast.clear()
            callback(confirmationNumber.transactionHash)
        })
    }catch (error) {
        errorToast(error,"Transfer failed")
    }
}



async function buyItem(address, level, contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(NFT_abi, contractAddress);
    var obj = contractobj.methods.Buy(level)
    try {
        var estimateGas = await obj.estimateGas({from: address});
        obj.send({
            from: address,
            gas: estimateGas,
        }, function (error, result) {
            Toast.clear()
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        errorToast(error,"Buy failed")
    }
}


async function getNFTBalance(address, contractAddress,callback) {
    let contractobj = new web3js.eth.Contract(NFT_abi, contractAddress);
    contractobj.methods.balanceOf(address).call({}, function (error, result) {
        if (!error) {
            callback(result);
        } else {
            callback(0);
        }
    });
}


//tokenId 
async function tokenOfOwnerByIndex(address, index, contractAddress,callback) {
    let contractobj = new web3js.eth.Contract(NFT_abi, contractAddress);
    contractobj.methods.tokenOfOwnerByIndex(address,index).call({}, function (error, result) {
        if (!error) {
            callback(result);
        } 
    });
}

//level
async function itemLevelMap(tokenId, contractAddress,callback) {
    let contractobj = new web3js.eth.Contract(NFT_abi, contractAddress);
    contractobj.methods.itemLevelMap(tokenId).call({}, function (error, result) {
        if (!error) {
            callback(result);
        } 
    });
}

//pledged
async function pledgeMap(tokenId, contractAddress,callback) {
    let contractobj = new web3js.eth.Contract(NFT_abi, contractAddress);
    contractobj.methods.pledgeMap(tokenId).call({}, function (error, result) {
        if (!error) {
            callback(result);
        } 
    });
}

//alreadyBuy
async function alreadyBuy(address, contractAddress,callback) { 
    let contractobj = new web3js.eth.Contract(NFT_abi, contractAddress);
    contractobj.methods.alreadyBuy(address).call({}, function (error, result) {
        if (!error) {
            callback(result);
        } 
    });
}

//tokenURI
async function tokenURI(tokenId, contractAddress,callback) { 
    let contractobj = new web3js.eth.Contract(NFT_abi, contractAddress);
    contractobj.methods.tokenURI(tokenId).call({}, function (error, result) {
        if (!error) {
            callback(result);
        } 
    });
}

//tokenURI
async function ownerOfPage(address, contractAddress,callback) { 
    let contractobj = new web3js.eth.Contract(NFT_abi, contractAddress);
    contractobj.methods.ownerOfPage(address).call({}, function (error, result) {
        if (!error) {
            callback(result);
        } 
    });
}

async function pledge(address, tokenId, time, contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(NFT_abi, contractAddress);
    var obj = contractobj.methods.pledge(tokenId, time)
    try {
        var estimateGas = await obj.estimateGas({from: address});
        obj.send({
            from: address,
            gas: estimateGas,
        }, function (error, result) {
            Toast.clear()
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        errorToast(error,"Pledge failed")
    }
}


async function unlockNFT(address, tokenId,  contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(NFT_abi, contractAddress);
    var obj = contractobj.methods.unlock(tokenId)
    try {
        var estimateGas = await obj.estimateGas({from: address});
        obj.send({
            from: address,
            gas: estimateGas,
        }, function (error, result) {
            Toast.clear()
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        errorToast(error,"Unlock failed")
    }
}

function errorToast(error,msg){
    Toast.clear()
    var errStr = error.toString()
    if(errStr.indexOf("{") != -1) {
        var arr = errStr.split('{');
        var errObj = JSON.parse("{"+arr[1])
        if(errObj.message != null){
            Toast(errObj.message)
        }
    }else if(error.message != null){
        Toast(error.message)
    }else{
        Toast(msg)
    }
}

async function lock(addr, amount, defContractAddress, coinAddress, callback){
    let  contractobj = new web3js.eth.Contract(DEF_abi, defContractAddress);
    var  obj = contractobj.methods.lock(amount, coinAddress);
    try {
        var estimateGas = await obj.estimateGas({from: addr});
        obj.send({
            from: addr,
            gas: estimateGas,
        }).on('receipt', function(receipt){
            Toast.clear()
            callback(receipt.transactionHash)
        }).on('error', function(error, receipt){
            errorToast(error, "Lock failed")
        })
    }catch (error) {
        errorToast(error, "Lock failed")
    }
}

async function lockForFoundation(addr, amount, defContractAddress, callback){
    let  contractobj = new web3js.eth.Contract(DEF_abi, defContractAddress);
    var  obj = contractobj.methods.lockForFoundation(amount);
    try {
        var estimateGas = await obj.estimateGas({from: addr});
        obj.send({
            from: addr,
            gas: estimateGas,
        }).on('receipt', function(receipt){
            Toast.clear()
            callback(receipt.transactionHash)
        }).on('error', function(error, receipt){
            errorToast(error, "Lock failed")
        })
    }catch (error) {
        errorToast(error, "Lock failed")
    }
}


function getlocks(addr, defContractAddress, coinAddress, callback) {
    let contractobj = new web3js.eth.Contract(DEF_abi, defContractAddress);
        contractobj.methods.locks(addr,coinAddress).call({}, function (error, result) {
            if (!error) {
                callback(result);
            } 
        });
}

function getFoundationLocks(addr, defContractAddress, callback) {
    let contractobj = new web3js.eth.Contract(DEF_abi, defContractAddress);
        contractobj.methods.foundationLocks(addr).call({}, function (error, result) {
            if (!error) {
                callback(result);
            } 
        });
}

function stageDetails(defContractAddress, callback) {
    let contractobj = new web3js.eth.Contract(DEF_abi, defContractAddress);
        contractobj.methods.stageDetails().call({}, function (error, result) {
            if (!error) {
                callback(result);
            } 
        });
}

function levelMap(num,contractAddress,callback){
    let contractobj = new web3js.eth.Contract(NFT_abi, contractAddress);
        contractobj.methods.levelMap(num).call({}, function (error, result) {
            if (!error) {
                callback(result);
            } 
        });
}


async function defUnlock(addr, defContractAddress, coinAddress, callback){
    let contractobj = new web3js.eth.Contract(DEF_abi, defContractAddress);
    var obj = contractobj.methods.unlock(coinAddress);

    try {
        var estimateGas = await obj.estimateGas({from: addr});
        obj.send({
            from: addr,
            gas: estimateGas,
        }).on('receipt', function(receipt){
            Toast.clear()
            callback(receipt.transactionHash)
        }).on('error', function(error, receipt){
            errorToast(error, "Unlock failed")
        })
        
    }catch (error) {
        errorToast(error, "Unlock failed")
    }
}

async function unlockFoundation(addr, defContractAddress, callback){
    let contractobj = new web3js.eth.Contract(DEF_abi, defContractAddress);
    var obj = contractobj.methods.unlockFoundation();

    try {
        var estimateGas = await obj.estimateGas({from: addr});
        obj.send({
            from: addr,
            gas: estimateGas,
        }).on('receipt', function(receipt){
            Toast.clear()
            callback(receipt.transactionHash)
        }).on('error', function(error, receipt){
            errorToast(error, "Unlock failed")
        })
        
    }catch (error) {
        errorToast(error, "Unlock failed")
    }
}


async function withdrawCOIN(addr, defContractAddress, amount, callback){
    
}

async function getPreSaleDate(contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(pre_old_abi, contractAddress);

    contractobj.methods.getPreSaleDate().call({}, function (error, result) {
        if (!error) {
            callback(result);
        }else{
            console.log(error)
        }
    });
}

async function preSaleAddress(address, contractAddress,callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);
    

    contractobj.methods.preSaleAddress(address).call({}, function (error, result) {
        if (!error) {
            callback(result);
        } else {
            callback(0);
        }
    });
}


async function setPresaleStatus(address, contractAddress, status, callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);

    var obj = contractobj.methods.setPresaleStatus(status)
    try {
        var estimateGas = await obj.estimateGas({from: address});
        obj.send({
            from: address,
            gas: estimateGas,
        }, function (error, result) {
            Toast.clear()
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        errorToast(error,"Set failed")
    }
}

async function advanceStage(address, contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);
    
    var obj = contractobj.methods.advanceStage()
    try {
        var estimateGas = await obj.estimateGas({from: address});
        console.log(estimateGas)
        obj.send({
            from: address,
            gas: estimateGas,
        }, function (error, result) {
            Toast.clear()
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        errorToast(error,"Set failed")
    }
}

async function setVerify(address, contractAddress, user, status, amount, callback) {
    let contractobj =  new web3js.eth.Contract(pre_abi, contractAddress);
    var obj = contractobj.methods.setVerify(user, status)
    if(status){
        amount = 0;
    }

    try {
        var estimateGas = await obj.estimateGas({from: address,value: amount});

        obj.send({
            from: address,
            gas: estimateGas,
            value: amount,
        }, function (error, result) {
            Toast.clear()
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        errorToast(error,"Set failed")
    }
}




async function setwAddress(address, contractAddress, user, callback) {
    let contractobj =  new web3js.eth.Contract(white_abi, contractAddress);
    var obj = contractobj.methods.setIsWhite(user)
    try {
        var estimateGas = await obj.estimateGas({from: address});
        obj.send({
            from: address,
            gas: estimateGas,
        }, function (error, result) {
            Toast.clear()
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        errorToast(error,"Set failed")
    }
}








async function wAddress(address, contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(white_abi, contractAddress);
    contractobj.methods.whiteList(address).call({}, function (error, result) {
        if (!error) {
            callback(result);
        } else {
            callback(false);
        }
    });
}

async function nowStage( contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);
    contractobj.methods.nowStage().call({}, function (error, result) {
        if (!error) {
            callback(result);
        } else {
            callback(0);
        }
    });
}

async function stageUnlockRate(contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);
    contractobj.methods.stageUnlockRate().call({}, function (error, result) {
        if (!error) {
            callback(result);
        }
    });
}

async function marketDisAmount(contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);
    contractobj.methods.marketDisAmount().call({}, function (error, result) {
        if (!error) {
            callback(result);
        }
    });
}

async function getMarketPrice(contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);
    contractobj.methods.getMarketPrice().call({}, function (error, result) {
        if (!error) {
            callback(result);
        }
    });
}

async function getPresaleStatus(contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);
    contractobj.methods.presaleStatus().call({}, function (error, result) {
        if (!error) {
            callback(result);
        }
    });
}



async function getTradeCount(contractAddress,addr, callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);
    contractobj.methods.tradeCount(addr).call({}, function (error, result) {
        if (!error) {
            callback(result);
        }else{
            callback(0)
        }
    });
}

async function getInsidePrice(contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);
    contractobj.methods.getInsidePrice().call({}, function (error, result) {
        if (!error) {
            callback(result);
        }else{
            callback(0)
        }
    });
}

async function alreadyUnlockTrade(contractAddress, addr, callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);
    contractobj.methods.alreadyUnlockTrade(addr).call({}, function (error, result) {
        if (!error) {
            callback(result);
        }
    });
}

async function lockAmount(contractAddress, addr, callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);
    contractobj.methods.lockAmount(addr).call({}, function (error, result) {
        if (!error) {
            callback(result);
        }
    });
}

async function presaleUnlockTime(contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);
    contractobj.methods.presaleUnlockTime().call({}, function (error, result) {
        if (!error) {
            callback(result);
        }
    });
}





async function preSale(address, contractAddress, amount, callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);


    var obj = contractobj.methods.preSale()
    try {
        var estimateGas = await obj.estimateGas({from: address,value: amount});
        obj.send({
            from: address,
            gas: estimateGas,
            value: amount,
        }, function (error, result) {
            Toast.clear()
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        errorToast(error,"PreSale failed")
    }
}

async function preSaleBytoken(address, contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);

    var obj = contractobj.methods.preSaleBytoken()
    try {
        var estimateGas = await obj.estimateGas({from: address});
        obj.send({
            from: address,
            gas: estimateGas,
        }, function (error, result) {
            Toast.clear()
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        errorToast(error,"PreSale failed")
    }
}

async function trade(address, contractAddress, amount, callback) {
    let contractobj = new web3js.eth.Contract(pre_abi, contractAddress);
    var obj = contractobj.methods.trade()
    try {
        var estimateGas = await obj.estimateGas({from: address,value: amount});
        obj.send({
            from: address,
            gas: estimateGas,
            value: amount,
        }, function (error, result) {
            Toast.clear()
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        errorToast(error,"Trade failed")
    }
}

async function unlock(address, contractAddress, callback) {
    let contractobj= new web3js.eth.Contract(pre_abi, contractAddress);
 
    var obj = contractobj.methods.unlock()
    try {
        var estimateGas = await obj.estimateGas({from: address});
        obj.send({
            from: address,
            gas: estimateGas,
        }, function (error, result) {
            Toast.clear()
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        errorToast(error,"Unlock failed")
    }
}

async function tradeUnlock(address, contractAddress, callback) {
    let contractobj= new web3js.eth.Contract(pre_abi, contractAddress);
 
    var obj = contractobj.methods.tradeUnlock()
    try {
        var estimateGas = await obj.estimateGas({from: address});
        obj.send({
            from: address,
            gas: estimateGas,
        }, function (error, result) {
            Toast.clear()
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        errorToast(error,"Unlock failed")
    }
}

async function preSaleUnlock(address, contractAddress, callback) {
    let contractobj= new web3js.eth.Contract(pre_abi, contractAddress);
 
    var obj = contractobj.methods.preSaleUnlock()
    try {
        var estimateGas = await obj.estimateGas({from: address});
        obj.send({
            from: address,
            gas: estimateGas,
        }, function (error, result) {
            Toast.clear()
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        errorToast(error,"Unlock failed")
    }
}






async function getAmountsOut(amount, path, contractAddress, callback){
    let contractobj = new web3js.eth.Contract(router_abi, contractAddress);
    contractobj.methods.getAmountsOut(amount, path).call({}, function (error, result) {
        if (!error) {
            callback(result);
        }
    });
}

async function team(addr, contractAddress, callback){
    let contractobj = new web3js.eth.Contract(inv_abi, contractAddress);
    contractobj.methods.team(addr).call({}, function (error, result) {
        if (!error) {
            callback(result);
        } 
    });
}


async function bindParent(addr, toAddress, contractAddress, callback){
    let contractobj = new web3js.eth.Contract(inv_abi, contractAddress);
    var obj = contractobj.methods.bindParent(toAddress);

    try {
        var estimateGas = await obj.estimateGas({from: addr});
        obj.send({
            from: addr,
            gas: estimateGas,
        }).on('receipt', function(receipt){
            Toast.clear()
            callback(receipt.transactionHash)
        }).on('error', function(error, receipt){
            errorToast(error, "Bind failed")
        })
        
    }catch (error) {
        errorToast(error, "Bind failed")
    }
}

async function getData(addr,contractAddress, callback) {
    let contractobj = new web3js.eth.Contract(white_abi2, contractAddress);

    contractobj.methods.getData(addr).call({}, function (error, result) {
        if (!error) {
            callback(result);
        }
    });
}

async function setWiteBytoken(addr,contractAddress, num,callback) {
    let contractobj = new web3js.eth.Contract(white_abi2, contractAddress);
    
    var obj = contractobj.methods.setWiteBytoken(num)
    try {
        var estimateGas = await obj.estimateGas({from: addr});

        obj.send({
            from: addr,
            gas: estimateGas,
        }, function (error, result) {
            Toast.clear()
            if (!error) {
                callback(result)
            }
        });
    }catch (error) {
        errorToast(error,"Donate failed")
    }
}




function formatnumber(value, num) {
    var a, b, c, i;
    a = value.toString();
    b = a.indexOf(".");
    c = a.length;
    if (num == 0) {
        if (b != -1) {
            a = a.substring(0, b);
        }
    } else {
        if (b == -1) {
        } else {
            var a_s = a.substring(0, b);
            var a_e =  a.substring(b+1, b + num + 1);
            a_e = a_e.replace(/(0+)\b/gi,"")
            if(a_e.length == 0){
                a = a_s
            }else{
                a = a_s + '.' + a_e
            }
        
        }
    }
    return a;
}

function fitterNum(value, num){
    if(value == null){
        return 0
    }
    if(value >= 1000000000){
        return value = formatnumber((value / 1000000000),2) + 'B'
    }
    else if(value >= 100000){
        return value = formatnumber((value / 100000),2) + 'M'
    }
    else{
        return formatnumber(value,num)
    }
}

function toNonExponential(num) {
    let m = num.toExponential().match(/\d(?:.(\d*))?e([+-]\d+)/);
    return num.toFixed(Math.max(0, (m[1] || "").length - m[2]));
}

function scientificToString(param) {
    let strParam = String(param)
    let flag = /e/.test(strParam)
    if (!flag) return param
    let sysbol = true
    if (/e-/.test(strParam)) {
        sysbol = false
    }

    let index = Number(strParam.match(/\d+$/)[0])
    let basis = strParam.match(/^[\d\.]+/)[0].replace(/\./, '')

    if (sysbol) {
        return basis.padEnd(index + 1, 0)
    } else {
        return basis.padStart(index + basis.length, 0).replace(/^0/, '0.')
    }
}

export default {
    Init,
    setWeb3Provider,
    getBalance,
    getDbBalance,
    sign,
    Approve,
    Authorizeds,

    transfer,
    transferCoin,
    

    buyItem,
    getNFTBalance,
    tokenOfOwnerByIndex,
    itemLevelMap,
    pledgeMap,
    tokenURI,
    safeTransferFrom,
    ownerOfPage,
    alreadyBuy,



    formatnumber,
    fitterNum,
    scientificToString,
    toNonExponential,
    pledge,
    unlock,
    levelMap,
    unlockNFT,


    preSale,
    preSaleBytoken,
    wAddress,
    lock,
    getlocks,
    defUnlock,
    nowStage,
    stageUnlockRate,

    getFoundationLocks,
    lockForFoundation,
    stageDetails,
    unlockFoundation,

    withdrawCOIN,
    bindParent,
    team,

    getPreSaleDate,
    preSaleAddress,
    signMsg,
    getAmountsOut,
    lockAmount,

    setPresaleStatus,
    advanceStage,
    setwAddress,
    marketDisAmount,
    getMarketPrice,
    trade,
    setVerify,
    getPresaleStatus,
    getTradeCount,
    getInsidePrice,
    alreadyUnlockTrade,
    tradeUnlock,
    preSaleUnlock,
    presaleUnlockTime,

        
    getData,
    setWiteBytoken,
}
