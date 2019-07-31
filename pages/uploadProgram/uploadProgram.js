// pages/uploadProgram/uploadProgram.js
import {
  config,
  Url
} from '../../utils/config.js'
import {
  Request
} from '../../utils/request.js'
var api = new Request()
var app = getApp()
var programsNum = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十']

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:'上传节目',
    isBack:true,
    radioCategoryId:'',//电台id
    isfocus:false,
    programList:[
      {
        num:'一',
        coverAudio:'',
        coverImg:'',
        title:''
      }
    ],
    programListIds:[]
  },

  //删除节目
  deleteItem(e) {
    let index = e.currentTarget.dataset.index,
      programList = this.data.programList,
      programListIds = this.data.programListIds
    wx.showModal({
      title: '确定删除节目' + programList[index].num+'吗？',
      confirmColor: '#FF6928',
      success: res => {
        if (res.confirm) {
          if (index != programList.length-1){
            programsNum.splice(index,1)
          }
          programList.splice(index, 1)
          programListIds.splice(index,1)
          this.setData({
            programList,
            programListIds
          })
        }
      }
    })
  },

  //获取焦点
  onFocus(){
    this.setData({
      isfocus:true
    })
  },
  //失去焦点
  onBlur(e){
    console.log(e)
    if(e.detail.value==''){
      this.setData({
        isfocus: false
      })
    }
  },

  //添加节目
  addProgram(){
    let newProgram={
      num: '',
      coverAudio: '',
      coverImg: '',
      title: ''
    },
    programList=this.data.programList,
    newProgramIds = {
      radioCategoryId: this.data.radioCategoryId,
      mobileUserId: app.globalData.userInfo.id,
      fileId: '',
      imgId: '',
      programsTitle: ''
    },
    programListIds = this.data.programListIds;
    newProgram.num =programsNum[this.data.programList.length]
    programList.push(newProgram)
    programListIds.push(newProgramIds)
    this.setData({
      programList,
      programListIds
    })
  },

  //上传音频
  chooseAudio(){
    
  },

  //上传封面
  chooseImg(e) {
    let index = e.currentTarget.dataset.index,that=this
    wx.chooseImage({
      count: 1,
      success: res => {
        const tempFilePaths = res.tempFilePaths[0]
        let programList = that.data.programList
        programList[index].coverImg = tempFilePaths
        that.setData({ programList })
        wx.uploadFile({
          url: config.url + Url.uploadFile,
          filePath: tempFilePaths,
          header: {
            "Content-Type": "multipart/form-data",
            'accept': 'application/json',
          },
          name: 'RadioPrograms',
          formData: {
            'type': 'image',
            'model': 'RadioPrograms',
            'field': 'programs_cover_img'
          },
          success: res2 => {
            let programListIds = that.data.programListIds
            programListIds[index].imgId=res2.data
            that.setData({ programListIds})
          }
        })
      }
    })
  },

  //输入标题
  getInput(e){
    let index=e.currentTarget.dataset.index,
    title=e.detail.value,
    programListIds = this.data.programListIds
    programListIds[index].programsTitle=title
    this.setData({ programListIds})
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let programListIds = this.data.programListIds
    programListIds[0] = {
      radioCategoryId: options.id,
      mobileUserId: app.globalData.userInfo.id,
      fileId: '',
      imgId: '',
      programsTitle: ''
    }
    this.setData({
      radioCategoryId:options.id,
      programListIds
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})