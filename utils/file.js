const fs = require('fs')
const path = require('path');
const { exec } = require('child_process');

// function to accept only pdf and jpeg/jpg file types to be uploaded
function uploadFilter (req, file, cb) {

    if (file.mimetype=== 'image/jpeg'||file.mimetype=== 'image/jpg'||file.mimetype=== 'application/pdf'){
        cb(null, true)
    }
    else{cb(null, false)}
}

function fileName(req, file, cb){
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const fileExtension = file.mimetype.split('/')[1]
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + fileExtension)
}

async function pdfToJpeg(pdfPath) {
    return new Promise((resolve, reject) => {
      const jpgPath = pdfPath + '.jpg'
      const command = `convert -density 300 "${pdfPath}[0]" "${jpgPath}"`;;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

function fileExists(filePath, cb){
    fs.access(filePath, fs.constants.F_OK, (err) => {
        cb(err)
      });
}
module.exports.uploadFilter = uploadFilter
module.exports.pdfToJpeg = pdfToJpeg
module.exports.fileName = fileName
module.exports.fileExists = fileExists