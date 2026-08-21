import React from 'react';
import { Pencil } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function BudgetCard({ category, label, limit, spent, onEdit, fmt }) {
  const pct = limit > 0 ? (spent / limit) * 100 : 0;
  const isOver = spent > limit;
  const isNear = !isOver && pct >= 80;
  
  let barColor = 'var(--primary)';
  let statusText = 'On Track';
  let statusType = 'success';

  if (isOver) {
    barColor = 'var(--danger)';
    statusText = `${fmt(spent - limit)} Over Budget`;
    statusType = 'danger';
  } else if (isNear) {
    barColor = 'var(--warning)';
    statusText = '80% Used';
    statusType = 'warning';
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="display-font" style={{ fontSize: 16 }}>{label}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusBadge status={statusType} text={statusText} />
          {onEdit && (
            <button
              className="btn"
              style={{ padding: 6, borderRadius: '50%' }}
              onClick={onEdit}
              title="Edit Budget Limit"
            >
              <Pencil size={12} />
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-soft)' }}>
        <div>
          Spent: <strong style={{ color: 'var(--text)' }} className="mono-font">{fmt(spent)}</strong>
        </div>
        <div>
          Limit: <span className="mono-font">{fmt(limit)}</span>
        </div>
      </div>

      <div style={{ width: '100%', height: 8, backgroundColor: 'var(--bg-dark)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          width: `${Math.min(pct, 100)}%`,
          height: '100%',
          backgroundColor: barColor,
          borderRadius: 4,
          transition: 'width 0.3s ease'
        }} />
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-soft)', textAlign: 'right' }}>
        {Math.round(pct)}% of safety limit
      </div>
    </div>
  );
}
