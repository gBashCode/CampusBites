import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Home, ShoppingBag, User, Receipt, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
    const { cartCount } = useCart();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/dashboard/menu', icon: Home, label: 'Home' },
        { path: '/dashboard/cart', icon: ShoppingBag, label: 'Cart', badge: cartCount },
        { path: '/dashboard/orders', icon: Receipt, label: 'Orders' },
        { path: '/dashboard/profile', icon: User, label: 'Profile' }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-deep)',
            color: 'white',
            paddingBottom: '80px'
        }}>
            <a href="#main-content" className="skip-to-content">Skip to content</a>

            {/* Header */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 999,
                display: 'flex',
                justifyContent: 'center',
                padding: '16px',
                pointerEvents: 'none'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '600px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pointerEvents: 'auto'
                }}>
                    <h1 style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: 800,
                        margin: 0,
                        letterSpacing: '-0.5px'
                    }}>
                        Campus<span style={{ color: 'var(--primary)' }}>Bites</span>
                    </h1>
                    <button
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-main)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>

            <main id="main-content" style={{
                width: '100%',
                maxWidth: '600px',
                margin: '0 auto',
                minHeight: '100vh',
                position: 'relative',
                paddingTop: '60px'
            }}>
                <Outlet />
            </main>

            <nav aria-label="Main navigation" style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '400px',
                zIndex: 1000
            }}>
                <div className="glass-panel" style={{
                    borderRadius: '24px',
                    padding: '12px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}>
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                aria-label={item.label}
                                aria-current={active ? 'page' : undefined}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px',
                                    textDecoration: 'none',
                                    color: active ? 'var(--primary)' : 'var(--text-secondary)',
                                    position: 'relative',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    position: 'relative',
                                    transform: active ? 'translateY(-4px)' : 'none',
                                    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}>
                                    <Icon
                                        size={24}
                                        strokeWidth={active ? 2.5 : 2}
                                        style={{
                                            filter: active ? 'drop-shadow(0 0 8px rgba(226, 55, 68, 0.5))' : 'none'
                                        }}
                                    />

                                    {item.badge > 0 && (
                                        <span aria-label={`${item.badge} items in cart`} style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            right: '-8px',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            minWidth: '16px',
                                            height: '16px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid var(--bg-card)'
                                        }}>
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: 500,
                                    opacity: active ? 1 : 0,
                                    transform: active ? 'translateY(0)' : 'translateY(10px)',
                                    transition: 'all 0.3s ease',
                                    position: 'absolute',
                                    bottom: '-16px',
                                    width: 'max-content'
                                }}>
                                    {item.label}
                                </span>

                                {active && (
                                    <div aria-hidden="true" style={{
                                        width: '4px',
                                        height: '4px',
                                        background: 'var(--primary)',
                                        borderRadius: '50%',
                                        position: 'absolute',
                                        bottom: '-22px',
                                        boxShadow: '0 0 8px var(--primary)'
                                    }} />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default Dashboard;
