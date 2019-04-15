//公用的请求函数、获取信息方法等


import {
  config,
  Url
} from 'config.js'

class Request {
  constructor() {
    this.baseUrl = config.url
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
    noconcat=false
  }) {
    var header = {
      "Content-Type": "application/json"
    }
    if (method === 'POST') {
      header = {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
    if(!noconcat){
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
          userId: app.globalData.userId,
          nickName: userInfo.nickName,
          gender: userInfo.gender,
          avatarUrl: userInfo.avatarUrl,
          province: userInfo.province,
          city: userInfo.city,
          country: userInfo.country
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
    app
  }) {
    if (e.detail.encryptedData) {
      var global = app.globalData,
        code
      wx.login({
        success: res => {
          const postData = {
            code: res.code,
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv
          };
          //请求
          this.request({
            data: postData,
            url: Url.getPhone,
            success: (res2) => {
              if (res2.data.status == 1) {
                var phone = res2.data.data.phoneNumber
                app.globalData.userInfo.phone = phone
                success(phone)
                
              }
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
  loadRequest({app}) {
    return new Promise((reslove, reject) => {
      wx.login({
        success: (res) => {
          let postData = {
            code: res.code,
            businessId: config.id
          }
          app.globalData.code = res.code
          this.request({
            url: Url.getUserInfo,
            data: postData,
            method: 'GET',
            success: (res2) => {
              console.log(res2)
              let global = app.globalData,
                user = res2.data.userInfo,userInfo = null
              // 判断是否是新用户
              if (user.wechatName !== '') {
                //  userInfo = {
                  user.nickName= user.wechatName
                  user.avatarUrl= user.headPortrait
                  user.gender= user.sex
                //}
                global.userInfo = user
                userInfo = user
              }
              global.userId = user.id
              reslove({ userInfo})
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
    success = (data) => {}
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
      }
    })
  }

  //
  checkLocation({
    app
  }) {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting["scope.userLocation"]){
          app.globalData.isLocation = false
          app.globalData.location = null
        }
      }
    })
  }
  //获取配送费
  getPsf({data,success}){
    this.request({
      url: Url.getPsf,
      data,
      success:res=>{
        success(res.data.data)
      }
    })
  }
  //更新企业信息
  updateQy({data,app,success}){
    this.request({
      url: Url.qyInfo,
      data,
      success:res=>{
        app.globalData.qyInfo = res.data.data
        success()
      }
    })
  }
}


export {
  Request
}