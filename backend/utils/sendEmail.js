const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const { to, subject, text, html } = options;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email not configured (EMAIL_USER/EMAIL_PASS missing) — skipping send');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 8000,
        socketTimeout: 8000
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
    });
};

module.exports = sendEmail;
