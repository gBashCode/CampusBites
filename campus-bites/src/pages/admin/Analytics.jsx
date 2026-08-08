import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, ShoppingBag, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../apiConfig';

const REFRESH_INTERVAL = 30000;

const STATUS_COLORS = {
  pending: 'var(--warning)',
  preparing: 'var(--info)',
  ready: 'var(--primary)',
  completed: 'var(--success)',
  cancelled: 'var(--danger)',
};

const STATUS_LABELS = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const Analytics = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
    intervalRef.current = setInterval(fetchStats, REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchStats]);

  const statCards = stats
    ? [
        { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'var(--primary)' },
        { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'var(--info)' },
        { label: 'Active Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'var(--success)' },
        { label: 'Menu Items', value: stats.totalProducts.toLocaleString(), icon: TrendingUp, color: 'var(--warning)' },
      ]
    : [];

  const statusData = stats
    ? Object.entries(stats.ordersByStatus).map(([key, value]) => ({
        name: STATUS_LABELS[key] || key,
        count: value,
        fill: STATUS_COLORS[key] || 'var(--text-muted)',
      }))
    : [];

  const timeData = stats
    ? stats.recentOrders.map((r) => ({
        day: new Date(r.day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        orders: r.count,
        revenue: r.revenue,
      }))
    : [];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid var(--glass-border)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem',
          }}
        />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
        <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Failed to load analytics</p>
        <button
          onClick={fetchStats}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>System Analytics</h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Real-time performance tracking and metrics</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {lastUpdated && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={fetchStats}
            title="Refresh"
            style={{
              padding: '8px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              padding: '1.25rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: `${stat.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem',
                color: stat.color,
              }}
            >
              <stat.icon size={22} />
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 6px 0', fontWeight: 600 }}>{stat.label}</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{stat.value}</h3>
            <div
              style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '100px',
                height: '100px',
                background: stat.color,
                filter: 'blur(60px)',
                opacity: 0.05,
              }}
            />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Orders by Status - Bar Chart */}
        <div className="glass-card-sm" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Orders by Status</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '4px 0 0 0' }}>All-time distribution</p>
            </div>
            <BarChart3 size={20} style={{ color: 'var(--primary)', opacity: 0.5 }} />
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={statusData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(20, 20, 30, 0.95)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.85rem',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Over Time - Area Chart */}
        <div className="glass-card-sm" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Orders Over Time</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '4px 0 0 0' }}>Last 14 days</p>
            </div>
            <TrendingUp size={20} style={{ color: 'var(--info)', opacity: 0.5 }} />
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={timeData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--info)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--info)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(20, 20, 30, 0.95)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.85rem',
                  }}
                />
                <Area type="monotone" dataKey="orders" stroke="var(--info)" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
                <Area type="monotone" dataKey="revenue" stroke="var(--success)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--info)' }} />
              Orders
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--success)' }} />
              Revenue (₹)
            </div>
          </div>
        </div>
      </div>

      {/* Status Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        {Object.entries(stats.ordersByStatus).map(([key, value]) => (
          <div
            key={key}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '14px',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[key], margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 4px 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {STATUS_LABELS[key]}
            </p>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
