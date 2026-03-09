const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
     amount: {
        type: Number,
        required: true,
        min: 1
    },

    paymentDate: {
        type: Date,
        required: true,
        default: Date.now
    },

    notes: {
        type: String
    }

}, { timestamps: true });



module.exports = mongoose.model("Payment", paymentSchema);

