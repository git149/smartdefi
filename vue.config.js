const path =require('path');
module.exports = {
    publicPath: './',
    chainWebpack: (config)=>{
        config.resolve.alias
            .set('@public', path.join(__dirname,'src/public/js'))
    },
    lintOnSave: false,
    devServer: {
        overlay: {
            warnings: false,
            errors: false
        },
    },
    productionSourceMap: false,
}
