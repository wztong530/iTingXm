// pages/discover_detail/discover_detail.js
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
    title:'',
    isBack:true,
    isBgColor:true,
    isShare: false,
    isShow: false,
    ewm: '',//二维码
    activityId:'',
    activityDetail:{},
    avatarImageList:[] //头像列表
  },



  //报名参与
  enterPage(e){
    wx.navigateTo({
      url: '../apply_form/apply_form?prompt='+e.currentTarget.dataset.prompt+'&id='+this.data.activityId
    })
  },

  //加载活动详情
  loadActivityDetail(){
    api.request({
      url: Url.activityDetail,
      data:{
        mobileUserId:app.globalData.userInfo.id,
        activityId: this.data.activityId
      },
      success:res=>{
        let activityDetail = res.data.activity
        activityDetail.content = activityDetail.content.replace(/\<img/g, '<img style="max-width:100%;height:auto;display:block;"')
        let newAvatarImageList = activityDetail.avatarImageList.slice(0, 3)
        this.setData({
          activityDetail,
          avatarImageList: newAvatarImageList
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {scene,id}=options
    if(scene==undefined){
      this.setData({
        activityId:id
      })
    }else{
      scene = decodeURIComponent(options.scene)
      let arr = scene.split('&')
      this.setData({
        activityId:arr[1]
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
    if (!app.globalData.userInfo) {
      api.loadRequest({
        app
      }).then(({ userInfo }) => {
        app.globalData.userInfo = userInfo
        this.loadActivityDetail()
      })
    }else{
      this.loadActivityDetail()
    }
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

  },

  // /**
  //  * 用户点击右上角分享
  //  */
  // 分享按钮
  sharepopup() {
    this.setData({
      isShare: true,
      isShow: true
    })
    api.request({
      url: Url.activityQrCode,
      data: {
        mobileUserId: app.globalData.userInfo.id,
        objectId: this.data.activityDetail.id,
        // model:'RadioActivity', 
        // field:'activity_qrcode_img',
        page: 'pages/discover_detail/discover_detail'
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
    str = '/pages/discover_detail/discover_detail?id=' + this.data.activityId
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