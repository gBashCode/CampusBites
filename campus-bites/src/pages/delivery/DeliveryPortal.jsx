import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, RefreshCw, Clock, Bike, CheckCircle2, Package, Inbox, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import API_URL from '../../apiConfig';
import { StatusChip, PrimaryButton, EmptyState } from '../../components/ui';

const DeliveryPortal = () => {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('All');
    const { logout, user, token } = useAuth();
    const navigate = useNavigate();

    const fetchOrders = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`${API_URL}/api/orders/delivery/active`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            // Fetch failed silently
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
        try {
            const endpoint = newStatus === 'completed' 
                ? `${API_URL}/api/orders/delivery/${orderId}/complete`
                : `${API_URL}/api/orders/${orderId}/status`;
            
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchOrders();
        } catch (err) {
            alert('Update failed');
        }
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
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0 0 2px 0', letterSpacing: '1px', fontWeight: 700 }}>DELIVERY TICKET</p>
                    <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'white', margin: 0 }}>#{order._id.slice(-6).toUpperCase()}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: 600 }}>
                        Ordered: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0 0 2px 0', letterSpacing: '1px', fontWeight: 700 }}>STATUS</p>
                    <div style={{ marginTop: '4px' }}>
                        <StatusChip status={order.status} />
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem', minHeight: '80px' }}>
                {/* Destination & Customer Details */}
                <div style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.06)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: 'var(--space-sm)', 
                    marginBottom: 'var(--space-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={18} color="var(--warning)" />
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FDE68A' }}>
                            {order.cabinNumber ? `Cabin ${order.cabinNumber}` : 'Self Pickup'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--warning-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>👤</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{order.user?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.user?.department || 'Student'}</div>
                        </div>
                        {order.user?.phone && (
                            <a href={`tel:${order.user.phone}`} style={{ 
                                background: 'var(--success-surface)', 
                                border: '1px solid var(--success-border)', 
                                padding: '6px', 
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Phone size={16} color="var(--success)" />
                            </a>
                        )}
                    </div>
                </div>

                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Order Contents:</p>
                {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: '0.75rem' }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: 'var(--warning-surface)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            color: 'var(--warning)',
                            border: '1px solid var(--warning-border)'
                        }}>
                            {item.quantity}
                        </div>
                        <span style={{ color: '#E5E7EB', fontWeight: 500, fontSize: '0.95rem' }}>{item.product?.name || 'Item'}</span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 'auto' }}>
                {order.status === 'ready' ? (
                    <PrimaryButton
                        onClick={() => updateStatus(order._id, 'completed')}
                        style={{ backgroundColor: 'var(--success)', color: 'white', width: '100%', boxShadow: '0 8px 20px rgba(34, 197, 94, 0.2)' }}
                    >
                        Mark as Delivered
                    </PrimaryButton>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '0.8rem',
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                    }}>
                        {order.status === 'completed' ? 'Successfully Delivered' : 'Waiting for Kitchen...'}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-deep)', color: 'white', position: 'relative', overflowX: 'hidden' }}>
            <div className="floating-emoji" style={{ top: '10%', right: '5%' }}>🚴</div>
            <div className="floating-emoji" style={{ top: '60%', left: '3%' }}>📦</div>
            <div className="floating-emoji" style={{ bottom: '10%', right: '15%' }}>🚀</div>

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
                        background: 'linear-gradient(135deg, var(--warning) 0%, #D97706 100%)',
                        padding: '8px',
                        borderRadius: '10px',
                        boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
                    }}>
                        <Bike color="white" size={20} />
                    </div>
                    <div>
                        <h1 className="header-title" style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Delivery</h1>
                        <p className="header-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Portal v2.0</p>
                    </div>
                </div>

                <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={fetchOrders} style={{
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
                    <button onClick={() => { logout(); navigate('/'); }} className="btn-icon" style={{
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
                <div className="stats-grid">
                    <div className="stat-card">
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>QUEUED</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--warning)' }}>{stats.pending + stats.preparing}</p>
                    </div>
                    <div className="stat-card" style={{ borderTop: '4px solid var(--success)' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>READY TO GO</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--success)' }}>{stats.ready}</p>
                    </div>
                    <div className="stat-card" style={{ borderTop: '4px solid var(--text-muted)' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>DELIVERED</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-secondary)' }}>{stats.completed}</p>
                    </div>
                </div>

                <div className="filter-bar" style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem' }}>
                    {['All', 'Ready', 'Preparing', 'Completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`filter-pill ${filter === f ? 'filter-pill-active' : ''}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {filter === 'All' ? (
                    <>
                        {stats.ready > 0 && (
                            <div className="section-title"><CheckCircle2 color="var(--success)" size={20} /> Ready for Delivery ({stats.ready})</div>
                        )}
                        <div className="orders-grid">
                            {orders.filter(o => o.status === 'ready').map(o => <OrderCard key={o._id} order={o} />)}
                        </div>

                        {(stats.pending + stats.preparing) > 0 && (
                            <div className="section-title"><Clock color="var(--warning)" size={20} /> Kitchen Queue ({stats.pending + stats.preparing})</div>
                        )}
                        <div className="orders-grid">
                            {orders.filter(o => o.status === 'pending' || o.status === 'preparing').map(o => <OrderCard key={o._id} order={o} />)}
                        </div>
                    </>
                ) : (
                    <div className="orders-grid">
                        {filteredOrders.length === 0 ? (
                            <EmptyState icon={Package} title={`No ${filter.toLowerCase()} orders`} className="empty-state-sm" />
                        ) : (
                            filteredOrders.map(o => <OrderCard key={o._id} order={o} />)
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryPortal;
