import React from 'react';

export default function LoadingState({ type = 'cards', count = 3 }) {
  if (type === 'cards') {
    return (
      <div className="grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card skeleton" style={{ height: 140, border: 'none' }} />
        ))}
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card skeleton" style={{ height: 100, border: 'none' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 48, width: '100%' }} />
      ))}
    </div>
  );
}
