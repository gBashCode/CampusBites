import React from 'react';

export default function SecondaryButton({ children, className = '', icon: Icon, ...props }) {
  return (
    <button className={`btn-secondary ${className}`} {...props}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}