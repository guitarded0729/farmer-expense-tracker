import React from 'react';
import {
  LayoutDashboard,
  ArrowDownCircle,
  MapPin,
  Calendar,
  Target,
  Sparkles,
  AlertTriangle,
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
  fieldsCount = 0,
  unusualCount = 0,
  onLogout,
  isOpen,
  setIsOpen
}) {
  const { t } = useTranslation();

  const menuItems = [
    { id: 'dashboard', label: t('nav.home') || 'Home', icon: LayoutDashboard },
    { id: 'expenses', label: t('nav.expenses') || 'Expenses & Income', icon: ArrowDownCircle },
    { id: 'fields', label: t('nav.plots') || 'Field Plots', icon: MapPin, count: fieldsCount },
    { id: 'seasons', label: t('nav.seasons') || 'Seasons', icon: Calendar },
    { id: 'budgets', label: t('budget.heading') || 'Budgets', icon: Target },
    { id: 'prediction', label: t('prediction.heading') || 'AI Forecast', icon: Sparkles },
    { id: 'unusual', label: 'Outliers', icon: AlertTriangle, count: unusualCount, isDanger: true },
    { id: 'analytics', label: t('nav.reports') || 'Reports', icon: BarChart3 },
    { id: 'settings', label: t('nav.settings') || 'Settings', icon: Settings }
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
      padding: '12px 18px',
      fontSize: 15,
      fontWeight: isActive ? 700 : 500,
      color: isActive ? 'var(--primary-dark)' : 'var(--text-soft)',
      backgroundColor: isActive ? 'var(--primary-soft)' : 'transparent',
      border: 'none',
      borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
      borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      textAlign: 'left',
      minHeight: 44,
      touchAction: 'manipulation'
    };
  };

  const renderSidebarContent = (isMobile) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--line)',
        padding: '20px 0 calc(20px + var(--sab))',
        overflowY: 'auto'
      }}
    >
      {/* Sidebar Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          marginBottom: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26 }}>🌾</span>
          <div>
            <h1 className="display-font" style={{ fontSize: 20, margin: 0, letterSpacing: '-0.5px' }}>
              KrishiKhaata
            </h1>
            <span style={{ fontSize: 11, color: 'var(--text-soft)', display: 'block' }}>
              Farm Ledger & Analytics
            </span>
          </div>
        </div>
        {isMobile && setIsOpen && (
          <button
            className="btn"
            style={{
              padding: 8,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              minWidth: 44,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close Navigation Menu"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flexGrow: 1,
          overflowY: 'auto',
          paddingRight: 4
        }}
        aria-label="Main Navigation Menu"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              style={navStyles(item.id)}
              onClick={() => handleNavClick(item.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon
                  size={19}
                  color={isActive ? 'var(--primary)' : 'var(--text-soft)'}
                />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`badge ${item.isDanger ? 'badge-danger' : 'badge-neutral'}`}
                  style={{ fontSize: 10, padding: '2px 6px' }}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {activeFarmer && (
        <div
          style={{
            padding: '16px 18px 0',
            borderTop: '1px solid var(--line)',
            marginTop: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 15,
                flexShrink: 0
              }}
            >
              {activeFarmer.name ? activeFarmer.name[0].toUpperCase() : 'F'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                {activeFarmer.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-soft)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                🌾 {activeFarmer.farmName}
              </div>
            </div>
          </div>
          <button
            className="btn btn-danger"
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: 13,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              minHeight: 44
            }}
            onClick={onLogout}
          >
            <LogOut size={14} /> {t('settings.logout') || 'Logout'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="sidebar-desktop"
        style={{
          width: 260,
          height: '100vh',
          height: '100dvh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50
        }}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 200,
            animation: 'fadeIn 0.2s ease-out',
            backdropFilter: 'blur(2px)'
          }}
        >
          <aside
            className="mobile-drawer"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(300px, 85vw)',
              height: '100%',
              height: '100dvh',
              backgroundColor: 'var(--surface)',
              position: 'fixed',
              top: 0,
              left: 0,
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideInLeft 0.25s ease-out'
            }}
          >
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
