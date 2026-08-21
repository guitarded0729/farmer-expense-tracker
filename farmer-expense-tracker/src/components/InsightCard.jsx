import React from 'react';

export default function InsightCard({ type, text, icon: Icon }) {
  let bgColor = 'var(--bg-dark)';
  let borderColor = 'var(--line)';
  let iconColor = 'var(--text-soft)';

  if (type === 'danger' || type === 'attention') {
    bgColor = 'var(--danger-soft)';
    borderColor = 'rgba(211, 47, 47, 0.2)';
    iconColor = 'var(--danger)';
  } else if (type === 'warning' || type === 'watch') {
    bgColor = 'var(--warning-soft)';
    borderColor = 'rgba(245, 124, 0, 0.2)';
    iconColor = 'var(--warning)';
  } else if (type === 'success' || type === 'positive') {
    bgColor = 'var(--positive-soft)';
    borderColor = 'rgba(46, 125, 50, 0.2)';
    iconColor = 'var(--positive)';
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '12px 16px',
      backgroundColor: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      fontSize: 13,
      lineHeight: 1.4,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {Icon && (
        <div style={{ color: iconColor, marginTop: 1, display: 'flex', alignItems: 'center' }}>
          <Icon size={16} />
        </div>
      )}
      <div style={{ color: 'var(--text)', fontWeight: 500 }}>
        {text}
      </div>
    </div>
  );
}
