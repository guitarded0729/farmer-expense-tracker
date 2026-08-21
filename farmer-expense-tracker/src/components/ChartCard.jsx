import React from 'react';

export default function ChartCard({ title, children, height = 300 }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {title && (
        <h3 className="display-font" style={{ fontSize: 16, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
          {title}
        </h3>
      )}
      <div style={{ width: '100%', height: height, position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}
