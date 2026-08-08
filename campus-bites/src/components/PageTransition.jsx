import React from 'react';

export default function PageTransition({ children }) {
  return (
    <div
      className="animate-slideInUp"
      style={{ opacity: 1 }}
    >
      {children}
    </div>
  );
}
