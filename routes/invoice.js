const { Router } = require('express');
const router = Router();
const fs = require('fs')
const multer = require('multer')
const axios = require('axios')
const fileUtils = require('../utils/file')
const path = require('path')
const Invoice = require('../models/invoice')


const ML_SERVER_ADDRESS = 'http://127.0.0.1:5000/'

// disk storage engine for invoices
const invStorage = multer.diskStorage({
    destination: '/uploads/invoices',
    filename: fileUtils.fileName
})

// disk storage engine for receipts
const recStorage = multer.diskStorage({
  destination: '/uploads/receipts',
  filename: fileUtils.fileName
})

// #1: use for disk storage as declared in storage.destination attributes
const uploadInv = multer({ storage:invStorage, fileFilter: fileUtils.uploadFilter})
const uploadRec = multer({ storage:recStorage, fileFilter: fileUtils.uploadFilter})

// #2: use for storage  in uploads/invoices and uploads/receipts relative to project directory
// const uploadInv = multer({ dest:'uploads/invoices', fileFilter: fileUtils.uploadFilter})
// const uploadRec = multer({ dest:'uploads/receipts', fileFilter: fileUtils.uploadFilter})

router.get('/', async(req, res)=>{
  const result = await Invoice.findById(req.body.id)
  res.send(result)
})

// find all invoices which match filter criteria
router.get('/filter', async(req, res)=>{

  try{
      const invoices = await Invoice.find(req.query)
      res.send(invoices)
  }
      catch(err){res.status(500)}
})

router.get('/all', async(req, res)=>{
  const result = await Invoice.find()
  res.send(result)
})

// POST endpoint to submit invoice in jpeg/jpg/pdf format
router.post('/scaninv', uploadInv.single('invoice'), async(req, res)=> {
  let filePath;
  try {filePath = req.file.path}
    catch(err){res.status(400).send({error: 'Invalid file type, select jpg, jpeg or pdf'})}
  
  // convert pdf to jpeg in place
  if (req.file.mimetype==='application/pdf'){
    try{await fileUtils.pdfToJpeg(filePath)}
      catch(err){res.status(500).send({error: 'Could not process file'})}
      fs.unlink(filePath, (err)=>console.log(err))
    // file extension changed to jpg
    filePath = filePath.slice(0, -4) + '-1' + '.jpg'
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


// POST endpoint to submit receipt in jpeg/jpg/pdf format
router.post('/scanrec', uploadRec.single('receipt'), async(req, res)=> {
  let filePath;
  try {filePath = req.file.path}
    catch(err){res.status(400).send({error: 'Invalid file type, select jpg, jpeg or pdf'})}
  
  // convert pdf to jpeg in place
  if (req.file.mimetype==='application/pdf'){
    try{await fileUtils.pdfToJpeg(filePath)}
      catch(err){res.status(500).send({error: 'Could not process file'})}
      fs.unlink(filePath, (err)=>console.log(err))
    // file extension changed to jpg
    filePath = filePath.slice(0, -4) + '-1' + '.jpg'
  }

  fileUtils.fileExists(filePath, (err)=>{
    if (err){
      filePath = filePath.slice(0, -6) + '-01' + '.jpg'
      fileUtils.fileExists(filePath, (err)=>{
        if (err){res.status(500).send({error: err})}
        else{res.send({path: filePath})}
      })
    }
    else(res.send({path: filePath}))
  })
  
});

router.post('/add', async(req, res)=> {
  // process file path so only files within /uploads/ can be stored, 
  // prevent accidental deletion of other files
  let filePath;
  if (req.body.Path){
    filePath = path.format({
      dir: 'C:\\uploads\\invoices',
      base: path.basename(req.body.Path)
    })
  }
  
  let recPath;
  if (req.body.RecPath){
    recPath = path.format({
      dir: 'C:\\uploads\\receipts',
      base: path.basename(req.body.RecPath)
    })
  }

  const invoice = new Invoice({
    // User: req.body.User
    InvoiceNumber: req.body.InvoiceNumber,
    Path: filePath,
    RecPath: recPath,
    Date: req.body.Date || Date(),
    BeforeGST: req.body.BeforeGST,
    GST: req.body.GST,
    Discount: req.body.Discount,
    GrandTotal: req.body.GrandTotal,
    Product: req.body.Product,
    Soa: req.body.Soa,
    Supplier: req.body.Supplier,
  });

  try{
    const result = await invoice.save()
    res.send(result)
  }
    catch(err){res.status(400).send({error: err.message})}
})

router.put('/setpaid', async(req, res)=>{
  try{
    const invoice = await Invoice.findById(req.body.id).populate('Soa')
    if (!invoice) {res.status(400)}
    if (invoice.Soa && !invoice.Soa.Paid) {res.status(400)}
    invoice.set({
        PaidDate: Date(),
        Paid: true
    })
    const result = await invoice.save()
    res.send(result)
  }
    catch(err){res.send({error: err})}
})

router.delete('/delete/:id', async(req, res)=>{
  Invoice.findById(req.params.id)
    .then((result)=> {
      fs.unlink(result.Path, (err)=>{})
      if (result.RecPath){
        fs.unlink(result.RecPath, (err)=>{})
      }
    })
  Invoice.findByIdAndDelete(req.params.id)
    .then((deletedInvoice)=>res.send(deletedInvoice))
    .catch((err)=> res.status(500).send(err))
})

module.exports = router;