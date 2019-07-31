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
    noUserInfo:false,
    showOA:false,//关注公众号
    noticeList:[],//公告列表
    chatroomList:[],//直播互动列表
    advertList:[],//广告轮播列表
    anchorList:[],//主播列表
    trafficUserImages:[],//路况头像列表
    trafficUserNum:0,//路况用户人数
    chosen: '',//资讯选项卡
    newsList: [],//资讯列表
    newsCategoryList: [],//资讯类别
    radioList: [],//电台列表
    navCategoryList: [],//导航列表
    userInfo: null,
    indicatorDots: false,
    autoplay: true,
    circular: true,
    interval: 5000,
    duration: 200,
    init: true,
    myIntegral:0,//积分
    parameter: {}, //粉丝、访问量、关注公众号弹窗图、客服电话、路况互动图
    playerTitle: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {  
    //调试头部适配
    api.toShipei.call(this,app.globalData.deviceInfo)
    //登录
    api.loadRequest({
      app
    }).then(({ userInfo }) => { 
      if(userInfo){
        this.setData({
          userInfo: userInfo,
          init: true
        })
        wx.showTabBar()
        this.initdata()
        this.setting()
        this.load()
        console.log('userInfo', app.globalData.userInfo)
        this.setData({
          myIntegral: this.data.userInfo.integral
        })      
      }else{
        this.setData({
          noUserInfo: true
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.userInfo && !this.data.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
    app.globalData.userInfo && this.load()
    if (this.data.myIntegral>0){
      api.myIntegralList({
        data: { userId: app.globalData.userId },
        success: res => {
          this.setData({
            myIntegral: res.data.myIntegral
          })
        }
      })
    } 
    //防止用户突然关闭授权
    api.checkLocation({
      app
    })
  },

  //默认自定义数据
  initdata() {
    this.setData({      
      //导航列表
      navCategoryList: [
        {
          enterUrl: '../information_list/information_list',
          imgUrl: '../../images/zixun.png',
          navName: 'i资讯'
        },
        {
          enterUrl: '../diantai/diantai',
          imgUrl: '../../images/itingxiamen.png',
          navName: 'i电台'
        },
        {
          enterUrl: '../discover/discover',
          imgUrl: '../../images/huodong.png',
          navName: 'i活动'
        },
        {
          enterUrl: '../traffic/traffic',
          imgUrl: '../../images/lukuang.png',
          navName: '路况互动'
        },
        {
          enterUrl: '../integral/integral',
          imgUrl: '../../images/jifen.png',
          navName: '我的积分'
        }
      ]
    })
  },
  /**
   * 用户交互事件
   */
  //初始数据请求
  load() {
    var that = this;
    //首页广告轮播(position-1首页 -2资讯)
    api.getAdvertList({
      data:{position:1},
      success:res=>{
        that.setData({
          advertList: res.data.advertList
        })
      }
    })

    //导航栏列表
    // api.request({
    //   url:Url.navCategoryList,
    //   method:'GET',
    //   success(res){
    //     that.setData({
    //       navCategoryList: res.data.navCategoryList
    //     })
    //   }
    // })

    //公告列表
    api.request({
      url: Url.noticeList,
      data:{offset:0,size:5},
      success:res=>{
        that.setData({
          noticeList: res.data.noticeList
        })
      }
    })

    //粉丝、访问量、关注公众号弹窗图、客服电话、路况互动图
    api.request({
      url: Url.parameter,
      method:'GET',
      success:res=>{
        this.setData({
          parameter: res.data.parameter
        })
      }
    })

    //直播互动-直播间列表
    api.request({
      url: Url.chatroomList,
      success:res=>{
        this.setData({
          chatroomList: res.data.page.records
        })
        console.log('直播间', this.data.chatroomList)
      }
    })

    //i听电台(mobileUserId为空)、主播电台(mobileUserId不为空)
    //loginUserId->返回oneselfRadio 是否属于主播自己的电台(1 是 0 否)
    //offset第几页 size每页显示个数
    api.getRadioList({
      data:{
        offset: 0,
        size: 3,
        loginUserId: app.globalData.userId
      },
      success:res=>{
        that.setData({
          radioList: res.data.radioList
        })
      }
    })

    //路况互动
    api.request({
      url: Url.mainPageTraffic,
      success:res=>{
        console.log('首页路况',res)
        this.setData({
          trafficUserImages: res.data.userImages.slice(0,7),
          trafficUserNum: res.data.userNum
        })
      }
    })
    
    //咨讯类别
    api.getNewsCategoryList({
      success: res => {
        that.setData({
          newsCategoryList: res.data.newsCategoryList.slice(0, 4),
          chosen: res.data.newsCategoryList[0].id
        })
        that.getNewsContent(res.data.newsCategoryList[0].id)
      }
    })
    //主播列表
    that.loadAnchorList()
  },
  //加载主播列表
  loadAnchorList(){
    api.request({
      url: Url.anchorList,
      data: { mobileUserId: app.globalData.userId },
      method: 'GET',
      success:res=> {
        this.setData({
          anchorList: res.data.anchorList
        })
      }
    })
  },

  //关注公众号
  showOA(){
    let arrs = ['1089','1011','1047','1124','1038']
    if(arrs.some((item)=>{
      return item==app.globalData.scene
      })){
      wx.navigateTo({
        url: '../focusPublic/focusPublic'
      })
    }else{
     this.setData({
       showOA:true
     })
     wx.hideTabBar()
    }
  },
  //关闭公众号弹窗
  closePop(){
    this.setData({
      showOA:false
    })
    wx.showTabBar()
  },

  //获取资讯列表每类轮播的图片和内容
  getNewsContent(id){
    api.getNewsList({
      data: {
        offset: 0,
        size: 6,
        newsCategoryId: id,
        mobileUserId: app.globalData.userId
      },
      success: res => {
        let arr = res.data.newsList,newsList=[]
        arr.forEach((item,i,arr)=>{
          if(item.sort=='1'){
            newsList.push(item)
          }
        })
        this.setData({
          newsList
        })
        console.log('newsList',this.data.newsList)
      }
    })
  },

  //资讯选项卡
  select(e) {
    this.setData({
      chosen: e.currentTarget.dataset.id
    })
    this.getNewsContent(e.currentTarget.dataset.id)
  },

  //关注/取关 (参与人id：mobileUserId、主播id：anchorId、delFlag(0关注、1取关))
  handleFocus(e){
    console.log(e)
    let { id, focusstatus, index, focusid}=e.currentTarget.dataset;
    api.focusOrNot({
      data:{
        mobileUserId:app.globalData.userId,
        anchorId:id,
        delFlag:focusstatus,
        id: focusid==null?'':focusid
      },
      success:res=>{
        if (res.data.code == 0){
          this.loadAnchorList()
          wx.showToast({
            title: this.data.anchorList[index].focusStatus=='0'?'关注成功':'已取消关注',
            duration:2000,
            mask:true,
            icon: 'none'
          })
        }
        console.log(res)
      }
    })
  },

  //弹窗进入主页
  // enterIndex() {
  //   wx.showTabBar()
  // },

  //更新资讯阅读状态
  updateViews({ id, success }) {
    api.request({
      url: Url.updateViews,
      data: {
        id,
        mobileUserId: app.globalData.userId
      },
      success
    })
  },

  // 跳转页面
  enterPage(e) {
    let {
      url, id, title, programdetail, anchordetail
    } = e.currentTarget.dataset;
    console.log('跳转',e.currentTarget.dataset)
    if (url == '../discover/discover') {
      wx.switchTab({
        url
      })
    } else if (id) {
      wx.navigateTo({
        url: url + '?id=' + id + (title ? '&title=' + title : '')
      })
    } else {
      wx.navigateTo({
        url
      })
    }

  },

  //获取用户信息
  getUserInfo(e) {
    api.getUserInfo({
      app,
      success: (res) => {
        api.loadRequest({
          app
        }).then(({ userInfo }) => {
          this.setData({
            userInfo: userInfo,
            init: true,
            noUserInfo:false
          })
          wx.showTabBar()
          this.initdata()
          this.setting()
          this.load()
          console.log('userInfo', app.globalData.userInfo)
          this.setData({
            myIntegral: this.data.userInfo.integral
          })
        })
      }
    })
  },

  //授权相关
  setting() {
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting["scope.userInfo"]) {
    //       if (!!app.globalData.userInfo) return
    //       this.getUserInfo()
    //     }
    //   }
    // })
    api.getlocation({
      app
    })
  }

})