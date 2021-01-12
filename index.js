const path = require('path');
const express = require('express');
const app = express();
const multer = require('multer')
const http = require('http');
app.use(express.static(path.join(__dirname, 'public')))
app.set('port', 8848);
app.$msg = {
    'ERROR': { status: -1, msg: '操作失败', data: {} },
    'SUCCESS': { status: 0, msg: '操作成功', data: {} },
    'ERROR_ARG': { status: -2, msg: '参数错误', data: {} },
    'ERROR_UPLOAD': { status: -3, msg: '上传错误', data: {} },
}
require('./uploader.js')(app, {}, multer);
require('./test/file.js')(app);
http.createServer(app).listen(8848, () => { console.log("open 8848") });

// 前后端处理端流程
// 1.前端上传文件到服务器上（暂不支持多上传）
// 2.后端拿到文件后 先存储文件并加水印
// 3.后端处理完水印后 返回对应新的文件key（这里文件名即为key 后期再做唯一key-value映射）
// 4.前端拿到url就可以了

// 核心功能
// 1.通过ffmpeg处理音视频（水印）

// 第一种方案
// 引用git处理资源 
//      => 水印需在上传的时候，由用户直接处理视频水印 (前端页面上处理水印存在兼容性)
//      => 需要用户引入fls
//      => 上传视频hook key-value映射 存在前端展示视频列表拉取不到/多走链路（内网使用无必要性）
// 结论：对用户来说很麻烦

// 第二种方案
// 引入后台处理资源
//      => 需要占用后台资源，同时对开发者来说成本增大
// 结论：对开发来说很麻烦

// 针对第二种方案对优化
// 1.可以将需要到资源嵌入到现有到后台中，同时复用了现有后台的管理权限（不仅仅针对开发者而言）

