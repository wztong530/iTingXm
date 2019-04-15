import {
  config,
  Url
} from '../../utils/config.js'
import {
  Request
} from '../../utils/request.js'
var api = new Request()
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:'员工列表',
    pages:1,
    rows:10,
    nodata:false,
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = JSON.parse(options.data)
    this.setData({
      data
    })
    this.requestData()
  },
requestData(pages=0){
  api.request({
    url: Url.ygList,
    data: {
      enterpriseId: this.data.data.id,
      pages,
      rows:this.data.rows
    },
    success: res => {
      console.log(res)
      var data = res.data
      this.data.list.push(...data.data)
      this.setData({
        list:this.data.list,
        dataNum:data.pageBean
      })
      if(pages == data.pageBean.totalPage -1){
        this.setData({
          nodata:true
        })
      }
    }
  })
},
call(e){
  var data = this.data.list,{index} = e.currentTarget.dataset
  wx.makePhoneCall({
    phoneNumber: data[index].phone
  })
},
  onReachBottom(){
    var data = this.data,pagebean = data.dataNum,page = data.pages
    page++
    if(page > pagebean.totalPage)return
    this.setData({
      pages:page
    })
    this.requestData(page)
  }
})