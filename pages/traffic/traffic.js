// pages/traffic/traffic.js
import {
  config,
  Url
} from '../../utils/config.js'
import {
  Request
} from '../../utils/request.js'
var api = new Request()
var app = getApp()
var trafficSocketTask,startX,endX,moveFlag=true;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:"路况互动",
    systemData: '',
    isShipei: false,
    longitude: 0,//经度
    latitude: 0,//纬度
    chatRoomTitle:'厦门交通广播',
    popularNum:0,//参与人数
    programuuid:'',//节目uuid
    userInfo:null,
    // trafficMsgList:[],
    markers:[],
    trafficChat:null,//路况直播信息
    doClose:false //强制关闭直播连接
  },
  //触摸开始
  touchstart(e){
    startX=e.touches[0].pageX
    moveFlag=true;
  },
  //触摸移动
  touchmove(e){
    let id=e.currentTarget.dataset.id,
      index,
      markers = this.data.markers,
      len=markers.length
    markers.forEach((item, i, arr) => {
      if (id == item.id) {
        index=i
      }
    })
    endX=e.touches[0].pageX
    if(moveFlag){
      if(startX-endX>100){
        if (index < len - 1) {
          for (let item of markers) {
            item.iconPath = '/images/icons/small_mapIcon.png'
          }
          markers[index + 1].iconPath ='/images/icons/big_mapIcon.png'
          this.setData({
            trafficChat: markers[index + 1],
            markers
          })
        }
        console.log('向左滑动',this.data.trafficChat.id)
        moveFlag=false
      }
      if (endX - startX > 100) {
        if (index > 0) {
          for (let item of markers) {
            item.iconPath = '/images/icons/small_mapIcon.png'
          }
          markers[index - 1].iconPath = '/images/icons/big_mapIcon.png'
          this.setData({
            trafficChat: markers[index - 1],
            markers
          })
        }
        console.log('向右滑动', this.data.trafficChat.id)
        moveFlag = false
      }      
      this.setData({
        longitude: this.data.trafficChat.longitude,//经度
        latitude: this.data.trafficChat.latitude
      })
    }
  },
  //触摸结束
  touchend(e){
    moveFlag=true
  },

  //点击坐标点切换路况显示信息
  markertap(e){
    let markers = this.data.markers
    markers.forEach((item, i, arr) => {
      if(e.markerId==item.id){
        for (let item of markers) {
          item.iconPath = '/images/icons/small_mapIcon.png'
        }
        markers[i].iconPath = '/images/icons/big_mapIcon.png'
        this.setData({
          trafficChat:item,
          markers
        })
      }
    })
  },

  //页面返回
  backPre() {
    wx.switchTab({
      url: '../index/index'
    })
  },

  //页面跳转
  enterPage(e) {
    let { url } = e.currentTarget.dataset
    wx.navigateTo({
      url: url + '?title=' + this.data.chatRoomTitle + '&uuid=' + this.data.programuuid, 
      success:res=>{
        app.globalData.trafficChat = this.data.trafficChat
      }
    })
  },

  //加载路况列表
  loadtrafficList(){
    wx.getLocation({
      type:'gcj02',
      success:res0=>{
        api.request({
          url: Url.trafficList,
          data:{
            longitude:res0.longitude,
            latitude:res0.latitude
          },
          success: res => {
            this.setData({
              popularNum:res.data.popularit,
              programuuid: res.data.program
            })
            let trafficList = res.data.trafficList
            for (let item of trafficList) {
              item.iconPath = '/images/icons/small_mapIcon.png'
              item.width = 26
              item.height = 32
            }
            trafficList[0].iconPath ='/images/icons/big_mapIcon.png'
            this.setData({
              markers: trafficList,
              longitude: trafficList[0].longitude,
              latitude: trafficList[0].latitude,
              trafficChat: trafficList[0]
            })
            // this.webSocket(this.data.trafficChat.uuid)
            console.log('markers', this.data.markers)
          }
        })
      }
    }) 
  },

  //点击坐标点调用socket互动
  // markertap(e){
    // if (trafficSocketTask){
    //   trafficSocketTask.close({
    //     success: res => {
    //       console.log('关闭WebSocket连接', res)
    //     }
    //   })
    // }
    // this.data.markers.forEach((item,i,arr)=>{
    //   if(e.markerId==item.id){
    //     this.setData({
    //       trafficChat:item,
    //       trafficMsgList:[]
    //     })
    //     this.webSocket(item.uuid)
    //   }
    // })
  // },
  
  //创建webSocket连接
  // webSocket(uuid) {
  //   trafficSocketTask = wx.connectSocket({
  //     url: 'ws://abc.smartmapdt.com/itingxm/websocket/traffic/' + uuid + '/' + app.globalData.userInfo.uuid,
  //     header: {
  //       'content-type': 'application/json'
  //     },
  //     method: "GET",
  //     success: res => {
  //       console.log('路况接口调用', res)  
  //     },
  //     fail: res => {
  //       console.log('失败', res)
  //     }
  //   })
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   this.setData({
     systemData:app.globalData.deviceInfo || 20,
   })
  },
 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (e) {
    // 顶部适配
    var system = app.globalData.deviceInfo
    this.width = 568
    if (system.screenHeight > 2 * system.screenWidth || system.screenHeight - system.windowHeight - system.statusBarHeight - 46 > 70) {
      this.setData({
        isShipei: true
      })
    }
    this.mapCtx = wx.createMapContext('myMap')
    // if(this.data.trafficChat){
    //   this.webSocket(this.data.trafficChat.uuid)
    //   trafficSocketTask.onOpen(res => {
    //     console.log('监听 WebSocket 连接打开事件。', res)
    //   })
    //   trafficSocketTask.onClose(onClose => {
    //     console.log('监听 WebSocket 连接关闭事件。', onClose)
    //     if (!this.data.doClose) { this.webSocket() }
    //   })
    //   trafficSocketTask.onError(onError => {
    //     console.log('监听 WebSocket 错误。错误信息', onError)
    //   })
    //   trafficSocketTask.onMessage(res => {
    //     console.log('监听 WebSocket 接受到服务器的消息事件', res)

    //     let trafficMsgList = this.data.trafficMsgList
    //     trafficMsgList.push(JSON.parse(res.data))
    //     if (trafficMsgList.length>3){
    //       trafficMsgList.splice(0,1)
    //       this.setData({
    //         trafficMsgList 
    //       })
    //     }else{
    //       this.setData({
    //         popularNum: trafficMsgList[0].popularNum,
    //         trafficMsgList: trafficMsgList.slice(1)
    //       })
    //     }
    //     console.log('trafficMsgList', this.data.trafficMsgList)
    //   })
    // }
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      userInfo:app.globalData.userInfo
    })
    this.loadtrafficList()
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // this.setData({ doClose: true })
    // trafficSocketTask.close({
    //   success: res => {
    //     console.log('关闭WebSocket连接', res)
    //   }
    // })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // this.setData({ doClose: true })
    // trafficSocketTask.close({
    //   success: res => {
    //     console.log('关闭WebSocket连接', res)
    //   }
    // })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})