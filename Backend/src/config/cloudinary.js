const cloudinary = require('cloudinary').v2;

// Configure Cloudinary only if credentials are available
if (process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log('Cloudinary configured successfully');
} else {
  console.warn('⚠️ Cloudinary credentials not found. Images will be stored as base64.');
}

module.exports = cloudinary;

