const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const UserProfile = require('../models/User');
const { Resend } = require('resend');

const OTP_EXPIRY_MINUTES = 10;

// Configure Resend (works on Render free tier - 3,000 emails/month free)
let resend;
if (process.env.RESEND_EMAIL_API) {
  resend = new Resend(process.env.RESEND_EMAIL_API);
  console.log('✅ Resend configured successfully');
} else {
  console.warn('⚠️ RESEND_EMAIL_API not set. Email functionality will not work.');
}

// Fallback nodemailer configuration (for development)
const createTransporter = () => {
  try {
    // Only use nodemailer if Resend is not available
    if (process.env.SMTP_USER && process.env.SMTP_PASS && !process.env.RESEND_EMAIL_API) {
      return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        tls: {
          rejectUnauthorized: false
        }
      });
    }
    
    return null;
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
  try {
    const { email } = req.body;

    // Basic email validation
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await Otp.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Send OTP via email using Resend (preferred) or fallback
    try {
      if (resend) {
        // Use Resend (works on Render free tier - 3,000 emails/month free)
        const { data, error } = await resend.emails.send({
          from: 'onboarding@resend.dev', // You can change this to your domain
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

        if (error) {
          console.error('Resend error:', error);
          throw error;
        }

        console.log('✅ Email sent via Resend:', data);
        
        res.json({
          success: true,
          message: "OTP sent to your email successfully"
        });
      } else if (transporter) {
        // Fallback to nodemailer (for development)
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

        res.json({
          success: true,
          message: "OTP sent to your email successfully"
        });
      } else {
        // No email service configured - fallback to console
        console.log('🚨 NO EMAIL SERVICE CONFIGURED - FALLBACK MODE');
        console.log('📧 Email:', email);
        console.log('🔑 OTP:', otp);
        console.log('⏰ Expires at:', expiresAt);
        console.log('💡 Use this OTP to login (for development only)');
        
        res.json({
          success: true,
          message: "OTP generated successfully (check server logs for OTP - email service not configured)",
          fallback: true,
          otp: otp
        });
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // FALLBACK: Log OTP to console for development
      console.log('🚨 EMAIL SERVICE UNAVAILABLE - FALLBACK MODE');
      console.log('📧 Email:', email);
      console.log('🔑 OTP:', otp);
      console.log('⏰ Expires at:', expiresAt);
      console.log('💡 Use this OTP to login (for development only)');
      
      res.json({
        success: true,
        message: "OTP generated successfully (check server logs for OTP - email service unavailable)",
        fallback: true,
        otp: otp
      });
    }
  } catch (error) {
    console.error('Request OTP Error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    // Find OTP in database
    const otpRecord = await Otp.findOne({ email: email.toLowerCase() });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this email"
      });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ email: email.toLowerCase() });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // Delete OTP after successful verification
    await Otp.deleteOne({ email: email.toLowerCase() });

    // Check if user exists, if not create one
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
          success: false,
          message: "Account creation failed. Please contact support."
        });
      }
    }
    
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET_VERIFY,
      { expiresIn: '7d' }
    );
    
    return res.json({
      success: true,
      message: "Email verified successfully",
      token: token,
      user: { 
        email: user.email, 
        id: user._id,
        name: user.name,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
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
