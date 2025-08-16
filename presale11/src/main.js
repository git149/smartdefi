import 'amfe-flexible'

import i18n from './common/i18n'
import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from "vue-router";
import routes from "./router/index";
import Vant from 'vant';
import 'vant/lib/index.css';
import App from './App.vue';
import config from './config';
import http from './service/_';
import number from './common/number.js';
import BigNumber from "./common/bignumber.min.js";
import * as filter from './common/filter.js';
import httpPost from './http/index'
import VueClipboard from 'vue-clipboard2'
import Web3JS from "./common/web3.js";
import md5 from 'js-md5';
import TronPlugin from './tron';


// 过滤器
Object.keys(filter).forEach(key => {
    Vue.filter(key, filter[key])
})
import Clipboard from 'clipboard';
import {
    Toast,
    Swipe,
    SwipeItem,
    RadioGroup,
    Radio,
    Dialog,
} from 'vant';


Vue.config.productionTip = false;
Vue.use(Vant);
Vue.use(Toast);
Vue.use(Dialog);
Vue.use(Radio);
Vue.use(RadioGroup);
Vue.use(Swipe);
Vue.use(SwipeItem);
Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueClipboard);
Vue.use(TronPlugin);

Vue.prototype.$httpPost = httpPost;
Vue.prototype.$http = http;
Vue.prototype.$number = number;
Vue.prototype.$BigNumber = BigNumber;
Vue.prototype.$Clipboard = Clipboard;
Vue.prototype.$Contract = Web3JS;
Vue.prototype.$md5 = md5;

config.VuePlugIn.forEach(v => Vue.use(v))
const router = new VueRouter({
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return window.scroll({
                top: 0,
                left: 0
            });
        }
    },
});

router.beforeEach((to, from, next) => {
    if (from.name == "index") {
        to.meta.keepAlive = false;
    } else if (from.name == "market" || from.name == "usersList" || from.name == "blindBox") {
        from.meta.keepAlive = true;
    }

    next()
});


new Vue({
    i18n,
    router,
    render: h => h(App),
}).$mount('#app');