const mongoose = require("mongoose");
const orderItemSchema = new mongoose.Schema({
    food:{type:mongoose.Schema.Types.ObjectId,ref:"Food",required:true,},
    name:{type:String , required:true,},
    price:{type:Number, required:true ,min:0,},
    quantity: {type:Number,required:true,min:1,},
},{_id:false}
);

const orderSchema = new mongoose.Schema({
    customer:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,},
    items:{type:[orderItemSchema],required:true,},
    totalAmount:{type:Number, required:true,min:0,},
    paymentMethod:{type:String, enum:["COD","UPI"], default:"COD",},
    paymentStatus:{type:String,enum:["pending","paid","failed","refunded"], default:"pending",},
    deliveryAddress:{type:String, required:true,trim:true,},
    deliveryLatitude:{type:Number, min:-90, max:90,},
    deliveryLongitude:{type:Number, min:-180, max:180,},
    restaurant:{type:mongoose.Schema.Types.ObjectId,ref:"Restaurant",},
    deliveryPhone:{type:String, default:"", trim:true,},
    deliveryPartner: {
    name: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
},
    status:{type:String,
        enum:["pending","confirmed","preparing","out for delivery","delivered","cancelled",],
        default:"pending",
    },
    couponCode:{type:String,default:null,},
    discountAmount:{type:Number, default:0, min:0,},
    subtotal:{type:Number,required:true,min:0,},
    deliveryFee:{type:Number, required:true, default:0, min:0,},
    tax:{type:Number, required:true, default:0, min:0,},
},{timestamps:true}
);

module.exports = mongoose.model("Order",orderSchema);