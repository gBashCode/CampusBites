import React, { Suspense } from 'react'
import SplashScreen from './components/SplashScreen'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { CartProvider } from './context/CartContext'
import { NotificationProvider } from './context/NotificationContext'
import { WebSocketProvider } from './context/WebSocketContext'
import { LoadingContainer } from './components/ui'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Profile from './pages/Profile'

// Admin & Staff (lazy-loaded for code splitting)
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'))
import ManageMenu from './pages/admin/ManageMenu'
const Analytics = React.lazy(() => import('./pages/admin/Analytics'))
const KitchenView = React.lazy(() => import('./pages/staff/KitchenView'))
import ForgotPassword from './pages/ForgotPassword'
import LecturerLogin from './pages/lecturer/LecturerLogin'
import DeliveryLogin from './pages/delivery/DeliveryLogin'
const DeliveryPortal = React.lazy(() => import('./pages/delivery/DeliveryPortal'))

class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', color: 'var(--text-main)' }}>
                    <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Something went wrong</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                            An unexpected error occurred. Please try again.
                        </p>
                        <button
                            onClick={() => { this.handleReset(); window.location.href = '/'; }}
                            className="btn-primary"
                            style={{ maxWidth: '200px', margin: '0 auto' }}
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
            <div className="loading-spinner" style={{ width: '32px', height: '32px' }} />
        </div>
    );

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        if (user.role === 'admin') return <Navigate to="/admin/menu" replace />;
        if (user.role === 'staff') return <Navigate to="/staff/kitchen" replace />;
        if (user.role === 'lecturer') return <Navigate to="/lecturer/menu" replace />;
        if (user.role === 'delivery') return <Navigate to="/delivery/orders" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    /* Splash Screen State */
    const [showSplash, setShowSplash] = React.useState(true);

    if (showSplash) {
        return <SplashScreen onComplete={() => setShowSplash(false)} />;
    }

    return (
        <ErrorBoundary>
        <AuthProvider>
            <NotificationProvider>
            <ThemeProvider>
            <WebSocketProvider>
            <CartProvider>
                <Router>
                    <ErrorBoundary>
                    <Suspense fallback={<LoadingContainer />}>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        {/* Student + Lecturer Dashboard — same exact UI */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute roles={['student', 'lecturer']}>
                                <Dashboard />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="menu" replace />} />
                            <Route path="menu" element={<Menu />} />
                            <Route path="cart" element={<Cart />} />
                            <Route path="orders" element={<Orders />} />
                            <Route path="profile" element={<Profile />} />
                        </Route>

                        {/* Admin Dashboard */}
                        <Route path="/admin" element={
                            <ProtectedRoute roles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="menu" replace />} />
                            <Route path="menu" element={<ManageMenu />} />
                            <Route path="analytics" element={<Analytics />} />
                        </Route>

                        {/* Staff Dashboard */}
                        <Route path="/staff" element={
                            <ProtectedRoute roles={['staff']}>
                                <Outlet />
                            </ProtectedRoute>
                        }>
                            <Route path="kitchen" element={<KitchenView />} />
                            <Route index element={<Navigate to="kitchen" replace />} />
                        </Route>

                        {/* Lecturer Portal */}
                        <Route path="/lecturer" element={<LecturerLogin />} />
                        <Route path="/lecturer/menu" element={
                            <ProtectedRoute roles={['lecturer']}>
                                <Navigate to="/dashboard/menu" replace />
                            </ProtectedRoute>
                        } />

                        {/* Delivery Boy Portal */}
                        <Route path="/delivery" element={<DeliveryLogin />} />
                        <Route path="/delivery/orders" element={
                            <ProtectedRoute roles={['delivery', 'admin', 'staff']}>
                                <DeliveryPortal />
                            </ProtectedRoute>
                        } />

                    </Routes>
                    </Suspense>
                    </ErrorBoundary>
                </Router>
            </CartProvider>
            </WebSocketProvider>
            </ThemeProvider>
            </NotificationProvider>
        </AuthProvider>
        </ErrorBoundary>
    )
}

export default App
