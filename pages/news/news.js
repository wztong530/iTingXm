// pages/news/news.js
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
    messageList:[],
    isNoMore:false,
    pageNum:0,//从1开始
    pageSize:8,
    pages: 0, //总页数
    userInfo:'',
    myIntegral:0//积分
  },


  // 跳转页面
  enterPage(e) {
    let {url,otheruuid,othername} = e.currentTarget.dataset
    wx.navigateTo({
      url:url+'?otheruuid='+otheruuid+'&othername='+othername
    })

  },

  //分页获取用户消息列表
  loadMyMessageList() {
    this.setData({
      pageNum: this.data.pageNum + 1
    })
    wx.showLoading()
    api.request({
      url: Url.myMessageList,
      data: {
        userUuid: app.globalData.userInfo.uuid,
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      },
      success: res => {
        let newMessageList=res.data.page.records
        for(let item of newMessageList){
          item.sendTime = item.sendTime.slice(0,-3)
        }
        this.setData({
          pages: res.data.page.pages,
          messageList: this.data.messageList.concat(newMessageList)
        })
        if (this.data.pageNum == this.data.pages) {
          this.setData({
            isNoMore: true
          })
        }
        wx.hideLoading()
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //调试头部适配
    api.toShipei.call(this, app.globalData.deviceInfo)
    this.setData({
      userInfo:app.globalData.userInfo
    })  
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
      messageList: [],
      isNoMore: false,
      pageNum: 0,//从1开始
      pageSize: 8,
      pages: 0 //总页数
    })
    this.loadMyMessageList()
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
    if (this.data.pageNum < this.data.pages) {
      this.loadMyMessageList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})