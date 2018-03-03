//app.js
var util = require('utils/util.js');
App({
    onLaunch: function () {
        //调用API从本地缓存中获取数据
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)
    },
    onShow: function () {
    },

    getUserInfo: function (cb) {
        var that = this
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            wx.getUserInfo({
                withCredentials: false,
                success: function (res) {
                    that.globalData.userInfo = res.userInfo
                    typeof cb == "function" && cb(that.globalData.userInfo)
                }
            })
        }
    },
    // 获取当前时间
    today: function () {
        var date = util.formatTime(new Date())
        return date;
    },

    globalData: {
        userInfo: null,
        currentAudio: {},
        isAudio: false,
        audioTitle: '',
        duration: '',
        isPlay: false,//背景音乐是否在播放
        audioId: 0,
        audioTime: 0,
    },
    // 配置项
    //getComUrl: 'https://xmttest.newaircloud.com/testapp_if/',
    getComUrl: 'https://newmedia.newaircloud.com/testapp_if/',
    siteId: 1,
    parentColumnId: -1,//一级栏目
    typeScreen: 1,
})
