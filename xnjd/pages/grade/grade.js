// 获取应用实例
const app = getApp()
var common = require('../../utils/common.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        statusBarHeight: 0, // 手机状态栏高度
        userInfo: {}, // 用户信息
        college: wx.getStorageSync('college'), // 大学

        showCode: false, // 刷新状态
        loading: false, // 刷新状态

        relaName: '',
        grede: [],
        maxLength: 0,
        averageScore: 0,
        academicCredits: 0,
        alreadyCredits: 0,
        electiveCredits: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getSystem() // 获取系统信息
        this.getUserInfo() // 获取用户信息
        this.initData() // 加载学分
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

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

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
     * 加载学分
     */
    initData: function() {
        var self = this
        wx.showLoading({
            title: '加载中',
        })
        common.requestServerData("scores", "POST", {
            uid: wx.getStorageSync('uid'),
            college: wx.getStorageSync('college'),
        }).then(function(data) {
            if (data.statusCode === 200) {
                var xueqi_data = []
                var maxLength = 0
                var subScore = 0
                var academicCredits = 0 //绩点
                var alreadyCredits = 0 // 已修
                var electiveCredits = 0 // 选修
                var neededCredits = 0 // 需修学分

                for (var i in data.data.courses) {
                    xueqi_data.push(data.data.courses[i].xueqi)
                    maxLength++
                    subScore += (data.data.courses[i].score - 0)
                    data.data.courses[i].xuanxiu == '选' && (electiveCredits += (data.data.courses[i].xuefen - 0))
                    if (data.data.courses[i].jidian != 0) {
                        alreadyCredits += (data.data.courses[i].xuefen - 0)
                    }
                    if (data.data.courses[i].xuanxiu != '选') {
                        academicCredits += (data.data.courses[i].jidian * data.data.courses[i].xishu * data.data.courses[i].xuefen)
                        if (data.data.courses[i].xuanxiu != '选') {
                            neededCredits += (data.data.courses[i].xuefen - 0)
                        }
                    }
                }
                academicCredits = academicCredits / neededCredits

                var endData = []
                self.distinct(xueqi_data).map(function(e) {
                    endData.push({
                        name: e,
                        nameA: e.substring(e.length - 4),
                        nameB: e.substring(0, e.length - 4),
                        list: []
                    })
                })
                for (var i in data.data.courses) {
                    var index = null
                    endData.map(function(e, _i) {
                        if (data.data.courses[i].xueqi == e.name) {
                            index = _i
                        }
                    })
                    if (index != null) {
                        endData[index].list.push(data.data.courses[i])
                    }
                }
                self.setData({
                    grede: endData,
                    maxLength: maxLength,
                    relaName: data.data.courses[0].name,
                    averageScore: (subScore / maxLength).toFixed(1),
                    academicCredits: academicCredits.toFixed(1),
                    alreadyCredits: alreadyCredits,
                    electiveCredits: electiveCredits,
                })
            } else {
                wx.showToast({
                    title: data.data.courses.remark,
                    icon: 'none',
                    duration: 1000
                })
            }
            wx.hideLoading()
        })
    },

    /**
     * 数组去重
     */
    distinct: function(arr) {
        let result = []
        let obj = {}
        for (let i of arr) {
            if (!obj[i]) {
                result.push(i)
                obj[i] = 1
            }
        }
        return result
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
     * 打开评课
     */
    showClass: function() {
        var uid = wx.getStorageSync('uid')
        if (uid != '') {
            this.setData({
                showCode: true
            })
        } else {
            wx.showToast({
                title: '请先登陆',
                icon: 'none',
                duration: 1000
            })
        }
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
                    wx.showToast({
                        title: data.data.msg,
                        icon: 'none',
                        duration: 1000
                    })
                } else {
                    wx.showToast({
                        title: '评课失败',
                        icon: 'none',
                        duration: 1000
                    })
                }
                setTimeout(function() {
                    wx.hideLoading()
                }, 2000)
                self.setData({
                    loading: false,
                    showCode: false,
                })
            })
        }
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
     * 刷新弹出层
     */
    refresh: function() {
        var uid = wx.getStorageSync('uid')
        if (uid != '') {
            this.refreshSure()
        } else {
            wx.showToast({
                title: '请先登陆',
                icon: 'none',
                duration: 1000
            })
        }
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
                    loading: false,
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