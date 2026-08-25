import React from 'react';

export default function EmptyState({ icon: Icon, title, description, children, className = '' }) {
  return (
    <div className={`empty-state ${className}`}>
      {Icon && <div className="empty-state-icon"><Icon size={48} /></div>}
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}