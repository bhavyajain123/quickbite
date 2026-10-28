const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Food = require("../models/Food");

exports.addToCart = async(req,res)=>{
    try{
        const{foodId , quantity =1}= req.body;

        if(!mongoose.isValidObjectId(foodId)){
            return res.status(400).json({
                message:"invalid food id",
            });
        }
        if(!Number.isInteger(quantity) || quantity<1 || quantity>100){
            return res.status(400).json({
                message:"quantity must be between 1 and 100",
            });
        }

        const food = await Food.findById(foodId);
        if(!food || food.isAvailable ===false){
            return res.status(404).json({
                message:"food not available",
            });
        }
        let cart = await Cart.findOne({user:req.user._id});
        if(!cart){
            cart = await Cart.create({
                user: req.user._id,
                items:[],
            });
        }
        const existingItem = cart.items.find(
            (item)=>item.food.toString()===foodId
        );

        if(existingItem){
            if(existingItem.quantity + quantity >100){
                return res.status(400).json({
                    message:"max quantity per food is 100",
                });
            }
            existingItem.quantity += quantity;
        }else{
            cart.items.push({food:foodId , quantity});
        }
        await cart.save();

        cart= await Cart.findById(cart._id).populate("items.food","name price and image isavailable restaurant");

        const items = cart.items.map((item)=>({
            food:item.food,
            quantity:item.quantity,
            itemTotal : item.food.price * item.quantity,
        }));
        const totalAmount = items.reduce(
            (sum,item)=>sum + item.itemTotal,
            0
        );
        return res.status(200).json({
            message:"food added to cart successfully",
            items,
            totalAmount,
        });

    }catch(error){
        console.error("add to cart error", error.message);
        return res.status(500).json({
            message:"failed to add food to cart",
        });
    }
};

exports.getCart = async(req,res)=>{
    try{
        const cart = await Cart.findOne({
            user: req.user._id,
        }).populate("items.food","name price image isAvailable restaurant");

         if (!cart) {
      return res.status(200).json({
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });
    }

     const items = cart.items
      .filter((item) => item.food)
      .map((item) => ({
        food: item.food,
        quantity: item.quantity,
        itemTotal: item.food.price * item.quantity,
      }));

    const totalItems = items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

const totalAmount = items.reduce(
    (sum, item) => sum + item.itemTotal,
    0
);

    return res.status(200).json({
        items,
        totalItems,
        totalAmount,
    });

    }catch(error){
        console.error("get cart error:" , error.message);
        return res.status(500).json({
            message:"failed to fetch cart",
        });
    }
};


exports.updateCartItem = async(req,res)=>{
    try{
        const{foodId}= req.params;
        const {quantity}= req.body;

        if(!mongoose.isValidObjectId(foodId)){
            return res.status(400).json({
                messsage:"invalid food id",
            });
        }
        if( !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 100){
        return res.status(400).json({
            message:"quantity should be bw 1 and 100",
        });
      }
      const cart = await Cart.findOne({user:req.user._id});

      if(!cart){
        return res.status(404).json({
            message:"cart not found",
        });
      }
      const item = cart.items.find(
      (entry) => entry.food.toString() === foodId
    );

    if(!item){
        return res.status(404).json({
            message:"food not found in cart",
        });
    }
    item.quantity = quantity;
    await cart.save();

const updatedCart = await Cart.findById(cart._id).populate(
  "items.food",
  "name price image isAvailable restaurant"
);

     const items = updatedCart.items
      .filter((entry) => entry.food)
      .map((entry) => ({
        food: entry.food,
        quantity: entry.quantity,
        itemTotal: entry.food.price * entry.quantity,
      }));

    const totalAmount = items.reduce(
      (sum, entry) => sum + entry.itemTotal,
      0
    );

    return res.status(200).json({
        message:"cart quantity updated successfully",
        items,
        totalAmount,
    });


    }catch(error){
        console.error("update cart error:", error.message);
        return res.status(500).json({
            message:"failed to update cart",
        });
    }
};

exports.removeCartItem = async(req, res)=>{
    try{
        const{foodId}= req.params;

        if(!mongoose.isValidObjectId(foodId)){

            return res.status(400).json({
                message:"invalid food id",
            });
        }
        const cart = await Cart.findOne({user:req.user._id});

        if(!cart){
            return res.status(404).json({
                message:"cart not found",
            });
        }
        const originalLength = cart.items.length;
        cart.items= cart.items.filter(
            (item)=>item.food.toString()!==foodId
        );

        if(cart.items.length === originalLength){
            return res.status(404).json({
                message:"food not found in cart",
            });
        }
        await cart.save();

        return res.status(200).json({
            message:"food removed from cart successfully",
            itemRemaining : cart.items.length,
        });
    }catch(error){
        console.error("remove cart item error:", error.message);
        return res.status(500).json({
            message:"failed to remove food item from cart",
        });
    }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(200).json({
        message: "Cart is already empty",
      });
    }

    cart.items = [];
    await cart.save();

    return res.status(200).json({
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error.message);
    return res.status(500).json({
      message: "Failed to clear cart",
    });
}
};
