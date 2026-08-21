import React, { useState, useMemo } from 'react';
import { Plus, Grid, Pencil, Trash2, MapPin, Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function FieldsView({
  fields = [],
  transactions = [],
  seasons = [],
  activeSeason,
  activeFarmer,
  onAddField,
  onUpdateField,
  onDeleteField,
  fmt
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingField, setEditingField] = useState(null);

  // Form States
  const [name, setName] = useState('');
  const [crop, setCrop] = useState('');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('acres');
  const [location, setLocation] = useState('');

  // 1. Group active season transactions by fieldId
  const fieldExpenseMap = useMemo(() => {
    if (!activeSeason || !activeFarmer) return {};
    const map = {};
    transactions
      .filter((t) => t.type === 'expense' && t.seasonId === activeSeason.id && t.farmerId === activeFarmer.id && t.fieldId)
      .forEach((t) => {
        map[t.fieldId] = (map[t.fieldId] || 0) + Number(t.amount);
      });
    return map;
  }, [transactions, activeSeason, activeFarmer]);

  // 2. Identify previous season to compute SoS cost changes
  const prevSeason = useMemo(() => {
    if (!activeSeason) return null;
    const sorted = [...seasons].sort((a, b) => a.sortOrder - b.sortOrder);
    const currIdx = sorted.findIndex((s) => s.id === activeSeason.id);
    return currIdx > 0 ? sorted[currIdx - 1] : null;
  }, [seasons, activeSeason]);

  // Group previous season transaction costs by field name (since IDs might differ across seasons)
  const prevSeasonFieldExpenseMap = useMemo(() => {
    if (!prevSeason || !activeFarmer) return {};
    
    // First map transaction field_ids to plot names in the previous season
    const prevFields = fields.filter((f) => f.seasonId === prevSeason.id && f.farmerId === activeFarmer.id);
    const fieldIdToName = {};
    prevFields.forEach((f) => {
      fieldIdToName[f.id] = f.name;
    });

    const map = {};
    transactions
      .filter((t) => t.type === 'expense' && t.seasonId === prevSeason.id && t.farmerId === activeFarmer.id && t.fieldId)
      .forEach((t) => {
        const fieldName = fieldIdToName[t.fieldId];
        if (fieldName) {
          map[fieldName] = (map[fieldName] || 0) + Number(t.amount);
        }
      });
    return map;
  }, [transactions, prevSeason, activeFarmer, fields]);

  // Open Form for Adding
  const handleOpenAdd = () => {
    setName('');
    setCrop('');
    setArea('');
    setAreaUnit('acres');
    setLocation('');
    setEditingField(null);
    setShowAddModal(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (f) => {
    setName(f.name);
    setCrop(f.crop || '');
    setArea(f.area || '');
    setAreaUnit(f.areaUnit || 'acres');
    setLocation(f.location || '');
    setEditingField(f);
    setShowAddModal(true);
  };

  // Save Field Plot
  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a valid plot name.');
      return;
    }
    if (!area || isNaN(area) || Number(area) <= 0) {
      alert('Please enter a valid positive area size.');
      return;
    }

    const payload = {
      seasonId: activeSeason.id,
      farmerId: activeFarmer.id,
      name: name.trim(),
      crop: crop.trim() || null,
      area: Number(area),
      areaUnit,
      location: location.trim() || ''
    };

    if (editingField) {
      onUpdateField(editingField.id, payload);
    } else {
      onAddField(payload);
    }
    setShowAddModal(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header controls bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 className="display-font" style={{ fontSize: 18 }}>Field Plot Manager</h3>
          <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>
            Track expenses, cost per acre, and performance per plot in {activeSeason?.name}.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Field Plot
        </button>
      </div>

      {/* Grid list of plots */}
      {fields.length === 0 ? (
        <EmptyState
          icon={Grid}
          title="🌾 No field plots mapped yet"
          description="Add your agricultural field plots with dimensions to calculate spent ratios and cost-per-acre metrics."
          actionText="Add Your First Field Plot"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid-cols-3">
          {fields.map((f) => {
            const spent = fieldExpenseMap[f.id] || 0;
            const sizeVal = Number(f.area || 0);
            const costPerAcre = sizeVal > 0 ? spent / sizeVal : 0;

            // Find matching name in prev season to compute SoS changes
            const prevSpent = prevSeasonFieldExpenseMap[f.name] || 0;
            // Assuming same size/area for matching name
            const prevCostPerAcre = sizeVal > 0 ? prevSpent / sizeVal : 0;
            const diffPct = prevCostPerAcre > 0 ? ((costPerAcre - prevCostPerAcre) / prevCostPerAcre) * 100 : 0;

            return (
              <div key={f.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 className="display-font" style={{ fontSize: 16 }}>{f.name}</h4>
                      {f.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-soft)', marginTop: 2 }}>
                          <MapPin size={10} /> {f.location}
                        </div>
                      )}
                    </div>
                    {f.crop && (
                      <span className="badge badge-neutral">
                        🌾 {f.crop}
                      </span>
                    )}
                  </div>

                  {/* Size metadata */}
                  <div style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 8 }}>
                    Size: <strong>{f.area} {f.areaUnit}</strong>
                  </div>

                  {/* Core Metrics section */}
                  <div style={{
                    marginTop: 14,
                    padding: 10,
                    backgroundColor: 'var(--bg-dark)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-soft)' }}>Season Expenses:</span>
                      <strong className="mono-font">{fmt(spent)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: '1px solid var(--line)', paddingTop: 6 }}>
                      <span style={{ color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Calculator size={11} /> Cost / {f.areaUnit.slice(0, -1)}:
                      </span>
                      <strong className="mono-font" style={{ color: 'var(--primary-dark)' }}>
                        {fmt(costPerAcre)}
                      </strong>
                    </div>
                  </div>

                  {/* Season-over-season change analysis */}
                  {prevCostPerAcre > 0 && (
                    <div style={{
                      marginTop: 10,
                      fontSize: 11,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: diffPct > 0 ? 'var(--danger)' : 'var(--positive)',
                      fontWeight: 600
                    }}>
                      {diffPct > 0 ? (
                        <>
                          <TrendingUp size={12} />
                          <span>Cost per acre increased by {diffPct.toFixed(1)}% vs last season</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown size={12} />
                          <span>Cost per acre optimized by {Math.abs(diffPct).toFixed(1)}% vs last season</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Card footer triggers */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                  borderTop: '1px solid var(--line)',
                  paddingTop: 10,
                  marginTop: 4
                }}>
                  <button className="btn" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => handleOpenEdit(f)}>
                    <Pencil size={11} /> Edit
                  </button>
                  <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => onDeleteField(f.id)}>
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Field CRUD Modal Form */}
      <Modal
        isOpen={showAddModal}
        title={editingField ? '✏️ Edit Field Plot Details' : '➕ Add Field Plot'}
        onClose={() => setShowAddModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Plot Name */}
          <div>
            <span className="form-label">Field Plot Name *</span>
            <input
              className="form-input"
              placeholder="e.g. North Terrace Plot A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
            {/* Area Size */}
            <div>
              <span className="form-label">Field Area / Size *</span>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="e.g. 2.5"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>

            {/* Area Unit */}
            <div>
              <span className="form-label">Unit of Measure</span>
              <select className="form-select" value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)}>
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="bighas">Bighas</option>
              </select>
            </div>
          </div>

          {/* Crop Associated */}
          <div>
            <span className="form-label">Crop Currently Cultivated</span>
            <input
              className="form-input"
              placeholder="e.g. Basmati Rice"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
            />
          </div>

          {/* Location Description */}
          <div>
            <span className="form-label">Location / GPS Description</span>
            <input
              className="form-input"
              placeholder="e.g. Near west canal outlet"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button className="btn" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Field Plot
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
