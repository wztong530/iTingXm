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
    title: '今日订单',
    orderlist: [], //订单列表
    timeValue: [],
    timeArr: [],
    time: '今日',
    isCover: false,
    isFirst: true,
    hidCall:false,//隐藏呼叫骑手按钮,
    type:1,//1：网点端进入        2：企业端进入
    rows:10,
    pages:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if(options.type){ //企业端管理员进入
      this.setData({
        hidCall:true,
        type:2,
        info:JSON.parse(options.data)
      })
    }
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
    this.time = year + this.formatnum(month) + this.formatnum(now)
    this.now = month + "月" + now + '日'
    value.push(month - 1) //月份初始值下标
    value.push(now - 1) //日期初始值下标
    arr.unshift([year + '年']) //年份初始值
    for (var i = 1; i < this.getDate(year, month) + 1; i++) {
      arr1.push(i + '日')
    } //月份最少是28天，可优化
    arr.push(arr1) //每月天数初始值设置
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
      now = month + '月' + day + '日'
    time = year + this.formatnum(month) + this.formatnum(day)
    this.time = time
    this.loaddata(time)
    if (this.now == now) {
      now = '今日'
    }
    this.setData({
      time: now,
      orderlist:[]
    })
  },
  columnchange(e) {
    console.log(e)
    var {
      column,
      value
    } = e.detail
    if (column != 1) return
    var data = this.data.timeArr,
      year = new Date().getFullYear(),
      date = data[2],
      total = this.getDate(year, value + 1),
      len = date.length,
      arr1 = []
    this.setData({
      ['timeArr[' + e.detail.column + ']']: e.detail.value
    })
    if (total != len) {
      for (var i = 1; i < total + 1; i++) {
        arr1.push(i + '日')
      }
      if (len > total) {
        this.setData({
          'timeValue[2]': total - 1
        })
      }
      this.setData({
        'timeArr[2]': arr1
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  //初始数据
  loaddata(time = null) {
    if(time){
      this.loadlist({time})
    } else {
      this.loadlist({time:this.time})
      time = this.time
    }
    //订单计数
    var postdata,url
    //类型判断
    if(this.data.type == 1){
      postdata = {
        branchesId: app.globalData.curBranchesInfo.id,
        time
      }
      url = Url.branchesCount
    } else {
      postdata = {
        enterpriseId: this.data.info.id,
        time
      }
      url = Url.qyOrderNum
    }
    
    api.request({
      url,
      data: postdata,
      success: res => {
        console.log(res)
        var data = res.data.data
        this.setData({
          orderCount: data
        })
      }
    })
  },
  loadlist({
    time,
    page = 1
  }) {
    var postdata,url
    //类型判断
    if (this.data.type == 1) {
      postdata = {
        branchesId: app.globalData.curBranchesInfo.id,
        time
      }
      url = Url.branchesOrder
    } else {
      postdata = {
        enterpriseId: this.data.info.id,
        bookTime:time,
        pages:page,
        rows:this.data.rows
      }
      url = Url.qyOrder
    }
    wx.showLoading()
    api.request({
      url,
      data: postdata,
      success: res => {
        console.log(res)
        var data = res.data.data
        if (this.data.type != 1){
          this.setData({
            dataNum:res.data.pageBean
          })
          data = data.list
        }
        this.data.orderlist.push(...data)
        this.setData({
          orderlist: this.data.orderlist
        })
        wx.hideLoading()
      }
    })
  },
  /**
   * 用户交互事件
   */

  //跳转页面
  enterpage(e) {
    var {
      index
    } = e.currentTarget.dataset,
      data = this.data.orderlist[index]

    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderType=' + data.orderType + '&orderNo=' + data.orderNo
    })
  },
  preventNull() {},
  //打印小票
  print(e) {
    var {
      type
    } = e.currentTarget.dataset
    this.type = type
    this.setData({
      isCover: true,
      txt: type == 2 ? '您是否确认打印？' : '您是否确定呼叫骑手？'
    })
  },
  cancel() {
    this.setData({
      isCover: false
    })
  },
  confrim() {
    if (this.type == 2) {
      var data
      if(this.data.type == 2){
        data = {
          enterpriseId: this.data.info.id,
          bookTime:this.time
        }
      } else {
        data = {
          mallBranchesId: app.globalData.curBranchesInfo.id,
          bookTime: this.time
        }
      }
      
      api.request({
        url: Url.print,
        data,
        success: res => {
          console.log(res)
          this.cancel()
        }
      })
    } else {
      if (this.data.isFirst) {
        this.data.isFirst = false
        api.request({
          url: Url.peis,
          data: {
            branchesId: app.globalData.curBranchesInfo.id
          },
          success: res => {
            console.log(res)
            this.cancel()
          }
        })
      } else {
        wx.showToast({
          title: '一天只能呼叫一次哦',
          icon: 'none'
        })
        return
      }
    }
  },
  onReachBottom() {
    if(this.data.type != 2)return
    var data = this.data, pagebean = data.dataNum, page = data.pages
    page++
    if (page > pagebean.totalPage) return
    this.setData({
      pages: page
    })
    this.loadlist({page})
  }
})