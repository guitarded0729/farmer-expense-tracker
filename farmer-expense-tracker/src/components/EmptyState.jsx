import React from 'react';

export default function EmptyState({ icon: Icon, title, description, actionText, onAction }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '48px 24px',
      border: '2px dashed var(--line)',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: '#fcfbfa',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      {Icon && (
        <div style={{
          padding: 16,
          borderRadius: '50%',
          backgroundColor: 'var(--bg-dark)',
          color: 'var(--text-soft)',
          marginBottom: 16
        }}>
          <Icon size={32} />
        </div>
      )}
      <h3 className="display-font" style={{ fontSize: 18, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-soft)', maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.4 }}>
        {description}
      </p>
      {actionText && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
