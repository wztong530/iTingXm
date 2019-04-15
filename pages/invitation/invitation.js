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
    title:"邀请您加入古龙嘀膳",
    user:null,
    userInfo:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var user = JSON.parse(options.user)
    this.setData({
      user
    })
    api.loadRequest({
      app
    }).then(({ userInfo }) => {
      this.setData({
        userInfo
      })
    })
  },
  
  bd(){
      console.log(app.globalData.userId)
      console.log(this.data.user.id)
      api.request({
        url: Url.tashare,
        data:{
          uid:app.globalData.userId,
          pid:this.data.user.id
        },
        success:res2=>{
          console.log(res2)
          wx.reLaunch({
            url: '../index/index',
          })
        }
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

  },

  //获取用户信息
  getUserInfo(e) {
    api.getUserInfo({
      app,
      success: (res) => {
        this.setData({
          userInfo: res.userInfo
        })
      }
    })
  }
})