//请求使用
import axios from 'axios'
import VueAxios from 'vue-axios'
import Vue from 'vue'
import ElementUI, {Loading} from 'element-ui';
import store from '../store/store'

let loading; //定义loading变量
let num = 1;

function startLoading(text) { //使用Element loading-start 方法
    let loadingText = "请稍等...";
    if (text) {
        loadingText = text + '...';
    }
    loading = Loading.service({
        lock: true,
        text: loadingText,
        background: 'rgba(0, 0, 0, 0.2)'
    })
}

function endLoading() { //使用Element loading-close 方法
    loading.close()
}

let needLoadingRequestCount = 0

export function showFullScreenLoading(text) {
    if (needLoadingRequestCount === 0) {
        startLoading(text);
    }
    needLoadingRequestCount++
}

export function tryHideFullScreenLoading() {
    if (needLoadingRequestCount <= 0) return
    needLoadingRequestCount--
    if (needLoadingRequestCount === 0) {
        endLoading()
    }
}

//axios配置和处理
Vue.use(VueAxios, axios);
// axios.defaults.baseURL = '/axios';//项目的的基础url
axios.defaults.baseURL = '/';//项目的的基础url
axios.defaults.headers.common['Authorization'] = "";//请求token信息配置
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';//请求type设置
axios.defaults.timeout = 900000;//在超时前，所有请求都会等待30秒
// 添加请求拦截器
axios.interceptors.request.use(function (config) {
    // 在发送请求之前处理
    // config.headers.common['Authorization'] = localStorage.getItem('Authorization');//判断token在前台session中是否存在
    //请求loading处理
    if (config.data) {
        let needLoading = config.data.needLoading;
        let loadingText = config.data.loadingText;
        if (needLoading == true) {
            showFullScreenLoading(loadingText);
        }
        //清除掉不需要的参数
        delete config.data["needLoading"];
        delete config.data["loadingText"];
    }
    /*
    * 这段代码解决添加loading 只能再data中添加needLoading和loadingText
    * 可以在axios中直接添加needLoading和loadingText,这两个参数和method,url同级
    * */
    let needLoading = config.needLoading;
    let loadingText = config.loadingText;
    if (needLoading == true) {
        showFullScreenLoading(loadingText);
    }
    //清除掉不需要的参数
    delete config["needLoading"];
    delete config["loadingText"];

    //IM桌面端跳转oa使用
    if (localStorage.getItem('SingleSignOnAegisAegisTicket')) {
        config.headers.common['singlesignonaegiscookietoken'] = localStorage.getItem('SingleSignOnAegisAegisTicket');
        config.headers.common['systemtype'] = "dfmmobile";
    }
    return config;
}, function (error) {
    // 对请求错误做处理
    return Promise.reject(error);
});
// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    // 对响应数据处理
    tryHideFullScreenLoading();
    if (response && (response.status == 200)) {
        if (response.data.code == '401') {
            localStorage.clear();
            window.location.reload();
            return false;
        }
        if (response.data.exceptionMes) {
            ElementUI.MessageBox({
                type: 'info',
                title: response.data.exceptionMes,
                message: response.data.debugMes
            });
        }

        if (response.headers["content-type"] == "text/html") {
            window.location.href = response.request.responseURL
        } else {
            return response.data;
        }
    }
    return response;
}, function (error) {
    tryHideFullScreenLoading();
    // 对响应错误处理
    if (error.response && error.response.status == 401) {
        let loginUrl = error.response.headers.singlesignonaegisheaderloginurl;
        let notLogin = error.response.headers.singlesignonaegisheadernotlogin;
        localStorage.removeItem('SingleSignOnAegisAegisTicket')
        if (notLogin == "Y") {
            window.location.href = loginUrl
        } else {
            if (!loginUrl) {
                ElementUI.MessageBox({
                    type: 'info',
                    title: '提示',
                    message: '登陆过期，未获取到要跳转的登录地址！',
                    confirmButtonText: '确定',
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                        }
                        done();
                    }
                })
                return false;
            }
        }

        store.commit("logStatus/changeLoginUrl", loginUrl);
        if (error.config.url.indexOf("homePage") != -1) {
            store.commit("logStatus/changeWindowReload", true);
        }
        store.commit("logStatus/changeLoginVisable", true);
        //去登陆 执行login
        /*  ElementUI.MessageBox({
                  type: 'info',
                  title: '提示',
                  message: '登录已过期，请您重新登录！',
                  confirmButtonText: '去登陆',
                  beforeClose: (action, instance, done) => {
                      if (action === 'confirm') {
                          window.location.replace("http://10.10.4.221:8101/mh001/login.html?toUrl=http://user-manager:8080/WorkflowManager/login");
                      }
                      done();
                  }
              }
          );*/
    }
    //其他地方登陆处理
    if (error.response && error.response.status == 501 && store.state.logStatus.changeLoginVisable != true) {
        let loginUrl = error.response.headers.singlesignonaegisheaderloginurl;
        let notLogin = error.response.headers.singlesignonaegisheadernotlogin;
        if (num == 1) {
            num++;
            ElementUI.MessageBox({
                type: 'info',
                title: '提示',
                message: '您的账号已在其他地点登陆，请您重新登陆！',
                confirmButtonText: '确定',
                beforeClose: (action, instance, done) => {
                    if (action === 'confirm') {
                    }
                    done();
                }
            })
            if (notLogin == "Y") {
                window.location.href = loginUrl
            } else {
                if (!loginUrl) {
                    ElementUI.MessageBox({
                        type: 'info',
                        title: '提示',
                        message: '登陆过期，未获取到要跳转的登录地址！',
                        confirmButtonText: '确定',
                        beforeClose: (action, instance, done) => {
                            if (action === 'confirm') {
                            }
                            done();
                        }
                    })
                }
            }
            store.commit("logStatus/changeLoginUrl", loginUrl);
            store.commit("logStatus/changeLoginVisable", true);
            store.commit("logStatus/changeWindowReload", true);
            return;
        }

    }
    // if (error.response && error.response.status == 500) {
    //     ElementUI.MessageBox({
    //         title: '提示',
    //         message: '服务器未启动或正在重启，请稍后再试！'
    //     });
    // }
    return Promise.reject(error.response.data || error.response);
});
Vue.prototype.$axios = axios;//定义调用方式




