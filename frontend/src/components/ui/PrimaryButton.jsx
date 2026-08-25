import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export default function PrimaryButton({ children, loading = false, disabled = false, className = '', icon: Icon, ...props }) {
  return (
    <button className={`btn-primary ${className}`} disabled={disabled || loading} {...props}>
      {loading ? <LoadingSpinner size={18} /> : Icon && <Icon size={18} />}
      {children}
    </button>
  );
}