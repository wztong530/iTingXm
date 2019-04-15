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
  //
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
        this.setData({
          user: res.userInfo
        })
      }
    })
  },
  onShow() {
    const user = app.globalData.userInfo
    this.setData({
      user
    })
  },
  //跳转页面

  enterPage(e) {
    //我的钱包type为1     因功能未开发暂写为5
    let {
      type
    } = e.currentTarget.dataset, url; //type=1普通跳转    2网点端   3 企业端   4团长端
    if (type == 1) {
      url = e.currentTarget.dataset.url
      wx.navigateTo({
        url,
      });
    } else {
      // wx.showToast({
      //   title: '业务扩展中。。。',
      //   icon: 'none'
      // })
      // return
      switch (type) {
        case '2':
          if (!app.globalData.isBranches) {
            wx.showToast({
              title: '您还不是网点管理员哦',
              icon: 'none'
            })
            return
          }
          wx.navigateTo({
            url: '../channel/channel?type=' + type
          })
          break
        case '3':
          api.request({
            data: {
              phone: this.data.user.phone
            },
            url: Url.qyInfo,
            success: (res) => {
              console.log(res)
              var data = res.data.data
              app.globalData.qyInfo = data
              console.log(data.role)
              if (data.role == 1 || data.role == 2) {
                wx.navigateTo({
                  url: '../channel/channel?type=' + type + '&data=' + JSON.stringify(data)
                })
                return
              }
              wx.showToast({
                title: '您的企业并未入驻',
                icon: 'none'
              })
            }
          })
          break
        case'4':
          console.log(app.globalData.userInfo.isGroup)
          if (app.globalData.userInfo.isGroup != 1) {
            wx.showToast({
              title: '您还不是团长哦',
              icon: 'none'
            })
            return
          }
          wx.navigateTo({
            url: '../channel/channel?type=' + type,
          })
        break
        case '5':
          wx.showToast({
            title: '功能即将开放。。。',
            icon: 'none'
          })
          return
          break
      }
    }
  },
  callHotline() {
    wx.makePhoneCall({
      phoneNumber: '0592-7391999' //仅为示例，并非真实的电话号码
    })
  }
});