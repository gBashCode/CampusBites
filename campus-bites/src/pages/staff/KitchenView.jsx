import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, RefreshCw, Clock, ChefHat, CheckCircle2, Flame, Inbox, PackageCheck, Phone, MapPin } from 'lucide-react';

import API_URL from '../../apiConfig';
import { StatusChip, PrimaryButton, SecondaryButton, LoadingContainer, EmptyState } from '../../components/ui';

const KitchenView = () => {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('All');
    const [error, setError] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const { logout, user, token } = useAuth();

    const fetchOrders = async () => {
        if (!user?.id) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/orders/staff/active`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(Array.isArray(data) ? data : data.orders || []);
                setError(null);
            } else {
                setError('Failed to load orders');
            }
        } catch (err) {
            setError('Could not connect to server');
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 10000);
            return () => clearInterval(interval);
        }
    }, [user?.id]);

    const updateStatus = async (orderId, newStatus) => {
        if (!user?.id) {
            alert('Authentication error. Please log in again.');
            return;
        }

        try {
            await fetch(`${API_URL}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchOrders();
        } catch (err) {
            alert('Update failed');
        } finally {
            setConfirmAction(null);
        }
    };

    const handleStatusAction = (orderId, newStatus, label) => {
        setConfirmAction({ orderId, newStatus, label });
    };

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        completed: orders.filter(o => o.status === 'completed').length
    };

    const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter.toLowerCase());

    const OrderCard = ({ order }) => (
        <div key={order._id} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0 0 2px 0', letterSpacing: '1px', fontWeight: 700 }}>ORDER TICKET</p>
                    <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'white', margin: 0 }}>#{order._id.slice(-6).toUpperCase()}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: 600 }}>
                        Ordered: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0 0 2px 0', letterSpacing: '1px', fontWeight: 700 }}>PICKUP TIME</p>
                    <div style={{
                        background: 'var(--primary-surface)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--primary-border)',
                        marginTop: '4px'
                    }}>
                        <p style={{ fontWeight: 800, color: 'var(--primary)', margin: 0, fontSize: '1.1rem' }}>
                            {order.pickupTime || new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem', minHeight: '80px' }}>
                {/* Lecturer / Customer Details Block */}
                {order.user && (
                    <div style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.06)', 
                        borderRadius: 'var(--radius-md)', 
                        padding: 'var(--space-sm)', 
                        marginBottom: 'var(--space-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1rem' }}>👤</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{order.user.name}</span>
                            {order.user.role === 'lecturer' && (
                                <span className="badge badge-purple">Lecturer</span>
                            )}
                        </div>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                            {order.user.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Phone size={14} color="var(--success)" />
                                    <a href={`tel:${order.user.phone}`} style={{ fontSize: '0.85rem', color: 'var(--success)', textDecoration: 'none', fontWeight: 600 }}>{order.user.phone}</a>
                                </div>
                            )}
                            {order.user.cabinNumber && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '0.9rem' }}>🚪</span>
                                    <span style={{ fontSize: '0.85rem', color: '#a78bfa', fontWeight: 700 }}>Cabin {order.user.cabinNumber}</span>
                                </div>
                            )}
                            {order.user.department && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '0.9rem' }}>🏫</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.user.department}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Order Items:</p>
                {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: '0.75rem' }}>
                        {/* Veg/Non-Veg Badge */}
                        <div style={{
                            width: '18px',
                            height: '18px',
                            border: `2px solid ${item.product?.isVeg !== false ? 'var(--success)' : 'var(--danger)'}`,
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'white',
                            flexShrink: 0
                        }}>
                            {item.product?.isVeg !== false ? (
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--success)'
                                }} />
                            ) : (
                                <div style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: '4px solid transparent',
                                    borderRight: '4px solid transparent',
                                    borderBottom: '7px solid var(--danger)'
                                }} />
                            )}
                        </div>

                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--primary-surface)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            color: 'var(--primary)',
                            border: '1px solid var(--primary-border)'
                        }}>
                            {item.quantity}
                        </div>
                        <span style={{ color: '#E5E7EB', fontWeight: 500, fontSize: '1.05rem' }}>{item.product?.name || 'Item Expired'}</span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 'auto' }}>
                {confirmAction?.orderId === order._id ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <PrimaryButton
                            onClick={() => updateStatus(order._id, confirmAction.newStatus)}
                            style={{ flex: 2, backgroundColor: 'var(--success)', color: 'white', boxShadow: '0 8px 20px rgba(34, 197, 94, 0.2)' }}
                        >
                            Confirm
                        </PrimaryButton>
                        <SecondaryButton
                            onClick={() => setConfirmAction(null)}
                            style={{ flex: 1, backgroundColor: 'var(--surface)', color: 'var(--text-secondary)' }}
                        >
                            Cancel
                        </SecondaryButton>
                    </div>
                ) : (
                    <>
                        {order.status === 'pending' && (
                            <PrimaryButton
                                onClick={() => handleStatusAction(order._id, 'preparing', 'Accept & Start Preparing')}
                                style={{ backgroundColor: 'var(--primary)', color: 'white', width: '100%', boxShadow: '0 8px 20px var(--primary-glow)' }}
                            >
                                Accept & Start Preparing
                            </PrimaryButton>
                        )}
                        {order.status === 'preparing' && (
                            <PrimaryButton
                                onClick={() => handleStatusAction(order._id, 'ready', 'Mark as Ready')}
                                style={{ backgroundColor: 'var(--warning)', color: 'white', width: '100%', boxShadow: '0 8px 20px rgba(245, 158, 11, 0.2)' }}
                            >
                                Mark as Ready to Pickup
                            </PrimaryButton>
                        )}
                        {order.status === 'ready' && (
                            <PrimaryButton
                                onClick={() => handleStatusAction(order._id, 'completed', 'Complete Order')}
                                style={{ backgroundColor: 'var(--success)', color: 'white', width: '100%', boxShadow: '0 8px 20px rgba(34, 197, 94, 0.2)' }}
                            >
                                Handover & Complete
                            </PrimaryButton>
                        )}
                    </>
                )}
                {order.status === 'completed' && (
                    <div style={{
                        textAlign: 'center',
                        padding: '0.8rem',
                        background: 'var(--success-surface)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--success)',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <CheckCircle2 size={18} /> Completed Today
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-deep)', color: 'white', position: 'relative', overflowX: 'hidden' }}>
            {/* Background Decor */}
            <div className="floating-emoji" style={{ top: '10%', right: '5%' }}>🍳</div>
            <div className="floating-emoji" style={{ top: '60%', left: '3%' }}>🔪</div>
            <div className="floating-emoji" style={{ bottom: '10%', right: '15%' }}>🥗</div>

            {/* Header */}
            <header style={{
                background: '#111111',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                        padding: '8px',
                        borderRadius: '10px',
                        boxShadow: '0 8px 20px var(--primary-glow)'
                    }}>
                        <ChefHat color="white" size={20} />
                    </div>
                    <div>
                        <h1 className="header-title" style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Kitchen</h1>
                        <p className="header-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Terminal v2.0</p>
                    </div>
                </div>

                <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={fetchOrders} className="btn-sync" style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--glass-border)',
                        color: 'white',
                        padding: '0.6rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600
                    }}>
                        <RefreshCw size={18} /> <span>Sync</span>
                    </button>
                    <button onClick={logout} aria-label="Log out" className="btn-icon" style={{
                        background: 'var(--danger-surface)',
                        border: '1px solid var(--danger-border)',
                        color: 'var(--danger)',
                        padding: '0.6rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 700
                    }}><LogOut size={18} /></button>
                </div>
            </header>

            <div className="main-container">
                {error && (
                    <div style={{ marginBottom: '2rem' }}>
                        <EmptyState icon={ChefHat} title="Error Loading Orders">
                            <p style={{ color: 'var(--danger)', fontWeight: 600 }}>{error}</p>
                            <PrimaryButton onClick={fetchOrders} style={{ marginTop: '1rem', backgroundColor: 'var(--primary)', color: 'white' }}>
                                Retry
                            </PrimaryButton>
                        </EmptyState>
                    </div>
                )}

                {/* Stats Dashboard */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>INCOMING</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--warning)' }}>{stats.pending}</p>
                    </div>
                    <div className="stat-card" style={{ borderTop: '4px solid var(--primary)' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>COOKING</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>{stats.preparing}</p>
                    </div>
                    <div className="stat-card" style={{ borderTop: '4px solid var(--success)' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>READY</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--success)' }}>{stats.ready}</p>
                    </div>
                    <div className="stat-card" style={{ borderTop: '4px solid var(--text-muted)' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>DONE</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-secondary)' }}>{stats.completed}</p>
                    </div>
                </div>

                {/* Navigation / Filters */}
                <div className="filter-bar" style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem' }}>
                    {['All', 'Pending', 'Preparing', 'Ready', 'Completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`filter-pill ${filter === f ? 'filter-pill-active' : ''}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Orders Grid - Grouped if filter is "All" */}
                {filter === 'All' ? (
                    <>
                        {stats.pending > 0 && (
                            <div className="section-title"><Inbox color="var(--warning)" size={20} /> New Orders ({stats.pending})</div>
                        )}
                        <div className="orders-grid">
                            {orders.filter(o => o.status === 'pending').map(o => <OrderCard key={o._id} order={o} />)}
                        </div>

                        {stats.preparing > 0 && (
                            <div className="section-title"><Flame color="var(--primary)" size={20} /> In Preparation ({stats.preparing})</div>
                        )}
                        <div className="orders-grid">
                            {orders.filter(o => o.status === 'preparing').map(o => <OrderCard key={o._id} order={o} />)}
                        </div>

                        {stats.ready > 0 && (
                            <div className="section-title"><PackageCheck color="var(--success)" size={20} /> Ready for Pickup ({stats.ready})</div>
                        )}
                        <div className="orders-grid">
                            {orders.filter(o => o.status === 'ready').map(o => <OrderCard key={o._id} order={o} />)}
                        </div>
                    </>
                ) : (
                    <div className="orders-grid">
                        {filteredOrders.length === 0 ? (
                            <EmptyState icon={ChefHat} title={`No ${filter.toLowerCase()} orders`} className="empty-state-sm" />
                        ) : (
                            filteredOrders.map(o => <OrderCard key={o._id} order={o} />)
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KitchenView;
