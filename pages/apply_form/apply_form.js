// pages/apply_form/apply_form.js
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
    title:'报名信息',
    isBack:true,
    prompt:'',
    id:''
  },

  //表单提交
  formSubmit(e){
    let {name,sex,phone,address,explain}=e.detail.value
    var reg = /^\s*$/g; //验证全为空格
    var phoneReg =/^1[3-9]\d{9}$/; 
    if(reg.test(name)||name==''){
      wx.showToast({
        title: '请输入姓名',
        icon:'none'
      })
      return
    }
    if (sex == '') {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      })
      return
    }
    if (!phoneReg.test(phone) || phone == '') {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }
    if (reg.test(address) || address == '') {
      wx.showToast({
        title: '请输入地址',
        icon: 'none'
      })
      return
    }
    if (reg.test(explain) || explain == '') {
      wx.showToast({
        title: '请输入备注',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '提交中,请稍候'
    })
    api.request({
      url: Url.activityIn,
      data:{
        mobileUserId: app.globalData.userInfo.id,
        activityId: this.data.id,
        name, phone, address, 
        remarks:explain,
        sex:(sex==1&&1)||(sex==0&&2)
      },
      success:res=>{
        wx.hideLoading()
        wx.showToast({
          title: '报名成功',
          icon:'none',
          mask:true,
          duration:2000,
          success:res=>{
            wx.navigateBack({
              delta:1
            })
          }
        })
      }
    })
  },

  // //页面跳转
  // enterPage(){
  //   wx.navigateTo({
  //     url:'../chooseAddress/chooseAddress'
  //   })
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      prompt: options.prompt,
      id:options.id
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