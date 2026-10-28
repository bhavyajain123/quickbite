const mongoose = require("mongoose");
const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");


const updateRestauranRating = async(restaurantId)=>{
    const result= await Review.aggregate([
        {
            $match:{
                restaurant: new mongoose.Types.ObjectId(restaurantId.toString()),
            },
        },{
            $group:{
                _id:"$restaurant",
                averageRating:{$avg:"$rating"},
            },
        },
    ]);
    const rating = result.length>0 
    ?Math.round(result[0].averageRating*10)/10
    :0;
    await Restaurant.findByIdAndUpdate(restaurantId,{rating,});
};

const updateRestaurantRating = async (restaurantId) => {
  const result = await Review.aggregate([
    {
      $match: {
        restaurant: new mongoose.Types.ObjectId(
          restaurantId.toString()
        ),
      },
    },
    {
      $group: {
        _id: "$restaurant",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  const rating =
    result.length > 0
      ? Math.round(result[0].averageRating * 10) / 10
      : 0;

  await Restaurant.findByIdAndUpdate(restaurantId, { rating });
};
exports.createReview = async(req,res)=>{
    try{
        const{restaurant, rating, comment}= req.body;
        if(!mongoose.isValidObjectId(restaurant)){
            return res.status(400).json({
                message:"valid restaurant id is req",
            });
        }
      if (
  typeof rating !== "number" ||
  !Number.isInteger(rating) ||
  rating < 1 ||
  rating > 5
) {
  return res.status(400).json({
    message: "Rating must be an integer from 1 to 5",
  });
}
        if(comment!== undefined && (typeof comment !=="string" || comment.length>1000)){
            return res.status(400).json({
                 message: "Comment must be text up to 1000 characters",
            });
        }
          const restaurantExists = await Restaurant.findById(restaurant);
          if(!restaurantExists){
            return res.status(404).json({
                message:"restaurant not found",
            });
          }
          const review = await Review.create({
            customer:req.user._id,
            restaurant,
            rating,
            comment:comment?.trim()||"",
          });
          await updateRestaurantRating(restaurant);

            return res.status(201).json({
      message: "Review submitted successfully",
      review,
      });
    }catch(error){
        if(error.code ===11000){
            return res.status(409).json({
                message:"you have already reviewed this restarant",

            });
        }
        console.error("create review eerror :", error);
        return res.status(500).json({
            message:"failed to submit review",
            error: error.message,
        });
    }
};

exports.getRestaurantReviews = async (req, res) => {
    try{
        const{restaurantId}= req.params;
           if (!mongoose.isValidObjectId(restaurantId)) {
      return res.status(400).json({
        message: "Invalid restaurant ID",
      });
    }
    const reviews = await Review.find({restaurant:restaurantId})
    .populate("customer","name")
    .sort({createdAt:-1});

     return res.status(200).json({
      count: reviews.length,
      reviews,
    });
    }catch(error){
        console.error("get revieews error:", error);
        return res.status(500).json({
            message:"failed to fetch reviews",
             error: error.message,
        });
    }
};

exports.deleteMyReview = async(req,res)=>{
    try{
        const {id}= req.params;
        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"invalid review id",
            });
        }
        const review = await Review.findOneAndDelete({
             _id: id,
     customer: req.user._id,
        });
        if(!review){
            return res.status(404).json({
                message:"review not found",
            });
        }
        await updateRestaurantRating(review.restaurant);
        return res.status(200).json({
            message:"review deleted successfully",
        });
    }catch(error){
        console.error("delete review error:", error);
        return res.status(500).json({
            message:"failed to delete review",
        });
    }
};