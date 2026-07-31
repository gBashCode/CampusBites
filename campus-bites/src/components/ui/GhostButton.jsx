import React from 'react';

export default function GhostButton({ children, className = '', icon: Icon, size = 18, ...props }) {
  return (
    <button className={`btn-ghost ${className}`} {...props}>
      {Icon && <Icon size={size} />}
      {children}
    </button>
  );
}