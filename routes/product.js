const { Router } = require('express');
const router = Router();
const fs = require('fs')
const fileUtils = require('../utils/file')
const Product = require('../models/product')

// find one product using product id
router.get('/', async (req, res) => {
  try {
    const data = await Product.findById(req.query.id);
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
    const data = await Product.find({});
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get('/filter', async (req, res) => {
  try {
    let queryObject = {}
    if (req.query.SupplierCode){queryObject.SupplierCode=req.query.SupplierCode}
    if (req.query.RetailCode){queryObject.RetailCode=req.query.RetailCode}
    if (req.query.Name){queryObject.Name=req.query.Name}
    if (req.query.Supplier){queryObject.Supplier=req.query.Supplier}
    // TODO: Query by Date
    const data = await Product.find(queryObject);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});
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