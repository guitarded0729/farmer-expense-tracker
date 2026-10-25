import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, RefreshCw, Upload, Download, Tag } from 'lucide-react';
import TransactionCard from '../components/TransactionCard';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function IncomeView({
  transactions = [],
  fields = [],
  seasons = [],
  activeSeason,
  activeFarmer,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onImportCsv,
  onExportCsv,
  INCOME_CATEGORIES,
  fmt
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('All Crops');
  const [fieldFilter, setFieldFilter] = useState('All Fields');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form States
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [crop, setCrop] = useState('');
  const [fieldId, setFieldId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [receiptBase64, setReceiptBase64] = useState(null);

  // Modal Image Preview
  const [previewImage, setPreviewImage] = useState(null);

  // 1. Filter income transactions
  const incomeTxs = useMemo(() => {
    if (!activeSeason || !activeFarmer) return [];
    return transactions.filter(
      (t) => t.type === 'income' && t.seasonId === activeSeason.id && t.farmerId === activeFarmer.id
    );
  }, [transactions, activeSeason, activeFarmer]);

  const filteredTxs = useMemo(() => {
    return incomeTxs.filter((t) => {
      // Search
      if (search.trim() !== '') {
        const term = search.toLowerCase();
        const matchesNote = (t.note || '').toLowerCase().includes(term);
        const matchesCat = t.category.toLowerCase().includes(term);
        const matchesCrop = (t.crop || '').toLowerCase().includes(term);
        if (!matchesNote && !matchesCat && !matchesCrop) return false;
      }
      // Category filter
      if (categoryFilter !== 'All Categories' && t.category !== categoryFilter) return false;
      // Crop filter
      if (cropFilter !== 'All Crops' && t.crop !== cropFilter) return false;
      // Field filter
      if (fieldFilter !== 'All Fields' && String(t.fieldId) !== String(fieldFilter)) return false;
      // Date filters
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      
      return true;
    });
  }, [incomeTxs, search, categoryFilter, cropFilter, fieldFilter, startDate, endDate]);

  // Unique list of crops logged as income
  const cropsList = useMemo(() => {
    const set = new Set(incomeTxs.map((t) => t.crop).filter(Boolean));
    return ['All Crops', ...Array.from(set)];
  }, [incomeTxs]);

  // Handle receipt/invoice loading
  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds the 2MB limit. Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Open Form for Adding
  const handleOpenAdd = () => {
    setAmount('');
    setCategory(Object.keys(INCOME_CATEGORIES)[0]);
    setCrop('');
    setFieldId('');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setReceiptBase64(null);
    setEditingTx(null);
    setShowAddModal(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (tx) => {
    setAmount(tx.amount);
    setCategory(tx.category);
    setCrop(tx.crop || '');
    setFieldId(tx.fieldId || '');
    setDate(tx.date);
    setNote(tx.note || '');
    setReceiptBase64(tx.receipt || null);
    
    setEditingTx(tx);
    setShowAddModal(true);
  };

  // Save Transaction
  const handleSave = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid positive income amount.');
      return;
    }

    const payload = {
      seasonId: activeSeason.id,
      farmerId: activeFarmer.id,
      type: 'income',
      category,
      amount: Number(amount),
      crop: crop.trim() || null,
      fieldId: fieldId || null,
      date,
      note: note.trim() || '',
      unusual: false,
      receipt: receiptBase64,
      splitNames: ''
    };

    if (editingTx) {
      onUpdateTransaction(editingTx.id, payload);
    } else {
      onAddTransaction(payload);
    }
    setShowAddModal(false);
  };

  const handleImportCsv = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onImportCsv(file);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('All Categories');
    setCropFilter('All Crops');
    setFieldFilter('All Fields');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header controls bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 className="display-font" style={{ fontSize: 18 }}>Income Records</h3>
          <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>
            Total {filteredTxs.length} income transaction(s) logged in {activeSeason?.name}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* CSV Operations */}
          <div style={{ display: 'flex', gap: 6 }}>
            <label className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: 12, cursor: 'pointer' }}>
              <Upload size={13} /> Import CSV
              <input type="file" accept=".csv" onChange={handleImportCsv} style={{ display: 'none' }} />
            </label>
            <button className="btn" style={{ padding: '8px 12px', fontSize: 12 }} onClick={() => onExportCsv('income')}>
              <Download size={13} /> Export CSV
            </button>
          </div>

          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Income
          </button>
        </div>
      </div>

      {/* Advanced Filters Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-soft)', fontSize: 12, fontWeight: 700 }}>
          <Filter size={14} /> FILTERS & FACETS
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {/* Search text */}
          <div>
            <span className="form-label">Search Description / Crop</span>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                style={{ paddingLeft: 30 }}
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <span className="form-label">Income Category</span>
            <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All Categories">All Categories</option>
              {Object.keys(INCOME_CATEGORIES).map((key) => (
                <option key={key} value={key}>
                  {INCOME_CATEGORIES[key].label}
                </option>
              ))}
            </select>
          </div>

          {/* Crop Filter */}
          <div>
            <span className="form-label">Filter by Crop</span>
            <select className="form-select" value={cropFilter} onChange={(e) => setCropFilter(e.target.value)}>
              {cropsList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Field Filter */}
          <div>
            <span className="form-label">Filter by Field Plot</span>
            <select className="form-select" value={fieldFilter} onChange={(e) => setFieldFilter(e.target.value)}>
              <option value="All Fields">All Fields</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  📍 {f.name} ({f.crop})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date range row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          borderTop: '1px solid var(--line)',
          paddingTop: 12
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="form-label" style={{ margin: 0 }}>Start:</span>
              <input type="date" className="form-input" style={{ width: 'auto', minWidth: 130, padding: '6px 10px', fontSize: 13 }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="form-label" style={{ margin: 0 }}>End:</span>
              <input type="date" className="form-input" style={{ width: 'auto', minWidth: 130, padding: '6px 10px', fontSize: 13 }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <button className="btn" style={{ padding: '8px 14px', fontSize: 13 }} onClick={handleResetFilters}>
            <RefreshCw size={13} /> Reset Filters
          </button>
        </div>
      </div>

      {/* Grid of Results */}
      {filteredTxs.length === 0 ? (
        <EmptyState
          title="💰 No income transactions recorded"
          description="Try modifying search filter variables or add your yield crop sales."
          actionText="Add Crop Sale Income"
          onAction={handleOpenAdd}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredTxs.map((tx) => (
            <TransactionCard
              key={tx.id}
              tx={tx}
              fields={fields}
              INCOME_CATEGORIES={INCOME_CATEGORIES}
              fmt={fmt}
              onEdit={handleOpenEdit}
              onDelete={onDeleteTransaction}
              onViewReceipt={(t) => setPreviewImage(t.receipt)}
            />
          ))}
        </div>
      )}

      {/* Transaction Modal (Add / Edit Form) */}
      <Modal
        isOpen={showAddModal}
        title={editingTx ? '✏️ Edit Income Record' : '➕ Add Income Record'}
        onClose={() => setShowAddModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Amount input */}
          <div>
            <span className="form-label">Income Value (INR ₹) *</span>
            <input
              type="number"
              inputMode="decimal"
              className="form-input"
              style={{ fontSize: 16, fontWeight: 700 }}
              placeholder="e.g. 85000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="form-row-2col">
            {/* Category Select */}
            <div>
              <span className="form-label">Income Category *</span>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {Object.keys(INCOME_CATEGORIES).map((key) => (
                  <option key={key} value={key}>
                    {INCOME_CATEGORIES[key].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div>
              <span className="form-label">Date Received *</span>
              <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="form-row-2col">
            {/* Crop Type input */}
            <div>
              <span className="form-label">Crop Associated</span>
              <input
                className="form-input"
                placeholder="e.g. Paddy"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              />
            </div>

            {/* Field Plot Select */}
            <div>
              <span className="form-label">Field Plot Assignment</span>
              <select className="form-select" value={fieldId} onChange={(e) => setFieldId(e.target.value)}>
                <option value="">No Plot Associated</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    📍 {f.name} ({f.crop})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description note */}
          <div>
            <span className="form-label">Description Note</span>
            <input
              className="form-input"
              placeholder="e.g. Received government subsidy for drip irrigation setup"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Receipt/Invoice Upload */}
          <div>
            <span className="form-label">Invoice / Receipt Image Upload (Max 2MB)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleReceiptUpload}
                style={{ display: 'none' }}
                id="income-file-input"
              />
              <label htmlFor="income-file-input" className="btn" style={{ cursor: 'pointer' }}>
                📷 Select Invoice Image
              </label>
              {receiptBase64 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img
                    src={receiptBase64}
                    alt="Invoice preview"
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--line)' }}
                  />
                  <button className="btn btn-danger" style={{ padding: '2px 8px', fontSize: 10 }} onClick={() => setReceiptBase64(null)}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <button className="btn" style={{ flex: '1 1 100px' }} onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" style={{ flex: '1 1 140px' }} onClick={handleSave}>
              Save Income
            </button>
          </div>
        </div>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        isOpen={!!previewImage}
        title="📷 Invoice / Receipt Preview"
        onClose={() => setPreviewImage(null)}
      >
        {previewImage && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <img
              src={previewImage}
              alt="Receipt preview"
              style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 4, border: '1px solid var(--line)' }}
            />
            <button className="btn" onClick={() => setPreviewImage(null)}>
              Close Preview
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
