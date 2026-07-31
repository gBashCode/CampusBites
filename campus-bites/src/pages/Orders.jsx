import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Clock, CheckCircle, Package, ChefHat, RefreshCw,
    Calendar, ShoppingBag, Utensils
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { StatusChip, EmptyState, ErrorDisplay, LoadingContainer, PrimaryButton } from '../components/ui';

import API_URL from '../apiConfig';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const { user, token } = useAuth();
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const toast = useToast();

    const fetchOrders = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/orders/mine`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const orderList = Array.isArray(data) ? data : data.orders || [];
                setOrders(orderList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
                setError(null);
            } else {
                setError('Failed to load orders');
            }
        } catch (err) {
            setError('Could not connect to server');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id, token]);

    useEffect(() => {
        if (user?.id) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 15000);
            return () => clearInterval(interval);
        }
    }, [user?.id, fetchOrders]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const handleReorder = (order) => {
        const hasUnavailable = order.items.some(item => item.product && item.product.isAvailable === false);
        if (hasUnavailable) {
            toast.error('Some items are no longer available');
            return;
        }
        order.items.forEach(item => {
            if (item.product) {
                for (let i = 0; i < item.quantity; i++) {
                    addToCart(item.product);
                }
            }
        });
        toast.success('Items added to cart');
        navigate('/dashboard/cart');
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending':
                return {
                    color: '#F59E0B',
                    icon: Clock,
                    label: 'Order Placed',
                    progress: 25,
                    desc: 'Waiting for confirmation'
                };
            case 'preparing':
                return {
                    color: '#E23744',
                    icon: ChefHat,
                    label: 'Preparing',
                    progress: 50,
                    desc: 'Chef is cooking your meal'
                };
            case 'ready':
                return {
                    color: '#3B82F6',
                    icon: Package,
                    label: 'Ready for Pickup',
                    progress: 75,
                    desc: 'Order is packed & ready'
                };
            case 'completed':
                return {
                    color: '#22C55E',
                    icon: CheckCircle,
                    label: 'Completed',
                    progress: 100,
                    desc: 'Enjoy your meal!'
                };
            default:
                return {
                    color: '#9CA3AF',
                    icon: Clock,
                    label: status,
                    progress: 0,
                    desc: 'Status unknown'
                };
        }
    };

    const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
    const pastOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'
    const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

    if (loading) return <LoadingContainer />;

    if (error) return (
        <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
            <ErrorDisplay>{error}</ErrorDisplay>
        </div>
    );

    return (
        <div style={{ padding: '2rem 1rem 8rem 1rem', color: 'white' }}>
            <style>{`
                .order-card {
                    animation: slideUp 0.5s ease-out;
                    animation-fill-mode: both;
                }
                .status-line {
                    height: 4px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 2px;
                    overflow: hidden;
                    margin: 1rem 0;
                }
                .status-progress {
                    height: 100%;
                    transition: width 1s ease-in-out;
                }
                .refresh-btn {
                    transition: all 0.3s ease;
                }
                .refresh-btn:hover {
                    transform: rotate(180deg);
                    color: #E23744;
                }
                .tab-btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    background: transparent;
                    color: #9CA3AF;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border-radius: 12px;
                    font-size: 0.95rem;
                }
                .tab-btn.active {
                    color: white;
                    background: rgba(255, 255, 255, 0.05);
                }
                .tab-indicator {
                    position: absolute;
                    bottom: 0;
                    height: 2px;
                    background: #E23744;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border-radius: 2px;
                }
            `}</style>

            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>Your Orders</h1>
                    <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Track and view history</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="refresh-btn"
                    aria-label="Refresh orders"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '50%',
                        cursor: 'pointer'
                    }}
                >
                    <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.02)',
                padding: '6px',
                borderRadius: '16px',
                marginBottom: '2rem',
                position: 'relative'
            }}>
                <button
                    className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                    style={{ flex: 1 }}
                >
                    Current Orders ({activeOrders.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                    onClick={() => setActiveTab('past')}
                    style={{ flex: 1 }}
                >
                    Order History ({pastOrders.length})
                </button>
                <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: activeTab === 'active' ? '6px' : 'calc(50% + 3px)',
                    width: 'calc(50% - 9px)',
                    height: '2px',
                    background: '#E23744',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
            </div>

            {displayedOrders.length === 0 ? (
                <EmptyState
                    icon={ShoppingBag}
                    title={activeTab === 'active' ? 'No active orders' : 'No order history'}
                    description={activeTab === 'active' ? "You don't have any ongoing orders at the moment." : "Your order history is empty."}
                >
                    <PrimaryButton onClick={() => navigate('/dashboard/menu')} style={{ marginTop: '1rem' }}>
                        Browse Menu
                    </PrimaryButton>
                </EmptyState>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {displayedOrders.map((order, idx) => {
                        const status = getStatusConfig(order.status);
                        const StatusIcon = status.icon;
                        const date = new Date(order.createdAt);

                        return (
                            <div
                                key={order._id}
                                className="glass-panel order-card"
                                style={{
                                    padding: '1.5rem',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    animationDelay: `${idx * 0.1}s`
                                }}
                            >
                                {/* Order Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '12px',
                                            borderRadius: '16px',
                                            height: 'fit-content'
                                        }}>
                                            <Utensils size={24} color={status.color} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
                                                {order.items.map(i => i.product?.name).join(', ').slice(0, 25) + (order.items.length > 1 ? '...' : '')}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', fontSize: '0.8rem' }}>
                                                <Calendar size={12} />
                                                <span>{date.toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        background: `rgba(${status.color === '#22C55E' ? '34, 197, 94' : '239, 68, 68'}, 0.1)`,
                                        color: status.color,
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <StatusChip status={order.status} />
                                    </div>
                                </div>

                                {/* Status Bar */}
                                <div className="status-line">
                                    <div
                                        className="status-progress"
                                        style={{
                                            width: `${status.progress}%`,
                                            background: status.color,
                                            boxShadow: `0 0 10px ${status.color}`
                                        }}
                                    />
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.85rem',
                                    color: status.color,
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <StatusIcon size={14} />
                                        <span style={{ fontWeight: 600 }}>{status.label}</span>
                                    </div>
                                    <span style={{ opacity: 0.8 }}>{status.desc}</span>
                                </div>

                                {/* Items Summary */}
                                <div style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '16px',
                                    padding: '1rem',
                                    marginBottom: '1rem'
                                }}>
                                    {order.items.map((item, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontSize: '0.9rem',
                                            marginBottom: i < order.items.length - 1 ? '0.5rem' : 0,
                                            color: '#D1D5DB'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {/* Veg/Non-Veg Badge */}
                                                <div style={{
                                                    width: '14px',
                                                    height: '14px',
                                                    border: `1.5px solid ${item.product?.isVeg !== false ? '#22C55E' : '#EF4444'}`,
                                                    borderRadius: '2px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: 'white',
                                                    flexShrink: 0
                                                }}>
                                                    {item.product?.isVeg !== false ? (
                                                        <div style={{
                                                            width: '6px',
                                                            height: '6px',
                                                            borderRadius: '50%',
                                                            background: '#22C55E'
                                                        }} />
                                                    ) : (
                                                        <div style={{
                                                            width: 0,
                                                            height: 0,
                                                            borderLeft: '3px solid transparent',
                                                            borderRight: '3px solid transparent',
                                                            borderBottom: '5px solid #EF4444'
                                                        }} />
                                                    )}
                                                </div>
                                                <span>
                                                    <span style={{ color: '#9CA3AF', marginRight: '8px' }}>{item.quantity}x</span>
                                                    {item.product?.name || 'Item'}
                                                </span>
                                            </div>
                                            <span>₹{(item.price || 0) * item.quantity}</span>
                                        </div>
                                    ))}
                                    <div style={{
                                        borderTop: '1px solid rgba(255,255,255,0.1)',
                                        marginTop: '0.75rem',
                                        paddingTop: '0.75rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontWeight: 700
                                    }}>
                                        <span>Total Paid</span>
                                        <span style={{ color: '#E23744' }}>₹{order.totalAmount}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => handleReorder(order)}
                                        style={{
                                            flex: 1,
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white',
                                            padding: '0.8rem',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <RefreshCw size={16} /> Reorder
                                    </button>
                                    <button
                                        aria-label={status.progress < 100 ? 'Track order status' : 'Rate this order'}
                                        style={{
                                        flex: 2,
                                        background: 'linear-gradient(135deg, #E23744 0%, #DC2626 100%)',
                                        border: 'none',
                                        color: 'white',
                                        padding: '0.8rem',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        boxShadow: '0 4px 12px rgba(226, 55, 68, 0.3)'
                                    }}>
                                        {status.progress < 100 ? 'Track Status' : 'Rate Order'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Orders;
