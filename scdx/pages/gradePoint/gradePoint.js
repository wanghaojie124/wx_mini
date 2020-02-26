// 获取应用实例
const app = getApp()
var common = require('../../utils/common.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        statusBarHeight: 0, // 手机状态栏高度
        college: wx.getStorageSync('college'), // 大学
        userInfo: {}, // 用户信息

        grede: [],
        gredeSelectList: [],
        selectList: [],
        checkedA: false,
        checkedB: false,
        relaName: '',

        isLink: false,
        activeName: "", // 打开的手风琴

        averageScore: 0,
        academicCredits: 0,
        alreadyCredits: 0,
        maxLength: 0
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
                for (var i in data.data.courses) {
                    xueqi_data.push(data.data.courses[i].xueqi)
                }
                var endData = []
                self.distinct(xueqi_data).map(function(e) {
                    endData.push({
                        name: self.nameFormat(e),
                        name1: e,
                        list: []
                    })
                })
                for (var i in data.data.courses) {
                    var index = null
                    endData.map(function (e, _i) {
                        if (data.data.courses[i].xueqi == e.name1) {
                            index = _i
                        }
                    })
                    data.data.courses[i].isShow = false
                    if (index != null) {
                        endData[index].list.push(data.data.courses[i])
                    }
                }
                self.setData({
                    grede: endData,
                    relaName: data.data.averages[0].name,
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
     * 计算所有的
     */
    nameFormat: function(name) {
        let tit = ''
        let d1 = name.split('-');
        let val = ''
        switch (d1[2] - 0) {
            case 1:
                val = '一';
                break;
            case 2:
                val = '二';
                break;
        }
        return (d1[0] - 0) + '-' + (d1[1] - 0) + '第' + val + '学期'
    },

    /**
     * 计算所有的
     */
    scoreCount: function() {
        var self = this

        if (self.data.gredeSelectList.length == 0) {
            wx.showToast({
                title: '请选择学期再计算',
                icon: 'none',
                duration: 1000
            })
            return
        }
        wx.showLoading({
            title: '加载中',
        })

        common.requestServerData("counter", "POST", {
            uid: wx.getStorageSync('uid'),
            college: wx.getStorageSync('college'),
            drop_elective_course: self.data.checkedB ? 1 : null, //去除选修 如果去除，传值1，否则可以传空
            drop_limited_course: self.data.checkedA ? 1 : null, // 去除限修 如果去除，传值1，否则可以传空
            terms: self.data.gredeSelectList, //学期  列表
        }).then(function(data) {
            if (data.statusCode === 200) {
                self.setData({
                    averageScore: data.data.avg_score.toFixed(1) || 0,
                    academicCredits: data.data.grade_point.toFixed(1) || 0,
                    alreadyCredits: data.data.total_xuefen.toFixed(1) || 0,
                    maxLength: data.data.total_count || 0,
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

    updateClassStatus: function(){
        let self = this
        let grade_val = self.data.gredeSelectList.toString()
        let endData = this.data.grede
        endData.map((e, i)=>{
            let data = e.list
            let g_state = grade_val.indexOf(e.name1)
            data.map((_e, _i) => {
                let state = false
                if (g_state > -1){
                    if (_e.xuanxiu == '选修') {
                        state = !self.data.checkedB
                    } else if (_e.xuanxiu == '限修') {
                        state = !self.data.checkedA
                    } else {
                        state = true
                    }
                }else{
                    state = false
                }
                _e.isShow = state
            })
            e.list = data
        })
        this.setData({
            grede: endData
        })
    },

    onChange: function(event) {
        this.setData({
            gredeSelectList: event.detail
        });
        this.updateClassStatus()
    },

    onChangeTypeA: function(event) {
        this.setData({
            checkedA: event.detail
        });
        this.updateClassStatus()
    },

    onChangeTypeB: function(event) {
        this.setData({
            checkedB: event.detail
        });
        this.updateClassStatus()
    },

    onChangeColl: function (event){
        this.setData({
            activeName: event.detail
        });
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
    }
})