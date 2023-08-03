const { Router } = require('express');
const router = Router();
const fs = require('fs')
const fileUtils = require('../utils/file')
const Supplier = require('../models/supplier')

// find one supplier using supplier id
router.get('/', async (req, res) => {
  try {
    const data = await Supplier.findById(req.query.id);
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
    const data = await Supplier.find({});
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get('/filter', async (req, res) => {
  try {
    let queryObject = {}
    if (req.query.SupplierName){queryObject.SupplierName=req.query.SupplierName}
    const data = await Supplier.find(queryObject);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});


// POST endpoint to submit supplier in json format
router.post('/add', async(req, res)=> {
  
  const supplier = new Supplier({
    User: req.body.User,
    SupplierName: req.body.SupplierName,
    Contact: req.body.Contact,
    Address: req.body.Address,
    Email: req.body.Email,
    SalesmanName: req.body.SalesmanName,
    Product: req.body.Product
  });

  try{
    const result = await supplier.save()
    res.send(result)
    }
    catch(err){res.status(400).send({error: err.message})}
});


router.delete('/delete/:id', async(req, res)=>{
  Supplier.findByIdAndDelete(req.params.id)
    .then((deletedSupplier)=>res.send(deletedSupplier))
    .catch((err)=> res.send(err))
})

module.exports = router;