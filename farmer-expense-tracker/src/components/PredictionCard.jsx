import React from 'react';
import { Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function PredictionCard({ predictedAmt, changePct, recommendedAmt, onApply, fmt }) {
  const isIncrease = changePct > 0;
  
  return (
    <div className="card" style={{
      border: '1px solid rgba(46, 125, 50, 0.3)',
      background: 'linear-gradient(135deg, #ffffff 0%, var(--primary-soft) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Visual background decoration */}
      <div style={{
        position: 'absolute',
        top: -10,
        right: -10,
        opacity: 0.05,
        color: 'var(--primary)'
      }}>
        <Sparkles size={80} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Sparkles size={16} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.04em' }}>
          🔮 Next Season ML Forecast
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 11, color: 'var(--text-soft)', display: 'block', marginBottom: 2 }}>
            PREDICTED TOTAL SPEND
          </span>
          <span className="display-font tabular" style={{ fontSize: 24 }}>
            {fmt(predictedAmt)}
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            {isIncrease ? (
              <ArrowUpRight size={14} color="var(--danger)" />
            ) : (
              <ArrowDownRight size={14} color="var(--positive)" />
            )}
            <span style={{ fontSize: 11, fontWeight: 600, color: isIncrease ? 'var(--danger)' : 'var(--positive)' }}>
              {Math.abs(changePct).toFixed(1)}% {isIncrease ? 'increase' : 'decrease'} vs last season
            </span>
          </div>
        </div>

        <div>
          <span style={{ fontSize: 11, color: 'var(--text-soft)', display: 'block', marginBottom: 2 }}>
            RECOMMENDED BUDGET (+10% margin)
          </span>
          <span className="display-font tabular" style={{ fontSize: 24, color: 'var(--primary)' }}>
            {fmt(recommendedAmt)}
          </span>
          
          {onApply && (
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: 11, marginTop: 8 }}
              onClick={onApply}
            >
              Apply Recommended Budget
            </button>
          )}
        </div>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-soft)', margin: 0, borderTop: '1px dashed var(--line)', paddingTop: 10 }}>
        * Calculated using OLS Linear Regression across all logged seasons. Budgets can be modified manually inside the Budget Manager.
      </p>
    </div>
  );
}
