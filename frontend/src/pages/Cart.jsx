import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Minus, Plus, Clock, Heart, ShoppingCart, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, EmptyState } from '../components/ui';
import API_URL from '../apiConfig';

const VEG_STYLE = {
  width: '14px', height: '14px', borderRadius: '2px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'white', flexShrink: 0,
};
const VEG_DOT = { width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' };
const NONVEG_TRI = { width: 0, height: 0, borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderBottom: '5px solid var(--danger)' };

const VegBadge = ({ isVeg, className = '' }) => (
  <div
    className={className}
    style={{ ...VEG_STYLE, border: `1.5px solid ${isVeg ? 'var(--success)' : 'var(--danger)'}` }}
  >
    {isVeg !== false ? <div style={VEG_DOT} /> : <div style={NONVEG_TRI} />}
  </div>
);

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const toast = useToast();
  const [pickupTime, setPickupTime] = useState('');
  const [isDonationChecked, setIsDonationChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isLecturer = user?.role === 'lecturer';
  React.useEffect(() => {
    if (isLecturer && !pickupTime) {
      setPickupTime(`Cabin ${user?.cabinNumber || 'Delivery'}`);
    }
  }, [isLecturer, pickupTime, user?.cabinNumber]);

  const taxAmount = Math.round(cartTotal * 0.05);
  const donationAmount = isDonationChecked ? 3 : 0;
  const finalTotal = cartTotal + taxAmount + donationAmount;

  const handleCheckout = async () => {
    if (!pickupTime) { toast.error('Please select a pickup time'); return; }
    if (!user || !token) { toast.error('Please log in to place an order'); navigate('/'); return; }

    setLoading(true);
    try {
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Payment system unavailable. Please try again later.');
      }

      const orderData = {
        items: cartItems.map(item => ({ product: item._id || item.id, quantity: item.quantity, price: item.price })),
        totalAmount: finalTotal, pickupTime, donation: donationAmount,
      };

      const razorpayRes = await fetch(`${API_URL}/api/orders/razorpay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: finalTotal }),
      });
      const ct = razorpayRes.headers.get('content-type') || '';
      const razorpayOrder = ct.includes('application/json') ? await razorpayRes.json() : {};
      if (!razorpayRes.ok) throw new Error(razorpayOrder.message || 'Payment init failed');

      const rzp = new window.Razorpay({
        key: razorpayOrder.key_id, amount: razorpayOrder.amount, currency: razorpayOrder.currency,
        name: 'Campus Bites', description: 'Canteen Order Payment', order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_URL}/api/orders/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ ...response, orderData }),
            });
            if (verifyRes.ok) { clearCart(); toast.success('Order placed successfully!'); navigate('/dashboard/orders'); }
            else { toast.error('Payment verification failed'); }
          } catch { toast.error('Error verifying payment'); }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: 'var(--primary)' },
      });
      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Failed to process checkout');
    } finally { setLoading(false); }
  };

  const convert12to24 = (time12h) => {
    if (!time12h) return '';
    try {
      const [time, modifier] = time12h.split(' ');
      let [hours, minutes] = time.split(':');
      let h = parseInt(hours, 10);
      if (modifier === 'PM' && h !== 12) h += 12;
      if (modifier === 'AM' && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${minutes}`;
    } catch { return ''; }
  };

  const parseClockHands = () => {
    const now = new Date();
    let hourDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
    let minuteDeg = now.getMinutes() * 6;
    if (pickupTime) {
      try {
        const [timePart, modifier] = pickupTime.split(' ');
        let [h, m] = timePart.split(':').map(Number);
        if (modifier === 'PM' && h !== 12) h += 12;
        if (modifier === 'AM' && h === 12) h = 0;
        hourDeg = (h % 12) * 30 + m * 0.5;
        minuteDeg = m * 6;
      } catch { /* keep defaults */ }
    }
    return { hourDeg, minuteDeg };
  };

  if (cartItems.length === 0) {
    return (
      <div className="empty-state" style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <EmptyState icon={ShoppingCart} title="Your Cart is Empty" description="Looks like you haven't added any delicious food yet.">
          <PrimaryButton onClick={() => navigate('/dashboard/menu')} style={{ marginTop: '1.5rem' }}>Browse Menu</PrimaryButton>
        </EmptyState>
      </div>
    );
  }

  const { hourDeg, minuteDeg } = parseClockHands();

  return (
    <div style={{ padding: '2rem 1rem 8rem 1rem', color: 'white' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', marginBottom: 'var(--space-lg)' }}>Cart</h1>

      {/* Cart Items */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        {cartItems.map(item => (
          <div key={item._id || item.id} className="glass-card-sm" style={{ marginBottom: 'var(--space-sm)', padding: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative' }}>
              <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 4, right: 4 }}>
                <VegBadge isVeg={item.isVeg} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2xs)', marginBottom: 4 }}>
                <span style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-md)' }}>{item.name}</span>
                <VegBadge isVeg={item.isVeg} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>₹{item.price}</p>
            </div>
            <div className="glass-card-sm" style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-2xs)' }}>
              <button
                onClick={() => item.quantity > 1 ? updateQuantity(item._id || item.id, -1) : removeFromCart(item._id || item.id)}
                aria-label={item.quantity > 1 ? `Decrease quantity of ${item.name}` : `Remove ${item.name} from cart`}
                className="btn-ghost" style={{ color: 'var(--primary)', padding: 'var(--space-xs)' }}
              >
                <Minus size={16} />
              </button>
              <span style={{ margin: '0 var(--space-xs)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>{item.quantity}</span>
              <button onClick={() => updateQuantity(item._id || item.id, 1)} aria-label={`Increase quantity of ${item.name}`} className="btn-ghost" style={{ color: 'var(--primary)', padding: 'var(--space-xs)' }}>
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Details */}
      <div className="glass-card-sm" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-sm)' }}>Bill Details</h3>
        {[
          ['Item Total', `₹${cartTotal}`, 'var(--text-secondary)'],
          ['Delivery Fee', 'Free', 'var(--success)'],
          ['Govt Taxes & Charges', `₹${taxAmount}`, 'var(--text-secondary)'],
        ].map(([label, value, color]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)', color, fontSize: 'var(--text-sm)' }}>
            <span>{label}</span><span>{value}</span>
          </div>
        ))}
        {isDonationChecked && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)', color: 'var(--primary)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>
            <span>Feeding India Donation</span><span>₹{donationAmount}</span>
          </div>
        )}
        <div className="divider" style={{ margin: 'var(--space-sm) 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-xl)' }}>
          <span>To Pay</span><span>₹{finalTotal}</span>
        </div>
      </div>

      {/* Donation Card */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="glass-card-sm" style={{
          padding: 'var(--space-md)',
          borderColor: isDonationChecked ? 'var(--primary-border)' : 'var(--glass-border)',
          background: isDonationChecked ? 'var(--primary-surface)' : undefined,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: "linear-gradient(90deg, rgba(28,28,30,0.85) 0%, rgba(28,28,30,0.1) 100%), url('/donation.png')",
            backgroundSize: 'cover', backgroundPosition: 'center 20%',
            filter: 'brightness(1.3) contrast(1.1)', pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 4 }}>
                <Heart size={18} fill={isDonationChecked ? 'var(--primary)' : 'none'} color="var(--primary)" style={{ animation: isDonationChecked ? 'pulse-heart 1.5s infinite' : 'none' }} />
                <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-md)' }}>Feeding India</span>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: '80%' }}>
                Working towards a hunger-free India. Support a meal with just ₹3.
              </p>
            </div>
            <button
              onClick={() => setIsDonationChecked(!isDonationChecked)}
              className="btn-ghost"
              style={{
                background: isDonationChecked ? 'var(--primary)' : 'var(--surface)',
                color: 'white', padding: 'var(--space-xs) var(--space-sm)',
                borderRadius: 'var(--radius-md)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)',
              }}
            >
              {isDonationChecked ? 'Added' : 'Add ₹3'}
            </button>
          </div>
        </div>
      </div>

      {/* Pickup Time / Cabin Delivery */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        {isLecturer ? (
          <div className="glass-card-sm" style={{ padding: 'var(--space-md)', border: '1px solid var(--primary-border)', background: 'var(--primary-surface)' }}>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-xs)', display: 'flex', alignItems: 'center', gap: 8 }}>
              🚪 Cabin Delivery
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 8 }}>Your order will be delivered to:</p>
            <p style={{ color: 'var(--primary)', fontWeight: 'var(--weight-extrabold)', fontSize: 'var(--text-xl)' }}>Cabin {user?.cabinNumber}</p>
            {user?.department && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 4 }}>{user.department}</p>}
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <Clock size={16} color="var(--primary)" /> Select Pickup Time
            </h3>
            <div className="glass-card-sm" style={{ padding: 'var(--space-lg) var(--space-md)' }}>
              {/* Clock Face */}
              <div style={{
                position: 'relative', width: 220, height: 220, margin: '0 auto var(--space-lg)', borderRadius: '50%',
                background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(15px)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4), 0 15px 35px rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'radial-gradient(circle at center, var(--primary-surface) 0%, transparent 70%)', pointerEvents: 'none' }} />
                {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, idx) => {
                  const angle = (idx * 30 - 90) * (Math.PI / 180);
                  return (
                    <div key={num} style={{
                      position: 'absolute', left: `calc(50% + ${Math.cos(angle) * 85}px - 14px)`, top: `calc(50% + ${Math.sin(angle) * 85}px - 14px)`,
                      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)',
                      color: num % 3 === 0 ? 'var(--text-main)' : 'var(--text-muted)',
                      opacity: num % 3 === 0 ? 1 : 0.6,
                    }}>{num}</div>
                  );
                })}
                {/* Center dot */}
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--text-main)', position: 'absolute', zIndex: 10, boxShadow: '0 0 20px rgba(255,255,255,0.4)', border: '4px solid var(--primary)' }} />
                {/* Hour hand */}
                <div style={{
                  position: 'absolute', bottom: '50%', left: '50%', width: 6, height: 55,
                  background: 'linear-gradient(to top, var(--primary), var(--danger))',
                  borderRadius: '6px 6px 4px 4px', transformOrigin: 'bottom center',
                  transform: `translateX(-50%) rotate(${hourDeg}deg)`,
                  transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', zIndex: 5,
                  filter: 'drop-shadow(0 0 8px var(--primary-glow))',
                }} />
                {/* Minute hand */}
                <div style={{
                  position: 'absolute', bottom: '50%', left: '50%', width: 3, height: 85,
                  background: 'rgba(255,255,255,0.9)', borderRadius: 4,
                  transformOrigin: 'bottom center',
                  transform: `translateX(-50%) rotate(${minuteDeg}deg)`,
                  transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)', zIndex: 4,
                  boxShadow: '0 0 10px rgba(255,255,255,0.2)',
                }} />
              </div>

              {/* Selected Time */}
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                <span style={{
                  display: 'inline-block', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-extrabold)',
                  color: 'var(--text-main)', letterSpacing: '0.5px',
                  background: 'var(--primary)', padding: 'var(--space-xs) var(--space-lg)',
                  borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-glow)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>{pickupTime || 'Select Time'}</span>
              </div>

              {/* Quick Slots */}
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>Quick Select</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}>
                {['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM', '06:30 PM'].map(time => (
                  <button key={time} onClick={() => setPickupTime(time)} style={{
                    padding: 'var(--space-xs)', borderRadius: 'var(--radius-md)',
                    border: pickupTime === time ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                    background: pickupTime === time ? 'var(--primary-surface)' : 'var(--surface)',
                    color: pickupTime === time ? 'var(--primary)' : 'var(--text-main)',
                    fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer',
                  }}>{time}</button>
                ))}
              </div>

              {/* Manual Input */}
              <div className="divider">or set a custom time</div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', background: 'var(--surface)', padding: 'var(--space-2xs) var(--space-sm)', borderRadius: 'var(--radius-lg)' }}>
                <input
                  type="time" aria-label="Custom pickup time" value={convert12to24(pickupTime)}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [h, m] = e.target.value.split(':');
                      const hour = parseInt(h);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      setPickupTime(`${(hour % 12 || 12).toString().padStart(2, '0')}:${m} ${ampm}`);
                    }
                  }}
                  style={{ flex: 1, padding: 'var(--space-xs) 0', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)', outline: 'none', cursor: 'pointer' }}
                />
                <Clock size={16} color="var(--text-secondary)" />
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-sm)', textAlign: 'center' }}>
                Pickup available during college hours: 07:00 AM - 07:00 PM
              </p>
            </div>
          </>
        )}
      </div>

      {/* Checkout */}
      <PrimaryButton onClick={handleCheckout} loading={loading} icon={Lock} aria-busy={loading}
        style={{ width: '100%', padding: '1.2rem', borderRadius: 'var(--radius-xl)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isLecturer ? `🚪 Deliver to Cabin ${user?.cabinNumber}` : `Place Order (₹${finalTotal})`}
      </PrimaryButton>
    </div>
  );
};

export default Cart;
