import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import * as firebase from "firebase";
import * as firebaseui from "firebaseui";

import "firebaseui/dist/firebaseui.css";

Vue.config.productionTip = true;

const configOptions = {
  apiKey: "AIzaSyDXH8uEcdF0lUlnxg5xg1Qj23zfaRHpaIM",
  authDomain: "mazashib-faf91.firebaseapp.com",
  databaseURL: "https://mazashib-faf91.firebaseio.com",
  projectId: "mazashib-faf91",
  storageBucket: "mazashib-faf91.appspot.com",
  messagingSenderId: "513611654131",
  appId: "1:513611654131:web:e6e51c92314d67b973e886",
  measurementId: "G-Y1KFPE5E0K"
};

firebase.initializeApp(configOptions);

new Vue({
  render: h => h(App),
  data() {
    return {
      firebase: firebase,
      firebaseui: firebaseui
    };
  },
  store
}).$mount("#app");
