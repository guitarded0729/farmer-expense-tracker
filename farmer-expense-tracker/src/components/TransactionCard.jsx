import React from 'react';
import { Tag, Calendar, FileText, Trash2, Pencil, Users } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function TransactionCard({
  tx,
  onEdit,
  onDelete,
  fields = [],
  CATEGORIES = {},
  INCOME_CATEGORIES = {},
  fmt,
  onViewReceipt
}) {
  const isExpense = tx.type === 'expense';
  const categoryConfig = isExpense ? CATEGORIES[tx.category] : INCOME_CATEGORIES[tx.category];
  const Icon = categoryConfig ? categoryConfig.icon : Tag;
  const color = categoryConfig ? categoryConfig.color : 'var(--text-soft)';
  const label = categoryConfig ? categoryConfig.label : tx.category;

  const matchedField = fields.find((f) => String(f.id) === String(tx.fieldId));
  const hasSplit = tx.splitNames && tx.splitNames.trim() !== '';

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '16px',
      borderLeft: `4px solid ${isExpense ? 'var(--danger)' : 'var(--positive)'}`,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, wordBreak: 'break-word' }}>
              <span style={{ color: color, display: 'inline-flex', flexShrink: 0 }}><Icon size={14} /></span>
              {label}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <Calendar size={11} /> {tx.date}
            </span>
            {tx.crop && (
              <span className="badge badge-neutral" style={{ fontSize: 10, padding: '2px 6px' }}>
                🌾 {tx.crop}
              </span>
            )}
            {matchedField && (
              <span className="badge badge-neutral" style={{ fontSize: 10, padding: '2px 6px' }}>
                📍 {matchedField.name}
              </span>
            )}
          </div>
          {tx.note && (
            <p style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 6, fontStyle: 'italic', wordBreak: 'break-word' }}>
              "{tx.note}"
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span className="display-font tabular" style={{
            fontSize: 16,
            fontWeight: 700,
            color: isExpense ? 'var(--danger)' : 'var(--positive)',
            whiteSpace: 'nowrap'
          }}>
            {isExpense ? '−' : '+'}{fmt(tx.amount)}
          </span>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            {hasSplit && (
              <span title="Shared Split transaction" style={{ color: 'var(--sky)', display: 'inline-flex' }}>
                <Users size={14} />
              </span>
            )}
            {tx.unusual && (
              <span className="badge badge-danger" style={{ fontSize: 9, padding: '1px 4px' }}>
                OUTLIER
              </span>
            )}
            {tx.receipt && onViewReceipt && (
              <button
                className="btn"
                style={{ padding: 4, borderRadius: 4, height: 22 }}
                onClick={() => onViewReceipt(tx)}
                title="View Receipt"
              >
                <FileText size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 8,
        borderTop: '1px solid var(--line)',
        paddingTop: 8,
        marginTop: 4
      }}>
        {onEdit && (
          <button className="btn" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => onEdit(tx)}>
            <Pencil size={11} /> Edit
          </button>
        )}
        {onDelete && (
          <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => onDelete(tx.id)}>
            <Trash2 size={11} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}
