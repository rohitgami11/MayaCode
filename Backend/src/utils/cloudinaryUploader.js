const cloudinary = require('../config/cloudinary');

/**
 * Upload base64 image to Cloudinary as-is
 * @param {string} base64Image - Base64 encoded image with data URI prefix
 * @returns {Promise<string>} - Cloudinary image URL
 */
async function uploadImageToCloudinary(base64Image) {
  try {
    console.log('Uploading image to Cloudinary...');
    
    // Upload directly to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      resource_type: 'image',
      folder: 'mayacode-posts',
    });
    
    console.log('Image uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param {Array<string>} images - Array of base64 encoded images
 * @returns {Promise<Array<string>>} - Array of Cloudinary image URLs
 */
async function uploadImagesToCloudinary(images) {
  if (!images || images.length === 0) {
    return images;
  }
  
  const uploadedUrls = [];
  
  for (let i = 0; i < images.length; i++) {
    console.log(`Uploading image ${i + 1}/${images.length} to Cloudinary...`);
    try {
      const url = await uploadImageToCloudinary(images[i]);
      uploadedUrls.push(url);
    } catch (error) {
      console.error(`Error uploading image ${i + 1}:`, error);
      // Skip the image if upload fails
    }
  }
  
  return uploadedUrls;
}

module.exports = {
  uploadImageToCloudinary,
  uploadImagesToCloudinary
};

