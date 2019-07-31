// pages/myAttention/myAttention.js
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
    title:'关注主播',
    isBack:true,
    myFocusList:[],
    offset: -1, //当前页数,从0开始
    size: 8, //每页显示条数
    totalPage: 0, //总页数
    isNoMore: false
  },

  //页面跳转
  enterPage(e){
    wx.navigateTo({
      url: '../anchorHome/anchorHome?id='+e.currentTarget.dataset.id
    })
  },

  //分页获取关注主播列表
  loadmyFocus() {
    this.setData({
      offset: this.data.offset + 1
    })
    wx.showLoading()
    api.request({
      url: Url.myFocus,
      data: {
        offset: this.data.offset,
        size: this.data.size,
        mobileUserId: app.globalData.userId
      },
      success: res => {
        this.setData({
          myFocusList: this.data.myFocusList.concat(res.data.myFocus),
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

  //关注/取关 (参与人id：mobileUserId、主播id：anchorId、delFlag(0关注、1取关))
  handleFocus(e) {
    console.log(e)
    let { id, focusstatus, index, focusid } = e.currentTarget.dataset;
    api.focusOrNot({
      data: {
        mobileUserId: app.globalData.userId,
        anchorId: id,
        delFlag: focusstatus,
        id: focusid == null ? '' : focusid
      },
      success: res => {
        if (res.data.code == 0) {
          let newFocusStatus = focusstatus == '1' ? '0' : '1';
          let newMyFocusList = this.data.myFocusList;
          newMyFocusList[index].focusStatus = newFocusStatus;
          this.setData({
            myFocusList: newMyFocusList
          })
          wx.showToast({
            title: this.data.myFocusList[index].focusStatus == '1' ? '关注成功' : '已取消关注',
            duration: 1500,
            mask: true,
            icon: 'none'
          })
        }
      }
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
    this.loadmyFocus()
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
      this.loadmyFocus()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})