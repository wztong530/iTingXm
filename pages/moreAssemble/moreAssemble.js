// pages/moreAssemble/moreAssemble.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:'详情',
    timeout:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var list = JSON.parse(options.data),man =options.man
    this.setData({
      list,
      man
    }) 
    this.loaddata()
  },
  loaddata(){
    var data = this.data, arr = this.data.timeout
    data.list.forEach((item,index)=>{
      let residue = item.groupEndTime - new Date().getTime(), time
      if (residue > 0) {
        //计算出相差天数
        var d = Math.floor(residue / (24 * 3600 * 1000))
        //计算出小时数
        var leave1 = residue % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
        var h = Math.floor(leave1 / (3600 * 1000))
        //计算相差分钟数
        var leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
        var m = Math.floor(leave2 / (60 * 1000))
        //计算相差秒数
        var leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
        var s = Math.round(leave3 / 1000),
          len = arr.push({
            str: this.formatTime(d, h, m),
            h,
            m,
            s,
            d,
            success: true
          })
        //定时器写在这误差会比较小
        setTimeout(() => {
          this.formatTimeOut(index)
          arr[len - 1].interval = setInterval(() => {
            this.formatTimeOut(index)
          }, 60000)
        }, s * 1000)
      } else {
        arr.push({
          str: '00:00',
          success: false
        })
      }
    })
    this.setData({
      timeout: arr
    })
  },
  //定时器处理函数
  formatTimeOut(index) {
    var data = this.data.timeout[index],
      h = data.h,
      m = data.m,
      d = data.d,
      success = data.success,
      interval = data.interval
    m--
    if (m < 0) {
      m = 59
      h--
      if (h < 0) {
        if (d != 0) {
          d--
          h = 24
        } else {
          h = 0
          m = 0
          success = false
          clearInterval(data.interval)
          interval = null
          this.changeStatus(index)
        }
      }
    }
    this.setData({
      ['timeout[' + index + ']']: {
        str: this.formatTime(d, h, m),
        h,
        m,
        d,
        success,
        interval
      }
    })
  },
  formatTime(d, h, m) {
    var str
    h = this.formatNum(h)
    m = this.formatNum(m)
    if (d == 0) {
      str = h + '时' + m
    } else {
      str = d + '天' + h + '时' + m
    }
    return str
  },
  formatNum(num) {
    if (num < 10) return '0' + num
    return num
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

  },
  join(e){
    let pageArr = getCurrentPages(),
      page = pageArr[pageArr.length - 2]
      page.joinAssemble(e)
      wx.navigateBack({
        delta:-1
      })
  }
})