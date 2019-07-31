//请求地址配置以及一些相关信息配置

export const config = {
  // url: 'http://192.168.1.218:8081/',//本地测试版

  url: 'https://abc.smartmapdt.com/itingxm/',//线上测试版
  id: 'wxc08cedc32dedd5a0',
  appName: 'i听厦门',
  version: 'V1.0.1',
  mapkey: 'WOIBZ-22QHJ-3MTFF-KZGQL-IZDVF-DABL2',//腾讯地图
  debug: false      //测试环境，目前只牵扯到 经纬度

}

const Url = {
  getUserInfo: 'mobile/stores/newUser',   //获取用户信息
  getPhone: 'mobile/stores/authorPhone',  //获取电话号码
  getKfPhone: 'rest/timeList/telePhone',  //获取客服电话
  updateUserInfo: 'mobile/stores/authorLogin',//更新用户信息
  navCategoryList: 'mobile/stores/navCategoryList', //导航列表
  advertList:'mobile/stores/advertList',//轮播广告(position-1首页 -2资讯)
  noticeList:'mobile/stores/noticeList',//公告列表
  chatroomList:'mobile/chat/chatroominfo/listChatRoom',//直播间列表
  chatroomProgramList:'mobile/chat/chatroominfo/listProgramByChatRoomId',//直播间节目列表
  chatroomProgramDetail:'mobile/chat/chatroominfo/getByUuid',//直播节目详情
  getChatRoomContent:'mobile/chat/chatroominfo/getChatRoomContent',//直播间历史纪录
  addLikeOrForward:'mobile/chat/chatroominfo/AddLikeOrForward',//直播间点赞type-1/转发type-2
  myMessageList:'mobile/private_chat/myMessageList',//用户消息列表
  chatLogList:'mobile/private_chat/checkChatLogList',//聊天记录

  radioList: 'mobile/stores/radioList',//i电台(mobileUserId为空)、主播电台(mobileUserId不为空)
  uploadFile:'wechat/upload/uploadFile',//get上传文件
  uploadPrograms:'mobile/stores/uploadPrograms',//上传节目
  programsList:'mobile/stores/programsList',//电台节目列表
  programsCommentsList:'mobile/stores/programsCommentsList',//电台节目评论列表
  programsComments:'mobile/stores/programsComments',//电台节目发表评论
  programsReplyList:'mobile/stores/programsReplyList',//评论详情(回复列表)
  playNum:'mobile/stores/playNum',//更新节目播放量
  likePrograms:'/mobile/stores/likePrograms',//节目点赞
  mainPageTraffic:'mobile/chat/traffic/mainPageTraffic',//首页路况互动
  trafficList:'mobile/chat/traffic/trafficList',//路况列表
  addTraffic:'mobile/chat/traffic/beOnTheAir',//新增路况
  newsCategoryList: 'mobile/stores/newsCategoryList',//资讯类别
  newsList: 'mobile/stores/newsList',//咨讯列表
  newsDetail:'mobile/stores/newsDetail',//资讯详情
  recommendList:'mobile/stores/recommendList',//资讯轮播
  anchorList: 'mobile/stores/anchorList',//主播列表
  activityList: 'mobile/stores/activityList',//平台活动列表
  activityDetail: 'mobile/stores/activityDetail',//活动详情
  activityIn: 'mobile/stores/activityIn',//活动报名提交信息
  applyInfo: 'mobile/stores/applyInfo',//报名信息(回显)
  focus:'mobile/stores/focus',//关注/取关主播
  updateViews: 'mobile/stores/views',//更新资讯阅读状态
  likeNews:'mobile/stores/likeNews',//资讯点赞
  myFocus:'mobile/stores/myFocus',//我的关注列表
  myActivity:'mobile/stores/myActivity',//我的活动列表
  publicDynamic:'mobile/stores/publicDynamic',//发布动态
  listDynamic:'mobile/stores/listDynamic',//用户动态列表
  detailDynamic:'mobile/stores/detailDynamic',//动态详情
  likeDynamic:'mobile/stores/likeDynamic',//动态点赞
  myIntegralList:'mobile/stores/MyIntegralList',//我的积分列表
  addIntegral:'mobile/stores/addIntegralByRuleIdAndUserId',//增加积分
  activityQrCode:'mobile/stores/activityQrCode',//通过小程序码转发活动
  newsQrCode:'mobile/stores/newsQrCode',//通过小程序码转发咨询
  anchorPageQrCode: '/mobile/stores/anchorPageQrCode',//主播端转发通过小程序码
  categoryQrCode: 'mobile/stores/categoryQrCode',//电台栏目转发通过小程序码
  chatProgramQrCode: 'mobile/chat/chatroominfo/chatProgramQrCode',//路况和直播间转发通过小程序码
  dynamicQrCode: 'mobile/stores/dynamicQrCode',//动态转发通过小程序码
  parameter:'mobile/stores/parameter',//粉丝、访问量、关注公众号弹窗图、客服电话、路况互动图
  wxMsgCheck:'mobile/stores/wxMsgCheck',//检查敏感词
  frontDelete: 'mobile/stores/frontDelete',//删除功能[objectId=,flag=program/dynamic]
  userDetail:'mobile/stores/userDetail',//主播主页详情
  categoryDetail:'mobile/stores/categoryDetail',//电台节目列表详情
  fuzzyQuery:'mobile/stores/fuzzyQuery',//模糊查询
  classifiedQuery:'mobile/stores/classifiedQuery',//分类型查询
  getQueryHistory:'mobile/stores/getQueryHistory',//查询历史记录
}


export { Url }