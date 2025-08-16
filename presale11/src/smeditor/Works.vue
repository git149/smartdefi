<template>
    <div class="list">
        <div :id='index=="1"?"works_information":""' class="works-detail"  @click="purchase(item)" v-for="(item,index) in workList" :key="index" :style="{'background-image': `url(${require('@/assets/img/hmbg.png')})`}">
            <div>
                <img class="work_img" :src='item.imageUrl' />
            </div>
            <div class="works_information">
                <div class="information">

                    <div class="works_name"
                        v-html="workList.length==0?'':($i18n.locale=='en'?workList[index].enName:workList[index].name)">
                    </div>
                </div>

                <div class="works_price">
                    <div class="txt">{{$t('index.index45')}}:</div>
                    <div class="blue">{{workList.length==0?'':workList[index].price}} {{coin}}</div>
                </div>

                <div class="works_price">
                    <div class="txt">{{$t('index.index46')}}:</div>
                    <div class="orange">{{workList.length==0?'':workList[index].totalNum - workList[index].buyNum}}</div>
                </div>



                <div class="works_remark">
                   
                </div>

                <div class="works_btn">
                    {{$t('buyToken.buy29')}}
                </div>

            </div>
        </div>
    </div>
</template>
<script>
    import {
        Toast
    } from 'vant';
    export default {
        name: 'Work',
        props: ["list", "actived"],
        data() {
            return {
                coin: window.config.COIN.coin,
                workList: "",
                address: "",
                isActived: false,

            }
        },
        mounted() {
            this.address = localStorage.address
        },
        methods: {


            loadingShow(message) {
                Toast.loading({
                    message: message,
                    forbidClick: true,
                    duration: 0
                });

            },
            async purchase(item) {

                this.$router.push({
                    path: '/boxDetails',
                    query: {
                        id: item.id,
                        actived:this.actived,
                    }
                })
            },

            showChainLoading() {
                let that = this
                Toast.loading({
                    message: that.$t('index.index54'),
                    forbidClick: true,
                    duration: 15000,
                    onClose: function () {
                        Toast(that.$t('buyToken.buy22'))
                    }
                });
            },

            async payAfter(txHash, id) {
                this.loadingShow(this.$t('buyToken.buy21'));
                let mdStr = this.address + "#" + id + "#" + txHash + "#" + window.config.signStr;
                let formData = new FormData();
                formData.append('address', this.address);
                formData.append('id', id);
                formData.append('sign', this.$md5(mdStr));
                formData.append('txHash', txHash)
                let res = await this.$http.index.pledgePayAfter(formData);
                Toast.clear()
                if (res.data.code == 0) {
                    this.showChainLoading()
                } else {
                    Toast(res.data.message)
                }

            },


        },
        watch: {
            list: function () {
                this.workList = this.list
            },
            actived: function () {
                this.isActived = this.actived
            }

        },
    }
</script>
<style scoped lang='scss'>
    @import "../assets/css/works.scss";
</style>