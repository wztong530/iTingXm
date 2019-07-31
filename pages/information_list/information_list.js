// pages/information_list/information_list.js
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
    title:'i资讯',
    isBack:true,
    autoplay: true,
    circular: true,
    interval: 5000,
    duration: 200,
    advertList:[],//广告轮播列表
    newsCategoryList:[], //分类列表
    chosen: '', //资讯选项卡
    newsList: [], //资讯列表
    offset: -1, //当前页数
    size: 8, //每页显示条数
    totalPage: 0, //总页数
    isNoMore: false
  },

  
  //加载页面数据
  loadData(){
    var that=this;
    //广告轮播(position-1首页 -2资讯)
    // api.getAdvertList({
    //   data: { position: 2 },
    //   success: res => {
    //     that.setData({
    //       advertList: res.data.advertList
    //     })
    //   }
    // })
    //广告轮播new
    api.request({
      url: Url.recommendList,
      method:'GET',
      success:res=>{
        that.setData({
          advertList: res.data.recommendList
        })
      }
    })
    //获取分类列表
    api.getNewsCategoryList({
      success: res => {
        that.setData({
          newsCategoryList: res.data.newsCategoryList,
          chosen: that.data.chosen=='' ? res.data.newsCategoryList[0].id : that.data.chosen
        })
        that.getNewsContent()
      }
    })
    
  },
  //分页获取资讯列表
  getNewsContent() {
    this.setData({
      offset:this.data.offset+1
    })
    wx.showLoading()
    api.getNewsList({
      data: {
        offset: this.data.offset,
        size: this.data.size,
        newsCategoryId: this.data.chosen,
        mobileUserId: app.globalData.userId
      },
      success: res => {
        this.setData({
          newsList: this.data.newsList.concat(res.data.newsList),
          totalPage: res.data.totalPage
        })
        if (this.data.offset == this.data.totalPage-1) {
          this.setData({
            isNoMore: true
          })
        }
        wx.hideLoading()
        console.log('newsList1',this.data.newsList)
      }
    })
  },

  //资讯选项卡
  select(e) {
    this.setData({
      chosen: e.currentTarget.dataset.id,
      offset:-1,
      newsList:[],
      isNoMore:false
    })
    this.getNewsContent()
  },

  // 跳转页面
  enterPage(e) {
    let {
      url,id,index
    } = e.currentTarget.dataset;
    if(id){
      wx.navigateTo({
        url: url + '?id=' + id,
        success: res => {
          this.updateViews({
            id,
            success: res => {
              if (index) {
                let newNewsList = this.data.newsList
                newNewsList[index].viewsStatus = 1;
                ++newNewsList[index].views
                this.setData({
                  newsList: newNewsList
                })
              }
            }
          })
        }
      })  
    }
  },

  //更新资讯阅读状态
  updateViews({id,success}){
    api.request({
      url: Url.updateViews,
      data:{
        id,
        mobileUserId:app.globalData.userId
      },
      success
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      chosen: options.id ? options.id : ''
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
    this.setData({
      newsList: [], //资讯列表
      offset: -1, //当前页数
      size: 8, //每页显示条数
      totalPage: 0, //总页数
      isNoMore: false
    })
    //加载页面数据 
    this.loadData()
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
    if (this.data.offset < this.data.totalPage - 1) {
      this.getNewsContent()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})