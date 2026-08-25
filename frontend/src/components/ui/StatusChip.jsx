import React from 'react';

const STATUS_MAP = {
  pending: { label: 'Pending', className: 'status-pending' },
  accepted: { label: 'Accepted', className: 'status-preparing' },
  preparing: { label: 'Cooking', className: 'status-preparing' },
  'out-for-delivery': { label: 'On the way', className: 'status-ready' },
  ready: { label: 'Ready', className: 'status-ready' },
  delivered: { label: 'Delivered', className: 'status-completed' },
  completed: { label: 'Completed', className: 'status-completed' },
  cancelled: { label: 'Cancelled', className: 'badge-nonveg' },
  rejected: { label: 'Rejected', className: 'badge-nonveg' },
};

export default function StatusChip({ status }) {
  const info = STATUS_MAP[status] || { label: status, className: '' };
  return <span className={`status-chip ${info.className}`}>{info.label}</span>;
}