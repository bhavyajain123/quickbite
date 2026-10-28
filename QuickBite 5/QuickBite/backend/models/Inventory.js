const mongoose = require("mongoose");
const inventorySchema = new mongoose.Schema({
    food:{type:mongoose.Schema.Types.ObjectId,ref:"Food", required:true,unique:true, index:true,},
    quantity:{type:Number, required:true, default:0, min:0, validate:{validator:Number.isInteger, message:"Quantity must be a whole number",},
},
reservedQuantity:{type:Number, required:true, default:0,min:0, validate:{validator:Number.isInteger, message:"quantity must be whole number",},
},
lowStockThreshold:{type:Number, required:true,default:5,min:0,validate:{validator:Number.isInteger, message:"low stock should be whole number",},
},
isAvailable:{type:Boolean, default:true,},
lastRestockedAt:{type:Date, default:null},
updatedBy:{type:mongoose.Schema.Types.ObjectId, ref:"User",default:null,},
},
{timestamps:true,}
    
);

inventorySchema.virtual("availableQuantity").get(function(){
    return Math.max(0 , this.quantity- this.reservedQuantity);
});

inventorySchema.set("toJSON",{virtuals:true});
inventorySchema.set("toObject",{virtuals:true});

inventorySchema.pre("validate",function(){
    if(this.reservedQuantity> this.quantity){
        this.invalidate("reservedQuantity","reserved cant exceed total quantity");
    }
});

module.exports = mongoose.model("Inventory", inventorySchema);