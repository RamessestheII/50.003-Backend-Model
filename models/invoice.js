const mongoose = require('mongoose');
const User = require('./user')
const Product = require('./product')
const Schema = mongoose.Schema;

const InvoiceSchema = new Schema({ 
    User: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        // required: [true, 'Retailer ID required']
    },
    InvoiceNumber: {
        type: String,
        required: [true, 'Invoice Number required']
    },
    Path: String,
    RecPath: String,
    Date: {type: Date, required: true},
    BeforeGST: Number,
    GST: Number,
    Discount: Number,
    GrandTotal: {type: Number, required: true},
    // array of products with product, quantity and unit costs in each entry
    Product: [{
        Product: {
            required: [true, 'Product ID required'], 
            type: Schema.Types.ObjectId, 
            ref: 'Product',
        }, 
        // Number of units supplied
        Quantity: {
            type: Number,
            required: [true, 'Product quantity required'],
            validate: {
                validator: (quantity)=>{
                    return Math.floor(quantity)===quantity},
                message: 'Product quantity must be an integer'
            }
        },
        // Cost in SGD
        UnitCost: {
            type: Number, 
            required: [true, 'Product unit cost required']
        }
    }],
    Paid: {type: Boolean, default: false},
    PaidDate: Date,
    Soa: {type: Schema.Types.ObjectId, ref: 'Soa'},
    Supplier: {type: Schema.Types.ObjectId, ref: 'Supplier', required: true}
});

const Invoice = mongoose.model('Invoice', InvoiceSchema)
module.exports = Invoice;