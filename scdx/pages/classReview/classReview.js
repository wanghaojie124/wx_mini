// 获取应用实例
const app = getApp()
var common = require('../../utils/common.js')
let timeOut_sec = 0
var timer
let pre_time = 15/60

Page({

    /**
     * 页面的初始数据
     */
    data: {
        statusBarHeight: 0, // 手机状态栏高度
        userInfo: {}, // 用户信息
        college: wx.getStorageSync('college'), // 大学

        loading: false, // 刷新状态
        showCode: false,

        pageStatus: 0, // 0评课未完成 1评课点击后 2可以评课
        classData: [], // 待评课
        reviewTime: 0, // 评课时间
        reviewStatus: false, // 是否点击了评课按钮

        timeOut: '00:00' // 完成倒计时
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getSystem() // 获取系统信息
        this.getUserInfo() // 获取用户信息
        this.initPage() // 加载学分
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        clearInterval(timer)
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        clearInterval(timer)
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    /**
     * 获取用户信息
     */
    getUserInfo: function() {
        var self = this

        wx.getUserInfo({
            success: function(res) {
                self.setData({
                    userInfo: res.userInfo
                })
            },
            fail: (res) => {

            }
        })
    },

    /**
     * 查成绩
     */
    openGrade: function () {
        var uid = wx.getStorageSync('uid')
        if (uid) {
            wx.navigateTo({
                url: '/pages/grade/grade'
            })
        } else {
            wx.showToast({
                title: '请先登陆',
                icon: 'none',
                duration: 1000
            })
            setTimeout(function () {
                wx.switchTab({
                    url: '/pages/user/user'
                })
            }, 1000)
        }
    },
    
    initPage: function(){
        let class_review_time = app.data.global.class_review_time,
            class_review_list = app.data.global.class_review_list;
        // 还剩的倒计时数
        let time = (class_review_time - new Date().getTime()) / 60 / 1000;
        if (class_review_time && class_review_list && class_review_list.length > 0 && time > 0) {
            // 加载缓存
            this.setData({
                classData: class_review_list,
                reviewTime: Math.ceil(class_review_list.length * pre_time),
                pageStatus: 1,
                reviewStatus: true
            })
            // 加载倒计时
            this.getCountdown(time)
            return
        }
        this.setData({
            showCode: true
        })
        this.initData() // 加载学分
    },

    /**
     * 加载学分
     */
    initData: function() {
        var self = this
        // 加载还未更新的
        wx.showLoading({
            title: '加载中',
        })

        common.requestServerData("assess", "GET", {
            uid: wx.getStorageSync('uid'),
            college: wx.getStorageSync('college'),
        }).then(function(data) {
            if (data.statusCode === 200) {
                self.setData({
                    classData: data.data.course_list,
                    reviewTime: Math.ceil(data.data.course_list.length * pre_time),
                    pageStatus: data.data.course_list.length == 0 ? 0 : 2,
                    reviewStatus: false
                })
            } else {
                wx.showToast({
                    title: data.data.remark,
                    icon: 'none',
                    duration: 1000
                })
            }
            wx.hideLoading()
        })
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
     * 返回
     */
    returnPage: function() {
        wx.navigateBack()
    },

    /**
     * 评课
     */
    classSure: function() {
        var self = this

        // 当前是否正在刷新中
        if (!this.data.loading) {
            wx.showLoading({
                title: '评课中'
            })
            this.setData({
                loading: true
            })

            common.requestServerData("assess", "POST", {
                uid: wx.getStorageSync('uid'),
                college: wx.getStorageSync('college'),
            }).then(function(data) {
                if (data.data.status == 200) {
                    
                    let endDate = new Date().getTime() + data.data.course_list.length * 60 * 1000 * pre_time
                    app.data.global.class_review_time = endDate
                    app.data.global.class_review_list = data.data.course_list
                    self.getCountdown(data.data.course_list.length * pre_time)
                    self.setData({
                        loading: false,
                        reviewStatus: true,
                        classData: data.data.course_list,
                        reviewTime: Math.ceil(data.data.course_list.length * pre_time),
                        pageStatus: 1
                    })
                    // TODO 倒计时
                    wx.hideLoading()
                } else {
                    wx.showToast({
                        title: '评课失败',
                        icon: 'none',
                        duration: 1000
                    })
                }
            }).catch(()=>{
                setTimeout(function () {
                    wx.hideLoading()
                }, 2000)
            })
        }
    },

    getCountdown: function (min) {
        var self = this
        timeOut_sec = Math.floor(min * 60)
        timer = setInterval(()=>{
            timeOut_sec--
            let num_a = Math.floor(timeOut_sec / 60);
            let num_b = Math.floor(timeOut_sec % 60);
            self.setData({
                timeOut: (num_a < 10 ? '0' + num_a : num_a) + ':' + (num_b < 10 ? '0' + num_b : num_b)
            })
            if (1 >= timeOut_sec) {
                clearInterval(timer)
                self.initData()
                app.data.global.class_review_time = 0
                app.data.global.class_review_list = []
            }
        }, 1000)
    },

    /**
     * 关闭刷新弹出层
     */
    onClose: function() {
        this.setData({
            showCode: false,
        })
    },

    /**
     * 刷新
     */
    refreshSure: function() {
        var self = this
        
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
                    self.initData()
                    wx.hideLoading()
                }, 2000)
                self.setData({
                    loading: false
                })
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
    }
})