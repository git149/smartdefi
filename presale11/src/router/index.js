// import { resolve } from 'core-js/fn/promise';
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter)
//解决编程式路由往同一地址跳转时会报错的情况
const originalPush = VueRouter.prototype.push;
const originalReplace = VueRouter.prototype.replace;
//push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject)
        return originalPush.call(this, location, onResolve, onReject);
    return originalPush.call(this, location).catch(err => err);
};
//replace
VueRouter.prototype.replace = function push(location, onResolve, onReject) {
    if (onResolve || onReject)
        return originalReplace.call(this, location, onResolve, onReject);
    return originalReplace.call(this, location).catch(err => err);
};



export default [
    {
        path: '/',
        name: 'internalTrade',
        component: resolve => require(['../mobilePages/internalTrade.vue'], resolve)
    },
    {
        path: '/tron', name: 'tronExample',
        component: resolve => require(['../views/TronExample.vue'], resolve)
    },
    {
        path: '/homepage', name: 'homepage',
        component: resolve => require(['../tron/shouye/homepage.vue'], resolve)
    },
 
    {
        path: '/token-marketplace', name: 'tokenMarketplace',
        component: resolve => require(['../mobilePages/tokenMarketplace.vue'], resolve)
    },
 
    {
        path: '/token-detail/:id?', name: 'tokenDetail',
        component: resolve => require(['../mobilePages/TokenDetailPage.vue'], resolve),
        props: true
    },
    {
        path: '/token-detail', name: 'tokenDetailQuery',
        component: resolve => require(['../mobilePages/TokenDetailPage.vue'], resolve),
        props: true
    }
]