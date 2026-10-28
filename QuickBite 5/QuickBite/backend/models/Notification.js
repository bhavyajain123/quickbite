const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({

    user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true, index:true,},
    title:{type:String,required:true , trim:true,},
    message:{type:String,required:true , trim:true,},
    type:{type:String,enum:["order","promotion","system"], default:"system",},
    order:{type:mongoose.Schema.Types.ObjectId, ref:"Order",default:null,},
    isRead:{type:Boolean, default:false,},
},{timestamps:true}
);

module.exports = mongoose.model("Notification", notificationSchema);