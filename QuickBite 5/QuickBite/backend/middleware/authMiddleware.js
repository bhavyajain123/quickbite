const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req,res,next){
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader ||!authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                message:"authentication token required",
            });
        }
         const token = authHeader.split(" ")[1];
           const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if(!user){
        return res.status(401).json({
            message:"user no longer exists",
        });
    }
    req.user = user;
    next();
      } catch (error) {
    console.error(
      "JWT ERROR:",
      error.name,
      error.message
    );

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}
function adminOnly(req,res,next){
  if(!req.user || req.user.role !=="admin"){
    return res.status(403).json({
      message:"admin access req",
    });
  }
  next();
}
module.exports ={protect,adminOnly};