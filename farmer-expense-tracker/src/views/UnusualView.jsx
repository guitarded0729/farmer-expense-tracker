import React, { useMemo } from 'react';
import { AlertTriangle, Tag, Calendar, Info } from 'lucide-react';
import TransactionCard from '../components/TransactionCard';
import EmptyState from '../components/EmptyState';
import InsightCard from '../components/InsightCard';

export default function UnusualView({
  transactions = [],
  fields = [],
  activeSeason,
  activeFarmer,
  onDeleteTransaction,
  CATEGORIES,
  fmt
}) {
  // 1. Get current season unusual expenses
  const unusualTxs = useMemo(() => {
    if (!activeSeason || !activeFarmer) return [];
    return transactions.filter(
      (t) => t.type === 'expense' && t.seasonId === activeSeason.id && t.farmerId === activeFarmer.id && t.unusual
    );
  }, [transactions, activeSeason, activeFarmer]);

  // 2. Count unusual flags per category to detect repeated ones
  const repeatUnusual = useMemo(() => {
    const counts = {};
    unusualTxs.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return Object.keys(counts).filter((cat) => counts[cat] >= 2);
  }, [unusualTxs]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h3 className="display-font" style={{ fontSize: 18, marginBottom: 4 }}>Unusual Operational Outliers</h3>
        <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>
          Review costs that were manually flagged as unusual anomalies during tracking in {activeSeason?.name}.
        </p>
      </div>

      {/* Repeated outlier warning alert */}
      {repeatUnusual.length > 0 && (
        <InsightCard
          type="danger"
          icon={AlertTriangle}
          text={`Repeated Outliers: The categories [${repeatUnusual.map(k => CATEGORIES[k]?.label || k).join(', ')}] have been flagged as unusual multiple times this season. Please inspect these sectors for cost leakages.`}
        />
      )}

      {/* List */}
      {unusualTxs.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="⚠️ No unusual costs logged"
          description="Operational outliers are expenses that differ significantly from standard costs. You can flag them inside the expense creation form."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {unusualTxs.map((tx) => (
            <TransactionCard
              key={tx.id}
              tx={tx}
              fields={fields}
              CATEGORIES={CATEGORIES}
              fmt={fmt}
              onDelete={onDeleteTransaction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
