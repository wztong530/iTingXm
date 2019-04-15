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
    title: '选择餐品',
    isCover: false, //遮盖层
    buyNum: {},
    currentTab: 0,
    no: 0,
    size: 10,
    phone: null,
    maxnum: 0,
    tablist: [{
        name: '全部',
        type: -1
      },
      {
        name: '套餐',
        type: 0
      },
      {
        name: '特色饭',
        type: 1
      },
      {
        name: '汤',
        type: 2
      },
      {
        name: '凉菜',
        type: 3
      },
      {
        name: '小吃',
        type: 4
      },
      {
        name: '酱',
        type: 5
      },
    ],
    totalPrice: '0.00', //总价格
    totalCount: 0, //总数量
    list: [], //商品列表
    cartlist: [], //购物车列表
    single: {}, //单个商品的总价
    tipHid: -1, //隐藏打折提示
    currentTimeIndex:0,
    nodataImg: '/images/Group-2.svg',
    nodataTxt: '餐品正在为您精心准备中…',
    isWeek:false,
    tips:'满30元免运费',
    ce:-1,//超标金额
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.loadData(options)
    this.requestData()
  },
  /**
   * 页面交互相关
   */
  loadData(options) {
    var time = app.globalData.timeList, data = JSON.parse(options.data)
    this.setData({
      timelist: time,
      time:time[0].day,
      phone: app.globalData.userInfo.phone || null,
      data
    })
    this.priceLimit = Number(data.priceLimit)  //标准金额
    var today = new Date(),
      day = today.getDay(),
      now = today.getHours()
    if (now >= 10 && day != 5) {
      this.setData({
        currentTimeIndex: 1,
        time: time[1].day,
      })
    }
  },
  //阻止冒泡 
  preventNull() {},

  //购物车详情弹窗
  showcart() {
    if (this.data.isCover) {
      this.hidecart()
    } else {
      this.setData({
        isCover: true,
        isShow: true
      })
    }
  },
  hidecart() {
    this.setData({
      isShow: false
    })
    setTimeout(() => {
      this.setData({
        isCover: false
      })
    }, 500)
  },

  //跳转到确认订单页面
  enterPage() {
    let data = this.data,
      postdata = {},
      meal, bool = true
    this.data.cartlist.forEach((item) => {
      if (item.type == 0) bool = false
    })
    let hour = new Date().getHours()
    if (hour >= 10 && this.data.currentTimeIndex == 0) {
      wx.showToast({
        title: '今日已经不能下单了哦',
        icon: 'none'
      })
      return
    }
    if (bool) {
      wx.showToast({
        title: '至少选择一个套餐商品！',
        icon: 'none'
      })
      return
    }
    postdata = {
      // meal: data.setMeal, //套餐商品信息
      shop: data.cartlist, //购物车商品信息
      type: data.type,
      single: data.single,
      buyNum: data.buyNum,
      totalPrice: data.totalPrice,
      data:this.data.data,//企业相关信息
    }
    wx.navigateTo({
      url: '../qyaddorder/qyaddorder?data=' + JSON.stringify(postdata) + '&time=' + this.data.time,
    })
  },
  // 加减按钮
  addReduce(e) {
    let {
      type,
      index,
      target
    } = e.currentTarget.dataset, //TYPE 1:加   0：减    ,target 1:列表点击  2：购物车点击
      cartlist = this.data.cartlist,
      data = target == 1 ? this.data.filterlist[index] : cartlist[index],
      num = Number(this.data.buyNum[data.mallGoodsInventoryId]), //单个配套餐品的数量
      price, //配套餐品价格
      totalPrice = Number(this.data.totalPrice), //总价格
      totalCount = Number(this.data.totalCount), //总数量
      maxnum = this.data.maxnum, //最大购买数量
      single = Number(this.data.single[data.mallGoodsInventoryId]) //单个商品总价
    if (index == 0 && this.data.type == 1 && target == 2) {
      price = Number(data.price) //购物车数据和列表数据的字段不同
    } else {
      price = Number(data.basicPrice)
    }
    //加
    if (type === '1') {
      if (num == 0) {
        cartlist.push(data)
      }
      num++
      single += price
      totalCount++
      totalPrice = (totalPrice + price).toFixed(2)
    } else {
      //减
      if (num <= 0) return
      num--
      single -= price
      if (num <= 0) {
        single = 0
        num = 0
        if (target == 1) {
          cartlist = cartlist.filter((item) => {
            return item.mallGoodsInventoryId != data.mallGoodsInventoryId
          })
        } else {
          cartlist.splice(index, 1)
        }
      }
      totalCount--
      totalPrice = (totalPrice - price).toFixed(2)
    }
    //改变页面数据
    this.setData({
      ['buyNum.' + data.mallGoodsInventoryId]: num,
      ['single.' + data.mallGoodsInventoryId]: single.toFixed(2),
      totalCount,
      totalPrice,
      cartlist,
      ce: (Number(totalPrice) - this.priceLimit).toFixed(2)
    })
  },
  //头部tab选择
  selecttab(e) {
    var {
      index,
      type
    } = e.currentTarget.dataset, arr
    arr = this.data.list.filter((item) => {
      if (type == -1) {
        return true
      } else {
        return item.type == type
      }
    })
    this.setData({
      currentTab: index,
      filterlist: arr
    })
  },
  //初始数据请求
  requestData() {
    let postData = {
      no: this.data.no,
      size: this.data.size,
      time: this.data.time,
      phone:app.globalData.userInfo.phone
    }
    wx.showLoading()
    this.setData({
      filterlist:[]
    })
    api.request({
      url: Url.qyGoods,
      data: postData,
      success: res => {
        console.log(res)
        wx.hideLoading()

        var data = res.data.data.list
        this.setData({
          list: data,
          filterlist: data
        })
        if(data.length == 0){
          var week = new Date(this.data.timelist[this.data.currentTimeIndex].time).getDay()
          this.setData({
            nodataImg: '/images/Group-2.svg',
            nodataTxt: '餐品正在为您精心准备中…',
            isWeek: false
          })
        } else {
          data.forEach((item) => {
            this.setData({
              ['buyNum.' + item.mallGoodsInventoryId]: 0,
              ['single.' + item.mallGoodsInventoryId]: 0
            })
          })
        }
      }
    })
  },

  getPhoneNumber(e) {
    api.getPhone({
      e,
      app,
      success: (phone) => {
        this.setData({
          'phone': phone
        })
        this.enterPage()
      }
    })
  },

  //时间选择
  selectTime(e){
    let index = e.currentTarget.dataset.num
    if (index == this.data.currentTimeIndex) return
    if (index == 0) {
      let hour = new Date().getHours()
      if (hour >= 10) {
        wx.showToast({
          title: '今日已经不能下单了哦',
          icon: 'none'
        })
        return
      }
    }
    let time = this.data.timelist[index]
    this.setData({
      currentTimeIndex: index,
      time: time.day,
      currentTab:0,
      totalCount:0,
      totalPrice:'0.00',
      cartlist:[]
    })
    if (!this.checkWeek(time.time)) {
      this.requestData()
    }
  },
  //检查日期是否为周末
  checkWeek(time = new Date().getTime()) {
    var week = new Date(time).getDay()
    if (week == 6 || week == 0) {
      this.setData({
        nodataImg: '/images/Group-1.svg',
        nodataTxt: '今天休息，好好陪家人!',
        isWeek: true,
        list: []
      })
      return true
    }
    return false
  },
})