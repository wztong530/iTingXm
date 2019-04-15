
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
    title:"绑定支付宝信息",
    isShow:false,
    name:'',
    zh:'',
    array:[],
    yh:'请选择银行',
    yhIndex:-1,
    card:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loaddata()
  },
  loaddata(){
    api.request({
      url:Url.bankList,
      success:res=>{
        console.log(res)
        this.setData({
          array:res.data.data
        })
      }
    })
  },
  changeinput(e){
    var value = e.detail.value,
      key = e.currentTarget.dataset.key
    this.data[key] = value
  },
  // 弹窗
  showpopup(){
    this.setData({
      isShow:true
    })
  },
  hidepopup() {
    this.setData({
      isShow: false
    })
  },
  bd(){
    if (this.data.name == '' || this.data.zh == '' || this.data.card == '' || this.data.yh == '请选择银行'){
      wx.showToast({
        title: '请完整填写信息',
        icon:'none'
      })
      return
    }
    api.request({
      url: Url.tzZhifubao,
      data:{
        uid:app.globalData.userInfo.id,
        zhifubao:this.data.zh,
        name:this.data.name,
        bank:this.data.yh,
        bankCard:this.data.card
      },
      success:res=>{
        console.log(res)
        if(res.errMsg == 'request:ok'){
          api.loadRequest({app}).then((res)=>{
            wx.showToast({
              title: '绑定成功',
              icon: 'none'
            })
            setTimeout(() => {
              wx.navigateBack({
                delta: -1
              })
            }, 1500)
          })
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none'
          })
        }
      }
    })
  } ,
  bindPickerChange(e){
    var index = e.detail.value
    this.setData({
      yhIndex: index,
      yh: this.data.array[index].bankName
    })
  }
})