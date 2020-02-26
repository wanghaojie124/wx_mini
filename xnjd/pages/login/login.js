// 获取应用实例
const app = getApp()
var common = require('../../utils/common.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        username: '', // 学号
        password: '', // 密码
        loginBtn: 0, // 0:灰色按钮,1:蓝色按钮
        loading: false // 登陆状态
    },

    /**
     * 监听页面加载
     */
    onLoad: function(options) {
        this.getSystem() // 获取系统信息
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
            title: '微控交大 | 生活学习小助手',
            path: '/pages/index/index'
        }
    },

    /**
     * 页面滚动触发事件的处理函数
     */
    onPageScroll: function(e) {

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
     * 登陆
     */
    login: function() {
        var self = this

        if (this.blurUsername() && this.blurPassword()) {
            // 当前是否正在登陆中
            if (!this.data.loading) {
                wx.showLoading({
                    title: '登陆中'
                })
                this.setData({
                    loading: true
                })

                common.requestServerData("login", "POST", {
                    openid: wx.getStorageSync('openid'),
                    college: wx.getStorageSync('college'),
                    username: self.data.username,
                    password: self.data.password,
                }).then(function(data) {
                    if (data.data.status == 200) {
                        // 缓存
                        try {
                            wx.setStorageSync('uid', data.data.uid)
                        } catch (e) {

                        }
                        wx.navigateBack()
                    } else {
                        wx.showToast({
                            title: '账号 / 密码错误',
                            icon: 'none',
                            duration: 2000
                        })
                    }
                    setTimeout(function(){
                        wx.hideLoading();
                    }, 2000)
                    self.setData({
                        loading: false
                    })
                })
            }
        }
    },

    /**
     * 学号
     */
    usernameInput: function(e) {
        this.setData({
            username: e.detail.value
        })
        // 判断登陆显示状态
        this.checkLoginBtn()
    },

    /**
     * 密码
     */
    passwordInput: function(e) {
        this.setData({
            password: e.detail.value
        })
        // 判断登陆显示状态
        this.checkLoginBtn()
    },

    /**
     * 判断登陆显示状态
     */
    checkLoginBtn: function() {
        var username = this.data.username
        var password = this.data.password
        if (username != '' && password != '') {
            this.setData({
                loginBtn: 1
            })
        } else {
            this.setData({
                loginBtn: 0
            })
        }
    },

    /**
     * 校验学号
     */
    blurUsername: function() {
        var self = this
        var username = this.data.username
        if (username == '') {
            wx.showToast({
                title: '学号不能为空',
                icon: 'none',
                duration: 1000
            })
            return false
        } else {
            return true
        }
    },

    /**
     * 校验密码
     */
    blurPassword: function() {
        var self = this
        var password = this.data.password
        if (password == '') {
            wx.showToast({
                title: '密码不能为空',
                icon: 'none',
                duration: 1000
            })
            return false
        } else {
            return true
        }
    },

    /**
     * 忘记密码
     */
    forgetPass: function() {
        wx.showToast({
            title: '请登录学校教务处官方网站找回或重置密码',
            icon: 'none',
            duration: 2000
        })
    },

    /**
     * 没有账号
     */
    noAccount: function() {
        wx.navigateTo({
            url: '/pages/webView/webView?title=注册&path=https://sjrg.cdut.top/service/regist.html'
        })
    },

    /**
     * 返回
     */
    returnPage: function() {
        wx.navigateBack()
    }
})