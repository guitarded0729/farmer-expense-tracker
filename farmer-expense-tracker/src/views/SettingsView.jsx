import React, { useState } from 'react';
import { 
  Save, 
  Trash2, 
  LogOut, 
  Plus, 
  Pencil, 
  HelpCircle, 
  MapPin, 
  ShieldAlert 
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import Modal from '../components/Modal';

export default function SettingsView({
  activeFarmer,
  onUpdateFarmer,
  onResetDatabase,
  fields = [],
  onAddField,
  onUpdateField,
  onDeleteField,
  CATEGORY_OPTIONS = [],
  REGION_OPTIONS = [],
  SCALE_OPTIONS = []
}) {
  const { t, lang, setLang } = useTranslation();

  // Profile Form States
  const [name, setName] = useState(activeFarmer?.name || '');
  const [farmName, setFarmName] = useState(activeFarmer?.farmName || '');
  const [role, setRole] = useState(activeFarmer?.role || 'Primary Operator');
  const [category, setCategory] = useState(activeFarmer?.category || '');
  const [customCategory, setCustomCategory] = useState('');
  const [region, setRegion] = useState(activeFarmer?.region || '');
  const [scale, setScale] = useState(activeFarmer?.scale || '');
  const [phone, setPhone] = useState(activeFarmer?.phone || '');
  const [email, setEmail] = useState(activeFarmer?.email || '');
  const [saving, setSaving] = useState(false);

  // Fields CRUD Form States
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldName, setFieldName] = useState('');
  const [fieldCrop, setFieldCrop] = useState('');
  const [fieldArea, setFieldArea] = useState('');

  const handleSaveProfile = async () => {
    if (!name.trim() || !farmName.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    setSaving(true);
    const finalCategory = category === 'OTHER' ? customCategory.trim() : category;
    
    await onUpdateFarmer({
      id: activeFarmer.id,
      name: name.trim(),
      farmName: farmName.trim(),
      role,
      category: finalCategory || 'General Agriculture',
      region: region || 'Unspecified Region',
      scale: scale || 'Standard Farm',
      phone: phone.trim(),
      email: email.trim(),
      equityShare: activeFarmer.equityShare
    });
    setSaving(false);
    alert(t('settings.saved'));
  };

  const handleReset = () => {
    if (window.confirm(t('settings.reset_confirm'))) {
      onResetDatabase();
    }
  };

  // Field CRUD Helpers
  const handleOpenAddField = () => {
    setFieldName('');
    setFieldCrop('');
    setFieldArea('');
    setEditingField(null);
    setShowFieldModal(true);
  };

  const handleOpenEditField = (f) => {
    setFieldName(f.name);
    setFieldCrop(f.crop || '');
    setFieldArea(f.area || '');
    setEditingField(f);
    setShowFieldModal(true);
  };

  const handleSaveField = () => {
    if (!fieldName.trim()) {
      alert('Please enter a field name.');
      return;
    }
    if (!fieldArea || isNaN(fieldArea) || Number(fieldArea) <= 0) {
      alert('Please enter a valid area size.');
      return;
    }

    const payload = {
      name: fieldName.trim(),
      crop: fieldCrop.trim() || null,
      area: Number(fieldArea),
      areaUnit: 'acres',
      location: ''
    };

    if (editingField) {
      onUpdateField(editingField.id, payload);
    } else {
      onAddField(payload);
    }
    setShowFieldModal(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Title */}
      <div>
        <h3 className="display-font" style={{ fontSize: 20 }}>⚙️ {t('nav.settings')}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>
          {t('settings.reset_desc').replace('Resetting the database will permanently delete all transaction records, budgets, field plots, and seasons.', 'Manage farm preferences, language, profiles and agricultural field plots.')}
        </p>
      </div>

      {/* 1. LANGUAGE SELECTOR CARD (Extremely Clear & Tap-friendly) */}
      <div className="card" style={{ padding: 18 }}>
        <h4 className="display-font" style={{ fontSize: 16, marginBottom: 12 }}>
          🌐 {t('settings.language')}
        </h4>
        <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 14 }}>
          Select your preferred language / अपनी पसंदीदा भाषा चुनें:
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            style={{
              flex: 1,
              padding: '14px 16px',
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: '2px solid',
              cursor: 'pointer',
              backgroundColor: lang === 'en' ? 'var(--primary-soft)' : 'var(--surface)',
              borderColor: lang === 'en' ? 'var(--primary)' : 'var(--line)',
              color: lang === 'en' ? 'var(--primary-dark)' : 'var(--text-soft)',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setLang('en')}
          >
            English
          </button>
          <button
            style={{
              flex: 1,
              padding: '14px 16px',
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: '2px solid',
              cursor: 'pointer',
              backgroundColor: lang === 'hi' ? 'var(--primary-soft)' : 'var(--surface)',
              borderColor: lang === 'hi' ? 'var(--primary)' : 'var(--line)',
              color: lang === 'hi' ? 'var(--primary-dark)' : 'var(--text-soft)',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setLang('hi')}
          >
            हिन्दी (Hindi)
          </button>
        </div>
      </div>

      {/* 2. FIELDS PLOT MANAGER INTEGRATION */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
          <h4 className="display-font" style={{ fontSize: 16, margin: 0 }}>
            📍 {t('fields.my_fields')}
          </h4>
          <button
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: 12, borderRadius: 'var(--radius-md)' }}
            onClick={handleOpenAddField}
          >
            <Plus size={14} /> {t('fields.add_field')}
          </button>
        </div>

        {fields.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-soft)', fontSize: 13, margin: '20px 0' }}>
            No fields mapped yet. Add plots to associate them with your expenses.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {fields.map((f) => (
              <div
                key={f.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 2 }}>
                    🌾 {f.crop || 'No Crop'} • 📐 {f.area} {t('fields.acres')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn"
                    style={{ padding: 4, borderRadius: 4, height: 26, width: 26 }}
                    onClick={() => handleOpenEditField(f)}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: 4, borderRadius: 4, height: 26, width: 26 }}
                    onClick={() => onDeleteField(f.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. PROFILE SETTINGS */}
      <div className="card" style={{ padding: 18 }}>
        <h4 className="display-font" style={{ fontSize: 16, marginBottom: 14, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
          👨‍🌾 {t('settings.profile')}
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="grid-cols-1">
            <div>
              <span className="form-label">{t('onboarding.name')}</span>
              <input className="form-input" style={{ borderRadius: 'var(--radius-md)' }} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <span className="form-label">{t('onboarding.farm_name')}</span>
              <input className="form-input" style={{ borderRadius: 'var(--radius-md)' }} value={farmName} onChange={(e) => setFarmName(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="grid-cols-1">
            <div>
              <span className="form-label">{t('onboarding.role')}</span>
              <select className="form-select" style={{ borderRadius: 'var(--radius-md)' }} value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Primary Operator">Primary Operator</option>
                <option value="Co-Farmer">Co-Farmer</option>
                <option value="Partner / Investor">Partner / Investor</option>
                <option value="Landowner">Landowner</option>
              </select>
            </div>
            <div>
              <span className="form-label">{t('onboarding.holding')}</span>
              <select className="form-select" style={{ borderRadius: 'var(--radius-md)' }} value={scale} onChange={(e) => setScale(e.target.value)}>
                {SCALE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="grid-cols-1">
            <div>
              <span className="form-label">{t('onboarding.region')}</span>
              <select className="form-select" style={{ borderRadius: 'var(--radius-md)' }} value={region} onChange={(e) => setRegion(e.target.value)}>
                {REGION_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="form-label">{t('onboarding.category')}</span>
              <select className="form-select" style={{ borderRadius: 'var(--radius-md)' }} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="OTHER">Enter Custom Category...</option>
              </select>
            </div>
          </div>

          {category === 'OTHER' && (
            <div>
              <span className="form-label">{t('onboarding.custom_category')}</span>
              <input
                className="form-input"
                style={{ borderRadius: 'var(--radius-md)' }}
                placeholder="e.g. Hydroponics"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="grid-cols-1">
            <div>
              <span className="form-label">{t('onboarding.phone')}</span>
              <input className="form-input" style={{ borderRadius: 'var(--radius-md)' }} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <span className="form-label">{t('onboarding.email')}</span>
              <input className="form-input" style={{ borderRadius: 'var(--radius-md)' }} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8, height: 44, borderRadius: 'var(--radius-md)', fontWeight: 700 }}
            onClick={handleSaveProfile}
            disabled={saving}
          >
            <Save size={16} /> {saving ? 'Saving...' : t('common.save')}
          </button>
        </div>
      </div>

      {/* 4. HELP & SUPPORT EXPLAINER */}
      <div className="card" style={{ padding: 18 }}>
        <h4 className="display-font" style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <HelpCircle size={18} /> {t('help.heading')}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, lineHeight: 1.5 }}>
          <div>
            <strong style={{ display: 'block', marginBottom: 4 }}>💡 {t('help.q1')}</strong>
            <p style={{ margin: 0, color: 'var(--text-soft)', whiteSpace: 'pre-line' }}>{t('help.a1')}</p>
          </div>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
            <strong style={{ display: 'block', marginBottom: 4 }}>🔮 {t('help.q2')}</strong>
            <p style={{ margin: 0, color: 'var(--text-soft)' }}>{t('help.a2')}</p>
          </div>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
            <strong style={{ display: 'block', marginBottom: 4 }}>⚠️ {t('help.q3')}</strong>
            <p style={{ margin: 0, color: 'var(--text-soft)' }}>{t('help.a3')}</p>
          </div>
        </div>
      </div>

      {/* 5. DANGER ZONE */}
      <div className="card" style={{
        border: '1px solid rgba(211, 47, 47, 0.25)',
        backgroundColor: 'var(--danger-soft)',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)' }}>
          <ShieldAlert size={18} />
          <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>
            {t('settings.danger_zone')}
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>
          {t('settings.reset_desc')}
        </p>
        <button 
          className="btn btn-danger" 
          style={{ width: '100%', justifyContent: 'center', height: 42, fontWeight: 700, borderRadius: 'var(--radius-md)' }} 
          onClick={handleReset}
        >
          {t('settings.reset_db')}
        </button>
      </div>

      {/* Field Plot Form Modal */}
      <Modal
        isOpen={showFieldModal}
        title={editingField ? t('common.edit') : t('fields.add_field')}
        onClose={() => setShowFieldModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <span className="form-label">{t('fields.field_name')} *</span>
            <input
              className="form-input"
              style={{ borderRadius: 'var(--radius-md)' }}
              placeholder="e.g. North Plot"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
            <div>
              <span className="form-label">{t('fields.area')} *</span>
              <input
                type="number"
                step="0.1"
                className="form-input"
                style={{ borderRadius: 'var(--radius-md)' }}
                placeholder="e.g. 2.5"
                value={fieldArea}
                onChange={(e) => setFieldArea(e.target.value)}
              />
            </div>
            <div>
              <span className="form-label">{t('fields.unit')}</span>
              <select className="form-select" style={{ borderRadius: 'var(--radius-md)' }} disabled value="acres">
                <option value="acres">{t('fields.acres')}</option>
              </select>
            </div>
          </div>

          <div>
            <span className="form-label">{t('fields.crop')}</span>
            <input
              className="form-input"
              style={{ borderRadius: 'var(--radius-md)' }}
              placeholder="e.g. Wheat"
              value={fieldCrop}
              onChange={(e) => setFieldCrop(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button className="btn" onClick={() => setShowFieldModal(false)}>
              {t('common.cancel')}
            </button>
            <button className="btn btn-primary" onClick={handleSaveField}>
              {t('common.save')}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
