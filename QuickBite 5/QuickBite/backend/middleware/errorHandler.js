function errorHandler(err,req,res,next){
    console.error("request error:", err.message);
    if(res.headersSent){return next(err);

    }
    const statusCode= err.statusCode|| err.status||500;
    return res.status(statusCode).json({
        message:statusCode>=500 
        ?"internal server error"
        :err.message||" request failed",
    });
}
module.exports = errorHandler;