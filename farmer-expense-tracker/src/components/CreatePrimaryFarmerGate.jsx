import React, { useState } from 'react';
import { Sprout } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export default function CreatePrimaryFarmerGate({
  farmers = [],
  onSelectFarmer,
  onCreate,
  inviteUrlData,
  onLoadDemo,
  CATEGORY_OPTIONS = [],
  REGION_OPTIONS = [],
  SCALE_OPTIONS = []
}) {
  const { t, lang, setLang } = useTranslation();
  const [mode, setMode] = useState(farmers && farmers.length > 0 ? 'login' : 'register');
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers && farmers.length > 0 ? farmers[0].id : '');

  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState(inviteUrlData ? inviteUrlData.farmName : '');
  const [role, setRole] = useState('Primary Operator');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [region, setRegion] = useState('');
  const [scale, setScale] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = () => {
    if (selectedFarmerId && onSelectFarmer) {
      onSelectFarmer(selectedFarmerId);
    }
  };

  const submitRegister = () => {
    if (!name.trim() || !farmName.trim()) return;
    const finalCategory = category === 'OTHER' ? customCategory.trim() : category;
    onCreate({
      name: name.trim(),
      farmName: farmName.trim(),
      role,
      category: finalCategory || 'General Agriculture',
      region: region || 'Unspecified Region',
      scale: scale || 'Standard Farm',
      phone: phone.trim(),
      email: email.trim(),
      equityShare: 100
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: 'var(--bg-dark)',
      position: 'relative'
    }}>
      {/* Language selector at top right */}
      <div style={{ position: 'absolute', top: 'calc(14px + var(--sat))', right: 16, zIndex: 10 }}>
        <select
          className="form-select"
          style={{
            width: 'auto',
            height: 38,
            padding: '4px 28px 4px 10px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--line)',
            backgroundColor: 'var(--primary-soft)',
            color: 'var(--primary-dark)'
          }}
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          <option value="en">🌐 English</option>
          <option value="hi">🌐 हिन्दी</option>
        </select>
      </div>

      <div className="card" style={{ maxWidth: 500, width: '100%', padding: '32px 28px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            display: 'inline-flex',
            padding: 10,
            borderRadius: '50%',
            backgroundColor: 'var(--primary-soft)',
            color: 'var(--primary)',
            marginBottom: 10
          }}>
            <Sprout size={32} />
          </div>
          <h1 className="display-font" style={{ fontSize: 24, margin: '0 0 6px' }}>
            {t('onboarding.title')}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: 0, lineHeight: 1.4 }}>
            {mode === 'login'
              ? t('onboarding.login_desc')
              : t('onboarding.register_desc')}
          </p>
        </div>

        {farmers && farmers.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
            <button
              className={`btn ${mode === 'login' ? 'btn-primary' : ''}`}
              style={{ flex: 1, height: 42, borderRadius: 'var(--radius-md)', fontWeight: 700 }}
              onClick={() => setMode('login')}
            >
              🔑 {t('onboarding.login')}
            </button>
            <button
              className={`btn ${mode === 'register' ? 'btn-primary' : ''}`}
              style={{ flex: 1, height: 42, borderRadius: 'var(--radius-md)', fontWeight: 700 }}
              onClick={() => setMode('register')}
            >
              ➕ {t('onboarding.register')}
            </button>
          </div>
        )}

        {mode === 'login' && farmers && farmers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <span className="form-label">{t('onboarding.farmer_select')}</span>
              <select
                className="form-select"
                style={{ fontSize: 14, height: 44, fontWeight: 600, borderRadius: 'var(--radius-md)' }}
                value={selectedFarmerId}
                onChange={(e) => setSelectedFarmerId(e.target.value)}
              >
                {farmers.map((f) => (
                  <option key={f.id} value={f.id}>
                    👨‍🌾 {f.name} — {f.farmName} ({f.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              style={{ justifyContent: 'center', height: 44, fontSize: 14, fontWeight: 700, borderRadius: 'var(--radius-md)' }}
              onClick={handleLogin}
            >
              🔓 {t('onboarding.login_btn')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <span className="form-label">{t('onboarding.name')}</span>
              <input
                className="form-input"
                style={{ borderRadius: 'var(--radius-md)' }}
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <span className="form-label">{t('onboarding.farm_name')}</span>
              <input
                className="form-input"
                style={{ borderRadius: 'var(--radius-md)' }}
                placeholder="e.g. Green Valley Plot 4A"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
              />
            </div>

          <div className="form-row-2col">
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
                  <option value="">{t('onboarding.select_scale')}</option>
                  {SCALE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <span className="form-label">{t('onboarding.category')}</span>
              <select
                className="form-select"
                style={{ borderRadius: 'var(--radius-md)' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">{t('onboarding.select_category')}</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="OTHER">+ Enter Custom Category...</option>
              </select>
            </div>

            {category === 'OTHER' && (
              <div>
                <span className="form-label">{t('onboarding.custom_category')}</span>
                <input
                  className="form-input"
                  style={{ borderRadius: 'var(--radius-md)' }}
                  placeholder="e.g. Sugarcane & Herbs"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}

            <div>
              <span className="form-label">{t('onboarding.region')}</span>
              <select
                className="form-select"
                style={{ borderRadius: 'var(--radius-md)' }}
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">{t('onboarding.select_region')}</option>
                {REGION_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

          <div className="form-row-2col">
              <div>
                <span className="form-label">{t('onboarding.phone')}</span>
                <input className="form-input" style={{ borderRadius: 'var(--radius-md)' }} placeholder="+91 98765 00000" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <span className="form-label">{t('onboarding.email')}</span>
                <input className="form-input" style={{ borderRadius: 'var(--radius-md)' }} placeholder="farmer@kisan.in" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ marginTop: 8, justifyContent: 'center', height: 44, fontWeight: 700, borderRadius: 'var(--radius-md)' }}
              disabled={!name.trim() || !farmName.trim()}
              onClick={submitRegister}
            >
              ✨ {t('onboarding.submit')}
            </button>
          </div>
        )}

        {/* Dedicated Load Demo Data button for judges */}
        {onLoadDemo && (
          <div style={{ borderTop: '1px solid var(--line)', marginTop: 18, paddingTop: 14, textAlign: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-soft)', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              {t('onboarding.demo_title')}
            </span>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', height: 40, fontWeight: 700, borderRadius: 'var(--radius-md)' }}
              onClick={onLoadDemo}
            >
              📊 {t('onboarding.demo_btn')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
