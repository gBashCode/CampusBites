import React from 'react';

export default function GradientText({ children, as: Tag = 'span', className = '', ...props }) {
  return <Tag className={`gradient-text ${className}`} {...props}>{children}</Tag>;
}