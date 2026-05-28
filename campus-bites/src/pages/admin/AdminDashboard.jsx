import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, BarChart3, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
            backgroundColor: '#0D0D0D',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Styles */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(5deg); }
                }
                .floating-emoji {
                    position: absolute;
                    font-size: 3rem;
                    opacity: 0.1;
                    pointer-events: none;
                    animation: float 7s ease-in-out infinite;
                }
                .nav-link {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    margin-bottom: 0.5rem;
                    border-radius: 12px;
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    color: #9CA3AF;
                }
                .nav-link:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                    transform: translateX(5px);
                }
                .nav-link.active {
                    background: linear-gradient(135deg, rgba(226, 55, 68, 0.15) 0%, rgba(226, 55, 68, 0.05) 100%);
                    color: #E23744;
                    border-left: 4px solid #E23744;
                }
                .glass-content {
                    background: rgba(26, 26, 28, 0.95);
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    min-height: calc(100vh - 4rem);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                    padding: 2rem;
                }
                .sidebar {
                    width: 280px;
                    background: #111111;
                    padding: 2rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                    z-index: 100;
                    transition: transform 0.3s ease;
                }
                .mobile-header {
                    display: none;
                    background: #111111;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    justify-content: space-between;
                    align-items: center;
                    position: sticky;
                    top: 0;
                    z-index: 101;
                }
                
                @media (max-width: 1024px) {
                    .sidebar {
                        position: fixed;
                        left: 0;
                        top: 0;
                        height: 100vh;
                        transform: translateX(${isMobileMenuOpen ? '0' : '-100%'});
                        box-shadow: 20px 0 50px rgba(0,0,0,0.5);
                    }
                    .mobile-header {
                        display: flex;
                    }
                    .main-layout {
                        flex-direction: column !important;
                    }
                    .glass-content {
                        padding: 1.25rem;
                        border-radius: 16px;
                    }
                }
            `}</style>

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
            <aside className="sidebar">
                <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#E23744', padding: '8px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(226,55,68,0.3)' }}>
                            <ShieldCheck color="white" size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>Admin</h2>
                            <p style={{ color: '#6B7280', fontSize: '0.78rem', margin: 0 }}>{user?.name || 'Master Access'}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Logout at top-right of sidebar */}
                        <button
                            onClick={logout}
                            title="Logout"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '8px 14px', border: '1px solid rgba(248,113,113,0.3)',
                                borderRadius: '10px', background: 'rgba(248,113,113,0.08)',
                                color: '#F87171', cursor: 'pointer', fontSize: '0.82rem',
                                fontWeight: 600, transition: 'all 0.25s ease', whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.18)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.5)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
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
                        <style>{`
                            @media (max-width: 1024px) {
                                .mobile-close-btn { display: block !important; }
                            }
                        `}</style>
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
                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 0.5rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(226,55,68,0.12)', border: '1px solid rgba(226,55,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontWeight: 800, color: '#E23744', fontSize: 14 }}>{user?.name?.[0]?.toUpperCase() || 'A'}</span>
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Admin'}</p>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#6B7280' }}>Master Access</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }} className="main-layout">
                {/* Mobile Header */}
                <header className="mobile-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#E23744', padding: '6px', borderRadius: '8px' }}>
                            <ShieldCheck color="white" size={18} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Campus Admin</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Logout in mobile header top-right */}
                        <button
                            onClick={logout}
                            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}
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
                    <div className="glass-content">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;

