// pages/picturePreview/picturePreview.js
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
    title: '',
    isBack: true,
    isBgColor:true,
    imgurl:'',
    openSettingBtnHidden:true,
    showSave:false
  },

  //保存图片
  saveImg(){
    let that=this
    wx.getSetting({//获取相册授权
      success:res=>{
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              //这里是用户同意授权后的回调
              that.setData({
                showSave:true
              })
            },
            fail() {//这里是用户拒绝授权后的回调
              that.setData({
                openSettingBtnHidden: false
              })
            }
          })
        } else {//用户已经授权过了
          that.setData({
            showSave: true
          })
        }
      }
    })
  },
  //保存图片到本地
  saveImgToLocal(){
    wx.showLoading({
      title: '正在保存...'
    })
    wx.downloadFile({
      url: this.data.imgurl,
      success: res=>{
        //图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: res2=>{
            wx.hideLoading()
            this.setData({
              showSave: false
            })
            wx.showToast({
              title: '保存成功',
              icon: 'none',
              duration: 2000
            })
          }
        })
      }
    })
  },
  //取消保存图片
  cancelSave(){
    this.setData({
      showSave: false
    })
  },
  // 授权
  handleSetting(e){
    let that = this
    // 对用户的设置进行判断，如果没有授权，即使用户返回到保存页面，显示的也是“去授权”按钮；同意授权之后才显示保存按钮
    if (!e.detail.authSetting['scope.writePhotosAlbum']) {
      // wx.showModal({
      //   title: '警告',
      //   content: '若不打开授权，则无法将图片保存在相册中！',
      //   showCancel: false
      // })
      that.setData({
        openSettingBtnHidden: false
      })
    } else {
      // wx.showModal({
      //   title: '提示',
      //   content: '您已授权，赶紧将图片保存在相册中吧！',
      //   showCancel: false
      // })
      that.setData({
        openSettingBtnHidden: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { url, index, len, imgurl }=options
    this.setData({
      title:parseInt(index)+1+'-'+len,
      imgurl
    })
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
  onShareAppMessage: function () {

  }
})