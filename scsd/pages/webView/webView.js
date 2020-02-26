// 获取应用实例
const app = getApp()
var common = require('../../utils/common.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        path: '' // 链接
    },

    /**
     * 监听页面加载
     */
    onLoad: function(options) {
        wx.setNavigationBarTitle({
            title: options.title
        })
        this.setData({
            path: options.path
        })
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
            title: '微控师大 | 生活学习小助手',
            path: '/pages/index/index'
        }
    },

    /**
     * 页面滚动触发事件的处理函数
     */
    onPageScroll: function(e) {

    }
})