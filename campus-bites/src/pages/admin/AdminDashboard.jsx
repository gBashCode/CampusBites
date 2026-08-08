import React, { useState, Component } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, BarChart3, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/ui';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'white' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Something went wrong</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>An unexpected error occurred.</p>
                    <button
                        onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
                        className="btn-primary"
                        style={{ width: 'auto', display: 'inline-flex', padding: '0.8rem 1.5rem' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname.includes(path);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            minHeight: '100vh',
            backgroundColor: 'var(--bg-deep)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decor */}
            <div className="floating-emoji" style={{ top: '10%', right: '5%' }}>🍕</div>
            <div className="floating-emoji" style={{ bottom: '15%', left: '20%', animationDelay: '2s' }}>🍜</div>

            {/* Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                        zIndex: 99
                    }}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 20px var(--primary-glow)' }}>
                            <ShieldCheck color="white" size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>Admin</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>{user?.name || 'Master Access'}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                            onClick={logout}
                            title="Logout"
                            className="btn-icon"
                            style={{
                                padding: '8px 14px',
                                borderRadius: '10px',
                                background: 'var(--danger-surface)',
                                border: '1px solid var(--danger-border)',
                                color: 'var(--danger)',
                                fontSize: '0.82rem',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <LogOut size={15} /> Logout
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="mobile-close-btn"
                            style={{ display: 'none', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <nav style={{ flex: 1 }}>
                    <Link to="/admin/menu" onClick={() => setIsMobileMenuOpen(false)} className={`nav-link ${isActive('/admin/menu') ? 'active' : ''}`}>
                        <UtensilsCrossed size={20} style={{ marginRight: '1rem' }} /> Manage Menu
                    </Link>
                    <Link to="/admin/analytics" onClick={() => setIsMobileMenuOpen(false)} className={`nav-link ${isActive('/admin/analytics') ? 'active' : ''}`}>
                        <BarChart3 size={20} style={{ marginRight: '1rem' }} /> Analytics
                    </Link>
                </nav>

                {/* User info at bottom only */}
                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 0.5rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-surface)', border: '1px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 14 }}>{user?.name?.[0]?.toUpperCase() || 'A'}</span>
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Admin'}</p>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>Master Access</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }} className="main-layout">
                {/* Mobile Header */}
                <header className="mobile-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: 'var(--radius-sm)' }}>
                            <ShieldCheck color="white" size={18} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Campus Admin</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                            onClick={logout}
                            className="btn-icon"
                            style={{ background: 'var(--danger-surface)', border: '1px solid var(--danger-border)', color: 'var(--danger)', padding: '6px 10px', fontSize: 12 }}
                        >
                            <LogOut size={13} /> Logout
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                    <GlassCard elevated className="glass-content">
                        <ErrorBoundary>
                            <Outlet />
                        </ErrorBoundary>
                    </GlassCard>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
