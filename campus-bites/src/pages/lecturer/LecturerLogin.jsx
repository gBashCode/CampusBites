import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, Mail, Lock, ArrowRight, User, Hash, BookOpen, Phone } from 'lucide-react';
import API_URL from '../../apiConfig';

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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0D0D', position: 'relative', overflow: 'hidden', color: 'white' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; }
                @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(5deg)} }
                @keyframes pulse { 0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.5;transform:scale(1.05)} }
                @keyframes slideIn { from{opacity:0;transform:translateY(50px)}to{opacity:1;transform:translateY(0)} }
                @keyframes slideInStagger { from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)} }
                @keyframes spin { to{transform:rotate(360deg)} }
                .lec-floating { position:absolute;font-size:3.5rem;opacity:0.1;pointer-events:none;animation:float 8s ease-in-out infinite; }
                .lec-glass { background:rgba(26,26,28,0.95);border-radius:1.5rem;box-shadow:0 20px 50px rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.08);animation:slideIn 0.8s cubic-bezier(0.16,1,0.3,1); }
                .lec-glow { position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(226,55,68,0.15) 0%,transparent 70%);filter:blur(40px);animation:pulse 4s ease-in-out infinite; }
                .lec-input { width:100%;box-sizing:border-box;padding:1rem 1rem 1rem 3rem;border:1px solid rgba(255,255,255,0.1);border-radius:1rem;font-size:1rem;transition:all 0.3s ease;background:rgba(255,255,255,0.05);color:white;font-family:'Inter',sans-serif;outline:none; }
                .lec-input:focus { border-color:#E23744;background:rgba(226,55,68,0.05);box-shadow:0 0 0 3px rgba(226,55,68,0.1); }
                .lec-input::placeholder { color:#6B7280; }
                .lec-input option { background:#1a1a1c;color:white; }
                .lec-btn { width:100%;padding:1rem;background:linear-gradient(135deg,#E23744,#DC2626);color:white;border:none;border-radius:1rem;font-size:1.1rem;font-weight:600;cursor:pointer;transition:all 0.3s ease;box-shadow:0 10px 30px rgba(226,55,68,0.3);display:flex;align-items:center;justify-content:center;gap:8px;font-family:'Inter',sans-serif; }
                .lec-btn:hover:not(:disabled) { transform:translateY(-3px);box-shadow:0 15px 40px rgba(226,55,68,0.4); }
                .lec-btn:disabled { opacity:0.7;cursor:not-allowed; }
                .tab-active { border-bottom:2px solid #E23744;color:#E23744; }
                .tab-inactive { border-bottom:2px solid transparent;color:#6B7280; }
                .tab-inactive:hover { color:rgba(255,255,255,0.7); }
                .animate-item { animation:slideInStagger 0.6s cubic-bezier(0.16,1,0.3,1) both; }
                .delay-1{animation-delay:.1s}.delay-2{animation-delay:.2s}.delay-3{animation-delay:.3s}.delay-4{animation-delay:.4s}.delay-5{animation-delay:.5s}
            `}</style>

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
                    <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#E23744,#DC2626)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', transform: 'rotate(-5deg)', boxShadow: '0 10px 30px rgba(226,55,68,0.4)', position: 'relative' }}>
                        <UtensilsCrossed color="white" size={40} />
                        <div style={{ position: 'absolute', top: -8, right: -8, background: '#7c3aed', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '2px solid #0D0D0D' }}>🎓</div>
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg,#E23744,#F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 4 }}>Campus Bites</h1>
                    <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Faculty Cabin Delivery Portal</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.9rem', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '2rem', fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600 }}>
                            🎓 Lecturer Access
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="animate-item delay-2" style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
                    {['login', 'register'].map(m => (
                        <button key={m} onClick={() => { setMode(m); setError(''); }} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', fontFamily: "'Inter',sans-serif", color: mode === m ? '#E23744' : '#6B7280', borderBottom: mode === m ? '2px solid #E23744' : '2px solid transparent', transition: 'all 0.3s', marginBottom: -1 }}>
                            {m === 'login' ? 'Sign In' : 'Register'}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="animate-item" style={{ background: 'rgba(226,55,68,0.1)', border: '1px solid rgba(226,55,68,0.3)', borderRadius: '0.75rem', padding: '0.85rem 1rem', color: '#FCA5A5', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {mode === 'register' && (
                            <div className="animate-item delay-2" style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}><User size={18} /></span>
                                <input className="lec-input" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                            </div>
                        )}

                        <div className="animate-item delay-2" style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}><Mail size={18} /></span>
                            <input className="lec-input" name="email" type="email" placeholder="Institutional Email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="animate-item delay-3" style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}><Lock size={18} /></span>
                            <input className="lec-input" name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                        </div>

                        {mode === 'register' && (
                            <>
                                <div className="animate-item delay-4" style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}><Hash size={18} /></span>
                                    <input className="lec-input" name="cabinNumber" placeholder="Cabin Number (e.g. C-204)" value={formData.cabinNumber} onChange={handleChange} required />
                                </div>
                                <div className="animate-item delay-5" style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}><Phone size={18} /></span>
                                    <input className="lec-input" name="phone" type="tel" placeholder="Phone Number (optional)" value={formData.phone} onChange={handleChange} />
                                </div>
                                <div className="animate-item delay-5" style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}><BookOpen size={18} /></span>
                                    <select className="lec-input" name="department" value={formData.department} onChange={handleChange}>
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </>
                        )}

                        <button className="lec-btn animate-item delay-4" type="submit" disabled={loading}>
                            {loading ? <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span> : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={20} /></>}
                        </button>
                    </div>
                </form>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0', color: '#6B7280', fontSize: '0.85rem' }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                    <span>or</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                </div>

                <Link to="/" style={{ display: 'block', textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white', textDecoration: 'none', fontWeight: 600, transition: 'all 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(226,55,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(226,55,68,0.3)'; e.currentTarget.style.color = '#E23744'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}>
                    ← Back to Student Login
                </Link>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6B7280', fontSize: '0.8rem' }}>
                    Orders are delivered directly to your registered cabin 🚪
                </p>
            </div>
        </div>
    );
};

export default LecturerLogin;
