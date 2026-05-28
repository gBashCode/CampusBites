import React, { useState, useEffect } from 'react'
import { User, Mail, Lock, ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGoogleLogin } from '@react-oauth/google'
import API_URL from '../apiConfig';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Wake up the server as soon as the page loads
    useEffect(() => {
        fetch(`${API_URL}/`).catch(() => { });
    }, []);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin/menu');
            else if (user.role === 'staff') navigate('/staff/kitchen');
            else navigate('/dashboard/menu');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error(text || 'Cloudflare or Server Error');
            }

            if (res.ok) {
                login(data.user);
                navigate('/dashboard/menu');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message === 'Failed to fetch' ? 'Server is offline. Please try again later.' : (err.message || 'Connection error'));
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
                    login(data.user);
                    if (data.user.role === 'admin') navigate('/admin/menu');
                    else if (data.user.role === 'staff') navigate('/staff/kitchen');
                    else navigate('/dashboard/menu');
                } else {
                    setError(data.message || 'Google Signup Failed');
                }
            } catch (err) {
                setError('Server connection error during Google Signup');
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError('Google Signup Failed'),
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
            {/* Styles */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .floating-emoji {
                    position: absolute;
                    font-size: 3.5rem;
                    opacity: 0.15;
                    pointer-events: none;
                    transition: transform 0.3s ease;
                }
                .glass-card {
                    background: rgba(26, 26, 28, 0.95);
                    border-radius: 1.5rem;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .input-modern {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 0.85rem 1rem 0.85rem 3rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.85rem;
                    font-size: 1rem;
                    transition: all 0.2s ease;
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
                .input-modern:focus {
                    outline: none;
                    border-color: #E23744;
                    background: rgba(226, 55, 68, 0.05);
                    box-shadow: 0 0 0 2px rgba(226, 55, 68, 0.2);
                }
                .btn-modern {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 0.85rem;
                    background: linear-gradient(135deg, #E23744 0%, #DC2626 100%);
                    color: white;
                    border: none;
                    border-radius: 0.85rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 8px 25px rgba(226, 55, 68, 0.25);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .btn-modern:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px rgba(226, 55, 68, 0.35);
                }
                .btn-modern:active:not(:disabled) {
                    transform: translateY(0);
                }
                .btn-modern:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .icon-wrapper {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9CA3AF;
                    pointer-events: none;
                }
                .input-modern:focus + .icon-wrapper, .input-modern:focus ~ .icon-wrapper {
                    color: #E23744;
                }
                .back-link {
                    display: inline-flex;
                    align-items: center;
                    color: #9CA3AF;
                    text-decoration: none;
                    font-weight: 500;
                    margin-bottom: 1.5rem;
                    transition: all 0.2s ease;
                    font-size: 0.9rem;
                }
                .back-link:hover {
                    color: white;
                    transform: translateX(-4px);
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
            `}</style>

            <div className="floating-emoji" style={{ top: '15%', left: '8%', animation: 'float 6s ease-in-out infinite' }}>🌮</div>
            <div className="floating-emoji" style={{ bottom: '20%', right: '12%', animation: 'float 7s ease-in-out infinite' }}>🍟</div>

            {/* Main Register Card */}
            <div className="glass-card" style={{
                width: '90%',
                maxWidth: '450px',
                padding: '3rem 2rem',
                zIndex: 10
            }}>
                <Link to="/" className="back-link">
                    <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} />
                    Back to Login
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        letterSpacing: '-1px'
                    }}>Join Campus Bites</h1>
                    <p style={{ color: '#9CA3AF', fontSize: '0.95rem' }}>Create your account to get started</p>
                </div>

                {error && (
                    <div style={{
                        color: '#F87171',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        padding: '1rem',
                        borderRadius: '1rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
                        <div className="icon-wrapper">
                            <User size={20} />
                        </div>
                        <input
                            type="text"
                            className="input-modern"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
                        <div className="icon-wrapper">
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            className="input-modern"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '2rem', position: 'relative' }}>
                        <div className="icon-wrapper">
                            <Lock size={20} />
                        </div>
                        <input
                            type="password"
                            className="input-modern"
                            placeholder="Create Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-modern" disabled={loading}>
                        {loading ? (
                            <>
                                <div className="spinner" style={{ marginRight: '10px' }}></div>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                Create Account <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

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
                    <span>Or signup with</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                {/* Google Button (Disabled) */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
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

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                        Already have an account?{' '}
                        <Link to="/" style={{
                            color: '#E23744',
                            fontWeight: 600,
                            textDecoration: 'none',
                        }}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register
