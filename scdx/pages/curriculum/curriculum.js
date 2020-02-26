// 获取应用实例
const app = getApp()
var common = require('../../utils/common.js')
const color_length = 4 // 颜色配置，在curriculum.wxss文件中，.color_`num`{}的总共有几条

Page({

    /**
     * 页面的初始数据
     */
    data: {
        today: new Date().getDate(),
        weekindex: 0, // 0为本周，-1为上一周，1为下一周
        pickerIndex: 0,
        total_weeks_arr: 0,
        pickerIndex: 0,
        time: [], // 课表第一列
        day: [{
            text1: '周一',
            text2: '',
        }, {
            text1: '周二',
            text2: '',
        }, {
            text1: '周三',
            text2: '',
        }, {
            text1: '周四',
            text2: '',
        }, {
            text1: '周五',
            text2: '',
        }, {
            text1: '周六',
            text2: '',
        }, {
            text1: '周日',
            text2: '',
        }], // 课表第一行
        curriculum: [], // 课表数据

        show: false,
        name: '',
        address: '',
        techer: '',
        classTime: '',
        todayTime: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getSystem() // 获取系统信息
        this.initTable() // 加载课表表头
        this.initData() // 加载课表数据
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    /**
     * 获取系统信息
     */
    getSystem: function () {
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
     * 加载课表表头
     */
    initTable: function () {
        var self = this
        const today_0_00 = new Date(new Date(new Date().toLocaleDateString()).getTime() - self.data.weekindex * 7 * 24 * 60 * 60 * 1000)
        const month = new Date(today_0_00).getMonth() + 1
        let week_first_day_time = today_0_00.getTime() - ((today_0_00.getDay() ? today_0_00.getDay() : 7) - 1) * 24 * 60 * 60 * 1000
        var day_data = []
        this.data.day.map(function (e, i) {
            day_data.push({
                text1: e.text1,
                text2: new Date(week_first_day_time + i * 24 * 60 * 60 * 1000).getDate(),
            })
        })
        this.setData({
            time: [month + '月', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            day: day_data
        })
    },

    /**
     * 加载课表数据
     */
    initData: function () {
        var self = this
        wx.showLoading({
            title: '加载中',
        })
        // 根据weekindex计算对应周 日期
        // const _day = new Date(new Date(new Date().toLocaleDateString()).getTime() + self.data.weekindex * 7 * 24 * 60 * 60 * 1000).toLocaleDateString().replace(/\//g, '-')
        var search_data = (self.data.pickerIndex - 0) - (self.data.weekindex - 0)
        var end_request_week = search_data == 0 ? '' : (self.data.pickerIndex - 0 + 1 + '')
        common.requestServerData("schedule", "POST", {
            uid: wx.getStorageSync('uid'),
            college: wx.getStorageSync('college'),
            request_week: end_request_week
        }).then(function (data) {
            if (data.statusCode === 200) {
                var endData = [
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    []
                ]
                var day = ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
                let arr = []
                for (let i = 0; i < data.data[0].total_weeks - 0; i++) {
                    arr[i] = '第' + (i + 1) + '周'
                }
                self.setData({
                    pickerIndex: end_request_week == '' ? data.data[0].current_week - 1 : end_request_week - 1,
                    total_weeks_arr: arr,
                })
                // 横置变纵置
                for (var i in data.data) {
                    day.map(function (e, index) {
                        var className = data.data[i][e] || []
                        endData[index].push(className && className.length > 0 ? {
                            name: data.data[i].name,
                            className: className[0].trim(),
                            classData: className,
                            status: data.data[i].name,
                            isShow: true,
                            long: 0,
                            color: Math.floor(Math.random() * color_length) + 1
                        } : {
                                name: '',
                                className: '',
                                status: '',
                                isShow: true,
                                long: 0,
                                color: 0
                            })
                        active_class = className[0] ? className[0].trim() : className
                    })
                }
                var active_class = '', // 当前选中的课程名
                    active_long = 0; // 当前课程共几节
                // 根据数据计算课程的长度 和 该显示那节课
                endData.map(function (e, i) {
                    active_class = ''
                    active_long = 0
                    e.map(function (_e, _i) {
                        var state = _e.className == '' ? true : (active_class != _e.className)
                        if (_e.className != '') {
                            if (state) {
                                active_long = 1
                            } else {
                                active_long++
                            }
                        } else {
                            active_long = 0
                        }
                        _e.long = active_long
                        _e.isShow = _e.className == '' ? true : (active_long != 0 && e[_i + 1] && e[_i + 1].className != _e.className)
                        active_class = _e.className
                    })
                })
                self.setData({
                    curriculum: endData
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

    bindPickerChange: function (e) {
        var old_v = this.data.pickerIndex
        var new_v = e.detail.value
        this.setData({
            pickerIndex: new_v,
            weekindex: old_v - new_v + this.data.weekindex
        })
        this.initTable() // 加载课表表头
        this.initData() // 加载课表数据
    },

    /**
     * 打开课表详情
     */
    openClassDetail: function (e) {
        let i = e.currentTarget.dataset.i;
        let j = e.currentTarget.dataset.j;
        var data = this.data.curriculum[i][j].classData
        if (!data) {
            return
        }
        const self = this
        this.setData({
            name: data[0],
            address: data[2],
            techer: data[3].replace(/（/g, '').replace(/）/g, ''),
            classTime: data[1],
            todayTime: self.data.day[i].text1 + (j + 1 - this.data.curriculum[i][j].long + 1) + '-' + (j + 1) + '节',
            show: true,
        })
    },

    /**
     * 关闭刷新弹出层
     */
    onClose: function () {
        this.setData({
            show: false,
        })
    },

    /**
     * 返回
     */
    returnPage: function () {
        wx.navigateBack()
    }
})