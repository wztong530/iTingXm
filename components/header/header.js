// components/header/header.js
var app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    
    title: String,
    // pages: {
    //   type:Array,
    //   value:[]
    // },//页面栈
    // delta:{
    //   type:Number,
    //   value:1
    // },//跳转层数
    isBack:{
      type:Boolean,
      value:true
    },
    isBgColor:{
      type: Boolean,
      value: false
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    systemData: app.globalData.deviceInfo || 20,
    isShipei:false,
    isBackIndex:false,
    len:0
  },
  pageLifetimes: {
    show() {
      let pages,len
      this.triggerEvent('backFun')
      pages = getCurrentPages()
      len = pages.length
      this.setData({len})
      if(len<2){
        this.setData({
          isBackIndex: true
        })
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    backPre() {
      // let pages,
      //     len,
      //     delta = this.data.delta
      // this.triggerEvent('backFun')
      // pages=getCurrentPages()
      // len=pages.length
      // console.log('header',pages,len,delta)
      if (this.data.len>1) {
        wx.navigateBack({
          delta:1
        })
      }else{
        wx.reLaunch({
          url: '/pages/index/index'
        })   
      }
      // if(len){
      //   //因为考虑到有可能跳转到tabbar页面，所以使用relaunch，不过会造成页面重新加载
      //   wx.reLaunch({
      //     url: '/' + pages[len - delta].route,
      //   })
      // } else {
      //   wx.navigateBack({
      //     delta
      //   })
      // }
    }
  },
  ready() {
    var system = app.globalData.deviceInfo
    this.width = 568
    if (system.screenHeight > 2 * system.screenWidth || system.screenHeight - system.windowHeight - system.statusBarHeight - 46 > 70) {
      this.setData({
        isShipei: true
      })
    }
  }
})
