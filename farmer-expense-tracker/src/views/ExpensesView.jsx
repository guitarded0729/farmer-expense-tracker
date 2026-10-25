import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Pencil, 
  Calendar, 
  Users, 
  AlertTriangle, 
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Camera
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import Modal from '../components/Modal';

export default function ExpensesView({
  transactions = [],
  fields = [],
  seasons = [],
  activeSeason,
  activeFarmer,
  farmers = [],
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onImportCsv,
  onExportCsv,
  CATEGORIES,
  INCOME_CATEGORIES,
  expenseFormModeOnLoad,
  clearExpenseFormModeOnLoad,
  fmt
}) {
  const { t, lang } = useTranslation();

  // Ledger mode toggle: 'expense' or 'income'
  const [activeLedgerType, setActiveLedgerType] = useState('expense');

  // Modal control states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTx, setActiveTx] = useState(null); // for details / edit
  const [isEditing, setIsEditing] = useState(false);

  // Filter state
  const [search, setSearch] = useState('');

  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [crop, setCrop] = useState('');
  const [fieldId, setFieldId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [unusual, setUnusual] = useState(false);
  const [receiptBase64, setReceiptBase64] = useState(null);
  const [enableSplit, setEnableSplit] = useState(false);
  const [coFarmersInput, setCoFarmersInput] = useState([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Form errors
  const [formError, setFormError] = useState('');

  // Handle external loading trigger (from Dashboard "+ Add Expense" or "+ Add Income")
  useEffect(() => {
    if (expenseFormModeOnLoad) {
      setActiveLedgerType(expenseFormModeOnLoad);
      handleOpenAdd(expenseFormModeOnLoad);
      if (clearExpenseFormModeOnLoad) clearExpenseFormModeOnLoad();
    }
  }, [expenseFormModeOnLoad]);

  // Derived filtered list of transactions
  const currentSeasonTxs = useMemo(() => {
    if (!activeSeason || !activeFarmer) return [];
    return transactions.filter(
      (t) => t.seasonId === activeSeason.id && t.farmerId === activeFarmer.id
    );
  }, [transactions, activeSeason, activeFarmer]);

  const filteredTransactions = useMemo(() => {
    return currentSeasonTxs
      .filter((t) => t.type === activeLedgerType)
      .filter((t) => {
        if (!search.trim()) return true;
        const term = search.toLowerCase();
        const catLabel = isExpenseLedger 
          ? t('categories.' + t.category).toLowerCase() 
          : t('income_categories.' + t.category).toLowerCase();
        return (
          (t.note || '').toLowerCase().includes(term) ||
          catLabel.includes(term) ||
          (t.crop || '').toLowerCase().includes(term)
        );
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [currentSeasonTxs, activeLedgerType, search]);

  const isExpenseLedger = activeLedgerType === 'expense';

  // Receipt image upload parser
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
  const handleOpenAdd = (type = 'expense') => {
    setAmount('');
    const defaultCat = type === 'expense' ? Object.keys(CATEGORIES)[0] : Object.keys(INCOME_CATEGORIES)[0];
    setCategory(defaultCat);
    setCrop('');
    setFieldId('');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setUnusual(false);
    setReceiptBase64(null);
    setEnableSplit(false);
    setFormError('');
    setShowAdvancedOptions(false);

    const coFarmers = farmers.filter((f) => f.id !== activeFarmer.id);
    setCoFarmersInput(coFarmers.map((f) => ({ id: f.id, name: f.name, share: 0, paid: false })));

    setActiveTx(null);
    setIsEditing(false);
    setShowFormModal(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (tx) => {
    setActiveTx(tx);
    setAmount(tx.amount);
    setCategory(tx.category);
    setCrop(tx.crop || '');
    setFieldId(tx.fieldId || '');
    setDate(tx.date);
    setNote(tx.note || '');
    setUnusual(tx.unusual || false);
    setReceiptBase64(tx.receipt || null);
    setFormError('');
    setShowAdvancedOptions(tx.fieldId || tx.receipt || tx.unusual || tx.splitNames);

    let parsedSplits = [];
    try {
      if (tx.splitNames) {
        parsedSplits = JSON.parse(tx.splitNames);
      }
    } catch (e) {
      console.warn('Failed parsing splits JSON:', e);
    }

    setEnableSplit(parsedSplits.length > 0);
    const coFarmers = farmers.filter((f) => f.id !== activeFarmer.id);
    setCoFarmersInput(
      coFarmers.map((f) => {
        const found = parsedSplits.find((s) => s.id === f.id);
        return {
          id: f.id,
          name: f.name,
          share: found ? found.share : 0,
          paid: found ? found.paid : false
        };
      })
    );

    setIsEditing(true);
    setShowDetailsModal(false);
    setShowFormModal(true);
  };

  // View details on tap
  const handleOpenDetails = (tx) => {
    setActiveTx(tx);
    setShowDetailsModal(true);
  };

  // Save transaction handler
  const handleSave = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setFormError(t('expenses.amount_prompt'));
      return;
    }

    let splitNamesVal = '';
    if (enableSplit && isExpenseLedger) {
      const totalCoShare = coFarmersInput.reduce((sum, item) => sum + Number(item.share || 0), 0);
      if (totalCoShare >= 100) {
        setFormError('Co-farmer shares must add up to less than 100%.');
        return;
      }
      splitNamesVal = JSON.stringify(coFarmersInput.filter((f) => Number(f.share) > 0));
    }

    const payload = {
      seasonId: activeSeason.id,
      farmerId: activeFarmer.id,
      type: activeLedgerType,
      category,
      amount: Number(amount),
      crop: crop.trim() || null,
      fieldId: fieldId || null,
      date,
      note: note.trim() || '',
      unusual: isExpenseLedger ? unusual : false,
      receipt: receiptBase64,
      splitNames: isExpenseLedger ? splitNamesVal : ''
    };

    if (isEditing && activeTx) {
      onUpdateTransaction(activeTx.id, payload);
      alert(t('expenses.alert_saved').replace('Expense', isExpenseLedger ? 'Expense' : 'Income'));
    } else {
      onAddTransaction(payload);
      alert(isExpenseLedger ? t('expenses.alert_saved') : t('expenses.alert_income_saved'));
    }
    setShowFormModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm(t('common.delete') + '?')) {
      onDeleteTransaction(id);
      alert(t('expenses.alert_deleted'));
      setShowDetailsModal(false);
    }
  };

  const getIcon = (cat) => {
    const icons = {
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
    return icons[cat] || '🏷';
  };

  const getCategoryLabel = (cat) => {
    if (isExpenseLedger) {
      return t('categories.' + cat);
    }
    return t('income_categories.' + cat);
  };

  const handleImportCsv = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onImportCsv(file);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* Title & Import/Export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 className="display-font" style={{ fontSize: 20 }}>{t('expenses.my_expenses')}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>
            {t('home.this_season')} {activeSeason?.name}
          </p>
        </div>

        {/* CSV operations hidden behind small actions to keep primary screen clean */}
        <div style={{ display: 'flex', gap: 6 }}>
          <label className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 11, cursor: 'pointer' }}>
            📥 {t('expenses.search_placeholder').replace('Search description or crop...', 'Import')}
            <input type="file" accept=".csv" onChange={handleImportCsv} style={{ display: 'none' }} />
          </label>
          <button className="btn" style={{ padding: '6px 10px', fontSize: 11 }} onClick={() => onExportCsv(activeLedgerType)}>
            📤 Export
          </button>
        </div>
      </div>

      {/* Main Mode Toggle [ Expenses ] [ Income ] */}
      <div style={{
        display: 'flex',
        backgroundColor: 'var(--bg-dark)',
        borderRadius: 'var(--radius-lg)',
        padding: 4,
        width: '100%',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <button
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 15,
            fontWeight: 700,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: isExpenseLedger ? 'var(--surface)' : 'transparent',
            color: isExpenseLedger ? 'var(--danger)' : 'var(--text-soft)',
            transition: 'all 0.2s ease',
            boxShadow: isExpenseLedger ? 'var(--shadow-sm)' : 'none'
          }}
          onClick={() => setActiveLedgerType('expense')}
        >
          📉 {t('expenses.toggle_expenses')}
        </button>
        <button
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 15,
            fontWeight: 700,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: !isExpenseLedger ? 'var(--surface)' : 'transparent',
            color: !isExpenseLedger ? 'var(--positive)' : 'var(--text-soft)',
            transition: 'all 0.2s ease',
            boxShadow: !isExpenseLedger ? 'var(--shadow-sm)' : 'none'
          }}
          onClick={() => setActiveLedgerType('income')}
        >
          📈 {t('expenses.toggle_income')}
        </button>
      </div>

      {/* Giant prominent Add button */}
      <button
        className="btn btn-primary"
        style={{
          padding: '14px 20px',
          fontSize: 16,
          fontWeight: 700,
          borderRadius: 'var(--radius-lg)',
          justifyContent: 'center',
          height: 52,
          backgroundColor: isExpenseLedger ? 'var(--primary)' : 'var(--positive)',
          borderColor: isExpenseLedger ? 'var(--primary-dark)' : 'var(--positive)',
          color: 'var(--text-inverse)'
        }}
        onClick={() => handleOpenAdd(activeLedgerType)}
      >
        <Plus size={18} /> {isExpenseLedger ? t('common.add_expense') : t('common.add_income')}
      </button>

      {/* Simple Search bar */}
      <div style={{ position: 'relative' }}>
        <input
          className="form-input"
          style={{ paddingLeft: 36, height: 44, fontSize: 14, borderRadius: 'var(--radius-md)' }}
          placeholder={t('expenses.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-soft)' }}>
          <span style={{ fontSize: 32, display: 'block', marginBottom: 10 }}>🌾</span>
          <p style={{ margin: 0, fontSize: 14 }}>{t('expenses.no_expenses_found')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredTransactions.map((tx) => {
            const icon = getIcon(tx.category);
            const label = getCategoryLabel(tx.category);
            const matchedField = fields.find((f) => String(f.id) === String(tx.fieldId));
            return (
              <div
                key={tx.id}
                onClick={() => handleOpenDetails(tx)}
                className="card animate-fade-in"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderLeft: `5px solid ${isExpenseLedger ? 'var(--danger)' : 'var(--positive)'}`,
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, overflow: 'hidden' }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{icon}</span>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.date} {tx.crop ? `• 🌾 ${tx.crop}` : ''} {matchedField ? `• 📍 ${matchedField.name}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <strong
                    style={{
                      fontSize: 18,
                      color: isExpenseLedger ? 'var(--danger)' : 'var(--positive)'
                    }}
                    className="tabular"
                  >
                    {isExpenseLedger ? '−' : '+'}{fmt(tx.amount)}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        title={isExpenseLedger ? t('expenses.toggle_expenses') : t('expenses.toggle_income')}
        onClose={() => setShowDetailsModal(false)}
      >
        {activeTx && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Amount & Category */}
            <div style={{ textAlign: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontSize: 36, display: 'block', marginBottom: 4 }}>
                {getIcon(activeTx.category)}
              </span>
              <h3 style={{ fontSize: 16, color: 'var(--text-soft)', margin: 0 }}>
                {getCategoryLabel(activeTx.category)}
              </h3>
              <h2 style={{
                fontSize: 32,
                fontWeight: 800,
                color: isExpenseLedger ? 'var(--danger)' : 'var(--positive)',
                margin: '6px 0 0'
              }} className="tabular">
                {isExpenseLedger ? '−' : '+'}{fmt(activeTx.amount)}
              </h2>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-soft)' }}>{t('common.date')}:</span>
                <strong>{activeTx.date}</strong>
              </div>
              
              {activeTx.crop && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-soft)' }}>{t('common.crop')}:</span>
                  <strong>{activeTx.crop}</strong>
                </div>
              )}

              {activeTx.fieldId && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-soft)' }}>{t('common.field')}:</span>
                  <strong>{fields.find(f => String(f.id) === String(activeTx.fieldId))?.name || activeTx.fieldId}</strong>
                </div>
              )}

              {activeTx.note && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                  <span style={{ color: 'var(--text-soft)' }}>{t('common.note')}:</span>
                  <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text)' }}>"{activeTx.note}"</p>
                </div>
              )}

              {/* Share info */}
              {activeTx.splitNames && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                  <span style={{ color: 'var(--text-soft)' }}>{t('expenses.co_farmers')}:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 8, backgroundColor: 'var(--bg-dark)', borderRadius: 4 }}>
                    {JSON.parse(activeTx.splitNames).map((p) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span>{p.name}</span>
                        <strong>{p.share}% ({fmt(activeTx.amount * p.share / 100)}) - {p.paid ? 'Paid' : 'Unpaid'}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Receipt preview link */}
              {activeTx.receipt && (
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                  <span style={{ color: 'var(--text-soft)', display: 'block', marginBottom: 6 }}>{t('expenses.view_receipt')}:</span>
                  <img
                    src={activeTx.receipt}
                    alt="Receipt invoice details"
                    style={{ width: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 4, border: '1px solid var(--line)' }}
                  />
                </div>
              )}

              {/* Unusual indicator */}
              {activeTx.unusual && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 10,
                  backgroundColor: 'var(--danger-soft)',
                  border: '1px solid rgba(211,47,47,0.15)',
                  borderRadius: 4,
                  color: 'var(--danger)',
                  marginTop: 6
                }}>
                  <AlertTriangle size={16} />
                  <span>{t('expenses.unusual_cost')}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '12px 14px', fontSize: 14, fontWeight: 700, borderRadius: 'var(--radius-md)' }}
                onClick={() => handleOpenEdit(activeTx)}
              >
                ✏️ {t('common.edit')}
              </button>
              
              <button
                className="btn btn-danger"
                style={{ padding: '12px 14px', fontSize: 14, fontWeight: 700, borderRadius: 'var(--radius-md)' }}
                onClick={() => handleDelete(activeTx.id)}
              >
                🗑️ {t('common.delete')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Transaction Add / Edit Form Modal */}
      <Modal
        isOpen={showFormModal}
        title={isEditing ? t('expenses.edit_title') : t('expenses.add_title')}
        onClose={() => setShowFormModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {formError && (
            <div style={{ color: 'var(--danger)', fontSize: 13, fontWeight: 600, backgroundColor: 'var(--danger-soft)', padding: 10, borderRadius: 4 }}>
              ⚠️ {formError}
            </div>
          )}

          {/* STEP 1: Amount */}
          <div>
            <span className="form-label" style={{ fontSize: 13, fontWeight: 700 }}>
              {isExpenseLedger ? t('expenses.amount_prompt') : t('expenses.amount_earn_prompt')} *
            </span>
            <input
              type="number"
              inputMode="decimal"
              className="form-input"
              style={{ fontSize: 20, fontWeight: 800, height: 48, borderRadius: 'var(--radius-md)' }}
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* STEP 2: Category Selector as Grid of Large Buttons */}
          <div>
            <span className="form-label" style={{ fontSize: 13, fontWeight: 700 }}>
              {isExpenseLedger ? t('expenses.what_bought_prompt') : t('expenses.source_prompt')} *
            </span>
            <div className="grid-category-picker" style={{ marginTop: 6 }}>
              {Object.keys(isExpenseLedger ? CATEGORIES : INCOME_CATEGORIES).map((key) => {
                const isSelected = category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    style={{
                      padding: '10px 6px',
                      fontSize: 12,
                      fontWeight: 700,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--line)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 58,
                      gap: 4,
                      backgroundColor: isSelected ? 'var(--primary-soft)' : 'var(--surface)',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--line)',
                      color: isSelected ? 'var(--primary-dark)' : 'var(--text)',
                      transition: 'all 0.15s ease',
                      touchAction: 'manipulation'
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{getIcon(key)}</span>
                    <span style={{ textAlign: 'center', whiteSpace: 'normal', lineHeight: 1.15, fontSize: 11, width: '100%', wordBreak: 'break-word' }}>
                      {getCategoryLabel(key).replace(/^[^\s]+\s+/, '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3 & 4: Crop associated & Date */}
          <div className="form-row-2col">
            <div>
              <span className="form-label">{t('expenses.choose_crop')}</span>
              <input
                className="form-input"
                style={{ borderRadius: 'var(--radius-md)' }}
                placeholder="e.g. Wheat"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              />
            </div>
            <div>
              <span className="form-label">{t('common.date')}</span>
              <input 
                type="date" 
                className="form-input" 
                style={{ borderRadius: 'var(--radius-md)' }}
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>
          </div>

          {/* STEP 5: Description note */}
          <div>
            <span className="form-label">{t('common.description')}</span>
            <input
              className="form-input"
              style={{ borderRadius: 'var(--radius-md)' }}
              placeholder="e.g. Purchased composting bags"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* ADVANCED OPTIONS ACCORDION */}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: '8px 12px',
                fontSize: 13,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-dark)'
              }}
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              <span>⚙️ {t('common.more_options')}</span>
              {showAdvancedOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showAdvancedOptions && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12, padding: 10, backgroundColor: 'var(--bg-dark)', borderRadius: 'var(--radius-md)' }}>
                
                {/* Field plot selection */}
                <div>
                  <span className="form-label">{t('fields.my_fields')}</span>
                  <select 
                    className="form-select" 
                    style={{ borderRadius: 'var(--radius-md)' }}
                    value={fieldId} 
                    onChange={(e) => setFieldId(e.target.value)}
                  >
                    <option value="">{t('common.no_field')}</option>
                    {fields.map((f) => (
                      <option key={f.id} value={f.id}>
                        📍 {f.name} ({f.crop})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Receipt attachment */}
                <div>
                  <span className="form-label">{t('expenses.receipt_upload')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      style={{ display: 'none' }}
                      id="expense-receipt-file"
                    />
                    <label htmlFor="expense-receipt-file" className="btn" style={{ cursor: 'pointer', borderRadius: 'var(--radius-md)' }}>
                      <Camera size={14} /> {t('expenses.receipt_upload')}
                    </label>
                    {receiptBase64 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <img
                          src={receiptBase64}
                          alt="preview"
                          style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <button className="btn btn-danger" style={{ padding: '2px 6px', fontSize: 10 }} onClick={() => setReceiptBase64(null)}>
                          {t('common.delete')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Co-Farmer splits (Expenses only) */}
                {isExpenseLedger && coFarmersInput.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      <input type="checkbox" checked={enableSplit} onChange={(e) => setEnableSplit(e.target.checked)} />
                      {t('expenses.co_farmers')}
                    </label>

                    {enableSplit && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                        {coFarmersInput.map((item, idx) => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <input
                                type="number"
                                className="form-input"
                                style={{ width: 64, padding: '4px 6px', fontSize: 12, textAlign: 'right', borderRadius: 4 }}
                                placeholder="%"
                                value={item.share || ''}
                                onChange={(e) => {
                                  const val = Math.min(Math.max(Number(e.target.value), 0), 100);
                                  const updated = [...coFarmersInput];
                                  updated[idx].share = val;
                                  setCoFarmersInput(updated);
                                }}
                              />
                              <span style={{ fontSize: 12 }}>%</span>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={item.paid}
                                  onChange={(e) => {
                                    const updated = [...coFarmersInput];
                                    updated[idx].paid = e.target.checked;
                                    setCoFarmersInput(updated);
                                  }}
                                />
                                Paid
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Unusual cost flagging (Expenses only) */}
                {isExpenseLedger && (
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: 'var(--danger)' }}>
                      <input type="checkbox" checked={unusual} onChange={(e) => setUnusual(e.target.checked)} />
                      ⚠️ {t('expenses.unusual_cost')}
                    </label>
                    <p style={{ fontSize: 11, color: 'var(--text-soft)', margin: '2px 0 0 20px' }}>
                      {t('expenses.unusual_desc')}
                    </p>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <button className="btn" style={{ flex: '1 1 120px' }} onClick={() => setShowFormModal(false)}>
              {t('common.cancel')}
            </button>
            <button
              className="btn btn-primary"
              style={{
                flex: '1 1 140px',
                backgroundColor: isExpenseLedger ? 'var(--primary)' : 'var(--positive)',
                borderColor: isExpenseLedger ? 'var(--primary-dark)' : 'var(--positive)'
              }}
              onClick={handleSave}
            >
              {isEditing ? t('common.save') : (isExpenseLedger ? t('common.save_expense') : t('common.save_income'))}
            </button>
          </div>

        </div>
      </Modal>

    </div>
  );
}
