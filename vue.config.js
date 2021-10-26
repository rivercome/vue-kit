"use strict";
const path = require("path");
const webpack = require("webpack");
function resolve(dir) {
  return path.join(__dirname, dir);
}
console.log("process.env.NODE_ENV", process.env.NODE_ENV);
module.exports = {
  publicPath: "/",
  outputDir: "dist",
  assetsDir: "static",
  // 设置是否在开发环境下每次保存代码时都启用 eslint验证 ‘warning’：开启每次保存都进行检测，lint 错误将显示到控制台命令行，而且编译并不会失败。
  lintOnSave: "warning",
  // 是否使用包含运行时编译器的 Vue 构建版本
  // runtimeCompiler: true,
  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建
  productionSourceMap: true,
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: "kit",
    resolve: {
      alias: {
        "@": resolve("src"),
      },
    },
  },
  chainWebpack: (config) => {
    //命名
    // config.resolve.alias.set("@", resolve("src"));
  },
};
