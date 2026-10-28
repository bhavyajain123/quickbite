const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
    customer:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,},
    restaurant:{type:mongoose.Schema.Types.ObjectId,ref:"Restaurant",required:true,},
     rating:{type:Number, default:0, min:0 , max:5},
     comment:{type:String, trim:true, maxlength:1000, default:"",},
},{timestamps:true}

);
reviewSchema.index({customer:1,restaurant:1},{unique:true});

module.exports = mongoose.model("Review", reviewSchema);