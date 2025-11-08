const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// OAuth2 configuration
const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
);

// Set credentials
oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

// Create transporter
let transporter;

async function createTransporter() {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    
    transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER, // Your Gmail address
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    console.log('✅ Gmail transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Error creating Gmail transporter:', error);
    throw error;
  }
}

// Send email function
async function sendEmail({ to, subject, html, text }) {
  try {
    if (!transporter) {
      await createTransporter();
    }

    const mailOptions = {
      from: `MayaCode <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    };

    console.log(`📧 Sending email to: ${to}`);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send email'
    };
  }
}

// Send OTP email
async function sendOTPEmail(email, otp) {
  const subject = 'MayaCode - Your OTP Code';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2C3E50;">MayaCode OTP Verification</h2>
      <p>Hello!</p>
      <p>Your OTP code for MayaCode is:</p>
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #007AFF; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">MayaCode - Building Stronger Communities</p>
    </div>
  `;
  
  const text = `MayaCode OTP Verification\n\nYour OTP code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nMayaCode - Building Stronger Communities`;

  return await sendEmail({
    to: email,
    subject,
    html,
    text
  });
}

module.exports = {
  sendEmail,
  sendOTPEmail,
  createTransporter
};

