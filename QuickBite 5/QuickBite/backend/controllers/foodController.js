const mongoose = require("mongoose");
const Food = require("../models/Food");
const Restaurant= require("../models/Restaurant");
const{uploadImage}= require("../services/storageService");
const fs = require("fs/promises");


exports.getFoods = async (req, res) => {
  try {
    const { restaurant } = req.query;
    const filter = {};

    if (restaurant) {
      if (!mongoose.isValidObjectId(restaurant)) {
        return res.status(400).json({
          message: "Invalid restaurant ID",
        });
      }

      filter.restaurant = restaurant;
    }

    const foods = await Food.find(filter)
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error("get foods error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch food items",
    });
  }
};


exports.getFoodsByRestaurant = async(req,res)=>{
    try{
         const { restaurantId } = req.params;
        if (!mongoose.isValidObjectId(restaurantId)) {
            return res.status(400).json({
                message:"invalid restaurant id",
            });
        }
        const restaurant = await Restaurant.findById(restaurantId);
        if(!restaurant){
            return res.status(404).json({
                message:"restaurant not found",
            });
        }
        const foods = await Food.find({
            restaurant:restaurantId,
        }).sort({createdAt:-1});

        return res.status(200).json({
            count:foods.length,
            foods,
        });
    }catch(error){
        console.error("get restauranrt menu error", error.message);
        return res.status(500).json({
            message:"failed to fetch restaurant menu",
        });
    }
};

exports.getFoodById = async(req,res)=>{
    try{
        const{id}= req.params;

        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"invalid food id",
            });
        }

        const food = await Food.findById(id).populate(
            "restaurant","name"
        );

        if(!food){
            return res.status(404).json({
                message:"food item not found",
            });
        }
        return res.status(200).json({food});
    }catch(error){
        console.error("get food error",error.message);
        return res.status(500).json({
            message:"failed to fetch food item",
        });
    }
};

exports.createFood = async(req,res)=>{
    try{
        const{name,description,image,price,category,restaurant,}= req.body;
        const numericPrice = Number(price);

        if(typeof name !== "string"|| !name.trim()||
            typeof category !=="string" || !category.trim()||
             price === undefined || price === ""||!Number.isFinite(numericPrice) ||  numericPrice < 0 ||
             typeof restaurant !=="string" || !mongoose.isValidObjectId(restaurant) 

        ){
            return res.status(400).json({
                message:"Valid name, category, non-negative numeric price and restaurant ID are required",
            });
        }
        const restaurantExists = await Restaurant.findById(restaurant);

        let imageUrl =image|| "";
        if(req.file){
            const result= await uploadImage(req.file.path, "quickbite/foods");
            imageUrl= result.url;
        }

        if(!restaurantExists){
            return res.status(400).json({
                message:"restaurant not found",
            });
        }
        const food = await Food.create({
            name:name.trim(),
            description,
            image: imageUrl,
            price:numericPrice,
            category:category.trim(),
            restaurant,
        });

        return res.status(201).json({
            message:"food item created successfully",
            food,
        });
    }catch(error){
        console.error("food error", error.message);
        
        if(error.name === "ValidationError"){
            return res.status(400).json({
                message:error.message,
            });
        }
        return res.status(500).json({
            message:"failed to create food item",
        });
    }
};

exports.updateFood = async(req,res)=>{
    const filePath = req.file?.path;
    try{
        const{id} = req.params;
        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"invalid food id",
            });
        }
        const allowedFields =["name","description","image","price","category","isAvailable",];
        const updates={};

 for (const field of allowedFields) {
  if (req.body[field] !== undefined) {
    updates[field] = req.body[field];
  }
}

if(updates.name !== undefined){
    if(typeof updates.name !=="string"|| !updates.name.trim()){
        return res.status(400).json({
            message:"food name cannot be empty",
        });
    }
    updates.name= updates.name.trim();
}
if(updates.category!== undefined){
    if(typeof updates.category!=="string" || !updates.category.trim()){
        return res.status(400).json({
            message:"category cant be empty",
        });
    }
    updates.category=updates.category.trim();
}
if(updates.price !==undefined){
    if(
        updates.price===""|| !Number.isFinite(Number(updates.price))|| Number(updates.price)<0
    ){return res.status(400).json({
        message:"price should be positive "
    });
}
updates.price =Number(updates.price);
}
if(updates.isAvailable!== undefined){
    if(updates.isAvailable==="true"){
        updates.isAvailable=true;
    }else if(updates.isAvailable==="false"){
        updates.isAvailable=false;
    }
    else if(typeof updates.isAvailable!=="boolean"){
        return res.status(400).json({
            message:"isvaailable must be true or false",
        });
    }
}
if(req.file){
    const result=await uploadImage(req.file.path, "quickbite/foods");
    updates.image= result.url;
}
        if(Object.keys(updates).length ===0){
            return res.status(400).json({
                message:"no valid fields provided for update",
            });
        }
         if (
      updates.name !== undefined &&
      (typeof updates.name !== "string" || !updates.name.trim())
    ) {
      return res.status(400).json({
        message: "Food name cannot be empty",
      });
    }

    if(updates.category !== undefined &&
        (typeof updates.category !== "string" ||
            !updates.category.trim())
        
    ){
        return res.status(400).json({
            message:"category cannot be empty",
        });
    }
    if(
        updates.price !== undefined &&
        (typeof updates.price !== "number" ||
            !Number.isFinite(updates.price)||
            updates.price<0 )
    
    ){
        return res.status(400).json({
            message:"price should not be negative",
        });
    }
    if(updates.name !==undefined){
        updates.name = updates.name.trim();
    }
     if (updates.category !== undefined) {
      updates.category = updates.category.trim();
    }

    const food = await Food.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!food) {
      return res.status(404).json({
        message: "Food item not found",
      });
    }

    return res.status(200).json({
      message: "Food item updated successfully",
      food,
    });
  } catch (error) {
    console.error("Update food error:", error.stack);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Failed to update food item",
    });
    }
    finally {
    if (filePath) {
        await fs.unlink(filePath).catch(() => {});
    }
}
};
exports.deleteFood = async (req, res) => {
    try{
        const{id}= req.params;
        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"invalid food id",
            });
        }
        const food = await Food.findByIdAndDelete(id);
        if(!food){
            return res.status(400).json({
                message:"food item not found",
            });
        }
        return res.status(200).json({
            message:"food item deleted successfully",
        });
        
    }catch(error){
        console.error("delete food error", error.message);
        return res.status(500).json({
            message:"failed to delete food item",
        });

    }
};

exports.searchFoods = async (req, res) => {
    try{
      const { search, category, minPrice, maxPrice, restaurant } = req.query;
 const filter ={isAvailable:true,};
  
     if (search && search.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }
     if (category && category.trim()) {
      filter.category = {
        $regex: `^${category.trim()}$`,
        $options: "i",
      };
    }
     if (restaurant) {
      if (!mongoose.isValidObjectId(restaurant)) {
        return res.status(400).json({
          message: "Invalid restaurant ID",
        });
      }

      filter.restaurant = restaurant;
    }
    if(minPrice !== undefined || maxPrice !== undefined){
        const min= minPrice === undefined ?0 : Number(minPrice);
        const max = maxPrice === undefined ? Infinity : Number(maxPrice);


        if(!Number.isFinite(min)|| min<0 ||(maxPrice !==undefined && (!Number.isFinite(max)|| max<min))
        ){
     return res.status(400).json({
          message: "Invalid price range",
     });
    }
     filter.price = { $gte: min };

      if (maxPrice !== undefined) {
        filter.price.$lte = max;
      }
    }

    const foods = await Food.find(filter)
      .populate("restaurant", "name")
      .sort({ name: 1 });

    return res.status(200).json({
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error("Search foods error:", error);

    return res.status(500).json({
      message: "Failed to search foods",});
      
}
};

