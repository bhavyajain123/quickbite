const mongoose = require("mongoose");
const Delivery = require("../models/Delivery");
const Order = require("../models/Order");
const User = require("../models/User");

const ValidStatuses=["assigned","picked_up","out_for_delivery","delivered","failed","cancelled",];

exports.assignDelivery= async(req,res)=>{
    try{
        const{orderId,deliveryPartnerId , pickupAddress,estimatedDeliveryAt}= req.body;

        if(!mongoose.Types.ObjectId.isValid(orderId)|| !mongoose.Types.ObjectId.isValid(deliveryPartnerId)){
            return res.status(400).json({
                message:"valid porder id and delivery partnerid is required",
            });
        }
        const order= await Order.findById(orderId);
        if(!order){
            return res.status(404).json({
                message:"order not found"
            });
        }
        if(["delivered","cancelled"].includes(order.status)){
            return res.status(400).json({
                message:"cant assign delivery for cancelled order",
            });
        }
   const deliveryPartner = await User.findById(deliveryPartnerId).select("name email role");
   if(!deliveryPartner){
    return res.status(404).json({
        message:"delivery partner user not found",
    });
   }
   if(deliveryPartner.role !=="deliveryPartner"){
    return res.status(400).json({
        message:"selectes user is not a delivery partner",
    });
   }
        let eta= null;
        if(estimatedDeliveryAt){
            eta= new Date(estimatedDeliveryAt);
            if(Number.isNaN(eta.getTime()) || eta<=new Date()){
                return res.status(400).json({
                    message:"eda msut be a valid future date",
                });
            }
        }
        const delivery = await Delivery.findOneAndUpdate({order:orderId},
            {$set:{deliveryPartner: deliveryPartnerId,
          status: "assigned",
          pickupAddress: pickupAddress || "",
          deliveryAddress: order.deliveryAddress,
          estimatedDeliveryAt: eta,
          failureReason: "",
          deliveryAt: null,
        },
        $setOnInsert: { order: orderId },
        },{new:true , upsert:true, runValidators:true}
        )
        .populate("deliveryPartner","name email")
        .populate("order","status totalAmount customer");

        return res.status(200).json({
            message:"delivery assigned successfully",
            delivery,
        });
    }catch(error){
        console.error("assign delivery error", error.message);
        return res.status(500).json({
            message:"failed to assign delviery",
        });

    }
};

exports.getDeliveryByOrder = async(req,res)=>{
    try{
        const{orderId}= req.params;
        if(!mongoose.isValidObjectId(orderId)){
            return res.status(400).json({
                message:"invalid order id",
            });
        }
        const order = await Order.findById(orderId).select("customer");
        if(!order){
            return res.status(404).json({
                message:"order not found"
            });
            
           
        }
         const delivery = await Delivery.findOne({order:orderId})
         .populate("deliveryPartner", "name email")
         .populate("order","status totalAmount");

         if(!delivery){
            return res.status(404).json({
                message:"delivery has not been assigned ",
            });
         }
         const userId = req.user._id.toString();

         const isAdmin = req.user.role ==="admin";
         const isCustomer = order.customer?.toString() === userId;
        const isAssignedPartner = delivery.deliveryPartner?._id?.toString() === userId;
         if(!isAdmin && !isCustomer && !isAssignedPartner){
            return res.status(403).json({
                message:"you cant view this delivery",
            });
         }
        
         return res.status(200).json({
            message:"delivery fetched successfully",
            delivery,
         });
    }catch(error){
        console.error("get delivery error", error);

        return res.status(500).json({
            message:"failed to fetch delivery",
        });
    }
};

exports.updateDeliveryStatus = async(req,res)=>{
    try{
        const{id}= req.params;
        const{status, failureReason}= req.body;

        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"invalid delivery id",
            });
        }
        if(!ValidStatuses.includes(status)){
            return res.status(400).json({
                message:"invalid delivery status",
                allowedStatuses : ValidStatuses,
            });
        }
        const delivery = await Delivery.findById(id);
        if(!delivery){
            return res.status(404).json({
                message:"delivery not found"
            });
        }
         const isAdmin = req.user.role ==="admin";
        const isAssigendPartner = delivery.deliveryPartner && 
        delivery.deliveryPartner.toString()===req.user._id.toString();
         if(!isAdmin && !isAssigendPartner){
            return res.status(403).json({
                message:"only assigned partner or admin can update status",
            });
         }

         const allowedTransition={assigned: ["picked_up","cancelled"],picked_up:["out_for_delivery","failed"],out_for_delivery:["delivered","failed"], failed:["assigned","cancelled"], delivered:[], cancelled:[],};
         if(!allowedTransition[delivery.status].includes(status)){
            return res.status(400).json({
                message:`cannot change statud from ${delivery.status} tp ${status}`,

            });
         }

         if(status==="failed" && !failureReason?.trim()){
            return res.status(400).json({
                message:"failure reason is req when delivery failed",
            });
         }
         delivery.status= status;

         if(status=== "failed"){
            delivery.failureReason = failureReason.trim();

         }
         if (status === "delivered") {
  delivery.deliveryAt = new Date();
} await delivery.save();

         const orderStatusByDelivery ={out_for_delivery:"out for delivery",delivered:"delivered", cancelled:"cancelled",};
            if (orderStatusByDelivery[status]) {
      await Order.findByIdAndUpdate(delivery.order, {
        status: orderStatusByDelivery[status],
      });
    }
    return res.status(200).json({
        message:"delivery status updated successfully",
        delivery,
    });

    }catch(error){
        console.error("get delivery statuserror", error);

        return res.status(500).json({
            message:"failed to update delivery status",
        });
    }
};

exports.updateDeliveryLocation = async(req,res)=>{
    try{
        const{id}= req.params;
        const{latitude,longitude} = req.body;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                message:"invalid delivery id:"
            });
        }
        if(
             typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      latitude <-90 ||
      latitude >90 ||
      longitude <-180||
      longitude > 180
        ){
            return res.status(400).json({
                message:"valid numeric latitude and longitude req",

            });
        }
        const delivery = await Delivery.findById(id);
        if(!delivery){
            return res.status(404).json({
                message:"delivery not found"
            });
        }
          const isAdmin = req.user.role ==="admin";
        const isAssigendPartner = delivery.deliveryPartner && 
        delivery.deliveryPartner.toString()===req.user._id.toString();
         if(!isAdmin && !isAssigendPartner){
            return res.status(403).json({
                message:"only assigned partner or admin can update location",
            });
         }
         if(["delivered", "cancelled","failed"].includes(delivery.status)){
            return res.status(400).json({
                message:"location cant be updated for a finished delivery",
            });
         }
         delivery.currentLocation={latitude,longitude,updatedAt: new Date(),};
         await delivery.save();
            return res.status(200).json({
      message: "delivery location updated successfully",
      delivery,
    });

    }catch(error){
        console.error("update delivery location error", error.message);
        return res.status(500).json({
            message:"failed to update delivery location",
        });
    }
};

exports.getAllDeliveries = async(req,res)=>{
    try{
        const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    if(!Number.isInteger(page)||page<1 ||!Number.isInteger(limit)|| limit<1|| limit>100){
        return res.status(400).json({
            message:"page should be greater than 1  and bw 1 and 100",
        });
    }
    const filter={};
    if(req.query.status){
        if (!ValidStatuses.includes(req.query.status)){
            return res.status(400).json({
                message:"invalid delivery status",
                allowedStatuses:ValidStatuses,
            });
        }
        filter.status = req.query.status;

    }
       const [deliveries, totalItems] = await Promise.all([
      Delivery.find(filter)
        .populate("order", "status totalAmount customer")
        .populate("deliveryPartner","name email")
        .sort({createdAt:-1 })
        .skip((page - 1) *limit)
        .limit(limit),

        Delivery.countDocuments(filter),
]);
return res.status(200).json({
    message:"deliveries fetched successfully",
    pagination:{totalItems, currentPage:page, totalPages:Math.ceil(totalItems/limit),limit},
    deliveries,
});
    }catch(error){
        console.error("get all deliveries error:",error);
        return res.status(500).json({
            message:"failed to fetch deliveries",
        });
    }
};