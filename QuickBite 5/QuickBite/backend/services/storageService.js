const cloudinary= require("cloudinary").v2;
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(filePath,folder="quickbite"){
    if(!filePath){
        throw new Error("Image file path is required");
    }
    const result= await cloudinary.uploader.upload(filePath,{folder, resource_type:"image",});
    return{
        url:result.secure_url,
        publicId:result.public_id,
    };
}
async function deleteImage(publicId){
    if(!publicId){
        throw new Error("image publicid is req");
    }
    return cloudinary.uploader.destroy(publicId,{resource_type:"image",});

}
module.exports ={uploadImage, deleteImage};