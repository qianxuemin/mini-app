var appConfig = getApp();
var util = require('../../utils/util.js');
Page({
    onReady: function (res) {
        this.videoContext = wx.createVideoContext('myVideo')
    },
    data: {
        fileId: 0,
        duration: '00:00',
        videoObj: {},
        relList: [],
        hotDisList: [],
        siteId: appConfig.siteId,//siteId

        newCommPage: 0,//当前的page
        comHasMore: true,
        isAutoplay: false,//是否自动播放视频
        today: appConfig.today(), // 获取当前时间
        videoPlayDisplay: 'none',
        videoImgDisplay: 'block'
    },
    onLoad: function (option) {
        var that = this;
        var fileId = option.fileid;
        var duration = option.duration;
        that.setData({duration: duration})
        that.wxRequest(fileId);
    },
    // 获取视频稿件
    wxRequest: function (fileId) {
        var that = this;
        wx.request({
            url: appConfig.getComUrl + 'getArticleContent',
            data: {
                articleId: fileId,
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                var obj = res.data;
                var videoObj = that.initData(obj, that);
                var related = that.handleRelated(obj.related);
                that.setData({
                    videoObj: videoObj,
                    relList: related
                })
                that.playVideo('first');
            }
        })
        // 获取热门评论
        wx.request({
            url: appConfig.getComUrl + 'discussHot',
            data: {
                id: fileId,
                siteId: that.data.siteId,
                source: 0,
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                var obj = res.data.list;
                var hotDis = that.handleHotDis(obj);
                that.setData({
                    hotDisList: hotDis
                })
            }
        })
    },
    // 数据初始化
    initData: function (obj, that) {
        if (obj) {
            // 将发表时间格式化
            var t = obj.publishtime;
            if (t && t.length > 15) {
                var time = util.getDate(t);
                obj.publishtime = time;
            }
            // 文章标题的标签
            var _title = obj.title.match(/<("[^"]*"|'[^']*'|[^'">])*>/g);
            if (_title && _title.length != 0) {
                obj.titleStyle = true;
            }
            obj._title = _title;
        }
        return obj;
    },
    // 处理相关阅读
    handleRelated: function (_relList) {
        var that = this;
        var relList = []
        for (var i in _relList) {
            if (_relList[i].articleType != 2) {
                continue;
            }
            var t = _relList[i].publishtime;
            if (t.length > 15) {
                var time = util.getTime(t, this.data.today);
                _relList[i].publishtime = time;
            }
            //格式化视频的播放时间
            var duration = _relList[i].vTime;
            if (duration)
                _relList[i].vTime = duration.substr(3)

            relList.push(_relList[i])
        }
        return relList;
    },
    // 处理热门评论的数据
    handleHotDis: function (hotList) {
        var that = this;
        for (var i in hotList) {
            var t = hotList[i].created;
            if (t.length > 15) {
                var time = util.getTime(t, this.data.today);
                hotList[i].created = time;
            }
        }
        return hotList;
    },
    // 相关阅读的跳转
    detailVideo: function (e) {
        var fileId = e.currentTarget.dataset.fileid;
        wx.redirectTo({
            url: '../detailVideo/detailVideo?fileid=' + fileId,
        })
    },
    playVideo: function (info) {
        var that = this;
        // 获取当前的网络状态来判断是否自动播放视频
        var networkType = '';
        wx.getNetworkType({
            success: function (res) {
                // 返回网络类型, 有效值：
                // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                networkType = res.networkType;
                var isAutoplay = networkType == 'wifi' ? true : false;
                // 如果是打开页面时 如果是WiFi环境直接播放
                if (info && info == 'first') {
                    if (isAutoplay) {
                        that.doVideoDetail();
                    } else
                        return;
                }//点击播放时
                else {
                    // 如果是WiFi条件下播放，如果是2G、3G、4G环境则提示
                    if (networkType == '2g' || networkType == '3g' || networkType == '4g') {
                        wx.showModal({
                            title: '提示',
                            content: '您当前处于' + networkType + "环境，是否继续播放",
                            success: function (res) {
                                if (res.confirm) {
                                    that.doVideoDetail();
                                } else if (res.cancel) {
                                    return;
                                }
                            }
                        })
                    } else if (networkType == 'wifi') {
                        that.doVideoDetail();
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: '您当前处没有连接到网络',
                            success: function (res) {

                            }
                        })
                    }
                }
            }
        })
    },
    doVideoDetail: function () {
        var that = this;
        var video = that.data.videoObj;
        that.setData({
            videoPlayDisplay: 'block',
            videoImgDisplay: 'none',
            videoUrl: video.videos[0].videoarray[0].videoUrl,
            video: that.data.videoObj,
        })
    },
})