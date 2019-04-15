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
    title: '配套餐品',
    isCover: false, //遮盖层
    buyNum: {},
    currentTab: 0,
    no: 0,
    size: 10,
    phone: null,
    // maxnum:0,
    tablist: [{
        name: '全部',
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
    tipHid:-1,//隐藏打折提示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var setMeal = JSON.parse(options.data),
      type = options.type, //套餐信息以及type类型   0：专享购  1：拼团购
      isToday = options.istoday
    console.log(setMeal)
    this.setData({
      isToday: isToday == 'true' ? true : false,
      sales: config.sales
    }) 
    this.loadData(setMeal, type)
    this.requestData() //初始页面数据
  },
  /**
   * 页面交互相关
   */
  loadData(setMeal, type) {
    let totalPrice, totalCount, data, phone, arr = []
    phone = app.globalData.userInfo.phone || null
    if (type == 0) { //专享购
      if(!this.data.isToday)setMeal.basicPrice = setMeal.discountprice
      totalPrice =setMeal.basicPrice
      totalCount = setMeal.initialNumber
      this.setData({
        ['single.' + setMeal.mallGoodsInventoryId]: totalPrice
      })
    } else { //拼团购
      totalPrice = setMeal.totalPrice
      totalCount = setMeal.count
      this.setData({
        ['single.' + setMeal.mallGoodsInventoryId]: setMeal.totalPrice,
        // maxnum:setMeal.maxnum
      })
    }
    this.defaultid = setMeal.mallGoodsInventoryId
    arr.push(setMeal)
    this.setData({
      setMeal,
      totalCount, //总数
      totalPrice, //总价
      type,
      // mainprice: totalPrice,
      // marincount: totalCount,
      phone,
      ['buyNum.' + setMeal.mallGoodsInventoryId]: totalCount,
      cartlist: arr
    })
    console.log(this.data.buyNum)
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
      meal,bool = true
    this.data.cartlist.forEach((item)=>{
      if(item.type == 0)bool = false
    })
    if(bool){
      wx.showToast({
        title: '至少选择一个套餐商品！',
        icon:'none'
      })
      return
    }
    postdata = {
      // meal: data.setMeal, //套餐商品信息
      shop: data.cartlist, //配套餐品信息
      type: data.type,
      single: data.single,
      buyNum: data.buyNum,
      totalPrice:data.totalPrice
    }
    wx.navigateTo({
      url: '../confrimOrder/confrimOrder?data=' + JSON.stringify(postdata) + '&time='+this.data.setMeal.bookTime,
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
      // maxnum = this.data.maxnum,//最大购买数量
      single = Number(this.data.single[data.mallGoodsInventoryId]) //单个商品总价
      if(index==0 && this.data.type==1&&target == 2){
        price = Number(data.price)    //购物车数据和列表数据的字段不同
      } else {       
        price = Number(data.basicPrice)
      }
    //加
    if (type === '1') {
      if (num == 0) {
        cartlist.push(data)
      }
      num++
      // if (this.data.type == 1 && num > maxnum && data.goodsNo == this.data.setMeal.goodsNo){
      //   wx.showToast({
      //     title: '最多只能买'+maxnum+'份',
      //     icon:'none'
      //   })
      //   return
      // }
      single += price
      totalCount++
      totalPrice = (totalPrice + price).toFixed(2)
    } else {
    //减
      if(num<=0)return
      num--
      single -= price
      if (num <= 0) {
        single = 0
        num = 0
        //限制拼团数量
        if(this.data.type==1&&data.goodsNo == this.data.setMeal.goodsNo){
          wx.showToast({
            title: '拼团数量不得少于1份',
            icon:'none'
          })
          return
        }
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
      cartlist
    })
  },
  //头部tab选择
  selecttab(e) {
    var {
      index,
      type
    } = e.currentTarget.dataset, arr
    arr = this.data.list.filter((item) => {
      if (type == 0) {
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
      time:this.data.setMeal.bookTime,
      discountFlag: this.data.isToday?'0':'1'
    }, id = this.data.setMeal.mallGoodsInventoryId
    api.request({
      url: Url.matinglist,
      data: postData,
      success: res => {
        console.log(res)
        var data = res.data.data.list
        data.map((item,index)=>{
          if (this.data.type == 1 && item.mallGoodsInventoryId ==id) {
            item.basicPrice = this.data.setMeal.price
            item.price = this.data.setMeal.price
            this.setData({
              tipHid:index
            })
          } else {
            item.basicPrice = this.data.isToday?item.basicPrice:(item.basicPrice * (item.discount || 1)).toFixed(2)
          }
        })
        this.setData({
          list: data,
          filterlist: data
        })
        data.forEach((item) => {
          if(item.mallGoodsInventoryId != this.defaultid){
            this.setData({
              ['buyNum.' + item.mallGoodsInventoryId]: 0,
              ['single.' + item.mallGoodsInventoryId]: 0
            })
          }
        })
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
})