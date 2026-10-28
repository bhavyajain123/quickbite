const User = require("../models/User");
const bcrypt = require("bcrypt");


exports.getMyProfile = async(req,res)=>{
    try{
        const user = await User.findById(req.user._id).select("-password");
console.log("Logged-in profile:", {
  userId: String(user?._id),
  email: user?.email,
});
        if(!user){
            return res.status(404).json({
                message:"user not found",
            });
        }
        return res.status(200).json({
            message:"profile fetched successfully",
            user,
        });
    }catch(error){
        console.error("get profile error:",error);
        return res.status(500).json({
            message:"failed to fetch profile",

        })
    };
};
exports.updateMyProfile = async(req,res)=>{
    try{
        const{name,email,phone}= req.body;
        if(name === undefined && email === undefined && phone=== undefined){
            return res.status(400).json({
                message:"provide name and email to update",
            });
        }
        const update={};
        if(name!== undefined){
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    message:"valid name required",
                });
            }
            update.name= name.trim();
        }
       if (email !== undefined) {
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return res.status(400).json({
      message: "valid email is required",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: req.user._id },
  });

  if (existingUser) {
  console.log("Profile email conflict:", {
    loggedInUserId: String(req.user._id),
    existingUserId: String(existingUser._id),
    submittedEmail: normalizedEmail,
  });
    return res.status(409).json({
      message: "email is already registered",
    });
  }

  update.email = normalizedEmail;
}
if (phone !== undefined) {
  if (
    typeof phone !== "string" ||
    (phone.trim() !== "" && !/^[6-9]\d{9}$/.test(phone.trim()))
  ) {
    return res.status(400).json({
      message: "Please provide a valid 10-digit mobile number",
    });
  }

  update.phone = phone.trim();
}
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {$set:update},
            {new:true, runValidators:true,}
        ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
      return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
    }catch(error){
        if(error.code ===11000){
            return res.status(409).json({
                message:"email is already registered",
            });
        }
        console.error("update profile error:", error);
        return res.status(500).json({
            message:"failed to update profile",
        });
    }
};

exports.changeMyPassword = async(req,res)=>{
    try{
        const {currentPassword, newPassword}= req.body;
        if(typeof currentPassword !== "string"|| typeof newPassword !=="string" || !currentPassword || !newPassword){
            return res.status(400).json({
                message:"current password and new pass required"
            });
        }
        if(newPassword.length<8){
            return res.status(400).json({
                message:"new pass must be atleast 8 chars",
            });
        }
        const user = await User.findById(req.user._id);
        console.log("Logged-in profile:", {
  userId: String(req.user._id),
  email: req.user.email,
});
        if(!user){
            return res.status(404).json({
                message:"user not found",
            });
        }
       const isMatch = await user.comparePassword(currentPassword);
        if(!isMatch){
            return res.status(400).json({
                message:"current  pass is incorrect",
            });
        }
        user.password = newPassword;
        await user.save();
        return res.status(200).json({
            message:"password change successfuly, please login again",
        });
    }catch(error){
        console.error("change password error:",error);
        return res.status(500).json({
            message:"failed to change pass",
        });
    }
};
exports.getDeliveryPartners=async(req,res)=>{
    try{
        const deliveryPartners= await User.find({
            role:"deliveryPartner",
        })
        .select("name email phone")
        .sort({name:1});
        return res.status(200).json({
            message:"delivery partner fetched successfully",
            deliveryPartners,
        });
    }catch(error){
        console.log("get delivery partner error:", error);
        return res.status(500).json({
            message:"failed to fetch delivery partener ",
        });
    }
    
};