import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Home, Search, ShoppingBag, User, ChefHat, Receipt } from 'lucide-react';

const Dashboard = () => {
    const { cartCount } = useCart();
    const location = useLocation();

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
            background: '#0D0D0D',
            color: 'white',
            paddingBottom: '80px' // Space for bottom nav
        }}>
            {/* Main Content Area */}
            <main style={{
                width: '100%',
                maxWidth: '600px', // Mobile-first constraint
                margin: '0 auto',
                minHeight: '100vh',
                position: 'relative'
            }}>
                <Outlet />
            </main>

            {/* Bottom Floating Dock Navigation */}
            <nav style={{
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
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px',
                                    textDecoration: 'none',
                                    color: active ? '#E23744' : '#9CA3AF',
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

                                    {/* Cart Badge */}
                                    {item.badge > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            right: '-8px',
                                            background: '#E23744',
                                            color: 'white',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            minWidth: '16px',
                                            height: '16px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid #1C1C1E'
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

                                {/* Active Indicator Dot */}
                                {active && (
                                    <div style={{
                                        width: '4px',
                                        height: '4px',
                                        background: '#E23744',
                                        borderRadius: '50%',
                                        position: 'absolute',
                                        bottom: '-22px',
                                        boxShadow: '0 0 8px #E23744'
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
