import React from 'react';

export default function ErrorDisplay({ children, className = '' }) {
  if (!children) return null;
  return <div role="alert" aria-live="polite" className={`error-display ${className}`}>{children}</div>;
}