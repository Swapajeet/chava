const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const membership = require("./membership");
const StudentSchema = new Schema({

     fullName: { type: String, 
        required: true,
         trim: true 
        }, 
     mobile: { type: String,
         required: true, 
         match: /^[0-9]{10}$/
         },
      email:{ type: String,
         required: true,
         }, 
      city: { type: String,
         required: true 
        }, 
      dob: { type: Date, 
        required: true
     }, 
      address: { type: String, 
        required: true 
    }, 
      joinDate: { type: Date, 
        default: Date.now
     }, 
     status :{
         type: String,
         enum: ["Active", "Inactive"],
     },
      image: {
       url:String,
       filename:String,
     },

     Membership: [{
        type: Schema.Types.ObjectId,
        ref: "membership"
     } ]   
});

module.exports = mongoose.model("Student", StudentSchema);