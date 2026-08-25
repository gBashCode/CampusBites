import React from 'react';

export default function PageContainer({ children, className = '', style = {}, ...props }) {
  return (
    <div className={`page-container ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}