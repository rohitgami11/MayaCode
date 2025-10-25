const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const UserProfile = require('../models/User');

const OTP_EXPIRY_MINUTES = 10;

// Configure nodemailer with better error handling and fallback
const createTransporter = () => {
  try {
    // Try Gmail first
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Add timeout and connection settings
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  } catch (error) {
    console.error('Failed to create SMTP transporter:', error);
    return null;
  }
};

const transporter = createTransporter();

// Check if email is already in use by another user
const checkEmailInUse = async (req, res) => {
  const { email } = req.body;
  const currentUserId = req.user?.id; // From JWT token if authenticated

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const existingUser = await UserProfile.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      // If the user is checking their own email, it's not "in use"
      if (currentUserId && existingUser._id.toString() === currentUserId) {
        return res.json({ 
          inUse: false, 
          message: 'This is your own email address' 
        });
      }

      return res.json({ 
        inUse: true, 
        message: 'Email is already in use by another account' 
      });
    }

    return res.json({ 
      inUse: false, 
      message: 'Email is available' 
    });
  } catch (err) {
    console.error('checkEmailInUse error:', err);
    res.status(500).json({ message: 'Failed to check email availability' });
  }
};

const requestOtp = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);
    
    await Otp.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, expiresAt },
      { upsert: true, new: true }
    );
    
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Login OTP for MayaCode',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">MayaCode Login Verification</h2>
          <p>Your login OTP is:</p>
          <h1 style="color: #1F2937; font-size: 32px; letter-spacing: 4px; text-align: center; padding: 20px; background-color: #F3F4F6; border-radius: 8px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request this OTP, please ignore this email.</p>
          <hr>
          <p style="color: #6B7280; font-size: 12px;">This is an automated message from MayaCode. <br/>Please do not reply to this email as this inbox is not monitored.</p>
        </div>
      `,
    });
    
    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('requestOtp error:', err);
    
    // Provide more specific error messages
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      return res.status(500).json({ 
        message: 'Email service temporarily unavailable. Please try again later.',
        error: 'SMTP_CONNECTION_FAILED'
      });
    } else if (err.code === 'EAUTH') {
      return res.status(500).json({ 
        message: 'Email authentication failed. Please check SMTP credentials.',
        error: 'SMTP_AUTH_FAILED'
      });
    } else {
      return res.status(500).json({ 
        message: 'Failed to send OTP. Please try again.',
        error: 'UNKNOWN_ERROR'
      });
    }
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp, verifyOnly } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    // Check OTP from database
    const record = await Otp.findOne({ email: email.toLowerCase() });
    if (!record || record.otp !== otp || record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    // If verifyOnly is true, just return success without creating account
    if (verifyOnly) {
      return res.json({ 
        message: 'Email verified successfully',
        email: email,
        verified: true,
        status: 'success'
      });
    }
    
    let user = await UserProfile.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Create new user with minimal required fields
      try {
        const userData = {
          email: email.toLowerCase(),
          name: 'Guest User',
          userType: 'Other' // Default user type
        };
        
        console.log('Creating user with data:', userData);
        user = await UserProfile.create(userData);
        console.log('User created successfully:', user._id);
      } catch (createError) {
        console.error('User creation error:', createError);
        return res.status(500).json({ 
          message: 'Account creation failed. Please contact support.',
          error: 'User creation validation failed'
        });
      }
    }
    
    // Delete the used OTP
    await Otp.deleteOne({ email: email.toLowerCase() });
    
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET_VERIFY,
      { expiresIn: '7d' }
    );
    
    return res.json({ 
      user: { 
        email: user.email, 
        id: user._id,
        name: user.name,
        userType: user.userType
      }, 
      token
    });
  } catch (err) {
    console.error('verifyOtp error:', err);
    res.status(500).json({ message: 'OTP verification failed' });
  }
};

// Update user profile after email verification
const updateProfile = async (req, res) => {
  try {
    const { name, age, location, userType, languages } = req.body;
    const userId = req.user.id; // From JWT token

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await UserProfile.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user profile
    const updatedUser = await UserProfile.findByIdAndUpdate(
      userId,
      {
        name,
        age: age || user.age,
        location: location || user.location,
        userType: userType || user.userType,
        languages: languages || user.languages
      },
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        age: updatedUser.age,
        location: updatedUser.location,
        userType: updatedUser.userType,
        languages: updatedUser.languages,
        isProfileComplete: true
      }
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_VERIFY);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Verify token endpoint
const verifyTokenEndpoint = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_VERIFY);
    const user = await UserProfile.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        age: user.age,
        location: user.location,
        languages: user.languages
      }
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = {
  checkEmailInUse,
  requestOtp,
  verifyOtp,
  updateProfile,
  verifyToken,
  verifyTokenEndpoint
};
