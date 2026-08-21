import React from 'react';

export default function StatusBadge({ status, text, icon: Icon }) {
  let badgeClass = 'badge badge-neutral';
  
  const norm = String(status || '').toLowerCase().trim();
  if (norm === 'on-track' || norm === 'success' || norm === 'income' || norm === 'active' || norm === 'positive') {
    badgeClass = 'badge badge-success';
  } else if (norm === 'warning' || norm === 'pre-alert' || norm === 'watch') {
    badgeClass = 'badge badge-warning';
  } else if (norm === 'over-budget' || norm === 'danger' || norm === 'expense' || norm === 'unusual' || norm === 'attention') {
    badgeClass = 'badge badge-danger';
  }

  return (
    <span className={badgeClass}>
      {Icon && <Icon size={12} />}
      {text}
    </span>
  );
}
