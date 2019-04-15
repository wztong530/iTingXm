import {
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
    title: '订单',
    orderlist: [], //订单列表
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.data) {
      let data = JSON.parse(options.data)
      if (data.isBack) {
        this.setData({
          pages: data.pages,
          isBack: data.isBack
        })
      }
    }
    this.firstrequest = true
    this.loaddata()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  onShow() {
    if (this.firstrequest) return
    this.loaddata()
  },
  //初始数据
  loaddata() {
    if (!app.globalData.userId) return
    wx.showLoading()
    let postData = {
      mobileUserId: app.globalData.userId
    }
    api.request({
      data: postData,
      url: Url.orderlist,
      success: res => {
        console.log(res)
        wx.hideLoading()
        this.firstrequest = false
        var data = res.data.data
        this.setData({
          orderlist: data
        })
      },
      fail: err => {
        wx.hideLoading()
      }
    })
  },
  /**
   * 用户交互事件
   */

  // 分享按钮
  sharepopup(e) {
    // wx.showToast({
    //   title: '业务扩展中。。。',
    //   icon:'none'
    // })
    this.index = e.currentTarget.dataset.index
    this.setData({
      isShare: true,
      isShow: true
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
  //跳转页面
  enterpage(e) {
    var {
      index
    } = e.currentTarget.dataset,
      data = this.data.orderlist[index]

    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderType=' + data.orderType + '&orderNo=' + data.orderNo,
    })
  },
  //联系骑手
  call(e){
    var { index } = e.currentTarget.dataset, data = this.data.orderlist[index].mallOrder.transporterPhone
    wx.makePhoneCall({
      phoneNumber: data //仅为示例，并非真实的电话号码
    })
  },
  //分享相关
  onShareAppMessage(e) {
    var str, title, imageUrl, data = this.data.orderlist[this.index], gooddata = data.mallGoodsList[0]
      gooddata.bookTime = data.mallOrder.bookTime
    title = '邀请您来古龙嘀膳用餐'
      str = '/pages/assembleDetail/assembleDetail?isShare=true&orderNo=' + JSON.stringify(data.orderNo) + '&data=' + JSON.stringify(gooddata)
    imageUrl = '/images/index.jpg' 
      console.log(str)
    return {
      title,
      path: str,
      imageUrl,
      success(res) {

      },
      fail(res) {

      }
    }
  },
  /**
 * 画分享图片图
 */
  sharePyq() {
    wx.showLoading({
      title: '卡片生成中...'
    })
    this.setData({
      template: {
        width: '375px',
        height: '510px',
        background: '#FEF9EF',
        views: [
          {
            type: 'image',
            url: '/images/tp@2x.png',
            css: {
              top: '26px',
              left: '7px',
              width: '361px',
              height: '306px'
            }
          },
          {
            type: 'image',
            url: '/images/bzxg.png',
            css: {
              top: '80px',
              left: '34px',
              width: '307px',
              height: '226px'
            }
          },
          {
            type: 'image',
            url: '/images/Rectangle@3x-min.png',
            css: {
              top: '346px',
              right: '15px',
              width: '345px',
              height: '112px'
            }
          },
          {
            type: 'image',
            url: '/images/glxcxm.jpg',
            css: {
              top: '358px',
              right: '30px',
              width: '88px',
              height: '88px'
            }
          },

          {
            type: 'text',
            text: app.globalData.userInfo.wechatName,
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
            text: '“邀请您加入古龙嘀膳”',
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
  },
  preventEvent() { }

})