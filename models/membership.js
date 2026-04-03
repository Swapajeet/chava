const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const Payment = require("./payment")
const membershipSchema = new Schema({
    
    planType: {
        type: String,
        required: true,
        enum: ["1 Month", "3 Months", "6 Months", "12 Months"]
    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    totalFee: {
        type: Number,
        required: true,
        min: 0
    },
    Payment:{
         type: Schema.Types.ObjectId,
         ref:"Payment"
    },
    // student: {
    // type: Schema.Types.ObjectId,
    // ref: "Student"
  

}, { timestamps: true });

module.exports = mongoose.model("membership", membershipSchema);