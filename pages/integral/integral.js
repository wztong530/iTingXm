// pages/integral/integral.js
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
    title: '我的积分',
    isBack: true,
    avatarUrl:"",
    myIntegral:0,//总积分
    todayScore:0,//今日积分
    integralList:[]

  },
  
  //加载我的积分列表
  loadMyIntegralList(){
    api.myIntegralList({
      data:{userId:app.globalData.userId},
      success:res=>{
        console.log('我的积分',res)
        this.setData({
          myIntegral:res.data.myIntegral,
          integralList: res.data.integralList
        })
        let todayScore = this.data.integralList.reduce((prev,item)=>{
          return prev + item.addNum
        },0)
        this.setData({
          todayScore
        })
      }
    })
  },

  //去看看跳转/打卡
  enterPage(e){
    let {id,url}=e.currentTarget.dataset
    if(id==20){
      api.addIntegral({
        data:{
          userId:app.globalData.userInfo.id,
          ruleId:20
        },
        success:res=>{
          if(res.data.code==0){
            wx.showToast({
              title: '打卡成功 +1',
              success: res => {
                this.loadMyIntegralList()
              }
            })
          }
        }
      })
    } else if (url == '/pages/index/index' || url =='/pages/discover/discover'){
      wx.switchTab({
        url
      })
    }else{
      wx.navigateTo({
        url
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      avatarUrl: app.globalData.userInfo.avatarImageUrl
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
    this.loadMyIntegralList()
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