const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

//Cloudinary upload Image

const cloudinaryUploadImage = async (fileToUpload) => {
    try {
        const data = await cloudinary.uploader.upload(fileToUpload, {
            resource_type: 'auto',
        });
        return data;
    } catch (error) {
        return error;
    }
};

//Cloudinary Remove Image

const cloudinaryRemoveImage = async (imagePublicId) => {
    try {
        const result = await cloudinary.uploader.destroy(imagePublicId);
        return result;
    } catch (error) {
        return error;
    }
};

//Cloudinary Remove  Multiple Image

const cloudinaryRemoveMultipleImage = async (publicIds) => {
    try {
        const result = await cloudinary.api.delete_resources(publicIds);
        return result;

    } catch (error) {
        console.log(error)
        throw new Error('Internal Server Error (cloudinary)');
    }
}




module.exports = {
    cloudinaryUploadImage,
    cloudinaryRemoveImage,
    cloudinaryRemoveMultipleImage
};
