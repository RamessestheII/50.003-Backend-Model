const { Router } = require('express');
const router = Router();
const fs = require('fs')
const multer = require('multer')
const axios = require('axios')
const fileUtils = require('../utils/file')
const ML_SERVER_ADDRESS = require('../utils/const')
const path = require('path')
const Invoice = require('../models/invoice')

// use for storage  in uploads/invoices and uploads/receipts relative to project directory
const uploadInv = multer({ dest:'uploads/invoices', fileFilter: fileUtils.uploadFilter})
const uploadRec = multer({ dest:'uploads/receipts', fileFilter: fileUtils.uploadFilter})

router.get('/', async (req, res) => {
  try {
    const data = await Invoice.findById(req.query.id);
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
    const data = await Invoice.find({}).populate('Supplier','SupplierName -_id');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get('/filter', async (req, res) => {
  try {
    let queryObject = {}
    if (req.query.Paid){queryObject.Paid=req.query.Paid}
    if (req.query.Supplier){queryObject.Supplier=req.query.Supplier}
    if (req.query.InvoiceNumber){queryObject.InvoiceNumber=req.query.InvoiceNumber}
    // TODO: Query by Date
    const data = await Invoice.find(queryObject).populate('Supplier', 'SupplierName -_id');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// POST endpoint to submit invoice in jpeg/jpg/pdf format
router.post('/scaninv', uploadInv.single('invoice'), async(req, res)=> {
  let filePath;
  try {filePath = req.file.path}
    catch(err){res.status(400).send({error: 'Invalid file type, select jpg, jpeg or pdf'})}

  // convert pdf to jpeg in place
  if (req.file.mimetype==='application/pdf'){
    try{
      await fileUtils.pdfToJpeg(filePath)
      fs.unlink(filePath, (err)=>{if (err){console.log(err)}})
    }
      catch(err){
        fs.unlink(filePath, (err)=>console.log(err))
        return res.status(500).send({error: 'PDF to JPG failed'})
      }

  }
  else{
    // add .jpg to file name
    fs.renameSync(filePath, filePath + '.jpg')
  }

  // fix file path before returning to user
  filePath = filePath + '.jpg'

   // read file data into a buffer
  let fileData;
  
  try {fileData = fs.readFileSync(filePath)}
    // in case of multi-page pdf upload
    catch(err){
      return res.status(500).send({error: err})
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
    catch(err){return res.status(400).send({error: 'Invalid file type, select jpg, jpeg or pdf'})}
  
  // convert pdf to jpeg in place
  if (req.file.mimetype==='application/pdf'){
    try{
      await fileUtils.pdfToJpeg(filePath)
      fs.unlink(filePath, (err)=>{if (err){console.log(err)}})
    }
      catch(err){
        fs.unlink(filePath, (err)=>console.log(err))
        return res.status(500).send({error: 'PDF to JPG failed'})
      }

  }
  else{
    // add .jpg to file name
    fs.renameSync(filePath, filePath + '.jpg')
  }

  // fix file path before returning to user
  filePath = filePath + '.jpg'

  fileUtils.fileExists(filePath, (err)=>{
    if (err){
      return res.status(500).send({error: err})
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
      dir: 'uploads\\invoices',
      base: path.basename(req.body.Path)
    })
  }
  
  let recPath;
  if (req.body.RecPath){
    recPath = path.format({
      dir: 'uploads\\receipts',
      base: path.basename(req.body.RecPath)
    })
  }

  const invoice = new Invoice({
    User: req.body.User,
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