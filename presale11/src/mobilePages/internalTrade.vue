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
                        <div>{{ toNonExponential((preSaleEthAmount* frequency))}}
                            TRX</div>
                        <img src="../assets/image/jia.png" alt="" @click="add()" />
                    </div>

                    <div class="price">
                        <div class="lef">
                            <img src="../assets/image/pr.png" alt="" />
                            <div>{{ $t("trade.trade21") }}</div>
                        </div>
                        <div class="rig">Balance : {{ bnbBalance }} TRX</div>




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
                            <div class="clab_rig">{{ preSaleEthAmount }} TRX</div>
                        </div>

                        <div class="casting_btn"
                            v-if="coinObj.openState == 1 && !isPresale && preSaleCount < preSaleMaxNum"
                            @click="preSale()">
                            {{ $t("trade.trade12") }}</div>
                        <div class="casting_btn2"
                            v-else-if="coinObj.openState == 1 && isPresale && preSaleCount < preSaleMaxNum">
                            {{ $t("trade.trade12") }}</div>
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


                        <!-- TRON解锁按钮 -->
                        <div class="unlock-tron"
                            v-if="coinObj.openState >= 2 && hasUnlockAmount > 0"
                            @click="goToUnlockPage()">
                            🔓 解锁代币
                        </div>

                        <!-- 原有的解锁按钮（保留兼容性） -->
                        <div class="unlock2"
                            v-if="presaleType == 2 && presaleUnlockAmount != 0 && presaleUnlockTime > time"
                            @click="presaleUnlock()">
                            {{ $t("trade.trade29") }}
                        </div>
                        <div class="unlock"
                            v-if="presaleType == 2 && presaleUnlockAmount != 0 && presaleUnlockTime < time"
                            @click="unlock()">
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

        <!-- 交易进度指示器 -->
        <div v-if="showTransactionProgress" class="transaction-progress">
            <div class="progress-spinner"></div>
            <div class="progress-text">{{ transactionProgressText }}</div>
            <div class="progress-detail">{{ transactionProgressDetail }}</div>
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

                // 状态同步相关
                statusSyncTimer: null,
                lastStatusCheck: 0,

                // 移动端用户体验相关
                isOnline: navigator.onLine,
                showTransactionProgress: false,
                transactionProgressText: '',
                transactionProgressDetail: ''

            };
        },
        created() {
            this.coin = ""
            // 移除BSC相关的Web3Provider设置
            this.$i18n.locale = "tc"

            // 从URL参数获取合约地址信息
            this.initFromUrlParams()
        },
        mounted() {
            this.linkTronWallet()
            this.time = Date.parse(new Date())

            let locale = this.$i18n.locale
            if (locale == 'tc') {
                this.lanImg = require('../assets/img/lan_tc.png')
            } else if (locale == 'en') {
                this.lanImg = require('../assets/img/lan_en.png')
            } else if (locale == 'cn') {
                this.lanImg = require('../assets/img/lan_cn.png')
            }

            // 启动状态同步
            this.startStatusSync()

            // 初始化移动端优化
            this.initMobileOptimizations()
        },

        beforeDestroy() {
            // 清理状态同步定时器
            this.stopStatusSync()

            // 清理事件监听器
            window.removeEventListener('online', this.handleOnline)
            window.removeEventListener('offline', this.handleOffline)
        },

        watch: {},
        methods: {
            // 智能初始化合约地址信息
            async initFromUrlParams() {
                try {
                    // 导入配置函数
                    const { getProjectContracts } = await import('../tron/config/index.js')

                    const urlParams = new URLSearchParams(window.location.search)
                    const projectContracts = getProjectContracts(urlParams)

                    // 设置合约地址
                    this.coinObj.contractAddress = projectContracts.TOKEN_ADDRESS
                    this.coinObj.presaleContractAddress = projectContracts.PRESALE_ADDRESS
                    this.coinObj.text = projectContracts.PROJECT_SYMBOL
                    this.coinObj.introduce = `${projectContracts.PROJECT_NAME} 预售`
                    this.coinObj.introduceEn = `${projectContracts.PROJECT_NAME} Presale`

                    console.log('📋 智能合约地址初始化:', {
                        source: projectContracts.SOURCE,
                        tokenAddress: projectContracts.TOKEN_ADDRESS,
                        presaleAddress: projectContracts.PRESALE_ADDRESS,
                        projectName: projectContracts.PROJECT_NAME,
                        projectSymbol: projectContracts.PROJECT_SYMBOL
                    })

                    // 显示用户友好的提示
                    if (projectContracts.SOURCE === 'DEFAULT_CONFIG') {
                        console.log('💡 使用默认项目配置，您也可以通过URL参数指定其他项目')
                    } else {
                        console.log('🔗 使用URL参数指定的项目配置')
                    }

                } catch (error) {
                    console.error('❌ 初始化合约地址失败:', error)
                    // 回退到原有逻辑
                    const urlParams = new URLSearchParams(window.location.search)
                    const tokenAddress = urlParams.get('token')
                    const presaleAddress = urlParams.get('presale')

                    if (tokenAddress && presaleAddress) {
                        this.coinObj.contractAddress = tokenAddress
                        this.coinObj.presaleContractAddress = presaleAddress
                        this.coinObj.text = urlParams.get('symbol') || 'TOKEN'
                        this.coinObj.introduce = `${urlParams.get('name') || 'Token'} 预售`
                    } else {
                        console.warn('⚠️ 缺少必要的URL参数且无法加载默认配置')
                    }
                }
            },

            // 连接TRON钱包
            async linkTronWallet() {
                try {
                    // 等待TronWeb加载
                    const tronWebLoaded = await this.waitForTronWebLoad()

                    if (!tronWebLoaded) {
                        console.warn('⚠️ TronLink未安装或未加载')
                        this.showTronLinkGuide()
                        return
                    }

                    // 检查是否已连接
                    if (!window.tronWeb.defaultAddress || !window.tronWeb.defaultAddress.base58) {
                        console.warn('⚠️ TronLink未连接，请手动连接钱包')
                        this.showConnectWalletGuide()
                        return
                    }

                    const account = window.tronWeb.defaultAddress.base58
                    this.address = account
                    this.showAddress = account.replace(/([\w]{6})[\w\W]+([\w]{4})$/, '$1...$2')

                    console.log('🔗 TRON钱包已连接:', account)

                    // 获取预售数据
                    await this.getTronPresaleData()
                } catch (error) {
                    console.error('❌ 连接TRON钱包失败:', error)
                }
            },

            // 等待TronWeb加载
            async waitForTronWebLoad(timeout = 3000) {
                return new Promise((resolve) => {
                    const startTime = Date.now()

                    const checkTronWeb = () => {
                        if (window.tronWeb) {
                            resolve(true)
                        } else if (Date.now() - startTime > timeout) {
                            resolve(false)
                        } else {
                            setTimeout(checkTronWeb, 100)
                        }
                    }

                    checkTronWeb()
                })
            },

            // 显示TronLink安装引导
            showTronLinkGuide() {
                const message = '请安装TronLink钱包扩展程序来使用TRON功能'
                Toast(message)

                // 可以添加更详细的引导
                setTimeout(() => {
                    if (confirm('是否前往TronLink官网下载？')) {
                        window.open('https://www.tronlink.org/', '_blank')
                    }
                }, 2000)
            },

            // 显示连接钱包引导
            showConnectWalletGuide() {
                Toast('请在TronLink中连接您的钱包')

                // 定期检查连接状态
                const checkConnection = setInterval(async () => {
                    if (window.tronWeb && window.tronWeb.defaultAddress && window.tronWeb.defaultAddress.base58) {
                        clearInterval(checkConnection)
                        await this.linkTronWallet()
                    }
                }, 2000)

                // 30秒后停止检查
                setTimeout(() => {
                    clearInterval(checkConnection)
                }, 30000)
            },

            // 旧的BSC钱包连接方法（保留兼容性）
            async linkWallet() {
                this.$Contract.Init(res => {
                    let account = res
                    this.address = account;
                    this.showAddress = account.replace(/([\w]{6})[\w\W]+([\w]{4})$/, '$1...$2')
                    this.getPreSaleDate()
                })
            },

            // 获取TRON预售数据
            async getTronPresaleData() {
                if (!this.coinObj.presaleContractAddress) {
                    console.error('❌ 缺少预售合约地址')
                    return
                }

                try {
                    // 导入TRON预售服务
                    const { default: PresaleService } = await import('../tron/services/PresaleService')
                    const presaleService = new PresaleService(this.coinObj.presaleContractAddress)

                    // 获取预售基本信息
                    const basicInfo = await presaleService.getPresaleBasicInfo()
                    console.log('📊 预售基本信息:', basicInfo)

                    // 更新数据
                    this.coinObj.openState = basicInfo.openState
                    this.preSaleMaxNum = basicInfo.preSaleMaxNum
                    this.buyNumber = basicInfo.buyNumber
                    this.totalNumber = basicInfo.totalNumber
                    this.nowStage = basicInfo.nowStage
                    this.stageUnlockRate = basicInfo.stageUnlockRate
                    this.coinObj.progressValue = basicInfo.progressValue

                    // 获取价格信息
                    const priceInfo = await presaleService.getPresalePriceInfo()
                    console.log('💰 价格信息:', priceInfo)

                    this.preSaleEthAmount = this.convertFromSun(priceInfo.preSaleEthAmount) // 转换为TRX
                    this.tadeEthAmount = this.convertFromSun(priceInfo.tradeEthAmount)
                    this.coinAmount = priceInfo.coinAmount
                    this.coinPrice = priceInfo.tokenPrice

                    // 获取用户信息
                    if (this.address) {
                        const userInfo = await presaleService.getUserFullInfo(this.address)
                        console.log('👤 用户信息:', userInfo)

                        this.preSaleCount = userInfo.presaleInfo.preSaleCount
                        this.hasUnlockAmount = this.convertFromSun(userInfo.presaleInfo.hasUnlockAmount)
                        this.stage = userInfo.presaleInfo.stage
                        this.verify = userInfo.presaleInfo.verify
                        this.tradeNum = userInfo.tradeCount
                    }

                    // 获取TRX余额
                    await this.getTronBalance()

                } catch (error) {
                    console.error('❌ 获取TRON预售数据失败:', error)
                }
            },

            // 获取TRON余额
            async getTronBalance() {
                try {
                    if (!window.tronWeb || !this.address) return

                    // 获取TRX余额
                    const balance = await window.tronWeb.trx.getBalance(this.address)
                    this.bnbBalance = window.tronWeb.fromSun(balance) // 转换为TRX

                    console.log('💰 TRX余额:', this.bnbBalance)
                } catch (error) {
                    console.error('❌ 获取TRX余额失败:', error)
                }
            },

            // Sun单位转换辅助方法
            convertFromSun(sunAmount) {
                if (!sunAmount) return 0
                return window.tronWeb ? window.tronWeb.fromSun(sunAmount) : sunAmount / 1000000
            },

            convertToSun(trxAmount) {
                if (!trxAmount) return 0
                return window.tronWeb ? window.tronWeb.toSun(trxAmount) : trxAmount * 1000000
            },

            // 数值格式化方法
            toNonExponential(num) {
                if (!num) return '0'
                const numStr = Number(num).toString()
                if (numStr.indexOf('e') === -1) return numStr

                const parts = numStr.split('e')
                const coefficient = parseFloat(parts[0])
                const exponent = parseInt(parts[1])

                if (exponent >= 0) {
                    return (coefficient * Math.pow(10, exponent)).toString()
                } else {
                    const decimalPlaces = Math.abs(exponent)
                    return coefficient.toFixed(decimalPlaces + 2)
                }
            },

            // 数值过滤方法
            fitterNum(num, decimals = 2) {
                if (!num) return '0'
                return Number(num).toFixed(decimals)
            },

            // ==================== 状态同步方法 ====================

            // 开始状态同步
            startStatusSync() {
                // 清除现有定时器
                this.stopStatusSync()

                // 每30秒检查一次状态
                this.statusSyncTimer = setInterval(() => {
                    this.syncPresaleStatus()
                }, 30000)

                console.log('🔄 预售状态同步已启动')
            },

            // 停止状态同步
            stopStatusSync() {
                if (this.statusSyncTimer) {
                    clearInterval(this.statusSyncTimer)
                    this.statusSyncTimer = null
                    console.log('⏹️ 预售状态同步已停止')
                }
            },

            // 同步预售状态
            async syncPresaleStatus() {
                try {
                    if (!this.coinObj.presaleContractAddress) return

                    const now = Date.now()
                    // 避免频繁请求，至少间隔10秒
                    if (now - this.lastStatusCheck < 10000) return

                    this.lastStatusCheck = now

                    // 导入预售服务
                    const { default: PresaleService } = await import('../tron/services/PresaleService')
                    const presaleService = new PresaleService(this.coinObj.presaleContractAddress)

                    // 获取最新状态
                    const currentStatus = await presaleService.getPresaleStatus()

                    // 如果状态发生变化，更新UI
                    if (currentStatus !== this.coinObj.openState) {
                        console.log('📊 预售状态已更新:', {
                            from: this.coinObj.openState,
                            to: currentStatus
                        })

                        this.coinObj.openState = currentStatus

                        // 如果状态变为进行中，刷新所有数据
                        if (currentStatus === 1) {
                            await this.getTronPresaleData()
                        }

                        // 显示状态变化提示
                        this.showStatusChangeNotification(currentStatus)
                    }
                } catch (error) {
                    console.error('❌ 同步预售状态失败:', error)
                }
            },

            // 显示状态变化通知
            showStatusChangeNotification(status) {
                const statusText = {
                    0: '未开始',
                    1: '进行中',
                    2: '已结束',
                    3: '已结束',
                    4: '已结束'
                }[status] || '未知'

                Toast(`预售状态已更新: ${statusText}`)
            },

            // 跳转到解锁页面
            goToUnlockPage() {
                if (!this.coinObj.presaleContractAddress) {
                    Toast('缺少预售合约地址')
                    return
                }

                // 构建解锁页面URL
                const unlockUrl = `/#/token-unlock?presale=${this.coinObj.presaleContractAddress}&token=${this.coinObj.contractAddress}&name=${encodeURIComponent(this.coinObj.introduce)}&symbol=${encodeURIComponent(this.coinObj.text)}`

                // 跳转到解锁页面
                window.location.href = unlockUrl

                console.log('跳转到解锁页面:', unlockUrl)
            },

            // ==================== 移动端用户体验优化 ====================

            // 初始化移动端优化
            initMobileOptimizations() {
                // 网络状态监听
                window.addEventListener('online', () => {
                    this.isOnline = true
                    Toast('网络已连接')
                })

                window.addEventListener('offline', () => {
                    this.isOnline = false
                    Toast('网络已断开')
                })

                // 防止双击缩放
                document.addEventListener('touchstart', function(event) {
                    if (event.touches.length > 1) {
                        event.preventDefault()
                    }
                })

                // 防止长按选择
                document.addEventListener('selectstart', function(event) {
                    if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
                        event.preventDefault()
                    }
                })
            },

            // 显示交易进度
            showTransactionProgressIndicator(text, detail = '') {
                this.transactionProgressText = text
                this.transactionProgressDetail = detail
                this.showTransactionProgress = true
            },

            // 隐藏交易进度
            hideTransactionProgressIndicator() {
                this.showTransactionProgress = false
                this.transactionProgressText = ''
                this.transactionProgressDetail = ''
            },

            // 优化的加载提示
            showOptimizedLoading(text) {
                this.showTransactionProgressIndicator(text, '请稍候，交易正在处理中...')
            },

            // 检查网络状态
            checkNetworkStatus() {
                if (!this.isOnline) {
                    Toast('请检查网络连接')
                    return false
                }
                return true
            },

            // 触觉反馈（如果支持）
            triggerHapticFeedback() {
                if (navigator.vibrate) {
                    navigator.vibrate(50) // 轻微震动50ms
                }
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
                try {
                    // 检查网络状态
                    if (!this.checkNetworkStatus()) {
                        return
                    }

                    // 验证预售条件
                    if (Number(this.preSaleCount) + this.frequency > Number(this.preSaleMaxNum)) {
                        Toast(this.$t('trade.trade34'));
                        return
                    }

                    if (this.coinObj.openState != 1) {
                        Toast(this.$t('trade.trade31'));
                        return;
                    }

                    if (this.preSaleEthAmount == 0 || this.coinObj.presaleContractAddress.length == 0) {
                        Toast("Failed");
                        return;
                    }

                    if (this.frequency <= 0) {
                        Toast(this.$t('trade.trade36'));
                        return
                    }

                    if (Number(this.bnbBalance) < Number(this.preSaleEthAmount) * this.frequency) {
                        Toast(this.$t('trade.trade37'));
                        return
                    }

                    // 检查TronLink连接
                    if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
                        Toast('请先连接TronLink钱包');
                        return
                    }

                    // 触觉反馈
                    this.triggerHapticFeedback()

                    this.isPresale = true;
                    this.showOptimizedLoading('正在发送交易...')

                    // 计算需要支付的TRX数量（转换为Sun）
                    const trxAmount = this.preSaleEthAmount * this.frequency;
                    const sunAmount = this.convertToSun(trxAmount);

                    console.log('💰 预售参数:', {
                        frequency: this.frequency,
                        trxAmount,
                        sunAmount,
                        presaleAddress: this.coinObj.presaleContractAddress
                    });

                    // 导入预售服务
                    const { default: PresaleService } = await import('../tron/services/PresaleService')
                    const presaleService = new PresaleService(this.coinObj.presaleContractAddress)

                    // 更新进度
                    this.showTransactionProgressIndicator('正在执行预售...', '请在TronLink中确认交易')

                    // 执行预售
                    const result = await presaleService.participatePresale(this.frequency, {
                        callValue: sunAmount,
                        feeLimit: 100000000 // 100 TRX fee limit
                    });

                    console.log('✅ 预售交易结果:', result);

                    // 更新进度
                    this.showTransactionProgressIndicator('交易已发送', '等待区块链确认...')

                    setTimeout(async () => {
                        this.isPresale = false;
                        this.hideTransactionProgressIndicator();

                        if (result && result.txid) {
                            Toast(this.$t('trade.trade32'));
                            // 触觉反馈
                            this.triggerHapticFeedback()
                            // 刷新数据
                            await this.getTronPresaleData();
                        } else {
                            Toast('预售失败，请重试');
                        }
                    }, 3000);

                } catch (error) {
                    console.error('❌ 预售失败:', error);
                    this.isPresale = false;
                    this.hideTransactionProgressIndicator();
                    Toast('预售失败: ' + (error.message || '未知错误'));
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
                try {
                    // 检查TronLink连接
                    if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
                        Toast('请先连接TronLink钱包');
                        return
                    }

                    this.loadingShow("Unlock...");

                    // 导入预售服务
                    const { default: PresaleService } = await import('../tron/services/PresaleService')
                    const presaleService = new PresaleService(this.coinObj.presaleContractAddress)

                    // 执行解锁
                    const result = await presaleService.unlockTokens({
                        feeLimit: 50000000 // 50 TRX fee limit
                    });

                    console.log('✅ 解锁交易结果:', result);

                    setTimeout(async () => {
                        this.loadingHide();

                        if (result && result.txid) {
                            Toast(this.$t('trade.trade35'));
                            // 刷新数据
                            await this.getTronPresaleData();
                        } else {
                            Toast('解锁失败，请重试');
                        }
                    }, 3000);

                } catch (error) {
                    console.error('❌ 解锁失败:', error);
                    this.loadingHide();
                    Toast('解锁失败: ' + (error.message || '未知错误'));
                }
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
  @use "@/assets/css/pledge2" as *;

  /* TRON解锁按钮样式 */
  .unlock-tron {
    width: 100%;
    padding: 12px 20px;
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 15px;
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    /* 移动端触摸优化 */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    user-select: none;
  }

  .unlock-tron:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
  }

  .unlock-tron:active {
    transform: translateY(0);
    background: linear-gradient(135deg, #218838, #1e7e34);
  }

  /* 移动端用户体验优化 */
  @media (max-width: 768px) {
    /* 触摸友好的按钮大小 */
    .unlock-tron {
      padding: 16px 20px;
      font-size: 18px;
      min-height: 48px; /* 符合移动端最小触摸目标 */
    }

    /* 优化数量选择器 */
    .num img {
      width: 44px;
      height: 44px;
      padding: 8px;
    }

    /* 优化表单输入 */
    input, select, textarea {
      font-size: 16px; /* 防止iOS缩放 */
      min-height: 44px;
    }

    /* 优化加载状态 */
    .van-loading {
      font-size: 18px;
    }

    /* 优化Toast提示 */
    .van-toast {
      font-size: 16px;
      max-width: 90%;
    }
  }

  /* 网络状态指示器 */
  .network-status {
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    z-index: 1000;
    transition: all 0.3s ease;
  }

  .network-status.online {
    background: #d4edda;
    color: #155724;
  }

  .network-status.offline {
    background: #f8d7da;
    color: #721c24;
  }

  /* 交易进度指示器 */
  .transaction-progress {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    z-index: 2000;
    text-align: center;
    max-width: 300px;
    width: 90%;
  }

  .progress-spinner {
    width: 60px;
    height: 60px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #28a745;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .progress-text {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
  }

  .progress-detail {
    font-size: 14px;
    color: #666;
    line-height: 1.4;
  }
  </style>