const { Router } = require('express');
const router = Router();
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const axios = require('axios')
const fileUtils = require('../utils/file')
const Soa = require('../models/soa');
const Invoice = require('../models/invoice');
const ML_SERVER_ADDRESS = require('../utils/const')


// #2: use for storage  in uploads/soas relative to project directory
const upload = multer({ dest:'uploads/soas', fileFilter: fileUtils.fileFilter})

router.get('/', async (req, res) => {
  try {
    const data = await Soa.findById(req.query.id);
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
    const data = await Soa.find({});
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get('/filter', async (req, res) => {
  try {
    let queryObject = {}
    if (req.query.Supplier){queryObject.Supplier=req.query.Supplier}
    if (req.query.Paid){queryObject.Paid=req.query.Paid}
    if (req.query.PaidDate){queryObject.PaidDate=req.query.PaidDate}
    // TODO: Query by Date and DueDate
    const data = await Soa.find(queryObject);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// POST endpoint to submit soa  in jpeg/jpg/pdf format
router.post('/scan', upload.single('soa'), async(req, res)=> {
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
          type: 'statement'
        }
    })
    // send processed json data to frontend
    .then((response)=> {
      res.json({result: response.data, id: result._id})
    })
    .catch(function (err) {
      res.status(500).send({error: err});
    });
});

router.post('/add', async(req, res)=>{
  // process file path so only files within /uploads/ can be stored, 
  // prevent accidental deletion of other files
  let filePath;
  if (req.body.Path){
    filePath = path.format({
      dir: 'uploads\\soas',
      base: path.basename(req.body.Path)
    })
  }
  
  const soa = new Soa({
    User: req.body.User,
    Path: filePath,
    Date: req.body.Date || Date(),
    DueDate: req.body.DueDate,
    Supplier: req.body.Supplier,
    GrandTotal: req.body.GrandTotal,
    Paid: req.body.Paid,
  });

  try{
    const result = await soa.save()
    res.send(result)
  }
    catch(err){res.send({error: err})}
})

router.put('/setpaid/:id', async(req, res)=>{
  try{
    const result = await Soa.updateOne({_id:req.params.id}, {
      $set: {
          PaidDate : Date(),
          Paid: true
      }
    })
    if (result){
      const invoices = await Invoice.find({Soa: req.params.id})
      for (let invoice of invoices){
        invoice.set({
          PaidDate: Date(),
          Paid: true
        })
        await invoice.save()
      }
    }
    res.send(result)
  }
    catch(err){res.send({error: err})}
})


router.delete('/delete/:id', async(req, res)=>{
  Soa.findById(req.params.id)
    .then(async(result)=> {
      const invoices = await Invoice.find({Soa: req.params.id})
      for (let invoice of invoices){
        invoice.set({Soa: null})
        await invoice.save()
      }
      fs.unlink(result.Path, (err)=>{})
    })
    .then(()=>Soa.findByIdAndDelete(req.params.id))
    .then((deletedSoa)=>res.send(deletedSoa))
    .catch((err)=> res.status(500).send(err))
})


module.exports = router;