//请求地址配置以及一些相关信息配置

export const config = {
url: 'https://web.gulongys.com/gulong/',//正式     wx537617c30c5161ea
//url: 'https://gulong.smartmapdt.com/gulong/', //测试     wxa2b1c6a5f27b3244
//url:'http://192.168.1.124:8080/gulong/',   
//url:'http://192.168.1.199:8080/gulong/', 
//url: 'http://192.168.1.102:8080/gulong/',
  id:'wx537617c30c5161ea',
  appName: '古龙嘀膳',
  version: 'V1.1.0',
  mapkey: 'WOIBZ-22QHJ-3MTFF-KZGQL-IZDVF-DABL2',//腾讯地图
  debug:false,       //测试环境，目前只牵扯到 经纬度
  sales:85,   // 折扣
}

const Url = {
  getUserInfo:'mobile/frontMobileUser/newMobileUser',   //获取用户信息
  getPhone:'rest/getPhoneNumber',         //获取电话号码
  updateUserInfo:'mobile/frontMobileUser/updateMobileUser',
  addAddress:'mobile/mobileUserAddress/saveOrUpdateUserAddress',//新增、保存地址
  addressList:'mobile/mobileUserAddress/listUserAddress',    //地址列表
  deleteAddress:'mobile/mobileUserAddress/deleteUserAddress',//删除地址
  indexShop:'mobile/frontMallGoods/goodsList',//首页商品列表
  noticeList:'mobile/frontMallNotify/notifyList',//活动公告列表
  swiperImg:'mobile/frontMallAd/adInIndex',//广告
  dateBusiness:'rest/timeList/schedule',//首页的下单时间列表
  matinglist:'mobile/frontMallGoods/compoundFoodList',//配套商品列表
  addorder:'mobile/frontMallOrder/addOrder',//下单
  pay:'rest/weixinPay',//支付
  defaultaddress:'mobile/mobileUserAddress/defaultAddress',//请求默认地址
  orderlist:'mobile/frontMallOrder/queryOrderInfoList',//订单列表
  inventory:'mobile/frontMallGoods/loadByInventoryId',//拼团的份数
  assembleAdd:'mobile/frontMallOrder/groupOrder',//拼团下单接口
  assembleList:'mobile/frontMallOrder/findGroupOrderList',//拼团列表
  joinAssemble:'mobile/frontMallOrder/joinGroupOrder',//参加拼团
  orderdetail:'mobile/frontMallOrder/orderDetail',//订单详情
  isBranches:'mobile/frontMallBranches/loginBranchesByUser',//判断用户是否可以登录网点端
  branchesInfo:'mobile/frontMallBranches/countByBranches',//网点端相关信息
  assembleFail:'mobile/frontMallOrder/groupFail',//拼团失败
  branchesOrder:'mobile/frontMallBranches/queryOrderByTime',//网点端订单列表
  branchesCount:'mobile/frontMallBranches/countByBranches',//网点端订单数据
  getPsf:'mobile/mobileUserAddress/feeByAddress',//获取配送费
  print: 'rest/ylyAPI/printOrderInfo',//打印
  checkaddress:'mobile/mobileUserAddress/judgeAddress',//检查地址
  peis:'mobile/frontMallOrder/sendToDada',//呼叫骑手
  getPtInfo:'mobile/frontMallOrder/orderDetailByNo',//获取拼团信息
  chooseList:'mobile/frontAddress/listAddress',//选择地址列表


  //企业端
  qyGoods:"mobile/frontMallGoods/listEnterpriseGoods",  //企业端商品列表
  qyAdd:'mobile/enterpriseOrder/addEnterpriseOrder',//企业端下单
  qyInfo:'mobile/enterpriseOrder/enterpriseIndex',//企业信息
  qyCz:'mobile/recharge/rechargeRecord',//企业充值
  czList:'mobile/recharge/rechargeDetail',//充值信息列表
  ygList:'mobile/enterpriseOrder/queryEmployeesList',//企业员工列表
  ygOrder:'mobile/enterpriseOrder/queryEnterpriseOrderList',//企业员工订单
  qyOrder:'mobile/enterpriseOrder/queryEnterpriseOrderList',//企业管理员订单
  qyOrderNum:'mobile/enterpriseOrder/enterpriseOrderByTime',//企业订单数

  // 团长端
  tzZhifubao:"mobile/frontMobileUser/updateZhifubao",//团长端支付宝账户
  tzWithdrawal: "mobile/FrontMallApply/saveMallApply",//团长端申请提现
  tzTxlist:"mobile/FrontMallApply/listMallApply",//团长端提现明细
  tzInfo:"mobile/frontMobileUser/mobileUserGroup",//团长信息
  tzJllist:"mobile/frontMobileUser/getUserBill",//团长端奖励明细
  tzfan:'mobile/frontMobileUser/myFollow',//团长粉丝列表
  tashare:'mobile/frontMobileUser/follow',//团长端分享页面绑定
  bankList:'mobile/frontBank/list',//银行列表
  notice:'mobile/frontNotes/list',//通告
  
}

export {Url}