const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 8, max: 128 }).matches(/[A-Z]/).matches(/[a-z]/).matches(/[0-9]/)
    .withMessage('Password must be 8-128 chars with uppercase, lowercase, and number'),
];

const loginRules = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const otpRules = [
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
];

const forgotPasswordRules = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Invalid email'),
];

const resetPasswordRules = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8, max: 128 }).matches(/[A-Z]/).matches(/[a-z]/).matches(/[0-9]/)
    .withMessage('Password must be 8-128 chars with uppercase, lowercase, and number'),
];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  otpRules,
  forgotPasswordRules,
  resetPasswordRules,
};
