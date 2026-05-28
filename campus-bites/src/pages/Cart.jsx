import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Minus, Plus, Clock, ShoppingBag, ArrowRight, CreditCard, Wallet, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import API_URL from '../apiConfig';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
    const { user, token } = useAuth();
    const [pickupTime, setPickupTime] = useState('');
    const [isDonationChecked, setIsDonationChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const taxAmount = Math.round(cartTotal * 0.05);
    const donationAmount = isDonationChecked ? 3 : 0;
    const finalTotal = cartTotal + taxAmount + donationAmount;

    const handleCheckout = async () => {
        if (!pickupTime) {
            alert('Please select a pickup time');
            return;
        }

        if (!user || !token) {
            alert('Please log in to place an order');
            navigate('/');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                items: cartItems.map(item => ({ product: item._id, quantity: item.quantity, price: item.price })),
                totalAmount: finalTotal,
                pickupTime,
                donation: donationAmount
            };

            // 1. Create Razorpay Order on server
            const razorpayRes = await fetch(`${API_URL}/api/orders/razorpay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: finalTotal })
            });

            const razorpayOrder = await razorpayRes.json();
            if (!razorpayRes.ok) throw new Error(razorpayOrder.message || 'Payment init failed');

            // 2. Open Razorpay Modal
            const options = {
                key: razorpayOrder.key_id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "Campus Bites",
                description: "Canteen Order Payment",
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    // 3. Verify Payment on server
                    try {
                        const verifyRes = await fetch(`${API_URL}/api/orders/verify`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderData
                            })
                        });

                        if (verifyRes.ok) {
                            clearCart();
                            alert('Order placed successfully!');
                            navigate('/dashboard/orders');
                        } else {
                            alert('Payment verification failed');
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        alert('Error verifying payment');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#E23744"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error('Checkout error:', err);
            alert(err.message || 'Failed to process checkout');
        } finally {
            setLoading(false);
        }
    };

    // For lecturer: auto-set pickupTime to cabin delivery label
    const isLecturer = user?.role === 'lecturer';
    if (isLecturer && !pickupTime) {
        setPickupTime(`Cabin ${user?.cabinNumber || 'Delivery'}`);
    }

    const convert12to24 = (time12h) => {
        if (!time12h) return '';
        try {
            const [time, modifier] = time12h.split(' ');
            let [hours, minutes] = time.split(':');
            let h = parseInt(hours, 10);
            if (modifier === 'PM' && h !== 12) h += 12;
            if (modifier === 'AM' && h === 12) h = 0;
            return `${String(h).padStart(2, '0')}:${minutes}`;
        } catch (e) {
            return '';
        }
    };

    if (cartItems.length === 0) {
        return (
            <div style={{
                minHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                color: 'white'
            }}>
                <div style={{
                    background: 'rgba(226, 55, 68, 0.1)',
                    padding: '2rem',
                    borderRadius: '50%',
                    marginBottom: '1.5rem'
                }}>
                    <ShoppingBag size={64} color="#E23744" opacity={0.6} />
                </div>
                <h2 style={{ marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
                <p style={{ color: '#9CA3AF' }}>Looks like you haven't added any delicious food yet.</p>
                <button
                    onClick={() => navigate('/dashboard/menu')}
                    style={{
                        marginTop: '2rem',
                        background: '#E23744',
                        color: 'white',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    Browse Menu
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem 1rem 8rem 1rem', color: 'white' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Cart</h1>

            {/* Cart Items List */}
            <div style={{ marginBottom: '2rem' }}>
                {cartItems.map(item => (
                    <div key={item._id} className="glass-panel" style={{
                        marginBottom: '1rem',
                        padding: '1rem',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        {/* Tiny Image Thumbnail */}
                        <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {/* Veg/Non-Veg Badge on Image */}
                            <div style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '14px',
                                height: '14px',
                                border: `1.5px solid ${item.isVeg !== false ? '#22C55E' : '#EF4444'}`,
                                borderRadius: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'white'
                            }}>
                                {item.isVeg !== false ? (
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
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{item.name}</h3>
                                {/* Veg/Non-Veg Badge next to name */}
                                <div style={{
                                    width: '14px',
                                    height: '14px',
                                    border: `1.5px solid ${item.isVeg !== false ? '#22C55E' : '#EF4444'}`,
                                    borderRadius: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'white',
                                    flexShrink: 0
                                }}>
                                    {item.isVeg !== false ? (
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
                            </div>
                            <p style={{ color: '#9CA3AF', fontSize: '0.9rem', margin: 0 }}>₹{item.price}</p>
                        </div>

                        {/* Quantity Controls */}
                        <div style={{
                            background: '#27272A',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                        }}>
                            <button
                                onClick={() => item.quantity > 1 ? updateQuantity(item._id, -1) : removeFromCart(item._id)}
                                style={{ background: 'transparent', border: 'none', color: '#E23744', padding: '6px', cursor: 'pointer' }}
                            >
                                <Minus size={16} />
                            </button>
                            <span style={{ margin: '0 8px', fontWeight: 600, fontSize: '0.9rem' }}>{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item._id, 1)}
                                style={{ background: 'transparent', border: 'none', color: '#E23744', padding: '6px', cursor: 'pointer' }}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bill Details */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Bill Details</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#9CA3AF', fontSize: '0.9rem' }}>
                    <span>Item Total</span>
                    <span>₹{cartTotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#9CA3AF', fontSize: '0.9rem' }}>
                    <span>Delivery Fee</span>
                    <span style={{ color: '#22C55E' }}>Free</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#9CA3AF', fontSize: '0.9rem' }}>
                    <span>Govt Taxes & Charges</span>
                    <span>₹{taxAmount}</span>
                </div>
                {isDonationChecked && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#E23744', fontSize: '0.9rem', fontWeight: 600 }}>
                        <span>Feeding India Donation</span>
                        <span>₹{donationAmount}</span>
                    </div>
                )}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '1rem',
                    marginTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: '1.2rem'
                }}>
                    <span>To Pay</span>
                    <span>₹{finalTotal}</span>
                </div>
            </div>

            {/* Donation Option */}
            <div style={{ marginBottom: '2rem' }}>
                <style>{`
                    @keyframes pulse-heart {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.2); }
                        100% { transform: scale(1); }
                    }
                    .donation-card {
                        position: relative;
                        overflow: hidden;
                        border-radius: 24px;
                        padding: 1.5rem;
                        background: #1C1C1E;
                        border: 1px solid rgba(226, 55, 68, 0.2);
                        transition: all 0.3s ease;
                    }
                    .donation-bg {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, rgba(28, 28, 30, 0.85) 0%, rgba(28, 28, 30, 0.1) 100%), url('/donation.png');
                        background-size: cover;
                        background-position: center 20%;
                        filter: brightness(1.3) contrast(1.1);
                        opacity: 1;
                        pointer-events: none;
                    }
                    .donation-content {
                        position: relative;
                        z-index: 1;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .clock-face {
                        background: rgba(255, 255, 255, 0.03);
                        backdrop-filter: blur(15px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        box-shadow: 
                            inset 0 0 40px rgba(0, 0, 0, 0.4),
                            0 15px 35px rgba(0, 0, 0, 0.5);
                    }
                    .clock-number {
                        transition: all 0.3s ease;
                        font-family: 'Inter', sans-serif;
                    }
                    .clock-hand-shadow {
                        filter: drop-shadow(0 0 8px rgba(226, 55, 68, 0.6));
                    }
                    @keyframes sweep {
                        from { transform: translateX(-50%) rotate(var(--start-deg)); }
                        to { transform: translateX(-50%) rotate(var(--end-deg)); }
                    }
                `}</style>
                <div className="donation-card" style={{
                    borderColor: isDonationChecked ? 'rgba(226, 55, 68, 0.6)' : 'rgba(255, 255, 255, 0.1)',
                    background: isDonationChecked ? 'rgba(226, 55, 68, 0.05)' : '#1C1C1E'
                }}>
                    <div className="donation-bg"></div>
                    <div className="donation-content">
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <Heart
                                    size={18}
                                    fill={isDonationChecked ? "#E23744" : "none"}
                                    color="#E23744"
                                    style={{ animation: isDonationChecked ? 'pulse-heart 1.5s infinite' : 'none' }}
                                />
                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Feeding India</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#9CA3AF', maxWidth: '80%' }}>
                                Working towards a hunger-free India. Support a meal with just ₹3.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsDonationChecked(!isDonationChecked)}
                            style={{
                                background: isDonationChecked ? '#E23744' : 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {isDonationChecked ? 'Added' : 'Add ₹3'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Pickup Time / Cabin Delivery */}
            <div style={{ marginBottom: '2rem' }}>
                {isLecturer ? (
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(226,55,68,0.25)', background: 'rgba(226,55,68,0.05)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            🚪 Cabin Delivery
                        </h3>
                        <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: 8 }}>Your order will be delivered to:</p>
                        <p style={{ color: '#E23744', fontWeight: 800, fontSize: '1.3rem' }}>Cabin {user?.cabinNumber}</p>
                        {user?.department && <p style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: 4 }}>{user.department}</p>}
                    </div>
                ) : (
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="#E23744" /> Select Pickup Time
                </h3>)}

                {!isLecturer && <div className="glass-panel" style={{ padding: '2rem 1.5rem', borderRadius: '32px' }}>
                    {/* Visual Clock Display */}
                    <div className="clock-face" style={{
                        position: 'relative',
                        width: '220px',
                        height: '220px',
                        margin: '0 auto 2rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Clock Glow */}
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at center, rgba(226, 55, 68, 0.08) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }} />
                        {/* Clock Face Numbers */}
                        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, idx) => {
                            const angle = (idx * 30 - 90) * (Math.PI / 180);
                            const radius = 85;
                            const x = Math.cos(angle) * radius;
                            const y = Math.sin(angle) * radius;
                            return (
                                <div
                                    key={num}
                                    className="clock-number"
                                    style={{
                                        position: 'absolute',
                                        left: `calc(50% + ${x}px - 14px)`,
                                        top: `calc(50% + ${y}px - 14px)`,
                                        width: '28px',
                                        height: '28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                        color: num % 3 === 0 ? '#FFFFFF' : '#6B7280',
                                        opacity: num % 3 === 0 ? 1 : 0.6
                                    }}
                                >
                                    {num}
                                </div>
                            );
                        })}

                        {/* Center Dot */}
                        <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: '#FFFFFF',
                            position: 'absolute',
                            zIndex: 10,
                            boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)',
                            border: '4px solid #E23744'
                        }} />

                        {/* Clock Hands */}
                        {(() => {
                            let hourDeg = 90; // Default 3 o'clock (horizontal right) is 0deg in CSS rotation if not handled carefully, but let's assume standard 12 is top.
                            // CSS transform rotate(0deg) points UP if element is vertical.
                            // But usually with absolute positioning we center it.
                            // Let's parse the time string "HH:MM PM"
                            let minuteDeg = 0;

                            if (pickupTime) {
                                try {
                                    // Example: "12:30 PM"
                                    const [timePart, modifier] = pickupTime.split(' ');
                                    let [hours, minutes] = timePart.split(':').map(Number);

                                    if (modifier === 'PM' && hours !== 12) hours += 12;
                                    if (modifier === 'AM' && hours === 12) hours = 0;

                                    // Convert to degrees
                                    // 12 hours = 360 deg => 1 hour = 30 deg
                                    // 60 min = 360 deg => 1 min = 6 deg
                                    // Hour hand moves by minutes too: 0.5 deg per minute
                                    hourDeg = (hours % 12) * 30 + minutes * 0.5;
                                    minuteDeg = minutes * 6;
                                } catch (e) {
                                    // Default if parse fails
                                    const now = new Date();
                                    hourDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
                                    minuteDeg = now.getMinutes() * 6;
                                }
                            } else {
                                // Default default: current time
                                const now = new Date();
                                hourDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
                                minuteDeg = now.getMinutes() * 6;
                            }

                            return (
                                <>
                                    {/* Hour Hand */}
                                    <div
                                        className="clock-hand-shadow"
                                        style={{
                                            position: 'absolute',
                                            bottom: '50%',
                                            left: '50%',
                                            width: '6px',
                                            height: '55px',
                                            background: 'linear-gradient(to top, #E23744, #EF4444)',
                                            borderRadius: '6px 6px 4px 4px',
                                            transformOrigin: 'bottom center',
                                            transform: `translateX(-50%) rotate(${hourDeg}deg)`,
                                            transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            zIndex: 5
                                        }}
                                    />
                                    {/* Minute Hand */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '50%',
                                        left: '50%',
                                        width: '3px',
                                        height: '85px',
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '4px',
                                        transformOrigin: 'bottom center',
                                        transform: `translateX(-50%) rotate(${minuteDeg}deg)`,
                                        transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        zIndex: 4,
                                        boxShadow: '0 0 10px rgba(255,255,255,0.2)'
                                    }} />
                                </>
                            );
                        })()}

                    </div>

                    {/* Selected Time Display - Moved Below Clock */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            display: 'inline-block',
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            color: '#FFFFFF',
                            letterSpacing: '0.5px',
                            background: 'rgba(226, 55, 68, 0.95)',
                            padding: '8px 24px',
                            borderRadius: '16px',
                            boxShadow: '0 8px 20px rgba(226, 55, 68, 0.4)',
                            transition: 'all 0.3s ease',
                            border: '1px solid rgba(255,255,255,0.2)',
                            zIndex: 10
                        }}>
                            {pickupTime || 'Select Time'}
                        </div>
                    </div>

                    {/* Quick Time Slots */}
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '0.75rem' }}>Quick Select</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM', '06:30 PM'].map(time => (
                                <button
                                    key={time}
                                    onClick={() => setPickupTime(time)}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        border: pickupTime === time ? '2px solid #E23744' : '1px solid rgba(255,255,255,0.1)',
                                        background: pickupTime === time ? 'rgba(226, 55, 68, 0.1)' : 'rgba(255,255,255,0.03)',
                                        color: pickupTime === time ? '#E23744' : 'white',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Manual Time Input */}
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                        <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '1rem' }}>Or set a custom time</p>
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.02)',
                            padding: '4px 12px',
                            borderRadius: '16px'
                        }}>
                            <input
                                type="time"
                                value={convert12to24(pickupTime)}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const [hours, minutes] = e.target.value.split(':');
                                        const hour = parseInt(hours);
                                        const ampm = hour >= 12 ? 'PM' : 'AM';
                                        const displayHour = hour % 12 || 12;
                                        setPickupTime(`${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`);
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    padding: '0.6rem 0',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            />
                            <div style={{
                                padding: '8px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '10px',
                            }}>
                                <Clock size={16} color="#9CA3AF" />
                            </div>
                        </div>
                    </div>
                {!isLecturer && <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '1rem', textAlign: 'center' }}>Pickup available during college hours: 07:00 AM - 07:00 PM</p>}
                </div>}
            </div>

            {/* Checkout Button */}
            <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white',
                    border: 'none',
                    width: '100%',
                    padding: '1.2rem',
                    borderRadius: '24px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    boxShadow: '0 8px 20px rgba(226, 55, 68, 0.4)',
                    transition: 'transform 0.2s ease'
                }}
            >
                <span>{loading ? 'Processing...' : isLecturer ? `🚪 Deliver to Cabin ${user?.cabinNumber}` : 'Place Order'}</span>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '8px'
                }}>
                    <ArrowRight size={20} />
                </div>
            </button>
        </div>
    );
};

export default Cart;
