import React from 'react';

const shimmerStyle = {
  background: `linear-gradient(90deg, var(--surface) 25%, var(--surface-hover) 50%, var(--surface) 75%)`,
  backgroundSize: '2000px 100%',
  animation: 'shimmer 2s linear infinite',
  borderRadius: 'var(--radius-sm)',
};

function SkeletonLine({ width = '100%', height = 14, style = {}, ...props }) {
  return (
    <div
      style={{
        ...shimmerStyle,
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-md)',
        overflow: 'hidden',
      }}
    >
      <SkeletonLine
        width="100%"
        height={160}
        style={{ borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-sm)' }}
      />
      <SkeletonLine width="70%" height={16} style={{ marginBottom: 'var(--space-xs)' }} />
      <SkeletonLine width="45%" height={12} style={{ marginBottom: 'var(--space-sm)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonLine width={60} height={18} />
        <SkeletonLine width={80} height={34} style={{ borderRadius: 'var(--radius-full)' }} />
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-md)',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
        <SkeletonLine width={100} height={14} />
        <SkeletonLine width={70} height={24} style={{ borderRadius: 'var(--radius-full)' }} />
      </div>
      <SkeletonLine width="85%" height={13} style={{ marginBottom: 'var(--space-xs)' }} />
      <SkeletonLine width="60%" height={13} style={{ marginBottom: 'var(--space-sm)' }} />
      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--space-sm)', display: 'flex', justifyContent: 'space-between' }}>
        <SkeletonLine width={90} height={14} />
        <SkeletonLine width={60} height={14} />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-lg) var(--space-md)',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <SkeletonLine width={40} height={40} style={{ borderRadius: '50%', margin: '0 auto var(--space-sm)' }} />
      <SkeletonLine width="50%" height={28} style={{ margin: '0 auto var(--space-xs)' }} />
      <SkeletonLine width="40%" height={12} style={{ margin: '0 auto' }} />
    </div>
  );
}

export function TextSkeleton({ width = '100%', height = 14, lines = 1, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={i === lines - 1 && lines > 1 ? '60%' : width}
          height={height}
        />
      ))}
    </div>
  );
}

export function SkeletonLoader({ type = 'product', count = 1, ...props }) {
  const components = {
    product: ProductCardSkeleton,
    order: OrderCardSkeleton,
    stats: StatsSkeleton,
  };
  const Component = components[type] || ProductCardSkeleton;

  return (
    <div
      style={{
        display: type === 'stats' ? 'grid' : 'flex',
        gridTemplateColumns: type === 'stats' ? 'repeat(auto-fit, minmax(180px, 1fr))' : undefined,
        flexDirection: type === 'stats' ? undefined : 'column',
        gap: type === 'stats' ? 'var(--space-lg)' : 'var(--space-md)',
        animation: 'fadeIn 0.3s ease-out',
      }}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}
