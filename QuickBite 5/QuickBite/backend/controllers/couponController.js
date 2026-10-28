const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");
exports.createCoupon = async(req,res)=>{
    try{
        let{code,discountType,discountValue, maxDiscount, minOrderAmount, expiryDate,usageLimit,}= req.body;

        if(typeof code !=="string" || !code.trim()){
            return res.status(404).json({
                message:"coupon code is required",
            });
        }
        code = code.trim().toUpperCase();
        if(!["percentage","fixed"].includes(discountType)){
            return res.status(400).json({
                message:"discountType must be percentage or fixed",
            });
        }
        if(typeof discountValue !== "number"|| !Number.isFinite(discountValue)|| discountValue<=0 || (discountType ==="percentage" && discountValue>100)
        ){
    return res.status(400).json({
        message:"invalid discount value",
    });
    }
    if(maxDiscount !== undefined && maxDiscount !==null && (!Number.isFinite(maxDiscount) || maxDiscount <0)
    ){
return res.status(400).json({
    message:"invalid maximum discount",
});

}
const minimum = minOrderAmount??0;
const limit = usageLimit??100;
const expiry = new Date(expiryDate);

         if (
      !Number.isFinite(minimum) ||
      minimum < 0 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      !expiryDate ||
      Number.isNaN(expiry.getTime()) ||
      expiry <= new Date()
    ){
        return res.status(400).json({
            message:"Invalid minimum order, usage limit, or expiry date",

        });
    }
    const coupon = await Coupon.create({
        code,
        discountType,
        discountValue,
         maxDiscount: maxDiscount ?? null,
         minOrderAmount: minimum,
         expiryDate: expiry,
         usageLimit: limit,

    });
    return res.status(201).json({
        message:"coupon created successfully",
        coupon,
    });

    }catch(error){
        console.error("Create Coupon Error:", error);
        if(error.code ===11000){
            return res.status(409).json({
                message:"coupon code already exist",
            });
        }
        console.error("Create coupon error:", error);

        return res.status(500).json({
      message: "Failed to create coupon",
    });
    }
};

exports.validateCoupon = async(req,res)=>{
    try{
        const{code,orderAmount}= req.body;
        console.log("Coupon validation request:", {
  code,
  orderAmount,
  database: Coupon.db.name,
});
        if(typeof code !=="string" || !code.trim()|| typeof orderAmount !=="number" || !Number.isFinite(orderAmount)|| orderAmount<=0){
            return res.status(400).json({
                message:"valid coupon code and positive order amount are required",
            });
        }
        const coupon = await Coupon.findOne({
            code:code.trim().toUpperCase(),
        });

        console.log("Coupon found:", coupon?.code);
console.log("Discount type:", coupon?.discountType);
console.log("Discount value:", coupon?.discountValue);
console.log("Max discount:", coupon?.maxDiscount);

         if (!coupon || !coupon.isActive) {
      return res.status(404).json({
        message: "Invalid or inactive coupon",
      });
    }
    if(coupon.expiryDate <= new Date()){
        return res.status(400).json({
            message:"coupon has expired"
        });
    }
    if(coupon.usedCount >= coupon.usageLimit){
        return res.status(400).json({
            message:"coupon usage limit reached",
        });
    }
     if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount is ${coupon.minOrderAmount}`,
      });
    }
     let discountAmount =
      coupon.discountType === "percentage"
        ? (orderAmount * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.maxDiscount !== null) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }

    discountAmount = Math.min(
  orderAmount,
  Math.round(discountAmount * 100) / 100
);
    return res.status(200).json({
        message:"coupon is valid",
        discountAmount,
        finalAmount: Math.round((orderAmount - discountAmount) * 100) / 100,
    });
    }catch(error){
        console.error("validate coupon error:",error);
        return res.status(500).json({
            message:"failed to validate coupon",
        });
    }
};

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    return res.status(200).json({
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    return res.status(500).json({
      message: "Failed to fetch coupons",
       error: error.message,
    });
  }
};

exports.deleteCoupon = async(req,res)=>{
    try{
        const{id}= req.params;
        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"invalid coupon id",
            });
        }
        const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }
    return res.status(200).json({
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);

    return res.status(500).json({
      message: "Failed to delete coupon",
    });
    }
};