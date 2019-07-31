// pages/anchorHome/anchorHome.js
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
    anchorRadioList:[], //电台列表
    dynamicList:[],//动态列表
    id:'',//主播id
    showMan:null,//页面显示的人物信息
    userInfo:null,
    title: '',
    isBack: true,
    status:"1", // 1-本机是主播 0-不是
    selected:"0", //0-动态 1-i电台
    offset: -1, //从0开始
    size: 9,
    totalPage: 0,
    isNoMore: false,
    ewm: '',//二维码
    dynamicid:''// 动态详情id
  },

  //点赞动态
  likeDynamic(e){
    let {id,index,islike}=e.currentTarget.dataset
    api.request({
      url: Url.likeDynamic,
      data:{
        dynamicId:id,
        userId:app.globalData.userInfo.id
      },
      success:res=>{
        if(res.data.code==0){
          let dynamicList = this.data.dynamicList
          dynamicList[index].likeNum = islike ? --dynamicList[index].likeNum : ++dynamicList[index].likeNum
          dynamicList[index].isLike=islike?false:true
          this.setData({ dynamicList})
        }
      }
    })
  },

  //删除动态
  deleteItem(e){
    let {index,id} = e.currentTarget.dataset,
      dynamicList = this.data.dynamicList
    wx.showModal({
      title: '确定删除吗？',
      confirmColor:'#FF6928',
      success:res=>{
        if(res.confirm){
          //删除功能[objectId=,flag=program/dynamic]
          api.request({
            url: Url.frontDelete,
            data: {
              objectId: id,
              flag: 'dynamic'
            },
            success: res => {
              if (res.data.code == '0') {
                dynamicList.splice(index, 1)
                this.setData({
                  dynamicList
                })
              }
            }
          }) 
        }
      }
    })
  },

  // 选项卡
  select(e){
    let selected = e.target.dataset.index
    if(selected!=this.data.selected){
      wx.showToast({
        title: '',
        icon: 'loading',
        mask: true
      })
      this.setData({
        selected,
        offset: -1,
        totalPage: 0,
        anchorRadioList: [], //电台列表清零
        dynamicList: [],//动态列表清零
        isNoMore: false
      })
      selected == 0 ? this.loadDynamicList() : this.loadRadioList()
    }  
  },

  //关注/取关 (参与人id：mobileUserId、主播id：anchorId、delFlag(0关注、1取关))
  handleFocus(e) {
    console.log(e)
    let { focusstatus,focusid } = e.currentTarget.dataset;
    api.focusOrNot({
      data: {
        mobileUserId: app.globalData.userId,
        anchorId: this.data.showMan.id,
        delFlag: focusstatus,
        id: focusid == null ? '' : focusid
      },
      success: res => {
        if (res.data.code == 0) {
          let newFocusStatus = focusstatus == '1' ? '0' : '1';
          let newshowMan = this.data.showMan;
          newshowMan.focusStatus = newFocusStatus;
          this.setData({
            showMan: newshowMan
          })
          wx.showToast({
            title: this.data.showMan.focusStatus == '1' ? '关注成功' : '已取消关注',
            duration: 1500,
            mask: true,
            icon: 'none'
          })
        }
      }
    })
  },

  //分页获取电台列表
  loadRadioList() {
    this.setData({
      offset: this.data.offset + 1
    })
    wx.showLoading()
    api.getRadioList({
      data: {// i电台(mobileUserId为空) 、主播电台(mobileUserId不为空)
      //loginUserId->返回oneselfRadio 是否属于主播自己的电台(1 是 0 否)
        offset: this.data.offset,
        size: this.data.size,
        mobileUserId: this.data.showMan.id,
        loginUserId: app.globalData.userInfo.id
      },
      success: res => {
        this.setData({
          anchorRadioList: this.data.anchorRadioList.concat(res.data.anchorRadioList),
          totalPage: res.data.totalPage
        })
        wx.hideLoading()
        if (this.data.offset == this.data.totalPage - 1) {
          this.setData({
            isNoMore: true
          })
        }
      }
    })
  },

  //时间格式转换 20190706120146 -> 07/06 12:01
  timeFormat(t){
    return t.slice(4,6)+'/'+t.slice(6,8)+' '+t.slice(8,10)+':'+t.slice(10,12)
  },

  //分页获取动态列表
  loadDynamicList(){
    this.setData({
      offset: this.data.offset + 1
    })
    wx.showLoading()
    api.request({
      url: Url.listDynamic,
      data: { 
        userId: this.data.showMan.id,
        loginUserId:app.globalData.userInfo.id,
        pageNum:this.data.offset+1,
        pageSize:this.data.size
      },
      success:res=>{
        let dynamicList = this.data.dynamicList
        dynamicList = dynamicList.concat(res.data.myDynamicList.records)
        for (let item of dynamicList){
          if (item.createDate.length==14){
            item.createDate=this.timeFormat(item.createDate)
          }
        }
        this.setData({
          dynamicList,
          totalPage: res.data.myDynamicList.pages
        })
        wx.hideLoading()
        if (this.data.offset == this.data.totalPage-1) {
          this.setData({
            isNoMore: true
          })
        }
      }
    })
  },

  //页面跳转
  enterPage(e) {
    let { id, url, programdetail } = e.currentTarget.dataset
    app.globalData.programdetail = programdetail
    wx.navigateTo({
      url:url +'?id='+id +(this.data.showMan.id==app.globalData.userInfo.id ? '&way=1' : '')
    })
  },

  //加载主播详情
  loaduserDetail(resolve){
    api.request({
      url: Url.userDetail,
      data:{
        mobileUserId:this.data.id
      },
      success:res=>{
        if(res.data.code==0){
          this.setData({
            showMan:res.data.user
          })
          resolve()
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { scene, id } = options
    if (scene == undefined) {
      this.setData({
        id
      })
    } else {
      scene = decodeURIComponent(options.scene)
      let arr = scene.split('&')
      this.setData({
        id: arr[1]
      })
    }
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
      offset: -1,
      totalPage: 0,
      anchorRadioList: [], //电台列表清零
      dynamicList: [],//动态列表清零
      isNoMore: false
    })
    new Promise((resolve,reject)=>{
      if (!app.globalData.userInfo) {
        api.loadRequest({
          app
        }).then(({ userInfo }) => {
          app.globalData.userInfo = userInfo
          this.setData({ userInfo })
          if (userInfo.id == this.data.id) {
            this.setData({
              showMan: userInfo
            })
            resolve()
          } else {
            this.loaduserDetail(resolve)
          }
        })
      } else {
        this.setData({
          userInfo: app.globalData.userInfo
        })
        if (app.globalData.userInfo.id == this.data.id) {
          this.setData({
            showMan: app.globalData.userInfo
          })
          resolve()
        } else {
          this.loaduserDetail(resolve)
        }
      }
    }).then(()=>{
      this.data.selected == 0 ? this.loadDynamicList() : this.loadRadioList()
    })
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
      this.data.selected == 0 ? this.loadDynamicList() : this.loadRadioList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  // 分享按钮
  sharepopup(e) {
    let { dynamicid}=e.currentTarget.dataset
    this.setData({
      isShare: true,
      isShow: true
    })
    if (dynamicid){//动态转发 
      this.setData({ dynamicid})
      api.request({
        url: Url.dynamicQrCode,
        data: {
          mobileUserId: app.globalData.userInfo.id,
          objectId: dynamicid,
          // model:'RadioActivity', 
          // field:'activity_qrcode_img',
          page: 'pages/dynamicDetail/dynamicDetail'
        },
        success: res => {
          this.setData({
            ewm: res.data.qrCodeUrl
          })
        }
      })
    } else {//页面转发
      api.request({
        url: Url.anchorPageQrCode,
        data: {
          mobileUserId: app.globalData.userInfo.id,
          objectId: this.data.showMan.id,
          // model:'RadioActivity', 
          // field:'activity_qrcode_img',
          page: 'pages/anchorHome/anchorHome'
        },
        success: res => {
          this.setData({
            ewm: res.data.qrCodeUrl
          })
        }
      })
    }
  },
  hideShare() {
    this.setData({
      isShow: false
    })
    setTimeout(() => {
      this.setData({
        isShare: false
      })
    }, 500)
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var str, title, imageUrl
    title = '邀请您加入i听厦门！'
    str = this.data.dynamicid ? '/pages/dynamicDetail/dynamicDetail?id=' + this.data.dynamicid : '/pages/anchorHome/anchorHome?id=' + this.data.showMan.id
    return {
      title,
      path: str
    }
  },
  sharePyq() {
    wx.showLoading({
      title: '卡片生成中...'
    })
    console.log('1')
    this.setData({
      template: {
        width: '375px',
        height: '510px',
        background: '#FEF9EF',
        views: [
          {
            type: 'rect',
            css: {
              top: '26px',
              width: '335px',
              height: '306px',
              background: '#ffffff',
              borderRadius: '8px',
              align: 'center',
              left: '375rpx'
            }
          },
          {
            type: 'image',
            url: '../../images/logo.png',
            css: {
              top: '35px',
              left: '34px',
              width: '40px',
              height: '40px',
              borderRadius: '20px'
            }
          },
          {
            type: 'image',
            url: '../../images/shareImg.jpg',
            css: {
              top: '80px',
              left: '34px',
              width: '307px',
              height: '226px'
            }
          },
          {
            type: 'rect',
            css: {
              top: '346px',
              background: '#ffffff',
              borderRadius: '8px',
              align: 'center',
              left: '375rpx',
              width: '345px',
              height: '112px',

            }
          },
          {
            type: 'image',
            url: this.data.ewm,
            css: {
              top: '358px',
              right: '30px',
              width: '88px',
              height: '88px'
            }
          },
          // {
          //   type: 'image',
          //   url: app.globalData.userInfo.avatarImageUrl,
          //   css: {
          //     top: '382px',
          //     right: '54px',
          //     width: '40px',
          //     height: '40px',
          //     borderRadius: '20px'
          //   }
          // },
          {
            type: 'text',
            text: app.globalData.userInfo.nickName,
            css: {
              top: '367px',
              left: '30px',
              width: '212px',
              fontSize: '16px',
              maxLines: '1',
              lineHeight: '16px'
            }
          },
          {
            type: 'text',
            text: '“邀请您加入i听厦门”',
            css: {
              top: '398px',
              left: '30px',
              width: '212px',
              fontSize: '16px',
              maxLines: '1',
              lineHeight: '12px'
            }
          },
          {
            type: 'text',
            text: '长按识别小程序码查看详情',
            css: {
              top: '425px',
              left: '30px',
              width: '212px',
              fontSize: '12px',
              maxLines: '1',
              lineHeight: '12px',
              color: '#FF9500'
            }
          }
        ]
      }
    })
  },
  /**
    * 绘制图片回调
    */
  getShareImg(e) {
    wx.hideLoading()
    console.log(e.detail.path)
    wx.previewImage({
      urls: [e.detail.path]
    })
    wx.saveImageToPhotosAlbum({
      filePath: e.detail.path,
      success: res => {
        wx.showToast({
          title: '已保存到系统相册'
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  preventEvent() { }


})