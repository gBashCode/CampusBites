import React from 'react';
import { ProductCardSkeleton } from './SkeletonLoader';

export function LoadingSpinner({ size = 20, color = 'white' }) {
  return (
    <span className="loading-spinner" style={{ width: size, height: size, borderTopColor: color }} />
  );
}

export function LoadingContainer({ text = 'Loading...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: 'var(--space-lg)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 'var(--space-md)',
          width: '100%',
          maxWidth: 600,
        }}
      >
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </div>
    </div>
  );
}