/*
 * @Descripttion:
 * @version:
 * @Author: zqs
 * @Date: 2020-06-15 22:26:38
 * @LastEditors: zqs
 * @LastEditTime: 2020-10-08 17:27:13
 */
module.exports = (db, o, m) => {
  if (!db) {
    return {}
  }
  // const options = require('./../config/oss')
  const ossImagePath = 'yuehua/images/'
  const ossVideoPath = 'yuehua/video/'
  const ossDocPath = 'yuehua/doc/'
  const ossAudioPath = 'yuehua/audio/'
  const ossXlsxPath = 'yuehua/xlsx/'
  const storagePath = 'public/input'

  db.OSS_IMAGE_PATH = ossImagePath
  db.OSS_VIDEO_PATH = ossVideoPath
  db.OSS_DOC_PATH = ossDocPath
  db.OSS_AUDIO_PATH = ossAudioPath
  db.OSS_XLSX_PATH = ossXlsxPath
  db.STORAGE_PATH = storagePath

  // let oss = new o({
  //   region: options.region,
  //   accessKeyId: options.accessKeyId,
  //   accessKeySecret: options.accessKeySecret,
  // })
  // oss.useBucket(options.bucket)

  // 存储器
  let storage = m.diskStorage({
    destination: function (req, file, cb) {
      // 上传路径
      cb(null, db.STORAGE_PATH)
    },
    filename: function (req, file, cb) {
      // 文件名
      const fileExtIndex = file.originalname.indexOf('.');
      if (fileExtIndex !== -1) {
        const fileType = file.originalname.substr(fileExtIndex)
        cb(null, Date.now() + Math.floor(Math.random() * 100000).toString() + fileType)
      } else {
        cb('no file ext type');
      }
    },
  })

  // 上传
  let multer = m({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: function (req, file, cb) {
      cb(null, true)
    },
  })

  let single = multer.single("file")
  let multi = multer.array("files", 5)
  
  db.$multer = multer;

  // db.$oss = oss;
  db.$singleUpload = (req, res) => {
    return new Promise((resolve, reject) => {
      single(req, res, err => {
        if (err) {
          resolve(null)
        } else {
          resolve(req.file)
        }
      })
    })
  }
  db.$multiUpload = (req, res) => {
    return new Promise((resolve, reject) => {
      multi(req, res, err => {
        if (err) {
          resolve(null)
        } else {
          resolve(req.files)
        }
      })
    })
  }
  return {}
}
