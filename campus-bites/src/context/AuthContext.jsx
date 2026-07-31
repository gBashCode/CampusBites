import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// Decode JWT to check expiry
const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};

// BroadcastChannel for multi-tab logout sync
let authChannel = null;
try {
    authChannel = new BroadcastChannel('campusbites-auth');
} catch {
    // BroadcastChannel not supported (e.g., Safari private mode)
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');
            if (storedUser && storedToken) {
                if (isTokenExpired(storedToken)) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                } else {
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                }
            }
        } catch (err) {
            console.error('Error parsing stored auth data:', err);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }, []);

    // Listen for multi-tab logout
    useEffect(() => {
        if (!authChannel) return;
        const handler = (event) => {
            if (event.data === 'logout') {
                setUser(null);
                setToken(null);
            }
        };
        authChannel.addEventListener('message', handler);
        return () => authChannel.removeEventListener('message', handler);
    }, []);

    const login = useCallback((userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Notify other tabs
        if (authChannel) {
            authChannel.postMessage('logout');
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
