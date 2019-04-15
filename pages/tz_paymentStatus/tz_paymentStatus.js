// pages/tz_paymentStatus/tz_paymentStatus.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:"订单提示",
    type:-1,//    1:提现成功   0:提现失败
    isCover:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var type = options.type,money = options.money
    this.setData({
      type,
      money
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
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
  back(){
    wx.navigateTo({
      url: '../channel/channel?type=4'
    })
  },
  go(){
    wx.navigateTo({
      url: '../withdrawalDetails/withdrawalDetails'
    })
  }
})