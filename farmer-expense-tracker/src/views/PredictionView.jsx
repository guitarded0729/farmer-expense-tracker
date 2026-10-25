import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { Sparkles, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import ChartCard from '../components/ChartCard';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

export default function PredictionView({
  transactions = [],
  seasons = [],
  activeSeason,
  activeFarmer,
  budgets = [],
  onApplyRecommendedBudget,
  CATEGORIES,
  fmt
}) {
  // 1. Group transaction totals by season order
  const seasonStats = useMemo(() => {
    if (!activeFarmer) return [];
    const map = {};
    transactions
      .filter((t) => t.farmerId === activeFarmer.id && t.type === 'expense')
      .forEach((t) => {
        map[t.seasonId] = (map[t.seasonId] || 0) + Number(t.amount);
      });
    return seasons
      .map((s) => ({
        id: s.id,
        name: s.name,
        order: s.sortOrder,
        spent: map[s.id] || 0
      }))
      .sort((a, b) => a.order - b.order)
      .filter((s) => s.spent > 0);
  }, [transactions, activeFarmer, seasons]);

  const hasData = seasonStats.length >= 3;

  // 2. Perform OLS Regression on Total Spend
  const totalForecast = useMemo(() => {
    if (!hasData) return null;
    const n = seasonStats.length;

    const sx = seasonStats.reduce((sum, s, idx) => sum + idx, 0);
    const sy = seasonStats.reduce((sum, s) => sum + s.spent, 0);
    const sxy = seasonStats.reduce((sum, s, idx) => sum + idx * s.spent, 0);
    const sxx = seasonStats.reduce((sum, s, idx) => sum + idx * idx, 0);

    const denom = n * sxx - sx * sx;
    if (denom === 0) return { amount: sy / n, changePct: 0 };
    const slope = (n * sxy - sx * sy) / denom;
    const intercept = (sy - slope * sx) / n;

    const predictedVal = slope * n + intercept;
    const lastSpent = seasonStats[n - 1].spent;
    const change = lastSpent > 0 ? ((predictedVal - lastSpent) / lastSpent) * 100 : 0;

    return {
      amount: Math.max(predictedVal, 0),
      slope,
      intercept,
      changePct: change
    };
  }, [seasonStats, hasData]);

  // 3. Category-wise OLS predictions
  const categoryPredictions = useMemo(() => {
    if (!hasData || !activeFarmer) return [];
    
    // Group category spent by season
    const catMap = {};
    transactions
      .filter((t) => t.farmerId === activeFarmer.id && t.type === 'expense')
      .forEach((t) => {
        if (!catMap[t.category]) catMap[t.category] = {};
        catMap[t.category][t.seasonId] = (catMap[t.category][t.seasonId] || 0) + Number(t.amount);
      });

    const budgetLimitMap = budgets || {};

    const result = [];
    Object.keys(CATEGORIES).forEach((cat) => {
      const dataPoints = seasonStats.map((s, idx) => ({
        x: idx,
        y: catMap[cat]?.[s.id] || 0
      }));

      const n = dataPoints.length;
      const sx = dataPoints.reduce((sum, p) => sum + p.x, 0);
      const sy = dataPoints.reduce((sum, p) => sum + p.y, 0);
      const sxy = dataPoints.reduce((sum, p) => sum + p.x * p.y, 0);
      const sxx = dataPoints.reduce((sum, p) => sum + p.x * p.x, 0);

      const denom = n * sxx - sx * sx;
      let slope = 0;
      let intercept = 0;
      if (denom !== 0) {
        slope = (n * sxy - sx * sy) / denom;
        intercept = (sy - slope * sx) / n;
      } else {
        intercept = sy / n;
      }

      const predictedVal = Math.max(slope * n + intercept, 0);
      const budgetLimit = budgetLimitMap[cat] || 0;
      const isOver = budgetLimit > 0 && predictedVal > budgetLimit;

      result.push({
        category: cat,
        label: CATEGORIES[cat].label,
        predicted: predictedVal,
        budget: budgetLimit,
        isOver
      });
    });

    return result;
  }, [hasData, transactions, activeFarmer, seasonStats, budgets, activeSeason, CATEGORIES]);

  // 4. Line Chart points list
  const chartData = useMemo(() => {
    if (!hasData || !totalForecast) return [];
    
    // Historical points
    const points = seasonStats.map((s) => ({
      name: s.name,
      Spent: s.spent,
      type: 'historical'
    }));

    // Forecasted next season point
    points.push({
      name: 'Next Season (Forecast)',
      Forecast: totalForecast.amount,
      type: 'prediction'
    });

    return points;
  }, [seasonStats, hasData, totalForecast]);

  if (!hasData) {
    return (
      <EmptyState
        icon={Sparkles}
        title="🔮 Next Season Prediction"
        description={`Add agricultural transactions across 3 or more seasons to enable our Linear Regression OLS trend predictor.`}
      />
    );
  }

  const recBudget = totalForecast.amount * 1.10;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Overview stats block */}
      <div className="grid-prediction-overview">
        
        {/* ML Forecast summary card */}
        <div className="card" style={{
          border: '1px solid rgba(46, 125, 50, 0.3)',
          background: 'linear-gradient(135deg, #ffffff 0%, var(--primary-soft) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 16
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Sparkles size={16} color="var(--primary)" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)' }}>
                🔮 OLS NEXT-SEASON FORECAST
              </span>
            </div>

            <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>EXPECTED TOTAL SPEND</span>
            <h2 className="display-font tabular" style={{ fontSize: 36, margin: '2px 0 6px', color: 'var(--primary-dark)' }}>
              {fmt(totalForecast.amount)}
            </h2>
            
            <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: 0 }}>
              Based on historical data from <strong>{seasonStats.length} seasons</strong>. Spending is predicted to change by{' '}
              <strong style={{ color: totalForecast.changePct > 0 ? 'var(--danger)' : 'var(--positive)' }}>
                {totalForecast.changePct > 0 ? '↑' : '↓'} {Math.abs(totalForecast.changePct).toFixed(1)}%
              </strong>{' '}
              compared to the last active season.
            </p>
          </div>

          {/* Suggested safety margin budgets button */}
          {onApplyRecommendedBudget && (
            <div style={{ borderTop: '1px dashed var(--line)', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-soft)', display: 'block' }}>RECOMMENDED SAFETY BUDGET (+10% margin)</span>
                  <strong className="mono-font" style={{ fontSize: 16 }}>{fmt(recBudget)}</strong>
                </div>
                <button className="btn btn-primary" style={{ minHeight: 44 }} onClick={() => onApplyRecommendedBudget(recBudget)}>
                  Apply Recommended Budget
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Categories overruns checklist alerts */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 className="display-font" style={{ fontSize: 16, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
            🎯 Budget Threshold Warnings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: 180 }}>
            {categoryPredictions.filter((p) => p.isOver).map((p) => (
              <div key={p.category} style={{
                display: 'flex',
                gap: 10,
                padding: '10px 12px',
                backgroundColor: 'var(--danger-soft)',
                border: '1px solid rgba(211, 47, 47, 0.15)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12
              }}>
                <AlertTriangle size={15} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <strong>{p.label}</strong> is predicted to exceed budget by <strong>{fmt(p.predicted - p.budget)}</strong>.
                  <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 2 }}>
                    Budget: {fmt(p.budget)} | Expected: {fmt(p.predicted)}
                  </div>
                </div>
              </div>
            ))}
            {categoryPredictions.filter((p) => !p.isOver && p.budget > 0).map((p) => (
              <div key={p.category} style={{
                display: 'flex',
                gap: 10,
                padding: '10px 12px',
                backgroundColor: 'var(--positive-soft)',
                border: '1px solid rgba(46, 125, 50, 0.15)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12
              }}>
                <CheckCircle size={15} color="var(--positive)" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <strong>{p.label}</strong> budget is on track.
                  <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 2 }}>
                    Budget: {fmt(p.budget)} | Expected Spent: {fmt(p.predicted)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Regression LineChart */}
      <ChartCard title="🔮 OLS Linear Regression Trend Analysis" height={320}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
            <XAxis dataKey="name" stroke="var(--text-soft)" style={{ fontSize: 10 }} />
            <YAxis stroke="var(--text-soft)" style={{ fontSize: 10 }} />
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 4 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="Spent"
              stroke="var(--primary)"
              strokeWidth={3}
              activeDot={{ r: 8 }}
              name="Historical Seasons Spend"
            />
            <Line
              type="monotone"
              dataKey="Forecast"
              stroke="var(--sky)"
              strokeWidth={3}
              strokeDasharray="5 5"
              name="Predicted Next Season Spend"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Categories Forecast grid */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 className="display-font" style={{ fontSize: 16, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
          📋 Expected Next-Season Costs by Category
        </h3>
        <div className="grid-responsive-cards">
          {categoryPredictions.map((p) => (
            <div key={p.category} style={{
              padding: 12,
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 600 }}>{p.label}</span>
              <strong className="mono-font" style={{ fontSize: 16, color: p.isOver ? 'var(--danger)' : 'var(--text)' }}>
                {fmt(p.predicted)}
              </strong>
              {p.budget > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
                  <span style={{ color: 'var(--text-soft)' }}>Budget: {fmt(p.budget)}</span>
                  <span style={{ color: p.isOver ? 'var(--danger)' : 'var(--positive)', fontWeight: 600 }}>
                    {p.isOver ? 'Exceeds' : 'Within'}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 4 }}>No budget allocated</span>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
