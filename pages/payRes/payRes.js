import {
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
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let type = options.type
    if(type == 1 ){
      this.orderNo = options.orderNo
      this.orderType = options.orderType
    }
    this.setData({
      type
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
  back(){
    if(this.data.type == 3){
      var data = app.globalData.qyInfo
      wx.navigateTo({
        url: '../channel/channel?type=3&data='+ JSON.stringify(data),
      })
      return
    }
    wx.reLaunch({
      url: "../index/index"
    })
  },
  enterDetail(){
      // wx.navigateTo({
      //   url: '../orderDetail/orderDetail?orderNo='+this.orderNo+'&orderType='+this.orderType,
      // })   
      if(this.data.type == 3){
        var data = app.globalData.qyInfo
        if (data.role == 1) {
          wx.navigateTo({
            url: '../branchesOrder/branchesOrder?type=1&data=' + JSON.stringify(data),
          })
        } else {
          wx.navigateTo({
            url: '../qyOrder/qyOrder',
          })
        }
      } else {
        wx.reLaunch({
          url: '../order/order',
        })
      }
  }
})


