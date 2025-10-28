/**
 * Upload base64 image to Cloudinary as-is
 * @param {string} base64Image - Base64 encoded image with data URI prefix
 * @returns {Promise<string>} - Cloudinary image URL or base64 string
 */
async function uploadImageToCloudinary(base64Image) {
  try {
    const cloudinary = require('../config/cloudinary');
    
    // Check if Cloudinary is configured
    if (!cloudinary.config().cloud_name) {
      console.log('⚠️ Cloudinary not configured, storing as base64');
      return base64Image; // Return base64 string as fallback
    }
    
    console.log('📤 Uploading to Cloudinary...');
    // Upload directly to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      resource_type: 'image',
      folder: 'mayacode-posts',
    });
    
    console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Error uploading image to Cloudinary:', error.message || error);
    console.log('⚠️ Falling back to base64 storage');
    return base64Image; // Return base64 string as fallback
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param {Array<string>} images - Array of base64 encoded images
 * @returns {Promise<Array<string>>} - Array of Cloudinary image URLs or base64 strings
 */
async function uploadImagesToCloudinary(images) {
  if (!images || images.length === 0) {
    return images;
  }
  
  const uploadedUrls = [];
  
  for (let i = 0; i < images.length; i++) {
    try {
      const url = await uploadImageToCloudinary(images[i]);
      uploadedUrls.push(url);
    } catch (error) {
      console.error(`❌ Error uploading image ${i + 1}:`, error.message || error);
      // Don't throw - continue with base64 fallback
      uploadedUrls.push(images[i]); // Use original base64 as fallback
    }
  }
  
  return uploadedUrls;
}

module.exports = {
  uploadImageToCloudinary,
  uploadImagesToCloudinary
};

