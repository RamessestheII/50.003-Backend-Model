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

module.exports.uploadFilter = uploadFilter
module.exports.pdfToJpeg = pdfToJpeg