const inventoryService = require("../services/inventoryService");
const mongoose = require("mongoose");
const Inventory= require("../models/Inventory");

exports.getAllInventory= async(req,res)=>{
    try{
    const page =Math.max(1,Number(req.query.page) || 1);
    const limit =Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page -1) *limit ;

    const[items, totalItems]= await Promise.all([
        Inventory.find()
        .populate("food","name price category image")
        .sort({updatedAt:-1})
        .skip(skip)
        .limit(limit)
        .lean(),
        Inventory.countDocuments(),
    ]);
    return res.status(200).json({
        message:"inventory fteched successfully",
        pagination:{totalItems, currentPage:page, totalPages:Math.ceil(totalItems/limit),limit,},
         inventory: items.map((item) => ({
        ...item,
        availableQuantity: Math.max(
          0,
          item.quantity - item.reservedQuantity
        ),
    })),
        
    });
    }catch(error){
        console.log("get the inventory error:" ,error.message);
        return res.status(500).json({
            message:"failed to fetch inventoery",
        });
    }
};

exports.getInventoryByFood = async(req,res)=>{
    try{
        const{foodId}= req.params;
        if(!mongoose.isValidObjectId(foodId)){
            return res.status(400).json({
                message:"invalid food id",
            });
        }
        const inventory = await inventoryService.getInventory(foodId);
        return res.status(200).json({
            message:"inventory successfully fetxhed",
            inventory,
        });
    }catch(error){
          return res.status(error.statusCode || 500).json({
            message:"failed to fetch inventory"|| error.message,
          });
    }
};

exports.restockInventory = async(req,res)=>{
    try{
        const{foodId,quantity}= req.body;

        if(!foodId || !mongoose.Types.ObjectId.isValid(foodId)){
            return res.status(400).json({
                message:"valid foodid is required"
            });
        }
        if(!Number.isInteger(quantity)|| quantity<=0){
            return res.status(400).json({
                message:"quantity must be a positive integer",
            });
        }
          const inventory = await inventoryService.restockInventory(foodId, quantity, req.user._id);
        return res.status(200).json({
            message:"stock added successfully",
            inventory,
        });
    }catch(error){
        console.log("failed to add stock:" ,error.message);
         return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to add stock",
        });
    }
};

exports.updateInventoryQuantity = async(req,res)=>{
    try{
        const{foodId}= req.params;
        const{quantity} = req.body;

        if(!mongoose.Types.ObjectId.isValid(foodId)){
            return res.status(400).json({
                message:"invalid foofd id"
            });
        }
        if(!Number.isInteger(quantity)|| quantity<0){
            return res.status(400).json({
                message:"quantity should be positive",
            });
        }
        const inventory = await inventoryService.setInventoryQuantity(foodId,quantity, req.user._id);
        return res.status(200).json({
            message:"inventory quantity updated successfully",
            inventory,
        });
    }catch(error){
        return res.status(500).json({
            message:"failed to update incentopry",

        });
    }
};

exports.getLowStockItems = async(req,res)=>{
    try{
        const inventory= await inventoryService.getLowStockItems();
        return res.status(200).json({
            message:"low stock inventory fetdhed successfully",
            count:inventory.length,
            inventory,
        });
    }catch(error){
        console.error("low stock error", error.message);
        return res.status(500).json({
            message:"failed to fetch low stock inventory",
        });
    }
};