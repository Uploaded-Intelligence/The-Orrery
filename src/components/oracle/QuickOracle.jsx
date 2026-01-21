// src/components/oracle/QuickOracle.jsx
// Quick Oracle - In-UI AI guidance via Gemini
// "The quick party member for instant nudges"

import { useState, useCallback, useContext } from 'react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { OrreryContext } from '@/store';
import { COLORS } from '@/constants';
import { buildOracleContext } from '@/services/oracle-context';

const QUICK_QUERIES = [
  { label: 'What next?', query: 'What experiment should I run next?' },
  { label: 'Am I stuck?', query: 'Am I blocked on anything? What can I unblock?' },
  { label: 'How am I doing?', query: 'How is my progress today? Any momentum?' },
];

export function QuickOracle() {
  const { state } = useContext(OrreryContext);
  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customQuery, setCustomQuery] = useState('');

  const askQuickOracle = useCallback(async (query) => {
    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      const context = buildOracleContext(state, query);
      const res = await fetch('/api/oracle/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, context }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setResponse(data.response);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [state]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customQuery.trim()) {
      askQuickOracle(customQuery.trim());
      setCustomQuery('');
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${COLORS.accentPrimary}, ${COLORS.accentSecondary})`,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          zIndex: 1000,
        }}
        title="Quick Oracle - Get instant guidance"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.4)';
        }}
      >
        {isOpen ? (
          <X size={24} color="white" />
        ) : (
          <Sparkles size={24} color="white" />
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '92px',
            right: '24px',
            width: '320px',
            maxHeight: '70vh',
            background: COLORS.bgCard,
            border: `1px solid ${COLORS.textMuted}25`,
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: `1px solid ${COLORS.textMuted}15`,
              background: `linear-gradient(135deg, ${COLORS.accentPrimary}15, ${COLORS.accentSecondary}15)`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color={COLORS.accentSecondary} />
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Quick Oracle</span>
            </div>
            <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '4px' }}>
              Instant guidance from your party member
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ padding: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {QUICK_QUERIES.map(({ label, query }) => (
              <button
                key={query}
                onClick={() => askQuickOracle(query)}
                disabled={isLoading}
                style={{
                  padding: '8px 12px',
                  borderRadius: '20px',
                  border: `1px solid ${COLORS.accentPrimary}40`,
                  background: 'transparent',
                  color: COLORS.accentPrimary,
                  fontSize: '12px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Custom Query */}
          <form onSubmit={handleCustomSubmit} style={{ padding: '0 12px 12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Ask anything..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: `1px solid ${COLORS.textMuted}25`,
                  background: COLORS.bgSpace,
                  color: COLORS.textPrimary,
                  fontSize: '13px',
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !customQuery.trim()}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  border: 'none',
                  background: COLORS.accentPrimary,
                  color: 'white',
                  cursor: isLoading || !customQuery.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !customQuery.trim() ? 0.5 : 1,
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </form>

          {/* Response Area */}
          <div
            style={{
              flex: 1,
              padding: '12px',
              overflowY: 'auto',
              minHeight: '80px',
            }}
          >
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: COLORS.textMuted }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '13px' }}>Thinking...</span>
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: `${COLORS.accentDanger}15`,
                  color: COLORS.accentDanger,
                  fontSize: '13px',
                }}
              >
                {error}
              </div>
            )}

            {response && !isLoading && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: `${COLORS.accentSecondary}10`,
                  color: COLORS.textPrimary,
                  fontSize: '13px',
                  lineHeight: '1.5',
                }}
              >
                {response}
              </div>
            )}

            {!isLoading && !error && !response && (
              <div style={{ color: COLORS.textMuted, fontSize: '12px', textAlign: 'center' }}>
                Ask me anything about your experiments
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default QuickOracle;
