import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {}
  },
  mutations: {
    SET_USER: (state, payload) => {
      state.user = payload;
    }
  },
  actions: {
    // LOGIN: async (context, payload) => {
    //   context.commit("SET_USER", data.data.Data);
    // },
    // LOGOUT: (context, payload) => {
    //   context.commit("SET_USER", undefined);
    // }
  }
});
