// pages/diantai/diantai.js
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
    title:'i听电台',
    isBack:true,
    interval:3000,
    duration:1000,
    radioList:[],
    recommendList:[],
    offset:-1, //从0开始
    size: 9,
    totalPage:0,
    isNoMore:false
  },

  //分页获取列表信息
  loadRadioList() {
    this.setData({
      offset: this.data.offset + 1
    })
    wx.showLoading()
    api.getRadioList({
      data: {// i电台(mobileUserId为空) 、主播电台(mobileUserId不为空)
      //loginUserId->返回oneselfRadio 是否属于主播自己的电台(1 是 0 否)
        offset: this.data.offset,
        size: this.data.size,
        loginUserId: app.globalData.userId
      },
      success: res => {
        this.setData({
          recommendList: res.data.recommendList,
          radioList: this.data.radioList.concat(res.data.radioList),
          totalPage: res.data.totalPage
        })
        wx.hideLoading()
        if (this.data.offset == this.data.totalPage - 1) {
          this.setData({
            isNoMore: true
          })
        }
      }
    })
  },

  //页面跳转
  enterPage(e) {
    let { id, url, programdetail} = e.currentTarget.dataset
    app.globalData.programdetail = programdetail
    wx.navigateTo({
      url: url + '?id=' + id
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadRadioList()
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
      this.loadRadioList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})