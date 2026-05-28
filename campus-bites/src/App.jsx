import React from 'react'
import SplashScreen from './components/SplashScreen'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Profile from './pages/Profile'

// Admin & Staff
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageMenu from './pages/admin/ManageMenu'
import Analytics from './pages/admin/Analytics'
import KitchenView from './pages/staff/KitchenView'
import ForgotPassword from './pages/ForgotPassword'
import LecturerLogin from './pages/lecturer/LecturerLogin'
import LecturerPortal from './pages/lecturer/LecturerPortal'
import DeliveryLogin from './pages/delivery/DeliveryLogin'
import DeliveryPortal from './pages/delivery/DeliveryPortal'

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

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
        <AuthProvider>
            <CartProvider>
                <Router>
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
                </Router>
            </CartProvider>
        </AuthProvider>
    )
}

export default App
