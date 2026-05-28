import React, { useState, useEffect } from 'react'
import { UtensilsCrossed, Mail, Lock, ArrowRight, Sparkles, ChefHat, Eye, EyeOff } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

import API_URL from '../apiConfig';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin/menu');
            else if (user.role === 'staff') navigate('/staff/kitchen');
            else if (user.role === 'lecturer') navigate('/lecturer/menu');
            else navigate('/dashboard/menu');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                login(data.user, data.token);
                if (data.user.role === 'admin') navigate('/admin/menu');
                else if (data.user.role === 'staff') navigate('/staff/kitchen');
                else navigate('/dashboard/menu');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Server connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, otp })
            });
            const data = await res.json();
            if (res.ok) {
                login(data.user, data.token);
                navigate('/dashboard/menu');
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch (err) {
            setError('Server error');
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        flow: 'implicit',
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`${API_URL}/api/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accessToken: tokenResponse.access_token })
                });

                const data = await res.json();

                if (res.ok) {
                    login(data.user, data.token);
                    if (data.user.role === 'admin') navigate('/admin/menu');
                    else if (data.user.role === 'staff') navigate('/staff/kitchen');
                    else navigate('/dashboard/menu');
                } else {
                    setError(data.message || 'Google Login Failed');
                }
            } catch (err) {
                setError('Server connection error during Google Login');
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError('Google Login Failed'),
    });

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0D0D0D',
            position: 'relative',
            overflow: 'hidden',
            color: 'white'
        }}>
            {/* Animated Background */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.05); }
                }
                @keyframes shimmer {
                    0% { background-position: -1000px 0; }
                    100% { background-position: 1000px 0; }
                }
                @keyframes slideIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(50px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                @keyframes slideInStagger {
                    from { 
                        opacity: 0; 
                        transform: translateY(30px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                .floating-emoji {
                    position: absolute;
                    font-size: 3.5rem;
                    opacity: 0.1;
                    pointer-events: none;
                    animation: float 8s ease-in-out infinite;
                }
                .glass-card {
                    background: rgba(26, 26, 28, 0.95);
                    border-radius: 1.5rem;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .input-modern {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 1rem 3rem 1rem 3rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1rem;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
                .input-modern:focus {
                    outline: none;
                    border-color: #E23744;
                    background: rgba(226, 55, 68, 0.05);
                    box-shadow: 0 0 0 3px rgba(226, 55, 68, 0.1);
                }
                .input-modern::placeholder {
                    color: #6B7280;
                }
                .btn-modern {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 1rem;
                    background: linear-gradient(135deg, #E23744 0%, #DC2626 100%);
                    color: white;
                    border: none;
                    border-radius: 1rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 30px rgba(226, 55, 68, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    position: relative;
                    overflow: hidden;
                }
                .btn-modern::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: left 0.5s;
                }
                .btn-modern:hover::before {
                    left: 100%;
                }
                .btn-modern:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 40px rgba(226, 55, 68, 0.4);
                }
                .btn-modern:active:not(:disabled) {
                    transform: translateY(-1px);
                }
                .btn-modern:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .icon-wrapper {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9CA3AF;
                    transition: color 0.3s ease;
                }
                .input-modern:focus ~ .icon-wrapper {
                    color: #E23744;
                }
                .gradient-text {
                    background: linear-gradient(135deg, #E23744 0%, #F59E0B 100%);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .feature-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0.5rem 1rem;
                    background: rgba(226, 55, 68, 0.1);
                    border: 1px solid rgba(226, 55, 68, 0.3);
                    border-radius: 2rem;
                    font-size: 0.85rem;
                    color: #E23744;
                    font-weight: 600;
                }
                .glow-circle {
                    position: absolute;
                    width: 300px;
                    height: 300px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(226, 55, 68, 0.15) 0%, transparent 70%);
                    filter: blur(40px);
                    animation: pulse 4s ease-in-out infinite;
                }
                .animate-item {
                    animation: slideInStagger 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                .delay-1 { animation-delay: 0.1s; }
                .delay-2 { animation-delay: 0.2s; }
                .delay-3 { animation-delay: 0.3s; }
                .delay-4 { animation-delay: 0.4s; }
                .delay-5 { animation-delay: 0.5s; }
                .delay-6 { animation-delay: 0.6s; }
                .delay-7 { animation-delay: 0.7s; }
                .delay-8 { animation-delay: 0.8s; }
            `}</style>

            {/* Glowing Background Circles */}
            <div className="glow-circle" style={{ top: '10%', left: '10%' }} />
            <div className="glow-circle" style={{ bottom: '10%', right: '10%', animationDelay: '2s' }} />

            {/* Floating Food Emojis */}
            <div className="floating-emoji" style={{ top: '15%', left: '8%', animationDelay: '0s' }}>🍔</div>
            <div className="floating-emoji" style={{ top: '25%', right: '12%', animationDelay: '1s' }}>🍕</div>
            <div className="floating-emoji" style={{ bottom: '20%', left: '15%', animationDelay: '2s' }}>🍟</div>
            <div className="floating-emoji" style={{ bottom: '30%', right: '10%', animationDelay: '1.5s' }}>🥤</div>
            <div className="floating-emoji" style={{ top: '50%', left: '5%', animationDelay: '0.5s' }}>🌮</div>

            {/* Main Login Card */}
            <div className="glass-card" style={{
                width: '90%',
                maxWidth: '450px',
                padding: '3rem 2rem',
                zIndex: 10
            }}>
                {/* Logo & Title */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    {/* Animated Logo */}
                    <div className="animate-item delay-1" style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #E23744 0%, #DC2626 100%)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        transform: 'rotate(-5deg)',
                        boxShadow: '0 10px 30px rgba(226, 55, 68, 0.4)',
                        position: 'relative'
                    }}>
                        <UtensilsCrossed color="white" size={40} />
                        <div style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#22C55E',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid #0D0D0D'
                        }}>
                            <Sparkles size={12} color="white" />
                        </div>
                    </div>

                    <h1 className="gradient-text animate-item delay-2" style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        marginBottom: '0.5rem',
                        letterSpacing: '-1px'
                    }}>
                        Campus Bites
                    </h1>
                    <p className="animate-item delay-3" style={{ color: '#9CA3AF', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                        Your favorite canteen, now online
                    </p>

                    {/* Feature Badges */}
                    <div className="animate-item delay-4" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div className="feature-badge">
                            <ChefHat size={14} />
                            Fresh Food
                        </div>
                        <div className="feature-badge">
                            <Sparkles size={14} />
                            Quick Pickup
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        color: '#F87171',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        padding: '1rem',
                        borderRadius: '1rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        animation: 'slideIn 0.3s ease-out'
                    }}>{error}</div>
                )}

                {!showOtp ? (
                    <form onSubmit={handleSubmit}>
                        <div className="animate-item delay-5" style={{ marginBottom: '1.25rem', position: 'relative' }}>
                            <input
                                type="email"
                                className="input-modern"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <div className="icon-wrapper">
                                <Mail size={20} />
                            </div>
                        </div>

                        <div className="animate-item delay-6" style={{ marginBottom: '2rem', position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input-modern"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="icon-wrapper">
                                <Lock size={20} />
                            </div>
                            <div
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    cursor: 'pointer',
                                    color: '#9CA3AF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all 0.3s ease',
                                    zIndex: 10,
                                    userSelect: 'none'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#E23744'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </div>
                        </div>

                        <div className="animate-item delay-7" style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                            <a href="/forgot-password" style={{ color: '#E23744', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500 }}>
                                Forgot Password?
                            </a>
                        </div>

                        <button type="submit" className="btn-modern animate-item delay-8" disabled={loading}>
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        border: '3px solid rgba(255,255,255,0.3)',
                                        borderTop: '3px solid white',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite'
                                    }} />
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <input
                                type="text"
                                className="input-modern"
                                placeholder="6-digit Verification Code"
                                maxLength="6"
                                style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem' }}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-modern" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Sign In'} <ArrowRight size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowOtp(false)}
                            style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                        >
                            Back to Login
                        </button>
                    </form>
                )}

                {/* Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    margin: '2rem 0',
                    color: '#6B7280',
                    fontSize: '0.85rem'
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <span>Or continue with</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                {/* Google Button (Disabled) */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <button
                        onClick={() => googleLogin()}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.85rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontSize: '0.95rem'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        Continue with Google
                    </button>
                </div>

                {/* Register Link */}
                <Link to="/register" style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '1rem',
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(226, 55, 68, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(226, 55, 68, 0.3)';
                        e.currentTarget.style.color = '#E23744';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'white';
                    }}>
                    Create New Account
                </Link>

                {/* Lecturer Portal Button */}
                <div style={{ marginTop: '1rem', position: 'relative' }}>
                    {/* Glow effect */}
                    <div style={{
                        position: 'absolute', inset: -1,
                        background: 'linear-gradient(135deg, #7c3aed, #a78bfa, #7c3aed)',
                        borderRadius: '1rem',
                        filter: 'blur(6px)',
                        opacity: 0.5,
                        animation: 'pulseGlow 2.5s ease-in-out infinite'
                    }} />
                    <Link to="/lecturer" style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(167,139,250,0.15))',
                        border: '1px solid rgba(167,139,250,0.4)',
                        borderRadius: '1rem',
                        color: '#c4b5fd',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(167,139,250,0.25))';
                            e.currentTarget.style.borderColor = 'rgba(167,139,250,0.7)';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(124,58,237,0.35)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(167,139,250,0.15))';
                            e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)';
                            e.currentTarget.style.color = '#c4b5fd';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                        <span style={{ fontSize: '1.2rem' }}>🎓</span>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>Lecturer Portal</div>
                            <div style={{ fontSize: '0.72rem', opacity: 0.7, fontWeight: 400 }}>Faculty cabin delivery ordering</div>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '0.85rem', opacity: 0.7 }}>→</span>
                    </Link>
                </div>

                {/* Footer */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '2rem',
                    color: '#6B7280',
                    fontSize: '0.8rem'
                }}>
                    By continuing, you agree to our Terms &amp; Privacy Policy
                </p>
            </div>

            {/* Spinning Animation for Loading */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes pulseGlow {
                    0%, 100% { opacity: 0.35; }
                    50% { opacity: 0.65; }
                }
            `}</style>
        </div>
    )
}

export default Login
