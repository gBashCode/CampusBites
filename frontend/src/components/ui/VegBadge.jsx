import React from 'react';

export default function VegBadge({ isVeg = true }) {
  return (
    <span className={`badge ${isVeg ? 'badge-veg' : 'badge-nonveg'}`}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: isVeg ? '#22C55E' : '#EF4444',
        display: 'inline-block'
      }} />
      {isVeg ? 'VEG' : 'NON-VEG'}
    </span>
  );
}