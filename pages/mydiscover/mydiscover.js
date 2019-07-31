// pages/discover/discover.js
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
    title:'我的活动',
    isBack:true,
    myActivityList: [],
    offset: -1, //当前页数,从0开始
    size: 4, //每页显示条数
    totalPage: 0, //总页数
    isNoMore: false
  },

  //分页获取我的活动列表
  loadmyActivity() {
    this.setData({
      offset: this.data.offset + 1
    })
    wx.showLoading()
    api.request({
      url: Url.myActivity,
      data: {
        offset: this.data.offset,
        size: this.data.size,
        mobileUserId: app.globalData.userId
      },
      success: res => {
        this.setData({
          myActivityList: this.data.myActivityList.concat(res.data.myActivity),
          totalPage: res.data.totalPage
        })
        if (this.data.offset == this.data.totalPage - 1) {
          this.setData({
            isNoMore: true
          })
        }
        wx.hideLoading()
      }
    })
  },

  //页面跳转
  enterPage(e) {
    wx.navigateTo({
      url: '../discover_detail/discover_detail?id='+e.currentTarget.dataset.id
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
    this.loadmyActivity()
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
    if (this.data.offset < this.data.totalPage - 1) {
      this.loadmyActivity()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})