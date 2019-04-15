
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
    title:'渠道商端',
    isShowCommission:false,
    isShare:false,
    isShow:false,
    user:null,
    notice:[]
  },
  preventEvent(){},
  // 分享按钮
  sharepopup() {
    // wx.navigateTo({
    //   url: '../invitation/invitation',
    // })
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
  /**
 * 咨询弹层关闭
 */
  closePopup() {
    this.animation.backgroundColor('rgba(0,0,0,0)').step()
    this.animation2.translateY('100%').step()
    this.setData({
      popupFade: this.animation.export(),
      popSlide: this.animation2.export()
    })
    setTimeout(() => {
      this.setData({
        customerService: false
      })
    }, 300)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
        type:options.type,
        user:app.globalData.userInfo
      })
      this.load(options)
  },
  onShow(){
    if(this.data.type == 3){
      this.setData({
        data:app.globalData.qyInfo
      })
    }
  },
  // 初始数据加载
  load(options){
    var type = this.data.type,url,title,postData
    switch (type) {
      case '2': //网点端
        var info = app.globalData.curBranchesInfo,allInfo = app.globalData.branchesInfo
        console.log(info)
        postData = {
          branchesId:info.id
        }
        this.setData({
          title:'网点端',
          allInfo,
          infoIndex:0,
          info
        })
        this.requestTwo(postData)
        break
      case '3': //企业端
        var data = JSON.parse(options.data),role = data.role     
        this.role = role 
        this.setData({
          title: '企业端',
          degree:role == 1 ?'管理员':'员工',
          data
        })
        break
      case '4':
        this.setData({
          title: '团长端',
          degree:'管理员'
        })
        this.requestThree()
        break
    }
  },
  backindex() {
    wx.reLaunch({
      url: '../index/index'
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease'
    })
    this.animation2 = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease'
    })
  },
  onShareAppMessage() {
    var me = this;
    var str = '/pages/index/index'
    return {
      path: str,
      imageUrl: '/images/bcyy@3x.svg',
      success(res) {

      },
      fail(res) {

      }
    }
  },
  enterPage(e){
    let {url,status} = e.currentTarget.dataset,data = this.data,type = data.type
    //status表示是否需要带数据   1代表需要
    switch(type){
      case '2':
        break;
      case '3':
        if(status == 1){
          wx.navigateTo({
            url:url+'?data='+JSON.stringify(this.data.data)
          })
          return
        }
        break;
      case '4':
        if (status == 1) {
          wx.navigateTo({
            url: url + '?data=' + JSON.stringify(this.data.data)
          })
          return
        }
        break;
    }
    wx.navigateTo({
      url
    })
  },
  //网点端逻辑
  tabClick(e){
    console.log(e)
    var { value } = e.detail, data = app.globalData.branchesInfo[value]
    this.setData({
      infoIndex:value,
      info:data
    })
    this.requestTwo({
      branchesId:data.id
    })
    app.globalData.curBranchesInfo = data
  },
  requestTwo(postData){
    api.request({
      data: postData,
      url: Url.branchesInfo,
      success: (res) => {
        this.setData({
          data: res.data.data
        })
      }
    })
  },
  //企业端逻辑
  qyOrder(){
    if(this.role == 1 ){
      wx.navigateTo({
        url: '../branchesOrder/branchesOrder?type=1&data=' + JSON.stringify(this.data.data),
      })
    } else {
      wx.navigateTo({
        url: '../qyOrder/qyOrder',
      })
    }
  },
  // 团长端逻辑
  requestThree(){
    api.request({
      url: Url.tzInfo,
      data:{
        uid:app.globalData.userId
      },
      success:(res)=>{
        console.log(res)
        this.setData({
          data:res.data.data
        })
      }
    })
    api.request({
      url:Url.notice,
      data:{
        type:1
      },
      success:res=>{
        console.log(res)
        this.setData({
          notice:res.data.data
        })
      }
    })
  },
  showCommission(){
    this.setData({
      isShowCommission: true
    })
  },
  hideCommission(){
    this.setData({
      isShowCommission: false
    })
  },
  onShareAppMessage(e) {
    if(this.data.type != 4)return
    var str, title, imageUrl
    title = '邀请您来古龙嘀膳用餐!'
    str = '/pages/invitation/invitation?user='+JSON.stringify(app.globalData.userInfo)
    imageUrl = '/images/index.jpg'
    return {
      title,
      path: str,
      imageUrl,
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