// pages/comments_list/comments_list.js
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
    title:'全部评论',
    isBack:true,
    programsId:'',
    commentsList: [],
    offset: -1, //当前页数,从0开始
    size: 8, //每页显示条数
    totalPage: 0, //总页数
    isNoMore: false,
    newComment:'',
    showReply:false,
    id:'',
    bottom:0
  },

  //分页获取评论列表
  loadprogramsCommentsList() {
    this.setData({
      offset: this.data.offset + 1
    })
    wx.showLoading()
    api.request({
      url: Url.programsCommentsList,
      data: {
        offset: this.data.offset,
        size: this.data.size,
        programsId: this.data.programsId
      },
      success: res => {
        this.setData({
          commentsList: this.data.commentsList.concat(res.data.commentsList),
          totalPage: res.data.totalPage
        })
        if (this.data.offset == this.data.totalPage - 1) {
          this.setData({
            isNoMore: true
          })
        }
        wx.hideLoading()
      }
    })
  },

  //页面跳转
  enterPage(e) {
    let {id,url} = e.currentTarget.dataset
    wx.navigateTo({
      url: url + '?id=' + id + '&programsId=' + this.data.programsId
    })
  },

  //获取输入内容
  getInput(e) {
    this.setData({
      newComment: e.detail.value
    })
  },
  
  //输入聚焦
  focus(e) {
    this.setData({
      bottom: e.detail.height
    })
  },
  //失去聚焦
  blur(e) {
    this.setData({
      bottom: 0
    })
  },

  //发送评论
  sendComment(){
    var reg = /^\s*$/g;
    if (reg.test(this.data.newComment) || this.data.newComment == '') {
      wx.showToast({
        title: '不能发送空内容！',
        icon: 'none'
      })
      return;
    }
    api.wxMsgCheck({
      data:{
        content: this.data.newComment
      },
      success:res=>{
        if(res.data.code==0){
          wx.showLoading({
            title: '正在发送评论',
            mask: true
          })
          api.request({
            url: Url.programsComments,
            data: {
              parentCommentId: 0,
              replyUserId: 0,
              commentUserId: app.globalData.userInfo.id,
              programsId: this.data.programsId,
              content: this.data.newComment
            },
            success: res => {
              wx.hideLoading()
              this.setData({
                newComment: '',
                offset: -1,
                commentsList: []
              })
              this.loadprogramsCommentsList()
              wx.showToast({
                title: '评论成功',
                duration: 1500,
                mask: true,
                icon: 'none'
              })
            }
          })
        }else{
          wx.showToast({
            title: '含有违规内容,请重新编辑',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })    
  },

  //回复评论
  replyContent(e){
    this.setData({
      showReply:true,
      id:e.currentTarget.dataset.id
    })
  },
  //确认回复
  confirmReply(e){
    let { url, reply } = e.currentTarget.dataset
    this.setData({
      showReply:false
    })
    wx.navigateTo({
      url: url + '?id=' + this.data.id + '&reply=' + reply + '&programsId=' + this.data.programsId
    })
  },
  //取消回复
  cancelReply(){
    this.setData({
      showReply:false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      programsId:options.id
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
      commentsList: [],
      offset: -1, //当前页数,从0开始
      totalPage: 0, //总页数
      isNoMore: false
    })
    this.loadprogramsCommentsList()
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
      this.loadprogramsCommentsList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})