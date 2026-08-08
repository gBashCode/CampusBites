import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './context/ToastContext';

import { SpeedInsights } from "@vercel/speed-insights/react"

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const AppTree = () => (
    <ToastProvider>
        <App />
        <SpeedInsights />
    </ToastProvider>
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
                <AppTree />
            </GoogleOAuthProvider>
        ) : (
            <AppTree />
        )}
    </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}
