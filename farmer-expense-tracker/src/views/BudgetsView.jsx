import React, { useState, useMemo } from 'react';
import { Target, Sparkles, Plus } from 'lucide-react';
import BudgetCard from '../components/BudgetCard';
import Modal from '../components/Modal';

export default function BudgetsView({
  transactions = [],
  budgets = [],
  activeSeason,
  activeFarmer,
  onSaveBudget,
  CATEGORIES,
  fmt
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState('');
  const [limitVal, setLimitVal] = useState('');

  // 1. Calculate spent totals by category for active season
  const categoryTotals = useMemo(() => {
    if (!activeSeason || !activeFarmer) return {};
    const map = {};
    transactions
      .filter((t) => t.type === 'expense' && t.seasonId === activeSeason.id && t.farmerId === activeFarmer.id)
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + Number(t.amount);
      });
    return map;
  }, [transactions, activeSeason, activeFarmer]);

  // 2. Budget limits map by category
  const budgetMap = useMemo(() => {
    return budgets || {};
  }, [budgets]);

  // Open Edit Modal
  const handleOpenEdit = (cat) => {
    setSelectedCat(cat);
    setLimitVal(budgetMap[cat] || '');
    setShowEditModal(true);
  };

  // Save Budget limit
  const handleSave = () => {
    if (!limitVal || isNaN(limitVal) || Number(limitVal) < 0) {
      alert('Please enter a valid non-negative budget limit.');
      return;
    }

    onSaveBudget({
      seasonId: activeSeason.id,
      farmerId: activeFarmer.id,
      category: selectedCat,
      amount: Number(limitVal)
    });
    
    setShowEditModal(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* View Header */}
      <div>
        <h3 className="display-font" style={{ fontSize: 18, marginBottom: 4 }}>Season Budgets</h3>
        <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>
          Set limits for categories in {activeSeason?.name} to monitor operational overruns.
        </p>
      </div>

      {/* Grid of Budget Cards */}
      <div className="grid-responsive-cards">
        {Object.keys(CATEGORIES).map((key) => {
          const limit = budgetMap[key] || 0;
          const spent = categoryTotals[key] || 0;
          return (
            <BudgetCard
              key={key}
              category={key}
              label={CATEGORIES[key].label}
              limit={limit}
              spent={spent}
              onEdit={() => handleOpenEdit(key)}
              fmt={fmt}
            />
          );
        })}
      </div>

      {/* Edit Budget Modal */}
      <Modal
        isOpen={showEditModal}
        title={`✏️ Edit ${CATEGORIES[selectedCat]?.label || selectedCat} Budget Limit`}
        onClose={() => setShowEditModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <span className="form-label">Budget Limit (INR ₹)</span>
            <input
              type="number"
              inputMode="decimal"
              className="form-input"
              style={{ fontSize: 16, fontWeight: 700 }}
              placeholder="e.g. 30000"
              value={limitVal}
              onChange={(e) => setLimitVal(e.target.value)}
            />
            <span style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 4, display: 'block' }}>
              Set to 0 to remove budget constraints for this category.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn" style={{ flex: '1 1 100px' }} onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" style={{ flex: '1 1 140px' }} onClick={handleSave}>
              Save Budget Limit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
