import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const A2HSPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already installed?
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    // Dismissed permanently?
    if (localStorage.getItem('cb-a2hs-dismissed') === 'true') return;

    // Dismissed this session?
    if (sessionStorage.getItem('cb-a2hs-session-dismissed')) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show popup after 3 seconds
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem('cb-a2hs-dismissed', 'true');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = (permanent = false) => {
    if (permanent) {
      localStorage.setItem('cb-a2hs-dismissed', 'true');
    } else {
      sessionStorage.setItem('cb-a2hs-session-dismissed', 'true');
    }
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => handleDismiss(false)}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 9998, backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease',
        }}
      />

      {/* Popup Card */}
      <div style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)', maxWidth: '380px',
        background: 'var(--bg-card)', borderRadius: '20px',
        border: '1px solid var(--border-default)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px var(--primary-glow)',
        padding: '24px', zIndex: 9999,
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Close button */}
        <button
          onClick={() => handleDismiss(false)}
          aria-label="Close"
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4,
          }}
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'linear-gradient(135deg, var(--primary), #ff6b6b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', boxShadow: '0 8px 24px var(--primary-glow)',
        }}>
          <Download size={28} color="white" />
        </div>

        {/* Text */}
        <h3 style={{
          fontSize: '1.1rem', fontWeight: 700, textAlign: 'center',
          color: 'var(--text-primary)', margin: '0 0 8px',
        }}>
          Install Campus Bites
        </h3>
        <p style={{
          fontSize: '0.85rem', textAlign: 'center',
          color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.5,
        }}>
          Add to your home screen for faster access, offline support, and a native app experience.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => handleDismiss(true)}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 12,
              background: 'var(--bg-card-active)', border: 'none',
              color: 'var(--text-secondary)', fontSize: '0.9rem',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="btn-primary"
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 12,
              fontSize: '0.9rem', fontWeight: 600,
            }}
          >
            Install
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(40px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default A2HSPrompt;
