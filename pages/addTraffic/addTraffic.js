// pages/addTraffic/addTraffic.js
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
    title:'新增路况',
    isBack:true,
    position:null,
    description:'',
    longitude:'',
    latitude:''
  },

  //选择地址
  chooseAddr(){
    wx.chooseLocation({
      success: res=>{
        let {
          name:position,
          longitude, 
          latitude
        }=res
        console.log(res)
        this.setData({
          position, longitude, latitude
        })
      }
    })
  },

  //获取输入内容
  getInput(e) {
    this.setData({
      description: e.detail.value
    })
  },

  //提交路况
  addTraffic(){
    var reg = /^\s*$/g;
    if (reg.test(this.data.description) || this.data.description == '') {
      wx.showToast({
        title: '不能发送空内容！',
        icon: 'none'
      })
      return;
    }
    let { position, description, longitude, latitude}=this.data
    api.request({
      url: Url.addTraffic,
      data:{
        userUuid:app.globalData.userInfo.uuid,
        trafficTime:new Date().toLocaleString(),
        position, description, longitude, latitude
      },
      success:res=>{
        wx.navigateBack({
          delta:1
        })
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