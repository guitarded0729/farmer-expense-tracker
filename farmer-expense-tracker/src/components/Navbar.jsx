import React from 'react';
import { Menu, Share2 } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export default function Navbar({
  activeTab,
  farmers = [],
  activeFarmer,
  onSelectFarmer,
  onOpenShareModal,
  onMenuToggle
}) {
  const { t, lang, setLang } = useTranslation();

  const getPageTitle = (tab) => {
    switch (tab) {
      case 'dashboard':
      case 'home':
        return `🏠 ${t('nav.home')}`;
      case 'expenses':
        return `💰 ${t('nav.expenses')}`;
      case 'analytics':
      case 'reports':
        return `📈 ${t('nav.reports')}`;
      case 'settings':
        return `⚙️ ${t('nav.settings')}`;
      default:
        return t('nav.home');
    }
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--line)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Mobile menu trigger */}
        <button
          className="btn mobile-only"
          style={{ padding: 8, border: 'none', background: 'transparent' }}
          onClick={onMenuToggle}
        >
          <Menu size={22} />
        </button>
        
        <div>
          <h2 className="display-font" style={{ fontSize: 18, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            {getPageTitle(activeTab)}
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Language selector */}
        <select
          className="form-select"
          style={{
            width: 'auto',
            height: 34,
            padding: '4px 28px 4px 10px',
            fontSize: 13,
            fontWeight: 600,
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

        {/* Farmer Active Plot Switcher */}
        {activeFarmer && farmers.length > 0 && (
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <select
              className="form-select"
              style={{ padding: '4px 10px', fontSize: 13, width: 180, height: 34, borderRadius: 'var(--radius-md)' }}
              value={activeFarmer.id}
              onChange={(e) => onSelectFarmer(e.target.value)}
            >
              {farmers.map((f) => (
                <option key={f.id} value={f.id}>
                  🌾 {f.farmName}
                </option>
              ))}
            </select>
          </div>
        )}

        {onOpenShareModal && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: 12, height: 34, borderRadius: 'var(--radius-md)' }} 
            onClick={onOpenShareModal}
          >
            <Share2 size={13} /> <span className="desktop-only">Share</span>
          </button>
        )}
      </div>
    </header>
  );
}
