    function adminOnly(req,res,next){
        if(!req.user || req.user.role !=="admin"){
            return res.status(404).json({
                message:"access denied . Admin Only",
            });
        }
        next();
    }
    module.exports={adminOnly};