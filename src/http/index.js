import axios from 'axios'
// import {Toast} from 'vant'
class Http {
    constructor () {
        axios.defaults.baseURL = window.config.baseUrl
    }

    async get (option) {
        return await axios.get(option.url, {
            params: option.data,
            headers: Object.assign({
            }, option.headers)
        })
    }

    async post (option) {
        var acceptLanguage = "en-US,en"
        if (localStorage && localStorage.locale) {
            if(localStorage.locale === 'en'){
                acceptLanguage = "en-US,en"
            }else if(localStorage.locale === 'tc'){
                acceptLanguage = "zh-TW,zh"
            }
        }

        return await axios.post(option.url, option.data, {
            headers: Object.assign({
            }, option.headers={
                'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                "Accept-Language": acceptLanguage
            })
        })

    }

    

    

    // interceptors () {
    //     // 添加请求拦截器
    //     axios.interceptors.request.use(function (config) {
    //         Toast.loading({
    //             duration: 0,
    //             message: '加载中...',
    //             forbidClick: true
    //         })
    //         // 在发送请求之前做些什么
    //         return config
    //     }, function (error) {
    //         // 对请求错误做些什么
    //         return Promise.reject(error)
    //     })
    //
    //     // 添加响应拦截器
    //     axios.interceptors.response.use(function (response) {
    //         // 对响应数据做点什么
    //         Toast.clear()
    //         var data = response.data
    //
    //         switch (data.resultCode) {
    //             case '000':
    //                 return data.data
    //             case '500':
    //                 Toast.fail(data.message)
    //                 throw new Error(data.message)
    //                 break
    //         }
    //     }, function (error) {
    //         // 对响应错误做点什么
    //         return Promise.reject(error)
    //     })
    // }
}

export default new Http()
