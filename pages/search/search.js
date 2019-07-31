// pages/search/search.js
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
    title: '搜索',
    isBack: true,
    navList:['动态','主播','电台','资讯','活动'],
    selected:1,//导航切换
    status:0,//0-未输入 1-输入时 2-搜索后
    content:'',//搜索框输入内容
    isClear:false,
    queryHistoryList:[],//历史搜索
    fuzzyQueryList:[],//模糊查询
    type:0,//类型 全部-0
    dynamicList:[],//动态-1
    myFocusList:[],//主播-2
    programsList:[],//电台-3
    newsList:[],//资讯-4
    activityList:[],//活动-5
    isNoMore: false,
    pageNum: 0,//从1开始
    pageSize: 10,
    pages: 0, //总页数
    noData:false//暂无相关搜索结果
  },

  //页面跳转
  enterPage(e){
    let {url,id}=e.currentTarget.dataset
    wx.redirectTo({
      url: url+'?id='+id
    })
  },

  //加载历史记录
  getQueryHistory(){
    api.request({
      url: Url.getQueryHistory,
      data:{
        userId:app.globalData.userInfo.id
      },
      success:res=>{
        if(res.data.code==0){
          this.setData({
            queryHistoryList:res.data.result
          })
        }
      }
    })
  },
  //模糊查询
  fuzzyQuery(queryString){
    api.request({
      url: Url.fuzzyQuery,
      data: { queryString},
      success:res=>{
        if(res.data.code==0){
          let result=res.data.result
          for(let item of result){
            switch (parseInt(item.resultType)){
              case 1:
                item.typeName='动态'
                break;
              case 2:
                item.typeName='主播'
                break;
              case 3:
                item.typeName='电台'
                break;
              case 4:
                item.typeName='资讯'
                break;
              case 5:
                item.typeName='活动'
            }
          }
          this.setData({
            fuzzyQueryList: result
          })
        }
      }
    })
  },
  //按type分类搜索api
  typeSearchApi(type){
    this.setData({
      type,
      dynamicList: [],//动态-1
      myFocusList: [],//主播-2
      programsList: [],//电台-3
      newsList: [],//资讯-4
      activityList: [],//活动-5
      isNoMore: false,
      pageNum: 0,//从1开始
      pageSize: 10,
      pages: 0, //总页数
      noData: false//暂无相关搜索结果
    })
    this.classifiedQuery()
  },
  //点击提示词搜索
  classifySearch(e){
    this.typeSearchApi(e.currentTarget.dataset.type)
  },
  //分页按类搜索查询
  classifiedQuery(){
    this.setData({
      pageNum: this.data.pageNum + 1
    })
    wx.showLoading()
    api.request({
      url: Url.classifiedQuery,
      data:{
        queryString:this.data.content,
        type:this.data.type,
        userId:app.globalData.userInfo.id,
        pageNum:this.data.pageNum,
        pageSize:this.data.pageSize
      },
      success:res=>{
        if(res.data.code==0){
          switch(parseInt(this.data.type)){
            case 1:
              let dynamicList = this.data.dynamicList
              dynamicList = dynamicList.concat(res.data.dynamicPage.records)
              this.setData({
                dynamicList,
                pages: res.data.dynamicPage.pages,
                selected:1
              })
              break;
            case 2:
              let myFocusList = this.data.myFocusList
              myFocusList = myFocusList.concat(res.data.userPage.records)
              this.setData({
                myFocusList,
                pages: res.data.userPage.pages,
                selected: 2
              })
              break;
            case 3:
              let programsList = this.data.programsList
              programsList = programsList.concat(res.data.programsPage.records)
              this.setData({
                programsList,
                pages: res.data.programsPage.pages,
                selected: 3
              })
              break;
            case 4:
              let newsList = this.data.newsList
              newsList = newsList.concat(res.data.newsPage.records)
              this.setData({
                newsList,
                pages: res.data.newsPage.pages,
                selected: 4
              })
              break;
            case 5:
              let activityList = this.data.activityList
              activityList = activityList.concat(res.data.activityPage.records)
              this.setData({
                activityList,
                pages: res.data.activityPage.pages,
                selected: 5
              })
          }
          //显示搜索结果
          this.setData({
            status: 2,
            isClear: true
          })
          wx.hideLoading()
          if (this.data.pageNum == this.data.pages) {
            this.setData({
              isNoMore: true
            })
          }
        }
      }
    })
  },
  //全局搜索(默认type-0)
  totalSearch(e){
    if(this.data.content==''){
      this.setData({
        content: e.currentTarget.dataset.content
      })
    }
    let content=e.currentTarget.dataset.content||this.data.content
    var reg = /^\s*$/g
    if (reg.test(content) || content == '') {
      wx.showToast({
        title: '搜索内容不能为空！',
        icon: 'none'
      })
      return
    }
    this.setData({
      noData: false
    })
    wx.showLoading({
      title: '正在搜索中...'
    })
    //异步请求搜索内容
    api.request({
      url: Url.classifiedQuery,
      data:{
        queryString: content,
        type: 0,
        userId: app.globalData.userInfo.id,
        pageNum: 1,
        pageSize: 99
      },
      success:res=>{
        if(res.data.code==0){
          let data=res.data
          if (data.dynamicPage.length>0){
            this.setData({
              dynamicList: data.dynamicPage,
              selected:1
            })
          } else if (data.userPage.length > 0){
            this.setData({
              myFocusList: data.userPage,
              selected: 2
            })
          } else if (data.programsPage.length > 0) {
            this.setData({
              programsList: data.programsPage,
              selected: 3
            })
          } else if (data.newPage.length > 0) {
            this.setData({
              newsList: data.newPage,
              selected: 4
            })
          } else if (data.activityPage.length>0){
            this.setData({
              activityList: data.activityPage,
              selected: 5
            })
          }else{
            this.setData({
              noData:true
            })
          }
          //显示搜索结果
          wx.hideLoading()
          this.setData({
            status: 2,
            isClear: true
          })
        }
      }
    })
  },
  //取消
  cancel(){
    wx.navigateBack({
      delta:1
    })
  },
  //获取输入内容
  searchInput(e){
    let content=e.detail.value
    this.setData({
      status:1
    })
    if (content.length>0){
      this.fuzzyQuery(content)//模糊查询
      this.setData({
        content
      })
    }else{
      this.setData({
        status:0
      })
      this.getQueryHistory()
    }
  },
  //获取焦点时
  focus(e){
    let content=e.detail.value,
      isClear=this.data.isClear
    if(isClear){
      this.setData({
        content:'',
        status:0
      })
      this.getQueryHistory()
    }else{
      if(content.length>0){
        this.setData({
          status:1
        })
        this.fuzzyQuery(content)
      }else{
        this.setData({
          status:0
        })
        this.getQueryHistory()
      }
    }
  },

  //导航栏切换
  selectItem(e){
    let type = e.currentTarget.dataset.index
    this.setData({
      selected:type
    })
    this.typeSearchApi(type)
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
    this.getQueryHistory()
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
    if (this.data.pageNum < this.data.pages) {
      this.classifiedQuery()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})