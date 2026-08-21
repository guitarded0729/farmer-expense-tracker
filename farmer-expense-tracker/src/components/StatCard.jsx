import React from 'react';
import StatusBadge from './StatusBadge';

export default function StatCard({ title, value, icon: Icon, trend, subtext, color = 'var(--primary)' }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-soft)' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            padding: 8,
            borderRadius: 6,
            backgroundColor: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 className="display-font tabular" style={{ fontSize: 28, margin: 0, lineHeight: 1.1 }}>
          {value}
        </h2>
        
        {(trend || subtext) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
            {trend && (
              <StatusBadge
                status={trend.type}
                text={trend.text}
              />
            )}
            {subtext && (
              <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>
                {subtext}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
