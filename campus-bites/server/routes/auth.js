const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { validateEmail, validatePassword, validateName } = require('../utils/validators');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Input validation
        if (!validateName(name)) {
            return res.status(400).json({ message: 'Name must be at least 2 characters' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user (password is hashed automatically by pre-save hook)
        const user = new User({
            name,
            email,
            password,
            isVerified: true, // Direct verification
            role: 'student'
        });
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'Registration successful',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token,
            requiresVerification: false
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { userId, email, otp } = req.body;

        let user;
        if (userId) {
            user = await User.findById(userId);
        } else if (email) {
            user = await User.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Email verified successfully',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Secure password comparison via bcrypt
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        const message = `Your password reset code is: ${otp}`;
        await sendEmail(email, 'Reset Password - Campus Bites', message, `<h1>Your Reset Code is ${otp}</h1>`);

        res.json({ message: 'Reset code sent to email' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!validatePassword(newPassword)) {
            return res.status(400).json({ message: 'New password must be at least 8 characters' });
        }

        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Password is hashed automatically by pre-save hook
        user.password = newPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Google Login
router.post('/google', async (req, res) => {
    try {
        const { credential, accessToken } = req.body;
        let email, name;

        if (credential) {
            // ID Token (Standard Google Button)
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
        } else if (accessToken) {
            // Access Token (Custom Button via useGoogleLogin)
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!response.ok) {
                return res.status(400).json({ message: 'Invalid Google Token' });
            }

            const userInfo = await response.json();
            email = userInfo.email;
            name = userInfo.name;
        } else {
            return res.status(400).json({ message: 'No credential provided' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            // Create new Google user (random password is hashed by pre-save hook)
            user = new User({
                name,
                email,
                password: crypto.randomBytes(32).toString('hex'),
                isVerified: true, // Google users are verified
                role: 'student'
            });
            await user.save();
        } else {
            // Ensure they are verified if they previously registered with email but same email
            if (!user.isVerified) {
                user.isVerified = true;
                await user.save();
            }
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Google login successful',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token
        });

    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ message: 'Google authentication failed' });
    }
});

// Lecturer Register
router.post('/lecturer/register', async (req, res) => {
    try {
        const { name, email, password, cabinNumber, department, phone } = req.body;

        // Input validation
        if (!validateName(name)) {
            return res.status(400).json({ message: 'Name must be at least 2 characters' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }
        if (!cabinNumber) {
            return res.status(400).json({ message: 'Cabin number is required for lecturer registration' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Password is hashed automatically by pre-save hook
        const user = new User({
            name, email, password, role: 'lecturer',
            cabinNumber, department: department || '',
            phone: phone || '', isVerified: true
        });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'Lecturer account created successfully',
            user: { id: user._id, name: user.name, email: user.email, role: user.role, cabinNumber: user.cabinNumber, department: user.department, phone: user.phone },
            token
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Lecturer Login
router.post('/lecturer/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Password is required' });
        }

        const user = await User.findOne({ email, role: 'lecturer' });
        if (!user) {
            return res.status(400).json({ message: 'No lecturer account found with this email' });
        }

        // Secure password comparison via bcrypt
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Lecturer login successful',
            user: { id: user._id, name: user.name, email: user.email, role: user.role, cabinNumber: user.cabinNumber, department: user.department, phone: user.phone },
            token
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── Delivery Boy Register ───────────────────────────────────────────────────
router.post('/delivery/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Input validation
        if (!validateName(name)) {
            return res.status(400).json({ message: 'Name must be at least 2 characters' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already registered' });

        // Password is hashed automatically by pre-save hook
        const user = new User({ name, email, password, phone: phone || '', role: 'delivery', isVerified: true });
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ message: 'Delivery account created', user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }, token });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── Delivery Boy Login ──────────────────────────────────────────────────────
router.post('/delivery/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Password is required' });
        }

        const user = await User.findOne({ email, role: 'delivery' });
        if (!user) return res.status(400).json({ message: 'No delivery account found with this email' });

        // Secure password comparison via bcrypt
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }, token });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
