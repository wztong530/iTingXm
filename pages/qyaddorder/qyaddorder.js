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
    title: '确认下单',
    isCover: false, //遮盖层
    totalPrice: 0,    //商品总价格，不包括餐盒费配送费
    payType: 1, //支付方式  0 微信支付     1 余额支付
    orderType: 0, //0:单点   1:拼团
    defaultAdd: null, //默认地址 
    psf: '0.00',
    branchesName: '请先选择地址'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = JSON.parse(options.data), time = options.time
    this.firstRequest = true
    this.loadData(data, time)
  },


  //初始页面数据
  loadData(data, time) {
    console.log(data)
    // postdata = {
    //   shop: data.cartlist,
    //   type: data.type,
    //   single: data.single,
    //   buyNum: data.buyNum
    //    data
    // }           data的数据结构
    this.qyInfo = data.data //企业相关信息
    //商品信息列表的处理
    let goodsInfo, meal = data.shop[0],
      totalPrice = data.totalPrice
      // chf = 0
    //餐品列表处理
    data.shop.map((item) => {
      item.totalPrice = data.single[item.mallGoodsInventoryId]
      item.count = data.buyNum[item.mallGoodsInventoryId]
      // chf += Number((item.count * (item.packingFee || 0)).toFixed(2))
    })
    goodsInfo = data.shop
    this.setData({
      goodsInfo,
      totalPrice,
      // chf, //餐盒费
      // money: (Number(totalPrice) + Number(chf)).toFixed(2),
      money: Number(totalPrice).toFixed(2),
      time,
      factmoney: (Number(totalPrice) - data.data.priceLimit).toFixed(2)
    })
    //请求默认地址
    var loc = app.globalData.location,
      postdata = {
        lat: loc.lat,
        lon: loc.lon,
        userId: app.globalData.userId
      }
    if (app.globalData.location) {
      api.request({
        url: Url.defaultaddress,
        data: postdata,
        success: res => {
          console.log(res)
          let data = res.data.data[0] || null,
            totalPrice = Number(this.data.totalPrice), money = Number(this.data.money)
          if (data) {
            this.setData({
              defaultAdd: data,
              defaultAddTxt: data.shippingAddr + data.houseNum
            })
            // if (totalPrice < 30) {
            //   api.getPsf({
            //     data: {
            //       lat: data.lat,
            //       lon: data.lon
            //     },
            //     success: (psf) => {
            //       this.setData({
            //         psf: Number(psf).toFixed(2),
            //         money: (money + Number(psf)).toFixed(2),
            //         factmoney: (money + Number(psf)) - this.qyInfo.priceLimit
            //       })
            //     }
            //   })
            // }
          }
        }
      })
    }
    this.formatBookTime(time)
  },
  formatBookTime(time) {
    this.setData({
      bookTime: time.slice(0, 4) + '-' + time.slice(4, 6) + '-' + time.slice(6, 8)
    })
    return
  },
  // 阻止冒泡
  preventNull() { },
  // 支付弹窗
  showpopup() {
    this.setData({
      isCover: true,
      isShow: true
    })
  },
  hidepopup() {
    this.setData({
      isShow: false
    })
    setTimeout(() => {
      this.setData({
        isCover: false
      })
    }, 500)
  },
  //跳转
  enterPage() {
    var id = 0
    if (this.data.defaultAdd) {
      id = this.data.defaultAdd.id
    }
    if (app.globalData.isLocation) {
      wx.navigateTo({
        url: '../addressList/addressList?type=1&id=' + id
      })
    } else {
      wx.openSetting({
        success: res => {
          if (res.authSetting['scope.userLocation']) {
            wx.navigateTo({
              url: '../addressList/addressList?type=1&id=' + id
            })
            api.getlocation({
              app
            })
          }
        }
      })
    }
  },
  //支付前检查
  check() {
    if (config.debug) {
      return true
    } else {
      if (this.data.defaultAdd) {
        return true
      }
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      })
      return false
    }
  },
  //支付
  enterPay() {
    if (!this.firstRequest) return
    if (this.check()) {
      this.firstRequest = false
      wx.showLoading()
      let global = app.globalData,
        data = this.data,
        arr = [],arr1 = []
      data.goodsInfo.forEach((item, index) => {
          arr.push(item.mallGoodsInventoryId + ',' + item.basicPrice + ',' + item.count)
          arr1.push({
            goodsId:item.id,
            mallGoodsPriceId: item.mallGoodsPriceId,
            goodsNum:item.count,
            goodsPrice:item.totalPrice
            // packingFee:item.packingFee,
            // shippingFee:data.chf
          })
      })

      let goodsInfo = arr.join(';'),
        url, branchesInfo = app.globalData.branchesInfo,
        postData = {
          mobileUserId: global.userId,
          payWay: data.payType,
          goodsInfo,
          businessId: global.businessId,
          takeMealAddr: data.defaultAddTxt,
          // packingFee: data.chf,
          addressId: data.defaultAdd.id,
          bookTime: data.time,
          discountFlag: 0,
          orderDetail: JSON.stringify(arr1),
          totalPrice:data.money,
          orderPrice:data.factmoney <=0?0:data.factmoney,
          priceLimit: this.qyInfo.priceLimit,
          enterpriseId:this.qyInfo.id
        }
      //测试环境下经纬度写死
      if (config.debug) {
        postData.lon = '118.199903'
        postData.lat = '24.498777'
      } else {
        postData.lon = data.defaultAdd.lon,
        postData.lat = data.defaultAdd.lat
      }
      url = Url.qyAdd
      wx.login({
        success: res => {
          postData.code = res.code
          //使用code到后台换取签名等支付所需参数
          api.request({
            url,
            data: postData,
            success: (res2) => {
              console.log(res2)
              wx.hideLoading()
              if (res2.data.data != "") {
                var obj = res2.data.data
                api.updateQy({
                  app,
                  data: {
                    phone: app.globalData.userInfo.phone
                  },
                  success:()=>{
                    if (typeof obj == 'object') {
                      wx.reLaunch({
                        url: '../payRes/payRes?type=3&orderNo=' + obj.orderNo + '&orderType=' + obj.orderType,
                      })
                    } else {
                      //调用微信支付接口
                      obj = JSON.parse(obj)
                      wx.requestPayment({
                        'timeStamp': obj.timeStamp,
                        'nonceStr': obj.nonceStr,
                        'package': obj.package,
                        'signType': 'MD5',
                        'paySign': obj.paySign,
                        'success': (res3) => {
                          setTimeout(() => {
                            wx.reLaunch({
                              url: '../payRes/payRes?type=3&orderNo=' + obj.orderNo + '&orderType=' + obj.orderType,
                            })
                          }, 200)
                        },
                        'fail': res3 => {
                          // wx.navigateTo({
                          //   url: '../payRes/payRes?type=0',
                          // })
                        }
                      })
                    }
                  }
                })
              } else {
                wx.showToast({
                  title: res2.data.msg,
                  icon: 'none',
                  duration: 1500
                })
                this.hidepopup()
              }
              this.firstRequest = true
            }
          })
        }
      })
      // wx.navigateTo({
      //   url: '../payRes/payRes',
      // })
    }
  },
  //支付方式选择
  select(e) {
    let {
      index
    } = e.currentTarget.dataset, payType = this.data.payType
    if (index == payType) return
    this.setData({
      payType: index
    })
  },
})