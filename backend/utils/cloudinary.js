const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary not configured');
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'formbuilder',
      resource_type: 'auto',
      quality: 'auto:best',
      fetch_format: 'auto'
    });

    // Clean up temporary file
    fs.unlinkSync(file.path);

    return result;
  } catch (error) {
    // Clean up temporary file on error
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};