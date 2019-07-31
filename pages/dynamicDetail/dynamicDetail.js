// pages/dynamicDetail/dynamicDetail.js
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
    title: '详情',
    isBack: true,
    id:'',
    detail:{},
    userInfo:null,
    ewm: ''//二维码
  },

  //删除动态
  deleteItem() {
    wx.showModal({
      title: '确定删除吗？',
      confirmColor: '#FF6928',
      success: res => {
        if (res.confirm) {
          //删除功能[objectId=,flag=program/dynamic]
          api.request({
            url: Url.frontDelete,
            data: {
              objectId: this.data.id,
              flag: 'dynamic'
            },
            success: res => {
              if (res.data.code == 0) {
                wx.navigateBack({
                  delta:1
                })
              }
            }
          })
        }
      }
    })
  },

  //点赞动态
  likeDynamic() {
    api.request({
      url: Url.likeDynamic,
      data: {
        dynamicId: this.data.id,
        userId: app.globalData.userInfo.id
      },
      success: res => {
        if (res.data.code == 0) {
          let detail = this.data.detail
          detail.likeNum = detail.isLike ? --detail.likeNum : ++detail.likeNum
          detail.isLike = detail.isLike ? false : true
          this.setData({ detail })
        }
      }
    })
  },

  //页面跳转
  enterPage(e) {
    let { url, index, len, imgurl } = e.currentTarget.dataset
    wx.navigateTo({
      url: url+'?len='+len+'&index='+index+'&imgurl='+imgurl
    })
  },

  //时间格式转换 20190706120146 -> 07/06 12:01
  timeFormat(t) {
    return t.slice(4, 6) + '/' + t.slice(6, 8) + ' ' + t.slice(8, 10) + ':' + t.slice(10, 12)
  },

  //加载详情页面
  loadDetailDynamic(){
    api.request({
      url: Url.detailDynamic,
      data:{
        id:this.data.id,
        userId:app.globalData.userInfo.id
      },
      success:res=>{
        if(res.data.code==0){
          let detail=res.data.detail
          detail.createDate=this.timeFormat(detail.createDate)
          this.setData({
            detail
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { scene, id } = options
    if (scene == undefined) {
      this.setData({
        id
      })
    } else {
      scene = decodeURIComponent(options.scene)
      let arr = scene.split('&')
      this.setData({
        id: arr[1]
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
        this.setData({ userInfo})
        this.loadDetailDynamic()
      })
    } else {
      this.setData({ 
        userInfo:app.globalData.userInfo
      })
      this.loadDetailDynamic()
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
      url: Url.dynamicQrCode,
      data: {
        mobileUserId: app.globalData.userInfo.id,
        objectId: this.data.id,
        // model:'RadioActivity', 
        // field:'activity_qrcode_img',
        page: 'pages/dynamicDetail/dynamicDetail'
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
    str = '/pages/dynamicDetail/dynamicDetail?id=' + this.data.id
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