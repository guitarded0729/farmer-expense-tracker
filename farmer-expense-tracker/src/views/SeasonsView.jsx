import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Eye, Calendar } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import Modal from '../components/Modal';

export default function SeasonsView({
  seasons = [],
  activeSeason,
  onAddSeason,
  onUpdateSeason,
  setActiveSeasonId,
  transactions = [],
  fields = [],
  activeFarmer,
  fmt
}) {
  const { t } = useTranslation();

  // Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [viewingSeason, setViewingSeason] = useState(null);
  const [name, setName] = useState('');
  
  // Confirmation state
  const [confirmationMsg, setConfirmationMsg] = useState('');

  const handleOpenAdd = () => {
    setName('');
    setEditingSeason(null);
    setConfirmationMsg('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (s) => {
    setName(s.name);
    setEditingSeason(s);
    setConfirmationMsg('');
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a season name.');
      return;
    }

    const payload = {
      name: name.trim()
    };

    try {
      if (editingSeason) {
        await onUpdateSeason(editingSeason.id, payload);
        setConfirmationMsg('Season updated successfully.');
      } else {
        await onAddSeason(payload);
        setConfirmationMsg(t('common.season_confirm') || '✓ Season added successfully.');
      }
      
      // Auto close modal after a brief delay so they see the success message
      setTimeout(() => {
        setShowAddModal(false);
        setConfirmationMsg('');
      }, 1000);
    } catch (err) {
      alert('Error saving season: ' + err.message);
    }
  };

  const handleView = (s) => {
    setViewingSeason(s);
    if (setActiveSeasonId) {
      setActiveSeasonId(s.id); // Set as active season
    }
    setShowDetailsModal(true);
  };

  // Helper to compute season financials
  const getSeasonStats = (seasonId) => {
    if (!activeFarmer) return { expenseTotal: 0, incomeTotal: 0, profit: 0, cropText: 'No Crop Listed' };

    const seasonTxs = transactions.filter((t) => t.seasonId === seasonId && t.farmerId === activeFarmer.id);
    const expenseTotal = seasonTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const incomeTotal = seasonTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    
    // Find crops from transactions and fields
    const txCrops = seasonTxs.map((t) => t.crop).filter(Boolean);
    const fieldCrops = fields.filter((f) => f.seasonId === seasonId).map((f) => f.crop).filter(Boolean);
    const allCrops = [...new Set([...txCrops, ...fieldCrops])];

    return {
      expenseTotal,
      incomeTotal,
      profit: incomeTotal - expenseTotal,
      cropText: allCrops.join(', ') || 'No Crop Listed'
    };
  };

  const sortedSeasons = [...seasons].sort((a, b) => a.order - b.order);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header controls bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 className="display-font" style={{ fontSize: 18 }}>🌾 {t('common.my_seasons') || 'My Seasons'}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>
            {t('common.manage_seasons') || 'Manage your farming seasons'}
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> {t('common.add_season') || 'Add New Season'}
        </button>
      </div>

      {/* Grid List of Seasons */}
      {sortedSeasons.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-soft)' }}>
          <Calendar size={36} style={{ margin: '0 auto 12px', color: 'var(--text-soft)' }} />
          <h4 className="display-font" style={{ fontSize: 16 }}>No seasons configured</h4>
          <p style={{ fontSize: 13, marginTop: 4 }}>Add agricultural seasons to begin tracking financials.</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleOpenAdd}>
            Add First Season
          </button>
        </div>
      ) : (
        <div className="grid-responsive-cards">
          {sortedSeasons.map((s) => {
            const { expenseTotal, incomeTotal, cropText } = getSeasonStats(s.id);
            const isActive = activeSeason?.id === s.id;
            return (
              <div
                key={s.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 14,
                  border: isActive ? '2.5px solid var(--primary)' : '1px solid var(--line)',
                  backgroundColor: isActive ? 'var(--primary-soft)' : 'var(--surface)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 className="display-font" style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🌾</span> {s.name}
                    </h4>
                    {isActive && (
                      <span className="badge badge-success" style={{ fontSize: 9, padding: '2px 6px' }}>
                        Active
                      </span>
                    )}
                  </div>
                  
                  {/* Crops Cultivated */}
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-dark)', marginTop: 8 }}>
                    {cropText}
                  </div>

                  {/* Financials Overview */}
                  <div style={{
                    marginTop: 12,
                    padding: 10,
                    backgroundColor: 'var(--bg-dark)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-soft)' }}>Expenses:</span>
                      <strong className="mono-font" style={{ color: 'var(--danger)' }}>{fmt(expenseTotal)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: '1px solid var(--line)', paddingTop: 6 }}>
                      <span style={{ color: 'var(--text-soft)' }}>Income:</span>
                      <strong className="mono-font" style={{ color: 'var(--positive)' }}>{fmt(incomeTotal)}</strong>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                  borderTop: '1px solid var(--line)',
                  paddingTop: 10,
                  marginTop: 4
                }}>
                  <button className="btn" style={{ padding: '4px 8px', fontSize: 11, height: 28 }} onClick={() => handleView(s)}>
                    <Eye size={12} /> {t('common.see_details') || 'View'}
                  </button>
                  <button className="btn" style={{ padding: '4px 8px', fontSize: 11, height: 28 }} onClick={() => handleOpenEdit(s)}>
                    <Pencil size={12} /> {t('common.edit') || 'Edit'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Season Form Modal */}
      <Modal
        isOpen={showAddModal}
        title={editingSeason ? t('common.edit') || 'Edit Season' : t('common.add_season') || 'Add New Season'}
        onClose={() => setShowAddModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {confirmationMsg ? (
            <div style={{
              backgroundColor: 'var(--positive-soft)',
              color: 'var(--positive)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: 14,
              textAlign: 'center'
            }}>
              {confirmationMsg}
            </div>
          ) : (
            <>
              <div>
                <span className="form-label">Season Name *</span>
                <input
                  className="form-input"
                  style={{ borderRadius: 'var(--radius-md)' }}
                  placeholder="e.g. Kharif 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button className="btn" onClick={() => setShowAddModal(false)}>
                  {t('common.cancel')}
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  {t('common.save_season') || 'Save Season'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Season Details Modal */}
      {showDetailsModal && viewingSeason && (() => {
        const { expenseTotal, incomeTotal, profit, cropText } = getSeasonStats(viewingSeason.id);
        const isActive = activeSeason?.id === viewingSeason.id;
        return (
          <Modal
            isOpen={showDetailsModal}
            title={`🌾 ${viewingSeason.name}`}
            onClose={() => setShowDetailsModal(false)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span className="form-label" style={{ marginBottom: 4 }}>Crops Cultivated</span>
                <strong style={{ fontSize: 16 }}>{cropText}</strong>
              </div>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-soft)' }}>Total Expenses:</span>
                  <strong style={{ fontSize: 15, color: 'var(--danger)' }}>{fmt(expenseTotal)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-soft)' }}>Total Income:</span>
                  <strong style={{ fontSize: 15, color: 'var(--positive)' }}>{fmt(incomeTotal)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 8 }}>
                  <span style={{ fontWeight: 700 }}>Profit:</span>
                  <strong style={{ fontSize: 16, color: profit >= 0 ? 'var(--positive)' : 'var(--danger)' }}>
                    {profit >= 0 ? '' : '−'}{fmt(Math.abs(profit))}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                {!isActive && setActiveSeasonId && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setActiveSeasonId(viewingSeason.id);
                      setShowDetailsModal(false);
                    }}
                  >
                    Set as Active Season
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
