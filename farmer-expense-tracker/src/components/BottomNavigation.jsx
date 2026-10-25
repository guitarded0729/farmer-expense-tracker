import React from 'react';
import {
  LayoutDashboard,
  ArrowDownCircle,
  MapPin,
  BarChart3,
  Settings
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export default function BottomNavigation({ activeTab, setActiveTab }) {
  const { t } = useTranslation();

  const navItems = [
    { id: 'dashboard', label: t('nav.home') || 'Home', icon: LayoutDashboard },
    { id: 'expenses', label: t('nav.expenses') || 'Expenses', icon: ArrowDownCircle },
    { id: 'fields', label: t('nav.plots') || 'Plots', icon: MapPin },
    { id: 'analytics', label: t('nav.reports') || 'Reports', icon: BarChart3 },
    { id: 'settings', label: t('nav.settings') || 'Settings', icon: Settings }
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--line)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 'calc(60px + var(--sab))',
        paddingBottom: 'var(--sab)',
        zIndex: 90,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          activeTab === item.id ||
          (item.id === 'dashboard' && activeTab === 'home') ||
          (item.id === 'analytics' && activeTab === 'reports');

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            aria-current={isActive ? 'page' : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              color: isActive ? 'var(--primary-dark)' : 'var(--text-soft)',
              fontSize: 11,
              fontWeight: isActive ? 700 : 500,
              gap: 3,
              flex: 1,
              height: '100%',
              minHeight: 44,
              minWidth: 44,
              cursor: 'pointer',
              touchAction: 'manipulation',
              padding: '6px 2px',
              transition: 'color 0.15s ease'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px 12px',
                borderRadius: 16,
                backgroundColor: isActive ? 'var(--primary-soft)' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={19} color={isActive ? 'var(--primary)' : 'var(--text-soft)'} />
            </div>
            <span
              style={{
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
