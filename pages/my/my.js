import {
  config,
  Url
} from '../../utils/config.js'
import {
  Request
} from '../../utils/request.js'
var api = new Request()
var app = getApp();

Page({
  data: {
    user: null, // 用户信息
    version: config.version, // 页面底部版本号
    title: '我的',
    isBack: false,
    isCover:false
  },
  onLoad() {
    
  },
  onShow() {
    this.setData({
      user: app.globalData.userInfo
    })
    if(!this.data.user){
      api.loadRequest({
        app
      }).then(({ userInfo }) => {
        this.setData({
          user: userInfo
        })
        app.globalData.userInfo=userInfo
      })
    }
  },
  
  //在线客服
  showpop() {
    this.setData({
      isCover: true,
      isShow: true
    })
  },
  hidepop() {
    this.setData({
      isShow: false
    })
    setTimeout(() => {
      this.setData({
        isCover: false
      })
    }, 500)
  },
  getPhoneNumber(e) {
    api.getPhone({
      e,
      app,
      success: (phone) => {
        this.setData({
          'user.phone': phone
        })
        console.log(this.data.user.phone)
      }
    })
  },
  /**
   * 获取用户信息回调函数
   */
  getUserInfo(e) {
    api.getUserInfo({
      app,
      success: (res) => {
        console.log(res)
        this.setData({
          user: res.userInfo
        })
      }
    })
  },
 
  //跳转页面
  enterPage(e) {
    let url = e.currentTarget.dataset.url; 
    wx.navigateTo({
      url
    })   
  },
  //电话客服
  callHotline() {
    wx.showToast({
      title: '功能暂未开放!',
      icon:'none'
    })
    //粉丝、访问量、关注公众号弹窗图、客服电话、路况互动图
    api.request({
      url: Url.parameter,
      method: 'GET',
      success: res => {
        wx.makePhoneCall({
          phoneNumber: res.data.parameter.customerHotline
        })    
      }
    })
  }
});