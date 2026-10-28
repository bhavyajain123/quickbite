const mongoose = require("mongoose");
const Inventory  = require("../models/Inventory");
const Food = require("../models/Food");

class InventoryError extends Error{
    constructor(message, status=400){
        super(message);
        this.name="InventoryError";
        this.statusCode = this.statusCode;
    }
}
const validateFoodId =(foodId)=>{
    if(!mongoose.Types.ObjectId.isValid(foodId)){
        throw new InventoryError("invalid food id");
    }
};
exports.restockInventory=async(foodId,quantity, updatedBy =null)=>{
    validateFoodId(foodId);

    if(!Number.isInteger(quantity) || quantity<=0){
        throw new InventoryError("restorck quantity should be positive");
    }
    const foodExists = await Food.exists({_id:foodId});
    if(!foodExists){
        throw new InventoryError("food item not found", 404);
    }
    const inventory= await Inventory.findOneAndUpdate({food:foodId},{$inc: { quantity },
    $set:{
        ...(updatedBy ? { updatedBy } : {}),
        lastRestockedAt: new Date(),
        isAvailable: true,
    },
    $setOnInsert:{
        reservedQuantity:0, 
        lowStockThreshold:5,
    },
    },{
        new:true,
        upsert:true,
        runvalidators:true,
        setDefaultsOnInsert:true,
    }
);
return inventory;
};

exports.getInventory = async(foodId)=>{
    validateFoodId(foodId);
    const inventory = await Inventory.findOne({
        food:foodId,
    }).populate("food", "name price category image");
    if(!inventory){
        throw new InventoryError("inevntory not found",404);
    }
    return inventory;
};

exports.setInventoryQuantity=async(foodId, quantity, updatedBy=null)=>{
    validateFoodId(foodId);
    if(!Number.isInteger(quantity) || quantity<0){
        throw new InventoryError("quantity should be positive");
    }
    const inventory = await Inventory.findOneAndUpdate({
        food:foodId,
        reservedQuantity:{$lte:quantity},
    },{
        $set:{quantity,...(updatedBy ? {updatedBy}:{}), isAvailable:quantity>0,},
    },{new:true , runValidators:true}
);
if(!inventory){
    const exists = await Inventory.exists({food:foodId});
    if(!exists){
        throw new InventoryError("inventory not found", 404);
    }
    throw new InventoryError("quantity cant be less than reserved stocks");
}
return inventory;
};

exports.reserveStock = async(foodId,quantity)=>{
    validateFoodId(foodId);
    if(!Number.isInteger(quantity)|| quantity<=0){
        throw new InventoryError("reserved quanityt should be positive");
    }
    const inventory = await Inventory.findOneAndUpdate({
        food:foodId,isAvailable:true,
         $expr: {
        $gte: [
          { $subtract: ["$quantity", "$reservedQuantity"] }, quantity,
        ],
},
    },{$inc :{reservedQuantity:quantity},
},{new:true,
    runValidators:true,
}
);

if(!inventory){
    throw new InventoryError("insuff stock",409);
}
return inventory;
};

exports.releaseStock =async(foodId, quantity)=>{
    validateFoodId(foodId);
    if(!Number.isInteger(quantity) || quantity<=0){
        throw new InventoryError("release quantity should be positive");
    }
    const inventory = await Inventory.findOneAndUpdate({
        food:foodId,
        reservedQuantity:{$gte:quantity},
    },
    {$inc :{reservedQuantity:-quantity},
},
{new:true, runValidators:true,}
);
if(!inventory){
    throw InventoryError("inventory reservation not found",409);
}
return inventory;
};

exports.commitReservedStock = async(foodId,quantity)=>{
    validateFoodId(foodId);
    if(!Number,isInteger(quantity) || quantity<=0){
        throw new InventoryError("commit quantity must be positive");
    }
    const inventory= await Inventory.findOneAndUpdate({
        food:foodId,
        quantity:{$gte:quantity},
        reservedQuantity:{$gte, quantity},
    },{$inc:{quantity:-quantity, reservedQuantity:-quantity,},
},
{new:true, runValidators:true,}
);
if(!inventory){
    throw new InventoryError("unable to commit stock reservation",409);
}
return inventory;
};

exports.getLowStockItems = async()=>{
    return Inventory.aggregate([
        {$match:{
            isAvailable:true,
        },},
        {$match:{
            $expr:{
                $lte:[{$subtract:["$quantity", "$reservedQuantity"]},"$lowStockThreshold",],
            },
        },
    },{
         $lookup: {
         from:"foods",
        localField:"food",
        foreignField:"_id",
        as:"foodDetails",
      },
    },
    {
        $unwind:{path:"$foodDetails", preserveNullAndEmptyArrays:true,},
    },
    {
        $project:{food:"$foodDetails", quantity:1, reservedQuantity:1, availableQuantity:{$subtract:["$quantity","$reservedQuantity"],

        },
        lowStockThreshold:1,
        isAvailable:1,
},
    },{$sort:{
        availableQuantity:1,
    },
},
    ]);
};

exports.checkStock = async(foodId , quantity)=>{
    validateFoodId(foodId);
    if(!Number.isInteger(quantity) || quantity<=0){
        throw new InventoryError("quantity should be positive");
    }
    const inventory = await Inventory.findOne({
        food:foodId,
        isAvailable:true,
        $expr:{$gte:[
            {$subtract:["$quantity","$reservedQuantity"]},quantity,
        ],
    },
    });
    return Boolean(inventory);
};

exports.InventoryError= InventoryError;
