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
    //不包括所有的页面相关字段
    title: '拼团购', //头部显示
    isShare: false, //分享弹窗页    ||   
    isGoAssemble: false, //是否发起团购  
    isShow: true, //团购弹出动画
    buyNum: 1, //购买数量
    isBuyTip: true, //购买提示
    data: null, //商品信息
    cur_in: 0, //拼团份数
    totalPrice: 0, //总价
    price: 0, //单价
    timeout: [], //定时器相关字段数组
    cur_wait: null,
    boolShare: false, //是否是从分享入口进入此页面
    userInfo: null, //用户信息，
    init: true,
    isBack: true,
    fslist:'',//拼团份数  初始的
    filterFs:[],//过滤后的
    isJoin:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //初始商品信息
    let data = JSON.parse(options.data)
    console.log(data)
    this.setData({
      price: data.basicPrice,
    })
    if (options.isShare) {
      var orderNo = options.orderNo
      if(typeof data.images == 'string'){
        data.images = data.images.split(',')
        var len = data.images.length
        data.images.length = len - 1
      }
      this.setData({
        data     
      })
      //分享进入
      wx.showLoading({
        title: '数据加载中'
      })
      api.loadRequest({
        app
      }).then(({ userInfo}) => {
        wx.hideLoading()
        if (!userInfo) {
          this.getUserInfo()
        }
        this.setData({
          userInfo,
          init: true,
          isBack: false
        })
        api.request({
          url: Url.getPtInfo,
          data: {
            orderNo
          },
          success: (res) => {
            var listdata = res.data.data
            console.log(listdata)
            this.setData({
              listdata
            })
            this.loadshare(listdata)
          }
        })
      })
    } else {
      //首页进入    
      this.setData({
        data
      })
      this.isToday = options.istoday
      this.loaddata()
    }
  },
  loadshopinfo() {
    //请求商品的拼团份数
    let data = this.data.data,
      global = app.globalData,
      postData = {
        inventoryId: data.mallGoodsInventoryId
      }
    api.request({
      url: Url.inventory,
      data: postData,
      success: res => {
        console.log(res)
        var data = res.data.data
        this.setData({
          fslist:data
        })
        this.initfs()
      }
    })
  },
  initfs(data){
    var filterArr = []
    filterArr.push({
      fs: '已拼0份',
      jg: (Number(this.data.price)).toFixed(2)
    })
    this.data.fslist.forEach((item) => {
      var arr = item.split('/')
      filterArr.push({
        fs: '拼到' + arr[0] + '份',
        jg: Number(arr[1]).toFixed(2)
      })
    })
    this.setData({
      filterFs: filterArr
    })
  },
  loaddata() {
    let data = this.data.data,
      global = app.globalData,
      lon, lat, postData
    this.loadshopinfo()
    if (config.debug) {
      lon = '24.498777'
      lat = '118.199903'
    } else {
      lon = global.location.lon
      lat = global.location.lat
    }
    //请求附近拼团列表
    postData = {
      goodId: data.id,
      lon,
      lat,
      mobileUserId: global.userId,
      bookTime:this.data.data.bookTime
    }
    api.request({
      url: Url.assembleList,
      data: postData,
      success: res => {
        console.log(res)
        let data = res.data,
          arr = this.data.timeout
        this.setData({
          list: data.groupOrderList,
          man: data.groupNum,
        })
        data.groupOrderList.map((item, index) => {
          item.price = item.groupSpecs.split('/')[1] //单价
          //定时器
          let residue = item.groupEndTime - new Date().getTime()
          if (residue > 0) {       
            //计算出相差天数
            var d = Math.floor(residue / (24 * 3600 * 1000))
            //计算出小时数
            var leave1 = residue % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
            var h = Math.floor(leave1 / (3600 * 1000))
            //计算相差分钟数
            var leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
            var m = Math.floor(leave2 / (60 * 1000))
            //计算相差秒数
            var leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
            var s = Math.round(leave3 / 1000),
              len = arr.push({
                str: this.formatTime(d,h, m),
                h,
                m,
                s,
                d,
                success: true
              })
            //定时器写在这误差会比较小
            setTimeout(() => {
              this.formatTimeOut(index)
              arr[len - 1].interval = setInterval(() => {
                this.formatTimeOut(index)
              }, 60000)
            }, s * 1000)
          } else {
            arr.push({
              str: '00:00',
              success: false
            })
            this.changeStatus(index)
          }
        })
        this.setData({
          timeout: arr
        })
      }
    })
  },
  //定时器处理函数
  formatTimeOut(index) {
    var data = this.data.timeout[index],
      h = data.h,
      m = data.m,
      d = data.d,
      success = data.success,
      interval = data.interval
    m--
    if (m < 0) {
      m = 59
      h--
      if (h < 0) {
        if(d != 0){
          d--
          h = 24
        } else {
          h = 0
          m = 0
          success = false
          clearInterval(data.interval)
          interval = null
          this.changeStatus(index)
        }
      }
    }
    this.setData({
      ['timeout[' + index + ']']: {
        str: this.formatTime(d,h, m),
        h,
        m,
        d,
        success,
        interval
      }
    })
  },
  formatTime(d,h, m) {
    var str
    h = this.formatNum(h)
    m = this.formatNum(m)
    if(d == 0){
      str = h + '时' + m
    } else {
      str = d + '天' + h + '时' + m
    }
    return str
  },
  formatNum(num) {
    if (num < 10) return '0' + num
    return num
  },
  changeStatus(index) {
    console.log(this.data.list)
    api.request({
      url: Url.assembleFail,
      data: {
        orderId: this.data.list[index].id
      }
    })
  },
  /**
   * 用户点击交互事件
   */
  preventNull() {},
  //分享按钮
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
  checklocation(callback) {
    if (!app.globalData.isLocation) {
      wx.openSetting({
        success: res => {
          if (res.authSetting['scope.userLocation']) {
            app.globalData.isLocation = true
            callback()
            api.getlocation({
              app
            })
          }
        }
      })
      return false
    }
    return true
  },
  // 发起团购按钮
  goAssemble() {
    if (this.data.boolShare) {
      if (!this.checklocation(this.goAssemble)) return
    }
    if(!this.data.isJoin){
      this.initfs()
    }
    var   buyNum = this.data.buyNum,price = this.data.price
    //
    if(this.data.isJoin){
      price = this.data.curData.orderPrice
    }
    //
    this.setData({
      isGoAssemble: true,
      totalPrice: Number(buyNum * price).toFixed(2),
      isShow: true
    })
  },

  // 隐藏发起团购页
  hidePopup() {
    this.setData({
      isShow: false,
      cur_timeout: null,
      cur_wait: null,
      isJoin:false
    })
    setTimeout(() => {
      this.setData({
        isGoAssemble: false
      })
    }, 500)
  },

  // 购买商品数量
  addReduce(e) {
    let type = e.currentTarget.dataset.type, //1:加   0：减
      num = this.data.buyNum,
      {
        price,
        totalPrice
      } = this.data
      if(this.data.isJoin){
        price = this.data.curData.orderPrice
      }
    if (type === '1') {
      num++
    } else {
      num--
      if (num < 1) num = 1
    }
    this.setData({
      buyNum: num,
      totalPrice: Number(price * num).toFixed(2)
    })
  },
  joinAssemble(e) {
    var data, cur_timeout, buyNum = this.data.buyNum
    if (this.data.boolShare) {
      if (!this.checklocation(this.joinAssemble)) return
    }
    if (this.data.boolShare) {
      data = this.data.listdata //拼团信息
      cur_timeout = this.data.timeout[0].str
    } else {
      var {
        index
      } = e.currentTarget.dataset
      data = this.data.list[index]
      cur_timeout = this.data.timeout[index].str
    }
    this.orderId = data.id
    this.mallBranchesId = data.mall_branches_id
    // 初始化filterFs


    var already = data.groupAlready,bool = true,fslist = this.data.fslist,len = fslist.length,last = fslist[len-1].split('/'),filterArr = []
    filterArr.push({
      fs: '已拼'+already+'份',
      jg: (Number(data.orderPrice)).toFixed(2)
    })
    for (var i = 0; i < len;i++){
      let item = fslist[i]
      let arr = item.split('/'), num = arr[0]
      if (already < num) {
          bool = false
          filterArr.push({
            fs: '拼到' + arr[0] + '份',
            jg: Number(arr[1]).toFixed(2)
          })
          break
      }
    }
    if(bool){
      filterArr.push({
        fs: '上不封顶',
        jg: Number(last[1]).toFixed(2)
      })
    } else {
      filterArr.push({
        fs: '拼到' + last[0] + '份',
        jg: Number(last[1]).toFixed(2)
      })
    }
    //
    this.setData({
      filterFs:filterArr,
      cur_timeout,
      cur_ready: data.groupAlready,
      totalPrice: Number(buyNum * data.orderPrice).toFixed(2),
      isJoin:true,
      curData:data
    })
    this.goAssemble()
  },
  //跳转页面
  enterPage(e) {
    let {
      type,
      url
    } = e.currentTarget.dataset //1:查看更多按钮  2：下一步  按钮
    switch (type) {
      case '1':
        if (this.data.list.length == 0) {
          wx.showToast({
            title: '附近没有拼团',
            icon: 'none'
          })
          return
        } else {
          wx.navigateTo({
            url: url + '?data=' + JSON.stringify(this.data.list) + '&man=' + this.data.man
          })
        }
        break
      case '2':
        let data = this.data,
          buynum = data.buyNum,
          totalprice = data.totalPrice,
          postdata = {},
          datastr
        postdata = data.data //拼团套餐信息处理
        postdata.orderId = undefined
        postdata.mallBranchesId = undefined
        if (data.isJoin) {
          postdata.orderId = this.orderId // 参与拼团时需要orderId
          postdata.mallBranchesId = this.mallBranchesId //  网点id
        }
        postdata.price = data.isJoin?this.data.curData.orderPrice:data.price
        postdata.count = buynum //下单时的商品购买数量
        postdata.totalPrice = Number(totalprice).toFixed(2) //总价格
        // postdata.inventory = data.inventory[data.cur_in] //拼团份数
        postdata.maxnum = data.maxnum
        datastr = JSON.stringify(postdata)
        console.log(postdata)
        wx.navigateTo({
          //type  1：表示从拼团购处进入配套餐品页面
          url: url + '?data=' + datastr + '&type=1&isToday=' + this.isToday
        })
        break
    }
  },



  //分享相关
  onShareAppMessage(e) {
    var {
      type
    } = e.target.dataset, str, title, imageUrl
    if (type == 1) {
      title = '邀请您来古龙嘀膳用餐!'
      str = '/pages/index/index'
      imageUrl = '/images/index.jpg'
    } else {
      title = ''
      str = '/pages/assembleDetail/assembleDetail?isShare=true&orderNo=' + JSON.stringify(this.data.list[this.index].orderNo) + '&data=' + JSON.stringify(this.data.data)
      imageUrl = this.data.data.images[0]
    }
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



  // 
  // 
  // 分享页面逻辑
  backindex() {
    wx.reLaunch({
      url: '../index/index'
    })
  },
  loadshare(listdata) {
    //定时器相关
    let residue = listdata.groupEndTime - new Date().getTime(),
      time, arr = this.data.timeout
    if (residue > 0) {
      //计算出相差天数
      var d = Math.floor(residue / (24 * 3600 * 1000))
      //计算出小时数
      var leave1 = residue % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
      var h = Math.floor(leave1 / (3600 * 1000))
      //计算相差分钟数
      var leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
      var m = Math.floor(leave2 / (60 * 1000))
      //计算相差秒数
      var leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
      var s = Math.round(leave3 / 1000),
        len = arr.push({
          str: this.formatTime(d,h, m),
          h,
          m,
          s,
          d,
          success: true
        })
      setTimeout(() => {
        this.formatTimeOut(0)
        arr[0].interval = setInterval(() => {
          this.formatTimeOut(0)
        }, 60000)
      }, s * 1000)
    } else {
      arr.push({
        str: '00:00',
        success: false
      })
      this.changeStatus(index)
    }
    this.loadshopinfo()
    this.setData({
      isBack: false,
      boolShare: true,
      timeout: arr
    })
    //获取地理位置
    api.getlocation({
      app
    })
    //判断是否有打折
    this.isToday = new Date().getDate() == new Date(listdata.groupEndTime).getDate() ? true : false
  },
  //授权相关
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
  getPhoneNumber(e) {
    api.getPhone({
      e,
      app,
      success: (phone) => {
        this.setData({
          'userInfo.phone': phone
        })
      }
    })
  },
  /**
* 画分享图片图
*/
  sharePyq() {
    wx.showLoading({
      title: '卡片生成中...'
    })
    this.setData({
      template: {
        width: '375px',
        height: '510px',
        background: '#FEF9EF',
        views: [
          {
            type: 'image',
            url: '/images/tp@2x.png',
            css: {
              top: '26px',
              left: '7px',
              width: '361px',
              height: '306px'
            }
          },
          {
            type: 'image',
            url: '/images/bzxg.png',
            css: {
              top: '80px',
              left: '34px',
              width: '307px',
              height: '226px'
            }
          },
          {
            type: 'image',
            url: '/images/Rectangle@3x-min.png',
            css: {
              top: '346px',
              right: '15px',
              width: '345px',
              height: '112px'
            }
          },
          {
            type: 'image',
            url: '/images/glxcxm.jpg',
            css: {
              top: '358px',
              right: '30px',
              width: '88px',
              height: '88px'
            }
          },

          {
            type: 'text',
            text: app.globalData.userInfo.wechatName,
            css: {
              top: '367px',
              left: '30px',
              width: '212px',
              fontSize: '16px',
              maxLines: '1',
              lineHeight: '16px'
            }
          },
          {
            type: 'text',
            text: '“邀请您加入古龙嘀膳”',
            css: {
              top: '398px',
              left: '30px',
              width: '212px',
              fontSize: '16px',
              maxLines: '1',
              lineHeight: '12px'
            }
          },
          {
            type: 'text',
            text: '长按识别小程序码查看详情',
            css: {
              top: '425px',
              left: '30px',
              width: '212px',
              fontSize: '12px',
              maxLines: '1',
              lineHeight: '12px',
              color: '#FF9500'
            }
          }
        ]
      }
    })
  },

  /**
   * 绘制图片回调
   */
  getShareImg(e) {
    wx.hideLoading()
    console.log(e.detail.path)
    wx.previewImage({
      urls: [e.detail.path]
    })
  },
  preventEvent() { }
})