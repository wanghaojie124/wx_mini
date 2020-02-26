// 公共js文件
var common = require('utils/common.js') // require 暂时不支持绝对路径
const updateManager = wx.getUpdateManager(); // UpdateManager 对象，用来管理更新

// 注册一个小程序
App({
    data: {
        // host: 'http://whj.free.idcfengye.com/', // 域名配置
        // host: 'http://localhost:2000/', // 域名配置
        host: 'https://vkcampus.cdut.top/'
    },

    // 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
    onLaunch: function(e) {
        this.setDefault() // 设置默认值
        this.upDate() // 检查更新
    },

    // 当小程序启动，或从后台进入前台显示，会触发 onShow
    onShow: function(e) {

    },

    // 当小程序从前台进入后台，会触发 onHide
    onHide: function() {

    },

    // 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
    onError: function(msg) {

    },

    /**
     * 设置默认值
     */
    setDefault: function() {
        // 缓存
        try {
            wx.setStorageSync('college', '四川师范大学')
        } catch (e) {

        }
    },

    /**
     * 检查更新
     */
    upDate: function() {
        updateManager.onCheckForUpdate(function(res) {
            // 请求完新版本信息的回调
        })

        updateManager.onUpdateReady(function() {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: function(res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })

        updateManager.onUpdateFailed(function() {
            // 新版本下载失败
        })
    }
})