const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken= require("../utils/generateToken");
const { getFirebaseApp, getAuth } = require("../config/firebaseAdmin");

exports.register = async(req, res) => {
    try{
        const{name,email,password} = req.body;

        if(!name || !email ||!password){
            return res.status(400).json({
                message:"name,email and password is required",
            });

        }
        if(password.length<8){
            return res.status(400).json({
                message:"password must be atleast 8 characters",
            });
        }
        
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({
            email:normalizedEmail,
        });
        if(existingUser){
            return res.status(409).json({
                mesaage: "email already registered, please sign in instead",
            });
        }
        const user = await User.create({
            name, email:normalizedEmail, password,
        });

        const token = generateToken(user._id);
        return res.status(201).json({
            message:"registered successful",
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
            },
        });
    }catch(error){
        if(error.code ===11000){
            return res.status(409).json({
                message:"email already registered",
            });
        }
        console.log("registered error:", error.message);
        return res.status(500).json({
            message:"registered failed",
        });
    }
};
exports.login = async(req,res)=>{
    try{
        const {email,password}= req.body;
        if(!email ||!password){
            return res.status(400).json({
                message:"email and password are required",
            });

        }
        const user = await User.findOne({
        email: email.trim().toLowerCase(),
        }).select("+password");
        if(!user){
            return res.status(401).json({
                message:"email or password is not correct",
            });

        }
        const match = await bcrypt.compare(password,user.password);
        if(!match){
            return res.status(401).json({
                message:"email or password is not correct",

            });

        }
        const token = generateToken(user._id);
        return res.status(200).json({
            message:"login successful",
            token,
            user:{
                id:user._id, name :user.name,email:user.email,role:user.role,

            },
        });

    }catch(error){
        console.error("login error", error.message);
        return res.status(500).json({
            message:"login failed",
        });
    }
};

exports.getMe = async(req,res)=>{
    return res.status(200).json({
        user:{
            id:req.user._id,
            name:req.user.name,
            email:req.user.email,
            role:req.user.role,

        },
    });
};

exports.updateUserRole = async(req,res)=>{
    try{
        const{userId}= req.params;
        const{role}=req.body;

        const allowedRoles =["customer","admin","deliveryPartner"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message:"invalid user role",
                allowedRoles,
            });
        }
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message:"user not found",
            });
        }
            user.role = role;
    await user.save();

    return res.status(200).json({
        message:"user role updated succesfully",
        user:{id:user._id, name:user.name, email:user.email , role:user.role,},
    });
    }catch(error){
        console.error("update user role error:", error.message);
        return res.status(500).json({
            message:"failed to update user role",
        });
    }
};
exports.firebaseLogin= async(req,res)=>{
    try{const{idToken, name}= req.body;
    if(!idToken){
        return res.status(400).json({
            message:"firebase id token is required",
        });
    }
   const adminApp = getFirebaseApp();
const decoded = await getAuth(adminApp).verifyIdToken(idToken);
    const email= decoded.email?.trim().toLowerCase();

    if (!email) {
        return res.status(403).json({
            message:"please verify your email before signing",
        });
    }
    let user= await User.findOne({email});
    if(!user){
        user= await User.create({
            name:name?.trim()|| decoded.name || email.split("@")[0],
            email,
        });
    }
    const token= generateToken(user._id);
    return res.status(200).json({
        message:"firebase login successful",
        token,
        user:{
            id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
        },
    });

} catch (error) {
    console.error("Firebase login error:", error.code, error.message);
    return res.status(401).json({
        message: "Firebase authentication failed. Please sign in again.",
    });
}
};