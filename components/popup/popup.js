// components/popup/popup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow:Boolean,
    isPopup:Boolean
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
    hide() {
      this.triggerEvent('hide')
    },
    preventNull(){}
  }
})
