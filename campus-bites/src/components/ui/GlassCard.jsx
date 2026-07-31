import React from 'react';

export default function GlassCard({ children, className = '', elevated = false, ...props }) {
  return (
    <div className={`${elevated ? 'glass-card' : 'glass-card-sm'} ${className}`} {...props}>
      {children}
    </div>
  );
}