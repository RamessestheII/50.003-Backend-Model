const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SoaSchema = new Schema({
    User: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        // required: [true, "Retailer ID required"]
    },
    Path: String,
    Date: {type: Date, required: true},
    DueDate: {type: Date, required: true},
    Supplier: {
        type: Schema.Types.ObjectId, 
        ref: 'Supplier', 
        required: [true, "Supplier ID required"]
    },
    GrandTotal: {type: Number, required: true},
    Paid: {type: Boolean, default: false},
    PaidDate: Date,

});

const Soa = mongoose.model('Soa', SoaSchema)
module.exports = Soa;