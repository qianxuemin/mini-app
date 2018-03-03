// pages/news/news.js
var appConfig = getApp();
var util = require('../../utils/util.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        parentColumnId: appConfig.parentColumnId,
        _columns: [],    //初始导航栏列表
        columns: [],  //过滤后的导航栏列表
        city: '',
        columnId: 0, // 当前的columnId
        columnStyle: 0,//当前的columnStyle
        list: [],   //导航栏对应的页面数据
        listSwiper: [], //页面的轮播图的数组
        articleList: [], //除轮播图以外的文章列表
        topArticleList: [], //置顶稿件
        cacheObj: {}, //加载过的页面数据缓存
        itemCurrent: 0, //导航栏当前tab的index
        scrollItem: '', //导航栏当前tab的id
        scrollLeft: 0,  //导航栏设置横向滚动条位置
        pageWidth: 0,   //当前设备的屏幕宽度
        pageHeight: 0,  //当前设备的屏幕高度
        navHeight: 0,//导航栏的高度
        navWidth: 0,//导航栏的宽度
        autoplay: true, //轮播图是否自动播放
        circular: true,//轮播图是否循环播放
        today: appConfig.today(), // 获取当前时间
        swiperCount: '', //页面的轮播图的个数
        scrollTop: 0,

        videoPlayBoxDisplay: 'none',//视频栏目下是否显示置顶的视频播放器
        scrollIntoView: '',//视频栏目下点击视频时，滚动到该视频的ID
        videoObj: {}, //视频栏目下点击置顶播放的视频
        videoUrl: '',
        videoID: '',//当前播放视频在视频列表里面显示的id
        videoAutoplay: false, //视频是否自动播放

        playAudioDisplay: 'none',//后台音乐
        audioDuration: '',
        currentAudio: {},
        currentPosition: '',
        isPlay: false,
        isAudio: false,

        lastFileId: 0,//获取文章列表时的参数 默认为0
        lastFileIdList: {},
        pageNum: 0,//获取文章列表时的参数 默认为0
        pageList: {},//每个页面的pageNum
        ArticleCount: 20,
        localColumnId: 0,// 地方栏目的下一级columnId

        articleHasMoreList: {},
        lockHasMoreList: {},
        canLoadNewDataList: {},
        articleHasMore: true,
        lockHasMore: false,//是否允许触底刷新
        canLoadNewData: true,
        hiddenLoading: true,
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //获取导航栏
        this.setData({hiddenLoading: false})
        this.doGetColumns(this, 'onLoad');
    },

    doGetColumns: function (that, info, parentColumnId) {
        if (!parentColumnId || parentColumnId == '') {
            parentColumnId = that.data.parentColumnId
        }
        // console.log(appConfig.getComUrl + 'getColumns?' + 'siteId=' + appConfig.siteId + '&parentColumnId=' + that.data.parentColumnId +'&version=0&columnType=1');
        wx.request({
            url: appConfig.getComUrl + 'getColumns',
            data: {
                siteId: appConfig.siteId,
                parentColumnId: parentColumnId,
                version: 0,
                columnType: 1,
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                if (res)
                    if (info == 'onLoad') {
                        that.setData({
                            _columns: res.data.columns,
                            hiddenLoading: true
                        })
                        that.doInit(that);
                    } else if (info == 'localItem') {
                        //获取地方栏目的下一级栏目
                        var _columns = res.data.columns;
                        var city = that.data.city;
                        var columnId;
                        for (var i in _columns) {
                            if (_columns[i].columnName == city) {
                                columnId = _columns[i].columnId;
                                break;
                            }
                            //如果没有获取到当地的定位的城市的columnId,则默认显示第一页
                            if (i == _columns.length - 1) {
                                columnId = _columns[0].columnId;
                            }
                        }
                        that.setData({localColumnId: columnId})
                        that.loadNewData(columnId, 'first');
                    }
            }
        })
    },
    doInit: function (that) {
        // 获取屏幕的宽度和高度
        that.getScreenInfo();
        // 获取当前城市
        that.getCityMsg();
        // 处理导航栏数据，过滤掉不需要的数据
        that.handleColumns();
        // 初始化显示的文章列表，默认显示第一页
        var columnId = that.data.columns[0]['columnId']
        var columnStyle = that.data.columns[0]['columnStyle']
        that.setData({
            columnId: columnId,
            columnStyle: columnStyle
        })
        that.labelChange('', columnId);
    },
    //获取用户所在城市
    getCityMsg: function () {
        var that = this;
        wx.getLocation({
            success: function (res) {
                var longitude = res.longitude;
                var latitude = res.latitude;
                that.getCity(longitude, latitude);
            },
        })
    },
    //经纬度转城市
    getCity: function (longitude, latitude) {
        var that = this;
        wx.request({
            url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + ',' + longitude + '&key=E5FBZ-5U3C6-ZFNSS-EY4K4-GTRA3-KWBSA&get_poi=1',
            data: {},
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                var city = res.data.result.address_component.city;
                if (util.endWith(city, "市")) {
                    city = city.substring(0, city.length - 1)
                }
                if (city && city != '') {
                    var columns = that.data.columns;
                    for (var i in columns) {
                        if (columns[i].columnStyle == 205)
                            columns[i].columnName = city
                    }
                    that.setData({
                        city: city,
                        columns: columns
                    })
                }
            }
        })
    },
    // 处理导航栏数据，过滤掉不需要的数据
    handleColumns: function () {
        //获取导航栏列表
        var that = this;
        var _list = that.data._columns;
        var columnList = [];//满足要求的导航栏列表list
        for (var i in _list) {
            //判断columnStyle：普通，视频，地方
            if (_list[i].synXCX && _list[i].synXCX == 1) //182182
                if (_list[i].columnStyle == 101 || _list[i].columnStyle == 201 || _list[i].columnStyle == 203 || _list[i].columnStyle == 205) {
                    columnList.push(_list[i]);
                }
        }
        that.setData({
            columns: columnList,
        });
    },
    // 获取导航栏的ID，调用相应的接口// 获取导航栏的ID，调用相应的接口
    labelChange: function (info, columnId) {
        var that = this;
        var cacheObj = that.data.cacheObj;
        var columnStyle = that.data.columnStyle;
        // 刷新操作
        if (info == 'refresh') {
            that.setData({
                // cacheObj: {},
                pageNum: 0,
                lastFileId: 0,
                today: appConfig.today(),
                scrollTop: 0,
            })
            columnId = that.data.columnId;
            if (columnStyle == 205) {
                columnId = that.data.localColumnId;
            }
            that.loadNewData(columnId, 'refresh');
        }
        // 如果是第一次请求，则请求数据并且设置缓存数据
        else if (!cacheObj || !cacheObj[columnId]) {
            that.setData({
                pageNum: 0,
                lastFileId: 0
            })
            if (columnStyle == '205') {
                that.doGetColumns(that, 'localItem', columnId);
            } else {
                that.loadNewData(columnId, 'first');
            }
        } else {
            // 如果不是第一次请求，则从缓存中读取数据
            that.getCacheList(columnId, 'labelChange');
        }
    },
    // 获取新数据
    loadNewData: function (columnId, info) {
        var hiddenLoading, that = this;
        if (info == 'refresh') {
            hiddenLoading = true;
        } else if (info == 'first' || info == 'loadMore') {
            hiddenLoading = false;
        }
        if (that.data.pageNum == 0) {
            that.setData({
                hiddenLoading: hiddenLoading,
                articleList: [],
                listSwiper: [], //页面的轮播图的数组
                articleHasMore: true,
                lockHasMore: false,//是否允许触底刷新
                canLoadNewData: true,
            })
        } else {
            that.setData({
                hiddenLoading: false,
            })
        }
        wx.request({
            url: appConfig.getComUrl + 'getArticles',
            data: {
                columnId: columnId,
                typeScreen: appConfig.typeScreen,
                lastFileId: that.data.lastFileId,
                page: that.data.pageNum,
                version: 0,
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                var list = res.data.list;
                var ArticleCount = that.data.ArticleCount;
                //当返回的列表的条数不足ArticleCount时，表示下次已经没有数据，则articleHasMore为false
                if (list.length < ArticleCount) {
                    that.setData({
                        list: list,
                        articleHasMore: false
                    })
                } else {
                    that.setData({
                        list: list
                    })
                }
                // 格式化数据
                columnId = that.data.columnId;
                that.handleData(columnId, info);
            }
        })
    },
    // 处理数据
    handleData: function (columnId, info) {
        var that = this;
        //轮播图个数
        var index = that.data.itemCurrent;
        var column = that.data.columns[index];
        var swiperCount = column['topCount'];
        //获取文章列表
        var _list = that.data.list;
        var swippers = [],//轮播图的文章列表list
            topList = [],//置顶稿件list
            articles = [];//非轮播图的文章列表list
        for (var i in _list) {
            //判断articleType： 文章，组图，视频，专题
            if (_list[i].articleType == 0 || _list[i].articleType == 1 || _list[i].articleType == 2 || _list[i].articleType == 3) {
                // 将发表时间格式化
                var t = _list[i].publishtime;
                if (t.length > 15) {
                    var time = util.getTime(t, that.data.today);
                    _list[i].publishtime = time;
                }
                //去掉标题的样式
                var title = _list[i].title;
                _list[i]._title = title.replace(/\<.*?\>/g, '');
                // 格式化视频类型的稿件的时长参数
                if (_list[i].articleType == 2) {
                    var t0 = _list[i].duration;
                    _list[i].duration = util.handelDuration(t0, 'video');
                }
                //判断是否有图
                if (info == 'first' || info == 'refresh')
                    var pic;
                if (pic = _list[i].picSmall || _list[i].picMiddle || _list[i].picBig) {
                    if (swippers.length < swiperCount) {
                        // 将文章标题中的HTML标签去掉
                        var title = _list[i].title;
                        _list[i]._title = title.replace(/\<.*?\>/g, '');
                        swippers.push(_list[i]);
                        continue;
                    }
                }
                // 是否为置顶稿件
                if (_list[i].isTop) {
                    topList.push(_list[i]);
                    continue;
                }
                //处理videoUrl，方便显示音频或者视频标记
                if (_list[i].videoUrl) {
                    if (util.endWith(_list[i].videoUrl, 'mp3')) {
                        _list[i]._videoUrl = 'mp3';
                    } else if (util.endWith(_list[i].videoUrl, 'mp4')) {
                        _list[i]._videoUrl = 'mp4';
                    }
                }
            }
            articles.push(_list[i]);
        }
        // 合并稿件
        var allList = topList;
        allList.push.apply(allList, articles);
        var pageNum = that.data.pageNum;
        // 页面第一次加载
        if (pageNum == 0) {
            that.setData({
                listSwiper: swippers,
                articleList: allList,
                topArticleList: topList,
                swiperCount: swiperCount,
            });
        } //页面"更多“加载
        else {
            var _articleList = that.getCacheList(columnId, 'loadNew');
            var articleList = _articleList.concat(allList)
            that.setData({
                articleList: articleList,
            });
        }
        that.setData({
            lockHasMore: true,
            hiddenLoading: true
        })
        // 设置缓存数据
        that.setCacheList(columnId, pageNum);
    },

    // 设置缓存数据
    setCacheList: function (key, pageNum) {
        var that = this;
        var articleHasMoreList = that.data.articleHasMoreList;
        var lockHasMoreList = that.data.lockHasMoreList;
        var canLoadNewDataList = that.data.canLoadNewDataList;
        articleHasMoreList[key] = that.data.articleHasMore;
        lockHasMoreList[key] = that.data.lockHasMore;
        canLoadNewDataList[key] = that.data.canLoadNewData;

        var value = that.data.articleList;
        var swiperVal = that.data.listSwiper;
        var cacheObj = that.data.cacheObj;
        cacheObj[key] = value;
        var pageList = that.data.pageList;
        pageList[key] = pageNum + 1;
        var lastFileIdList = that.data.lastFileIdList;
        lastFileIdList[key] = that.data.lastFileId;

        if (swiperVal && swiperVal.length != 0) {
            var swiperKey = 'swi_' + key;
            cacheObj[swiperKey] = swiperVal;
        }
        that.setData({
            cacheObj: cacheObj,
            lastFileIdList: lastFileIdList,
        })
    },
    // 获取缓存数据
    getCacheList: function (key, info) {
        var that = this;
        var cacheObj = that.data.cacheObj;
        var list = cacheObj[key];
        if (info == 'loadNew') {
            return list;
        }
        var swiperKey = 'swi_' + key;
        var swiperVal = cacheObj[swiperKey];
        var pageNum = that.data.pageList[key];
        var lastFileId = that.data.lastFileIdList[key];
        var articleHasMore = that.data.articleHasMoreList[key];
        var lockHasMore = that.data.lockHasMoreList[key];
        var canLoadNewData = that.data.canLoadNewDataList[key];
        that.setData({
            articleList: list,
            listSwiper: swiperVal,
            pageNum: pageNum,
            articleHasMore: articleHasMore,
            lockHasMore: lockHasMore,
            canLoadNewData: canLoadNewData,
            lastFileId: lastFileId
        })
    },

    //点击导航栏触发
    clickLabel: function (e) {
        var that = this;
        //获取当前点击的导航栏的tab元素的宽度，方便移动使之居中显示
        var thisId = e.target.id;
        var currId = that.data.itemCurrent;
        var thisIndex = parseInt(thisId.substr(5));
        if (thisIndex == currId) {
            return;
        }
        var itemWidth;
        wx.createSelectorQuery().select('#' + thisId).boundingClientRect(function (rect) {
            itemWidth = rect.width / 2;
            that.reClick(e, thisIndex, itemWidth)
        }).exec()
        // 点击导航栏不同的tab，切换页面
        that.setData({
            itemCurrent: parseInt(thisIndex),
        })
    },

    // 移动导航栏，使之居中
    reClick: function (e, thisIndex, itemWidth) {
        var that = this;
        var scroll = that.data.pageWidth / 2,
            offsetLeft = e.target.offsetLeft;
        if (e.detail.x != scroll) {
            that.setData({
                scrollLeft: offsetLeft - scroll + itemWidth,
            })
        }
    },

    // 左右滑动页面tab切换时触发：导航栏滑动
    tabChange: function (e) {
        var that = this;
        that.closeVideoPlayer();
        var current = e.detail.current,//现在的current
            _current = that.data.itemCurrent,//上一次的current
            isLeft = true;//是否向右移动
        var columnId = that.data.columns[current]['columnId'];
        var columnStyle = that.data.columns[current]['columnStyle'];
        that.setData({
            itemCurrent: current,
            columnId: columnId,
            columnStyle: columnStyle
        })
        that.labelChange('', columnId);
        if (current == _current) {
            return;
        }
        else if (_current > current) {
            isLeft = false;
        }
        wx.createSelectorQuery().select('#label' + current).boundingClientRect(function (rect) {
            // 获取导航栏的ID，调用相应的接口
            var itemWidth = rect.width / 2;
            var scrollLeft = that.data.scrollLeft,
                pageW = that.data.pageWidth / 2;
            if (isLeft) {
                if (rect.left + itemWidth > pageW) {
                    scrollLeft = scrollLeft + rect.left + itemWidth - pageW;
                }
            } else {
                if (scrollLeft > 0) {
                    scrollLeft = scrollLeft - rect.left;
                }
            }
            that.setData({
                scrollLeft: scrollLeft,
            })
        }).exec()
    },

    // 点击页面轮播图触发的事件，获取artcleId，进入文章详情页面
    swiperClick: function (e) {
        this.closeVideoPlayer();
        var artcleId = e.currentTarget.dataset.fileid;
        var url = '',
            articleType = e.currentTarget.dataset.articletype;
        if (articleType == 0) {
            url = '../detailArticle/detailArticle?fileid=' + artcleId;
        } else if (articleType == 1) {
            url = '../detailPicture/detailPicture?fileid=' + artcleId;
        } else if (articleType == 2) {
            var duration = e.currentTarget.dataset.duration;
            url = '../detailVideo/detailVideo?fileid=' + artcleId + '&duration=' + duration;
        } else if (articleType == 3) {
            url = '../detailSpecial/detailSpecial?fileid=' + artcleId;
        }
        wx.navigateTo({
            url: url,
        })
    },
    // 进入普通文章类型详情页articleType == 0
    detail: function (e) {
        var fileId = e.currentTarget.dataset.fileid;
        wx.navigateTo({
            url: '../detailArticle/detailArticle?fileid=' + fileId,
        })
    },
    // 进入组图类型详情页articleType == 1
    detailPicture: function (e) {
        var fileId = e.currentTarget.dataset.fileid;
        wx.navigateTo({
            url: '../detailPicture/detailPicture?fileid=' + fileId,
        })
    },
    // 进入视频类型详情页articleType == 2
    detailVideo: function (e) {
        this.closeVideoPlayer();
        var fileId = e.currentTarget.dataset.fileid;
        var duration = e.currentTarget.dataset.duration;
        wx.navigateTo({
            url: '../detailVideo/detailVideo?fileid=' + fileId + '&duration=' + duration,
        })
    },
    // 进入专题类型详情页articleType == 3
    detailSpecial: function (e) {
        var fileId = e.currentTarget.dataset.fileid;
        wx.navigateTo({
            url: '../detailSpecial/detailSpecial?fileid=' + fileId,
        })
    },
    // 视频栏目下点击播放视频，则该视频置顶播放
    videoDetail: function (e) {
        if (e) {
            var that = this;
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
                                    that.doVideoDetail(e);
                                } else if (res.cancel) {
                                    return;
                                }
                            }
                        })
                    } else if (networkType == 'wifi') {
                        that.doVideoDetail(e);
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
        }
    },
    doVideoDetail: function (e) {
        var that = this;
        // that.videoContext.play();
        // 视频列表中的视频的总数
        var VideoCount = e.currentTarget.dataset.count;
        // 点击的视频对象
        var videoObj = e.currentTarget.dataset.video;
        var videoId = e.currentTarget.id;
        var currVideoId = parseInt(videoId.substr(6));
        if (currVideoId >= VideoCount - 1) {
            currVideoId = VideoCount - 1;
            // } else {
            //   currVideoId++;
        }
        // 屏幕的高度
        var h = that.data.pageHeight;
        that.setData({
            videoPlayBoxDisplay: 'block',
            videoObj: videoObj,
            videoUrl: videoObj.videoUrl,
            videoID: videoId,
            scrollIntoView: 'video_' + currVideoId,
            videoAutoplay: true,
        })
    },
    closeVideoPlayer: function () {
        var that = this;
        this.videoContext.pause();
        that.setData({
            videoAutoplay: false,
            videoObj: {},
            videoUrl: '',
            videoPlayBoxDisplay: 'none',
        })
    },
    // 触底刷新  重新请求数据并且补充到原来的列表后面
    loadMoreNewArticles: function (e) {
        var that = this;
        // 防止重复请求加载
        if (that.data.articleHasMore && that.data.lockHasMore) {
            //当前加载的文章列表
            var list = that.data.list;
            that.setData({lockHasMore: false})
            var _lastFileId = list[list.length - 1].fileId;
            var lastFileId = that.data.lastFileId;
            var page = that.data.pageNum;
            page++;
            that.setData({
                lastFileId: _lastFileId,
                pageNum: page
            })
            var columnId = that.data.columnId;
            that.loadNewData(columnId, 'loadMore');
            // } else {
            //   // if (that.data.lockHasMore) {
            //   if (!that.data.canLoadNewData && that.data.lockHasMore) {
            //     wx.showToast({
            //       title: '已经到底啦',
            //       icon: 'success',
            //     })
            //     setTimeout(function () {
            //       wx.hideToast()
            //     }, 1000)
            //   // }
            //   }else{
            //     that.setData({ canLoadNewData: false })
            //   }
        }
    },
    page_refresh: function () {
        var that = this;
        that.labelChange('refresh')
        wx.showToast({
            title: '正在刷新',
            icon: 'loading',
        })
        setTimeout(function () {
            wx.hideToast()
        }, 1000)
    },
    // 获取屏幕的宽度和高度
    getScreenInfo: function () {
        var that = this;
        var w, h;
        wx.getSystemInfo({
            success: function (res) {
                w = res.windowWidth
                h = res.windowHeight
            }
        })
        wx.createSelectorQuery().select('#navigation').boundingClientRect(function (rect) {
            // 获取导航栏的ID，调用相应的接口
            that.setData({
                pageWidth: w,
                pageHeight: h,
                navHeight: rect.height,
                navWidth: rect.width,
            })
        }).exec()
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
                wx.getBackgroundAudioPlayerState({
                    success: function (res) {
                        wx.getBackgroundAudioPlayerState({
                            success: function (res) {
                                that.setData({isPlay: true})
                            }
                        })
                        wx.seekBackgroundAudio({
                            position: audioPosition
                        })
                    }
                })
            }
        })
    },
    // 关闭背景音乐
    closeBt: function () {
        var that = this;
        wx.stopBackgroundAudio()
        that.setData({
            isAudio: false,
            isPlay: false
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function (res) {
        try {
            this.videoContext = wx.createVideoContext('myVideo');
        } catch (e) {
            console.log(e.message)
        }
    },
    onShow: function () {
        this.setData({
            isPlay: appConfig.globalData.isPlay,
            audTitle: appConfig.globalData.audioTitle,
            audioId: appConfig.globalData.audioId,
            audioDuration: appConfig.globalData.duration,
            isAudio: appConfig.globalData.isAudio
        })
    },
    onHide: function () {
        this.closeVideoPlayer();
    },
    onError: function () {
        wx.showNavigationBarLoading()
    },
    onUnload: function () {

    },
    onShareAppMessage: function () {

    },
    onPullDownRefresh: function () {

    },
})

// 获取背景音乐当前播放的时间
function getAudioTime(that, time, duration) {
    if (time == duration) {
        return;
    }
    var time = setTimeout(function () {
            that.setData({
                time: time + 1
            });
            getAudioTime(that, time, duration);
        }
        , 1000)
}