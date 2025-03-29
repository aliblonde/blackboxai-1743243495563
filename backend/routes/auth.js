const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP via SMS
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Validate phone number format
    if (!/^\+?\d{10,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // In production, you would send the OTP via Twilio:
    // await twilioClient.messages.create({
    //   body: `Your OTP is: ${otp}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone
    // });

    // For development, just log the OTP
    console.log(`OTP for ${phone}: ${otp}`);

    // Store OTP in user record (in production, use a proper OTP service)
    const [user] = await User.upsert({
      phone,
      otp,
      otpExpiry,
      pin: null // Reset PIN if this is a new registration
    }, { returning: true });

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP and login/register
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, pin } = req.body;

    // Find user by phone
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check OTP validity
    if (user.otp !== otp || new Date() > user.otpExpiry) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // If this is registration, hash and store the PIN
    if (pin && !user.pin) {
      const hashedPin = await bcrypt.hash(pin, 10);
      user.pin = hashedPin;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
      success: true, 
      token,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

module.exports = router;