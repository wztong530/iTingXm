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
    title: '',
    data: {
      mobileUserId: '', //
      userName: '',
      userPhone: '',
      userSex: 0,
      shippingAddr: '', //收货地址
      houseNum: '', //门牌号
      addrLabel: 0, //标签
      lat: '',
      lon: '',
      isCover:false,
      array:['1号楼','2号楼','3号楼']
    }, //表单数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.load(options)
  },
  /**
   * 用户交互事件
   */
  //初始化函数
  load(options) {
    this.type = options.type //type 1:编辑地址    2:新增地址
    let title = '',btnTxt = ''
    if (this.type == 1) {
      title = '管理收货地址'
      btnTxt = '删除'
      this.setData({
        data: JSON.parse(options.data)
      })
    } else {
      title = '编辑地址'
      btnTxt = '返回'
      this.data.data.mobileUserId = app.globalData.userId
    }
    this.setData({
      title,
      btnTxt
    })
  },
  preventNull(){},
  //跳转到地址选择页面
  enterpage() {
    if (!app.globalData.isLocation) {
      wx.openSetting({
        success: res => {
          if (res.authSetting['scope.userLocation']) {
            wx.showLoading()
            api.getlocation({
              app,
              success:()=>{
                wx.hideLoading()
                wx.navigateTo({
                  url: '../chooseAddress/chooseAddress'
                })
              }
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '../chooseAddress/chooseAddress'
      })
    }
  },
  //获取用户地理位置
  getlocation() {
    // wx.chooseLocation({
    //   success: res => {
    //     console.log(res)
    //     this.setData({
    //       ['data.shippingAddr']: res.address,
    //       ['data.lat']: res.latitude,
    //       ['data.lon']: res.longitude,
    //       ['data.houseNum']:res.name
    //     })
    //   },
    // })
  },
  //确认按钮
  submit() {
    let postData = this.data.data
    if (this.check(postData)) {
      api.request({
        url: Url.addAddress,
        data: postData,
        success: (res) => {
          console.log(res)
          wx.showToast({
            title: '保存成功',
            duration: 1500
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: -1
            })
          }, 1500)
        }
      })
    }
  },
  //表单检查    
  check(data) {
    var title = ''
    console.log(data)
    for (var key in data) {
      if (data[key] === '') {
        switch (key) {
          case 'userName':
            title = '收货人'
            break
          case 'userPhone':
            title = '手机号'
            break
          case 'shippingAddr':
            title = '收货地址'
            break
          case 'houseNum':
            title = '门牌号'
            break
        }
        wx.showToast({
          title: '请输入' + title,
          duration: 1500,
          icon: 'none'
        })
        return false
      }
    }
    if(data.userPhone.length != 11){
      wx.showToast({
        title: '请输入正确的手机号',
        icon:'none'
      })
      return false
    }
    return true
  },
  //删除/返回按钮
  remove() {
    if (this.type == 1) {
      this.setData({
        isCover:true
      })
    } else {
      wx.navigateBack({
        delta: -1
      })
    }
  },
  //弹窗取消按钮
  cancel(){
    this.setData({
      isCover: false
    })
  },
//删除
  deleteData(){
    let postData = {
      id: this.data.data.id
    }
    wx.showLoading()
    api.request({
      data: postData,
      url: Url.deleteAddress,
      success: (res) => {
        wx.hideLoading()
        wx.showToast({
          title: '删除成功',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: -1
          })
        }, 1500)
      }
    })
  },
  //用户输入
  changeinput(e) {
    var value = e.detail.value,
      key = e.currentTarget.dataset.key
    // this.setData({
    //   ['data.'+ key ]:value
    // })   没必要用setdata
    this.data.data[key] = value
  },
  //性别选择
  sexclick(e) {
    var type = e.currentTarget.dataset.type,
      sex = this.data.data.userSex;
    if (type == sex) return
    this.setData({
      ['data.userSex']: type
    })
  },
  //标签选择
  labelclick(e) {
    var type = e.currentTarget.dataset.type,
      label = this.data.data.addrLabel;
    if (type == label) return
    this.setData({
      ['data.addrLabel']: type
    })
  },
  // 楼号选择
  bindPickerChange(e){
    this.setData({
      index: e.detail.value
    })
  }
})