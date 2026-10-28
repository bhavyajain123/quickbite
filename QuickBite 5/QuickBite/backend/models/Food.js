const mongoose = require("mongoose");
const foodSchema = new mongoose.Schema({
    name:{type:String, required:true, trim:true,},
    description: {type:String, default:"", trim:true},
    image:{type:String,default:""},
    price:{type:Number, required:true,min:0,},
    category:{type:String, required:true,trim:true,},
    restaurant:{type:mongoose.Schema.Types.ObjectId, ref:"Restaurant",required:true,},
    isAvailable:{type:Boolean,default:true,},
},{timestamps:true}

);

module.exports = mongoose.model("Food",foodSchema);