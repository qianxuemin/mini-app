// pages/detailArticle/detailArticle.js
var appConfig = getApp();
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        articleObj: null,
        videoUrl: '',//当前播放的视频url
        vidobj: {},//当前播放的视频
        audobj: {},//当前播放的音频
        audioDuration: '',//当前播放的音频时长
        relList: [],//相关阅读
        playPartDisplay: 'none',
        artPartDisplay: 'block',
        audioHeight: 0,
        isPlay: false,
        isAudio: false,
        audioTime: 0,
        hotDisList: [],//热门评论
        nodesList: [],//处理后的文章富文本
        videoList: [],//文章中的视频列表
        vidType: '',//文章中插入的音视频类型
        editorName: '责任编辑：',
        today: appConfig.today(), // 获取当前时间
        siteId: appConfig.siteId,//siteId
        pageOverflow: 'visible',
        videoAutoPlay: false,
        audioAutoPlay: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var fileId = options.fileid;
        var that = this;
        that.wxRequest(fileId);
    },
    playAudio: function (e) {
        var that = this;
        var vidobj = e.currentTarget.dataset.vidobj;
        that.doAudioDetail(vidobj);
    },
    doAudioDetail: function (vidobj) {
        var that = this;
        var title = that.data.articleObj._title;
        var fileId = that.data.articleObj.fileId;
        appConfig.globalData.audioTitle = title;
        appConfig.globalData.audioId = fileId;
        appConfig.globalData.isAudio = true;
        appConfig.globalData.isPlay = true;
        that.setData({
            audobj: vidobj,
            audTitle: title,
            isAudio: appConfig.globalData.isAudio,
            audioDuration: '',
        })
        // 后台播放
        wx.playBackgroundAudio({
            dataUrl: vidobj.videoUrl,
            coverImgUrl: vidobj.imageUrl,
            success: function (res) {
                wx.getBackgroundAudioPlayerState({
                    success: function (res) {
                        wx.getBackgroundAudioPlayerState({
                            success: function (res) {
                                var duration = res.duration
                                if (!duration || duration == 0) {
                                    appConfig.globalData.isPlay = false;
                                }
                                duration = util.handelDuration(duration, 'audio');
                                appConfig.globalData.duration = duration;
                                that.setData({
                                    audioDuration: duration,
                                    isPlay: appConfig.globalData.isPlay
                                })
                            }
                        })
                    }
                })
            }
        })
    },
    // 背景音乐暂停
    pauseBt: function () {
        var that = this;
        wx.getBackgroundAudioPlayerState({
            success: function (res) {
                var status = res.status
                if (status == 1) {
                    appConfig.globalData.currentAudio = res;
                    appConfig.globalData.isPlay = false;
                    that.setData({isPlay: appConfig.globalData.isPlay})
                    wx.pauseBackgroundAudio();
                }
            }
        })

    },
    // 播放背景音乐
    playBt: function () {
        var that = this;
        var duration = that.data.audioDuration;
        if (!duration || duration == 0) {
            return;
        }
        var currentAudio = appConfig.globalData.currentAudio
        var audioPosition = currentAudio.currentPosition;
        appConfig.globalData.isPlay = true;
        that.setData({isPlay: appConfig.globalData.isPlay})
        wx.playBackgroundAudio({
            dataUrl: currentAudio.dataUrl,
            success: function () {
                wx.seekBackgroundAudio({
                    position: audioPosition
                })
            }
        })
    },
    // 关闭背景音乐
    closeBt: function () {
        var that = this;
        appConfig.globalData.isAudio = false;
        appConfig.globalData.isPlay = false;
        that.setData({
            isAudio: appConfig.globalData.isPlay,
            isPlay: appConfig.globalData.isPlay
        })
        wx.stopBackgroundAudio();
    },
    playVideo: function (e) {
        var that = this;
        var vidobj = e.currentTarget.dataset.vidobj;
        that.getNetworkType('playVidio', vidobj)
    },
    doVideoDetail: function (vidobj) {
        var that = this;
        that.setData({
            playPartDisplay: 'block',
            artPartDisplay: 'none',
            vidobj: vidobj,
            pageOverflow: 'hidden'
        })
    },
    disPlay: function (e) {
        var that = this;
        this.videoContext.pause();
        that.setData({
            vidobj: null,
            artPartDisplay: 'block',
            playPartDisplay: 'none',
            pageOverflow: 'visible'
        })
    },
    // 数据初始化
    initData: function (obj, that) {
        if (obj) {
            // 将发表时间格式化
            var t = obj.publishtime;
            if (t.length > 15) {
                var time = util.getDate(t);
                obj.publishtime = time;
            }
            var _videoList;
            if (obj.videos && obj.videos.length != 0) {
                _videoList = obj.videos[0].videoarray;
            }
            // 判断是音频还是视频文件
            var vidType = '';
            for (var i in _videoList) {
                if (util.endWith(_videoList[i].videoUrl, 'mp4')) {
                    _videoList[i].vidType = 'mp4';
                } else if (util.endWith(_videoList[i].videoUrl, 'mp3')) {
                    _videoList[i].vidType = 'mp3';
                } else {
                    _videoList[i].vidType = 'elseType';
                }
                var duration = _videoList[i].duration;
                _videoList[i].duration = util.handelDuration(duration)
            }
            // 文章标题的标签
            var _title = obj.title.match(/<("[^"]*"|'[^']*'|[^'">])*>/g);
            if (_title && _title.length != 0) {
                obj.titleStyle = true;
            }
            obj._title = obj.title.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
            that.setData({
                articleObj: obj,
                relList: obj.related,
                videoList: _videoList,
                vidType: vidType,
            })
            // 处理文章文本的富文本格式
            that.handleContent(obj.content, that);
            if (that.data.relList && that.data.relList.length != 0) {
                that.handleRelated();
            }
        }
    },
    // 处理文章文本的富文本格式
    handleContent: function (content, that) {
        var _nodesList = [];
        var imgArr, videoArr, imgHtml, videoHtml;
        if (this.data.articleObj.images && this.data.articleObj.images.length != 0) {
            imgArr = this.data.articleObj.images[0].imagearray;
        }
        if (this.data.articleObj.videos && this.data.articleObj.videos.length != 0) {
            videoArr = this.data.articleObj.videos[0].videoarray;
        }
        content = that.contentToReplace(content, that);
        if (content) {
            // 图片插入标记处插入图片
            for (var i in imgArr) {
                imgHtml = '<img src="' + imgArr[i].imageUrl + '"style="height:auto;width:100%;" onerror="../../image/141.png"/>'
                content = content.replace(imgArr[i].ref, imgHtml);
            }
            if (content.indexOf('<!--VIDEOARRAY#') != -1) {
                var arr = content.match(/\<p.*?\<\/p\>/g)
                for (var i in arr) {
                    arr[i] = arr[i].replace(/\<(?!\!--)(?!img).*?\>/g, '')
                }
                content = arr.join("</p><p>")
                content = '<p>' + content + '</p>';
                content = content.replace(/\<p.*?\>([\s\S]*)(<!--VIDEOARRAY#[\d]-->)([\s\S]*)\<\/p\>/g, '<p>$1</p>$2<p>$3</p\>');
                // 视频插入标记处分割content，方便插入小程序的视频
                var arrVideo = [];
                var str0, str1;
                for (var i in videoArr) {
                    arrVideo = content.split(videoArr[i].ref);
                    str0 = arrVideo[0].trim();
                    str1 = arrVideo[1].trim();
                    if (util.endWith(str0, "</p>") && !util.startWith(str0, "<p>")) {
                        str0 = "<p>" + str0;
                    }
                    if (util.startWith(str0, "<p>") && !util.endWith(str0, "</p>")) {
                        str0 = str0 + "</p>";
                    }
                    if (util.startWith(str1, "<p>") && !util.endWith(str1, "</p>")) {
                        str1 = str1 + "</p>";
                    }
                    if (util.endWith(str1, "</p>") && !util.startWith(str1, "<p>")) {
                        str1 = "<p>" + str1;
                    }
                    // 去除空白的p标签<p></p>
                    str0 = that.removeP(str0);
                    _nodesList.push(str0);
                    content = str1;
                }
            }
            // 去除空白的p标签<p></p>
            content = that.removeP(content);
            _nodesList.push(content);
            this.setData({
                nodesList: _nodesList,
            })
        }
    },
    contentToReplace: function (content, that) {
        if (content) {
            // 双引号转换成单引号
            // content = content.replace(/\"/g, "'");
            // 清除标签内的多余空格
            content = that.removeSpace(content);
            // 去除所有的width
            content = content.replace(/width:[^>]*\;/gim, "");
            content = content.replace(/width:.*?(\'|\")/gim, "");
            content = content.replace(/width=(\'|\").*?(\'|\")/gim, "");
            // 去掉标签的部分style属性
            content = that.contentToTrim(content);
            //将ul li标签改为p标签
            content = content.replace(/\<li.*?>/gim, "<p>");
            content = content.replace(/\<\/li>/gim, "</p>");
            content = content.replace(/\<ul.*?\>/gim, "");
            content = content.replace(/\<\/ul\>/gim, "");
            // 去除param,em,html,head,body标签
            content = content.replace(/\<param.*?\>/gim, "");
            content = content.replace(/\<em.*?\<\/em\>/gim, "");
            content = content.replace(/\<html.*?\<body>/gim, "");
            content = content.replace(/\<\/body.*?\<\/html\>/gim, "");
            // 去除figcaption,figure,section标签
            content = content.replace(/\<figcaption/gim, '<p');
            content = content.replace(/\<\/figcaption\>/gim, "</p>");
            content = content.replace(/\<figure.*?\>/gim, "");
            content = content.replace(/\<\/figure\>/gim, "");
            content = content.replace(/\<section.*?\>/gim, "");
            content = content.replace(/\<\/section\>/gim, "");
            // 去除iframe,ins,del标签
            content = content.replace(/\<iframe.*?\>/gim, "");
            content = content.replace(/\<\/iframe\>/gim, "");
            content = content.replace(/\<ins.*?\>/gim, "");
            content = content.replace(/\<\/ins\>/gim, "");
            content = content.replace(/\<del.*?\>/gim, "");
            content = content.replace(/\<\/del\>/gim, "");
            content = that.removeP(content);
        }
        return content;
    },
    // 清除标签内的多余空格
    removeSpace(content) {
        if (content) {
            content = content.replace(/\s*\<\s*/g, "<");
            content = content.replace(/\s*\>\s*/g, ">");
            content = content.replace(/\\s{2,}/g, "");
        }
        return content;
    },
    removeP(content) {
        // 去除空白的p标签<p></p>
        if (content) {
            content = content.replace(/\<p\>\s*\<\/p\>/gim, "");
            content = content.replace(/\<p\>\<br\><\/p\>/gim, "");
            content = content.trim();
        }
        return content;
    },
    // 去掉标签的部分style属性
    contentToTrim: function (content) {
        if (content) {
            // var trimHtmlStrings = ["outline", "text-decoration-line", "text-align", "text-indent", "padding-top", "padding-left", "padding-right", "padding-bottom", "margin-left", "margin-top", "margin-right", "margin-bottom", "text-transform", "line-height", "<hr>", "font-size", "background-color", "min-height", "min-width", "max-width", "max-height", "size", "width", "height", "padding", "margin", "display", "float", "background"];
            var trimHtmlStrings = ["TEXT-ALIGN", "TEXT-INDENT", "padding-top", "padding-left", "padding-right", "padding-bottom", "margin-left", "margin-top", "margin-right", "margin-bottom", "min- height", "min- width", "max- width", "max- height", "TEXT-TRANSFORM", "LINE-HEIGHT", "FONT-FAMILY", "<HR>", "BACKGROUND-COLOR", "WIDTH", "HEIGHT", "DISPLAY", "padding", "margin", "FLOAT"];
            var str = "";
            // 过滤正文中的部分标签
            for (var i = 0; i < trimHtmlStrings.length; i++) {
                //只有一个属性的
                var regs = new RegExp("[\'|\"]" + trimHtmlStrings[i] + ".*?[\'|\"]", "gi");
                content = content.replace(regs, '""');
                //以分号结尾的
                var regs = new RegExp(trimHtmlStrings[i] + "\s*\:\s*[\w]+\;$", "gi");
                content = content.replace(regs, '');
                //以单引号结尾的
                var regs_ = new RegExp(trimHtmlStrings[i] + "\s*\:\'.*?\'", "gi");
                content = content.replace(regs_, "");
                //在最后的，以双引号结尾
                var regs_ = new RegExp(trimHtmlStrings[i] + "\:.*?\"", "gi");
                content = content.replace(regs_, '"');
            }
        }
        return content;
    },
    // 处理相关阅读
    handleRelated: function () {
        var that = this;
        var relList = that.data.relList;
        for (var i in relList) {
            var t = relList[i].publishtime
            if (t.length > 15) {
                var time = util.getTime(t, this.data.today);
                relList[i].publishtime = time;
            }
            if (relList[i].vTime) {
                relList[i].vTime = relList[i].vTime.substr(3)
            }
            // 文章标题的标签
            relList[i]._title = relList[i].title.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
        }
        that.setData({
            relList: relList
        })
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
    relDetail: function (e) {
        var fileId = e.currentTarget.dataset.fileid;
        var type = e.currentTarget.dataset.type;
        var url = '';
        if (type == 0) {
            url = '../detailArticle/detailArticle?fileid=';
        } else if (type == 1) {
            url = '../detailPicture/detailPicture?fileid=';
        } else if (type == 2) {
            url = '../detailVideo/detailVideo?fileid=';
        } else if (type == 3) {
            url = '../detailSpecial/detailSpecial?fileid=';
        }
        wx.redirectTo({
            url: url + fileId,
        })
    },
    //数据的获取
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
                that.initData(obj, that);
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
    getNetworkType: function (info, obj) {
        var that = this;
        // 获取当前的网络状态来判断是否自动播放视频
        var networkType = '';
        wx.getNetworkType({
            success: function (res) {
                // 返回网络类型, 有效值：
                // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                networkType = res.networkType;
                var isAutoplay = networkType == 'wifi' ? true : false;
                // 如果是WiFi条件下播放，如果是2G、3G、4G环境则提示
                if (networkType == '2g' || networkType == '3g' || networkType == '4g') {
                    wx.showModal({
                        title: '提示',
                        content: '您当前处于' + networkType + "环境，是否继续播放",
                        success: function (res) {
                            if (res.confirm) {
                                isAutoplay = true;
                                that.setData({videoAutoPlay: true})
                                // if (info == 'playAudio')
                                //   that.doAudioDetail(obj);
                                // else if (info == 'playVidio')
                                that.doVideoDetail(obj);
                            } else if (res.cancel) {
                                return;
                            }
                        }
                    })
                } else if (networkType == 'wifi') {
                    that.setData({videoAutoPlay: true})
                    if (info == 'playAudio')
                        that.doAudioDetail(obj);
                    else if (info == 'playVidio')
                        that.doVideoDetail(obj);
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '您当前处没有连接到网络',
                        success: function (res) {

                        }
                    })
                }
            }
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function (res) {
        var that = this;
        try {
            this.videoContext = wx.createVideoContext('articleVideo');
        } catch (e) {
            console.log(e.message)
        }
        // 监听背景音乐
        wx.onBackgroundAudioPlay(function () {
            wx.getBackgroundAudioPlayerState({
                success: function (res) {
                    var duration = res.duration
                    duration = util.handelDuration(duration, 'audio');
                    appConfig.globalData.duration = duration;
                    appConfig.globalData.isPlay = true;
                    that.setData({
                        audioDuration: duration,
                        isPlay: appConfig.globalData.isPlay
                    })
                }
            })
        })
        wx.onBackgroundAudioStop(function () {
            appConfig.globalData.isAudio = false;
            appConfig.globalData.isPlay = false;
            that.setData({
                isAudio: appConfig.globalData.isPlay,
                isPlay: appConfig.globalData.isPlay
            })
        })
        // 监听背景音乐暂停，将全局变量isPlay改为false
        wx.onBackgroundAudioPause(function () {
            appConfig.globalData.isPlay = false;
            that.setData({isPlay: appConfig.globalData.isPlay})
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.setData({
            isPlay: appConfig.globalData.isPlay,
            audTitle: appConfig.globalData.audioTitle,
            audioId: appConfig.globalData.audioId,
            audioDuration: appConfig.globalData.duration,
            isAudio: appConfig.globalData.isAudio,
            audioTime: util.handelDuration(appConfig.globalData.audioTime, 'audio'),
        })
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

// 获取背景音乐当前播放的时间
function getAudioTime(that, time, duration) {
    if (time == duration) {
        return;
    }
    var time = setTimeout(function () {
            that.setData({
                audioTime: util.handelDuration(time + 1, 'audio'),
            });
            getAudioTime(that, time, duration);
        }
        , 1000)
}