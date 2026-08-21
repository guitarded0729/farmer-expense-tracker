import React from 'react';
import { LayoutDashboard, ArrowDownCircle, BarChart3, Settings } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export default function BottomNavigation({ activeTab, setActiveTab }) {
  const { t } = useTranslation();

  const navItems = [
    { id: 'dashboard', label: t('nav.home'), icon: LayoutDashboard },
    { id: 'expenses', label: t('nav.expenses'), icon: ArrowDownCircle },
    { id: 'analytics', label: t('nav.reports'), icon: BarChart3 },
    { id: 'settings', label: t('nav.settings'), icon: Settings }
  ];

  return (
    <div 
      className="mobile-only"
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
        height: 64,
        paddingBottom: 'safe-area-inset-bottom',
        zIndex: 100,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id || (item.id === 'dashboard' && activeTab === 'home') || (item.id === 'analytics' && activeTab === 'reports');
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
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
              gap: 4,
              flex: 1,
              height: '100%',
              cursor: 'pointer'
            }}
          >
            <Icon size={20} color={isActive ? 'var(--primary)' : 'var(--text-soft)'} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
