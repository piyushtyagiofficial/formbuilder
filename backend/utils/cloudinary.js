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

    let uploadOptions = {
      folder: 'formbuilder',
      resource_type: 'auto',
      quality: 'auto:best',
      fetch_format: 'auto'
    };

    let result;
    
    // Handle both memory storage (buffer) and disk storage (path)
    if (file.buffer) {
      // Memory storage - upload from buffer
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });
    } else if (file.path) {
      // Disk storage - upload from file path
      result = await cloudinary.uploader.upload(file.path, uploadOptions);
      
      // Clean up temporary file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } else {
      throw new Error('Invalid file object - no buffer or path found');
    }

    return result;
  } catch (error) {
    // Clean up temporary file on error (only for disk storage)
    if (file.path && fs.existsSync(file.path)) {
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