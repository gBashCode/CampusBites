const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Safe fields to include from user document (never expose password, OTPs, etc.)
const SAFE_USER_FIELDS = '_id name email role cabinNumber department phone isVerified createdAt';

// JWT Authentication Middleware
const verifyUser = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not configured');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const user = await User.findById(decoded.id).select(SAFE_USER_FIELDS);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { verifyUser, checkRole };
