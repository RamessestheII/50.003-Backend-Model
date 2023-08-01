const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CnSchema = new Schema({
    User: {type: Schema.Types.ObjectId, ref: 'User'},
    Supplier: {type: Schema.Types.ObjectId, ref: 'Supplier'},
    Date: Date,
    Path: String,
});

const CreditNote = mongoose.model('CreditNote', CnSchema)
module.exports = CreditNote;