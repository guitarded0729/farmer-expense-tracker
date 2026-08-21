import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';

export default function AddCoFarmerModal({
  activeFarmer,
  onClose,
  onAddFarmer,
  CATEGORY_OPTIONS = [],
  REGION_OPTIONS = [],
  SCALE_OPTIONS = []
}) {
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState(activeFarmer ? activeFarmer.farmName : '');
  const [role, setRole] = useState('Co-Farmer');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [region, setRegion] = useState('');
  const [scale, setScale] = useState('');
  const [equity, setEquity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const submit = () => {
    if (!name.trim()) {
      alert('Please enter a name.');
      return;
    }
    const finalCategory = category === 'OTHER' ? customCategory.trim() : category;
    onAddFarmer({
      name: name.trim(),
      farmName: farmName.trim() || activeFarmer.farmName,
      role,
      category: finalCategory || 'General Agriculture',
      region: region || 'Unspecified Region',
      scale: scale || 'Standard Farm',
      equityShare: Number(equity) || 25,
      phone: phone.trim(),
      email: email.trim()
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(43, 35, 24, 0.55)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: 500,
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--line)',
          backgroundColor: 'var(--bg-dark)'
        }}>
          <h3 className="display-font" style={{ fontSize: 16, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={16} color="var(--primary)" /> Add Co-Farmer Profile
          </h3>
          <button className="btn" style={{ padding: 4, borderRadius: '50%' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <span className="form-label">Co-Farmer Name *</span>
              <input className="form-input" placeholder="Enter farmer name..." value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <span className="form-label">Farm Plot Name</span>
              <input className="form-input" placeholder="Enter farm plot name..." value={farmName} onChange={(e) => setFarmName(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <span className="form-label">Role</span>
                <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Co-Farmer">Co-Farmer</option>
                  <option value="Partner / Investor">Partner / Investor</option>
                  <option value="Landowner">Landowner</option>
                  <option value="Labor Partner">Labor Partner</option>
                </select>
              </div>

              <div>
                <span className="form-label">Equity / Cost Share %</span>
                <input className="form-input" type="number" min="0" max="100" placeholder="e.g. 50" value={equity} onChange={(e) => setEquity(e.target.value)} />
              </div>
            </div>

            <div>
              <span className="form-label">Crop Category / Farming Type</span>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Select Category...</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="OTHER">+ Enter Custom Category...</option>
              </select>
            </div>

            {category === 'OTHER' && (
              <div>
                <span className="form-label">Custom Farming Category</span>
                <input
                  className="form-input"
                  placeholder="e.g. Sugarcane & Organic Herbs"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <span className="form-label">Region / Zone</span>
                <select className="form-select" value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option value="">Select Region...</option>
                  {REGION_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <span className="form-label">Holding Scale</span>
                <select className="form-select" value={scale} onChange={(e) => setScale(e.target.value)}>
                  <option value="">Select Scale...</option>
                  {SCALE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <span className="form-label">Phone</span>
                <input className="form-input" placeholder="+91 98765 00000" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <span className="form-label">Email</span>
                <input className="form-input" placeholder="farmer@kisan.in" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 8, height: 42 }}
              onClick={submit}
              disabled={!name.trim()}
            >
              Add Co-Farmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
