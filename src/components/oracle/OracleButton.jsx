// src/components/oracle/OracleButton.jsx
// Button to consult the Oracle (Claude Code)

import { useState, useContext } from 'react';
import { Sparkles, Copy, Download, ExternalLink } from 'lucide-react';
import { OrreryContext } from '@/store';
import { COLORS } from '@/constants';
import {
  copyOracleContextToClipboard,
  downloadOracleContext,
  formatOracleContextAsMarkdown,
} from '@/services/oracle-context';

export function OracleButton() {
  const { state } = useContext(OrreryContext);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState('');

  const handleCopyJSON = () => {
    copyOracleContextToClipboard(state, query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMarkdown = () => {
    const md = formatOracleContextAsMarkdown(state, query);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadOracleContext(state, query);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.375rem 0.625rem',
          borderRadius: '0.5rem',
          border: `1px solid ${COLORS.accentSecondary}40`,
          background: isOpen ? `${COLORS.accentSecondary}20` : 'transparent',
          color: COLORS.accentSecondary,
          cursor: 'pointer',
          fontSize: '0.8125rem',
          transition: 'all 0.2s',
        }}
        title="Consult the Oracle (Claude Code)"
      >
        <Sparkles size={14} />
        Oracle
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            width: '320px',
            background: COLORS.bgCard,
            border: `1px solid ${COLORS.textMuted}25`,
            borderRadius: '0.75rem',
            padding: '1rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            zIndex: 100,
          }}
        >
          <div style={{ marginBottom: '0.75rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: COLORS.textMuted,
                marginBottom: '0.375rem',
              }}
            >
              What do you want to ask the Oracle?
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What should I focus on next?"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: `1px solid ${COLORS.textMuted}25`,
                background: COLORS.bgSpace,
                color: COLORS.textPrimary,
                fontSize: '0.8125rem',
                resize: 'vertical',
                minHeight: '60px',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={handleCopyMarkdown}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                border: `1px solid ${COLORS.accentPrimary}40`,
                background: `${COLORS.accentPrimary}15`,
                color: COLORS.accentPrimary,
                cursor: 'pointer',
                fontSize: '0.8125rem',
                justifyContent: 'center',
              }}
            >
              <Copy size={14} />
              {copied ? 'Copied!' : 'Copy as Markdown'}
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleCopyJSON}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.375rem 0.5rem',
                  borderRadius: '0.375rem',
                  border: `1px solid ${COLORS.textMuted}25`,
                  background: 'transparent',
                  color: COLORS.textMuted,
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  justifyContent: 'center',
                }}
              >
                <Copy size={12} />
                JSON
              </button>

              <button
                onClick={handleDownload}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.375rem 0.5rem',
                  borderRadius: '0.375rem',
                  border: `1px solid ${COLORS.textMuted}25`,
                  background: 'transparent',
                  color: COLORS.textMuted,
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  justifyContent: 'center',
                }}
              >
                <Download size={12} />
                Download
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: `1px solid ${COLORS.textMuted}15`,
              fontSize: '0.6875rem',
              color: COLORS.textMuted,
            }}
          >
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ExternalLink size={10} />
              Paste into Claude Code for deep Oracle consultation
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default OracleButton;
