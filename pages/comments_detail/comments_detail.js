// pages/comments_detail/comments_detail.js
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
    title: '评论详情',
    isBack: true,
    isShow:true,
    id:'',
    offset: -1, //当前页数,从0开始
    size: 6, //每页显示条数
    totalPage: 0, //总页数
    isNoMore:false,
    replyComment:'',
    showReply:false,
    programsId:'',
    comment:{},
    replyList:[],
    bottom:0
  },

  //显示回复列表
  showReply(){
    this.setData({
      isShow:this.data.isShow?false:true
    })
  },

  //显示回复输入框
  replyContent(e) {
    this.setData({
      showReply: true
    })
  },

  //获取输入内容
  getInput(e) {
    this.setData({
      replyComment: e.detail.value
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

  //回复评论
  sendComment() {
    if (app.globalData.userInfo.id == this.data.comment.commentUserId){
      wx.showToast({
        title: '不能回复自己的评论',
        icon:'none',
        mask:true
      })
      return
    }
    var reg = /^\s*$/g;
    if (reg.test(this.data.replyComment) || this.data.replyComment == '') {
      wx.showToast({
        title: '不能发送空内容！',
        icon: 'none'
      })
      return;
    }
    api.wxMsgCheck({
      data: {
        content: this.data.replyComment
      },
      success: res =>{
        if(res.data.code==0){
          wx.showLoading({
            title: '正在发送评论',
            mask: true
          })
          api.request({
            url: Url.programsComments,
            data: {
              parentCommentId: this.data.id,
              replyUserId: app.globalData.userInfo.id,
              commentUserId: this.data.comment.commentUserId,
              programsId: this.data.programsId,
              content: this.data.replyComment
            },
            success: res => {
              wx.hideLoading()
              this.setData({
                replyComment: '',
                offset: -1,
                replyList: []
              })
              this.loadprogramsReplyList()
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

  //分页加载详情及回复列表
  loadprogramsReplyList() {
    this.setData({
      offset: this.data.offset + 1
    })
    wx.showLoading()
    api.request({
      url: Url.programsReplyList,
      data: {
        offset: this.data.offset,
        size: this.data.size,
        parentCommentId: this.data.id
      },
      success: res => {
        this.setData({
          comment: res.data.comment,
          replyList: this.data.replyList.concat(res.data.replyList),
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { id, reply, programsId}=options
    this.setData({
      id, 
      programsId,
      showReply:reply?reply:false
    })
    this.loadprogramsReplyList()
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
      this.loadprogramsReplyList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})