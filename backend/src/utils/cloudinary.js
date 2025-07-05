import {v2 as cloudinary} from "cloudinary";
import fs from "fs"
import { ApiError } from "./ApiError";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary=async (localFilePath)=>{
    try {
        if(!localFilePath)return null;
        const result = await cloudinary.uploader.upload(localFilePath, {
            folder: "taskyn",
            resource_type: "auto",
        });
        fs.unlinkSync(localFilePath);
        return result; 
    } catch (error) {
        console.log("Error uploading to Cloudinary:", error);
        throw new ApiError(500, "Failed to upload file to Cloudinary", [error.message]);
    }
}

export {uploadOnCloudinary};