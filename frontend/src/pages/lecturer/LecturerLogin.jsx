import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, Mail, Lock, ArrowRight, User, Hash, BookOpen, Phone } from 'lucide-react';
import API_URL from '../../apiConfig';
import { PrimaryButton, Divider, ErrorDisplay } from '../../components/ui';

const LecturerLogin = () => {
    const [mode, setMode] = useState('login');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', cabinNumber: '', department: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'Physics', 'Chemistry', 'Management', 'Other'];

    const handleChange = (e) => { setFormData(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const endpoint = mode === 'login' ? `${API_URL}/api/auth/lecturer/login` : `${API_URL}/api/auth/lecturer/register`;
            const body = mode === 'login' ? { email: formData.email, password: formData.password } : formData;
            const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();
            if (res.ok) { login(data.user, data.token); navigate('/dashboard/menu'); }
            else setError(data.message || 'Authentication failed');
        } catch { setError('Server connection error. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden', color: 'white' }}>
            {/* Background */}
            <div className="lec-glow" style={{ top: '10%', left: '10%' }} />
            <div className="lec-glow" style={{ bottom: '10%', right: '10%', animationDelay: '2s' }} />
            <div className="lec-floating" style={{ top: '15%', left: '8%' }}>🎓</div>
            <div className="lec-floating" style={{ top: '25%', right: '12%', animationDelay: '1s' }}>📚</div>
            <div className="lec-floating" style={{ bottom: '20%', left: '15%', animationDelay: '2s' }}>🍽️</div>
            <div className="lec-floating" style={{ bottom: '30%', right: '10%', animationDelay: '1.5s' }}>☕</div>
            <div className="lec-floating" style={{ top: '50%', left: '5%', animationDelay: '0.5s' }}>🏫</div>

            <div className="lec-glass" style={{ width: '90%', maxWidth: '450px', padding: '3rem 2rem', zIndex: 10 }}>
                {/* Logo */}
                <div className="animate-item delay-1" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', transform: 'rotate(-5deg)', boxShadow: '0 10px 30px var(--primary-glow)', position: 'relative' }}>
                        <UtensilsCrossed color="white" size={40} />
                        <div style={{ position: 'absolute', top: -8, right: -8, background: 'var(--purple)', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '2px solid var(--bg-deep)' }}>🎓</div>
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg,var(--primary),var(--warning))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 4 }}>Campus Bites</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Faculty Cabin Delivery Portal</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }}>
                        <span className="badge badge-purple">
                            🎓 Lecturer Access
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="animate-item delay-2" style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                    {['login', 'register'].map(m => (
                        <button key={m} onClick={() => { setMode(m); setError(''); }} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: mode === m ? 'var(--primary)' : 'var(--text-muted)', borderBottom: mode === m ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.3s', marginBottom: -1 }}>
                            {m === 'login' ? 'Sign In' : 'Register'}
                        </button>
                    ))}
                </div>

                {error && (
                    <ErrorDisplay className="animate-item">{error}</ErrorDisplay>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {mode === 'register' && (
                            <div className="animate-item delay-2" style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><User size={18} /></span>
                                <input className="input-field" name="name" placeholder="Full Name" aria-label="Full Name" value={formData.name} onChange={handleChange} required />
                            </div>
                        )}

                        <div className="animate-item delay-2" style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Mail size={18} /></span>
                            <input className="input-field" name="email" type="email" placeholder="Institutional Email" aria-label="Institutional Email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="animate-item delay-3" style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Lock size={18} /></span>
                            <input className="input-field" name="password" type="password" placeholder="Password" aria-label="Password" value={formData.password} onChange={handleChange} required />
                        </div>

                        {mode === 'register' && (
                            <>
                                <div className="animate-item delay-4" style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Hash size={18} /></span>
                                    <input className="input-field" name="cabinNumber" placeholder="Cabin Number (e.g. C-204)" aria-label="Cabin Number" value={formData.cabinNumber} onChange={handleChange} required />
                                </div>
                                <div className="animate-item delay-5" style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Phone size={18} /></span>
                                    <input className="input-field" name="phone" type="tel" placeholder="Phone Number (optional)" aria-label="Phone Number" value={formData.phone} onChange={handleChange} />
                                </div>
                                <div className="animate-item delay-5" style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><BookOpen size={18} /></span>
                                    <select className="input-field" name="department" aria-label="Department" value={formData.department} onChange={handleChange}>
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </>
                        )}

                        <PrimaryButton className="animate-item delay-4" type="submit" disabled={loading} loading={loading}>
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                        </PrimaryButton>
                    </div>
                </form>

                {/* Divider */}
                <Divider />

                <Link to="/" style={{ display: 'block', textAlign: 'center', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '1rem', color: 'white', textDecoration: 'none', fontWeight: 600, transition: 'all 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-surface)'; e.currentTarget.style.borderColor = 'var(--primary-border)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'white'; }}>
                    ← Back to Student Login
                </Link>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Orders are delivered directly to your registered cabin 🚪
                </p>
            </div>
        </div>
    );
};

export default LecturerLogin;
