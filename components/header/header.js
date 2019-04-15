// components/header/header.js
var app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    
    title: String,
    pages: {
      type:Array,
      value:[]
    },//页面栈
    delta:{
      type:Number,
      value:1
    },//跳转层数
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
    systemData: app.globalData.deviceInfo || 20
  },

  /**
   * 组件的方法列表
   */
  methods: {
    backPre() {
      let pages = this.data.pages,
          len = pages.length,
          delta = this.data.delta
      this.triggerEvent('backFun')
      if(len){
        //因为考虑到有可能跳转到tabbar页面，所以使用relaunch，不过会造成页面重新加载
        wx.reLaunch({
          url: '/' + pages[len - delta].route,
        })
      } else {
        wx.navigateBack({
          delta
        })
      }
    }
  },
  created() {

  }
})
