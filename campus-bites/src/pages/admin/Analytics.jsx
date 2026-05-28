import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, ArrowUpRight, ShoppingBag } from 'lucide-react';

const Analytics = () => {
    // Mock Data for Prototype
    const stats = [
        { label: 'Total Revenue', value: '₹42,500', trend: '+12.5%', icon: DollarSign, color: '#E23744' },
        { label: 'Total Orders', value: '850', trend: '+18.2%', icon: ShoppingBag, color: '#3B82F6' },
        { label: 'Active Users', value: '1,240', trend: '+5.4%', icon: Users, color: '#10B981' },
        { label: 'Growth Rate', value: '24%', trend: '+2.1%', icon: TrendingUp, color: '#F59E0B' },
    ];

    return (
        <div style={{ color: 'white' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>System Analytics</h1>
                <p style={{ color: '#6B7280', margin: '4px 0 0 0' }}>Real-time performance tracking and metrics</p>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: `${stat.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            color: stat.color
                        }}>
                            <stat.icon size={22} />
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0 0 8px 0', fontWeight: 600 }}>{stat.label}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{stat.value}</h3>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22C55E', display: 'flex', alignItems: 'center' }}>
                                {stat.trend} <ArrowUpRight size={12} />
                            </span>
                        </div>

                        {/* Decorative background glow */}
                        <div style={{
                            position: 'absolute',
                            top: '-20%',
                            right: '-10%',
                            width: '100px',
                            height: '100px',
                            background: stat.color,
                            filter: 'blur(60px)',
                            opacity: 0.05
                        }} />
                    </div>
                ))}
            </div>

            {/* Charts Placeholder */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    padding: '2rem',
                    textAlign: 'center',
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <BarChart3 size={48} style={{ color: '#E23744', opacity: 0.2, marginBottom: '1.5rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Sales Traffic</h3>
                    <p style={{ color: '#6B7280', maxWidth: '300px' }}>Revenue charts and hourly traffic logs will be live in the next update.</p>
                </div>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    padding: '2rem',
                    textAlign: 'center',
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <TrendingUp size={48} style={{ color: '#3B82F6', opacity: 0.2, marginBottom: '1.5rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Orders Forecast</h3>
                    <p style={{ color: '#6B7280', maxWidth: '300px' }}>AI-driven demand forecasting will appear here based on historical data.</p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
