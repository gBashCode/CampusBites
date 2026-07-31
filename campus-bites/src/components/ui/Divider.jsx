import React from 'react';

export default function Divider({ children = 'or', className = '' }) {
  return <div className={`divider ${className}`}>{children}</div>;
}