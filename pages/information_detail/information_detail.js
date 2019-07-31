// pages/information_detail/information_detail.js
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
    title:'资讯',
    isBack:true,
    isShare: false,
    isShow: false,
    ewm: '',//二维码
    newsDetail:{}
  },

  

  //点赞
  likeNews() {
    api.request({
      url: Url.likeNews,
      data:{
        objectId:this.data.newsDetail.id,
        mobileUserId: app.globalData.userId,
        delFlag: this.data.newsDetail.likeStatus
      },
      success:res=>{
        let newNewsDetail=this.data.newsDetail
        newNewsDetail.likeStatus = newNewsDetail.likeStatus == 1 ? 0 : 1
        this.setData({
          newsDetail: newNewsDetail
        })
        wx.showToast({
          title: this.data.newsDetail.likeStatus == 1 ? '点赞成功' : '已取消点赞',
          duration: 1500,
          mask: true,
          icon: 'none'
        })
      }
    })
  },

  //加载资讯详情
  loadNewsDetail(){
    api.request({
      url:Url.newsDetail,
      data:{
        mobileUserId:app.globalData.userInfo.id,
        newsId:this.data.newsId
      },
      success:res=>{
        let newsDetail=res.data.news
        newsDetail.content=newsDetail.content.replace(/\<img/g,'<img style="max-width:100%;height:auto;display:block;margin:2px 0;"')
        this.setData({
          newsDetail
        })
        console.log(this.data.newsDetail)
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('scene',options.scene)
    let { scene, id } = options
    if (scene == undefined) {
      this.setData({
        newsId: id
      })
    } else {
      scene = decodeURIComponent(options.scene)
      console.log('9999',scene)
      let arr = scene.split('&')
      this.setData({
        newsId: arr[1]
      })
    }
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    api.addIntegral({//增加积分
      data: {
        userId: app.globalData.userInfo.id,
        ruleId: 21
      },
      success: res => {
        if(res.data.code==0){
          wx.showToast({
            title: '读一读 +1',
            icon:'none'
          })
        }
      }
    })
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
        this.loadNewsDetail()
      })
    } else {
      this.loadNewsDetail()
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
      url: Url.newsQrCode,
      data: {
        mobileUserId: app.globalData.userInfo.id,
        objectId: this.data.newsDetail.id,
        // model:'RadioNews',
        // field:'news_qrcode_img',
        page: 'pages/information_detail/information_detail'
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
    str = '/pages/information_detail/information_detail?id=' + this.data.newsId
    return {
      title,
      path: str,
      success:(res)=>{
        console.log('转发成功',res)
      },
      fail:(res)=>{
        console.log('转发失败',res)
      }
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