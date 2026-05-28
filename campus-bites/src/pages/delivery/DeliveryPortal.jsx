import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, RefreshCw, Clock, Bike, CheckCircle2, Package, Inbox, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import API_URL from '../../apiConfig';

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
            console.error('Fetch error', err);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                    <p style={{ fontSize: '0.65rem', color: '#6B7280', margin: '0 0 2px 0', letterSpacing: '1px', fontWeight: 700 }}>DELIVERY TICKET</p>
                    <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'white', margin: 0 }}>#{order._id.slice(-6).toUpperCase()}</p>
                    <p style={{ fontSize: '0.7rem', color: '#9CA3AF', margin: '4px 0 0 0', fontWeight: 600 }}>
                        Ordered: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.65rem', color: '#6B7280', margin: '0 0 2px 0', letterSpacing: '1px', fontWeight: 700 }}>STATUS</p>
                    <div style={{
                        background: order.status === 'ready' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: `1px solid ${order.status === 'ready' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                        marginTop: '4px'
                    }}>
                        <p style={{ fontWeight: 800, color: order.status === 'ready' ? '#22C55E' : '#F59E0B', margin: 0, fontSize: '0.9rem', textTransform: 'uppercase' }}>
                            {order.status}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem', minHeight: '80px' }}>
                {/* Destination & Customer Details */}
                <div style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.06)', 
                    borderRadius: '12px', 
                    padding: '12px', 
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={18} color="#F59E0B" />
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FDE68A' }}>
                            {order.cabinNumber ? `Cabin ${order.cabinNumber}` : 'Self Pickup'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>👤</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{order.user?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{order.user?.department || 'Student'}</div>
                        </div>
                        {order.user?.phone && (
                            <a href={`tel:${order.user.phone}`} style={{ 
                                background: 'rgba(34, 197, 94, 0.1)', 
                                border: '1px solid rgba(34, 197, 94, 0.2)', 
                                padding: '6px', 
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Phone size={16} color="#22C55E" />
                            </a>
                        )}
                    </div>
                </div>

                <p style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Order Contents:</p>
                {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            color: '#F59E0B',
                            border: '1px solid rgba(245, 158, 11, 0.2)'
                        }}>
                            {item.quantity}
                        </div>
                        <span style={{ color: '#E5E7EB', fontWeight: 500, fontSize: '0.95rem' }}>{item.product?.name || 'Item'}</span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 'auto' }}>
                {order.status === 'ready' ? (
                    <button
                        onClick={() => updateStatus(order._id, 'completed')}
                        className="btn-action"
                        style={{ backgroundColor: '#22C55E', color: 'white', width: '100%', boxShadow: '0 8px 20px rgba(34, 197, 94, 0.2)' }}
                    >
                        Mark as Delivered
                    </button>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '0.8rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        color: '#9CA3AF',
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
        <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', color: 'white', position: 'relative', overflowX: 'hidden' }}>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(5deg); }
                }
                .floating-emoji {
                    position: absolute;
                    font-size: 3.5rem;
                    opacity: 0.1;
                    pointer-events: none;
                    animation: float 8s ease-in-out infinite;
                    z-index: 1;
                }
                .glass-card {
                    background: rgba(26, 26, 28, 0.95);
                    border-radius: 1.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                    position: relative;
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                }
                .glass-card:hover {
                    border-color: rgba(245, 158, 11, 0.3);
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                }
                .stat-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 1.25rem;
                    padding: 1.5rem;
                    text-align: center;
                    transition: all 0.3s ease;
                }
                .stat-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
                .btn-action {
                    padding: 0.8rem 1.2rem;
                    border-radius: 12px;
                    border: none;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    justifyContent: center;
                    gap: 8px;
                }
                .btn-action:hover {
                    filter: brightness(1.1);
                    transform: scale(1.02);
                }
                .filter-pill {
                    padding: 0.6rem 1.5rem;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.1);
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }
                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 1.25rem;
                    font-weight: 800;
                    margin: 3rem 0 1.5rem 0;
                    color: white;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .orders-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
                    gap: 2rem;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }
                .main-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2.5rem;
                }
                
                @media (max-width: 768px) {
                    .main-container { padding: 1.5rem; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
                    .orders-grid { grid-template-columns: 1fr; gap: 1.5rem; }
                    .header-title { font-size: 1.2rem !important; }
                    .header-subtitle { font-size: 0.7rem !important; }
                    .filter-bar { overflow-x: auto; padding-bottom: 5px; }
                    .section-title { font-size: 1rem; margin: 2rem 0 1rem 0; }
                }
            `}</style>

            <div className="floating-emoji" style={{ top: '10%', right: '5%' }}>🚴</div>
            <div className="floating-emoji" style={{ top: '60%', left: '3%' }}>📦</div>
            <div className="floating-emoji" style={{ bottom: '10%', right: '15%' }}>🚀</div>

            <header style={{
                background: '#111111',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        padding: '8px',
                        borderRadius: '10px',
                        boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
                    }}>
                        <Bike color="white" size={20} />
                    </div>
                    <div>
                        <h1 className="header-title" style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Delivery</h1>
                        <p className="header-subtitle" style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>Portal v2.0</p>
                    </div>
                </div>

                <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={fetchOrders} style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        padding: '0.6rem 1rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600
                    }}>
                        <RefreshCw size={18} /> <span>Sync</span>
                    </button>
                    <button onClick={() => { logout(); navigate('/login'); }} style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#F87171',
                        padding: '0.6rem 1rem',
                        borderRadius: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}><LogOut size={18} /></button>
                </div>
            </header>

            <div className="main-container">
                <div className="stats-grid">
                    <div className="stat-card">
                        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem', fontWeight: 600 }}>QUEUED</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#F59E0B' }}>{stats.pending + stats.preparing}</p>
                    </div>
                    <div className="stat-card" style={{ borderTop: '4px solid #22C55E' }}>
                        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem', fontWeight: 600 }}>READY TO GO</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#22C55E' }}>{stats.ready}</p>
                    </div>
                    <div className="stat-card" style={{ borderTop: '4px solid #6B7280' }}>
                        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem', fontWeight: 600 }}>DELIVERED</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#9CA3AF' }}>{stats.completed}</p>
                    </div>
                </div>

                <div className="filter-bar" style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem' }}>
                    {['All', 'Ready', 'Preparing', 'Completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className="filter-pill"
                            style={{
                                backgroundColor: filter === f ? '#F59E0B' : 'rgba(255,255,255,0.05)',
                                color: filter === f ? 'black' : '#9CA3AF',
                                borderColor: filter === f ? '#F59E0B' : 'rgba(255,255,255,0.1)'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {filter === 'All' ? (
                    <>
                        {stats.ready > 0 && (
                            <div className="section-title"><CheckCircle2 color="#22C55E" size={20} /> Ready for Delivery ({stats.ready})</div>
                        )}
                        <div className="orders-grid">
                            {orders.filter(o => o.status === 'ready').map(o => <OrderCard key={o._id} order={o} />)}
                        </div>

                        {(stats.pending + stats.preparing) > 0 && (
                            <div className="section-title"><Clock color="#F59E0B" size={20} /> Kitchen Queue ({stats.pending + stats.preparing})</div>
                        )}
                        <div className="orders-grid">
                            {orders.filter(o => o.status === 'pending' || o.status === 'preparing').map(o => <OrderCard key={o._id} order={o} />)}
                        </div>
                    </>
                ) : (
                    <div className="orders-grid">
                        {filteredOrders.length === 0 ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 0' }}>
                                <Package size={48} style={{ opacity: 0.1, color: 'white', marginBottom: '1rem' }} />
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>No {filter.toLowerCase()} orders</h2>
                            </div>
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
