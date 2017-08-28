//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    city:"获取地址的"
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
    this.getCityMsg();
    this.getMaxWidthAndDraw();
  },
  //获取用户所在城市
  getCityMsg:function(){
    var that=this;
    wx.getLocation({
      success: function(res) {
        var longitude=res.longitude;
        var latitude=res.latitude;
        that.getCity(longitude,latitude);
      },
    })
  },
  //经纬度转城市
  getCity: function (longitude, latitude){
    var that=this;
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' +latitude+ ',' + longitude+'&key=E5FBZ-5U3C6-ZFNSS-EY4K4-GTRA3-KWBSA&get_poi=1',
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        console.log(res)
        var city = res.data.result.address_component.city;
        that.setData({city: city });
      }
      })
    },
    getMaxWidthAndDraw:function(){
      var that=this;
      //获取图片的宽高
      wx.createSelectorQuery().select('.container').boundingClientRect(function (rect) {
        var _allWidth = rect.width;
        var _allHeight = rect.height;
        console.log(rect)
        that.canvasThings(_allWidth, _allHeight);
      }).exec()
    },
  canvasThings:function(w,h){
    // 使用 wx.createContext 获取绘图上下文 context
    var context = wx.createCanvasContext('firstCanvas')

    var mapping=[
      "2.064490%,47.034647%",
      "2.064490%,97.899258%",
      "97.856822%,97.899258%",
      "97.856822%,72.567741%",
      "56.567024%,72.567741%",
      "56.567024%,75.188243%",
      "53.986411%,75.188243%",
      "53.986411%,71.895817%",
      "54.089636%,71.895817%",
      "54.089636%,71.828625%",
      "97.856822%,71.828625%",
      "97.856822%,47.034647%",
      "73.908739%,47.034647%",
      "73.908739%,55.097729%",
      "54.089636%,55.097729%",
      "54.089636%,47.034647%",
      "2.064490%,47.034647%",
      "2.064490%,6.047312%",
      "2.064490%,47.639378%",
      "9.393429%,47.639378%",
      "9.393429%,39.441911%",
      "16.862300%,39.441911%",
      "16.862300%,42.946708%",
      "35.096329%,42.946708%",
      "35.096329%,46.362723%",
      "54.089636%,46.362723%",
      "54.089636%,36.821409%",
      "73.908739%,36.821409%",
      "73.908739%,39.028213%",
      "56.609151%,39.028213%",
      "56.609151%,45.768025%",
      "73.908739%,45.768025%",
      "73.908739%,46.394984%",
      "56.609151%,46.394984%",
      "56.609151%,50.313480%",
      "71.544331%,50.313480%",
      "71.544331%,49.722341%",
      "97.856822%,49.722341%",
      "97.856822%,6.047312%",
      "16.862300%,6.047312%",
      "16.862300%,16.932473%",
      "9.393429%,16.932473%",
      "9.393429%,6.047312%",
      "2.064490%,6.047312%"
    ];
    context.setStrokeStyle("#00ff00")
    context.setLineWidth(1)

    for(var i=0;i<mapping.length;i++){
      var x=parseFloat(mapping[i].split(",")[0])/100*w;
      var y = parseFloat(mapping[i].split(",")[1])/100*h;
        console.log(x)
        console.log(y)
        if (i == 0) {
          context.moveTo(x, y)
        } else {
          context.lineTo(x, y)
        }
    }
    
    context.stroke()
    
    context.draw()
  },
  doCanvasTap:function(e){
    var _p = this.getEventPosition(e);
    console.log(_p)
    this.reDraw(_p)
  },
  //获取点击的坐标点
  getEventPosition(e){
    var x = e.detail.x;
    var y = e.detail.y;
    return { x: x, y: y };
  },
  //重绘
  reDraw: function (_p){
    var whichObject=[];
    this.reGetMaxWidthAndDraw(_p);
    console.log(111)
  },
  reGetMaxWidthAndDraw: function (_p) {
    var that = this;
    var _p=_p;
    //获取图片的宽高
    wx.createSelectorQuery().select('.container').boundingClientRect(function (rect) {
      var _allWidth = rect.width;
      var _allHeight = rect.height;
      that.recanvasThings(_p,_allWidth, _allHeight);
    }).exec()
  },
  recanvasThings: function (_p,w, h) {
    // 使用 wx.createContext 获取绘图上下文 context
    var context = wx.createCanvasContext('firstCanvas')

    var mapping = [
      "2.064490%,47.034647%",
      "2.064490%,97.899258%",
      "97.856822%,97.899258%",
      "97.856822%,72.567741%",
      "56.567024%,72.567741%",
      "56.567024%,75.188243%",
      "53.986411%,75.188243%",
      "53.986411%,71.895817%",
      "54.089636%,71.895817%",
      "54.089636%,71.828625%",
      "97.856822%,71.828625%",
      "97.856822%,47.034647%",
      "73.908739%,47.034647%",
      "73.908739%,55.097729%",
      "54.089636%,55.097729%",
      "54.089636%,47.034647%",
      "2.064490%,47.034647%",
      "2.064490%,6.047312%",
      "2.064490%,47.639378%",
      "9.393429%,47.639378%",
      "9.393429%,39.441911%",
      "16.862300%,39.441911%",
      "16.862300%,42.946708%",
      "35.096329%,42.946708%",
      "35.096329%,46.362723%",
      "54.089636%,46.362723%",
      "54.089636%,36.821409%",
      "73.908739%,36.821409%",
      "73.908739%,39.028213%",
      "56.609151%,39.028213%",
      "56.609151%,45.768025%",
      "73.908739%,45.768025%",
      "73.908739%,46.394984%",
      "56.609151%,46.394984%",
      "56.609151%,50.313480%",
      "71.544331%,50.313480%",
      "71.544331%,49.722341%",
      "97.856822%,49.722341%",
      "97.856822%,6.047312%",
      "16.862300%,6.047312%",
      "16.862300%,16.932473%",
      "9.393429%,16.932473%",
      "9.393429%,6.047312%",
      "2.064490%,6.047312%"
    ];
    context.setStrokeStyle("#00ff00")
    context.setLineWidth(1)
    console.log(context)
    if (_p && context.isPointInPath(_p.x, _p.y)){
      context.setStrokeStyle("#ff0000")
      context.setLineWidth(2)
    }

    for (var i = 0; i < mapping.length; i++) {
      var x = parseFloat(mapping[i].split(",")[0]) / 100 * w;
      var y = parseFloat(mapping[i].split(",")[1]) / 100 * h;
      console.log(x)
      console.log(y)
      if (i == 0) {
        context.moveTo(x, y)
      } else {
        context.lineTo(x, y)
      }
    }

    context.stroke()

    context.draw()
  }
})
