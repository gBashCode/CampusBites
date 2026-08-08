import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, Mail, Lock, ArrowRight, User, Phone } from 'lucide-react';
import API_URL from '../../apiConfig';
import { PrimaryButton, Divider, ErrorDisplay } from '../../components/ui';

const DeliveryLogin = () => {
    const [mode, setMode] = useState('login');
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        phone: '' 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => { setFormData(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const endpoint = mode === 'login' ? `${API_URL}/api/auth/delivery/login` : `${API_URL}/api/auth/delivery/register`;
            const body = mode === 'login' ? { email: formData.email, password: formData.password } : formData;
            const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();
            if (res.ok) { login(data.user, data.token); navigate('/delivery/orders'); }
            else setError(data.message || 'Authentication failed');
        } catch { setError('Server connection error. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden', color: 'white' }}>
            <div className="del-glow" style={{ top: '10%', left: '10%' }} />
            <div className="del-glow" style={{ bottom: '10%', right: '10%', animationDelay: '2s' }} />
            <div className="del-float" style={{ top: '15%', left: '8%' }}>🚴</div>
            <div className="del-float" style={{ top: '25%', right: '12%', animationDelay: '1s' }}>📦</div>
            <div className="del-float" style={{ bottom: '20%', left: '15%', animationDelay: '2s' }}>🛵</div>
            <div className="del-float" style={{ bottom: '30%', right: '10%', animationDelay: '1.5s' }}>🗺️</div>
            <div className="del-float" style={{ top: '50%', left: '5%', animationDelay: '0.5s' }}>📍</div>

            <div className="del-glass" style={{ width: '90%', maxWidth: '440px', padding: '3rem 2rem', zIndex: 10 }}>
                {/* Logo */}
                <div className="ai d1" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,var(--warning),#D97706)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', transform: 'rotate(-5deg)', boxShadow: '0 10px 30px rgba(245,158,11,0.4)', position: 'relative' }}>
                        <span style={{ fontSize: 36 }}>🚴</span>
                        <div style={{ position: 'absolute', top: -8, right: -8, background: 'var(--primary)', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '2px solid var(--bg-deep)' }}>📦</div>
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg,var(--warning),#FDE68A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 4 }}>Campus Bites</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Delivery Boy Portal</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '0.4rem 0.9rem', background: 'var(--warning-surface)', border: '1px solid var(--warning-border)', borderRadius: '2rem', fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600 }}>
                        🚴 Delivery Access
                    </div>
                </div>

                {/* Tabs */}
                <div className="ai d2" style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                    {['login', 'register'].map(m => (
                        <button key={m} onClick={() => { setMode(m); setError(''); }} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: mode === m ? 'var(--warning)' : 'var(--text-muted)', borderBottom: mode === m ? '2px solid var(--warning)' : '2px solid transparent', transition: 'all 0.3s', marginBottom: -1 }}>
                            {m === 'login' ? 'Sign In' : 'Register'}
                        </button>
                    ))}
                </div>

                {error && <ErrorDisplay className="ai">{error}</ErrorDisplay>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {mode === 'register' && (
                            <div className="ai d2" style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><User size={18} /></span>
                                <input className="input-field" name="name" placeholder="Full Name" aria-label="Full Name" value={formData.name} onChange={handleChange} required />
                            </div>
                        )}
                        <div className="ai d2" style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Mail size={18} /></span>
                            <input className="input-field" name="email" type="email" placeholder="Email Address" aria-label="Email Address" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="ai d3" style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Lock size={18} /></span>
                            <input className="input-field" name="password" type="password" placeholder="Password" aria-label="Password" value={formData.password} onChange={handleChange} required />
                        </div>
                        {mode === 'register' && (
                            <div className="ai d4" style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Phone size={18} /></span>
                                <input className="input-field" name="phone" type="tel" placeholder="Phone Number" aria-label="Phone Number" value={formData.phone} onChange={handleChange} />
                            </div>
                        )}
                        {mode === 'login' && (
                            <div className="ai d4" style={{ background: 'var(--warning-surface)', border: '1px solid var(--warning-border)', borderRadius: '0.75rem', padding: '0.7rem 1rem', fontSize: '0.8rem', color: '#FDE68A', marginBottom: '0.5rem' }}>
                                Use your registered delivery account credentials
                            </div>
                        )}
                        <PrimaryButton className="ai d4" type="submit" disabled={loading} loading={loading}>
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                        </PrimaryButton>
                    </div>
                </form>

                <Divider />

                <Link to="/" style={{ display: 'block', textAlign: 'center', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '1rem', color: 'white', textDecoration: 'none', fontWeight: 600, transition: 'all 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--warning-surface)'; e.currentTarget.style.borderColor = 'var(--warning-border)'; e.currentTarget.style.color = 'var(--warning)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'white'; }}>
                    ← Back to Student Login
                </Link>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    View and complete all active delivery orders 🚴
                </p>
            </div>
        </div>
    );
};

export default DeliveryLogin;
