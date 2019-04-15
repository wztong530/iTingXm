// components/sharepopup/sharepopup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShare:{
      type:Boolean,
      value:false,
    },
    isShow:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    closePopup(){
      this.triggerEvent('hide')
    },
    sharePyq(){
      this.triggerEvent('sharePyq')
    }
  }
})
