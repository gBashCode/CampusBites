import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './context/ToastContext';

import { SpeedInsights } from "@vercel/speed-insights/react"

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
            <ToastProvider>
                <App />
                <SpeedInsights />
            </ToastProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
