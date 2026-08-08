import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, RefreshCw, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useWebSocket } from '../context/WebSocketContext';
import { StatusChip, EmptyState, ErrorDisplay, LoadingContainer, PrimaryButton } from '../components/ui';
import API_URL from '../apiConfig';

const STATUS_MAP = {
  pending:   { color: 'var(--warning)', icon: Clock,      label: 'Order Placed',      progress: 25, desc: 'Waiting for confirmation' },
  preparing: { color: 'var(--primary)', icon: Package,    label: 'Preparing',          progress: 50, desc: 'Chef is cooking your meal' },
  ready:     { color: 'var(--info)',    icon: Package,    label: 'Ready for Pickup',   progress: 75, desc: 'Order is packed & ready' },
  completed: { color: 'var(--success)', icon: Package,    label: 'Completed',          progress: 100, desc: 'Enjoy your meal!' },
};

const STATUS_BG = {
  pending:   'var(--warning-surface)',
  preparing: 'var(--danger-surface)',
  ready:     'var(--info-surface)',
  completed: 'var(--success-surface)',
};

const getStatus = (s) => STATUS_MAP[s] || { color: 'var(--text-secondary)', icon: Clock, label: s, progress: 0, desc: 'Status unknown' };

const VEG_STYLE = { width: 14, height: 14, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', flexShrink: 0 };

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { orderUpdates } = useWebSocket();

  const fetchOrders = useCallback(async () => {
    if (!user?.id) { setLoading(false); setRefreshing(false); return; }
    try {
      const res = await fetch(`${API_URL}/api/orders/mine`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.orders || [];
        setOrders(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setError(null);
      } else { setError('Failed to load orders'); }
    } catch { setError('Could not connect to server'); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user?.id, token]);

  useEffect(() => {
    if (!user?.id) return;
    fetchOrders();
    const id = setInterval(fetchOrders, 15000);
    return () => clearInterval(id);
  }, [user?.id, fetchOrders]);

  React.useEffect(() => {
    if (orderUpdates.length === 0) return;
    const latest = orderUpdates[0];
    setOrders(prev => prev.map(order =>
      order.id === latest.order.id
        ? { ...order, status: latest.order.status, updated_at: latest.order.updatedAt }
        : order
    ));
  }, [orderUpdates]);

  const handleReorder = (order) => {
    const unavailable = order.items.some(i => i.product?.isAvailable === false);
    if (unavailable) { toast.error('Some items are no longer available'); return; }
    order.items.forEach(item => {
      if (item.product) for (let i = 0; i < item.quantity; i++) addToCart(item.product);
    });
    toast.success('Items added to cart');
    navigate('/dashboard/cart');
  };

  const handleTrack = () => toast.info('Status tracking is real-time — your order updates automatically');
  const handleRate = () => toast.info('Rating feature coming soon!');

  const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
  const pastOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));
  const [activeTab, setActiveTab] = useState('active');
  const displayed = activeTab === 'active' ? activeOrders : pastOrders;

  if (loading) return <LoadingContainer />;
  if (error) return (
    <div className="empty-state" style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-lg)' }}>
      <ErrorDisplay>{error}</ErrorDisplay>
    </div>
  );

  return (
    <div style={{ padding: '2rem 1rem 8rem 1rem', color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', marginBottom: 'var(--space-2xs)' }}>Your Orders</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Track and view history</p>
        </div>
        <button onClick={() => { setRefreshing(true); fetchOrders(); }} disabled={refreshing} className="btn-icon" aria-label="Refresh orders">
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div role="tablist" style={{ display: 'flex', background: 'var(--surface)', padding: 'var(--space-2xs)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)', position: 'relative' }}>
        {['active', 'past'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} role="tab" aria-selected={activeTab === tab}
            style={{
              flex: 1, padding: 'var(--space-xs) var(--space-md)', border: 'none', borderRadius: 'var(--radius-md)',
              background: activeTab === tab ? 'rgba(255,255,255,0.05)' : 'transparent',
              color: activeTab === tab ? 'var(--text-main)' : 'var(--text-secondary)',
              fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', cursor: 'pointer',
            }}>
            {tab === 'active' ? `Current Orders (${activeOrders.length})` : `Order History (${pastOrders.length})`}
          </button>
        ))}
        <div style={{
          position: 'absolute', bottom: 'var(--space-2xs)',
          left: activeTab === 'active' ? 'var(--space-2xs)' : 'calc(50% + 3px)',
          width: 'calc(50% - 9px)', height: 2, borderRadius: 2,
          background: 'var(--primary)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          icon={Package}
          title={activeTab === 'active' ? 'No active orders' : 'No order history'}
          description={activeTab === 'active' ? "You don't have any ongoing orders at the moment." : "Your order history is empty."}
        >
          <PrimaryButton onClick={() => navigate('/dashboard/menu')} style={{ marginTop: 'var(--space-sm)' }}>Browse Menu</PrimaryButton>
        </EmptyState>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {displayed.map((order, idx) => {
            const st = getStatus(order.status);
            const date = new Date(order.createdAt);
            const isComplete = order.status === 'completed';

            return (
              <div key={order._id} className="glass-card-sm animate-slideInUp"
                style={{ padding: 'var(--space-md)', animationDelay: `${idx * 0.1}s` }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <div style={{ background: 'var(--surface)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-lg)', height: 'fit-content' }}>
                      <Package size={24} color={st.color} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)', marginBottom: 4 }}>
                        {order.items.map(i => i.product?.name).join(', ').slice(0, 25) + (order.items.length > 1 ? '...' : '')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                        <Clock size={12} />
                        <span>{date.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <StatusChip status={order.status} />
                </div>

                {/* Progress */}
                <div style={{ height: 4, background: 'var(--surface)', borderRadius: 2, overflow: 'hidden', margin: 'var(--space-sm) 0' }}>
                  <div style={{ height: '100%', width: `${st.progress}%`, background: st.color, boxShadow: `0 0 10px ${st.color}`, transition: 'width 1s ease-in-out' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)', color: st.color, marginBottom: 'var(--space-md)' }}>
                  <span style={{ fontWeight: 'var(--weight-semibold)' }}>{st.label}</span>
                  <span style={{ opacity: 0.8 }}>{st.desc}</span>
                </div>

                {/* Items */}
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)', marginBottom: i < order.items.length - 1 ? 'var(--space-xs)' : 0, color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                        <div style={{ ...VEG_STYLE, border: `1.5px solid ${item.product?.isVeg !== false ? 'var(--success)' : 'var(--danger)'}` }}>
                          {item.product?.isVeg !== false
                            ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                            : <div style={{ width: 0, height: 0, borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderBottom: '5px solid var(--danger)' }} />}
                        </div>
                        <span><span style={{ color: 'var(--text-muted)', marginRight: 8 }}>{item.quantity}x</span>{item.product?.name || 'Item'}</span>
                      </div>
                      <span>₹{(item.price || 0) * item.quantity}</span>
                    </div>
                  ))}
                  <div className="divider" style={{ margin: 'var(--space-xs) 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'var(--weight-bold)' }}>
                    <span>Total Paid</span><span style={{ color: 'var(--primary)' }}>₹{order.totalAmount}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <button onClick={() => handleReorder(order)} className="btn-secondary" style={{ flex: 1, fontSize: 'var(--text-sm)' }}>
                    <RefreshCw size={16} /> Reorder
                  </button>
                  <button
                    onClick={isComplete ? handleRate : handleTrack}
                    className="btn-primary"
                    style={{ flex: 2, fontSize: 'var(--text-sm)' }}
                  >
                    {isComplete ? 'Rate Order' : 'Track Status'}
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
