const express = require('express');
const app = express();
const mongoose = require('mongoose')
const invoiceRoutes = require('./routes/invoice')
const soaRoutes = require('./routes/soa')
const creditNoteRoutes = require('./routes/credit_note')
const productRoutes = require('./routes/product')
const supplierRoutes = require('./routes/supplier')
const fileUtils = require('./utils/file')

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static('uploads'))
// Access static display of images in /uploads
// e.g. localhost:3000/invoices/invoicename.jpg displays invoicename.jpg in the browser

const MONGODB_URI =
'mongodb://localhost/newecon';

app.set('view engine', 'ejs')


mongoose.connect(MONGODB_URI)
    .then(()=>console.log('Connected to MongoDB'))
    .then(()=> app.listen(3000))
    .catch((err)=>console.log('Could not connect to MongoDB', err))

app.use('/invoice', invoiceRoutes)
app.use('/soa', soaRoutes)
app.use('/creditnote', creditNoteRoutes)
app.use('/product', productRoutes)
app.use('/supplier', supplierRoutes)

// for testing file uploads only
app.get('/i', (req, res)=>res.render('addInvoice'))
app.get('/s', (req, res)=>res.render('addSoa'))
app.get('/c', (req, res)=>res.render('addCreditNote'))
app.get('/r', (req, res)=>res.render('addReceipt'))



