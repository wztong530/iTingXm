// pages/live_list/live_list.js
import {
  config,
  Url
} from '../../utils/config.js'
import {
  Request
} from '../../utils/request.js'
var api = new Request()
var app = getApp()
var updateTime;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:'',
    isBack:true,
    chatroomProgramList:[], //直播间节目列表
    chatRoomUuid:'',
    pageNum:0, //从1开始
    pageSize:8,
    pages:0, //总页数
    isNoMore:false,
    nowTime:''//当前时间
  },


  //获取节目列表
  getChatroomProgramList(){
    this.setData({
      pageNum: this.data.pageNum + 1
    })
    wx.showLoading()
    api.request({
      url: Url.chatroomProgramList,
      data: {
        chatRoomUuid: this.data.chatRoomUuid,
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      },
      success: res => {
        this.setData({
          pages:res.data.page.pages,
          chatroomProgramList: this.data.chatroomProgramList.concat(res.data.page.records)
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

  //页面跳转
  enterPage(e) {
    let { url, uuid} = e.currentTarget.dataset
    wx.navigateTo({
      url:url+'?uuid='+uuid
    })
  },

  //更新时间
  updateTiming(){
    let now = new Date()
    this.setData({
      nowTime: now.getHours() + ":" + now.getMinutes()
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      chatRoomUuid: options.id,
      title: options.title
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
      chatroomProgramList: [], //直播间节目列表
      pageNum: 0, //从1开始
      pageSize: 8,
      pages: 0, //总页数
      isNoMore: false,
      nowTime: ''//当前时间
    })
    this.getChatroomProgramList()
    this.updateTiming()
    updateTime = setInterval(this.updateTiming,5000)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(updateTime)
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
      this.getChatroomProgramList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})