const mongoose = require('mongoose');
const Supplier = require('./supplier')
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    User: {
        // required: [true, 'Retailer ID required'],
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    SupplierCode: Number,
    RetailCode: Number,
    Name: {type: String, required: true},
    Supplier: {
        required: [true, 'Supplier ID required'], 
        type: Schema.Types.ObjectId, 
        ref: 'Supplier'}
});

ProductSchema.path('Supplier').validate(async function (value) {
    const supplier = await Supplier.findById(value);
    if (!supplier) {
      throw new Error('Invalid supplier reference');
    }
    return true;
  });

const Product = mongoose.model('Product', ProductSchema)
module.exports = Product;