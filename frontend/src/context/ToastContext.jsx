import React, { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg, dur) => addToast(msg, 'success', dur),
        error: (msg, dur) => addToast(msg, 'error', dur),
        info: (msg, dur) => addToast(msg, 'info', dur),
        dismiss,
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10000,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                pointerEvents: 'none',
                maxWidth: '400px',
                width: '90%'
            }}>
                {toasts.map(t => (
                    <div key={t.id} onClick={() => dismiss(t.id)} style={{
                        padding: '12px 20px',
                        borderRadius: '14px',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        backdropFilter: 'blur(16px)',
                        pointerEvents: 'auto',
                        cursor: 'pointer',
                        animation: 'toastIn 0.3s ease-out',
                        ...(t.type === 'success' && {
                            background: 'rgba(34, 197, 94, 0.9)',
                            color: 'white',
                            boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)'
                        }),
                        ...(t.type === 'error' && {
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: 'white',
                            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
                        }),
                        ...(t.type === 'info' && {
                            background: 'rgba(59, 130, 246, 0.9)',
                            color: 'white',
                            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                        })
                    }}>
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};
