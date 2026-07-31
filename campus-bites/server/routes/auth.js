const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { validateEmail, validatePassword, validateName, validatePhone } = require('../utils/validators');
const { verifyUser } = require('../middleware/auth');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Safe user fields for responses
const SAFE_USER_FIELDS = 'id name email role cabinNumber department phone';

// ─── Register ───────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!validateName(name)) {
            return res.status(400).json({ message: 'Name must be 2-100 characters' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ message: 'Password must be 8-128 characters with at least 1 uppercase, 1 lowercase, and 1 number' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password,
            isVerified: true,
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
        console.error('Register error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Verify OTP ─────────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
    try {
        const { userId, email, otp } = req.body;

        if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({ message: 'Invalid OTP format' });
        }

        let user;
        if (userId) {
            user = await User.findById(userId).select('+otp +otpExpires');
        } else if (email) {
            user = await User.findOne({ email: email.toLowerCase().trim() }).select('+otp +otpExpires');
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        if (!user.otpExpires || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
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
        console.error('Verify OTP error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Login ──────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Password is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Forgot Password ────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).select('+resetPasswordOtp +resetPasswordExpires');

        // Always return success to prevent user enumeration
        if (!user) {
            return res.json({ message: 'If an account exists, a reset code has been sent' });
        }

        // Generate cryptographically secure OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        const message = `Your password reset code is: ${otp}`;
        await sendEmail(normalizedEmail, 'Reset Password - Campus Bites', message, `<h1>Your Reset Code is ${otp}</h1>`);

        res.json({ message: 'If an account exists, a reset code has been sent' });
    } catch (err) {
        console.error('Forgot password error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Reset Password ─────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({ message: 'Invalid OTP format' });
        }
        if (!validatePassword(newPassword)) {
            return res.status(400).json({ message: 'Password must be 8-128 characters with at least 1 uppercase, 1 lowercase, and 1 number' });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordOtp +resetPasswordExpires');

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.password = newPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.error('Reset password error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Google Login ───────────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
    try {
        const { credential, accessToken } = req.body;
        let email, name;

        if (credential) {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
        } else if (accessToken) {
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

        const normalizedEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            user = new User({
                name,
                email: normalizedEmail,
                password: crypto.randomBytes(32).toString('hex'),
                isVerified: true,
                role: 'student'
            });
            await user.save();
        } else if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Google login successful',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (err) {
        console.error('Google Auth Error:', err.message);
        res.status(500).json({ message: 'Google authentication failed' });
    }
});

// ─── Get Profile ────────────────────────────────────────────────────────────
router.get('/profile', verifyUser, async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (err) {
        console.error('Profile error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Update Profile ─────────────────────────────────────────────────────────
router.put('/profile', verifyUser, async (req, res) => {
    try {
        const { name, phone, cabinNumber, department } = req.body;
        const updates = {};

        if (name !== undefined) {
            if (!validateName(name)) {
                return res.status(400).json({ message: 'Name must be 2-100 characters' });
            }
            updates.name = name.trim();
        }
        if (phone !== undefined) {
            if (phone && !validatePhone(phone)) {
                return res.status(400).json({ message: 'Invalid phone number format' });
            }
            updates.phone = (phone || '').trim();
        }
        if (cabinNumber !== undefined) updates.cabinNumber = String(cabinNumber || '').trim();
        if (department !== undefined) updates.department = String(department || '').trim();

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

        res.json({ message: 'Profile updated', user });
    } catch (err) {
        console.error('Update profile error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Change Password ────────────────────────────────────────────────────────
router.post('/change-password', verifyUser, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || typeof currentPassword !== 'string') {
            return res.status(400).json({ message: 'Current password is required' });
        }
        if (!validatePassword(newPassword)) {
            return res.status(400).json({ message: 'New password must be 8-128 characters with at least 1 uppercase, 1 lowercase, and 1 number' });
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Change password error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Lecturer Register ─────────────────────────────────────────────────────
router.post('/lecturer/register', async (req, res) => {
    try {
        const { name, email, password, cabinNumber, department, phone } = req.body;

        if (!validateName(name)) {
            return res.status(400).json({ message: 'Name must be 2-100 characters' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ message: 'Password must be 8-128 characters with at least 1 uppercase, 1 lowercase, and 1 number' });
        }
        if (!cabinNumber || typeof cabinNumber !== 'string' || !cabinNumber.trim()) {
            return res.status(400).json({ message: 'Cabin number is required for lecturer registration' });
        }
        if (phone && !validatePhone(phone)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: 'lecturer',
            cabinNumber: cabinNumber.trim(),
            department: (department || '').trim(),
            phone: (phone || '').trim(),
            isVerified: true
        });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'Lecturer account created successfully',
            user: { id: user._id, name: user.name, email: user.email, role: user.role, cabinNumber: user.cabinNumber, department: user.department, phone: user.phone },
            token
        });
    } catch (err) {
        console.error('Lecturer register error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Lecturer Login ─────────────────────────────────────────────────────────
router.post('/lecturer/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Password is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim(), role: 'lecturer' }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

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
        console.error('Lecturer login error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Delivery Register ─────────────────────────────────────────────────────
router.post('/delivery/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!validateName(name)) {
            return res.status(400).json({ message: 'Name must be 2-100 characters' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ message: 'Password must be 8-128 characters with at least 1 uppercase, 1 lowercase, and 1 number' });
        }
        if (phone && !validatePhone(phone)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password,
            phone: (phone || '').trim(),
            role: 'delivery',
            isVerified: true
        });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'Delivery account created',
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
            token
        });
    } catch (err) {
        console.error('Delivery register error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Delivery Login ────────────────────────────────────────────────────────
router.post('/delivery/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Password is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim(), role: 'delivery' }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
            token
        });
    } catch (err) {
        console.error('Delivery login error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
