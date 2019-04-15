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
    title:'我的钱包',
    isCover:false,    //遮盖层
    isShow:false,
    cur:0,
    czInfo:[
      {
        money:0.01,
        send:'0.00'
      },
      {
        money:40,
        send:'10.00'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.firstClick = true
    this.loaddata()
  },
  loaddata(){
    api.request({
      url: Url.czList,
      data: {
        rechargerId: app.globalData.qyInfo.id,
        pageNum: 0,
        pageSize: 1000
      },
      success: res => {
        console.log(res)
        var data = res.data.data
        this.setData({
          data
        })
      }
    })
  },
  //
  showpopup() {
    this.setData({
      isCover: true,
      isShow: true
    })
  },
  hidepopup() {
    this.setData({
      isShow: false
    })
    setTimeout(() => {
      this.setData({
        isCover: false
      })
    }, 500)
  },
  //充值
  cz(){   
    if(!this.firstClick) return
    this.firstClick = false
    var data = this.data,info = data.czInfo,cur = data.cur

    wx.login({
      success: res => {
        //使用code到后台换取签名等支付所需参数
        api.request({
          url: Url.qyCz,
          data: {
            businessId: config.id,
            rechargerId: '063fab082a7945549b6ee3ddf8ca16bb',
            money: info[cur].money,
            givingMoney: Number(info[cur].send),
            code: res.code
          },
          success: (res2) => {
            console.log(res2)
            wx.hideLoading()
            if (res2.data.data != "") {
              var obj = res2.data.data
              console.log(obj)
              //调用微信支付接口
              wx.requestPayment({
                'timeStamp': obj.timeStamp,
                'nonceStr': obj.nonceStr,
                'package': obj.package,
                'signType': 'MD5',
                'paySign': obj.paySign,
                'success': (res3) => {
                  api.updateQy({
                    app,
                    data:{
                      phone:app.globalData.userInfo.phone
                    },
                    success:()=>{
                      this.loaddata()
                      this.hidepopup()
                    }
                  })
                },
                'fail': res3 => {
                  this.firstClick = true
                  this.hidepopup()
                }
              })
            } else {
              wx.showToast({
                title: res2.data.msg,
                icon: 'none',
                duration: 1500
              })
              this.hidepopup()
            }
            this.firstRequest = true
          }
        })
      }
    })
  },
  select(e){
    var {index} = e.currentTarget.dataset,
    cur = this.data.cur
    if(cur == index)return
    this.setData({
      cur:index
    })
  }
})