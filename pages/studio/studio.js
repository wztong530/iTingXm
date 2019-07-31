// pages/studio/studio.js
import {
  config,
  Url
} from '../../utils/config.js'
import {
  Request
} from '../../utils/request.js'
var api = new Request()
var app = getApp()
var myAudio=app.globalData.audioManager
var myAudioManager=myAudio.manager
var SocketTask, startY, endY, moveFlag = true 


Page({

  /**
   * 页面的初始数据
   */
  data: {
    anchorList:[],
    title:'',
    uuid:'',//节目uuid
    playerImg:'',
    programDetail:{},
    isBack:true,
    isShow:false,
    isPopup:false,
    isShow_two:false,
    isPopup_two:false,
    scrollTop:0,
    inputValue:'',
    chatInfo:{}, //直播人气、头像信息
    msgList: [], //实时消息列表
    othername:'', //互动对象名字
    otheruuid:'', //互动对象uuid
    otheruserid:'',//互动对象userId
    trafficChat:null,//路况直播间信息
    doClose:false, //强制关闭直播连接
    bottom:0,
    isNoMore: false,
    pageNum: 0,//从1开始
    pageSize: 8,
    pages: 0, //总页数
    showTips: false,//下拉刷新时显示3个小点
    isRefresh: false, //加载控件
    userInfo:null
  },

  //点赞type-1/转发type-2
  addLikeOrForward({type,success}){
    api.request({
      url: Url.addLikeOrForward,
      data:{
        // promgramUuid: this.data.trafficChat ? this.data.trafficChat.uuid:this.data.uuid,
        promgramUuid: this.data.uuid,
        uuid:app.globalData.userInfo.uuid,
        type
      },
      success
    })
  },
  //点赞
  addLike(){
    this.addLikeOrForward({
      type:1,
      success:res=>{
        if(res.data.code==0){
          let newProgramDetail = this.data.programDetail
          newProgramDetail.likeNum = newProgramDetail.isLike ? --newProgramDetail.likeNum : ++newProgramDetail.likeNum
          newProgramDetail.isLike = newProgramDetail.isLike ? false : true
          this.setData({
            programDetail: newProgramDetail
          })
        // app.globalData.trafficChat.likeNum=this.data.programDetail.likeNum
        // app.globalData.trafficChat.isLike = this.data.programDetail.isLike
        }
      }
    })
  },

  //获取输入框/积分内容
  getInput(e){
    this.setData({
      inputValue:e.detail.value
    })
  },
  //输入聚焦
  focus(e) {
    this.setData({
      bottom: e.detail.height
    })
  },
  //失去聚焦
  blur(e) {
    this.setData({
      bottom: 0
    })
  },
  //弹窗
  showPop(e){
    let { type, othername, otheruuid, otheruserid} = e.currentTarget.dataset
    if (app.globalData.userInfo.uuid == otheruuid){
      return
    }
    if(type == 0){ //普通弹窗
      this.setData({
        isPopup: true,
        isShow: true,
        othername, otheruuid, otheruserid
      })
    }else{ //积分弹窗
      this.setData({
        isPopup: false,
        isShow: false,
        isPopup_two: true,
        isShow_two: true
      })
    } 
  },
  // 隐藏发起赠送积分弹窗
  hidePopup(e) {
    let that=this
    let type = e.currentTarget.dataset.type
    switch(type){
    case '0':
      that.setData({
        isShow: false
      })
      setTimeout(() => {
        that.setData({
        isPopup: false
        })
      }, 500)
    break
    case '1':
      that.setData({
        isShow_two: false,
        isPopup_two: false
      })
    break  
    case '2':
      wx.showLoading()
      if (that.data.inputValue.length!=0){
        api.addIntegral({
          data:{
            userId: that.data.otheruserid,
            ruleId:25,
            point: that.data.inputValue
          },
          success:res=>{
            wx.hideLoading()
            if (res.data.code==0){
              wx.showToast({
                title: '赠送成功',
                icon: 'success'
              })
              setTimeout(() => {
                that.setData({
                  inputValue: '',
                  isShow_two: false,
                  isPopup_two: false
                })
              }, 500)
            }else{
              wx.showToast({
                title: '今日赠送积分已达上限',
                icon:'none',
                duration:2000
              })
              setTimeout(() => {
                that.setData({
                  inputValue: '',
                  isShow_two: false,
                  isPopup_two: false
                })
              }, 500)
            }
          }
        }) 
      }else{
        wx.hideLoading()
        wx.showToast({
          title: '请输入赠送积分数',
          icon: 'none'
        })
      }
    }
  },
  
  //选择主播私聊
  bindPickerChange(e){
    let index = e.detail.value
    if (app.globalData.userInfo.uuid != this.data.anchorList[index].anchorUuid) {
      wx.navigateTo({
        url: '../chat/chat?otheruuid=' + this.data.anchorList[index].anchorUuid + '&othername=' + this.data.anchorList[index].anchorName
      })
    }      
  },

  //页面跳转至聊天界面
  enterPage(e) {
    let { url,type} = e.currentTarget.dataset
    if(type==1){
      if (app.globalData.userInfo.uuid != this.data.anchorList[0].anchorUuid){
        wx.navigateTo({
          url: '../chat/chat?otheruuid=' + this.data.anchorList[0].anchorUuid + '&othername=' + this.data.anchorList[0].anchorName
        })
      }
    }else{
      wx.navigateTo({
        url: url + '?otheruuid=' + this.data.otheruuid + '&othername=' + this.data.othername
      })
    }
  },

  //加载直播节目详情
  loadDetail(){
    api.request({
      url: Url.chatroomProgramDetail,
      data:{
        uuid:this.data.uuid,
        userUuid:app.globalData.userInfo.uuid
      },
      success:res=>{
        let programDetail = res.data.program
        let anchorList = this.data.anchorList
        let obj={}
        obj.anchorName=programDetail.anchorName
        obj.anchorUuid=programDetail.anchorUuid
        anchorList.push(obj)
        this.setData({
          programDetail,anchorList,
          title: programDetail.chatroomName + ' ' + programDetail.frequencyModulation,
          playerImg: programDetail.imgUrl
        })
        // this.playAudio()
        app.globalData.playingProgram={}
      }
    })
  },

  //直播历史记录
  getChatRoomContent(){
    this.setData({
      pageNum: this.data.pageNum + 1
    })
    wx.showLoading()
    api.request({
      url: Url.getChatRoomContent,
      data:{
        roomUuid:this.data.uuid,
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      },
      success:res=>{
        let msgList = this.data.msgList
        msgList.unshift(...res.data.page.records.reverse())
        this.setData({
          pages: res.data.page.pages,
          msgList
        })
        if (this.data.pageNum == this.data.pages) {
          this.setData({
            isNoMore: true
          })
        }
        wx.hideLoading()
      }
    })
  },

  //触摸开始
  touchstart(e) {
    startY = e.touches[0].pageY
    moveFlag = true;
  },
  //触摸移动
  touchmove(e) {
    endY = e.touches[0].pageY
    if (endY - startY > 80) {
      if (this.data.pageNum < this.data.pages) {
        this.setData({
          showTips: true,
          isRefresh: true
        })
        moveFlag = false
      }
    }
  },
  //触摸结束
  touchend(e) {
    moveFlag = true
    this.setData({
      showTips: false
    })
    if (this.data.pageNum < this.data.pages && this.data.isRefresh) {
      this.getChatRoomContent()
    }
    this.setData({
      isRefresh: false
    })
  },

  //播放音频
  playAudio(){
    //首先清除全局可能在播放的电台节目
    app.globalData.playingProgram={}
    myAudio.showPlayer = true
    myAudio.isPlay = true
    // myAudio.playerImg = this.data.trafficChat ? this.data.trafficChat.imgUrl:this.data.playerImg
    myAudio.playerImg = this.data.playerImg
    // myAudio.title = this.data.trafficChat ? this.data.title:this.data.programDetail.programName
    myAudio.title = this.data.programDetail.programName
    myAudio.url = '/pages/studio/studio?title=' + this.data.title + '&uuid=' + this.data.uuid + '&imgurl=' + this.data.playerImg
    // myAudioManager.title = this.data.trafficChat ? this.data.title :this.data.programDetail.programName
    myAudioManager.title = this.data.programDetail.programName
    // myAudioManager.src = this.data.trafficChat ? this.data.trafficChat.audioUrl:this.data.programDetail.audioUrl
    myAudioManager.src = this.data.programDetail.audioUrl
    // myAudioManager.src = 'https://gulong.smartmapdt.com/mp3/output.mp3'
    // setTimeout(()=>{
    //   console.log('duration', myAudioManager.duration, myAudioManager)
    //   myAudioManager.seek(myAudioManager.duration-10)
    // },500)
  },

  //创建webSocket连接
  webSocket(){
    SocketTask = wx.connectSocket({
      // url: this.data.trafficChat ? 'ws://abc.smartmapdt.com/itingxm/websocket/traffic/' + this.data.trafficChat.uuid + '/' + app.globalData.userInfo.uuid :'ws://abc.smartmapdt.com/itingxm/websocket/chatroom/'+this.data.uuid+'/'+app.globalData.userInfo.uuid,
      url: 'wss://abc.smartmapdt.com/itingxm/websocket/chatroom/'+this.data.uuid+'/'+app.globalData.userInfo.uuid,
      header: {
        'content-type': 'application/json'
      },
      method: "GET",
      success: res => {
        console.log('socket接口调用', res)
      },
      fail: res => {
        console.log('失败', res)
      }
    })
  },

  //发送信息
  sendMsg() {
    var reg=/^\s*$/g;
    if(reg.test(this.data.inputValue)||this.data.inputValue==''){
      wx.showToast({
        title: '不能发送空内容！',
        icon:'none'
      })
      return
    }
    api.wxMsgCheck({
      data:{
        content:this.data.inputValue
      },
      success:res=>{
        if(res.data.code==0){
          if (SocketTask.readyState == 1) {
            SocketTask.send({
              data: this.data.inputValue,
              success: res => {
                console.log('发送成功', res)
                this.setData({
                  inputValue: ''
                })
                if (this.data.trafficChat) {
                  api.addIntegral({//增加积分
                    data: {
                      userId: app.globalData.userInfo.id,
                      ruleId: 29
                    },
                    success: res => {
                      if (res.data.code == 0) {
                        wx.showToast({
                          title: '路况刷刷来 +1',
                          icon: 'none'
                        })
                      }
                    }
                  })
                }
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
            this.setData({ doClose: true })
            SocketTask.close({
              success: res => {
                console.log('关闭WebSocket连接', res)
              }
            })
            this.webSocket()
            console.log(SocketTask.readyState)
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
    let { scene, uuid } = options
    if (scene == undefined) {
      this.setData({
        uuid
      })
    } else {
      scene = decodeURIComponent(options.scene)
      let arr = scene.split('&')
      this.setData({
        uuid: arr[1]
      })
    }
    
    /*let { scene, uuid } = options
    if (scene == undefined) {
      scene = decodeURIComponent(options.scene)
      this.setData({
        uuid: options.uuid,
        trafficChat: app.globalData.trafficChat
      })
    } else {
      let arr = scene.split('&')
      this.setData({
        uuid: arr[1],
        trafficChat: app.globalData.trafficChat
      })
    }*/
    
    // if(this.data.trafficChat){
    //   this.setData({
    //     programDetail: this.data.trafficChat
    //   })
    //   this.playAudio()
    //   app.globalData.playingProgram = {}
    // }else{
    //   this.loadDetail()
    // }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.audioCtx = wx.createAudioContext('myAudio')
    this.audioCtx.play()
    // if (this.data.msgList.length==0){
    //   this.webSocket()
    // }
    SocketTask.onOpen(res=>{
      console.log('监听 WebSocket 连接打开事件。',res)
    })
    SocketTask.onClose(onClose => {
      console.log('监听 WebSocket 连接关闭事件。', onClose)
      if(!this.data.doClose){this.webSocket()}
    })
    SocketTask.onError(onError => {
      console.log('监听 WebSocket 错误。错误信息', onError)
    })
    SocketTask.onMessage(res=>{
      console.log('监听 WebSocket 接受到服务器的消息事件',res)
      let info=JSON.parse(res.data)
      if(info.type==1){
        this.setData({
          chatInfo:info
        })
      }else{
        let msgList=this.data.msgList
        msgList.push(info)
        this.setData({msgList})
      }
      this.setData({
        scrollTop: this.data.msgList.length*300
      })
      console.log('msgList',this.data.msgList)
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      isNoMore: false,
      pageNum: 0,//从1开始
      pageSize: 8,
      pages: 0, //总页数
      anchorList: [],
      msgList: [] //实时消息列表
    })
    if (!app.globalData.userInfo) {
      api.loadRequest({
        app
      }).then(({ userInfo }) => {
        app.globalData.userInfo = userInfo
        this.setData({ 
          userInfo,
          trafficChat: app.globalData.trafficChat
        })
        this.loadDetail()
        this.webSocket()
        this.getChatRoomContent()
      })
    } else {
      this.setData({
        userInfo: app.globalData.userInfo,
        trafficChat: app.globalData.trafficChat
      })
      this.loadDetail()
      this.webSocket()
      this.getChatRoomContent()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({ doClose: true })
    SocketTask.close({
      success: res => {
        console.log('关闭WebSocket连接', res)
      }
    })
    this.setData({
      trafficChat: null
    })
    app.globalData.trafficChat = null
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.setData({ doClose: true })
    SocketTask.close({
      success: res => {
        console.log('关闭WebSocket连接', res)
      }
    })
    this.setData({
      trafficChat: null
    })
    app.globalData.trafficChat=null
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

  // 分享按钮
  sharepopup() {
    this.setData({
      isShare: true,
      isShow: true
    })
    api.request({
      url: Url.chatProgramQrCode,
      data: {
        mobileUserId: app.globalData.userInfo.id,
        objectId: this.data.uuid,
        // model:'RadioActivity', 
        // field:'activity_qrcode_img',
        page: 'pages/studio/studio'
      },
      success: res => {
        this.setData({
          ewm: res.data.qrCodeUrl
        })
        this.addLikeOrForward({
          type: 2,
          success: res => {
            if(res.data.code==0){
              let programDetail = this.data.programDetail
              programDetail.forwardNum++
              this.setData({ programDetail})
            }
          }
        })
      }
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var str, title, imageUrl
    title = '邀请您加入i听厦门！'
    str = '/pages/studio/studio?uuid=' + this.data.uuid
    return {
      title,
      path: str
    }
  },
  sharePyq() {
    wx.showLoading({
      title: '卡片生成中...'
    })
    console.log('1')
    this.setData({
      template: {
        width: '375px',
        height: '510px',
        background: '#FEF9EF',
        views: [
          {
            type: 'rect',
            css: {
              top: '26px',
              width: '335px',
              height: '306px',
              background: '#ffffff',
              borderRadius: '8px',
              align: 'center',
              left: '375rpx'
            }
          },
          {
            type: 'image',
            url: '../../images/logo.png',
            css: {
              top: '35px',
              left: '34px',
              width: '40px',
              height: '40px',
              borderRadius: '20px'
            }
          },
          {
            type: 'image',
            url: '../../images/shareImg.jpg',
            css: {
              top: '80px',
              left: '34px',
              width: '307px',
              height: '226px'
            }
          },
          {
            type: 'rect',
            css: {
              top: '346px',
              background: '#ffffff',
              borderRadius: '8px',
              align: 'center',
              left: '375rpx',
              width: '345px',
              height: '112px',

            }
          },
          {
            type: 'image',
            url: this.data.ewm,
            css: {
              top: '358px',
              right: '30px',
              width: '88px',
              height: '88px'
            }
          },
          // {
          //   type: 'image',
          //   url: app.globalData.userInfo.avatarImageUrl,
          //   css: {
          //     top: '382px',
          //     right: '54px',
          //     width: '40px',
          //     height: '40px',
          //     borderRadius: '20px'
          //   }
          // },
          {
            type: 'text',
            text: app.globalData.userInfo.nickName,
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
            text: '“邀请您加入i听厦门”',
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
    wx.saveImageToPhotosAlbum({
      filePath: e.detail.path,
      success: res => {
        wx.showToast({
          title: '已保存到系统相册'
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  preventEvent() { }

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //   this.addLikeOrForward({
  //     type: 2,
  //     success: res => {
  //       console.log('转发', res)
  //       let newProgramDetail = this.data.programDetail
  //       ++newProgramDetail.forwardNum
  //       this.setData({
  //         programDetail: newProgramDetail
  //       })
  //     }
  //   })
  //   return {
  //     title:this.data.title
  //   }
  // }
})