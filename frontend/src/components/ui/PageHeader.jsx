import React from 'react';

export default function PageHeader({ children, icon: Icon, action, className = '', ...props }) {
  return (
    <div className={`page-header ${className}`} {...props}>
      {Icon && <Icon size={24} style={{ color: '#E23744' }} />}
      <div style={{ flex: 1 }}>{children}</div>
      {action}
    </div>
  );
}