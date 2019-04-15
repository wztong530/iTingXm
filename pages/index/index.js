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
    title: config.appName,
    isBack: false, //头部是否显示返回按钮
    currentIndex: 0, //套餐选择下标
    currentTimeIndex: 0, //下单时间下标
    userInfo: null, //用户信息
    init: false, //初始化是否完成
    num: 0, //页码
    size: 100, //页面数据条数
    time: '',
    scrollL: '0',
    isTran: true, //是否需要过渡动画
    shipei: false, //全面屏适配
    adImg: [],
    isWeek: false,
    isToday: true, //表示是否是今天，
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 登录
    wx.showLoading({
      title: '数据加载中',
    })
    api.loadRequest({
      app
    }).then(({userInfo}) => {
      this.setData({
        userInfo: userInfo,
        init: true
      })
      wx.hideLoading()
      wx.showTabBar()
      this.initdata()
      this.setting()
      this.load()
    })
  },

  initdata() {
    //定义一些页面用的公用数据
    var system = app.globalData.deviceInfo
    this.width = 568
    console.log(system)
    if (system.screenHeight > 2 * system.screenWidth || system.screenHeight - system.windowHeight - system.statusBarHeight - 46 > 70) {
      this.setData({
        shipei: true
      })
    }
    this.weekArr = {
      'sun': '星期日',
      'mon': '星期一',
      'tue': '星期二',
      'wed': '星期三',
      'thu': '星期四',
      'fri': '星期五',
      'sat': '星期六',
      'thurs': '星期四',
      'thur': '星期四'
    }
    this.disable = false //滚动冲突处理
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (app.globalData.userInfo && !this.data.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
    //防止用户突然关闭授权
    api.checkLocation({
      app
    })
  },

  /**
   * 用户交互事件
   */
  //初始数据请求
  load() {
    // 公告
    api.request({
      url: Url.noticeList,
      success: res => {
        console.log(res)
        this.setData({
          noticelist: res.data.data
        })
      }
    })
    //首页轮播图
    api.request({
      url: Url.swiperImg,
      success: res => {
        this.setData({
          adImg: res.data.data
        })
      }
    })
    //判断用户身份
    api.request({
      url: Url.isBranches,
      data: {
        userId: app.globalData.userId
      },
      success: res => {
        if (res.data.data) {
          var data = res.data.data
          app.globalData.isBranches = true
          app.globalData.branchesInfo = data
          app.globalData.curBranchesInfo = data[0]
        }
      }
    })
    // 下单时间列表
    api.request({
      url: Url.dateBusiness,
      success: res => {
        console.log(res)
        var data = res.data.data,
          re = /[\\u4e00-\\u9fa5]/
        data.map((item, index) => {
          if (index != 0) {
            if (re.test(item.week[0]))
              item.week = this.weekArr[(item.week).toLocaleLowerCase()]
          }
          item.mon = item.day.slice(4, 6)
          item.date = item.day.slice(6)
        })
        app.globalData.timeList = data
        this.setData({
          timelist: data,
          time: data[0].day
        })
        //请求商品列表

        var today = new Date(),
          day = today.getDay(),
          now = today.getHours()
        if (now >= 10 && day != 5) {
          this.setData({
            currentTimeIndex: 1,
            time: data[1].day,
            isToday: false
          })
          if (!this.checkWeek(data[1].time)) {
            this.shopload()
          }
        } else {
          if (!this.checkWeek()) this.shopload()
        }


      }
    })
  },
  //
  preventNull() {},
  // 滚动时的联动处理
  scrollStart(e) {
    this.touchstart = e.changedTouches[0].clientX
  },
  reScroll(e) {
    // let left = e.detail.scrollLeft,width = this.width
    // this.setData({
    //   currentIndex: (left / width).toFixed()
    // })
  },
  scrollEnd(e) {
    if (this.disable) return
    var end = e.changedTouches[0].clientX,
      len = this.data.shoplist.length,
      width = this.width,
      index = Number(this.data.currentIndex),
      scrollL
    if (Math.abs(end - this.touchstart) < 50 || len < 2) return
    if (this.touchstart - end > 0) {
      index++
    } else {
      index--
    }
    if (len > 2) {
      scrollL = '-' + (index + 1) * width
      if (index < 0 || index > len - 1) {
        if (index < 0) {
          index = len - 1
        } else {
          index = 0
        }
        this.setData({
          scrollL,
          currentIndex: index
        })
        this.disable = true
        setTimeout(() => {
          this.setData({
            isTran: false
          })
          setTimeout(() => {
            this.setData({
              scrollL: '-' + (index + 1) * width
            })
            setTimeout(() => {
              this.setData({
                isTran: true
              })
              this.disable = false //防止定时器起冲突,保证定时器全部执行完毕再响应用户操作
            }, 100)
          }, 0)
        }, 500)
      } else {
        if (index > len - 1) index = len - 1
        if (index < 0) index = 0
        this.setData({
          scrollL,
          currentIndex: index
        })
      }
    } else {
      if (index > len - 1) index = len - 1
      if (index < 0) index = 0
      scrollL = '-' + index * width
      this.setData({
        scrollL,
        currentIndex: index
      })
    }
  },
  // 跳转页面
  enterPage(e) {
    if (!app.globalData.userInfo) return
    let {
      type,
      url,
      index
    } = e.currentTarget.dataset, //跳转页面的3个类型  1:取餐按钮  2：专享购按钮 3：拼团购按钮   
      currentIndex = this.data.currentIndex, timeIndex = this.data.currentTimeIndex,
      data = {}, datastr
    if (type != 1 && index != currentIndex) return //遮盖层屏蔽
    if (type != 1 && !app.globalData.isLocation) {
      wx.openSetting({
        success: res => {
          if (res.authSetting['scope.userLocation']) {
            app.globalData.isLocation = true
            this.enterPage(e)
            api.getlocation({
              app
            })
          }
        }
      })
      return
    }
    if (timeIndex == 0 && type != 1) {
      let hour = new Date().getHours()
      if (hour >= 10) {
        wx.showToast({
          title: '今日已经不能下单了哦',
          icon: 'none'
        })
        return
      }
    }
    if(type==3&&this.data.isToday)return
    if (type != 1) {
      var shopdata = this.data.shoplist[index]
      shopdata.bookTime = this.data.time //添加booktime字段，表示预定单日期
      shopdata.discountFlag = this.data.isToday ? '0' : '1'
      datastr = JSON.stringify(this.data.shoplist[index])
    }
    switch (type) {
      case '1':
        data = {
          isBack: true,
          pages: getCurrentPages()
        }
        wx.reLaunch({
          url: '../order/order?data=' + JSON.stringify(data),
        })
        break
      case '2':
        wx.navigateTo({
          //type  0：表示从专享购处进入配套餐品页面
          url: url + '?data=' + datastr + '&type=0&istoday=' + this.data.isToday
        })
        break
      case '3':
        wx.navigateTo({
          url: url + '?data=' + datastr + '&istoday=' + this.data.isToday
        })
        break
      default:
        wx.navigateTo({
          url
        })
        break
    }
  },
  //下单时间选择
  selectTime(e) {
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
    let time = this.data.timelist[index],
      isToday = true
    if (index != 0) {
      isToday = false
    }
    this.setData({
      currentTimeIndex: index,
      time: time.day,
      isToday
    })
    if (!this.checkWeek(time.time)) {
      this.shopload()
    }
  },

  //获取用户信息
  getUserInfo(e) {
    api.getUserInfo({
      app,
      success: (res) => {
        this.setData({
          userInfo: res.userInfo
        })
      }
    })
  },
  //请求商品信息 
  shopload() {
    // 商品列表
    let postData = {
      no: this.data.num,
      size: this.data.size,
      time: this.data.time,
      discountFlag: this.data.isToday ? '0' : '1'
    }
    wx.showLoading()
    api.request({
      url: Url.indexShop,
      data: postData,
      success: (res) => {
        console.log(res)
        wx.hideLoading()
        //暂时不用分页
        var data = res.data.data.list,
          index = this.data.currentTimeIndex
        if (data.length != 0) {
          data.map((item) => {
            item.images = item.images.split(',')
            var len = item.images.length
            // if(item.images[len - 1] == ""){
            item.images.length = len - 1
            // }
            item.discountprice = (item.basicPrice *(item.discount||1)).toFixed(2)
          })
        }
        this.setData({
          shoplist: data
        })
        if (data.length == 0) {
          var week = new Date(this.data.timelist[index].time).getDay()
          this.setData({
            nodataImg: '/images/Group-2.svg',
            nodataTxt: '餐品正在为您精心准备中…',
            isWeek: false
          })
        } else if (data.length < 3) {
          this.setData({
            scrollL: 0,
            currentIndex: 0
          })
        } else {
          this.setData({
            scrollL: -this.width,
            currentIndex: 0
          })
        }

      }
    })
  },
  //检查日期是否为周末
  checkWeek(time = new Date().getTime()) {
    var week = new Date(time).getDay()
    if (week == 6 || week == 0) {
      this.setData({
        nodataImg: '/images/Group-1.svg',
        nodataTxt: '今天休息，好好陪家人!',
        isWeek: true,
        shoplist: []
      })
      return true
    }
    return false
  },
  //授权相关
  setting() {
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting["scope.userInfo"]) {
    //       if (!!app.globalData.userInfo) return
    //       this.getUserInfo()
    //     }
    //   }
    // })
    api.getlocation({
      app
    })
  },
  onShareAppMessage() {
    var str = '/pages/index/index'
    return {
      title: '邀请您来古龙嘀膳用餐!',
      path: str,
      imageUrl: '/images/index.jpg',
      success(res) {

      },
      fail(res) {

      }
    }
  },
})