// pages/paper/paper.js
let appConfig = getApp();
let getPapersFn = require('../../utils/paperdata.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        current: 0,
        duration: 500,
        papers: {},
        paperdatas: {},
        paperLayouts: {},
        showVer: false,
        notOnlyOnePaper: true,
        nowID: "",
        nowDate: "",
        nowPaperDate: "",
        startDate: "",
        endDate: "",
        changePaperPickerOpacity: "",//
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.getPapers();
    },
    getPapers: function () {
        wx.showLoading({
            title: '加载中',
        })
        let that = this;
        wx.request({
            url: appConfig.getComUrl + 'getPapers', //获取报纸
            data: {
                siteID: appConfig.siteId
            },
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                //处理报纸
                let _intoPaper = res.data;
                // console.log(_intoPaper)
                if (_intoPaper && _intoPaper.papers.length > 0) {
                    that.setData({
                        papers: _intoPaper,
                        nowID: _intoPaper.papers[0].id
                    })
                    if (_intoPaper.papers.length < 2) {
                        that.setData({
                            notOnlyOnePaper: false
                        })
                    }
                    that.getPaperDates();
                } else {
                    wx.hideLoading();
                    wx.showToast({
                        title: '没有报纸信息',
                        icon: 'loading',
                        duration: 1500
                    })
                }
            }
        })
    },
    getPaperDates: function () {
        wx.showLoading({
            title: '加载中',
        })
        let that = this;
        wx.request({
            url: appConfig.getComUrl + 'getPaperDates', //获取报纸日期
            data: {
                siteID: appConfig.siteId,
                id: that.data.nowID
            },
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {

                //处理报纸日期
                let _paperdatas = res.data;
                // console.log(_paperdatas)
                if (_paperdatas && _paperdatas.dates.length > 0) {
                    that.setData({
                        paperdatas: _paperdatas,
                        nowDate: _paperdatas.dates[0].date
                    })

                    let _len = that.data.paperdatas.dates.length;
                    let _startDate = that.data.paperdatas.dates[_len - 1].date.split("");
                    _startDate.splice(4, 0, "-");
                    _startDate.splice(7, 0, "-");
                    _startDate = _startDate.join("");

                    let _endDate = that.data.paperdatas.dates[0].date.split("");
                    _endDate.splice(4, 0, "-");
                    _endDate.splice(7, 0, "-");
                    _endDate = _endDate.join("");

                    that.setData({
                        startDate: _startDate,
                        endDate: _endDate,
                        nowPaperDate: _endDate
                    })
                    that.getPaperLayouts();
                } else {
                    wx.hideLoading();
                    wx.showToast({
                        title: '没有报纸信息',
                        icon: 'loading',
                        duration: 1500
                    })
                }
            }
        })
    },
    getPaperLayouts: function () {
        wx.showLoading({
            title: '加载中',
        })
        let that = this;
        wx.request({
            url: appConfig.getComUrl + 'getPaperLayouts', //获取报纸日期
            data: {
                siteID: appConfig.siteId,
                id: that.data.nowID,
                date: that.data.nowDate
            },
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                //处理报纸日期
                let _paperLayouts = res.data;
                if (_paperLayouts && _paperLayouts.layouts.length > 0) {
                    wx.hideLoading()
                    //获取版面数据之后，整理mapping 将0 1 2 3分别改为left top width height
                    let _layouts = _paperLayouts.layouts;
                    for (let i = 0; i < _layouts.length; i++) {
                        let _mappings = _layouts[i]["mapping"];
                        for (let j = 0; j < _mappings.length; j++) {
                            let _innerMappings = _mappings[j]["mapping"];
                            //从mapping解析最大最小值计算位置信息
                            let xarr = [];
                            let yarr = [];
                            for (let k = 0; k < _innerMappings.length; k++) {
                                xarr.push(parseFloat(_innerMappings[k].split(",")[0]));
                                yarr.push(parseFloat(_innerMappings[k].split(",")[1]));
                            }

                            let _top = Math.min.apply(this, yarr) + "%";
                            let _left = Math.min.apply(this, xarr) + "%";
                            let _width = Math.max.apply(this, xarr) - Math.min.apply(this, xarr) + "%";
                            let _height = Math.max.apply(this, yarr) - Math.min.apply(this, yarr) + "%";

                            //新加热区信息
                            _paperLayouts.layouts[i]["mapping"][j]["hottop"] = _top;
                            _paperLayouts.layouts[i]["mapping"][j]["hotleft"] = _left;
                            _paperLayouts.layouts[i]["mapping"][j]["hotwidth"] = _width;
                            _paperLayouts.layouts[i]["mapping"][j]["hotheight"] = _height;

                        }
                    }
                    //轮播样式 加载回到第一页 无动画 滑动时有动画
                    that.setData({
                        duration: 0
                    })

                    //版面图请求处理 默认请求前三张 如果小于三张 全请求
                    let _img0 = _paperLayouts.layouts[0].picUrl;
                    for (let i = 0; i < _layouts.length; i++) {
                        let _imgCurrent = _paperLayouts.layouts[i].picUrl;

                        if (i < 3) {
                            _paperLayouts.layouts[i].newPicUrl = _imgCurrent;
                        } else {
                            _paperLayouts.layouts[i].newPicUrl = _img0;
                        }
                    }

                    that.setData({
                        paperLayouts: _paperLayouts,
                        duration: 0,
                        current: 0
                    })

                    that.setData({
                        duration: 500
                    })
                    // console.log(that.data.paperLayouts)

                } else {
                    wx.hideLoading();
                    wx.showToast({
                        title: '没有报纸信息',
                        icon: 'loading',
                        duration: 1500
                    })
                }
            }
        })
    },
    showVer: function () {
        this.setData({
            showVer: true
        })
    },
    showPic: function () {
        this.setData({
            showVer: false
        })
    },
    bindPaperChange: function (e) {
        //获取选择的报纸Id
        let that = this;
        let idx = e.detail.value;
        let paperID = that.data.papers.papers[idx].id;
        if (that.data.nowID != paperID) {
            that.setData({
                nowID: paperID
            })
            that.getPaperDates();
            // console.log(paperID)
        }

    },
    bindDataChange: function (e) {
        //获取选择的日期
        let that = this;
        let idx = e.detail.value;
        let paperData = idx.replace(/-/g, "");
        if (that.data.nowDate != paperData) {
            that.setData({
                paperdatas: idx,
                nowDate: paperData
            })
            that.getPaperLayouts()
            // console.log(idx)
            // console.log(paperData)
        }

    },
    swiperChange: function (e) {
        //滑动版面图 请求第n+2张
        let _current = e.detail.current;
        // console.log(_current)
        let _paperLayouts = this.data.paperLayouts;
        if (_paperLayouts.layouts && _paperLayouts.layouts[_current + 2]) {
            let _next2Img = _paperLayouts.layouts[_current + 2].picUrl;
            if (_next2Img != _paperLayouts.layouts[_current + 2].newPicUrl) {
                // console.log(_current + 2)
                _paperLayouts.layouts[_current + 2].newPicUrl = _next2Img
                this.setData({
                    paperLayouts: _paperLayouts,
                })
            }
        }
    },
    // 点击时凸显"报纸“、”日期“按钮
    showTab: function () {
        this.setData({changePaperPickerOpacity: '0.7'})
    },
    // 动作结束后5秒淡化"报纸“、”日期“按钮
    hideTab: function () {
        setInterval(function () {
            this.setData({changePaperPickerOpacity: '0.2'})
        }, 1000) //循环时间 这里是1秒
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