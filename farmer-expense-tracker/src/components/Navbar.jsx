import React from 'react';
import { Menu, Share2, Users } from 'lucide-react';
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
        return `🏠 ${t('nav.home') || 'Home'}`;
      case 'expenses':
        return `💰 ${t('nav.expenses') || 'Expenses'}`;
      case 'income':
        return `💵 ${t('expenses.toggle_income') || 'Income'}`;
      case 'fields':
        return `📍 ${t('nav.plots') || 'Plots'}`;
      case 'seasons':
        return `📅 ${t('nav.seasons') || 'Seasons'}`;
      case 'budgets':
        return `🎯 ${t('budget.heading') || 'Budgets'}`;
      case 'prediction':
        return `🔮 ${t('prediction.heading') || 'AI Forecast'}`;
      case 'unusual':
        return `⚠️ Outliers`;
      case 'analytics':
      case 'reports':
        return `📈 ${t('nav.reports') || 'Reports'}`;
      case 'settings':
        return `⚙️ ${t('nav.settings') || 'Settings'}`;
      default:
        return t('nav.home') || 'KrishiKhaata';
    }
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'calc(10px + var(--sat)) 16px 10px',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--line)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        minHeight: 'calc(56px + var(--sat))'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {/* Mobile menu trigger */}
        <button
          className="btn nav-mobile-toggle touch-target"
          style={{
            padding: 8,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            minWidth: 44,
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Open Navigation Menu"
          onClick={onMenuToggle}
        >
          <Menu size={22} />
        </button>

        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <h2
            className="display-font"
            style={{
              fontSize: 17,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {getPageTitle(activeTab)}
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Language selector */}
        <select
          className="form-select"
          style={{
            width: 'auto',
            minHeight: 38,
            height: 38,
            padding: '4px 24px 4px 10px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--line)',
            backgroundColor: 'var(--primary-soft)',
            color: 'var(--primary-dark)',
            touchAction: 'manipulation'
          }}
          value={lang}
          aria-label="Switch Language / भाषा बदलें"
          onChange={(e) => setLang(e.target.value)}
        >
          <option value="en">EN</option>
          <option value="hi">हिन्दी</option>
        </select>

        {/* Mobile profile switcher if multiple farmers exist */}
        {activeFarmer && farmers.length > 1 && (
          <div className="nav-mobile-profile">
            <select
              className="form-select"
              style={{
                width: 90,
                height: 38,
                padding: '4px 20px 4px 6px',
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 'var(--radius-md)'
              }}
              value={activeFarmer.id}
              onChange={(e) => onSelectFarmer(e.target.value)}
              aria-label="Switch Farmer Profile"
            >
              {farmers.map((f) => (
                <option key={f.id} value={f.id}>
                  👨‍🌾 {f.name.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Desktop Farmer Active Plot Switcher */}
        {activeFarmer && farmers.length > 0 && (
          <div className="nav-desktop-profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            {farmers.filter((f) => f.farmName === activeFarmer.farmName).length > 1 ? (
              <>
                <select
                  className="form-select"
                  style={{ padding: '4px 10px', fontSize: 13, width: 180, height: 36, borderRadius: 'var(--radius-md)' }}
                  value={activeFarmer.id}
                  onChange={(e) => onSelectFarmer(e.target.value)}
                  aria-label="Select Farm Profile"
                >
                  {farmers.map((f) => (
                    <option key={f.id} value={f.id}>
                      🌾 {f.farmName}
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: 10, color: 'var(--text-soft)', lineHeight: 1.2, marginRight: 4 }}>
                  {farmers
                    .filter((f) => f.farmName === activeFarmer.farmName)
                    .map((f) => (
                      <span key={f.id} style={{ whiteSpace: 'nowrap' }}>
                        {f.name} — {f.role}
                      </span>
                    ))}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <select
                  className="form-select"
                  style={{ padding: '4px 10px', fontSize: 13, width: 260, height: 36, borderRadius: 'var(--radius-md)' }}
                  value={activeFarmer.id}
                  onChange={(e) => onSelectFarmer(e.target.value)}
                  aria-label="Select Farm Profile"
                >
                  {farmers.map((f) => {
                    const associated = farmers.filter((x) => x.farmName === f.farmName);
                    const label = associated.length > 1 ? `🌾 ${f.farmName}` : `🌾 ${f.farmName} — ${f.name}`;
                    return (
                      <option key={f.id} value={f.id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                <span style={{ fontSize: 11, color: 'var(--text-soft)', whiteSpace: 'nowrap' }}>
                  ({activeFarmer.role})
                </span>
              </div>
            )}
          </div>
        )}

        {onOpenShareModal && (
          <button 
            className="btn btn-secondary touch-target" 
            style={{
              padding: '6px 12px',
              fontSize: 12,
              minHeight: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              minWidth: 44
            }} 
            onClick={onOpenShareModal}
            aria-label="Share farm access"
          >
            <Share2 size={14} /> <span className="desktop-only">Share</span>
          </button>
        )}
      </div>
    </header>
  );
}
