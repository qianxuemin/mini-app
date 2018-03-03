// pages/detailSpecial/detailSpecial.js
var appConfig = getApp();
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        speObj: {},//专题
        speColumns: [],//专题栏目
        speArticles: {},//
        linkID: '',//linkID
        lastFileId: 0,
        siteId: appConfig.siteId,//siteId
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        var fileId = options.fileid;
        that.setData({linkID: fileId})
        that.loadNewData(fileId);
        that.loadSpecial(fileId);
    },
    // 加载新数据
    loadNewData: function (fileId) {
        var that = this;
        // console.log(appConfig.getComUrl + 'getColumn?columnId=' + fileId + "&siteId=" + that.data.siteId)
        wx.request({
            url: appConfig.getComUrl + 'getColumn',
            data: {
                columnId: fileId,
                siteId: that.data.siteId,
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                var obj = res.data;
                that.setData({speObj: obj});
            },
        })
    },
    // 加载专题详情各个栏目
    loadSpecial: function (fileId) {
        var that = this;
        var linkID = fileId
        wx.request({
            url: appConfig.getComUrl + 'getColumns',
            data: {
                siteId: that.data.siteId,
                parentColumnId: linkID,
                version: 0,
                columnType: -1,
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                var columnsObj = res.data.columns;
                for (var i in columnsObj) {
                    that.loadArticles(i, columnsObj[i].columnId);
                }
                that.setData({
                    speColumns: columnsObj,
                });
            },
        })
    },
    // 加载专题各个栏目下面的稿件
    loadArticles: function (index, columnId) {
        var that = this;
        wx.request({
            url: appConfig.getComUrl + 'getArticles',
            data: {
                columnId: columnId,
                lastFileId: that.data.lastFileId,
                count: 30,
                rowNumber: 0,
                version: 0,
                adv: 1,
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                var articles = res.data.list;
                articles = that.handleArticle(articles);
                var articlesList = that.data.speArticles;
                articlesList[index] = articles;
                that.setData({
                    speArticles: articlesList
                });
            },
        })
    },
    handleArticle: function (articles) {
        if (articles) {
            var topList = [],
                articleList = [];//置顶稿件list
            // 将发表时间格式化
            for (var i in articles) {
                //判断articleType： 文章，组图，视频，专题
                if (articles[i].articleType == 0 || articles[i].articleType == 1 || articles[i].articleType == 2 || articles[i].articleType == 3) {
                    // 将发表时间格式化
                    var t = articles[i].publishtime;
                    if (t.length > 15) {
                        var time = util.getTime(t, this.data.today);
                        articles[i].publishtime = time;
                    }
                    // 将文章标题中的HTML标签去掉
                    var title = articles[i].title;
                    articles[i]._title = title.replace(/\<.*?\>/g, '');
                    // 是否为置顶稿件
                    if (articles[i].isTop) {
                        topList.push(articles[i]);
                        continue;
                    }
                    //处理videoUrl，方便显示音频或者视频标记
                    if (articles[i].videoUrl) {
                        if (util.endWith(articles[i].videoUrl, 'mp3')) {
                            articles[i].videoUrl = 'mp3';
                        } else if (util.endWith(articles[i].videoUrl, 'mp4')) {
                            articles[i].videoUrl = 'mp4';
                        }
                    }
                    // 格式化视频类型的稿件的时长参数
                    if (articles[i].articleType == 2) {
                        var t0 = articles[i].duration + '';
                        if (t0.indexOf(':') == -1) {
                            var t1 = parseInt(t0 / 60);
                            var t2 = parseInt(t0 % 60);
                            if (t1 < 10) {
                                t1 = "0" + t1;
                            }
                            if (t2 < 10) {
                                t2 = "0" + t2;
                            }
                            var time = t1 + ":" + t2;
                            articles[i].duration = time;
                        }
                    }
                    articleList.push(articles[i]);

                }
            }
            // 合并稿件
            var allList = topList;
            allList.push.apply(allList, articleList);
            return allList;
        }
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
        var fileId = e.currentTarget.dataset.fileid;
        wx.navigateTo({
            url: '../detailVideo/detailVideo?fileid=' + fileId,
        })
    },
    // 进入专题类型详情页articleType == 3
    detailSpecial: function (e) {
        var fileId = e.currentTarget.dataset.fileid;
        wx.navigateTo({
            url: '../detailSpecial/detailSpecial?fileid=' + fileId,
        })
    },
})