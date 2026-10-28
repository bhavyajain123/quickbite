const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
    order:{type:mongoose.Schema.Types.ObjectId, ref:"Order",required:true, unique:true,},
    customer:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true,},
    amount:{type:Number, required:true,min:0,},
    method:{type:String, enum:["COD","UPI"], required:true,},
    status:{type:String, enum:["pending","paid","failed"], default:"pending",},
    transactionId:{type:String, default:null,},
    paidAt:{type:Date, default:null,},
},{timestamps:true}
);

module.exports = mongoose.model("Payment",paymentSchema);