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
    isNoMore:false,
    userInfo:null,
    myIntegral:0,//积分
    activityList:[],
    offset:-1, //当前页数 从0开始
    size:5, //每页显示条数
    totalPage:0//总页数
  },

  //请求活动列表
  getActivityList() {
    this.setData({
      offset:this.data.offset+1
    })
    wx.showLoading()
    api.request({
      url: Url.activityList,
      data: {
        offset: this.data.offset,
        size: this.data.size,
        mobileUserId: app.globalData.userId
      },
      success: (res) => {
        this.setData({
          activityList: this.data.activityList.concat(res.data.activityList) ,
          totalPage: res.data.totalPage
        })
        if (this.data.offset == this.data.totalPage-1) {
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
    //调试头部适配
    api.toShipei.call(this, app.globalData.deviceInfo)
    this.setData({
      userInfo: app.globalData.userInfo
    })
    // //加载数据
    // this.getActivityList()

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
      offset: -1,
      activityList:[]
    })
    //加载数据
    this.getActivityList()
    api.myIntegralList({
      data: { userId: app.globalData.userId },
      success: res => {
        this.setData({
          myIntegral: res.data.myIntegral
        })
      }
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
    if (this.data.offset < this.data.totalPage-1) {
      this.getActivityList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})