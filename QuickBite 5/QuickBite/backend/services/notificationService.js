const Notification =require("../models/Notification");
async function createNotification({
    user,
    title,
    message,
    type="order",
    order=null,
}){
    if(!user|| !title || !message){
        throw new Error("user, title and message are req");
    }
    return Notifiction.create({
        user,title,message,type,...(order ?{order}:{}),
    });
}
async function getUserNotifications(userId,limit =20){
    if(!userId){throw new Error("userId is required");

    }
    const safeLimit= Math.min(Math.max(Number(limit)|| 20,1),100);
    return Notification.find({user:userId})
    .sort({createdAt:-1})
    .limit(safeLimit)
    .lean();
}

async function markNotificationRead(notificationId,userId){
    if(!notificationId || !userId){
        throw new Error("notificationid and user id is req");
    }
    return Notification.findOneAndUpdate({_id:notificationId,user:userId},{$set:{isRead:true}},{returnDocument:"after", runValidators:true});
}
module.exports={
    createNotification,
    getUserNotifications,
    markNotificationRead,
};