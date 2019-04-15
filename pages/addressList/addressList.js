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
    title: '地址管理',
    list: [], //地址列表,
    type: 0,
    init: false,
    cur_in: -1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var type = options.type || '2'
    //type  1:表示确认订单进入   2：从 我的  页面进入
    this.setData({
      type
    })
    if (type == 1) {
      this.id = options.id
    }
    this.loadData()
  },
  onHide() {
    this.setData({
      init: false
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.loadData()
  },
  checkaddress({
    success,
    data
  }) {
    api.request({
      url: Url.checkaddress,
      data,
      success: res => {
        success(res)
      }
    })
  },
  //获取配送费
  getPsf({
    postdata,page
  }){
    api.getPsf({
      data: postdata,
      success: (psf) => {
        var money = Number(page.data.money),
          initpsf = Number(page.data.psf)
        page.setData({
          psf: psf.toFixed(2),
          money: (money - initpsf + Number(psf)).toFixed(2)
        })
      }
    })
  },
  //地址选择
  itemClick(e) {
    if (this.data.type == 2) return
    var pages = getCurrentPages(),
      page = pages[pages.length - 2],
      {
        index
      } = e.currentTarget.dataset,
      data = this.data.list[index],
      total = Number(page.data.totalPrice)
    this.checkaddress({
      success: res => {
        if (res.data.data.flag != 1) {
          if ((total) < 30) {
            this.getPsf({
              postdata: {
                lat: data.lat,
                lon: data.lon
              },
              page
            })
          }
          page.setData({
            defaultAdd: data,
            defaultAddTxt: data.shippingAddr + data.houseNum,
            branchesName: res.data.data.branchesName
          })
          wx.navigateBack({
            delta: -1
          })
        } else {
          wx.showToast({
            title: '附近3公里内没有网点!',
            icon: 'none'
          })
        }
      },
      data: {
        lat: data.lat,
        lon: data.lon
      }
    })

  },
  /**
   * 用户交互事件
   */
  //跳转页面
  enterPage(e) {
    var type = e.currentTarget.dataset.type, //1  编辑地址   2  新增
      title
    if (type == 1) {
      var index = e.currentTarget.dataset.index,
        data = this.data.list[index],
        params = {
          mobileUserId: app.globalData.userId,
          userName: data.userName,
          userPhone: data.userPhone,
          userSex: data.userSex,
          shippingAddr: data.shippingAddr,
          houseNum: data.houseNum, //门牌号
          addrLabel: data.addrLabel, //标签
          lat: data.lat,
          lon: data.lon,
          id: data.id
        }
      wx.navigateTo({
        url: '../editAddress/editAddress?type=' + type + '&data=' + JSON.stringify(params)
      })
    } else {
      wx.navigateTo({
        url: '../editAddress/editAddress?type=' + type
      })
    }
  },
  //初始数据请求
  loadData() {
    //地址列表
    let postData;
    postData = {
      mobileUserId: app.globalData.userId
    }
    api.request({
      data: postData,
      url: Url.addressList,
      success: (res) => {
        console.log(res)
        if (res.data.status == 1) {
          var data = res.data.data
          if (this.data.type == 1) {
            for (var i = 0; i < data.length; i++) {
              if (data[i].id == this.id) {
                this.setData({
                  cur_in: i
                })
                break;
              }
            }
          }
          this.setData({
            list: data,
            init: true
          })
        }
      }
    })
  },
  //返回确认订单页时的检查函数
  backCheck() {
    if (this.data.type == 1) {
      var data = this.data.list,
        cur_data = data[this.data.cur_in],
        pages = getCurrentPages(),
        page = pages[pages.length - 2],
        total = Number(page.data.totalPrice),
        defaultadd = page.data.defaultAdd.shippingAddr + page.data.defaultAdd.houseNum
      if (!cur_data) {
        page.setData({
          defaultAdd: null,
          defaultAddTxt: '',
          psf: 0
        })
      } else {
        if (defaultadd == cur_data.shippingAddr + cur_data.houseNum) return //判断是否修改地址
        var postdata = {
          lon: cur_data.lon,
          lat: cur_data.lat
        }
        this.checkaddress({
          success: res => {
            if (res.data.data.flag != 0) {
              page.setData({
                defaultAdd: null,
                defaultAddTxt: '',
                psf: 0
              })
            } else {
              if ((total) < 30) {
                this.getPsf({postdata,page})
              }
              page.setData({
                defaultAdd: cur_data,
                defaultAddTxt: cur_data.shippingAddr + cur_data.houseNum,
                branchesName: res.data.data.branchesName
              })
            }
          },
          data: postdata
        })
      }
    }
  }
})