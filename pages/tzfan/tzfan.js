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

  /**
   * 页面的初始数据
   */
  data: {
    title: '粉丝列表',
    pages: 1,
    rows: 10,
    nodata: false,
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = JSON.parse(options.data)
    this.setData({
      data
    })
    this.requestData()
  },
  formatTime(time) {
    return time.slice(0, 4) + '年' + time.slice(4, 6) + '月' + time.slice(6, 8) + '日'
  },
  requestData(pages = 1) {
    api.request({
      url: Url.tzfan,
      data: {
        uid: app.globalData.userId,
      },
      success: res => {
        console.log(res)
        var data = res.data
        if(res.data.data.length > 0){
          res.data.data.forEach(item=>{
            item.parentTime = this.formatTime(item.parentTime)
          })
        }
        // this.data.list.push(...data.data)
        this.setData({
          list: res.data.data,
          // dataNum: data.pageBean
        })
        // if (pages == data.pageBean.totalPage - 1) {
        //   this.setData({
        //     nodata: true
        //   })
        // }
      }
    })
  },
  // onReachBottom() {
  //   var data = this.data, pagebean = data.dataNum, page = data.pages
  //   page++
  //   if (page > pagebean.totalPage) return
  //   this.setData({
  //     pages: page
  //   })
  //   this.requestData(page)
  // }
})