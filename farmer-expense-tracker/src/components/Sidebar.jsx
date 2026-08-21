import React from 'react';
import {
  LayoutDashboard,
  ArrowDownCircle,
  BarChart3,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeFarmer,
  onLogout,
  isOpen,
  setIsOpen
}) {
  const { t } = useTranslation();

  const menuItems = [
    { id: 'dashboard', label: t('nav.home'), icon: LayoutDashboard },
    { id: 'expenses', label: t('nav.expenses'), icon: ArrowDownCircle },
    { id: 'analytics', label: t('nav.reports'), icon: BarChart3 },
    { id: 'settings', label: t('nav.settings'), icon: Settings }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setIsOpen) setIsOpen(false); // Close mobile drawer
  };

  const navStyles = (id) => {
    const isActive = activeTab === id;
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: '14px 20px',
      fontSize: 16,
      fontWeight: isActive ? 700 : 500,
      color: isActive ? 'var(--primary-dark)' : 'var(--text-soft)',
      backgroundColor: isActive ? 'var(--primary-soft)' : 'transparent',
      border: 'none',
      borderLeft: isActive ? '5px solid var(--primary)' : '5px solid transparent',
      borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      textAlign: 'left'
    };
  };

  const sidebarContent = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--surface)',
      borderRight: '1px solid var(--line)',
      padding: '24px 0 20px'
    }}>
      {/* Sidebar Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        marginBottom: 32
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🌾</span>
          <h1 className="display-font" style={{ fontSize: 22, margin: 0, letterSpacing: '-0.5px' }}>
            FarmLedger
          </h1>
        </div>
        {setIsOpen && (
          <button
            className="btn mobile-only"
            style={{ padding: 6, borderRadius: '50%', border: 'none' }}
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              style={navStyles(item.id)}
              onClick={() => handleNavClick(item.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Icon size={20} color={activeTab === item.id ? 'var(--primary)' : 'var(--text-soft)'} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {activeFarmer && (
        <div style={{
          padding: '16px 20px 0',
          borderTop: '1px solid var(--line)',
          margin: '0 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 16
            }}>
              {activeFarmer.name[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {activeFarmer.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-soft)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {activeFarmer.farmName}
              </div>
            </div>
          </div>
          <button
            className="btn btn-danger"
            style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
            onClick={onLogout}
          >
            <LogOut size={14} /> {t('settings.logout')}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="desktop-only" style={{
        width: 260,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50
      }}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpen && (
        <div
          className="mobile-only"
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 280,
              height: '100%',
              backgroundColor: 'var(--surface)',
              position: 'fixed',
              top: 0,
              left: 0,
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
