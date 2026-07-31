import React from 'react';

export function LoadingSpinner({ size = 20, color = 'white' }) {
  return (
    <span className="loading-spinner" style={{ width: size, height: size, borderTopColor: color }} />
  );
}

export function LoadingContainer({ text = 'Loading...' }) {
  return (
    <div className="loading-container">
      <LoadingSpinner size={24} /> <span style={{ marginLeft: 12 }}>{text}</span>
    </div>
  );
}