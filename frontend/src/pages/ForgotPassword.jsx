import React, { useState, useEffect, useCallback } from 'react'
import { Mail, Lock, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import API_URL from '../apiConfig'
import { PrimaryButton, InputField, GlassCard, ErrorDisplay, SuccessDisplay } from '../components/ui'

const ForgotPassword = () => {
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [countdown, setCountdown] = useState(0)

    const navigate = useNavigate()

    useEffect(() => {
        if (countdown <= 0) return
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        return () => clearTimeout(timer)
    }, [countdown])

    const handleSendOtp = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            setStep(2)
            setMessage('If an account exists, a reset code has been sent.')
            setCountdown(60)
        } catch {
            setError('Server connection error')
        } finally {
            setLoading(false)
        }
    }

    const handleResendOtp = useCallback(async () => {
        if (countdown > 0) return
        setLoading(true)
        try {
            await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            setMessage('Reset code resent.')
            setCountdown(60)
        } catch {
            setError('Failed to resend code')
        } finally {
            setLoading(false)
        }
    }, [email, countdown])

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            })

            const data = await res.json()
            if (res.ok) {
                setMessage('Password reset successful! Redirecting to login...')
                setTimeout(() => navigate('/'), 2000)
            } else {
                setError(data.message || 'Reset failed')
            }
        } catch {
            setError('Server connection error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-deep)',
            color: 'var(--text-main)'
        }}>
            <GlassCard className="animate-slideIn" style={{ width: '90%', maxWidth: '450px', padding: '3rem 2rem' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', textDecoration: 'none' }}>
                    <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back
                </Link>

                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: '0.5rem' }} className="animate-slideIn delay-1">
                    {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }} className="animate-slideIn delay-2">
                    {step === 1 ? 'Enter your email to receive a reset code.' : 'Enter the code and your new password.'}
                </p>

                <ErrorDisplay>{error}</ErrorDisplay>
                <SuccessDisplay>{message}</SuccessDisplay>

                {step === 1 ? (
                    <form onSubmit={handleSendOtp}>
                        <div className="animate-slideIn delay-3">
                            <InputField
                                icon={Mail}
                                type="email"
                                placeholder="Email Address"
                                aria-label="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <PrimaryButton type="submit" loading={loading} className="animate-slideIn delay-4">
                            Send Code
                        </PrimaryButton>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div className="animate-slideIn delay-3">
                            <InputField
                                type="text"
                                placeholder="Enter 6-digit Code"
                                aria-label="6-digit verification code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                required
                                style={{ textAlign: 'center', letterSpacing: '2px' }}
                            />
                        </div>
                        <div className="animate-slideIn delay-4" style={{ marginBottom: 'var(--space-lg)' }}>
                            <InputField
                                icon={Lock}
                                type="password"
                                placeholder="New Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)"
                                aria-label="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                        <PrimaryButton type="submit" loading={loading} className="animate-slideIn delay-5">
                            Set New Password
                        </PrimaryButton>
                        <div style={{ textAlign: 'center', marginTop: '1rem' }} className="animate-slideIn delay-6">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={countdown > 0}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: countdown > 0 ? 'var(--text-dim)' : 'var(--primary)',
                                    cursor: countdown > 0 ? 'default' : 'pointer',
                                    fontSize: '0.9rem',
                                    padding: '0.5rem',
                                    fontFamily: 'var(--font-body)'
                                }}
                            >
                                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
                            </button>
                        </div>
                    </form>
                )}
            </GlassCard>
        </div>
    )
}

export default ForgotPassword
