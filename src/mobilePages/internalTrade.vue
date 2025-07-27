<template>
    <div class="content">
        <van-nav-bar title="" @click-right="onClickRight" :border="false" fixed safe-area-inset-top placeholder>
            <template #left>
            </template>
            <template #right>
                <div class="address"><img src="../assets/image/bsc.png">
                    <div>{{showAddress}}</div>
                </div>
                <img :src="lanImg" alt="">
            </template>

        </van-nav-bar>


        <div class="swap">

            <div class="casting">
                <div class="casting_tit">
                    <div class="tit_box">
                        <div class="casting_left">
                            <img :src="coinObj.img" />
                            <div>{{ coinObj.text }}</div>
                        </div>
                        <div class="casting_right">
                            <img src="../assets/image/ing2.png" alt="" />
                            <div v-if="coinObj.openState == 1">{{ $t("trade.trade15") }}</div>
                            <div v-if="coinObj.openState == 0">{{ $t("trade.trade14") }}</div>
                            <div v-if="coinObj.openState == 2 || coinObj.openState == 3 || coinObj.openState == 4">
                                {{ $t("trade.trade13") }}</div>
                        </div>
                    </div>

                    <div class="cas_time">
                        <!-- <div class="time_itm">
              <img src="../assets/image/time1.png" alt="" />
              <div>Ends in <span></span></div>
            </div>
            <div class="time_itm ml">
              <img src="../assets/image/time2.png" alt="" />
              <div>Duration: <span></span></div>
            </div> -->
                    </div>
                </div>

                <div class="cas_mess">
                    <div class="lab">
                        {{ $i18n.locale=='en'?coinObj.introduceEn:coinObj.introduce }}
                    </div>
                    <div class="information">
                        <img src="../assets/image/contact1.png" v-if="coinObj.twitter != null"
                            @click="goLink(coinObj.twitter)" alt="" />
                        <img src="../assets/image/contact2.png" v-if="coinObj.telegram != null"
                            @click="goLink(coinObj.telegram)" alt="" />
                    </div>
                </div>

                <div class="timer_box" v-if="coinObj.openState == 0 && coinObj.timer != null">
                    <div class="timer">
                        <div class="timer_tit">{{ $t("trade.trade16") }}</div>
                        <div class="tim_item">
                            <div>{{ coinObj.day }}</div>
                            <span>{{ $t("trade.trade17") }}</span>
                            <div>{{ coinObj.hr }}</div>
                            <span>{{ $t("trade.trade18") }}</span>
                            <div>{{ coinObj.min }}</div>
                            <span>{{ $t("trade.trade19") }}</span>
                            <div>{{ coinObj.sec }}</div>
                            <span>{{ $t("trade.trade20") }}</span>
                        </div>
                    </div>
                </div>

                <div class="casting_content">
                    <div class="casting_lab">{{ coinObj.progressValue }}%</div>
                    <div class="casting_bar"
                        :style="{ 'background-image': `url(${require('@/assets/image/jindu.png')})` }">
                        <div class="progressbar" :style="{ width: 100 - coinObj.progressValue + '%' }"></div>
                    </div>



                    <div class="num" v-if="coinObj.openState != 3">
                        <img src="../assets/image/jian.png" alt="" @click="reduce()" />
                        <div>{{ $Contract.toNonExponential((preSaleEthAmount* frequency))}}
                            {{presaleType == 2?"GOUT":"BNB"}}</div>
                        <img src="../assets/image/jia.png" alt="" @click="add()" />
                    </div>

                    <div class="price">
                        <div class="lef">
                            <img src="../assets/image/pr.png" alt="" />
                            <div>{{ $t("trade.trade21") }}</div>
                        </div>
                        <div class="rig" v-if="presaleType == 1">Balance : {{ bnbBalance }} BNB</div>

                        <div class="rig" v-else>Balance : {{ $Contract.fitterNum(GOUTBalance, 2) }} GOUT</div>




                    </div>

                    <div class="zhuzao">
                        {{ $t("trade.trade22") }}{{ $number.accMul(preSaleEthAmount, buyNumber) }}
                        {{presaleType == 2?"GOUT":"BNB"}}
                    </div>

                    <div>
                        <div class="clab">
                            <div class="clab_lef">
                                <div>Raised</div>
                            </div>
                            <div class="clab_rig">
                                {{  buyNumber }} /
                                {{ totalNumber }}
                            </div>
                        </div>
                        <div class="clab">
                            <div class="clab_lef">
                                <div>Supply</div>
                            </div>
                            <div class="clab_rig">
                                {{preSaleCount}}
                            </div>
                        </div>
                        <div class="clab">
                            <div class="clab_lef">
                                <div>Max</div>
                            </div>
                            <div class="clab_rig">
                                {{ $number.accMul(preSaleEthAmount, preSaleMaxNum) }} {{presaleType == 2?"GOUT":"BNB"}}
                            </div>
                        </div>
                        <div class="clab">
                            <div class="clab_lef">
                                <div>Min</div>
                            </div>
                            <div class="clab_rig">{{ preSaleEthAmount }} {{presaleType == 2?"GOUT":"BNB"}}</div>
                        </div>

                        <div class="casting_btn"
                            v-if="coinObj.openState == 1 && !isPresale && preSaleCount < preSaleMaxNum"
                            @click="preSale()">
                            {{ presaleType == 2?$t("pledge.pledge15"):$t("trade.trade12") }}</div>
                        <div class="casting_btn2"
                            v-else-if="coinObj.openState == 1 && isPresale && preSaleCount < preSaleMaxNum">
                            {{ presaleType == 2?$t("pledge.pledge15"):$t("trade.trade12") }}</div>
                        <div class="casting_btn2" v-else-if="coinObj.openState == 1 && preSaleCount >=  preSaleMaxNum">
                            {{ presaleType == 2?$t("trade.trade50"):$t("trade.trade51") }}</div>



                        <div class="casting_btn2" v-if="coinObj.openState == 0">{{ $t("trade.trade14") }}</div>
                        <div class="casting_btn3"
                            v-if="coinObj.openState == 2 || coinObj.openState == 3 || coinObj.openState == 4">
                            {{ $t("trade.trade13") }}
                        </div>

                        <div class="coin_price">{{ $t("trade.trade36") }}: {{preSaleEthAmount}}
                            {{presaleType == 2?"GOUT":"BNB"}} ≈
                            {{coinAmount}} {{coinObj.text}}

                        </div>
                        <div class="coin_msg">{{ $t("trade.trade45") }} </div>

                        <div class="clab" v-if="presaleType == 2 && presaleUnlockAmount != 0">
                            <div class="clab_lef">
                                <div>Need Unlock: </div>
                            </div>
                            <div class="clab_rig">{{ presaleUnlockAmount }} GOUT</div>
                        </div>

                        <div class="clab" v-if="presaleType == 2 && presaleUnlockAmount != 0 && pretimer != null">
                            <div class="clab_lef">
                                <div>Unlock countdown: </div>
                            </div>
                            <div class="clab_rig">{{ preObj.day }} D : {{ preObj.hr }} H : {{ preObj.min }} M :
                                {{ preObj.sec }} S
                            </div>
                        </div>


                        <div class="unlock2"
                            v-if="presaleType == 2 && presaleUnlockAmount != 0 && presaleUnlockTime > time"
                            @click="presaleUnlock()">
                            {{ $t("trade.trade29") }}
                        </div>
                        <div class="unlock"
                            v-if="presaleType == 2 && presaleUnlockAmount != 0 && presaleUnlockTime < time">
                            {{ $t("trade.trade29") }}
                        </div>
                    </div>
                </div>
            </div>

            <van-popup v-model="show" class="authorization_box">
                <div class="rec_top">
                    <div></div>
                    <div>{{ $t('dest.dest15') }}</div>
                    <img src="../assets/image/close3.png" alt="" @click="show=false">
                </div>

                <div class="rec_body">
                    <div class="step">
                        <img v-if="step == 1" src="../assets/image/step1.png" alt="">
                        <img v-else src="../assets/image/step2.png" alt="">
                        <div class="btn">
                            <div class="adopt" @click="contractStep(1)">{{step==2?$t('dest.dest16'):$t('dest.dest15')}}
                            </div>
                            <div :class="step==2?'adopt':'wait'" @click="contractStep(2)">{{ $t('pledgelp.pledge1') }}
                            </div>
                        </div>
                    </div>
                    <div class="message">{{ $t('dest.dest17') }}</div>
                </div>

            </van-popup>

            <div class="casting" v-if="verify == true || wVerify == true">
                <div class="casting_tit">
                    <div class="tit_box">
                        <div class="casting_left">
                            <img :src="coinObj.img" />
                            <div>{{ coinObj.text }} {{ $t("trade.trade44") }}</div>
                        </div>

                    </div>

                </div>
                <div class="casting_content">


                    <div class="num">
                        <img src="../assets/image/jian.png" alt="" @click="reduce()" />
                        <div>{{ $Contract.toNonExponential((tadeEthAmount* frequency) )}} BNB</div>
                        <img src="../assets/image/jia.png" alt="" @click="add()" />
                    </div>
                    <div class="price">
                        <div class="lef">
                        </div>
                        <div class="rig">Balance : {{ bnbBalance }} BNB</div>
                    </div>
                    <div class="price">
                        <div class="lef">

                        </div>
                        <div class="rig">{{ coinObj.text }} Balance : {{ coinBalance }} {{ coinObj.text }}</div>
                    </div>


                    <div>
                        <div class="casting_btn" v-if="this.coinObj.tradeState == 3" @click="trade()">
                            {{ $t("detail.detail7") }}
                        </div>
                        <div class="casting_btn2" v-else-if="this.coinObj.tradeState == 4">{{ $t("trade.trade13") }}
                        </div>
                        <div class="casting_btn2" v-else>{{ $t("trade.trade14") }}</div>
                        <div class="coin_price">{{ $t("trade.trade36") }}: 0.1 BNB ≈
                            {{$Contract.fitterNum(coinPrice, 4)}}
                            {{coinObj.text}}</div>
                    </div>
                    <div v-if="tradeNum != 0 && this.insideType == 2">
                        <div class="clab">
                            <div class="clab_lef">
                                <div>{{ $t("trade.trade46") }}</div>
                            </div>
                            <div class="clab_rig">
                                0.1 BNB ≈ {{tradePrice*0.1}} {{coinObj.text}}
                            </div>
                        </div>
                        <div class="clab">
                            <div class="clab_lef">
                                <div>{{ $t("trade.trade47") }}</div>
                            </div>
                            <div class="clab_rig">
                                {{tradeNum}} {{ $t("trade.trade48") }}
                            </div>
                        </div>
                        <div class="unlock" v-if="this.coinObj.tradeState == 3 ">{{ $t("trade.trade27") }}
                        </div>
                        <div class="unlock2" v-if="this.coinObj.tradeState == 4" @click="tradeUnlock()">
                            {{ $t("trade.trade29") }}</div>
                    </div>



                </div>
            </div>

            <div class="clain_box">
                <div class="clain" v-if="preSaleCount != 0">
                    <div class="cla_hed">
                        <div class="lef">
                            <img :src="coinObj.img" />
                            <div>{{ coinObj.text }}</div>
                        </div>
                        <div class="rig">
                            <div>{{ $t("trade.trade24") }}</div>
                        </div>
                    </div>

                    <div class="cla_bld">
                        <div class="timer_box">
                            <!-- <div class="timer" v-if="coinObj.timer2 != null">
                <div class="timer_tit">{{ $t("trade.trade23") }}</div>
                <div class="tim_item">
                  <div>{{ coinObj.day1 }}</div>
                  <span>{{ $t("trade.trade17") }}</span>
                  <div>{{ coinObj.hr1 }}</div>
                  <span>{{ $t("trade.trade18") }}</span>
                  <div>{{ coinObj.min1 }}</div>
                  <span>{{ $t("trade.trade19") }}</span>
                  <div>{{ coinObj.sec1 }}</div>
                  <span>{{ $t("trade.trade20") }}</span>
                </div>
              </div> -->

                            <div class="clab">
                                <div class="clab_lef">
                                    <div>{{ $t("trade.trade25") }}</div>
                                </div>
                                <div class="clab_rig">
                                    {{preSaleCount}}
                                </div>
                            </div>

                            <div class="clab">
                                <div class="clab_lef">
                                    <div>{{ $t("trade.trade26") }}</div>
                                </div>
                                <div class="clab_rig">
                                    {{ $Contract.formatnumber(coinAmount*preSaleCount,2)}}
                                    {{coinObj.text}}
                                </div>
                            </div>
                            <div>
                                <div class="clab">
                                    <div class="clab_lef">
                                        <div>{{ $t("trade.trade38") }}</div>
                                    </div>
                                    <div class="clab_rig">
                                        {{ $t("trade.trade39") }} {{nowStage}} {{ $t("trade.trade40") }}
                                    </div>
                                </div>
                                <div class="clab">
                                    <div class="clab_lef">
                                        <div>{{ $t("trade.trade41") }}</div>
                                    </div>
                                    <div class="clab_rig">
                                        {{stageUnlockRate/10}} %
                                    </div>
                                </div>
                                <div class="clab">
                                    <div class="clab_lef">
                                        <div>{{ $t("trade.trade42") }}</div>
                                    </div>
                                    <div class="clab_rig">
                                        {{$Contract.formatnumber(hasUnlockAmount,2)}} {{coinObj.text}}
                                    </div>
                                </div>
                                <div class="clab">
                                    <div class="clab_lef">
                                        <div>{{ $t("trade.trade43") }}</div>
                                    </div>
                                    <div class="clab_rig">
                                        {{$Contract.formatnumber(coinAmount*preSaleCount*(nowStage - stage)*stageUnlockRate/1000,2) }}
                                        {{coinObj.text}}
                                    </div>
                                </div>
                                <div class="unlock" v-if="coinObj.openState == 1 || coinObj.openState == 2">
                                    {{ $t("trade.trade27") }}
                                </div>
                                <div class="unlock2" v-if="coinObj.openState >= 3 && nowStage - stage > 0"
                                    @click="unlock()">
                                    {{ $t("trade.trade29") }}</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </div>
</template>

<script>
    import {
        Toast
    } from "vant";

    export default {
        name: "preSale",
        data() {
            return {
                address: "",
                showAddress: "",
                lanImg: "",

                bnbBalance: 0,
                coinBalance: 0,
                GOUTBalance: 0,
                coinAllowance: 0,
                coinName: "",
                time: 0,
                show: false,
                step: 1,
                presaleUnlockTime: 0,
                pretimer: null,
                preObj: {
                    day: "",
                    hr: "",
                    min: "",
                    sec: "",
                },


                preSaleEthAmount: 0,
                tadeEthAmount: 0,
                preSaleMaxNum: 0,
                coinAmount: 0,
                buyNumber: 0,
                totalNumber: 0,
                preSaleCount: 0,
                hasUnlockAmount: 0,
                presaleUnlockAmount: 0,
                nowStage: 0,
                stage: 0,
                stageUnlockRate: 0,
                insideType: 1,
                presaleType: 1,

                isPresale: false,
                frequency: 1,
                coinPrice: 0,

                tradeNum: 0,
                tradePrice: 0,
                alreadyUnlockTrade: false,

                coinObj: {
                    text: "",
                    img: "",
                    presaleContractAddress: "",
                    contractAddress: "",



                    openState: 0,
                    tradeState: 0,
                    introduce: "",
                    introduceEn: "",
                    twitter: '',
                    telegram: '',
                    website: '',
                    progressValue: 0,

                },
                verify: false,
                wVerify: false,

            };
        },
        created() {
            this.coin = ""
            this.$Contract.setWeb3Provider()
            this.$i18n.locale = "tc"

        },
        mounted() {
            this.linkWallet()
            this.time = Date.parse(new Date())

            let locale = this.$i18n.locale
            if (locale == 'tc') {
                this.lanImg = require('../assets/img/lan_tc.png')
            } else if (locale == 'en') {
                this.lanImg = require('../assets/img/lan_en.png')
            } else if (locale == 'cn') {
                this.lanImg = require('../assets/img/lan_cn.png')
            }

        },

        watch: {},
        methods: {
            async linkWallet() {
                this.$Contract.Init(res => {
                    let account = res
                    this.address = account;
                    this.showAddress = account.replace(/([\w]{6})[\w\W]+([\w]{4})$/, '$1...$2')
                    this.getPreSaleDate()
                })
            },

            async getPreSaleDate() {
                this.getBalance()
                
                this.$Contract.nowStage(this.coinObj.presaleContractAddress, res => {
                    this.nowStage = res
                })
                this.$Contract.stageUnlockRate(this.coinObj.presaleContractAddress, res => {
                    this.stageUnlockRate = res
                })


                let value = this.$number.accMul(0.1, Math.pow(10, 18));
                let valueStr = this.$Contract.scientificToString(value).toString();
                this.$Contract.getAmountsOut(
                    valueStr,
                    [window.config.WBNB.contract, this.coinObj.contractAddress],
                    window.config.routerAddress,
                    (res) => {
                        this.coinPrice = (this.$number.accDiv(res[1], Math.pow(10, 18)))
                    }
                );

                this.$Contract.getPreSaleDate(this.coinObj.presaleContractAddress, (res) => {
                    console.log(res)
                    this.coinObj.openState = res[0];
                    this.preSaleEthAmount = this.$number.accDiv(res[1], Math.pow(10, 18));

                    this.preSaleMaxNum = res[2];
                    this.buyNumber = Number(res[3]);
                    this.totalNumber = Number(res[4]);
                    this.coinAmount = this.$number.accDiv(res[5], Math.pow(10, 18));

                    if (typeof res[6] != 'undefined') {
                        this.insideType = Number(res[6])
                    } else {
                        this.insideType = 2
                    }
                    if (typeof res[7] != 'undefined') {
                        this.presaleType = Number(res[7])
                    } else {
                        this.presaleType = 1
                    }
                    if (typeof res[8] != 'undefined') {
                        this.tadeEthAmount = this.$number.accDiv(res[8], Math.pow(10, 18));
                    } else {
                        this.tadeEthAmount = this.preSaleEthAmount
                    }


                    if (this.insideType == 2) {
                        
                        this.getInsideDate(this.coinObj.presaleContractAddress)
                        
                    }
                    if (this.presaleType == 2) {
                        this.getPreSaleLockDate()
                    }

                    if (res[0] == 0) {
                        this.coinObj.progressValue = 0;
                    } else {
                        this.coinObj.progressValue = this.subStringNum((res[3] / res[4]) * 100, 2);
                    }

                    if (res[0] == 0 && this.coinObj.presaleTime > this.time) {
                        this.coinObj.timer = setInterval(() => {
                            this.countdown(1);
                        }, 1000);
                    } else if (res[0] != 0 && this.coinObj.presaleEndTime > this.time) {
                        // this.coinObj.timer2 = setInterval(() => {
                        //   this.countdown(2);
                        // }, 1000);
                    } else {
                        this.coinObj.timer = null;
                        this.coinObj.timer2 = null;
                    }

                });

                this.$Contract.preSaleAddress(this.address, this.coinObj.presaleContractAddress, (
                    res) => {

                    this.preSaleCount = res.preSaleCount;

                    this.verify = res.verify
                    this.hasUnlockAmount = this.$number.accDiv(res.hasUnlockAmount, Math.pow(10, 18));
                    this.stage = res.stage
                });


            },

            async getInsideDate(contract) {
                //presaleStatus
                
                this.coinObj.tradeState = this.coinObj.openState
                


                this.$Contract.getTradeCount(contract, this.address, (res) => {
                    this.tradeNum = res
                })
                this.$Contract.getInsidePrice(contract, (res) => {
                    this.tradePrice = res
                })
                this.$Contract.wAddress(this.address, window.config.whiteContractAddress, (res) => {
                    this.wVerify = res
                })
            },

            async getPreSaleLockDate() {
                this.$Contract.lockAmount(this.coinObj.presaleContractAddress, this.address, (
                    res) => {
                    this.presaleUnlockAmount = this.$number.accDiv(res, Math.pow(10, 18))
                });

                this.$Contract.presaleUnlockTime(this.coinObj.presaleContractAddress, (
                    res) => {
                    this.presaleUnlockTime = Number(res) * 1000
                    if (res != 0 && this.presaleUnlockTime > this.time) {
                        this.pretimer = setInterval(() => {
                            this.countdown(3);
                        }, 1000);
                    }
                });

            },

            async getBalance() {
                this.$Contract.getBalance(this.address, (res) => {
                    this.bnbBalance = res.toFixed(4);
                });

                this.$Contract.getDbBalance(this.address, this.coinObj.contractAddress, res => {
                    this.coinBalance = res / Math.pow(10, 18)
                })

                this.$Contract.getDbBalance(this.address, window.config.GOUT.contract, res => {
                    this.GOUTBalance = res / Math.pow(10, 18)
                })
            },

            async getAllowance(approveAddress, contractAddress, precision) {
                return new Promise((resolve) => {
                    this.$Contract.Authorizeds(
                        this.address,
                        approveAddress,
                        contractAddress,
                        (res) => {
                            resolve(res / Math.pow(10, precision));
                        }
                    );
                });
            },

            async contractStep(now) {

                if (now > this.step) {
                    return;
                }
                if (now == 1) {
                    let need = this.$number.accMul(
                        this.$number.accMul(this.preSaleEthAmount, this.frequency),
                        Math.pow(10, 18)
                    );
                    let value = this.$Contract.scientificToString(need).toString();
                    this.loadingShow(this.$t('buyToken.buy32'));
                    this.$Contract.Approve(
                        this.address,
                        this.coinObj.presaleContractAddress,
                        value,
                        window.config.COIN.contract,
                        (res) => {
                            Toast.clear();
                            this.loadingShow(this.$t('buyToken.buy33'));
                            setTimeout(() => {
                                Toast.clear();
                                this.step = 2;
                            }, 10000);
                        }
                    );
                } else if (now == 2) {
                    this.loadingShow("Pledge...");
                    this.$Contract.preSaleBytoken(this.address, this.coinObj.presaleContractAddress, (hash) => {
                        if (hash) {
                            this.show = false
                            Toast(this.$t('trade.trade32'))
                            this.getPreSaleDate();
                        }
                    });


                }

            },

            async preSale() {

                if (Number(this.preSaleCount) + this.frequency > Number(this.preSaleMaxNum)) {
                    Toast(this.$t('trade.trade34'));
                    return
                }

                if (this.coinObj.openState != 1) {
                    this.$toast(this.$t('trade.trade31'));
                    return;
                }

                if (this.preSaleEthAmount == 0 || this.coinObj.presaleContractAddress.length == 0) {
                    this.$toast("Failed");
                    return;
                }


                if (this.presaleType == 1) {
                    this.isPresale = true;
                    this.loadingShow("Transfer...");
                    let value = this.$number.accMul(
                        this.$number.accMul(this.preSaleEthAmount, this.frequency),
                        Math.pow(10, 18)
                    );
                    let valueStr = this.$Contract.scientificToString(value).toString();
                    this.$Contract.preSale(this.address, this.coinObj.presaleContractAddress, valueStr, (hash) => {
                        if (hash) {
                            Toast(this.$t('trade.trade32'))
                            this.getPreSaleDate();
                        }
                    });
                } else {

                    let value = this.$number.accMul(this.preSaleEthAmount, this.frequency)
                    this.coinAllowance = await this.getAllowance(this.coinObj.presaleContractAddress, window.config
                        .COIN
                        .contract, 18)


                    if (Number(this.coinAllowance) >= Number(value) && Number(value) != 0) {
                        this.step = 2;
                    } else {
                        this.step = 1;
                    }

                    this.show = true;
                }
            },

            async trade() {
                if (this.coinObj.tradeState != 3) {
                    this.$toast("You cant internal trade");
                    return;
                }

                if (this.tadeEthAmount == 0) {
                    this.$toast("Failed");
                    return;
                }

                this.loadingShow("Transfer...");
                let value = this.$number.accMul(
                    this.$number.accMul(this.tadeEthAmount, this.frequency),
                    Math.pow(10, 18)
                );
                let valueStr = this.$Contract.scientificToString(value).toString();
                let contract = this.coinObj.presaleContractAddress
            
                this.$Contract.trade(this.address, contract, valueStr, (hash) => {
                    if (hash) {
                        this.preSaleCount = this.frequency
                        Toast("Buy success")
                        this.getBalance();
                    }
                });
            },

            //unlock
            async unlock() {
                this.loadingShow("Unlock...");
                this.$Contract.unlock(this.address, this.coinObj.presaleContractAddress, (res) => {
                    if (res) {
                        Toast(this.$t('trade.trade35'))
                        this.swapCoinList();
                    }
                });
            },
            async tradeUnlock() {
                this.loadingShow("Unlock...");
                let contract = this.coinObj.presaleContractAddress
               
                this.$Contract.tradeUnlock(this.address, contract, (res) => {
                    if (res) {
                        Toast(this.$t('trade.trade35'))
                        this.swapCoinList();
                    }
                });
            },
            async presaleUnlock() {
                this.loadingShow("Unlock...");
                this.$Contract.preSaleUnlock(this.address, this.coinObj.presaleContractAddress, (res) => {
                    if (res) {
                        Toast(this.$t('trade.trade35'))
                        this.swapCoinList();
                    }
                });
            },

            //unit
            reduce() {
                if (this.frequency == 1) {
                    return;
                } else {
                    this.frequency--;
                }
            },
            add() {
                if (this.buyNumber + this.frequency >= this.totalNumber) {
                    Toast(this.$t('trade.trade33'));
                    return;
                }

                if (Number(this.preSaleCount) + this.frequency + 1 > Number(this.preSaleMaxNum)) {
                    Toast(this.$t('trade.trade34'));
                    return
                } else {
                    this.frequency++;
                }
            },
            subStringNum(a, num) {
                var a_type = typeof a;
                var aArr;
                if (a_type == "number") {
                    var aStr = a.toString();
                    aArr = aStr.split(".");
                } else if (a_type == "string") {
                    aArr = a.split(".");
                }

                if (aArr.length > 1) {
                    a = aArr[0] + "." + aArr[1].substr(0, num);
                }
                return a;
            },
            countdown(type) {

                var end = 0
                if (type == 1) {
                    end = this.coinObj.presaleTime
                } else if (type == 2) {
                    end = this.coinObj.presaleEndTime
                } else if (type == 3) {
                    end = this.presaleUnlockTime
                }
                const now = Date.parse(new Date());

                const msec = end - now;
                if (msec < 0) {
                    if (type == 1) {
                        clearInterval(this.coinObj.timer);
                        obj.timer = null;
                    } else if (type == 2) {
                        clearInterval(this.coinObj.timer2);
                        obj.timer2 = null;
                    } else if (type == 3) {
                        clearInterval(this.pretimer);
                        this.pretimer = null;
                    }
                    return;
                }

                let day = parseInt(msec / 1000 / 60 / 60 / 24);
                let hr = parseInt((msec / 1000 / 60 / 60) % 24);
                let min = parseInt((msec / 1000 / 60) % 60);
                let sec = parseInt((msec / 1000) % 60);

                hr = hr > 9 ? hr : "0" + hr;
                min = min > 9 ? min : "0" + min;
                sec = sec > 9 ? sec : "0" + sec;
                if (type == 1) {
                    this.coinObj.day = day
                    this.coinObj.hr = hr
                    this.coinObj.min = min
                    this.coinObj.sec = sec
                } else if (type == 2) {
                    this.coinObj.day1 = day
                    this.coinObj.hr1 = hr
                    this.coinObj.min1 = min
                    this.coinObj.sec1 = sec
                } else if (type == 3) {
                    this.preObj.day = day
                    this.preObj.hr = hr
                    this.preObj.min = min
                    this.preObj.sec = sec
                }



            },
            goLink(url) {
                window.location.href = url
            },
            loadingShow(text) {
                Toast.loading({
                    message: text,
                    forbidClick: true,
                    duration: 0,
                });
            },
            onClickRight() {
                let locale = localStorage.locale;
                if (locale == 'tc') {
                    this.$i18n.locale = "en"
                    localStorage.locale = 'en'
                    this.lanImg = require('../assets/img/lan_en.png')
                } else {
                    this.$i18n.locale = "tc"
                    localStorage.locale = 'tc'
                    this.lanImg = require('../assets/img/lan_tc.png')
                }



            },

        },
        components: {

        },
    };
</script>

<style lang="scss" scoped>
    @import "./src/assets/css/pledge2";
</style>