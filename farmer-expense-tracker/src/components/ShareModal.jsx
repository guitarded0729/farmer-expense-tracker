import React, { useState, useMemo } from 'react';
import { Share2, X, Copy, Check, ExternalLink, QrCode } from 'lucide-react';

const uid = () => Math.random().toString(36).slice(2, 10);

export default function ShareModal({ activeFarmer, onClose }) {
  const [copied, setCopied] = useState(false);

  const inviteCode = useMemo(() => uid(), []);
  const baseUrl = window.location.origin + window.location.pathname;
  const activeWorkingUrl = `${baseUrl}?invite=${inviteCode}&farm=${encodeURIComponent(activeFarmer.farmName)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeWorkingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
            <Share2 size={16} color="var(--primary)" /> Working Shared Farm Link
          </h3>
          <button
            className="btn touch-target"
            style={{
              padding: 8,
              borderRadius: '50%',
              minWidth: 44,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 18 }}>
          <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: '0 0 14px', lineHeight: 1.5 }}>
            This is a <strong>live, functional working URL</strong>. Anyone opening this link will immediately be prompted to join <strong>{activeFarmer.farmName}</strong> and enter their co-farmer details.
          </p>

          <div style={{ marginBottom: 16 }}>
            <span className="form-label">Active Working Shareable URL</span>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              <input
                className="form-input"
                readOnly
                value={activeWorkingUrl}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12, flex: '1 1 200px' }}
              />
              <button className="btn btn-primary" style={{ flexShrink: 0, minHeight: 44 }} onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <a
              href={activeWorkingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', fontSize: 12, height: 38 }}
            >
              <ExternalLink size={13} /> Test Working Link in New Tab
            </a>
          </div>

          <div style={{ textAlign: 'center', padding: 14, background: '#fff', borderRadius: 6, border: '1px dashed var(--line)' }}>
            <QrCode size={80} style={{ margin: '0 auto 6px', color: 'var(--text)' }} />
            <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>Scan with smartphone camera to open active link</div>
          </div>
        </div>
      </div>
    </div>
  );
}
