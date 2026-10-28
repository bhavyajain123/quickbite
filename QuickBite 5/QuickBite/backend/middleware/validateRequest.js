const validateRequest=(schema)=>{
    return(req,res,next)=>{
        const{error,value}= schema.validate(req.body,{abortEarly:false, stripUnknown:true,convert:true});

        if(error){
            return res.status(400).json({
                message:"validation failed",
                errors:error.details.map((detail)=> detail.message),
            });
        }
        req.body=value;
        next();
    };
};
module.exports= validateRequest;