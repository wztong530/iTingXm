//公用的请求函数、获取信息方法等

import {
  config,
  Url
} from 'config.js'

class Request {
  constructor() {
    this.baseUrl = config.url
  }
  //设备头部适配
  toShipei(deviceInfo){
    var system = deviceInfo
    this.width = 568
    console.log('system',system)
    if (system.screenHeight > 2 * system.screenWidth || system.screenHeight - system.windowHeight - system.statusBarHeight - 46 > 70) {
      this.setData({
        shipei: true
      })
    }
  }
  // 普通的请求函数
  request({
    url,
    success,
    data = {},
    method = 'POST',
    fail = (err) => {
      wx.hideLoading()
      console.log(err)
    },
    noconcat = false
    }) {
    var header = {
      "Content-Type": "application/json"
    }
    if (method === 'POST') {
      header = {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
    if (!noconcat) {
      url = this.baseUrl + url
    }
    wx.request({
      url,
      method,
      header,
      data,
      success,
      fail
    })
  }
  //获取用户信息同时更新后台用户信息以及全局用户信息
  getUserInfo({
    app,
    success
    }) {
    wx.getUserInfo({
      lang: 'zh_CN',
      success: (res) => {
        console.log(res)
        let userInfo = res.userInfo
        app.globalData.userInfo = userInfo
        let postData = {
          id: app.globalData.userId,
          nickName: userInfo.nickName,
          sex: userInfo.gender,
          avatarImageUrl: userInfo.avatarUrl,
          area: userInfo.country + userInfo.province + userInfo.city
          // city: userInfo.city,
          // country: userInfo.country
        }
        // 请求
        this.request({
          url: Url.updateUserInfo,
          data: postData,
          success: (res2) => {
            console.log(res2)
            success(res)
          }
        })
      }
    })
  }
  //获取手机号
  getPhone({
    e,
    success,
    app,
    fail = () => { }
    }) {
    if (e.detail.encryptedData) {
      var global = app.globalData,
        code
      wx.login({
        success: res => {
          const postData = {
            code: res.code,
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv,
            mobileUserId: global.userId
          };
          //请求
          this.request({
            data: postData,
            url: Url.getPhone,
            success: (res2) => {
              if (res2.data.code == 0) {
                var phone = res2.data.phoneNumber
                app.globalData.userInfo.phone = phone
                success(phone)
              }
            },
            fail: err => {
              fail()
            }
          })
        }
      })
    }
  }
  //检查登录状态    暂时没用
  checkSession(success, fail) {
    return new Promise((reslove, reject) => {
      wx.checkSession({
        success: () => {
          success({
            reslove
          })
        },
        fail: () => {
          wx.login({
            success: (res2) => {
              fail({
                code: res2.code,
                reslove
              })
            }
          })
        }
      })
    })
  }
  //app初始请求函数  (请求用户信息)
  loadRequest({ app }) {
    return new Promise((reslove, reject) => {
      wx.login({
        success: (res) => {
          let postData = {
            code: res.code
            // businessId: config.id
          }
          app.globalData.code = res.code
          this.request({
            url: Url.getUserInfo,
            data: postData,
            method: 'GET',
            success: (res2) => {
              console.log(res2)
              let global = app.globalData,
                user = res2.data.user, userInfo = null
              // 判断是否是新用户
              if (user.nickName) {
                user.avatarUrl = user.headPortrait
                user.gender = user.sex
                global.userInfo = user
                userInfo = user
              }
              global.userId = user.id
              reslove({ userInfo })
            },
            fail: (err) => {

            }
          })
        }
      })
    })
  }
  //获取用户经纬度信息
  getlocation({
    app,
    success = (data) => { },
    fail = () => { }
    }) {
    wx.getLocation({
      success: res => {
        const data = {
          lat: res.latitude,
          lon: res.longitude
        }
        app.globalData.isLocation = true
        app.globalData.location = data
        success(data)
      },
      fail: err => {
        fail(err)
      }
    })
  }
  //
  checkLocation({
    app
    }) {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting["scope.userLocation"]) {
          app.globalData.isLocation = false
          app.globalData.location = null
        }
      }
    })
  }
  
  //获取轮播广告(position-1首页 -2资讯)
  getAdvertList({
    data,
    success
    }){
    this.request({
      url: Url.advertList,
      data,
      success
    })
  }
  //获取电台列表 
  getRadioList({
    data,// i电台(mobileUserId为空) 、主播电台(mobileUserId不为空)
         // offset第几页 size每页显示个数
    success
    }){
    this.request({
      url: Url.radioList,
      data,
      success
    })

  }

  //获取资讯类别
  getNewsCategoryList({ success }) {
    this.request({
      url: Url.newsCategoryList,
      method: 'GET',
      success
    })
  }
  //获取资讯列表
  getNewsList({
    data,//{ offset: 0, size: 1, newsCategoryId: id }
    success
    }) {
    //资讯列表 offset第几页 size每页显示个数 newsCategoryId分类id
    this.request({
      url: Url.newsList,
      data,
      success
    })
  }
  //关注/取关 (参与人id：mobileUserId、主播id：anchorId、delFlag(0关注、1取关))
  focusOrNot({
    data,
    success
    }){
    this.request({
      url: Url.focus,
      data,
      success
    })
  }
  //积分列表
  myIntegralList({
    data,
    success
    }){
    this.request({
      url: Url.myIntegralList,
      data,
      success
    })
  }
  //增加积分 userId, ruleId
  addIntegral({
    data,
    success
    }){
    this.request({
      url: Url.addIntegral,
      data,
      success
    })
  }
  //敏感词验证
  wxMsgCheck({ 
    data,
    success
    }){
    this.request({
      url: Url.wxMsgCheck,
      data,
      success
    })
  }

}


export {
  Request
}