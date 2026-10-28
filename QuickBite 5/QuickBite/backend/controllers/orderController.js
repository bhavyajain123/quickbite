const mongoose = require("mongoose");
const Order = require("../models/Order");
const Food = require("../models/Food");
const Coupon = require("../models/Coupon");
const Cart = require("../models/Cart");
const Address = require("../models/Address");
const Notification = require("../models/Notification");
const{sendEmail}= require("../services/emailService");
const { calculateOrderTotal } = require("../services/pricingService");
const{createNotification}= require("../services/notificationService");
const orderQueue = require("../queues/orderQueue");
const { addWithRetry } = require("../jobs/retryJobs");
const User= require("../models/User");
const emailQueue = require("../queues/emailQueue");
const notificationQueue = require("../queues/notificationQueue");
const { publishEvent } = require("../events/eventPublisher");
const { order_events } = require("../events/orderEvents");


exports.createOrder = async (req, res) => {
  let reservedCouponId = null;
  let totalAmount =0;
  

  try {
    const { addressId, couponCode } = req.body;

    
    if (!mongoose.isValidObjectId(addressId)) {
      return res.status(400).json({
        message: "valid addressId is required",
      });
    }

    const address = await Address.findOne({
      _id: addressId,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        message: "delivery address not found",
      });
    }
    console.log("Fetched delivery address:", {
  latitude: address.latitude,
  longitude: address.longitude,
  addressId: address._id,
});

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "your cart is empty",
      });
    }

   
    const quantities = new Map();

    for (const item of cart.items) {
      const foodId = item.food.toString();
      const quantity = item.quantity;
      const combinedQuantity =
        (quantities.get(foodId) || 0) + quantity;

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        combinedQuantity > 100
      ) {
        return res.status(400).json({
          message: "invalid quantity; maximum per food is 100",
        });
      }

      quantities.set(foodId, combinedQuantity);
    }

    const foodIds = [...quantities.keys()];

    const foods = await Food.find({
      _id: { $in: foodIds },
      isAvailable: true,
    });

    if (foods.length !== foodIds.length) {
      return res.status(400).json({
        message: "one or more cart food items are unavailable",
      });
    }

    const orderItems = foods.map((food) => ({
      food: food._id,
      name: food.name,
      price: food.price,
      quantity: quantities.get(food._id.toString()),
    }));

    const restaurantIds = [
  ...new Set(foods.map((food) => food.restaurant.toString())),
];

if (restaurantIds.length !== 1) {
  return res.status(400).json({
    message: "Please order items from one restaurant at a time.",
  });
}

const restaurantId = restaurantIds[0];

   const subtotal = calculateOrderTotal(orderItems).subtotal;

    let appliedCoupon = null;
    let discountAmount = 0;

    if (
      couponCode !== undefined &&
      couponCode !== null &&
      couponCode !== ""
    ) {
      if (typeof couponCode !== "string") {
        return res.status(400).json({
          message: "coupon code must be a string",
        });
      }

      appliedCoupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
      });

      if (!appliedCoupon) {
        return res.status(400).json({
          message: "invalid or inactive coupon",
        });
      }

      if (appliedCoupon.expiryDate <= new Date()) {
        return res.status(400).json({
          message: "coupon has expired",
        });
      }

      if (appliedCoupon.usedCount >= appliedCoupon.usageLimit) {
        return res.status(400).json({
          message: "coupon usage limit reached",
        });
      }

      if (subtotal < appliedCoupon.minOrderAmount) {
        return res.status(400).json({
          message: `minimum order amount is ${appliedCoupon.minOrderAmount}`,
        });
      }
      
    }
    const pricing = calculateOrderTotal(
    orderItems,
    appliedCoupon ? appliedCoupon.toObject() : null
);

const {
    subtotal: calculatedSubtotal,
    discountAmount: calculatedDiscount,
    deliveryFee,
    tax,
    totalAmount: calculatedTotal,
} = pricing;

discountAmount = calculatedDiscount;
totalAmount = calculatedTotal;

    if (appliedCoupon) {
      const reservedCoupon = await Coupon.findOneAndUpdate(
        {
          _id: appliedCoupon._id,
          isActive: true,
          expiryDate: { $gt: new Date() },
          $expr: { $lt: ["$usedCount", "$usageLimit"] },
        },
        { $inc: { usedCount: 1 } },
        { returnDocument: "after" }
      );

      if (!reservedCoupon) {
        return res.status(400).json({
          message: "coupon is no longer available",
        });
      }

      reservedCouponId = reservedCoupon._id;
    }

   
    const deliveryAddress = [
      address.fullName,
      address.phone,
      address.addressLine,
      address.landmark,
      address.city,
      address.state,
      address.pincode,
    ].filter(Boolean).join(", ");

   
    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      restaurant:restaurantId,
      subtotal,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      discountAmount,
      deliveryFee,
      tax,
      totalAmount,
      deliveryAddress,
      deliveryLatitude:address.latitude,
      deliveryLongitude:address.longitude,
      deliveryPhone: address.phone,
    });
    try{
      publishEvent(order_events.created,{
        orderId: order._id.toString(),
        customerId:req.user._id.toString(),
        totalAmount:order.totalAmount,
      });
    }catch(error){
      console.error("order event publish error:", error.message);
    }

    try{
      await addWithRetry(orderQueue,"order-created",{
        orderId: order._id.toString(),
        customerId:req.user._id.toString(),
      });
      console.log("order joba added to queue:",order._id);
    }catch(queueError){
      console.error("order queue error", queueError.message);
    }
    try{
    const user = await User.findById(req.user._id).select("name email");
    if(user&& user.email){
      await addWithRetry(emailQueue,"order-confirmation",{
        to:user.email,
        subject:"Quickbite order confirmation",
        text:`Hi ${user.name || "Customer"},
        Your Quickbite order has been placed sucessfully!!
        Order ID:${order._id}
        Items:${orderItems.map(item=>`${item.name}x${item.quantity}`).join(",")}
        Subtotal: Rs. ${subtotal}
Discount: Rs. ${discountAmount}
Total Amount: Rs. ${totalAmount}
        
        Thankyou from ordering from Quickbite!!!`
      });
      console.log("emaail job added to queue:",order._id);
    }
  }catch(emailQueueError){
    console.error("email queuue error:", emailQueueError.message);
  }
  try{
     await addWithRetry(notificationQueue, "order-notification", {
        user: req.user._id.toString(),
        title: "Order placed successfully",
        message: `Your order #${order._id} has been placed successfully. Total amount: Rs. ${totalAmount}.`,
        type: "order",
        order: order._id.toString(),
      });
      console.log("notification job added to queue:", order._id);
  }catch(notificationQueueError){
    console.error("notification queue error:", notificationQueueError.message);
  }

   
    cart.items = [];
    await cart.save();

    reservedCouponId = null;

    

    return res.status(201).json({
      message: "order placed successfully",
      order,
    });
  } catch (error) {
    if (reservedCouponId) {
      try {
        await Coupon.updateOne(
          { _id: reservedCouponId, usedCount: { $gt: 0 } },
          { $inc: { usedCount: -1 } }
        );
      } catch (rollbackError) {
        console.error("coupon rollback error:", rollbackError.message);
      }
    }

    console.error("create order error:", error);

    return res.status(500).json({
      message: "failed to place order",
      error: error.message,
    });
  }
};

exports.getMyOrders = async(req,res)=>{
    try{
const orders = await Order.find({
  customer: req.user._id,
})
  .populate("restaurant", "name latitude longitude address")
  .sort({ createdAt: -1 });

        return res.status(200).json({
            count:orders.length,
            orders,
        });
    }catch(error){
        console.error("get my order error:",error);
        return res.status(500).json({
            message:"failed to fetch record",

        });
    }
};

exports.getAllOrders = async(req,res)=>{
    try{
         const orders = await Order.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

      return res.status(200).json({
        count:orders.length,
        orders,
      });
    }catch(error){
        console.error("get all order error:",error);
        return res.status(500).json({
            message:"failed to fetch orders",
        });
    }
};

exports.updateOrderStatus = async(req,res)=>{
    try{
        const{id} = req.params;
        const {status}= req.body;
        const allowedStatuses=["pending","confirmed","preparing","out for delivery","delivered","cancelled",];

        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"invalid order id",
            });
        }
        if(!allowedStatuses.includes(status)){
            return res.status(400).json({
                message:"invalid order status",
                allowedStatuses,
            }); 
        }
        const order = await Order.findById(id);
        if(!order){
            return res.status(404).json({
                message:"order not found",
            });
        }
        const previousStatus = order.status;
        order.status= status;
        await order.save();

        if(previousStatus !== status){
          try{
           await createNotification({
            user:req.user._id,
            title:"order placed successful",
            message:`Your order #${order._id} has been placed successfully. Total amount:â‚¹${totalAmount}`,
            type:"order",
            order:order._id,
           });
          }catch(notificationError){
            console.error(
              "status notification error:", notificationError.message
            );
          }
        }
        return res.status(200).json({
            message:"order status updated successfully",
            order,
        });
    }catch(error){
        console.error("update order status error:", error);
        return res.status(500).json({
            message:"failed to update order status",
        });
    }
};

exports.cancelMyOrder = async(req,res)=>{
    try{
        const{id}= req.params;
        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
        message: "Invalid order ID",
        });
    }
    const order = await Order.findOne({
        _id:id,
        customer:req.user._id,
    });
    if(!order){
        return res.status(404).json({
            message:"order not found",
        });
    }
   if (order.status !== "pending") {
      return res.status(400).json({
        message: "Only pending orders can be cancelled",
      });
    }
    order.status ="cancelled";
    await order.save();
    return res.status(200).json({
        message:"order cancelled successfully",
        order,
    });
    }catch(error){
        console.error("cancle order error",error);
        return res.status(500).json({
            message:"failed to cancel order",
        });
    }

};

exports.getOrdersWithFilters = async (req, res) => {
  try{
    const{status, page=1, limit=10,search,}= req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if( !Number.isInteger(pageNumber) ||
      pageNumber < 1 ||
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 100){
        return res.status(400).json({
          message:"page must be greater than 1 and bw 1to 100",
        });
      }
      const allowedStatuses =["pending","confirmed","preparing","out for delivery","delivered","cancelled",];
      const filter={};

      if(status){
        if(!allowedStatuses.includes(status)){
          return res.status(400).json({
            message:"invalid order status",
            allowedStatuses,
          });
        }
        filter.status= status;
      }
      if(search && search.trim()){
        const mongoose = require("mongoose");
        if(!mongoose.Types.ObjectId.isValid(search)){
          return res.status(400).json({
            message:"search must be a valid order id",
          });
        }
        filter._id = search;
      }
     const skip = (pageNumber - 1) * limitNumber;

      const[orders, totalOrders]= await Promise.all([
        require("../models/Order")
        .find(filter)
        .populate("customer","name email")
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limitNumber)
        .lean(),

        require("../models/Order").countDocuments(filter),
      ]);
      return res.status(200).json({
        message:"order fetched successfully",
       pagination: {
  totalOrders,
  currentPage: pageNumber,
  totalPages: Math.ceil(totalOrders / limitNumber),
  limit: limitNumber,
},
        orders,
      });
  }catch (error){
    console.error("get filtered orders error", error);
    return res.status(500).json({
      message:"failed to fetch orders",
    });
  }
};

exports.getAdminOrderId = async(req,res)=>{
  try{
    const mongoose = require("mongoose");
    const Order= require("../models/Order");
    const{id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message:"invalid order id",
      });
    }

    const order = await Order.findById(id)
    .populate("customer","name email")
    .populate("items.food","name image category" )
      .lean();

      if(!order){
        return res.status(404).json({
          message:"order not found",
        });
      }
      return res.status(200).json({
        message:"order details fetched success",
        order,
      });
   
  }catch(error){
    console.error("get admin order detail error", error);

    return res.status(500).json({
      message:"failed to fetch order detail",
    });
  }
};


exports.updateDeliveryPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const name = String(req.body.name || "").trim();
    const phone = String(req.body.phone || "").trim();

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    if (name.length > 100 || phone.length > 20) {
      return res.status(400).json({
        message: "Partner name or phone is too long",
      });
    }

    if ((name && !phone) || (!name && phone)) {
      return res.status(400).json({
        message: "Partner name and phone must both be provided",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "cancelled" || order.status === "delivered") {
      return res.status(400).json({
        message: "Cannot assign a partner to a completed or cancelled order",
      });
    }

    order.deliveryPartner = { name, phone };
    await order.save();

    return res.status(200).json({
      message: "Delivery partner saved successfully",
      order,
    });
  } catch (error) {
    console.error("Update delivery partner error:", error);
    return res.status(500).json({
      message: "Failed to save delivery partner",
    });
  }
};
