import Vue from "vue";
import Vuex from "vuex";
import firebase from "firebase";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {},
    score: [],
    database: undefined
  },
  mutations: {
    SET_USER: (state, payload) => {
      state.user = payload;
    },
    SET_DATABASE: (state, payload) => {
      state.database = payload;
    },
    SET_SCOREBOARD: (state, payload) => {
      state.score = [];

      let temp = [];
      for (let key in payload) {
        temp.push(payload[key]);
      }

      temp.sort((a, b) => {
        if (a.score < b.score) {
          return 1;
        }
        if (a.score > b.score) {
          return -1;
        }

        return 0;
      });

      for (let i = 0; i < 10; i++) {
        state.score.push(temp[i]);
      }
    }
  },
  actions: {
    CONNECT_DATABASE: (contex, payload) => {
      if (payload) return;

      contex.commit("SET_DATABASE", firebase.database());
    },
    GET_SCOREBOARD: (contex, payload) => {
      if (payload) return;

      contex.state.database.ref().on("value", data => {
        contex.commit("SET_SCOREBOARD", data.val());
      });
    },
    INSERT_SCOREBOARD: (contex, payload) => {
      console.log(payload);

      contex.state.database.ref().push(payload);
    }
  }
});
