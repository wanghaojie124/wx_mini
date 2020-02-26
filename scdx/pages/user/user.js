// 获取应用实例
const app = getApp()
var common = require('../../utils/common.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        statusBarHeight: 0, // 手机状态栏高度
        isLogin: 0, // 0:未授权,1:未登陆,2:已登录
        userInfo: {}, // 用户信息
        loading: false, // 刷新状态
        college: wx.getStorageSync('college') // 大学
    },

    /**
     * 监听页面加载
     */
    onLoad: function(options) {
        this.getSystem() // 获取系统信息
        this.getUserInfo() // 获取用户信息
    },

    /**
     * 监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 监听页面显示
     */
    onShow: function() {
        // 判断是否已登录
        this.checkLogin()
    },

    /**
     * 监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 监听用户下拉动作
     */
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角转发
     */
    onShareAppMessage: function() {
        return {
            title: '微控川大 | 生活学习小助手',
            path: '/pages/index/index'
        }
    },

    /**
     * 页面滚动触发事件的处理函数
     */
    onPageScroll: function(e) {

    },

    /**
     * 判断是否已登录
     */
    checkLogin: function() {
        var uid = wx.getStorageSync('uid')
        var authorize = wx.getStorageSync('authorize')
        this.setData({
            isLogin: authorize == 1 ? (uid ? 2 : 1) : 0
        })
    },

    /**
     * 获取用户信息
     */
    getUserInfo: function() {
        var self = this
        var uid = wx.getStorageSync('uid')
        var authorize = wx.getStorageSync('authorize')

        wx.getUserInfo({
            success: function(res) {
                self.setData({
                    isLogin: authorize == 1 ? (uid ? 2 : 1) : 0,
                    userInfo: res.userInfo
                })
                self.getLogin() // 登陆
            },
            fail: (res) => {
                self.setData({
                    isLogin: 0,
                    ['userInfo.avatarUrl']: '../../images/author.jpg'
                })
            }
        })
    },

    /**
     * 微信授权登录
     */
    bindGetUserInfo: function(e) {
        var self = this
        var userInfo = e.detail.userInfo
        if (userInfo != undefined) {
            wx.setStorageSync('authorize', 1)
            self.setData({
                isLogin: 1,
                userInfo: userInfo
            })
            // 登陆
            self.getLogin(function() {
                self.login()
            })
        }
    },

    /**
     * 登陆
     */
    getLogin: function(callback) {
        var self = this

        // 获取openid
        wx.login({
            success: res => {
                var param = self.data.userInfo
                param.code = res.code
                param.college = self.data.college

                common.requestServerLogin("user/getuserinfo", "POST",
                    param
                ).then(function(data) {
                    var code = data.data.code
                    if (code == 200) {
                        // 缓存
                        try {
                            wx.setStorageSync('openid', data.data.data.openid)
                            callback && callback()
                        } catch (e) {

                        }
                    }
                })
            }
        })
    },

    /**
     * 立即登陆
     */
    login: function() {
        wx.navigateTo({
            url: '/pages/login/login'
        })
    },

    /**
     * 刷新
     */
    refreshSure: function() {
        var self = this
        var uid = wx.getStorageSync('uid')
        if (uid != '') {
            // 当前是否正在刷新中
            if (!this.data.loading) {
                wx.showLoading({
                    title: '刷新中'
                })
                this.setData({
                    loading: true
                })

                common.requestServerData("refresh", "POST", {
                    uid: wx.getStorageSync('uid'),
                    college: wx.getStorageSync('college'),
                }).then(function(data) {
                    if (data.data.status == 200) {
                        wx.showToast({
                            title: '已更新数据',
                            icon: 'none',
                            duration: 1000
                        })
                    } else {
                        wx.showToast({
                            title: '更新失败',
                            icon: 'none',
                            duration: 1000
                        })
                    }
                    setTimeout(function() {
                        wx.hideLoading()
                    }, 2000)
                    self.setData({
                        loading: false,
                        show: false,
                    })
                })
            }
        } else {
            wx.showToast({
                title: '请先登陆',
                icon: 'none',
                duration: 1000
            })
        }
    },

    /**
     * 获取系统信息
     */
    getSystem: function() {
        var self = this
        wx.getSystemInfo({
            success(res) {
                self.setData({
                    statusBarHeight: res.statusBarHeight
                })
            }
        })
    },

    /**
     * 订单劵码
     */
    openOrder: function() {
        wx.navigateToMiniProgram({
            appId: 'wx8c90308f0a605c75',
            path: '/views/my/index',
            success(res) {
                console.log(res)
            }
        })
    },

    /**
     * 联系客服
     */
    openCall: function() {
        wx.makePhoneCall({
            phoneNumber: '14726167786' //仅为示例，并非真实的电话号码
        })
    },

    /**
     * 关于我们
     */
    openAbout: function() {
        wx.navigateTo({
            url: '/pages/webView/webView?title=关于我们&path=https://mp.weixin.qq.com/s/iXXYa7zR8aeHMcgn6qXvCA'
        })
    }
})