import {
  config,
  Url
} from '../../utils/config.js'
import {
  Request
} from '../../utils/request.js'
var api = new Request()
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null, // 用户信息
    version: config.version, // 页面底部版本号
    title: '主播端',
    isBack: true
  },

  //页面跳转
  enterPage(e) {
    let {
      type, url
    } = e.currentTarget.dataset;
    if (type == 0) {
      wx.switchTab({
        url
      })
    } else if (url =='/pages/anchorHome/anchorHome') {
      wx.navigateTo({
        url:url+'?id='+this.data.userInfo.id
      })
    } else {
      wx.navigateTo({
        url
      })
    }

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
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      userInfo: app.globalData.userInfo
    })
    if (!this.data.user) {
      api.loadRequest({
        app
      }).then(({ userInfo }) => {
        this.setData({
          userInfo
        })
        app.globalData.userInfo = userInfo
      })
    }
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