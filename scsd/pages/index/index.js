// 获取应用实例
const app = getApp()
var common = require('../../utils/common.js')
var util = require('../../utils/util.js')
var page = 1 // 当前页数

Page({

    /**
     * 页面的初始数据
     */
    data: {
        statusBarHeight: 0, // 手机状态栏高度
        bannerList: [], // banner
        adList: [], // 滚动广告
        timetable: {}, // 课表数据
        todaySeckill: [], // 川师列表
        nowIndex: 1, // 当前秒杀
        allIndex: 0, // 秒杀个数
        activeScreen: 0, // 默认选中资讯搜索
        articleType: ['推荐阅读', '学校通知', '半脸侧颜', '吃喝玩乐'], // 资讯搜索
        articleList: [], // 资讯列表
        limit: 10, // 每页显示条数
        pages: 0, // 总页数
        floorStatus: false, // 返回顶部按钮显示
        todayclass: [],

        showCode: false, // 评课
        imageCode: '', // 验证码图片
        code: '', // 验证码
        cookie: '', // cookie
        loading: false // 刷新状态
    },

    /**
     * 监听页面加载
     */
    onLoad: function(options) {
        page = 1
        this.getSystem() // 获取系统信息
        this.getBanner() // 获取banner
        this.getAd() // 获取滚动广告
        this.getTimetable() // 获取当天课表
        this.getTodaySeckill() // 获取川师
        this.getArticle() // 获取资讯列表
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
        page = 1
        this.getBanner() // 获取banner
        this.getAd() // 获取滚动广告
        this.getTimetable() // 获取当天课表
        this.getTodaySeckill() // 获取川师
        this.getArticle() // 获取资讯列表
        wx.stopPullDownRefresh()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        var self = this
        page++

        // 分页
        if (page <= this.data.pages) {

            common.requestServerData("articlelist", "GET", {
                college: wx.getStorageSync('college'),
                type: self.data.activeScreen == 0 ? '' : self.data.articleType[self.data.activeScreen],
                page: page,
                limit: self.data.limit
            }).then(function(data) {
                var res = data.data.data // 数据
                var list = self.data.articleList // 当前已有的数据
                for (var i = 0; i < res.length; i++) {
                    res[i].create_at = util.formatTime(new Date(res[i].create_at))
                    list.push(res[i])
                }
                self.setData({
                    articleList: list,
                })
            })

        }
    },

    /**
     * 用户点击右上角转发
     */
    onShareAppMessage: function() {
        return {
            title: '微控师大 | 生活学习小助手',
            path: '/pages/index/index'
        }
    },

    /**
     * 页面滚动触发事件的处理函数
     */
    onPageScroll: function(e) {
        if (e.scrollTop > 100) {
            this.setData({
                floorStatus: true
            })
        } else {
            this.setData({
                floorStatus: false
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
     * 获取banner
     */
    getBanner: function() {
        var self = this

        common.requestServerData("bannerlist", "GET", {
            college: wx.getStorageSync('college')
        }).then(function(data) {
            self.setData({
                bannerList: data.data
            })
        })
    },

    /**
     * 获取滚动广告
     */
    getAd: function() {
        var self = this

        common.requestServerData("top", "GET", {
            college: wx.getStorageSync('college')
        }).then(function(data) {
            self.setData({
                adList: data.data
            })
        })
    },

    /**
     * 获取当天课表
     */
    getTimetable: function() {
        var self = this
        var time1 = '周' + '日一二三四五六'.charAt(new Date().getDay()) + '课表'
        var time2 = (new Date().getMonth() + 1) + '月' + new Date().getDate() + '日'
        var uid = wx.getStorageSync('uid')

        if (uid) {
            this.setData({
                ['timetable.time1']: time1,
                ['timetable.time2']: time2
            })
            common.requestServerData("todayclass", "POST", {
                college: wx.getStorageSync('college'),
                uid: wx.getStorageSync('uid')
            }).then(function(data) {
                var list = []
                data.data.map(function(e, i) {
                    list.push(self.getClass(e))
                })
                var endData = [] // 今天没课
                if (list.length != 0) {
                    endData.push(list[0])
                    var active_class = list[0].name,
                        active_index = 0;
                    list.map(function(e, i) {
                        if (e.name && active_class == e.name) {
                            endData[active_index].end = e.jie
                        } else {
                            if (e.name && e.name != ''){
                                endData.push(e)
                                active_index += 1
                            }
                            active_class = e.name || ''
                        }
                    })
                }
                let f_data = []
                endData.map(function (e) {
                    if (e.name != null) {
                        f_data.push(e)
                    }
                })
                self.setData({
                    todayclass: f_data
                })
            })
        }
    },

    /**
     * 获取今天的课程数据、每堂课
     */
    getClass: function(data) {
        var day = ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
        var index = null
        day.map(function(e, i) {
            if (data[e] && data[e] != '') {
                index = i
            }
        })
        return data[day[index]] ? {
            jie: data.jie,
            end: null,
            name: data[day[index]] ? data[day[index]][0] : '',
            classTime: data[day[index]] ? data[day[index]][1] : '',
            address: data[day[index]] ? data[day[index]][2] : '',
            techer: data[day[index]] ? data[day[index]][3].replace(/（/g, '').replace(/）/g, '') : '',
        } : {
            name: null
        }
    },

    /**
     * 获取川师
     */
    getTodaySeckill: function() {
        var self = this

        common.requestServerData("special", "GET", {
            college: wx.getStorageSync('college')
        }).then(function(data) {
            if (data.data.status != 404) {
                self.setData({
                    todaySeckill: data.data,
                    allIndex: data.data.length
                })
            }
        })
    },

    /**
     * 获取资讯列表
     */
    getArticle: function() {
        var self = this
        // wx.showLoading({
        //     title: '加载中',
        // })

        common.requestServerData("articlelist", "GET", {
            college: wx.getStorageSync('college'),
            type: self.data.activeScreen == 0 ? '' : self.data.articleType[self.data.activeScreen],
            page: page,
            limit: self.data.limit
        }).then(function(data) {
            if (data.data.status != 404) {
                for (var i = 0; i < data.data.data.length; i++) {
                    data.data.data[i].create_at = util.formatTime(new Date(data.data.data[i].create_at))
                }
                self.setData({
                    articleList: data.data.data,
                    pages: data.data.pages
                })
            } else {
                self.setData({
                    articleList: []
                })
                wx.showToast({
                    title: data.data.status,
                    icon: 'none',
                    duration: 1000
                })
            }

            setTimeout(function() {
                        wx.hideLoading();
                    }, 500)
        })
    },

    /**
     * banner跳转小程序
     */
    bannerTo: function(e) {
        var index = e.currentTarget.dataset.index
        var appId = this.data.bannerList[index].mini
        var path = this.data.bannerList[index].link

        if (appId) {
            wx.navigateToMiniProgram({
                appId: appId,
                path: path,
                success(res) {
                    console.log(res)
                }
            })
        } else {
            wx.navigateTo({
                url: '/pages/webView/webView?title=&path=' + path
            })
        }
    },

    /**
     * 滚动广告跳转小程序
     */
    adTo: function(e) {
        var index = e.currentTarget.dataset.index
        var title = this.data.adList[index].title
        var path = this.data.adList[index].link

        wx.navigateTo({
            url: '/pages/webView/webView?title=' + title + '&path=' + path
        })
    },

    /**
     * 查课表
     */
    openCurriculum: function() {
        var uid = wx.getStorageSync('uid')
        if (uid) {
            wx.navigateTo({
                url: '/pages/curriculum/curriculum'
            })
        } else {
            wx.showToast({
                title: '请先登陆',
                icon: 'none',
                duration: 1000
            })
            setTimeout(function() {
                wx.switchTab({
                    url: '/pages/user/user'
                })
            }, 1000)
        }
    },

    /**
     * 查成绩
     */
    openGrade: function() {
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
            setTimeout(function() {
                wx.switchTab({
                    url: '/pages/user/user'
                })
            }, 1000)
        }
    },

    /**
     * 查绩点
     */
    openGradePoint: function () {
        var uid = wx.getStorageSync('uid')
        if (uid) {
            wx.navigateTo({
                url: '/pages/gradePoint/gradePoint'
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

    /**
     * 川师跳转小程序
     */
    seckillTo: function(e) {
        var index = e.currentTarget.dataset.index
        var appId = this.data.todaySeckill[index].mini
        var path = this.data.todaySeckill[index].link

        wx.navigateToMiniProgram({
            appId: appId,
            path: path,
            success(res) {
                console.log(res)
            }
        })
    },

    /**
     * 监听川师滚动
     */
    seckillChange: function(e) {
        this.setData({
            nowIndex: e.detail.current + 1
        })
    },

    /**
     * 选择资讯
     */
    activeScreen: function(e) {
        var index = e.currentTarget.dataset.index
        if (this.data.activeScreen != index) {
            this.setData({
                activeScreen: index
            })
            page = 1
            this.getArticle() // 获取资讯列表
        }
    },

    /**
     * 暂未开放
     */
    showToast: function() {
        wx.showToast({
            title: '暂未开放，敬请期待',
            icon: 'none',
            duration: 1000
        })
    },

    /**
     * 打开校历
     */
    openArticle: function() {
        wx.navigateTo({
            url: '/pages/webView/webView?title=校历&path=https://mp.weixin.qq.com/s/6BC4FXJzkN0DnYG9_YZKQQ'
        })
    },

    /**
     * 打开外卖送寝
     */
    openShop: function() {
        wx.navigateToMiniProgram({
            appId: 'wx657c152706835faa',
            path: '/pages/index/index',
            success(res) {
                console.log(res)
            }
        })
    },

    /**
     * 打开川师
     */
    openOptimization: function() {
        wx.navigateToMiniProgram({
            appId: 'wx8c90308f0a605c75',
            path: '/views/home/index',
            success(res) {
                console.log(res)
            }
        })
    },

    /**
     * 打开秒杀
     */
    openRushToBuy: function() {
        wx.navigateToMiniProgram({
            // appId: 'wx8c90308f0a605c75',
            appId: 'wx0744f237b417cf9f',
            path: '/views/home/index',
            success(res) {
                console.log(res)
            }
        })
    },

    /**
     * 一键评课
     */
    showClass: function() {
        wx.showToast({
            title: '暂未开放，敬请期待',
            icon: 'none',
            duration: 1000
        })
    },

    /**
     * 获取验证码图片
     */
    getCodeImg: function() {
        var self = this

        common.requestServerData("assess", "GET", {
            college: wx.getStorageSync('college')
        }).then(function(data) {
            self.setData({
                imageCode: data.data.image_base64
            })
        })
    },

    /**
     * 验证码
     */
    codeInput: function(e) {
        this.setData({
            code: e.detail.value
        })
    },

    /**
     * 校验验证码
     */
    blurCode: function() {
        var self = this
        var code = this.data.code
        if (code == '') {
            wx.showToast({
                title: '验证码不能为空',
                icon: 'none',
                duration: 1000
            })
            return false
        } else {
            return true
        }
    },

    /**
     * 刷新验证码
     */
    refreshCode: function() {
        this.getCodeImg() // 获取验证码图片
    },

    /**
     * 评课
     */
    classSure: function() {
        var self = this

        if (this.blurCode()) {
            // 当前是否正在刷新中
            if (!this.data.loading) {
                // wx.showLoading({
                //     title: '评课中'
                // })
                this.setData({
                    loading: true
                })

                common.requestServerData("assess", "POST", {
                    uid: wx.getStorageSync('uid'),
                    college: wx.getStorageSync('college'),
                    code: self.data.code
                }).then(function(data) {
                    if (data.data.status == 200) {
                        wx.showToast({
                            title: data.data.msg,
                            icon: 'none',
                            duration: 1000
                        })
                    } else {
                        wx.showToast({
                            title: '验证码输入错误',
                            icon: 'none',
                            duration: 2000
                        })
                    }
                    setTimeout(function() {
                        wx.hideLoading();
                    }, 2000)
                    self.setData({
                        loading: false,
                        showCode: false,
                        code: ''
                    })
                })
            }
        }
    },

    /**
     * 关闭刷新弹出层
     */
    onClose: function() {
        this.setData({
            show: false,
            showCode: ''
        })
    },

    /**
     * 打开资讯
     */
    articleTo: function(e) {
        var index = e.currentTarget.dataset.index
        var title = this.data.articleList[index].title
        var path = this.data.articleList[index].link

        wx.navigateTo({
            url: '/pages/webView/webView?title=' + title + '&path=' + path
        })
    },

    /**
     * 返回顶部
     */
    goTop: function() {
        if (wx.pageScrollTo) {
            wx.pageScrollTo({
                scrollTop: 0
            })
        }
    }
})