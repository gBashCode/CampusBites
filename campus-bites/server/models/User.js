const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin', 'staff', 'lecturer', 'delivery'], default: 'student' },
    cabinNumber: { type: String, default: '' },
    department: { type: String, default: '' },
    phone: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    resetPasswordOtp: { type: String },
    resetPasswordExpires: { type: Date }
}, { timestamps: true });

// Hash password before saving (only when password field is new or modified)
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
        next();
    } catch (err) {
        next(err);
    }
});

// Timing-safe password comparison
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
