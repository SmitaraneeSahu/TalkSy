import React from "react";
export const uploadImageToCloudinary = async(file) =>{
    const formData = new FormData();
    formData.append("file",file);
    formData.append("upload_preset","profile_upload");
    const res = await fetch("https://api.cloudinary.com/v1_1/dnbsaommv/image/upload",
        {
            method: "POST",
            body: formData
        }
    );
    if (!res.ok) throw new Error("image upload failed");
    const data = await res.json();
    return data.secure_url;
}