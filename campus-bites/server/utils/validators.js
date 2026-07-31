/**
 * Input validation helpers for auth routes.
 * Lightweight — no external dependencies.
 */

const validateEmail = (email) => {
    if (typeof email !== 'string') return false;
    const trimmed = email.trim();
    if (trimmed.length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

const validatePassword = (password) => {
    if (typeof password !== 'string') return false;
    if (password.length < 8 || password.length > 128) return false;
    // Require at least 1 uppercase, 1 lowercase, and 1 digit
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    return hasUppercase && hasLowercase && hasDigit;
};

const validateName = (name) => {
    if (typeof name !== 'string') return false;
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 100;
};

const validatePhone = (phone) => {
    if (!phone || typeof phone !== 'string') return true; // optional
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
};

const validateObjectId = (id) => {
    if (typeof id !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = { validateEmail, validatePassword, validateName, validatePhone, validateObjectId };
