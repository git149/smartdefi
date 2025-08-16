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
        path: '/fee-presale-settings', name: 'feePresaleSettings',
        component: resolve => require(['../views/FeeAndPresaleSettings.vue'], resolve)
    },
    {
        path: '/advanced-token-creation', name: 'advancedTokenCreation',
        component: resolve => require(['../views/AdvancedTokenCreation.vue'], resolve)
    },
    {
        path: '/presale-manager', name: 'presaleManager',
        component: resolve => require(['../tron/components/PresaleManager.vue'], resolve)
    },  
    {
        path: '/token-unlock', name: 'tokenUnlock',
        component: resolve => require(['../tron/components/TokenUnlock.vue'], resolve)
    },
    {
        path: '/token-marketplace', name: 'tokenMarketplace',
        component: resolve => require(['../mobilePages/tokenMarketplace.vue'], resolve)
    },
    {
        path: '/token-marketplace-test', name: 'tokenMarketplaceTest',
        component: resolve => require(['../views/TokenMarketplaceTest.vue'], resolve)
    },
    {
        path: '/project-selector', name: 'projectSelector',
        component: resolve => require(['../tron/components/ProjectSelector.vue'], resolve)
    },
  
 
    {
        path: '/token-detail/:id?', name: 'tokenDetail',
        component: resolve => require(['../mobilePages/TokenDetailPage.vue'], resolve)
    }
]