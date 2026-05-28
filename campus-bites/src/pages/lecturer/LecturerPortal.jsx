import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Receipt, LogOut, Minus, Plus, Search } from 'lucide-react';
import API_URL from '../../apiConfig';

const LecturerPortal = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('menu');
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [orderLoading, setOrderLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const categories = ['All', 'Snacks', 'Meals', 'Beverages', 'Desserts'];
    const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const cartCount = cart.reduce((s, i) => s + i.qty, 0);
    const taxAmount = Math.round(cartTotal * 0.05);
    const finalTotal = cartTotal + taxAmount;

    useEffect(() => {
        fetch(`${API_URL}/api/products`).then(r => r.json()).then(d => { if (Array.isArray(d)) setProducts(d); }).catch(() => {});
    }, []);

    useEffect(() => {
        if (tab === 'orders' && token) {
            fetch(`${API_URL}/api/orders/mine`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(r => r.json()).then(d => { if (Array.isArray(d)) setOrders(d.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))); }).catch(() => {});
        }
    }, [tab, token]);

    const addToCart = (p) => setCart(prev => {
        const ex = prev.find(i => i._id === p._id);
        return ex ? prev.map(i => i._id === p._id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }];
    });

    const updateQty = (id, d) => setCart(prev => prev.map(i => i._id === id ? { ...i, qty: Math.max(0, i.qty + d) } : i).filter(i => i.qty > 0));

    const placeOrder = async () => {
        if (!cart.length) return;
        setOrderLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/orders/razorpay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: finalTotal })
            });
            const rzpOrder = await res.json();
            if (!res.ok) throw new Error(rzpOrder.message);

            new window.Razorpay({
                key: rzpOrder.key_id, amount: rzpOrder.amount, currency: rzpOrder.currency,
                name: 'Campus Bites', description: `Cabin ${user.cabinNumber} Delivery`, order_id: rzpOrder.id,
                handler: async (response) => {
                    const verify = await fetch(`${API_URL}/api/orders/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderData: { items: cart.map(i => ({ product: i._id, quantity: i.qty, price: i.price })), totalAmount: finalTotal, deliveryType: 'cabin', cabinNumber: user.cabinNumber, pickupTime: 'Cabin Delivery' }
                        })
                    });
                    if (verify.ok) { setCart([]); setSuccessMsg(`✅ Order placed! Delivering to Cabin ${user.cabinNumber}`); setTab('orders'); setTimeout(() => setSuccessMsg(''), 5000); }
                    else alert('Payment verification failed');
                },
                prefill: { name: user.name, email: user.email }, theme: { color: '#E23744' }
            }).open();
        } catch (err) { alert(err.message || 'Checkout failed'); }
        finally { setOrderLoading(false); }
    };

    const filtered = products.filter(p =>
        p.isAvailable !== false &&
        (category === 'All' || p.category === category) &&
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const statusColor = { pending: '#F59E0B', preparing: '#3B82F6', ready: '#10B981', completed: '#6B7280', cancelled: '#EF4444' };

    return (
        <div style={{ minHeight: '100vh', background: '#0D0D0D', color: 'white', paddingBottom: 100, fontFamily: "'Inter',sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                @keyframes slideDown { from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)} }
                @keyframes fadeIn { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
                @keyframes spin { to{transform:rotate(360deg)} }
                .glass-panel { background:rgba(26,26,28,0.9);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08); }
                .lec-card { background:rgba(26,26,28,0.8);border:1px solid rgba(255,255,255,0.06);border-radius:1rem;transition:all 0.2s ease;animation:fadeIn 0.4s ease both; }
                .lec-card:hover { border-color:rgba(226,55,68,0.2);transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,0.4); }
                .lec-search { width:100%;padding:0.85rem 1rem 0.85rem 2.8rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:0.85rem;color:white;font-size:0.95rem;outline:none;font-family:'Inter',sans-serif;transition:all 0.3s; }
                .lec-search:focus { border-color:#E23744;background:rgba(226,55,68,0.05); }
                .lec-search::placeholder { color:#6B7280; }
                .cat-btn { padding:0.5rem 1.1rem;border-radius:2rem;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#9CA3AF;font-size:0.82rem;font-weight:500;cursor:pointer;transition:all 0.2s;font-family:'Inter',sans-serif;white-space:nowrap; }
                .cat-btn.active { background:rgba(226,55,68,0.15);border-color:rgba(226,55,68,0.4);color:#E23744; }
                .qty-btn { width:30px;height:30px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;font-size:16px; }
                .add-btn { width:100%;padding:0.6rem;background:linear-gradient(135deg,#E23744,#DC2626);border:none;color:white;border-radius:0.6rem;cursor:pointer;font-size:0.8rem;font-weight:600;font-family:'Inter',sans-serif;transition:all 0.2s; }
                .add-btn:hover { transform:translateY(-1px);box-shadow:0 4px 15px rgba(226,55,68,0.3); }
                .checkout-btn { width:100%;padding:1rem;background:linear-gradient(135deg,#E23744,#DC2626);border:none;color:white;border-radius:1rem;font-size:1.05rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;box-shadow:0 10px 30px rgba(226,55,68,0.3);display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.3s; }
                .checkout-btn:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 15px 40px rgba(226,55,68,0.4); }
                .checkout-btn:disabled { opacity:0.7;cursor:not-allowed; }
                .nav-item { flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 0;border:none;background:transparent;cursor:pointer;color:#9CA3AF;font-size:10px;font-family:'Inter',sans-serif;font-weight:500;transition:all 0.3s; }
                .nav-item.active { color:#E23744; }
            `}</style>

            {/* Header */}
            <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 18, background: 'linear-gradient(135deg,#E23744,#F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Campus Bites</div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
                        {user?.name} · Cabin <span style={{ color: '#E23744', fontWeight: 700 }}>{user?.cabinNumber}</span>
                        {user?.department ? ` · ${user.department}` : ''}
                    </div>
                </div>
                <button onClick={() => { logout(); navigate('/lecturer'); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#9CA3AF', padding: '7px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Inter',sans-serif" }}>
                    <LogOut size={14} /> Sign Out
                </button>
            </div>

            <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px' }}>

                {successMsg && (
                    <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '0.85rem', padding: '12px 16px', color: '#86EFAC', fontSize: 14, marginBottom: 16, animation: 'slideDown 0.3s ease' }}>
                        {successMsg}
                    </div>
                )}

                {/* MENU */}
                {tab === 'menu' && (
                    <div>
                        <div style={{ position: 'relative', marginBottom: 12 }}>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                            <input className="lec-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search food..." />
                        </div>
                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
                            {categories.map(c => <button key={c} className={`cat-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>)}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                            {filtered.map((p, idx) => {
                                const inCart = cart.find(i => i._id === p._id);
                                return (
                                    <div key={p._id} className="lec-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                                        <div style={{ position: 'relative' }}>
                                            <img src={p.image || 'https://via.placeholder.com/200x120?text=Food'} alt={p.name} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: '1rem 1rem 0 0' }} />
                                            <span style={{ position: 'absolute', top: 8, left: 8, background: p.isVeg ? '#16A34A' : '#DC2626', borderRadius: 4, width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span style={{ width: 6, height: 6, background: 'white', borderRadius: '50%', display: 'block' }} />
                                            </span>
                                        </div>
                                        <div style={{ padding: '10px 12px 12px' }}>
                                            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, lineHeight: 1.3 }}>{p.name}</div>
                                            <div style={{ color: '#E23744', fontWeight: 700, fontSize: 14, marginBottom: 10 }}>₹{p.price}</div>
                                            {inCart ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <button className="qty-btn" onClick={() => updateQty(p._id, -1)} style={{ background: 'rgba(226,55,68,0.15)', color: '#E23744' }}><Minus size={14} /></button>
                                                    <span style={{ fontWeight: 700, flex: 1, textAlign: 'center' }}>{inCart.qty}</span>
                                                    <button className="qty-btn" onClick={() => updateQty(p._id, 1)} style={{ background: '#E23744', color: 'white' }}><Plus size={14} /></button>
                                                </div>
                                            ) : (
                                                <button className="add-btn" onClick={() => addToCart(p)}>Add +</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#6B7280', marginTop: 60, fontSize: 15 }}>No items found</p>}
                    </div>
                )}

                {/* CART */}
                {tab === 'cart' && (
                    <div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Your Cart</h2>
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
                                <ShoppingBag size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                                <p style={{ fontSize: 16, marginBottom: 16 }}>Your cart is empty</p>
                                <button onClick={() => setTab('menu')} style={{ background: 'linear-gradient(135deg,#E23744,#DC2626)', border: 'none', color: 'white', padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>Browse Menu</button>
                            </div>
                        ) : (
                            <>
                                {/* Cabin Info */}
                                <div className="lec-card" style={{ padding: '14px 16px', marginBottom: 16, background: 'rgba(226,55,68,0.07)', borderColor: 'rgba(226,55,68,0.2)' }}>
                                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>🚪 Delivering to</div>
                                    <div style={{ fontWeight: 700, fontSize: 17, color: '#E23744' }}>Cabin {user?.cabinNumber}</div>
                                    {user?.department && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{user.department}</div>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                                    {cart.map(item => (
                                        <div key={item._id} className="lec-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <img src={item.image || 'https://via.placeholder.com/50?text=F'} alt={item.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                                <div style={{ color: '#E23744', fontWeight: 700, fontSize: 13 }}>₹{item.price}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                                <button className="qty-btn" onClick={() => updateQty(item._id, -1)} style={{ background: 'rgba(255,255,255,0.07)', color: 'white' }}><Minus size={14} /></button>
                                                <span style={{ fontWeight: 700, width: 20, textAlign: 'center' }}>{item.qty}</span>
                                                <button className="qty-btn" onClick={() => updateQty(item._id, 1)} style={{ background: '#E23744', color: 'white' }}><Plus size={14} /></button>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: 14, color: 'white', minWidth: 48, textAlign: 'right', flexShrink: 0 }}>₹{item.price * item.qty}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="lec-card" style={{ padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#6B7280', fontSize: 14 }}>
                                        <span>Subtotal ({cartCount} items)</span><span>₹{cartTotal}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: '#6B7280', fontSize: 14 }}>
                                        <span>Tax (5%)</span><span>₹{taxAmount}</span>
                                    </div>
                                    <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 16 }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontWeight: 700, fontSize: 17 }}>
                                        <span>Total</span><span style={{ color: '#E23744' }}>₹{finalTotal}</span>
                                    </div>
                                    <button className="checkout-btn" onClick={placeOrder} disabled={orderLoading}>
                                        {orderLoading ? <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span> : `🚪 Pay & Deliver to Cabin ${user?.cabinNumber}`}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ORDERS */}
                {tab === 'orders' && (
                    <div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>My Orders</h2>
                        {orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
                                <Receipt size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                                <p style={{ fontSize: 16 }}>No orders yet</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {orders.map(order => {
                                    const sc = statusColor[order.status] || '#6B7280';
                                    return (
                                        <div key={order._id} className="lec-card" style={{ padding: 16 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                                <div style={{ fontSize: 12, color: '#6B7280' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                                                <span style={{ background: sc + '22', color: sc, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${sc}44`, textTransform: 'capitalize' }}>{order.status}</span>
                                            </div>
                                            {order.cabinNumber && <div style={{ color: '#E23744', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>🚪 Cabin · {order.cabinNumber}</div>}
                                            <div style={{ color: '#6B7280', fontSize: 13, marginBottom: 8 }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</div>
                                            <div style={{ fontWeight: 700, fontSize: 17, color: 'white' }}>₹{order.totalAmount}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Floating Dock Nav — same as student Dashboard */}
            <nav style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 400, zIndex: 1000 }}>
                <div className="glass-panel" style={{ borderRadius: 24, padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                    {[
                        { key: 'menu', icon: Home, label: 'Menu' },
                        { key: 'cart', icon: ShoppingBag, label: `Cart${cartCount > 0 ? ` (${cartCount})` : ''}`, badge: cartCount },
                        { key: 'orders', icon: Receipt, label: 'Orders' },
                    ].map(item => {
                        const active = tab === item.key;
                        const Icon = item.icon;
                        return (
                            <button key={item.key} className={`nav-item ${active ? 'active' : ''}`} onClick={() => setTab(item.key)}>
                                <div style={{ position: 'relative', transform: active ? 'translateY(-4px)' : 'none', transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
                                    <Icon size={24} style={{ filter: active ? 'drop-shadow(0 0 8px rgba(226,55,68,0.5))' : 'none' }} />
                                    {item.badge > 0 && (
                                        <span style={{ position: 'absolute', top: -6, right: -6, background: '#E23744', color: 'white', fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #1C1C1E' }}>{item.badge}</span>
                                    )}
                                </div>
                                <span style={{ fontSize: 10, opacity: active ? 1 : 0, transform: active ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.3s ease', position: 'absolute', bottom: -16, whiteSpace: 'nowrap' }}>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default LecturerPortal;
