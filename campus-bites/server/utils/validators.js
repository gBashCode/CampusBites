const validateEmail = (email) => {
    if (typeof email !== 'string') return false;
    const trimmed = email.trim();
    if (trimmed.length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

const validatePassword = (password) => {
    if (typeof password !== 'string') return false;
    if (password.length < 8 || password.length > 128) return false;
    return /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
};

const validateName = (name) => {
    if (typeof name !== 'string') return false;
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 100;
};

const validatePhone = (phone) => {
    if (!phone || typeof phone !== 'string') return true;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
};

const validateUUID = (id) => {
    if (typeof id !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

const validateObjectId = validateUUID;

module.exports = { validateEmail, validatePassword, validateName, validatePhone, validateUUID, validateObjectId };
