import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import API_URL from '../apiConfig'
import {
    User, Mail, Lock, Phone, MapPin, CreditCard,
    Bell, Shield, LogOut, ChevronRight, Edit2,
    Save, X, Heart, Clock, Settings, HelpCircle
} from 'lucide-react'
import { PrimaryButton, SecondaryButton, GlassCard, ErrorDisplay, SuccessDisplay } from '../components/ui'

const Profile = () => {
    const { user, logout } = useAuth()
    const { permission, enableNotifications, sendTestNotification } = useNotifications()
    const toast = useToast()
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)
    const [enabling, setEnabling] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: ''
    })

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const handleSave = async () => {
        try {
            const { token } = useAuth()
            const res = await fetch(`${API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: formData.name, phone: formData.phone, address: formData.address })
            })
            if (res.ok) {
                setIsEditing(false)
                toast.success('Profile updated successfully!')
            } else {
                toast.error('Failed to update profile')
            }
        } catch (err) {
            toast.error('Error updating profile')
        }
    }

    const handleEnableNotifications = async () => {
        setEnabling(true)
        const success = await enableNotifications()
        setEnabling(false)
        if (!success) {
            toast.error('Could not enable notifications. Please check your browser settings.')
        }
    }

    const accountSections = [
        {
            title: 'Account Settings',
            items: [
                { icon: User, label: 'Edit Profile', action: () => setIsEditing(true) },
                { icon: Lock, label: 'Change Password', action: () => toast.info('Change password feature coming soon') },
                { icon: Bell, label: permission === 'granted' ? 'Notifications (Enabled)' : 'Enable Notifications', action: permission === 'granted' ? sendTestNotification : handleEnableNotifications },
                { icon: Shield, label: 'Privacy & Security', action: () => toast.info('Privacy settings coming soon') }
            ]
        },
        {
            title: 'Payment & Orders',
            items: [
                { icon: CreditCard, label: 'Payment Methods', action: () => toast.info('Payment methods coming soon') },
                { icon: Clock, label: 'Order History', action: () => navigate('/dashboard/orders') },
                { icon: Heart, label: 'Favorites', action: () => toast.info('Favorites feature coming soon') }
            ]
        },
        {
            title: 'Support',
            items: [
                { icon: HelpCircle, label: 'Help Center', action: () => toast.info('Help center coming soon') },
                { icon: Settings, label: 'App Settings', action: () => toast.info('App settings coming soon') }
            ]
        }
    ]

    return (
        <div style={{ padding: 'var(--space-lg) var(--space-md) 8rem', color: 'var(--text-main)' }}>
            <div style={{ marginBottom: 'var(--space-lg)' }} className="animate-slideIn">
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Profile</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your account and preferences</p>
            </div>

            <GlassCard elevated className="animate-slideIn delay-1" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)', position: 'relative' }}>
                <SecondaryButton
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    icon={isEditing ? Save : Edit2}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        background: isEditing ? 'var(--success)' : 'var(--primary-surface)',
                        border: `1px solid ${isEditing ? 'var(--success)' : 'var(--primary)'}`,
                        color: isEditing ? 'white' : 'var(--primary)',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600
                    }}
                >
                    {isEditing ? 'Save' : 'Edit'}
                </SecondaryButton>

                {isEditing && (
                    <SecondaryButton
                        onClick={() => setIsEditing(false)}
                        icon={X}
                        style={{
                            position: 'absolute',
                            top: '1.5rem',
                            right: '7rem',
                            background: 'transparent',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-secondary)',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-sm)'
                        }}
                    >
                        Cancel
                    </SecondaryButton>
                )}

                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    fontSize: 'var(--text-3xl)',
                    fontWeight: 700,
                    boxShadow: '0 8px 24px var(--primary-glow)'
                }}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>

                <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                    {isEditing ? (
                        <input
                            type="text"
                            aria-label="Your name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.75rem',
                                color: 'white',
                                fontSize: 'var(--text-2xl)',
                                fontWeight: 700,
                                textAlign: 'center',
                                width: '100%',
                                marginBottom: '0.5rem',
                                fontFamily: 'var(--font-body)',
                                boxSizing: 'border-box'
                            }}
                        />
                    ) : (
                        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {user?.name || 'Guest User'}
                        </h2>
                    )}
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                        {user?.role || 'Student'}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        { icon: Mail, label: 'Email', field: 'email', type: 'email' },
                        { icon: Phone, label: 'Phone', field: 'phone', type: 'tel', placeholder: 'Add phone number' },
                        { icon: MapPin, label: 'Address', field: 'address', type: 'text', placeholder: 'Add delivery address' }
                    ].map(({ icon: Icon, label, field, type, placeholder }) => (
                        <div key={field} style={{
                            background: 'var(--surface)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{
                                background: 'var(--primary-surface)',
                                padding: '10px',
                                borderRadius: 'var(--radius-md)'
                            }}>
                                <Icon size={20} color="var(--primary)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '4px' }}>{label}</p>
                                {isEditing ? (
                                    <input
                                        type={type}
                                        aria-label={`Your ${label.toLowerCase()}`}
                                        value={formData[field]}
                                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                        placeholder={placeholder}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'white',
                                            fontSize: 'var(--text-base)',
                                            width: '100%',
                                            outline: 'none',
                                            fontFamily: 'var(--font-body)'
                                        }}
                                    />
                                ) : (
                                    <p style={{ fontSize: 'var(--text-base)', fontWeight: 500 }}>{formData[field] || 'Not set'}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {accountSections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: 'var(--space-lg)' }} className={`animate-slideIn delay-${idx + 2}`}>
                    <h3 style={{
                        fontSize: 'var(--text-md)',
                        fontWeight: 600,
                        marginBottom: '1rem',
                        color: 'var(--text-secondary)'
                    }}>
                        {section.title}
                    </h3>
                    <div className="glass-card-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                        {section.items.map((item, itemIdx) => {
                            const Icon = item.icon
                            return (
                                <button
                                    key={itemIdx}
                                    onClick={item.action}
                                    style={{
                                        width: '100%',
                                        padding: '1.25rem',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: itemIdx < section.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        fontFamily: 'var(--font-body)',
                                        transition: 'background 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{
                                        background: 'var(--primary-surface)',
                                        padding: '10px',
                                        borderRadius: 'var(--radius-md)'
                                    }}>
                                        <Icon size={20} color="var(--primary)" />
                                    </div>
                                    <span style={{ flex: 1, textAlign: 'left', fontSize: 'var(--text-base)', fontWeight: 500 }}>
                                        {item.label}
                                    </span>
                                    <ChevronRight size={20} color="var(--text-secondary)" />
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}

            <button
                onClick={handleLogout}
                className="animate-slideIn delay-5"
                style={{
                    width: '100%',
                    padding: '1.25rem',
                    background: 'var(--danger-surface)',
                    border: '1px solid var(--danger-border)',
                    borderRadius: '20px',
                    color: 'var(--danger)',
                    fontSize: 'var(--text-md)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--danger-surface)'
                    e.currentTarget.style.transform = 'translateY(0)'
                }}
            >
                <LogOut size={20} />
                Logout
            </button>

            <div style={{
                textAlign: 'center',
                marginTop: 'var(--space-lg)',
                color: 'var(--text-dim)',
                fontSize: 'var(--text-xs)'
            }} className="animate-slideIn delay-6">
                Campus Bites v2.0 • 2026 Edition
            </div>
        </div>
    )
}

export default Profile
