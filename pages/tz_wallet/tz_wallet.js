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
    title: '',
    data:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = JSON.parse(options.data)
    this.setData({
      data
    })
    console.log(data)
  },
  loaddata() {
    api.request({
      url: Url.czList,
      data: {
        rechargerId: '063fab082a7945549b6ee3ddf8ca16bb',
        pageNum: 0,
        pageSize: 1000
      },
      success: res => {
        console.log(res)
        var data = res.data.data
        this.setData({
          data
        })
      }
    })
  },
  enterpage(e){
    let url = e.currentTarget.dataset.url
    wx.navigateTo({
      url:url + '?data=' + JSON.stringify(this.data.data)
    })
  },
  enterJllist(){
    wx.navigateTo({
      url: '../myProfit/myProfit',
    })
  },
  enterTxlist(e){
    let url = e.currentTarget.dataset.url
    wx.navigateTo({
      url
    })
  }
})