// components/player/player.js
var app = getApp()

Component({

  properties: {
    showPlayer: {
      type: Boolean
    },
    playerImg: {
      type: String
    },
    playerTitle: {
      type: String
    },
    isPlay: {
      type: Boolean 
    },
    navigateUrl:{
      type: String
    }
  },
  data:{

  },
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      setInterval(()=>{
        this.setData({
          playerImg: app.globalData.audioManager.playerImg,
          playerTitle: app.globalData.audioManager.title,
          navigateUrl: app.globalData.audioManager.url
        })
        console.log(this.data.playerTitle)
      },1000)
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
    ready(){
      
    }
  },
  pageLifetimes:{
    show() {
      this.setData({
        showPlayer: app.globalData.audioManager.showPlayer,
        playerImg: app.globalData.audioManager.playerImg,
        playerTitle: app.globalData.audioManager.title,
        isPlay: app.globalData.audioManager.isPlay,
        navigateUrl: app.globalData.audioManager.url
      })
    }
  },
  methods: {
    changePlay() {
      if (this.data.isPlay) {
        this.setData({
          isPlay: false
        })
        app.globalData.audioManager.isPlay = false
        app.globalData.audioManager.manager.pause()
      } else {
        this.setData({
          isPlay: true
        })
        app.globalData.audioManager.isPlay = true
        app.globalData.audioManager.manager.play()
      }
    },
    enterPage(e){
      wx.navigateTo({
        url: e.currentTarget.dataset.url
      })
    }
  }
  
})