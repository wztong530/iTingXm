// pages/live_xm/live_xm.js
import {
  config,
  Url
} from '../../utils/config.js'
import {
  Request
} from '../../utils/request.js'
var api = new Request()
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: 'i直播',
    isBack: true,
    chatroomList:[]
  },


  //直播间列表
  loadChatroomList(){
    //i直播-直播间列表
    api.request({
      url: Url.chatroomList,
      data:{anchorUuid:app.globalData.userInfo.uuid},
      success: res => {
        this.setData({
          chatroomList: res.data.page.records
        })
      }
    })
  },

  //页面跳转
  enterPage(e) {
    let { id,title,url } = e.currentTarget.dataset
    wx.navigateTo({
      url:url+'?id='+id+'&title='+title
    })
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
    this.loadChatroomList()
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