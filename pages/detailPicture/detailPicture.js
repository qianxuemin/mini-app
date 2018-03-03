// pages/detailPicture/detailPicture.js
var appConfig = getApp();
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        fileId: '',
        artTle: '',//文章标题
        mulPicObj: {},//稿件详情
        imageList: [],//组图
        itemCurrent: 0,//当前轮播图的序号
        showTitDisplay: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var fileId = options.fileid;
        var that = this;
        this.setData({
            fileId: fileId,
        });
        wx.request({
            url: appConfig.getComUrl + 'getArticleContent',
            data: {
                articleId: fileId,
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                // 将文章标题中的HTML标签去掉
                var title = res.data.title;
                title = title.replace(/\<.*?\>/g, '');
                that.setData({
                    mulPicObj: res.data,
                    imageList: res.data.images[0].imagearray,
                    artTle: title,
                })

            }
        })
    },
    showTit: function () {
        var showTitDisplay = this.data.showTitDisplay;
        showTitDisplay = !showTitDisplay;
        this.setData({showTitDisplay: showTitDisplay})
    },
    catch_showTit: function () {

    },
    changeImg: function () {
        this.setData({showTitDisplay: true})
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

    }
})