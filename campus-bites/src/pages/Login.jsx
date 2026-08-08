import { useState, useEffect } from 'react';
import { UtensilsCrossed, Mail, Lock, ArrowRight, Sparkles, ChefHat, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../apiConfig';
import { PrimaryButton, SecondaryButton, InputField, GlassCard, Divider, ErrorDisplay } from '../components/ui';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GoogleLoginButton = ({ setLoading, setError }) => {
  const { login } = useAuth();
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
        if (res.ok) login(data.user, data.token);
        else setError(data.message || 'Google Login Failed');
      } catch {
        setError('Server connection error during Google Login');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google Login Failed'),
  });

  return (
    <SecondaryButton onClick={() => googleLogin()}>
      <GoogleIcon /> Continue with Google
    </SecondaryButton>
  );
};

const FloatingEmoji = ({ emoji, style, delay }) => (
  <div
    className="animate-float"
    style={{ position: 'absolute', fontSize: '3.5rem', opacity: 0.1, pointerEvents: 'none', animationDelay: delay, ...style }}
  >
    {emoji}
  </div>
);

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
  const hasGoogleClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/menu', { replace: true });
      else if (user.role === 'staff') navigate('/staff/kitchen', { replace: true });
      else if (user.role === 'lecturer') navigate('/lecturer/menu', { replace: true });
      else navigate('/dashboard/menu', { replace: true });
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
      if (res.ok) login(data.user, data.token);
      else setError(data.message || 'Login failed');
    } catch {
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
    } catch {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden', color: 'white' }}>
      <div className="animate-pulse" style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', filter: 'blur(40px)', top: '10%', left: '10%' }} />
      <div className="animate-pulse" style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', filter: 'blur(40px)', bottom: '10%', right: '10%', animationDelay: '2s' }} />

      <FloatingEmoji emoji="🍔" style={{ top: '15%', left: '8%' }} delay="0s" />
      <FloatingEmoji emoji="🍕" style={{ top: '25%', right: '12%' }} delay="1s" />
      <FloatingEmoji emoji="🍟" style={{ bottom: '20%', left: '15%' }} delay="2s" />
      <FloatingEmoji emoji="🥤" style={{ bottom: '30%', right: '10%' }} delay="1.5s" />
      <FloatingEmoji emoji="🌮" style={{ top: '50%', left: '5%' }} delay="0.5s" />

      <GlassCard elevated className="animate-slideIn" style={{ width: '90%', maxWidth: 450, padding: '3rem 2rem', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="animate-slideIn delay-1" style={{ width: 80, height: 80, background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', transform: 'rotate(-5deg)', boxShadow: '0 10px 30px var(--primary-glow)', position: 'relative' }}>
            <UtensilsCrossed color="white" size={40} />
            <div style={{ position: 'absolute', top: -8, right: -8, background: 'var(--success)', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--bg-deep)' }}>
              <Sparkles size={12} color="white" />
            </div>
          </div>

          <h1 className="gradient-text animate-slideIn delay-2" style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-1px' }}>
            Campus Bites
          </h1>
          <p className="animate-slideIn delay-3" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', marginBottom: '1.5rem' }}>
            Your favorite canteen, now online
          </p>
          <div className="animate-slideIn delay-4" style={{ display: 'flex', gap: 'var(--space-xs)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span className="badge badge-primary"><ChefHat size={14} /> Fresh Food</span>
            <span className="badge badge-primary"><Sparkles size={14} /> Quick Pickup</span>
          </div>
        </div>

        <ErrorDisplay>{error}</ErrorDisplay>

        {!showOtp ? (
          <form onSubmit={handleSubmit} aria-label="Sign in to your account">
            <div className="animate-slideIn delay-5">
              <InputField icon={Mail} type="email" placeholder="Email Address" aria-label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="animate-slideIn delay-6">
              <InputField icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="Password" aria-label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required toggleIcon={showPassword ? EyeOff : Eye} onToggle={() => setShowPassword(!showPassword)} />
            </div>
            <div className="animate-slideIn delay-7" style={{ textAlign: 'right', marginBottom: 'var(--space-lg)' }}>
              <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: 'var(--text-base)', textDecoration: 'none', fontWeight: 500 }}>
                Forgot Password?
              </Link>
            </div>
            <PrimaryButton type="submit" loading={loading} icon={ArrowRight} className="animate-slideIn delay-8">
              Sign In
            </PrimaryButton>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} aria-label="Verify OTP code">
            <InputField
              type="text"
              placeholder="6-digit Verification Code"
              aria-label="6-digit Verification Code"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem' }}
            />
            <PrimaryButton type="submit" loading={loading} icon={ArrowRight} style={{ marginTop: 'var(--space-md)' }}>
              Verify & Sign In
            </PrimaryButton>
            <button
              type="button"
              onClick={() => setShowOtp(false)}
              style={{ width: '100%', marginTop: 'var(--space-sm)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)' }}
            >
              Back to Login
            </button>
          </form>
        )}

        <Divider>Or continue with</Divider>

        {hasGoogleClientId && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
            <GoogleLoginButton setLoading={setLoading} setError={setError} />
          </div>
        )}

        <Link to="/register" className="btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
          Create New Account
        </Link>

        <div style={{ marginTop: 'var(--space-sm)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -1, background: 'linear-gradient(135deg, var(--purple), #a78bfa, var(--purple))', borderRadius: 'var(--radius-lg)', filter: 'blur(6px)', opacity: 0.5, animation: 'pulseGlow 2.5s ease-in-out infinite' }} />
          <Link
            to="/lecturer"
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '1rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(167,139,250,0.15))', border: '1px solid var(--purple-border)', borderRadius: 'var(--radius-lg)', color: '#c4b5fd', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', transition: 'all var(--duration-normal) var(--ease-standard)', backdropFilter: 'blur(10px)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(167,139,250,0.25))';
              e.currentTarget.style.borderColor = '#a78bfa';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px var(--purple-glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(167,139,250,0.15))';
              e.currentTarget.style.borderColor = 'var(--purple-border)';
              e.currentTarget.style.color = '#c4b5fd';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🎓</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>Lecturer Portal</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.7, fontWeight: 400 }}>Faculty cabin delivery ordering</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '0.85rem', opacity: 0.7 }}>→</span>
          </Link>
        </div>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-lg)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          By continuing, you agree to our Terms &amp; Privacy Policy
        </p>
      </GlassCard>
    </div>
  );
};

export default Login;
