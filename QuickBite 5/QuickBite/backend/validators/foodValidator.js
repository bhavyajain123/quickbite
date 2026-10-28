const Joi= require("joi");
const createFoodSchema= Joi.object({
    name:Joi.string().trim().required(),
    description:Joi.string().allow("").optional(),
    image:Joi.string().allow("").optional(),
    price:Joi.number().min(0).required(),
    category:Joi.string().trim().required(),
    restaurant:Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
        isAvailable:Joi.boolean().optional(),
   
});
const updateFoodSchema= Joi.object({
    name:Joi.string().trim(),
    description:Joi.string().allow(""),
    image:Joi.string().allow(""),
    price:Joi.number().min(0),
    category:Joi.string().trim(),
    isAvailable:Joi.boolean(),
}).min(1);

module.exports={createFoodSchema, updateFoodSchema,};