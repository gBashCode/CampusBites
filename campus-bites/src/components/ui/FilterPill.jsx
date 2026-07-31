import React from 'react';

export default function FilterPill({ active = false, children, className = '', ...props }) {
  return (
    <button className={`filter-pill ${active ? 'filter-pill-active' : ''} ${className}`} {...props}>
      {children}
    </button>
  );
}