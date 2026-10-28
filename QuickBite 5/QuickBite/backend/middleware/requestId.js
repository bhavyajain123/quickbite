const {randomUUID}= require("crypto");
function requestId(req,res,next){
    req.id= randomUUID();
    res.setHeader("x-request-id", req.id);
    next();
}
module.exports =requestId;