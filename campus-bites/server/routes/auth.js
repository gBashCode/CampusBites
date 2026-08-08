const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { query } = require('../db');
const { validateEmail, validatePassword, validateName, validatePhone } = require('../utils/validators');
const { verifyUser } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const SAFE_USER_FIELDS = 'id, name, email, role, cabin_number, department, phone, is_verified, created_at';

function generateToken(user) {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
}

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!validateName(name)) {
      return res.status(400).json({ message: 'Invalid name' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    const result = await query(
      `INSERT INTO users (name, email, password, otp, otp_expires, role)
       VALUES ($1, $2, $3, $4, $5, 'student')
       RETURNING ${SAFE_USER_FIELDS}`,
      [name.trim(), email.toLowerCase(), hashedPassword, otp, otpExpires]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Campus Bites Account',
        html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 15 minutes.</p>`
      });
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email for verification code.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, email, otp } = req.body;
    if (!userId || !email || !otp) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await query(
      `SELECT * FROM users WHERE id = $1 AND email = $2`,
      [userId, email.toLowerCase()]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.is_verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (new Date(user.otp_expires) < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const updated = await query(
      `UPDATE users SET is_verified = true, otp = NULL, otp_expires = NULL
       WHERE id = $1
       RETURNING ${SAFE_USER_FIELDS}`,
      [userId]
    );
    const updatedUser = updated.rows[0];
    const token = generateToken(updatedUser);

    res.json({
      message: 'Email verified successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      },
      token
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await query(
      `SELECT * FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const standardMessage = { message: 'If an account exists with that email, a reset code has been sent.' };

    if (!email) {
      return res.status(400).json(standardMessage);
    }

    const result = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];

    if (!user) {
      return res.json(standardMessage);
    }

    const resetOtp = generateOTP();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await query(
      'UPDATE users SET reset_password_otp = $1, reset_password_expires = $2 WHERE id = $3',
      [resetOtp, resetExpires, user.id]
    );

    try {
      await sendEmail({
        to: email.toLowerCase(),
        subject: 'Campus Bites Password Reset',
        html: `<p>Your password reset code is: <strong>${resetOtp}</strong></p><p>This code expires in 15 minutes.</p>`
      });
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr);
    }

    res.json(standardMessage);
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const result = await query(
      `SELECT id FROM users
       WHERE email = $1 AND reset_password_otp = $2 AND reset_password_expires > NOW()`,
      [email.toLowerCase(), otp]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await query(
      `UPDATE users SET password = $1, reset_password_otp = NULL, reset_password_expires = NULL WHERE id = $2`,
      [hashedPassword, user.id]
    );

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { credential, accessToken } = req.body;
    let googleUser = null;

    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      googleUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        googleId: payload.sub
      };
    } else if (accessToken) {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        return res.status(401).json({ message: 'Invalid Google access token' });
      }
      const data = await response.json();
      googleUser = {
        email: data.email,
        name: data.name,
        picture: data.picture,
        googleId: data.id
      };
    } else {
      return res.status(400).json({ message: 'Credential or access token required' });
    }

    if (!googleUser || !googleUser.email) {
      return res.status(400).json({ message: 'Could not authenticate with Google' });
    }

    const existing = await query(
      `SELECT * FROM users WHERE email = $1`,
      [googleUser.email.toLowerCase()]
    );
    let user = existing.rows[0];
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
      const result = await query(
        `INSERT INTO users (name, email, password, is_verified, avatar, role)
         VALUES ($1, $2, $3, true, $4, 'student')
         RETURNING ${SAFE_USER_FIELDS}`,
        [googleUser.name || 'Google User', googleUser.email.toLowerCase(), randomPassword, googleUser.picture || null]
      );
      user = result.rows[0];
    }

    const token = generateToken(user);

    res.json({
      message: isNewUser ? 'Registration successful via Google' : 'Login successful via Google',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile', verifyUser, async (req, res) => {
  try {
    const result = await query(
      `SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = $1`,
      [req.user.id]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', verifyUser, async (req, res) => {
  try {
    const { name, phone, cabinNumber, department } = req.body;

    if (name !== undefined && !validateName(name)) {
      return res.status(400).json({ message: 'Invalid name' });
    }
    if (phone !== undefined && !validatePhone(phone)) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }
    if (phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(phone.trim());
    }
    if (cabinNumber !== undefined) {
      fields.push(`cabin_number = $${paramIndex++}`);
      values.push(cabinNumber ? cabinNumber.trim() : null);
    }
    if (department !== undefined) {
      fields.push(`department = $${paramIndex++}`);
      values.push(department ? department.trim() : null);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(req.user.id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING ${SAFE_USER_FIELDS}`,
      values
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/change-password', verifyUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ message: 'Invalid new password' });
    }

    const result = await query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/lecturer/register', async (req, res) => {
  try {
    const { name, email, password, cabinNumber, department, phone } = req.body;
    if (!validateName(name)) {
      return res.status(400).json({ message: 'Invalid name' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    if (!cabinNumber) {
      return res.status(400).json({ message: 'Cabin number is required for lecturers' });
    }
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    const result = await query(
      `INSERT INTO users (name, email, password, cabin_number, department, phone, otp, otp_expires, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'lecturer')
       RETURNING ${SAFE_USER_FIELDS}`,
      [name.trim(), email.toLowerCase(), hashedPassword, cabinNumber.trim(), department ? department.trim() : null, phone ? phone.trim() : null, otp, otpExpires]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Campus Bites Lecturer Account',
        html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 15 minutes.</p>`
      });
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
    }

    res.status(201).json({
      message: 'Lecturer registration successful. Please check your email for verification code.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error('Lecturer register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/lecturer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await query(
      `SELECT * FROM users WHERE email = $1 AND role = 'lecturer'`,
      [email.toLowerCase()]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Lecturer login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error('Lecturer login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/delivery/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!validateName(name)) {
      return res.status(400).json({ message: 'Invalid name' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    if (!phone || !validatePhone(phone)) {
      return res.status(400).json({ message: 'Valid phone number is required for delivery personnel' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    const result = await query(
      `INSERT INTO users (name, email, password, phone, otp, otp_expires, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'delivery')
       RETURNING ${SAFE_USER_FIELDS}`,
      [name.trim(), email.toLowerCase(), hashedPassword, phone.trim(), otp, otpExpires]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Campus Bites Delivery Account',
        html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 15 minutes.</p>`
      });
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
    }

    res.status(201).json({
      message: 'Delivery registration successful. Please check your email for verification code.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error('Delivery register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/delivery/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await query(
      `SELECT * FROM users WHERE email = $1 AND role = 'delivery'`,
      [email.toLowerCase()]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Delivery login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error('Delivery login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
