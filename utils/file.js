const { all } = require('axios');
const fs = require('fs')
const path = require('path');
const pdf = require('pdf-poppler');

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

async function pdfToJpeg(filePath){
 
    let opts = {
        format: 'jpeg',
        out_dir: path.dirname(filePath),
        out_prefix: path.basename(filePath, path.extname(filePath)),
        page: 1
    }
    
    await pdf.convert(filePath, opts)
        .then(res => {
            console.log('PDF to JPG successful');
        })
        .catch(error => {
            console.error(error);
        })
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