const { Router } = require('express');
const router = Router();
const fs = require('fs')
const fileUtils = require('../utils/file')
const Product = require('../models/product')

// find one product using product id
router.get('/', async(req, res)=>{
   
    try{
        const products = await Product.findById(req.body.id)
        res.send(products)
    }
        catch(err){res.status(500)}
})

// find all products which match filter criteria
router.get('/filter', async(req, res)=>{
    // add all query parameters to supply to find() function
    let queryObject = {}
    if (req.body.SupplierCode){queryObject.SupplierCode=req.body.SupplierCode}
    if (req.body.RetailCode){queryObject.RetailCode=req.body.RetailCode}
    if (req.body.Name){queryObject.Name=req.body.Name}

    try{
        const products = await Product.find(queryObject)
        res.send(products)
    }
        catch(err){res.status(500)}
})

// find all products
router.get('/all', async(req, res)=>{
    const products = await Product.find()
    res.send(products)
})

// POST endpoint to submit product in json format
router.post('/add', async(req, res)=> {
  
  const product = new Product({
    SupplierCode: req.body.SupplierCode,
    RetailCode: req.body.RetailCode,
    Name: req.body.Name, 
    Supplier: req.body.Supplier
  });

  const result = await product.save()

  res.send(result)
});


router.delete('/delete/:id', async(req, res)=>{
  Product.findByIdAndDelete(req.params.id)
    .then((deletedProduct)=>res.send(deletedProduct))
    .catch((err)=> res.send(err))
})

module.exports = router;