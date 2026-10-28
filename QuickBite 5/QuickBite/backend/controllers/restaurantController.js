const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const{calculateDistance, isValidCoordinates}=require("../services/mapsService");


exports.getRestaurants = async(req,res)=>{
    try{
        const{latitude,longitude}=req.query;
        const restaurants = await Restaurant.find().sort({ createdAt: -1 });
        let result=restaurants.map((restaurant)=>{
            const data= restaurant.toObject();
            if(latitude!==undefined && longitude!== undefined && isValidCoordinates(latitude,longitude)&& isValidCoordinates(data.latitude, data.longitude)){
                data.distanceKm = calculateDistance(Number(latitude),Number(longitude),data.latitude, data.longitude);
            }
            return data;
        });
        if(latitude!== undefined && longitude !==undefined){
            if(!isValidCoordinates(latitude,longitude)){
                return res.status(400).json({
                    message:"invalid long or latitude",
                });
            }
            result= result.filter((restaurant)=>restaurant.distanceKm!==undefined);
            result.sort((a,b)=> a.distanceKm-b.distanceKm);
        }
        return res.status(200).json({count:result.length, restaurants:result, });
    }catch(error){
        console.error("get restauarant error:",error.message);
        return res.status(500).json({
            message:"failed to fetch restaurant",
             error: error.message,
        });
    }
};
exports.getRestaurantById=async(req,res)=>{
    try{
        const{id}= req.params;
        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"invalid restaurant id",
            });
        }
        const restaurant =await Restaurant.findById(id);
        if(!restaurant){
            return res.status(404).json({
                message:"restaurant not found",
            });
        }
        return res.status(200).json({restaurant});
    }catch(error){
        console.error("get restaurant error:", error.message);
        return res.status(500).json({
            message:"fialed to fetch restaurant",
        });
    }
};


exports.createRestaurant = async(req,res)=>{
    try{
        const{name,description,image,cuisine,address,deliveryTime,latitude,longitude}= req.body;

        if(!name?.trim()|| !address?.trim()|| !Array.isArray(cuisine)|| cuisine.length ===0){
            return res.status(400).json({
                message:"name, address and atleast one cuisine are required",
            });
        }
        const restaurant = await Restaurant.create({
            name,description,image,cuisine,address,deliveryTime,latitude,longitude,
        });
        return res.status(201).json({
            message:"restaurant created successful",
            restaurant,
        });
    }catch(error){
        console.error("create restaurant error:", error.message);
        if(error.name==="ValidationError"){
            return res.status(400).json({
                message:error.message,
            });
        }
        return res.status(500).json({
            message:error.message,
        });
    }
};

const updateRestaurant = async(req, res)=>{
    try{
        const { id } = req.params;

        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"invalid restaurantt id ",
            });
        }
        const allowedFields =["name","description","image","cuisine","address","deliveryTime","rating","isOpen","latitude","longitude"];
        const updates ={};

        for(const field of allowedFields){
            if(req.body[field] !== undefined){
                updates[field]= req.body[field];
            }
        }
        if(Object.keys(updates).length ===0){
            return res.status(400).json({
                message:"no valid fields provided for update",
            });

        }
        const restaurant = await Restaurant.findByIdAndUpdate(
            id,updates,
            {new:true, runValidators:true,}
        );
        if(!restaurant){
            return res.status(404).json({
                message:"restaurant not found",
            });
        }
        return res.status(200).json({
            message:"restaurant updated successfully",
            restaurant,
        });
    }catch(error){
        console.error("update restaurant error:", error.message);

        return res.status(500).json({
            message:error.message,
        });
    }
};

const deleteRestaurant = async(req, res)=>{
    try{
       const { id } = req.params;
        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"invalid restaurant id",
            });
        }
        const restaurant = await Restaurant.findByIdAndDelete(id);

        if(!restaurant){
            return res.status(404).json({
                messaage:"restaurant not found",
            });
        }
        return res.status(201).json({
            message:"Restaurant deleted successfully",
        });
    }catch(error){
        console.error("dlete restaurat error:" , error.message);
        return res.status(500).json({
            message:"failed to delete restaurant",
        });
    }
};



exports.searchRestaurants = async (req,res) => {
    try{
      const {search, cuisine, minRating, isOpen} = req.query;
      const filter={};
      
      if(search && search.trim()){
     filter.name = { $regex: search.trim(), $options: "i" };
      }
       if (cuisine && cuisine.trim()) {
      filter.cuisine = {
        $regex: cuisine.trim(),
        $options: "i",
      };
    }

    if(minRating !==undefined){
        const rating = Number(minRating);
        if(!Number.isFinite(rating)|| rating<0||rating>5){
            return res.status(400).json({
                message:"rating should be bw 0 and 5",
            });
        }
        filter.rating = { $gte: rating };
    }

    if(isOpen !== undefined){
        if(!["true","false"].includes(isOpen)){
            return res.status(400).json({
                message:"isOpen must be true or false",
            });
        }
          filter.isOpen = isOpen === "true";
    }
    const restaurants = await Restaurant.find(filter).sort({
        rating:-1,
        name:1,
    });
    return res.status(200).json({
        count:restaurants.length,
        restaurants,
    });
    }catch(error){
        console.error("search restaurants error:",error);
        return res.status(500).json({
            message:"failed to search restaurants",
        });
    }
};

exports.updateRestaurant = updateRestaurant;
exports.deleteRestaurant= deleteRestaurant;
