import React from 'react';

export default function SuccessDisplay({ children, className = '' }) {
  if (!children) return null;
  return <div role="status" aria-live="polite" className={`success-display ${className}`}>{children}</div>;
}