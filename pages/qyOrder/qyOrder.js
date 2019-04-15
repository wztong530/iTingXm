import {
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
    title: '订单',
    orderlist: [], //订单列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var data = JSON.parse(options.data)
    // this.role = data.role
    this.firstrequest = true
    this.loaddata()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  onShow() {
    if (this.firstrequest) return
    this.loaddata()
  },
  //初始数据
  loaddata() {
    wx.showLoading()
    var url,postdata
      url = Url.qyOrder
      postdata = {
        mobileUserId: app.globalData.userId
      }
    api.request({
      data: postdata,
      url,
      success: res => {
        console.log(res)
        wx.hideLoading()
        this.firstrequest = false
        var data = res.data.data.list
        this.setData({
          orderlist: data
        })
      },
      fail: err => {
        wx.hideLoading()
      }
    })
  },
  /**
   * 用户交互事件
   */

  // 分享按钮
  sharepopup(e) {
    this.index = e.currentTarget.dataset.index
    this.setData({
      isShare: true,
      isShow: true
    })
  },
  hideShare() {
    this.setData({
      isShow: false
    })
    setTimeout(() => {
      this.setData({
        isShare: false
      })
    }, 500)
  },
  //跳转页面
  enterpage(e) {
    var {
      index
    } = e.currentTarget.dataset,
      data = this.data.orderlist[index]

    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderType=' + data.orderType + '&orderNo=' + data.orderNo,
    })
  },
  //联系骑手
  call(e) {
    var { index } = e.currentTarget.dataset, data = this.data.orderlist[index].mallOrder.transporterPhone
    wx.makePhoneCall({
      phoneNumber: data 
    })
  },
  //分享相关
  onShareAppMessage(e) {
    var str, title, imageUrl, data = this.data.orderlist[this.index], gooddata = data.mallGoodsList[0]
    gooddata.bookTime = data.mallOrder.bookTime
    title = ''
    str = '/pages/assembleDetail/assembleDetail?isShare=true&orderNo=' + JSON.stringify(data.orderNo) + '&data=' + JSON.stringify(gooddata)
    imageUrl = ''
    console.log(str)
    return {
      title,
      path: str,
      imageUrl,
      success(res) {

      },
      fail(res) {

      }
    }
  },
})