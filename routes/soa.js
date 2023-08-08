const { Router } = require('express');
const router = Router();
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const axios = require('axios')
const fileUtils = require('../utils/file')
const dateUtils = require('../utils/date')
const Soa = require('../models/soa');
const Invoice = require('../models/invoice');
const ML_SERVER_ADDRESS = require('../utils/const')
const { createObjectCsvStringifier } = require('csv-writer');


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
    // query from startDate to endDate, inclusive
    if (req.query.startDate && req.query.endDate){
      // parse startDate
      let [startMonth, startYear] = req.query.startDate.split('-')
      startMonth = parseInt(startMonth) - 1
      startYear = parseInt(startYear)
      // parse endDate
      let [endMonth, endYear] = req.query.endDate.split('-')
      endMonth = parseInt(endMonth) - 1
      endYear = parseInt(endYear)
      
      queryObject.Date = {
        $gte: new Date(startYear, startMonth),
        $lte: new Date(endYear, endMonth)
      }
    }
    const data = await Soa.find(queryObject);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get('/exportsoa', async(req, res)=>{
  try {
    let queryObject = {}
    if (req.query.Supplier){queryObject.Supplier=req.query.Supplier}
    // query from startDate to endDate, inclusive
    if (req.query.startDate && req.query.endDate){
      const startDate = new Date(parseInt(req.query.startDate), 0)
      const endDate = new Date(parseInt(req.query.endDate), 11)
      queryObject.Date = {
        $gte:startDate,
        $lte: endDate
      }
    }
    let data = await Soa.find(queryObject)
    .populate('Supplier', 'SupplierName')

    // create new array SupplierName as value of Supplier header
    let dataClone = JSON.parse(JSON.stringify(data))
    for (let i = 0; i<data.length; i++){
      // Extract invoices associated with current soa
      let invoiceData = await Invoice.find({Supplier: data[i]['Supplier']['_id']}).select('InvoiceNumber -_id')
      invoiceData = invoiceData.map((entry)=>entry.InvoiceNumber)
      // Assign Invoice Numbers to soa
      dataClone[i]['InvoiceNums'] = invoiceData

      // Extract and assign Supplier Name from populated document as name of Supplier
      dataClone[i]['Supplier'] = data[i]['Supplier']['SupplierName']

      // Convert and set MongoDB Date to dd-mm-yyyy format
      dataClone[i]['Date'] = dateUtils.convertMongoDate(dataClone[i]['Date'])
      // Convert and set MongoDB DueDate to dd-mm-yyyy format
      dataClone[i]['DueDate'] = dateUtils.convertMongoDate(dataClone[i]['DueDate'])

      // Convert MongoDB PaidDate to dd-mm-yyyy format
      if (dataClone[i]['PaidDate']){
        dataClone[i]['PaidDate'] = dateUtils.convertMongoDate(dataClone[i]['Date'])
      }
    }

    console.log(dataClone)

    // Define CSV headers
    const header = [
      { id: 'Supplier', title: 'Supplier' },
      { id: 'Date', title: 'Date' },
      { id: 'DueDate', title: 'DueDate' },
      { id: 'GrandTotal', title: 'GrandTotal' },
      { id: 'Paid', title: 'Paid' },
      { id: 'PaidDate', title: 'PaidDate' },
      { id: 'InvoiceNums', title: 'InvoiceNums' },
    ];

    // Create a CSV stringifier
    const csvStringifier = createObjectCsvStringifier({
      header,
    });

    // Convert data to CSV string
    const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(dataClone);

    // Set the response headers for the CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=soas_${dataClone[0].Supplier}_${Math.floor(Math.random()*1E5)}.csv`);
    res.status(200).send(csvString);

  } catch (err) {
    res.status(500).json({ error: err });
  }
})

// POST endpoint to submit soa  in jpeg/jpg/pdf format
router.post('/scan', upload.single('soa'), async(req, res)=> {
  let filePath;
  try {filePath = req.file.path}
    catch(err){res.status(400).send({error: 'Invalid file type, select jpg, jpeg or pdf'})}
  
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
            type: 'statement'
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