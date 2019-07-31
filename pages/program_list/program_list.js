// pages/program_list/program_list.js
import {
  config,
  Url
} from '../../utils/config.js'
import {
  Request
} from '../../utils/request.js'
var api = new Request()
var app = getApp()
var myAudio = app.globalData.audioManager
var myAudioManager = myAudio.manager

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '节目列表',
    isBack: true,
    userInfo:null,
    programdetail:{},
    programsList:[],//服务器响应节目列表
    newprogramsList:[],//页面显示节目列表
    offset: -1, //从0开始
    size: 10,
    totalPage: 0,
    isNoMore: false,
    playingProgram:{},//正在播放的节目
    isplay:false,
    id:'',//电台id
    way:null,//点击路径 1为从主播端进入
    ewm: ''//二维码
  },

  //点赞节目
  likePrograms(e){
    let { id, likestatus,likenum,type}=e.currentTarget.dataset
    api.request({
      url: Url.likePrograms,
      data: {
        objectId: id,
        mobileUserId: app.globalData.userInfo.id,
        delFlag: likestatus
      },
      success: res => {
        if(res.data.code==0){
          if (likestatus == 1){
            likenum--;
            likestatus = 0
          }else{
            likenum++;
            likestatus = 1
          }
          if(type==1){//正在播放的节目
            let playingProgram=this.data.playingProgram
            playingProgram.likeNum=likenum
            playingProgram.likeStatus=likestatus
            this.setData({playingProgram})
            app.globalData.playingProgram = playingProgram
          }else{//节目列表的节目
            let newprogramsList = this.data.newprogramsList
            newprogramsList.forEach((item,i,arr)=>{
              if (item.id == id){
                arr[i].likeNum = likenum
                arr[i].likeStatus = likestatus
              }
            })
            this.setData({ newprogramsList})
          }
        }
        wx.showToast({
          title: likestatus == 1 ? '点赞成功' : '已取消点赞',
          duration: 1500,
          mask: true,
          icon: 'none'
        })
      }
    })
  },

  //删除节目
  deleteItem(e) {
    let {index,id} = e.currentTarget.dataset,
      newprogramsList = this.data.newprogramsList
    wx.showModal({
      title: '确定删除吗？',
      confirmColor: '#FF6928',
      success: res => {
        if (res.confirm) {
          //删除功能[objectId=,flag=program/dynamic]
          api.request({
            url: Url.frontDelete,
            data:{
              objectId:id,
              flag:'program'
            },
            success:res=>{
              if(res.data.code=='0'){
                newprogramsList.splice(index, 1)
                this.setData({
                  newprogramsList
                })
              }
            }
          })    
        }
      }
    })
  },

  //分页加载电台节目列表
  loadProgramsList() {
    this.setData({
      offset: this.data.offset + 1
    })
    wx.showLoading()
    api.request({
      url: Url.programsList,
      data: {
        offset: this.data.offset,
        size: this.data.size,
        radioCategoryId:this.data.id,
        mobileUserId:app.globalData.userInfo.id
      },
      success: res => {
        if(res.data.code==0){
          this.setData({
            programsList: this.data.programsList.concat(res.data.programsList),
            totalPage: res.data.totalPage
          })
          this.updateProgramsList()
          wx.hideLoading()
          if (this.data.offset == this.data.totalPage - 1) {
            this.setData({
              isNoMore: true
            })
          }
        }   
      }
    })
  },

  //更新节目列表
  updateProgramsList(){
    var arrs = [].concat(this.data.programsList), 
      newprogramsList,index,
      targetId=this.data.playingProgram.id;
    if(arrs.some(item => item.id == targetId)){
      arrs.forEach((item,i,arr)=>{
        if (item.id == targetId){
          index = i
        }
      })
      arrs.splice(index, 1)
      newprogramsList = arrs
    }else{
      newprogramsList = arrs
    }
    this.setData({ newprogramsList})
  },

  //更新节目播放量
  updatePlayNum(){
    api.request({
      url: Url.playNum,
      data:{
        id:this.data.playingProgram.id,
        radioCategoryId: this.data.playingProgram.radioCategoryId
      },
      success:res=>{
        if(res.data.code==0){
          let playingProgram = this.data.playingProgram
          playingProgram.playNum++
          this.setData({
            playingProgram
          })
          this.data.programsList.forEach((item, i, arr) => {
            if (item.id == this.data.playingProgram.id) {
              arr[i].playNum++
            }
          })
        }
      }
    })
  },

  //列表循环播放控件
  loopPlay(playingProgram){
    this.setData({
      playingProgram,
      isplay: true
    })
    app.globalData.playingProgram = playingProgram
    this.updatePlayNum()
    this.updateProgramsList()
    this.playAudio()
    //全局保存正在播放的电台id，当再次返回此页时显示正在播放的节目
    app.globalData.radioCategoryId = this.data.id
    //利用本地缓存判断是否当天已经听过了这个节目
    wx.setStorage({
      key: '',
      data: '',
    })
    api.addIntegral({//增加积分
      data: {
        userId: app.globalData.userInfo.id,
        ruleId: 22
      },
      success: res => {
        if (res.data.code == 0) {
          wx.showToast({
            title: '听一听 +1',
            icon: 'none'
          })
        }
      }
    })
  },
  //循环播放判定条件
  judgeApi(){
    let programsList = this.data.programsList, newIndex
    programsList.forEach((item, i, arr) => {
      if (item.id == app.globalData.playingProgram.id) {
        if (i == programsList.length - 1) {
          newIndex = 0
        } else {
          newIndex = i + 1
        }
      }
    })
    this.loopPlay(programsList[newIndex])
  },
  //播放
  handlePlay(e){
    let index=e.currentTarget.dataset.index
    this.loopPlay(this.data.newprogramsList[index])
    myAudioManager.onEnded(()=>{
      this.judgeApi()
    })
    myAudioManager.onError(()=>{
      this.judgeApi()
    })
  },

  //控制正在播放的播放器
  controlPlayer(e){
    let id= e.currentTarget.dataset.id
    if (this.data.isplay){
      myAudioManager.pause()
      myAudio.isPlay = false
      this.setData({
        isplay: false
      })
    }else{
      myAudioManager.play()
      myAudio.isPlay = true
      this.setData({
        isplay: true
      })
      this.updatePlayNum()
    }
  },

  //播放音频
  playAudio() {
    myAudio.showPlayer = true
    myAudio.isPlay = true
    myAudio.playerImg = app.globalData.playingProgram.imgUrl
    myAudio.title = app.globalData.playingProgram.programsTitle
    myAudio.url='/pages/program_list/program_list?id='+this.data.id
    myAudioManager.title = app.globalData.playingProgram.programsTitle
    myAudioManager.src = app.globalData.playingProgram.fileUrl
  },

  //跳转页面
  enterPage(e) {
    console.log(e)
    let {id,url} = e.currentTarget.dataset
    if(id){
      wx.navigateTo({
        url: url + '?id=' + id
      })
    }else{
      wx.navigateTo({
        url
      })
    }
  },

  //加载节目列表详情
  loadcategoryDetail(){
    api.request({
      url: Url.categoryDetail,
      data:{
        categoryId:this.data.id,
        loginUserId:app.globalData.userInfo.id
      },
      success:res=>{
        if(res.data.code==0){
          this.setData({
            programdetail: res.data.category
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { scene, id, way } = options
    if (scene == undefined) {
      this.setData({
        id,
        way: way ? way : null
      })
    } else {
      scene = decodeURIComponent(options.scene)
      let arr = scene.split('&')
      this.setData({
        id: arr[1],
        way: way ? way : null
      })
    }
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      programsList: [],//服务器响应节目列表
      offset: -1, //从0开始
      size: 10,
      totalPage: 0,
      isNoMore: false
    })
    if (!app.globalData.userInfo) {
      api.loadRequest({
        app
      }).then(({ userInfo }) => {
        app.globalData.userInfo = userInfo
        this.setData({ userInfo })
        this.loadcategoryDetail()
        this.loadProgramsList()
      })
    } else {
      this.setData({
        userInfo: app.globalData.userInfo
      })
      this.loadcategoryDetail()
      this.loadProgramsList()
    }
    if (app.globalData.radioCategoryId == this.data.id){
      this.setData({
        playingProgram: app.globalData.playingProgram,
        isplay: myAudio.isPlay
      })
    }
    // if (app.globalData.playingProgram.id){
    //   this.setData({
    //     playingProgram: app.globalData.playingProgram,
    //     isplay: myAudio.isPlay
    //   })
    // }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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
    if (this.data.offset < this.data.totalPage - 1) {
      this.loadProgramsList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  // 分享按钮
  sharepopup() {
    this.setData({
      isShare: true,
      isShow: true
    })
    api.request({
      url: Url.categoryQrCode,
      data: {
        mobileUserId: app.globalData.userInfo.id,
        objectId: this.data.id,
        // model:'RadioActivity', 
        // field:'activity_qrcode_img',
        page: 'pages/program_list/program_list'
      },
      success: res => {
        this.setData({
          ewm: res.data.qrCodeUrl
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
    str = '/pages/program_list/program_list?id=' + this.data.id
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
})