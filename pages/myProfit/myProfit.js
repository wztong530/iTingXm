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
    title:'奖励明细',
    list:[],
    hasdata:true,
    data:null,
    time:'本月'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initdata()
    this.loaddata()
  },
  initdata() {
    //目前年份默认只有今年,后续可能会有跨年，需要变动
    var date = new Date(),
      arr = [
        ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      ],
      value = [0],
      arr1 = [],
      year = date.getFullYear(),
      month = date.getMonth() + 1,
      now = date.getDate()
    this.time = year + this.formatnum(month)
    this.now = month + "月"
    value.push(month - 1) //月份初始值下标
    value.push(now - 1) //日期初始值下标
    arr.unshift([year + '年']) //年份初始值
    for (var i = 1; i < this.getDate(year, month) + 1; i++) {
      arr1.push(i + '日')
    } //月份最少是28天，可优化
 //   arr.push(arr1) //每月天数初始值设置
    this.setData({
      timeArr: arr,
      timeValue: value
    })
  },
  getDate(year, month) {
    var d = new Date(year, month, 0);
    return d.getDate();
  },
  formatnum(num) {
    if (num < 10) num = '0' + num
    return num
  },
  timechange(e) {
    var value = e.detail.value,
      time, year = new Date().getFullYear(),
      month = value[1] + 1,
      day = value[2] + 1,
      now = month + '月'
    time = year + this.formatnum(month)
    this.time = time
    this.loaddata()
    if (this.now == now) {
      now = '本月'
    }
    this.setData({
      time: now,
      data: null
    })
  },
  columnchange(e) {
    console.log(e)
    var {
      column,
      value
    } = e.detail
  },
  loaddata(){
    api.request({
      url: Url.tzJllist,
      data: {
        uid: app.globalData.userId,
        time: this.time
      },
      success: res => {
        console.log(res)
        this.setData({
          data:res.data.data
        })
      }
    })
  },
})