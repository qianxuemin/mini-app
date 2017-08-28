// pages/detail/detail.js
let appConfig = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    fileId:0,
    hasIntroTitle:false,
    hasSource:false,
    hasPublishTime:false,
    hasImg:false,
    newPublishtime:"",
    article: {},
    nodes: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      fileId: options.fileId
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //获取稿件内容
    this.getPaperArticle();
  },
  getPaperArticle: function () {
    let that = this;
    wx.request({
      url: appConfig.getComUrl + 'getPaperArticle', 
      data: {
        id: that.data.fileId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //处理报纸
        let _article = res.data;
        console.log(_article)
        if (_article) {
          that.setData({
            article: _article
          })

          //引题
          if (that.data.article.introTitle != "") {
            that.setData({
              hasIntroTitle: true
            })
          }
          //来源
          if (that.data.article.source != "") {
            that.setData({
              hasSource: true
            })
          }
          //发布时间
          if (that.data.article.publishtime != "") {
            let _time = that.data.article.publishtime.split(" ")[0];
            that.setData({
              hasPublishTime: true,
              newPublishtime: _time
            })
          }
          //正文
          if (that.data.article.content != "") {
            //let _nodes = that.data.article.content.replace(/\<\/p\>/g,"\<\/p\>\<br \/\>").replace(/\<p\>\<\/p\>/g," ");
            let _nodes = that.data.article.content.replace(/\<p\>/g, '\<p style="margin-bottom:10px" \>');
            that.setData({
              nodes: _nodes
            })
          }
          //图片
          if (that.data.article.images.length > 0 && that.data.article.images[0].imagearray.length > 0) {
            that.setData({
              hasImg: true
            })
          }

        }
      }
    })
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