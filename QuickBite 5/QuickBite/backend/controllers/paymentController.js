const mongoose = require("mongoose");
const Payment= require("../models/Payment");
const Order = require("../models/Order");

exports.createPayment = async (req, res) => {
  try {
    const { orderId, method } = req.body;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    if (!["COD", "UPI"].includes(method)) {
      return res.status(400).json({
        message: "Method must be COD or UPI.",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your order." });
    }

    if (["cancelled", "delivered"].includes(order.status)) {
      return res.status(400).json({
        message: "Payment is not allowed for this order status.",
      });
    }

    const existingPayment = await Payment.findOne({ order: orderId });

    if (existingPayment) {
      return res.status(409).json({
        message: "Payment already exists for this order.",
        payment: existingPayment,
      });
    }

    const payment = await Payment.create({
      order: order._id,
      customer: req.user._id,
      amount: order.totalAmount,
      method,
      status: "pending",
    });
    order.paymentMethod = method;
order.paymentStatus = "pending";
await order.save();

    return res.status(201).json({
      message: "Payment record created successfully.",
      payment,
    });
  } catch (error) {
    console.error("Create payment error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Payment already exists for this order.",
      });
    }

    return res.status(500).json({
      message: "Failed to create payment record.",
    });
  }
};

exports.confirmDummyUpi = async(req,res)=>{
    try{
        const{paymentId} = req.params;
        if(!mongoose.isValidObjectId(paymentId)){
            return res.status(400).json({
                message:"invalid payment id"
            });
        }
        const payment= await Payment.findById(paymentId);
        if(!payment){
            return res.status(404).json({
                message:"payment not found"
            });
        }
        if(payment.customer.toString() !== req.user._id.toString()){
            return res.status(403).json({
                message:"not your payment"
            });
        }
        if(payment.method!=="UPI"){
            return res.status(400).json({
                message:"dummy confirmation is only for upi",
            });
        }
        if(payment.status !=="pending"){
            return res.status(400).json({
                message:"payement not pending",
            });
        }
          
const updatedPayment= await Payment.findOneAndUpdate(
    {
        _id:payment._id,
        customer:req.user._id,
        method:"UPI",
        status:"pending",
    },{
        $set:{
            transactionId:`DUMMY-${payment._id}`,
            status:"paid",
            paidAt:new Date(),
        },
    },{new:true , runValidators:true}

);
if(!updatedPayment){
    return res.status(409).json({
        message:"payment is no longer pending",
    });
}
await Order.findOneAndUpdate(
    {
        _id: updatedPayment.order,
        customer: req.user._id,
    },
    {
        $set: {
            paymentMethod: updatedPayment.method,
            paymentStatus: updatedPayment.status,
        },
    },
    { runValidators: true }
);
return res.status(200).json({
    message:"dummy upi payment marked succesful",
    payment :updatedPayment,
});
   
    }catch(error){
        console.error("dummy upi confirm error:", error.message);
        return res.status(500).json({
            message:"failed to confirm payment",
        });
    }
};

exports.getPaymentByOrder = async(req,res)=>{
    try{
        const{orderId}= req.params;
        if(!mongoose.isValidObjectId(orderId)){
            return res.status(400).json({
                message:"invalid order id"
            });
        }
        const payment = await Payment.findOne({ order: orderId })
  .select("-transactionId");
        if(!payment){
            return res.status(404).json({
                message:"payment not found"
            });
        }
         const isAdmin = req.user.role === "admin";
    const isOwner = payment.customer.toString() === req.user._id.toString();

    if(!isAdmin && !isOwner){
        return res.status(403).json({
            message:"not your payment",
        });
    }
    return res.status(200).json({
        payment
    });
    }catch(error){
        console.error("get payment error:", error);
        return res.status(500).json({
            message:"failed to fetch payment"
        });
    }
};