const Joi= require("joi");
const createOrderSchema=Joi.object({
    addressId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
   
    couponCode:Joi.string()
    .trim()
    .max(50)
    .allow("")
    .optional(),
});


module.exports={createOrderSchema,};