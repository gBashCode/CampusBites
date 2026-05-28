const bcrypt = require('bcrypt');

// Hash password with bcrypt
const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (err) {
        throw new Error('Error hashing password');
    }
};

// Compare password with hash
const comparePassword = async (password, hash) => {
    try {
        return await bcrypt.compare(password, hash);
    } catch (err) {
        throw new Error('Error comparing passwords');
    }
};

module.exports = {
    hashPassword,
    comparePassword
};
