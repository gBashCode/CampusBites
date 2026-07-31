import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../apiConfig';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);

    const navigate = useNavigate();

    // Countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            setStep(2);
            setMessage('If an account exists, a reset code has been sent.');
            setCountdown(60);
        } catch {
            setError('Server connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = useCallback(async () => {
        if (countdown > 0) return;
        setLoading(true);
        try {
            await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            setMessage('Reset code resent.');
            setCountdown(60);
        } catch {
            setError('Failed to resend code');
        } finally {
            setLoading(false);
        }
    }, [email, countdown]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('Password reset successful! Redirecting to login...');
                setTimeout(() => navigate('/'), 2000);
            } else {
                setError(data.message || 'Reset failed');
            }
        } catch {
            setError('Server connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0D0D', color: 'white' }}>
            <style>{`
                @media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }
            `}</style>
            <div style={{ width: '90%', maxWidth: '450px', padding: '3rem 2rem', background: 'rgba(28, 28, 30, 0.6)', backdropFilter: 'blur(20px)', borderRadius: '2rem', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', color: '#9CA3AF', marginBottom: '2rem', textDecoration: 'none' }}>
                    <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back
                </Link>

                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                </h1>
                <p style={{ color: '#9CA3AF', marginBottom: '2rem' }}>
                    {step === 1 ? 'Enter your email to receive a reset code.' : 'Enter the code and your new password.'}
                </p>

                {error && <div role="alert" style={{ color: '#F87171', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}
                {message && <div role="status" style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>{message}</div>}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp}>
                        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                            <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white', fontSize: '1rem' }} />
                        </div>
                        <button type="submit" disabled={loading} style={{ width: '100%', boxSizing: 'border-box', padding: '1rem', background: '#E23744', color: 'white', border: 'none', borderRadius: '1rem', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Sending...' : 'Send Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div style={{ marginBottom: '1rem' }}>
                            <input type="text" placeholder="Enter 6-digit Code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} inputMode="numeric" pattern="[0-9]*" required style={{ width: '100%', boxSizing: 'border-box', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white', fontSize: '1rem', textAlign: 'center', letterSpacing: '2px' }} />
                        </div>
                        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input type="password" placeholder="New Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} style={{ width: '100%', boxSizing: 'border-box', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white', fontSize: '1rem' }} />
                        </div>
                        <button type="submit" disabled={loading} style={{ width: '100%', boxSizing: 'border-box', padding: '1rem', background: '#E23744', color: 'white', border: 'none', borderRadius: '1rem', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Updating...' : 'Set New Password'}
                        </button>
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button type="button" onClick={handleResendOtp} disabled={countdown > 0} style={{ background: 'none', border: 'none', color: countdown > 0 ? '#6B7280' : '#E23744', cursor: countdown > 0 ? 'default' : 'pointer', fontSize: '0.9rem', padding: '0.5rem' }}>
                                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
