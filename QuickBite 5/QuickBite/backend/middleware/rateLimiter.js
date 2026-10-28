const rateLimit= require("express-rate-limit");
const rateLimiter= rateLimit({
    windowMs:15*60*1000,
    limit:300,
    standardHeaders:"draft-8",
    legacyHeaders:false,
    message:{message:"too many request,please try later,",},
});
module.exports= rateLimiter;