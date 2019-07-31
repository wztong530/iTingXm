// pages/chat/chat.js
import {
  config,
  Url
} from '../../utils/config.js'
import {
  Request
} from '../../utils/request.js'
var api = new Request()
var app = getApp()
var chatSocketTask, startY, endY, moveFlag = true;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:'',
    isBack:true,
    otheruuid:'',
    chatLogList:[],//聊天记录
    newchatLogList:[],//显示的聊天
    isNoMore: false,
    pageNum: 0,//从1开始
    pageSize: 8,
    pages: 0, //总页数
    newMsg:'',
    bottom:0,//防止软键盘弹出页面上移
    showTips:false,//下拉刷新时显示3个小点
    isRefresh:false, //加载控件
    lastTime:''//历史记录最后一条时间
  },

  //触摸开始
  touchstart(e) {
    startY = e.touches[0].pageY
    moveFlag = true;
  },
  //触摸移动
  touchmove(e) {
    endY = e.touches[0].pageY
    if (endY - startY > 100) {
      if (this.data.pageNum < this.data.pages){
        this.setData({
          showTips:true,
          isRefresh:true
        })
        moveFlag = false
      }
    }
  },
  //触摸结束
  touchend(e) {
    moveFlag = true
    this.setData({
      showTips:false
    })
    if (this.data.pageNum < this.data.pages && this.data.isRefresh) {
      this.loadchatLogList()
    }
    this.setData({
      isRefresh:false
    })
  },

  //分页加载聊天记录
  loadchatLogList(resolve) {
    this.setData({
      pageNum: this.data.pageNum + 1
    })
    wx.showLoading()
    api.request({
      url: Url.chatLogList,
      data: {
        myUserUuid: app.globalData.userInfo.uuid,
        theOrderUserUuid:this.data.otheruuid,
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      },
      success: res => {
        let chatLogList=this.data.chatLogList
        chatLogList.unshift(...res.data.page.records.reverse())
        let arr=JSON.parse(JSON.stringify(chatLogList))
        for(let i=0;i<arr.length-1;i++){
          if (new Date(arr[i + 1].sendTime) - new Date(arr[i].sendTime)>1800000){
            arr[i + 1].showTime=true
          }
        }
        this.setData({
          lastTime: arr[arr.length - 1].sendTime
        })
        for(let item of arr){
          item.sendTime=this.timeFormat(item.sendTime)
        }
        this.setData({
          pages: res.data.page.pages,
          newchatLogList:arr,
          chatLogList
        })
        console.log('chatLogList', this.data.chatLogList,arr,this.data.newchatLogList)
        if (this.data.pageNum == this.data.pages) {
          arr[0].showTime=true
          arr[arr.length-1].showTime=true
          this.setData({
            isNoMore: true,
            newchatLogList:arr
          })
        }
        wx.hideLoading()
        if (this.data.pageNum == 1) {//只有第一次页面加载做异步顺序执行
          resolve()
        }
      }
    })
  },

  //获取输入内容
  getInput(e) {
    this.setData({
      newMsg: e.detail.value
    })
  },
  //输入聚焦
  focus(e) {
    this.setData({
      bottom: e.detail.height
    })
  },
  //失去聚焦
  blur (e) {
    this.setData({
      bottom: 0
    })
  },

  //更改时间格式为 n月n日 n:n
  timeFormat(t){
    var t=new Date(t);
    var month=t.getMonth()+1;
    var date=t.getDate();
    var hour=t.getHours();
    hour=hour<10?'0'+hour:hour;
    var minute=t.getMinutes();
    minute=minute<10?'0'+minute:minute;
    return month+'月'+date+'日'+' '+hour+':'+minute;
  },

  //显示底端
  toBottom(){
    const query = wx.createSelectorQuery()
    query.select('#flag').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      wx.pageScrollTo({
        scrollTop: res[0].bottom // #flag节点的下边界坐标
      })
      res[1].scrollTop // 显示区域的竖直滚动位置
    })
  },

  //创建webSocket连接
  webSocket() {
    chatSocketTask = wx.connectSocket({
      url: 'wss://abc.smartmapdt.com/itingxm/websocket/private_chat/'  + app.globalData.userInfo.uuid,
      header: {
        'content-type': 'application/json'
      },
      method: "GET",
      success: res => {
        console.log('私聊接口调用', res)
      },
      fail: res => {
        console.log('失败', res)
      }
    })
  },

  //发送信息
  sendMsg() {
    var reg = /^\s*$/g;
    if (reg.test(this.data.newMsg) || this.data.newMsg == '') {
      wx.showToast({
        title: '不能发送空内容！',
        icon: 'none'
      })
      return;
    }
    api.wxMsgCheck({
      data:{
        content:this.data.newMsg
      },
      success:res=>{
        if(res.data.code==0){
          if (chatSocketTask.readyState == 1) {
            let data = {
              fromUserId: app.globalData.userInfo.uuid,
              toUserId: this.data.otheruuid,
              message: this.data.newMsg,
              sendTime: new Date()
            }
            chatSocketTask.send({
              data: JSON.stringify(data),
              success: res => {
                console.log('发送成功', res)
                this.setData({
                  newMsg: ''
                })
              },
              fail: res => {
                console.log('发送失败', res)
                wx.showToast({
                  title: '发送失败，请稍后重试',
                  duration: 2000,
                  mask: true,
                  icon: 'none'
                })
              }
            })
          } else {
            wx.showToast({
              title: '正在连接服务器，请稍候',
              duration: 2000,
              mask: true,
              icon: 'none'
            })
            this.webSocket()
            console.log(chatSocketTask.readyState)
          }
        }else{
          wx.showToast({
            title: '含有违规内容,请重新编辑',
            icon: 'none',
            duration: 2000
          })
        }
      }
    }) 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      otheruuid: options.otheruuid,
      title: options.othername
    })
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //聊天监听
    chatSocketTask.onOpen(res => {
      console.log('监听 WebSocket 连接打开事件。', res)
    })
    chatSocketTask.onClose(onClose => {
      console.log('监听 WebSocket 连接关闭事件。', onClose)
      this.webSocket()
    })
    chatSocketTask.onError(onError => {
      console.log('监听 WebSocket 错误。错误信息', onError)
    })
    chatSocketTask.onMessage(res => {
      console.log('监听 WebSocket 接受到服务器的消息事件', res)
      let chatLogList = this.data.chatLogList
      chatLogList.push(JSON.parse(res.data))
      let arr = JSON.parse(JSON.stringify(chatLogList))
      for (let i = 0; i < arr.length - 1; i++) {
        if (new Date(arr[i + 1].sendTime) - new Date(arr[i].sendTime) > 1800000) {
          arr[i + 1].showTime = true
        }
        if (this.data.lastTime == arr[i].sendTime){
          arr[i].showTime=true
        }
      }
      
      arr.forEach((item, i, arr) => {
        arr[i].sendTime = this.timeFormat(item.sendTime)
      })
      arr[0].showTime = true
      this.setData({
        newchatLogList: arr,
        chatLogList
      })
      this.toBottom()
      console.log('chatLogList', this.data.chatLogList)
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.webSocket()
    new Promise((resolve, reject) => {
      this.loadchatLogList(resolve)
    }).then(() => {
      this.toBottom()
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    chatSocketTask.close({
      success: res => {
        console.log('关闭WebSocket连接', res)
      }
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    chatSocketTask.close({
      success: res => {
        console.log('关闭WebSocket连接', res)
      }
    })
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