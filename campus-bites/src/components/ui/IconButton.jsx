import React from 'react';

export default function IconButton({ children, className = '', ...props }) {
  return (
    <button className={`btn-icon ${className}`} {...props}>
      {children}
    </button>
  );
}