const Joi = require("joi");
const createPaymentSchema= Joi.object({
    orderId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),

    method:Joi.string()
    .valid("COD","UPI")
    .required(),
    
});
module.exports={createPaymentSchema,};