const fs= require("fs/promises");
const{uploadImage}=require("../services/storageService");

exports.uploadImageController=async(req,res)=>{
    let filePath;
    try{
        if(!req.file){
            return res.status(400).json({
                message:"please select an image",
            });
        }
        filePath = req.file.path;
        const result = await uploadImage(filePath,"quickbite");
        return res.status(200).json({
            message:"image uploaded success",
            url:result.url,
            publicId:result.publicId,
        });
    }catch(error){
        console.error("image upload error:",error.message);
        return res.status(500).json({
            message:"image upload failedd",
        });
    }finally{if(filepath){
        await fs.unlink(filePath).catch(()=>{});
    }}
};