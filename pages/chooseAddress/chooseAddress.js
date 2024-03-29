
import {
  config,
  Url
} from '../../utils/config.js'
import {
  Request
} from '../../utils/request.js'

var api = new Request()
var app = getApp()

//引入SDK核心类
var QQMapWX = require('../../sdk/qqmap-wx-jssdk.js');
// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: config.mapkey 
});  


Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:'选择地址',
    inputValue:'',
    poi:[],//附近地点
    filterPoi:[],//筛选后的附近地址
    cur:'',//当前地址
    list:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getLocation({
      success: res => {
        console.log(res)
      },
    })
    this.loaddata()
  },
  loaddata(){
    wx.showLoading()
    api.request({
      url:Url.getcuradd,
      data: app.globalData.location,
      success:res=>{
        console.log("cur:::",res)
        this.setData({
          cur:res.data.data.result
        })
      }    
    })
    //this.getlocation()
    api.request({
      url: Url.chooseList,
      data: app.globalData.location,
      success:res=>{
        console.log(res)
        wx.hideLoading()
        var arr = res.data.data
        if (arr.length) {
          arr.map((item) => {
            item.allfloor = item.floor.split(",")
           // item.floor = item.floor.split(",")
          })
        }
        if(arr.length > 0){
          this.setData({
            list: arr,
            filterList: arr
          })
        }
      }
    })
  },
  getlocation(){
    var loc = app.globalData.location
    qqmapsdk.reverseGeocoder({
      location: {
        latitude:loc.lat,
        longitude:loc.lon
      },
      success:res=>{
        console.log(res)
        this.setData({
          cur: res.result
        })
      }
    })
  },
  // 获取当前地址和附近地址
 // getlocation(loc){
    //腾讯地图逆地址解析接口
    // wx.showLoading()
    // qqmapsdk.reverseGeocoder({
    //   location: {
    //     latitude:loc.lat,
    //     longitude:loc.lon
    //   },
    //   get_poi: 1,
    //   poi_options: 'radius=5000;address_fomat=short;page_size='+this.data.pageSize+';page_index='+this.data.pageNum,
    //   success: (res) => {
    //     console.log(res)
    //     wx.hideLoading()
    //     if (res.message === 'query ok') {
    //       let data = res.result, poi
    //       this.data.poi.push(...data.pois)
    //       poi = this.data.poi
    //       if(this.isFirst){
    //         this.isFirst = false
    //         this.setData({
    //           cur: data.formatted_addresses.recommend,
    //         })
    //       }
    //       this.setData({            
    //         poi,
    //         filterPoi:poi
    //       })
    //     } else {
    //       this.hasData = false
    //       wx.showToast({
    //         title: res.message,
    //         icon:'none'
    //       })
    //     }
    //   },
    //   fail:(err)=>{
    //     wx.hideLoading()
    //   }
    // })
  //},
  //搜索框相关

  //文字输入时过滤列表
  inputchange(e){
    let value = e.detail.value,reg = new RegExp(value),arr
    arr = this.data.list.filter((item)=>{
      if(value){
        return reg.test(item.shippingAddr)
      } else {
        return true
      }
    })
    console.log(arr)
    this.setData({
      inputValue: value,
      filterList:arr
    })
  },
  refresh(){
    this.loaddata()
  },
  //点击搜索
  confirm(e){
    var val = e.detail.value
    this.reset()
    if(val){
      wx.showLoading()
      qqmapsdk.geocoder({
        address: val,
        success: res => {
          console.log(res)       
          var loc = res.result.location
          this.current_loc = loc
          this.isSearch = true
          loc.lon = loc.lng
          this.getlocation(loc)
        },
        fail:err=>{
          wx.showToast({
            title: err.message,
            icon:'none'
          })
          this.hasData = false
          wx.hideLoading()
        }
      })
    } else {
      this.isSearch = false
      this.getlocation(this.data.cur_location)
    }
  },
  //地址选择
  select(e){
    var type = e.currentTarget.dataset.type,     //1附近地址   0  当前地址
        pageArr = getCurrentPages(),
        page = pageArr[pageArr.length - 2],
        thisData = this.data,index
        console.log(page)
    if(type == 0){
      return
      // page.setData({
      //   ['data.shippingAddr']: thisData.cur.shippingAddr,
      //   ['data.lat']: thisData.cur.lat,
      //   ['data.lon']: thisData.cur.lon,
      //   ['data.houseNum']: thisData.cur.houseNum,
      //   ['data.allFloor']: thisData.cur.allfloor,
      //   ['data.addressId']: thisData.cur.id
      // })
    } else {
      index = e.currentTarget.dataset.index
      page.setData({
        ['data.shippingAddr']: thisData.filterList[index].shippingAddr,
        ['data.lat']: thisData.filterList[index].lat,
        ['data.lon']: thisData.filterList[index].lon,
        ['data.houseNum']: thisData.filterList[index].houseNum,
        ['data.allFloor']: thisData.filterList[index].allfloor,
        ['data.addressId']: thisData.filterList[index].id
      })
    }
    wx.navigateBack({
      delta:-1
    })
  }
})