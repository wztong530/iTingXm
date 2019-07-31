// pages/releaseDynamic/releaseDynamic.js
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
    title:'发布动态',
    isBack:true,
    coverImg:'',
    content:'',
    imgList:[],
    imgsId:[]
  },

  //获取输入内容
  getInput(e) {
    this.setData({
      content: e.detail.value
    })
  },

  //选择图片
  chooseImg(){
    wx.chooseImage({
      count: 9 - this.data.imgList.length,
      success: res=>{
        const tempFilePaths = res.tempFilePaths
        let imgList=this.data.imgList
        imgList.push(...tempFilePaths)
        this.setData({
          imgList
        })
        for (let item of tempFilePaths){
          wx.uploadFile({
            url: config.url + Url.uploadFile,
            filePath: item,
            header: {
              "Content-Type": "multipart/form-data",
              'accept': 'application/json',
            },
            name: 'dynamic',
            formData: {
              'type': 'image',
              'model': 'RadioDynamic',
              'field': 'advert_cover_picture'
            },
            success:res2=>{
              let imgsId = this.data.imgsId
              imgsId.push(res2.data)
              this.setData({
                imgsId
              })
              console.log('图片上传', res2,this.data.imgsId)
            }
          })
        }
        
      }
    })
  },

  //添加动态
  addDynamic(){
    var reg = /^\s*$/g;
    if (reg.test(this.data.content) || this.data.content == '') {
      wx.showToast({
        title: '请填写动态内容',
        icon: 'none',
        duration:2000,
        mask:true
      })
      return;
    }
    wx.showLoading({
      title: '正在发布动态',
      mask:true
    })
    api.request({
      url: Url.publicDynamic,
      data:{
        userId:app.globalData.userId,
        content:this.data.content,
        imgId:this.data.imgsId.join(',')
      },
      success:res=>{
        wx.hideLoading()
        if(res.data.code==0){
          wx.showToast({
            title: '动态发布成功',
            icon:'loading',
            mask:true,
            duration:2000,
            success:res=>{
              app.globalData.anchordetail = app.globalData.userInfo
              wx.navigateBack({
                delta:1
              })
            }            
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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