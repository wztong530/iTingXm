// pages/tz_withdrawal/tz_withdrawal.js
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
    title:'零钱提现',
    money:'',
    data:null,
    text:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = JSON.parse(options.data)
    this.setData({
      data,
      user:app.globalData.userInfo
    })
    this.first = true
    api.request({
      url: Url.notice,
      data:{
        type:2
      },
      success: res => {
        console.log(res)
        this.setData({
          text:res.data.data
        })
      }
    })
  },
  onShow(){
    this.setData({
      user: app.globalData.userInfo
    })
  },
  qbtx(){
    this.setData({
      money:this.data.data.account
    })
  },
  changeinput(e){
    var value = e.detail.value,
      key = e.currentTarget.dataset.key
    this.data[key] = value
  },
  enterpage(e){
    let url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url
    })
  },
  tx(e){
    var {url} = e.currentTarget.dataset
    if (app.globalData.userInfo.zhifubao != '') {
      if(this.data.money == ''){
        wx.showToast({
          title: '请输入提现金额',
          icon: 'none'
        })
        return
      }
      if(Number(this.data.money)>Number(this.data.data.account)){
        wx.showToast({
          title: '余额不足',
          icon: 'none'
        })
        return
      }
      if (Number(this.data.money) < 50) {
        wx.showToast({
          title: '提现金额不能小于50',
          icon: 'none'
        })
        return
      }
      if(!this.first)return
      this.first = false
      api.request({
        url: Url.tzWithdrawal,
        data: {
          money: this.data.money,
          uid: app.globalData.userId
        },
        success: res => {
          this.first = true
          console.log(res)
          if(res.data.data == 0){
            wx.showToast({
              title: res.data.msg,
              icon:'none'
            })
            return
          }
          wx.navigateTo({
            url:url+'?type='+res.data.data + '&money='+this.data.money
          })
        }
      })
    } else {
      wx.showToast({
        title: '请先绑定支付宝',
        icon: 'none'
      })
    }
    
  }
  
})