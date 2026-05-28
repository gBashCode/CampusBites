const Joi = require('joi');

// Password validation schema - strong password requirements
const passwordSchema = Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]/)
    .required()
    .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'string.min': 'Password must be at least 8 characters long'
    });

// Email validation schema
const emailSchema = Joi.string()
    .email()
    .required()
    .messages({
        'string.email': 'Please provide a valid email address'
    });

// Registration validation
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: emailSchema,
    password: passwordSchema
});

// Login validation
const loginSchema = Joi.object({
    email: emailSchema,
    password: Joi.string().required()
});

// Forgot password validation
const forgotPasswordSchema = Joi.object({
    email: emailSchema
});

// Reset password validation
const resetPasswordSchema = Joi.object({
    email: emailSchema,
    otp: Joi.string().length(6).required(),
    newPassword: passwordSchema
});

// Lecturer registration validation
const lecturerRegisterSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: emailSchema,
    password: passwordSchema,
    cabinNumber: Joi.string().required(),
    department: Joi.string(),
    phone: Joi.string().pattern(/^\d{10}$/)
});

// Delivery registration validation
const deliveryRegisterSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: emailSchema,
    password: passwordSchema,
    phone: Joi.string().pattern(/^\d{10}$/)
});

// Validation middleware
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const messages = error.details.map(detail => detail.message);
            return res.status(400).json({ message: 'Validation error', errors: messages });
        }
        req.validated = value;
        next();
    };
};

module.exports = {
    validate,
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    lecturerRegisterSchema,
    deliveryRegisterSchema
};
