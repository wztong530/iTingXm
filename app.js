 import { Request } from './utils/request.js';
 var api = new Request()

import { config } from 'utils/config.js';

//app.js
App({
  onLaunch: function (options) {
    wx.hideTabBar()
    wx.getSystemInfo({
      success: res => {
        if (res.errMsg === 'getSystemInfo:ok') {
          this.globalData.deviceInfo = res
        }
        console.log('设备信息:', res)
      }
    })
    this.globalData.version = config.version
    this.globalData.appName = config.appName
    this.globalData.businessId = config.id
    
    wx.getSystemInfo({
      success: res => {
        if (res.errMsg === 'getSystemInfo:ok') {
          let system = res.system
          let systemModel = system.split(' ')[0]
          let systemVersion = system.split(' ')[1]
          if (systemModel == 'iOS' && systemVersion.split('.')[0] < 10) {
            wx.showModal({
              title: '提示',
              content: '您的手机系统版本过低，可能会导致部分功能不能使用，请更新手机系统！',
              showCancel: false,
              confirmText: '知道了',
              confirmColor: '#C4A66A'
            })
          }
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    userId:'',
    isLocation:false,//用户是否授权地理位置
    location:null,//用户的地理位置信息（经纬度）
    isBranches:false,//用户是否可以登录网点端
    branchesInfo:null,//网点端信息
    timeList:null,//首页的时间列表信息
  }
})