/**
 * Upload base64 image to Cloudinary as-is
 * @param {string} base64Image - Base64 encoded image with data URI prefix
 * @returns {Promise<string>} - Cloudinary image URL
 */
async function uploadImageToCloudinary(base64Image) {
  try {
    const cloudinary = require('../config/cloudinary');
    console.log('📤 Uploading single image to Cloudinary...');
    console.log('Base64 length:', base64Image.length);
    
    // Upload directly to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      resource_type: 'image',
      folder: 'mayacode-posts',
    });
    
    console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
    console.log('Image public_id:', result.public_id);
    console.log('Image bytes:', result.bytes);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Error uploading image to Cloudinary:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
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
    console.log(`📤 Uploading image ${i + 1}/${images.length} to Cloudinary...`);
    try {
      const url = await uploadImageToCloudinary(images[i]);
      uploadedUrls.push(url);
      console.log(`✅ Image ${i + 1} uploaded successfully`);
    } catch (error) {
      console.error(`❌ Error uploading image ${i + 1}:`, error);
      throw error; // Don't skip - throw to caller
    }
  }
  
  return uploadedUrls;
}

module.exports = {
  uploadImageToCloudinary,
  uploadImagesToCloudinary
};

