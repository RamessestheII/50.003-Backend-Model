const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { isEmail } = require('validator');

const SupplierSchema = new Schema({
    User: {
      // required: [true, 'Retailer ID required'],
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    SupplierName: {type: String, required: true},
    Contact: {type: Number, required: true},
    Address: {type: String, required: true},
    Email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
      },
    SalesmanName: String,
});

const Supplier = mongoose.model('Supplier', SupplierSchema)
module.exports = Supplier;