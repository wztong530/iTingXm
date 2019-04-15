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
    title:'订单详情',
    data:null,//订单数据
    isCover:false
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // if(options.data){
    //   let data = JSON.parse(options.data)
    //   console.log(data)
    //   this.setData({
    //     data
    //   })
    // } else {
      this.loaddata(options.orderNo,options.orderType)
    // }
  },
  loaddata(orderNo,orderType){
    let postdata = {
      orderNo,
      orderType
    }
    api.request({
      url:Url.orderdetail,
      data:postdata,
      success:res => {
        var data = res.data.data,num = 0
        console.log(res)
        data.orderDetailList.forEach((item)=>{
          num += Number(item.packingFee)
        })
        this.setData({
          data:res.data.data,
          packingFee:num
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  callHotline() {
    wx.makePhoneCall({
      phoneNumber: '0592-7391999' //仅为示例，并非真实的电话号码
    })
  }
})