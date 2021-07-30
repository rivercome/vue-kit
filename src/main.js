import Vue from "vue";
import App from "./App.vue"; // 入口文件
import router from "./router"; // 路由
import store from "./store"; // Vuex
import "./plugins/element"; // 基础UI库
import "./plugins/elementResetMessage"; // element 提示框不重复
import "./assets/reset.css"; // 基础样式表
import "./axios/axios"; // 网络请求库
import "./api"; // Api
import addRoutes from "./router/addRoutes"; // 动态生成路由

Vue.config.productionTip = false;
Vue.prototype.$addRoutes = addRoutes;
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
