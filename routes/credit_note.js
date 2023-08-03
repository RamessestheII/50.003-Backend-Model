const { Router } = require('express');
const router = Router();
const fs = require('fs')
const multer = require('multer')
const axios = require('axios')
const fileUtils = require('../utils/file')
const path = require('path')
const ML_SERVER_ADDRESS = require('../utils/const')
const CreditNote = require('../models/credit_note')



// use for storage  in uploads/credit_notes relative to project directory
const upload = multer({ dest:'uploads/credit_notes', fileFilter: fileUtils.fileFilter})

router.get('/', async (req, res) => {
  try {
    const data = await CreditNote.findById(req.query.id);
    if (!data) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get('/all', async (req, res) => {
  try {
    const data = await CreditNote.find({});
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get('/filter', async (req, res) => {
  try {
    let queryObject = {}
    if (req.query.SupplierName){queryObject.SupplierName=req.query.SupplierName}
    const data = await CreditNote.find(queryObject);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});
// POST endpoint to submit credit note  in jpeg/jpg/pdf format
router.post('/scan', upload.single('credit_note'), async(req, res)=> {
  let filePath;
  try {filePath = req.file.path}
    catch(err){res.status(400).send({error: 'Invalid file type, select jpg, jpeg or pdf'})}
  
  // convert pdf to jpeg in place
  if (req.file.mimetype==='application/pdf'){
    try{await fileUtils.pdfToJpeg(filePath)}
      catch(err){res.status(500).send({error: 'Could not process file'})}
      fs.unlink(filePath, (err)=>console.log(err))
    // file extension changed to jpg
    filePath = filePath + '-1' + '.jpg'
  }
  else{
    // add .jpg to file name
    fs.renameSync(filePath, filePath + '.jpg')
    filePath = filePath + '.jpg'
  }

   // read file data into a buffer
  let fileData;

  try {fileData = fs.readFileSync(filePath)}
    // in case of multi-page pdf upload
    catch(err){
      filePath = filePath.slice(0, -6) + '-01' + '.jpg'
      try{fileData = fs.readFileSync(filePath)}
        catch(err){res.status(500).end()}
    }

  // send file data to ML server
  axios.post(ML_SERVER_ADDRESS, {
      file: {
          value: fileData,
          type: 'invoice'
        }
    })
    // send processed json data to frontend
    .then((response)=> {
      res.json({result: response.data, path: filePath})
    })
    .catch(function (err) {
      res.status(500).send({error: err});
    });
});

router.post('/add', async(req, res)=>{
  // process file path so only files within /uploads/ can be stored, 
  // prevent accidental deletion of other files
  const filePath = path.format({
    dir: 'uploads\\credit_notes',
    base: path.basename(req.body.Path)
  })
  const credit_note = new CreditNote({
    User: req.body.User,
    Supplier: req.body.Supplier,
    Date: req.body.Date || Date(),
    Path: filePath,
    GrandTotal: req.body.GrandTotal,
    Product: req.body.Product
  });

  try{
    const result = await credit_note.save()
    res.send(result)
  }
    catch(err){res.send({error: err})}
})


router.delete('/delete/:id', (req, res)=>{
    CreditNote.findById(req.params.id)
    .then((result)=> {fs.unlink(result.Path, (err)=>{})})
    .then(()=>CreditNote.findByIdAndDelete(req.params.id))
    .then((deletedCreditNote)=>res.send(deletedCreditNote))
    .catch((err)=> res.status(500).send({err}))
})



module.exports = router;