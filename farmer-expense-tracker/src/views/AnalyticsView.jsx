import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { useTranslation } from '../context/LanguageContext';
import EmptyState from '../components/EmptyState';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsView({
  transactions = [],
  seasons = [],
  activeSeason,
  activeFarmer,
  CATEGORIES,
  fmt
}) {
  const { t, lang } = useTranslation();

  // Current Season Txs
  const currentTxs = useMemo(() => {
    if (!activeSeason || !activeFarmer) return [];
    return transactions.filter(
      (t) => t.seasonId === activeSeason.id && t.farmerId === activeFarmer.id
    );
  }, [transactions, activeSeason, activeFarmer]);

  // Group current season expenses by category
  const expenseStats = useMemo(() => {
    const map = {};
    let total = 0;
    currentTxs.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
      total += Number(t.amount);
    });

    return Object.keys(CATEGORIES).map((key) => ({
      category: key,
      label: t('categories.' + key),
      value: map[key] || 0,
      color: CATEGORIES[key].color,
      pct: total > 0 ? ((map[key] || 0) / total) * 100 : 0
    })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);
  }, [currentTxs, CATEGORIES, t]);

  // Recharts simple chart data
  const chartData = useMemo(() => {
    return expenseStats.map(s => ({
      name: s.label.replace(/^[^\s]+\s+/, ''), // strip emojis for chart label
      Spent: s.value
    }));
  }, [expenseStats]);

  // Compare seasons helper
  const prevSeason = useMemo(() => {
    if (!activeSeason) return null;
    const sorted = [...seasons].sort((a, b) => a.order - b.order);
    const currIdx = sorted.findIndex((s) => s.id === activeSeason.id);
    return currIdx > 0 ? sorted[currIdx - 1] : null;
  }, [seasons, activeSeason]);

  const { lastSeasonSpent, thisSeasonSpent } = useMemo(() => {
    let last = 0;
    let curr = 0;
    if (activeFarmer) {
      transactions.forEach((t) => {
        if (t.farmerId === activeFarmer.id && t.type === 'expense') {
          if (t.seasonId === activeSeason?.id) {
            curr += Number(t.amount);
          } else if (prevSeason && t.seasonId === prevSeason.id) {
            last += Number(t.amount);
          }
        }
      });
    }
    return { lastSeasonSpent: last, thisSeasonSpent: curr };
  }, [transactions, activeFarmer, activeSeason, prevSeason]);

  const varianceAmount = Math.abs(thisSeasonSpent - lastSeasonSpent);

  const categoryIcons = {
    seeds: '🌱',
    fertilizer: '🧪',
    labor: '👨‍🌾',
    equipment: '🚜',
    irrigation: '💧',
    pesticides: '🐛',
    transportation: '🚚',
    maintenance: '🛠',
    other: '🏷'
  };

  if (currentTxs.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title={t('expenses.no_expenses_found')}
        description={t('prediction.insufficient_data').replace('predictions', 'analytics')}
      />
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Title */}
      <div>
        <h3 className="display-font" style={{ fontSize: 18, marginBottom: 4 }}>
          {t('reports.where_money')}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>
          {t('home.this_season')} {activeSeason?.name}
        </p>
      </div>

      {/* Season Compare Alert (Variance) */}
      <div className="card" style={{ padding: 16 }}>
        <h4 className="display-font" style={{ fontSize: 15, marginBottom: 10 }}>
          📊 {t('reports.compare_last')}
        </h4>
        {prevSeason ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{t('reports.last_season')} ({prevSeason.name}):</span>
              <strong>{fmt(lastSeasonSpent)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              <span>{t('reports.this_season')} ({activeSeason.name}):</span>
              <strong>{fmt(thisSeasonSpent)}</strong>
            </div>
            <div style={{
              fontWeight: 700,
              fontSize: 15,
              color: thisSeasonSpent > lastSeasonSpent ? 'var(--danger)' : 'var(--positive)',
              marginTop: 4
            }}>
              {thisSeasonSpent > lastSeasonSpent ? (
                `⚠️ ${t('reports.spent_more').replace('{amount}', fmt(varianceAmount))}`
              ) : thisSeasonSpent < lastSeasonSpent ? (
                `🟢 ${t('reports.spent_less').replace('{amount}', fmt(varianceAmount))}`
              ) : (
                `🟢 Spending is identical to last season.`
              )}
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: 0 }}>
            ℹ️ {t('reports.no_historical')}
          </p>
        )}
      </div>

      {/* Category breakdown progress list */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h4 className="display-font" style={{ fontSize: 15 }}>
          📋 {t('reports.where_money')}
        </h4>
        
        {expenseStats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 12, color: 'var(--text-soft)', fontSize: 13 }}>
            {t('expenses.no_expenses_found')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {expenseStats.map((item) => {
              const icon = categoryIcons[item.category] || '🏷';
              return (
                <div key={item.category} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
                    <span>{icon} {item.label}</span>
                    <span className="tabular">{fmt(item.value)} ({Math.round(item.pct)}%)</span>
                  </div>
                  <div style={{ width: '100%', height: 8, backgroundColor: 'var(--bg-dark)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${item.pct}%`,
                      height: '100%',
                      backgroundColor: item.color || 'var(--primary)',
                      borderRadius: 4
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Simple Bar Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h4 className="display-font" style={{ fontSize: 15, marginBottom: 12 }}>
            📊 Spend Trend
          </h4>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" stroke="var(--text-soft)" style={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={40} />
                <YAxis stroke="var(--text-soft)" style={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 4 }} />
                <Bar dataKey="Spent" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
}
