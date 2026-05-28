/**
 * Input validation helpers for auth routes.
 * Lightweight — no external dependencies.
 */

const validateEmail = (email) => {
    if (typeof email !== 'string') return false;
    // Standard email regex — covers the vast majority of valid addresses
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

const validatePassword = (password) => {
    if (typeof password !== 'string') return false;
    return password.length >= 8;
};

const validateName = (name) => {
    if (typeof name !== 'string') return false;
    return name.trim().length >= 2;
};

module.exports = { validateEmail, validatePassword, validateName };
