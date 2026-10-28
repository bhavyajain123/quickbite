const mongoose = require("mongoose");
const Notification =require("../models/Notification");

exports.getMyNotifications = async(req,res)=>{
    try{
        const notifications = await Notification.find({
            user: req.user._id,
        })
        .populate("order","status totalAmount")
        .sort({createdAt:-1});

        const unreadCount = await Notification.countDocuments({
            user:req.user._id,
            isRead:false,
        });

        return res.status(200).json({
            count:notifications.length,
            unreadCount,
            notifications,
        });
    }catch(error){
        console.error("get notifiaction error:",error.message);
        return res.status(500).json({
            message:"failed to fetch notification",
        });
    }
}

exports.markNotificationRead = async(req,res)=>{
    try{
        const{id}= req.params;
        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"invalid notification id",
            });
        }
         const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { isRead: true },
      { returnDocument: "after", runValidators: true }
    );
    if(!notification){
        return res.status(404).json({
            message:"notification not found",
        });
    }
    return res.status(200).json({
        message:"notification marked as read",
        notification,
    });
    }catch(error){
        console.error("mark notification as read error:", error.message);
        return res.status(500).json({
            message:"failed to update notification",
        });
    }
};

exports.markAllNotificationsRead = async(req,res)=>{
    try{
        const result= await Notification.updateMany(
              { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
        );

        return res.status(200).json({
            message:"all notifictions marked as read",
            modifiedCount : result.modifiedCount,
        });
    }catch(error){
        console.log("marked all read error", error.message);
        return res.status(500).json({
            message:"faield to update notification",
        });
    }
};

exports.deleteNotification = async(req,res)=>{
    try{
        const{id}= req.params;

        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"invalid notification id",
            });
        }
         const notification = await Notification.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if(!notification){
        return res.status(404).json({
            message:"notification not found",
        });
    }

    return res.status(200).json({
        message:"notification deleted successfully",
    });
    }catch(error){
         console.error("delete notification error:", error.message);
    return res.status(500).json({
      message: "failed to delete notification",
      });
    }
};