const  mongoose = require("mongoose");
const Address = require("../models/Address");

exports.addAddress = async(req,res)=>{
    try{
        const{fullName,phone,addressLine,landmark,city,state,pincode,addressType, isDefault,latitude, longitude, } = req.body;
        if(!fullName?.trim()|| !phone?.trim() || !addressLine?.trim()|| !city?.trim()|| !state?.trim()||!pincode?.trim()){
            return res.status(400).json({
                message:"please provide all required address fileds",
            });
        }
        if (!/^[0-9]{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        message: "Pincode must contain 6 digits",
      });
    }
    if(addressType !==undefined &&
        !["home","work","other"].includes(addressType)
    ){
        return res.status(400).json({
            message:"address type must be home work or ohter",
        });
    }
    const shouldBeDefault = isDefault ===true || (await Address.countDocuments({user:req.user._id})) ===0;

    if(shouldBeDefault){
        await Address.updateMany(
            {user:req.user._id , isDefault:true},
            {$set :{isDefault:false}}
        );
    }
    const address = await Address.create({
        user:req.user._id,
        fullName:fullName.trim(),
        phone:phone.trim(),
        addressLine: addressLine.trim(),
        landmark:landmark?.trim() || "",
        city:city.trim(),
        state:state.trim(),
        pincode:pincode.trim(),
        latitude: typeof latitude ==="number"&& Number.isFinite(latitude)
        ?latitude
        :undefined,
        longitude:typeof longitude=== "number" && Number.isFinite(longitude)
        ?longitude
        :undefined,
        addressType:addressType ||"home",
        isDefault:shouldBeDefault ,
    });
    return res.status(201).json({
        message:"address added successfuly",
        address,
    });

       
    }catch(error){
        console.error("erro while adding address",error.message);
        return res.status(500).json({
            message:"failed to add address",
        });
    }
};

exports.getMyAddresses = async(req,res)=>{
    try{
        const addresses = await Address.find({
            user:req.user._id,
        }).sort({isDefault:-1, createdAt:-1});
        return res.status(200).json({
            count:addresses.length,
            addresses,
        });
    }catch(error){
        console.log("getting address detail", error.message);
        return res.status(500).json({
            message:"failed to fethch the address",
        })
    }
};

exports.updateAddress = async(req,res)=>{
    try{
        const{id}= req.params;
        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"invalid address",
            });
        }
        const allowedFields=[ "fullName", "phone","addressLine","landmark","city","state","pincode",
"addressType","latitude","longitude",];
const updates = {};

for (const field of allowedFields) {
  if (req.body[field] === undefined) continue;

  if (field === "latitude" || field === "longitude") {
    const value = req.body[field];

    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      (field === "latitude" && (value < -90 || value > 90)) ||
      (field === "longitude" && (value < -180 || value > 180))
    ) {
      return res.status(400).json({
        message: `Invalid ${field}`,
      });
    }

    updates[field] = value;
    continue;
  }

  if (
    typeof req.body[field] !== "string" ||
    (field !== "landmark" && !req.body[field].trim())
  ) {
    return res.status(400).json({
      message: `Invalid ${field}`,
    });
  }

  updates[field] = req.body[field].trim();
}
if(updates.phone && !/^[0-9]{10}$/.test(updates.phone)){
    return res.status(400).json({
        message:"phone number must conatin 10 digit",
    });
}
if(updates.pincode && !/^[0-9]{6}$/.test(updates.pincode)){
    return res.status(400).json({
        message:"pincode must contain 6 digit",
    });
}
if(updates.addressType && !["home","work","other"].includes(updates.addressType)
){
    return res.status(400).json({
        message:"invalid address type",
    });
}
if(Object.keys(updates).length ===0){
    return res.status(400).json({
        message:"provide atleast one field to update",
    });
}
const address = await Address.findOneAndUpdate(
    {_id:id, user:req.user._id},
    {$set:updates},
    {new:true, runValidators:true}
);
if(!address){
    return res.status(404).json({
        message:"address not found",
    });
}
return res.status(200).json({
    message:"address updated successfully",
    address,
});
    }catch(error){
        console.error("update address error:",error);
        return res.status(500).json({
            message:"failed to update address",
        });
    }
};

exports.deleteAddress = async(req,res)=>{
    try{
        const{id}= req.params;
        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"invalid address id",
            });
        }
        const address = await Address.findOneAndDelete({
            _id:id,
            user:req.user._id,
        });
        if(!address){
            return res.status(400).json({
                message:"address not found",
            });
        }
        if(address.isDefault){
            const nextAddress = await Address.findOne({
                user:req.user._id,

            }).sort({createdAt:-1});
            if(nextAddress){
                nextAddress.isDefault= true;
                await nextAddress.save();
            }
        }
        return res.status(200).json({
            message:"address delted successfully",
        });
    }catch(error){
        console.error("delete address error:", error.message);
        return res.status(500).json({
            message:"failed to delete address",
        });
    }
}

exports.setDefaultAddress = async(req,res)=>{
    try{
        const{id} = req.params;

        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"invalid address id",
            });
        }
        const address = await Address.findOne({
            _id: id,
      user: req.user._id,
            
        });
        if(!address){
            return res.status(404).json({
                message:"address not found",
            });
        }
        await Address.updateMany(
             { user: req.user._id, isDefault: true },
      { $set: { isDefault: false } }
        );
        address.isDefault = true;
        await address.save();

        return res.status(200).json({
            message:"default address updates successfully",
            address,
        });
    }catch(error){
        console.error("set deault address error", error.message);
        return res.status(500).json({
            message:"failed to set defailt address",
         });
    }
};