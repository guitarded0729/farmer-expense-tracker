import React, { useMemo } from 'react';
import {
  Coins,
  TrendingDown,
  TrendingUp,
  TrendingDown as LossIcon,
  Sparkles,
  Info,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export default function DashboardView({
  transactions = [],
  budgets = [],
  seasons = [],
  fields = [],
  activeSeason,
  activeFarmer,
  farmers = [],
  onNavigate,
  onAddExpenseClick,
  onAddIncomeClick,
  setActiveSeasonId,
  onAddPlotClick,
  onAddSeasonClick,
  onAddFarmerClick,
  fmt
}) {
  const { t, lang } = useTranslation();

  // 1. Calculations for current season
  const currentTxs = useMemo(() => {
    if (!activeSeason || !activeFarmer) return [];
    return transactions.filter(
      (t) => t.seasonId === activeSeason.id && t.farmerId === activeFarmer.id
    );
  }, [transactions, activeSeason, activeFarmer]);

  const { incomeTotal, expenseTotal, netProfit } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    currentTxs.forEach((t) => {
      if (t.type === 'income') inc += Number(t.amount);
      else exp += Number(t.amount);
    });
    return { incomeTotal: inc, expenseTotal: exp, netProfit: inc - exp };
  }, [currentTxs]);

  // 2. Budget adherence Calculations
  const activeBudgets = useMemo(() => {
    if (!budgets) return [];
    return Object.keys(budgets).map((cat) => ({
      category: cat,
      amount: budgets[cat]
    }));
  }, [budgets]);

  const budgetTotal = useMemo(() => {
    return activeBudgets.reduce((total, b) => total + Number(b.amount || 0), 0);
  }, [activeBudgets]);

  const budgetStatus = useMemo(() => {
    if (budgetTotal === 0) return 'no_budget';
    if (expenseTotal > budgetTotal) return 'over';
    if (expenseTotal >= budgetTotal * 0.8) return 'close';
    return 'within';
  }, [expenseTotal, budgetTotal]);

  const budgetStatusText = () => {
    switch (budgetStatus) {
      case 'over':
        return `🔴 ${t('budget.over')} (${fmt(expenseTotal - budgetTotal)} ${t('prediction.exceed_warn').replace('{amount}', '')})`;
      case 'close':
        return `🟡 ${t('budget.close')}`;
      case 'within':
        return `🟢 ${t('budget.within')}`;
      default:
        return '';
    }
  };

  // 3. ML Predictions OLS Trend
  const seasonStats = useMemo(() => {
    if (!activeFarmer) return [];
    const map = {};
    transactions
      .filter((t) => t.farmerId === activeFarmer.id && t.type === 'expense')
      .forEach((t) => {
        map[t.seasonId] = (map[t.seasonId] || 0) + Number(t.amount);
      });
    return seasons
      .map((s) => ({ id: s.id, order: s.sortOrder, spent: map[s.id] || 0 }))
      .sort((a, b) => a.order - b.order)
      .filter((s) => s.spent > 0);
  }, [transactions, activeFarmer, seasons]);

  const nextSeasonForecast = useMemo(() => {
    // Group transaction totals by season order
    const map = {};
    transactions
      .filter((t) => t.farmerId === activeFarmer.id && t.type === 'expense')
      .forEach((t) => {
        map[t.seasonId] = (map[t.seasonId] || 0) + Number(t.amount);
      });

    // Sort seasons to find OLS regression trend
    const stats = transactions
      .map(t => t.seasonId)
      .filter((v, i, self) => self.indexOf(v) === i)
      .map((sId) => {
        const matchingSeason = budgets && budgets.seasonId ? { id: sId, order: 1 } : { id: sId, order: 1 };
        return { id: sId, spent: map[sId] || 0 };
      })
      .filter((s) => s.spent > 0);

    const n = stats.length;
    if (n < 2) return null; // Simple heuristic for estimation

    const sx = stats.reduce((sum, s, idx) => sum + idx, 0);
    const sy = stats.reduce((sum, s) => sum + s.spent, 0);
    const sxy = stats.reduce((sum, s, idx) => sum + idx * s.spent, 0);
    const sxx = stats.reduce((sum, s, idx) => sum + idx * idx, 0);

    const denom = n * sxx - sx * sx;
    if (denom === 0) return { amount: sy / n };
    const slope = (n * sxy - sx * sy) / denom;
    const intercept = (sy - slope * sx) / n;

    const predictedVal = slope * n + intercept;
    return { amount: Math.max(predictedVal, 0) };
  }, [transactions, activeFarmer, budgets]);

  const categoryIcons = {
    seeds: '🌱',
    fertilizer: '🧪',
    labor: '👨‍🌾',
    equipment: '🚜',
    irrigation: '💧',
    pesticides: '🐛',
    transportation: '🚚',
    maintenance: '🛠',
    other: '🏷',
    crop_sale: '🌾',
    subsidy: '🏛',
    produce_sale: '🥛'
  };

  const getCategoryLabel = (cat, type) => {
    if (type === 'income') {
      return t('income_categories.' + cat);
    }
    return t('categories.' + cat);
  };

  const seasonProgressPct = budgetTotal > 0 ? (expenseTotal / budgetTotal) * 100 : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Welcome & Language */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="display-font" style={{ fontSize: 24, marginBottom: 4 }}>
            {t('home.greeting')} {activeFarmer?.name || 'Farmer'} 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-soft)' }}>
            {t('home.subtext')}
          </p>
        </div>
      </div>

      {/* Season timeline tag */}
      <div style={{
        backgroundColor: 'var(--primary-soft)',
        padding: '8px 14px',
        borderRadius: 'var(--radius-md)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 14,
        fontWeight: 700,
        color: 'var(--primary-dark)',
        alignSelf: 'flex-start'
      }}>
        <span>📅</span>
        <span>{t('home.this_season')}</span>
        <select
          value={activeSeason?.id || ''}
          onChange={(e) => setActiveSeasonId && setActiveSeasonId(e.target.value)}
          className="form-select"
          style={{
            background: 'transparent',
            border: 'none',
            fontWeight: 700,
            color: 'var(--primary-dark)',
            padding: '0 24px 0 0',
            width: 'auto',
            height: 'auto',
            cursor: 'pointer',
            fontSize: 14,
            outline: 'none',
            boxShadow: 'none'
          }}
        >
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Main Income / Expense / Profit Display */}
      <div className="grid-summary-cards">
        {/* Spent */}
        <div className="card" style={{ borderLeft: '5px solid var(--danger)', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-soft)', fontSize: 13, fontWeight: 600 }}>
            <TrendingDown size={16} color="var(--danger)" />
            <span>{t('home.you_spent')}</span>
          </div>
          <h2 style={{ fontSize: 24, margin: '8px 0 0', fontWeight: 800 }} className="tabular">
            {fmt(expenseTotal)}
          </h2>
        </div>

        {/* Earned */}
        <div className="card" style={{ borderLeft: '5px solid var(--positive)', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-soft)', fontSize: 13, fontWeight: 600 }}>
            <Coins size={16} color="var(--positive)" />
            <span>{t('home.you_earned')}</span>
          </div>
          <h2 style={{ fontSize: 24, margin: '8px 0 0', fontWeight: 800 }} className="tabular">
            {fmt(incomeTotal)}
          </h2>
        </div>

        {/* Profit */}
        <div className="card" style={{ borderLeft: `5px solid ${netProfit >= 0 ? 'var(--primary)' : 'var(--danger)'}`, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-soft)', fontSize: 13, fontWeight: 600 }}>
            {netProfit >= 0 ? <TrendingUp size={16} color="var(--positive)" /> : <LossIcon size={16} color="var(--danger)" />}
            <span>{t('home.your_profit')}</span>
          </div>
          <h2 style={{
            fontSize: 24,
            margin: '8px 0 0',
            fontWeight: 800,
            color: netProfit >= 0 ? 'var(--positive)' : 'var(--danger)'
          }} className="tabular">
            {(netProfit >= 0 ? '' : '−') + fmt(Math.abs(netProfit))}
          </h2>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        <h3 className="display-font" style={{ fontSize: 16, margin: '0 0 4px' }}>
          ⚡ {t('common.quick_actions')}
        </h3>
        <div className="grid-quick-actions">
          {/* Add Expense */}
          <button
            className="btn btn-primary"
            style={{ padding: '12px 14px', fontSize: 14, fontWeight: 700, borderRadius: 'var(--radius-md)', justifyContent: 'center', height: 48 }}
            onClick={onAddExpenseClick}
          >
            <Plus size={16} /> {t('common.add_expense')}
          </button>

          {/* Add Income */}
          <button
            className="btn"
            style={{
              padding: '12px 14px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              justifyContent: 'center',
              height: 48,
              backgroundColor: 'var(--positive-soft)',
              borderColor: 'var(--positive)',
              color: 'var(--positive)'
            }}
            onClick={onAddIncomeClick}
          >
            <Plus size={16} /> {t('common.add_income')}
          </button>

          {/* Add Season */}
          <button
            className="btn"
            style={{
              padding: '12px 14px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              justifyContent: 'center',
              height: 48,
              backgroundColor: 'var(--primary-soft)',
              borderColor: 'var(--primary)',
              color: 'var(--primary-dark)'
            }}
            onClick={onAddSeasonClick}
          >
            <Plus size={16} /> {t('common.add_season')}
          </button>

          {/* Add Farmer */}
          <button
            className="btn"
            style={{
              padding: '12px 14px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              justifyContent: 'center',
              height: 48,
              backgroundColor: '#e0f2fe',
              borderColor: '#0284c7',
              color: '#0369a1'
            }}
            onClick={onAddFarmerClick}
          >
            <Plus size={16} /> {t('common.add_farmer')}
          </button>
        </div>
      </div>

      {/* Season Budget Progress */}
      {budgetTotal > 0 ? (
        <div className="card" style={{ padding: 18, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 className="display-font" style={{ fontSize: 16, margin: 0 }}>
              🎯 {t('budget.heading')}
            </h3>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              {budgetStatusText()}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-soft)', marginBottom: 8 }}>
            <span>{fmt(expenseTotal)} / {fmt(budgetTotal)}</span>
            {budgetTotal > expenseTotal && (
              <span>{fmt(budgetTotal - expenseTotal)} {t('budget.remaining')}</span>
            )}
          </div>

          <div style={{ width: '100%', height: 12, backgroundColor: 'var(--bg-dark)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(seasonProgressPct, 100)}%`,
              height: '100%',
              backgroundColor: expenseTotal > budgetTotal ? 'var(--danger)' : 'var(--primary)',
              borderRadius: 6,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 18, textAlign: 'center', color: 'var(--text-soft)', marginTop: 8 }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            🎯 {t('budget.heading')}: {t('common.no_field').replace('No Field Associated', 'No Budget Limits Set')}
          </p>
          <button 
            className="btn btn-secondary" 
            style={{ marginTop: 10, fontSize: 12, padding: '6px 12px' }}
            onClick={() => onNavigate('budgets')}
          >
            {t('budget.edit_budget')}
          </button>
        </div>
      )}

      {/* Next Season OLS Forecast Widget */}
      {nextSeasonForecast ? (
        <div className="card" style={{
          border: '1px solid rgba(46, 125, 50, 0.3)',
          background: 'linear-gradient(135deg, #ffffff 0%, var(--primary-soft) 100%)',
          padding: 18,
          marginTop: 4
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Sparkles size={16} color="var(--primary)" />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-dark)' }}>
              🔮 {t('prediction.heading')}
            </span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: '0 0 12px' }}>
            {t('prediction.based_on')}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-soft)', display: 'block' }}>{t('prediction.expected')}</span>
              <strong style={{ fontSize: 24, fontWeight: 800 }}>{fmt(nextSeasonForecast.amount)}</strong>
            </div>
            {budgetTotal > 0 && (
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-soft)', display: 'block' }}>{t('prediction.your_budget')}</span>
                <strong style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-soft)' }}>{fmt(budgetTotal)}</strong>
              </div>
            )}
          </div>

          <div style={{
            borderTop: '1px dashed var(--line)',
            paddingTop: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: nextSeasonForecast.amount > budgetTotal && budgetTotal > 0 ? 'var(--danger)' : 'var(--positive)', flex: 1, minWidth: 200 }}>
              {budgetTotal > 0 ? (
                nextSeasonForecast.amount > budgetTotal ? (
                  `🔴 ${t('prediction.exceed_statement')} (${t('prediction.exceed_warn').replace('{amount}', fmt(nextSeasonForecast.amount - budgetTotal))})`
                ) : (
                  `🟢 ${t('prediction.within_warn')}`
                )
              ) : (
                `🟢 ${t('prediction.expected')} ${fmt(nextSeasonForecast.amount)}`
              )}
            </span>
            <button
              className="btn btn-secondary touch-target"
              style={{ padding: '8px 14px', fontSize: 12, borderRadius: 'var(--radius-md)' }}
              onClick={() => onNavigate('prediction')}
            >
              {t('common.see_details')} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 18, marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Sparkles size={16} color="var(--text-soft)" />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-soft)' }}>
              🔮 {t('prediction.heading')}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: 0, lineHeight: 1.4 }}>
            📊 {t('prediction.insufficient_data')}
          </p>
        </div>
      )}

      {/* My Plots (Fields) List Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
          <h3 className="display-font" style={{ fontSize: 16, margin: 0 }}>
            📍 {t('fields.my_fields')}
          </h3>
          <button
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: 12, borderRadius: 'var(--radius-md)' }}
            onClick={onAddPlotClick}
          >
            <Plus size={14} /> {t('fields.add_field')}
          </button>
        </div>

        {fields.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-soft)', fontSize: 13 }}>
            No field plots mapped yet.
          </div>
        ) : (
          <div className="grid-responsive-cards">
            {fields.map((f) => (
              <div
                key={f.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--line)',
                  backgroundColor: 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🌾</span> {f.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                  {f.crop || 'No Crop'} • {f.area} {t(`fields.${f.areaUnit || 'acres'}`) || f.areaUnit || 'acres'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Farmers List Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
          <h3 className="display-font" style={{ fontSize: 16, margin: 0 }}>
            👨‍🌾 {t('common.my_farmers')}
          </h3>
          <button
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: 12, borderRadius: 'var(--radius-md)' }}
            onClick={onAddFarmerClick}
          >
            <Plus size={14} /> {t('common.add_farmer')}
          </button>
        </div>

        <div className="grid-responsive-cards">
          {farmers
            .filter((f) => f.farmName === activeFarmer.farmName)
            .map((f) => (
              <div
                key={f.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--line)',
                  backgroundColor: 'var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-inverse)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 14
                }}>
                  {f.name ? f.name[0].toUpperCase() : 'F'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                    {f.role}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
          <h3 className="display-font" style={{ fontSize: 16, margin: 0 }}>
            🕒 {t('home.recent_expenses')}
          </h3>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: 12, borderRadius: 'var(--radius-md)' }}
            onClick={() => onNavigate('expenses')}
          >
            {t('common.view_all')} <ChevronRight size={12} />
          </button>
        </div>

        {currentTxs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-soft)', fontSize: 13 }}>
            {t('home.no_transactions')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {currentTxs.slice(0, 3).map((tx) => {
              const icon = categoryIcons[tx.category] || '🏷';
              const label = getCategoryLabel(tx.category, tx.type);
              const isExpense = tx.type === 'expense';
              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--line)',
                    backgroundColor: 'var(--surface)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                        {tx.date} {tx.crop ? `• 🌾 ${tx.crop}` : ''}
                      </div>
                    </div>
                  </div>
                  <strong
                    style={{
                      fontSize: 16,
                      color: isExpense ? 'var(--danger)' : 'var(--positive)'
                    }}
                    className="tabular"
                  >
                    {isExpense ? '−' : '+'}{fmt(tx.amount)}
                  </strong>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
