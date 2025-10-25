const express = require('express');
const router = express.Router();
const { 
  checkEmailInUse, 
  requestOtp, 
  verifyOtp, 
  updateProfile, 
  verifyToken,
  verifyTokenEndpoint
} = require('../controllers/authController');

// Public routes
router.post('/check-email', checkEmailInUse);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);

// Protected routes (require authentication)
router.post('/update-profile', verifyToken, updateProfile);
router.get('/verify-token', verifyTokenEndpoint);

module.exports = router;