const { Router } = require('express');
const router = Router();
const fs = require('fs')
const fileUtils = require('../utils/file')
const Supplier = require('../models/supplier')

// find one supplier using supplier id
router.get('/', async(req, res)=>{
   
    try{
        const suppliers = await Supplier.findById(req.body.id)
        res.send(suppliers)
    }
        catch(err){res.status(500)}
})

// find all suppliers which match filter criteria
router.get('/filter', async(req, res)=>{

    try{
        const suppliers = await Supplier.find(req.query)
        res.send(suppliers)
    }
        catch(err){res.status(500)}
})

// find all suppliers
router.get('/all', async(req, res)=>{
    const suppliers = await Supplier.find()
    res.send(suppliers)
})

// POST endpoint to submit supplier in json format
router.post('/add', async(req, res)=> {
  
  const supplier = new Supplier({
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