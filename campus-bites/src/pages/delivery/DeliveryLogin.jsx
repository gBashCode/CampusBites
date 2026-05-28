import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, Mail, Lock, ArrowRight, User, Phone } from 'lucide-react';
import API_URL from '../../apiConfig';

const DeliveryLogin = () => {
    const [mode, setMode] = useState('login');
    const [formData, setFormData] = useState({ 
        name: '', 
        email: 'delivery@bites.com', 
        password: 'delivery123', 
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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0D0D', position: 'relative', overflow: 'hidden', color: 'white' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(5deg)} }
                @keyframes pulse { 0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.5;transform:scale(1.05)} }
                @keyframes slideIn { from{opacity:0;transform:translateY(50px)}to{opacity:1;transform:translateY(0)} }
                @keyframes stagger { from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)} }
                @keyframes spin { to{transform:rotate(360deg)} }
                .del-float { position:absolute;font-size:3.5rem;opacity:0.1;pointer-events:none;animation:float 8s ease-in-out infinite; }
                .del-glow { position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(245,158,11,0.15) 0%,transparent 70%);filter:blur(40px);animation:pulse 4s ease-in-out infinite; }
                .del-glass { background:rgba(26,26,28,0.95);border-radius:1.5rem;box-shadow:0 20px 50px rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.08);animation:slideIn 0.8s cubic-bezier(0.16,1,0.3,1); }
                .del-input { width:100%;box-sizing:border-box;padding:1rem 1rem 1rem 3rem;border:1px solid rgba(255,255,255,0.1);border-radius:1rem;font-size:1rem;transition:all 0.3s ease;background:rgba(255,255,255,0.05);color:white;font-family:'Inter',sans-serif;outline:none; }
                .del-input:focus { border-color:#F59E0B;background:rgba(245,158,11,0.05);box-shadow:0 0 0 3px rgba(245,158,11,0.1); }
                .del-input::placeholder { color:#6B7280; }
                .del-btn { width:100%;padding:1rem;background:linear-gradient(135deg,#F59E0B,#D97706);color:white;border:none;border-radius:1rem;font-size:1.1rem;font-weight:600;cursor:pointer;transition:all 0.3s ease;box-shadow:0 10px 30px rgba(245,158,11,0.3);display:flex;align-items:center;justify-content:center;gap:8px;font-family:'Inter',sans-serif; }
                .del-btn:hover:not(:disabled) { transform:translateY(-3px);box-shadow:0 15px 40px rgba(245,158,11,0.4); }
                .del-btn:disabled { opacity:0.7;cursor:not-allowed; }
                .ai { animation:stagger 0.6s cubic-bezier(0.16,1,0.3,1) both; }
                .d1{animation-delay:.1s}.d2{animation-delay:.2s}.d3{animation-delay:.3s}.d4{animation-delay:.4s}.d5{animation-delay:.5s}
            `}</style>

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
                    <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#F59E0B,#D97706)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', transform: 'rotate(-5deg)', boxShadow: '0 10px 30px rgba(245,158,11,0.4)', position: 'relative' }}>
                        <span style={{ fontSize: 36 }}>🚴</span>
                        <div style={{ position: 'absolute', top: -8, right: -8, background: '#E23744', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '2px solid #0D0D0D' }}>📦</div>
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg,#F59E0B,#FDE68A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 4 }}>Campus Bites</h1>
                    <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Delivery Boy Portal</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '0.4rem 0.9rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '2rem', fontSize: '0.8rem', color: '#F59E0B', fontWeight: 600 }}>
                        🚴 Delivery Access
                    </div>
                </div>

                {/* Tabs */}
                <div className="ai d2" style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
                    {['login', 'register'].map(m => (
                        <button key={m} onClick={() => { setMode(m); setError(''); }} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', fontFamily: "'Inter',sans-serif", color: mode === m ? '#F59E0B' : '#6B7280', borderBottom: mode === m ? '2px solid #F59E0B' : '2px solid transparent', transition: 'all 0.3s', marginBottom: -1 }}>
                            {m === 'login' ? 'Sign In' : 'Register'}
                        </button>
                    ))}
                </div>

                {error && <div className="ai" style={{ background: 'rgba(226,55,68,0.1)', border: '1px solid rgba(226,55,68,0.3)', borderRadius: '0.75rem', padding: '0.85rem 1rem', color: '#FCA5A5', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {mode === 'register' && (
                            <div className="ai d2" style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}><User size={18} /></span>
                                <input className="del-input" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                            </div>
                        )}
                        <div className="ai d2" style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}><Mail size={18} /></span>
                            <input className="del-input" name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="ai d3" style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}><Lock size={18} /></span>
                            <input className="del-input" name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                        </div>
                        {mode === 'register' && (
                            <div className="ai d4" style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}><Phone size={18} /></span>
                                <input className="del-input" name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
                            </div>
                        )}
                        {mode === 'login' && (
                            <div className="ai d4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '0.75rem', padding: '0.7rem 1rem', fontSize: '0.8rem', color: '#FDE68A', marginBottom: '0.5rem' }}>
                                💡 Default: <b>delivery@bites.com</b> / <b>delivery123</b>
                            </div>
                        )}
                        <button className="del-btn ai d4" type="submit" disabled={loading}>
                            {loading ? <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span> : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={20} /></>}
                        </button>
                    </div>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0', color: '#6B7280', fontSize: '0.85rem' }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                    <span>or</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                </div>

                <Link to="/" style={{ display: 'block', textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white', textDecoration: 'none', fontWeight: 600, transition: 'all 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; e.currentTarget.style.color = '#F59E0B'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}>
                    ← Back to Student Login
                </Link>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6B7280', fontSize: '0.8rem' }}>
                    View and complete all active delivery orders 🚴
                </p>
            </div>
        </div>
    );
};

export default DeliveryLogin;
