const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CnSchema = new Schema({
    User: {type: Schema.Types.ObjectId, ref: 'User'},
    Supplier: {type: Schema.Types.ObjectId, ref: 'Supplier'},
    Date: Date,
    Path: String,
    GrandTotal: {type: Number, required: true},
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
});

const CreditNote = mongoose.model('CreditNote', CnSchema)
module.exports = CreditNote;