import { createStore } from 'vuex'

export default createStore({
  state: {
    clickDates:[],
  },
  getters: {
  },
  mutations: {
    addClickDates(state, date){
      // 获取当前时间
      const currentDate = new Date(date);

      // 获取年、月、日
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");

      // 构建日期字符串
      const formattedDate = `${year}-${month}-${day}`;

      // 检查日期是否已经在 clickDates 列表中
      const index = state.clickDates.indexOf(formattedDate);

      if (index !== -1) {
        // 如果日期已经在 clickDates 列表中，则移除它
        state.clickDates.splice(index, 1);
      } else {
        // 如果日期不在 clickDates 列表中，则将它添加到列表中
        state.clickDates.push(formattedDate);
      }

      // console.log("state.clickDates", state.clickDates)
      
    },
  },
  actions: {
    addClickDates(context) {
      context.commit('addClickDates')
    }
  },
  modules: {
  }
})
