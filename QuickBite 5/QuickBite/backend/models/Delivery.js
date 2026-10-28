const mongoose = require("mongoose");
const deliverySchema = new mongoose.Schema({
    order:{type:mongoose.Schema.Types.ObjectId, ref:"Order", required:true, unique:true,},
    deliveryPartner:{type:mongoose.Schema.Types.ObjectId,ref:"User", default:null,},
    status:{type:String, enum:["assigned","picked_up","out_for_delivery","delivered","failed","cancelled",], default:"assigned",index:true,},
    pickupAddress:{type:String, trim:true, default:"",},
    deliveryAddress:{type:String , required:true,trim:true,},
    currentLocation:{latitude:{type:Number,min:-90, max:90, default:null,},
    longitude:{type:Number,min:-180,max:180,default:null,},
    updatedAt:{type:Date, default:null,},
},
estimatedDeliveryAt:{type:Date, default:null,},
deliveryAt:{type:Date , default:null,},
failureReason:{type:String, trim:true, default:"",},
},{timestamps:true}
);
deliverySchema.index({deliveryPartner:1, status:1});

module.exports = mongoose.model("Delivery", deliverySchema);