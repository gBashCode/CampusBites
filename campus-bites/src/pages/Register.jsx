import React, { useState, useEffect } from 'react'
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGoogleLogin } from '@react-oauth/google'
import API_URL from '../apiConfig'
import { PrimaryButton, SecondaryButton, InputField, GlassCard, ErrorDisplay, SuccessDisplay, Divider } from '../components/ui'

const GoogleSignupButton = ({ setLoading, setError }) => {
    const { login } = useAuth()
    const navigate = useNavigate()

    const googleLogin = useGoogleLogin({
        flow: 'implicit',
        onSuccess: async (tokenResponse) => {
            setLoading(true)
            setError('')
            try {
                const res = await fetch(`${API_URL}/api/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accessToken: tokenResponse.access_token })
                })
                const data = await res.json()
                if (res.ok) {
                    login(data.user, data.token)
                    if (data.user.role === 'admin') navigate('/admin/menu')
                    else if (data.user.role === 'staff') navigate('/staff/kitchen')
                    else navigate('/dashboard/menu')
                } else {
                    setError(data.message || 'Google Signup Failed')
                }
            } catch {
                setError('Server connection error during Google Signup')
            } finally {
                setLoading(false)
            }
        },
        onError: () => setError('Google Signup Failed'),
    })

    return (
        <SecondaryButton onClick={() => googleLogin()}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Continue with Google
        </SecondaryButton>
    )
}

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { login, user } = useAuth()
    const navigate = useNavigate()
    const hasGoogleClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

    useEffect(() => {
        fetch(`${API_URL}/`).catch(() => { })
    }, [])

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin/menu')
            else if (user.role === 'staff') navigate('/staff/kitchen')
            else navigate('/dashboard/menu')
        }
    }, [user, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            })

            let data
            const contentType = res.headers.get("content-type")
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json()
            } else {
                const text = await res.text()
                throw new Error(text || 'Server Error')
            }

            if (res.ok) {
                login(data.user, data.token)
                navigate('/dashboard/menu')
            } else {
                setError(data.message || 'Registration failed')
            }
        } catch (err) {
            setError(err.message === 'Failed to fetch' ? 'Server is offline. Please try again later.' : (err.message || 'Connection error'))
        } finally {
            setLoading(false)
        }
    }

    const getPasswordStrength = () => {
        const p = formData.password
        if (!p) return { level: 0, text: '', color: '' }
        let score = 0
        if (p.length >= 8) score++
        if (/[A-Z]/.test(p)) score++
        if (/[a-z]/.test(p)) score++
        if (/[0-9]/.test(p)) score++
        if (/[^A-Za-z0-9]/.test(p)) score++
        if (score <= 2) return { level: 1, text: 'Weak', color: '#EF4444' }
        if (score <= 3) return { level: 2, text: 'Fair', color: '#F59E0B' }
        if (score <= 4) return { level: 3, text: 'Good', color: '#3B82F6' }
        return { level: 4, text: 'Strong', color: '#10B981' }
    }
    const strength = getPasswordStrength()

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-deep)',
            position: 'relative',
            overflow: 'hidden',
            color: 'var(--text-main)'
        }}>
            <div className="animate-float" style={{ position: 'absolute', fontSize: '3.5rem', opacity: 0.15, pointerEvents: 'none', top: '15%', left: '8%' }}>🌮</div>
            <div className="animate-float" style={{ position: 'absolute', fontSize: '3.5rem', opacity: 0.15, pointerEvents: 'none', bottom: '20%', right: '12%', animationDelay: '1s', animationDuration: '7s' }}>🍟</div>

            <GlassCard elevated className="animate-slideIn" style={{ width: '90%', maxWidth: '450px', padding: '3rem 2rem', zIndex: 10 }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, marginBottom: '1.5rem', transition: 'all 0.2s ease', fontSize: '0.9rem' }}>
                    <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} />
                    Back to Login
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="animate-slideIn delay-1">
                    <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-1px' }}>Join Campus Bites</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Create your account to get started</p>
                </div>

                <ErrorDisplay>{error}</ErrorDisplay>

                <form onSubmit={handleSubmit}>
                    <div className="animate-slideIn delay-2">
                        <InputField
                            icon={User}
                            type="text"
                            placeholder="Full Name"
                            aria-label="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            autoComplete="name"
                        />
                    </div>

                    <div className="animate-slideIn delay-3">
                        <InputField
                            icon={Mail}
                            type="email"
                            placeholder="Email Address"
                            aria-label="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="animate-slideIn delay-4">
                        <InputField
                            icon={Lock}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create Password"
                            aria-label="Create Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            autoComplete="new-password"
                            toggleIcon={showPassword ? EyeOff : Eye}
                            onToggle={() => setShowPassword(!showPassword)}
                        />
                    </div>

                    {formData.password && (
                        <div style={{ marginBottom: 'var(--space-md)' }} className="animate-slideIn delay-5">
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= strength.level ? strength.color : 'var(--glass-border)', transition: 'background 0.3s' }} />
                                ))}
                            </div>
                            <p style={{ fontSize: 'var(--text-xs)', color: strength.color, margin: 0 }}>{strength.text}</p>
                        </div>
                    )}

                    <div className="animate-slideIn delay-5" style={{ marginBottom: 'var(--space-lg)' }}>
                        <InputField
                            icon={Lock}
                            type="password"
                            placeholder="Confirm Password"
                            aria-label="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <PrimaryButton type="submit" loading={loading} icon={ArrowRight} className="animate-slideIn delay-6">
                        Create Account
                    </PrimaryButton>
                </form>

                <Divider className="animate-slideIn delay-7">Or signup with</Divider>

                {hasGoogleClientId && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }} className="animate-slideIn delay-7">
                        <GoogleSignupButton setLoading={setLoading} setError={setError} />
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '2rem' }} className="animate-slideIn delay-8">
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Already have an account?{' '}
                        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
                    </p>
                </div>
            </GlassCard>
        </div>
    )
}

export default Register
