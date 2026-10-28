const mongoose = require("mongoose");
const restaurantSchema = new mongoose.Schema({
    name:{type:String, required:true, trim:true},
    description: {type:String, default:"", trim:true},
    image:{type:String,default:""},
    cuisine:{type:[String], required:true, default:[]},
    address:{type:String, required:true, trim:true},
    city: { type: String,trim:true,default:"Delhi NCR", index:true},
    latitude:{type:Number,min:-90,max:90,},
    longitude:{type:Number, min:-180,max:180,},
    rating:{type:Number, default:0, min:0 , max:5},
    deliveryTime:{type:Number, default:30, min:1},
    isOpen:{type:Boolean, default:true},
},{timestamps:true}    
);

module.exports = mongoose.model("Restaurant",restaurantSchema);