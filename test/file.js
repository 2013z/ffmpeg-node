
// 仅测试用 嵌入到后台后删除
// const multer = require('multer');
// const upload = multer({ desc: '../public/input/'})
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
/**
 * @param {String} fileName 文件名
 * @todo 上传文件
 */
async function uploadFile (app, req, res) {
    let files = [];
    try {
        files = await app.$multiUpload(req, res)
    } catch(err) {
        console.log(err);
        return null;
    }
    return files;
}

/**
 * @param {FileReaders} files 
 * @todo 删除文件
 */
function removeFiles(files) {
    for (let i = 0; i < files.length; i++) {
        fs.unlinkSync('public/input/' + files[i].filename);
    }
}

/**
 * @param {FileReader} fileName 文件名
 * @param {String} imgName 水印图片名称
 * @todo 添加图片水印
 */
function addImgWatermark (imgName, resUrls, fileName) {
    return new Promise((resolve, reject) => {
        ffmpeg(path.join('public/input', fileName))
        .input(path.join('public/input', imgName))
        .inputOptions(
            '-filter_complex','overlay=10:10'
        ).on('error',  (err) => {
            console.log('水印添加错误: ' + err.message);
            reject(err.message)
        }).on('end',  () => {
            resUrls.push('virtual-key:realurl' + fileName)
            resolve();
        }).save(path.join('public/output', 'zego-' + fileName));
    });
}

/**
 * @param {FileReader} fileName 文件名
 * @param {String} username 用户名称
 * @param {String} width 文字水印宽
 * @param {String} height 文字水印高
 * @todo 添加文字水印
 */
function addFontWatermark (username, resUrls, fileName, width = 100, height = 100) {
    return new Promise((resolve, reject) => {
        // 获取视频大小信息, 将文案贴到对应到下角
        ffmpeg(path.join('public/input', fileName))
        .videoFilters(`drawtext=fontfile=simhei.ttf:text=${username}:x=${width}:y=${height}:fontsize=24:fontcolor=yellow:shadowy=2`)
        .on('error',  (err) => {
            console.log('文字水印添加错误: ' + err.message);
            reject(err.message)
        }).on('end', () => {
            resUrls.push('virtual-key:realurl' + fileName)
            resolve();
        }).save(path.join('public/output', 'zego-' + fileName));
    });
}

module.exports = (app) => {
    // 添加图片水印
    app.post('/watermark/img', async (req, res, next) => {
        let files = [];
        let resUrls = [];
        try {
            files = await uploadFile(app, req, res)
            if (!files) return res.send({ ...app.$msg["ERROR_ARG"] });
            for (const file of files) {
                await addImgWatermark('logo.png', resUrls, file.filename);
            }
            removeFiles(files);
            return res.send({ ...app.$msg["SUCCESS"], data:  resUrls })
        } catch(err) {
            return res.send({ ...app.$msg["ERROR"] });
        }
    });
    // 添加文字水印
    app.post('/watermark/font', async (req, res, next) => {
        let files = [];
        let resUrls = [];
        let username= '';
        try {
            files = await uploadFile(app, req, res)
            username = req.body.username;
            if (!files) return res.send({ ...app.$msg["ERROR_ARG"] });
            for (const file of files) {
                await addFontWatermark(username,resUrls, file.filename);
            }
            removeFiles(files);
            return res.send({ ...app.$msg["SUCCESS"], data: resUrls })
        } catch(err) {
            return res.send({ ...app.$msg["ERROR"] });
        }
    });
}