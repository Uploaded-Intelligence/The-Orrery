// ═══════════════════════════════════════════════════════════════
// components/party/PartyChatPanel.jsx
// Party Chat - Talk to your AI companions
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { COLORS } from '@/constants';
import { useOrrery } from '@/store';
import { PARTY_MEMBERS, DEFAULT_PARTY_MEMBER, buildPartySystemPrompt } from '@/constants/party';
import { sendToParty } from '@/services/claude';

/**
 * PartyChatPanel - Slide-out panel for talking to Party members
 * @param {Object} props
 * @param {Function} props.onClose - Close panel callback
 */
export function PartyChatPanel({ onClose }) {
  const { state } = useOrrery();
  const [activePartyMember, setActivePartyMember] = useState(DEFAULT_PARTY_MEMBER);
  const [messages, setMessages] = useState([]); // { role: 'user' | 'assistant', content: string }
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const member = PARTY_MEMBERS[activePartyMember];
  const MemberIcon = member?.icon;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount and party member change
  useEffect(() => {
    inputRef.current?.focus();
  }, [activePartyMember]);

  // Clear messages when switching party members
  const handlePartyMemberChange = (memberId) => {
    setActivePartyMember(memberId);
    setMessages([]);
    setError(null);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    setIsLoading(true);
    try {
      const systemPrompt = buildPartySystemPrompt(activePartyMember, state);
      const response = await sendToParty(userMessage, systemPrompt, messages);

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error('Party chat error:', err);
      setError(err.message || 'Failed to reach the Party. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: '380px',
      background: COLORS.bgPanel,
      borderLeft: `1px solid ${COLORS.bgElevated}`,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
      zIndex: 100,
    }}>
      {/* Header with close and party member name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: `1px solid ${COLORS.bgElevated}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {MemberIcon && <MemberIcon size={18} color={member.color} />}
          <span style={{
            fontSize: '14px',
            color: member.color,
            fontWeight: 600,
          }}>
            {member.name}
          </span>
          <span style={{
            fontSize: '11px',
            color: COLORS.textMuted,
          }}>
            {member.role}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '4px',
            background: 'transparent',
            border: 'none',
            color: COLORS.textMuted,
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Party member tabs */}
      <div style={{
        display: 'flex',
        padding: '8px',
        gap: '4px',
        borderBottom: `1px solid ${COLORS.bgElevated}`,
      }}>
        {Object.values(PARTY_MEMBERS).map((m) => {
          const Icon = m.icon;
          const isActive = m.id === activePartyMember;
          return (
            <button
              key={m.id}
              onClick={() => handlePartyMemberChange(m.id)}
              title={m.name}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px',
                background: isActive ? `${m.color}20` : 'transparent',
                border: isActive ? `1px solid ${m.color}40` : `1px solid transparent`,
                borderRadius: '6px',
                color: isActive ? m.color : COLORS.textMuted,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={16} />
              <span style={{ fontSize: '11px', fontWeight: isActive ? 600 : 400 }}>
                {m.shortName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: COLORS.textMuted,
            fontSize: '13px',
            padding: '40px 20px',
          }}>
            <div style={{ marginBottom: '8px', opacity: 0.6 }}>
              {MemberIcon && <MemberIcon size={32} color={member.color} style={{ opacity: 0.4 }} />}
            </div>
            <p style={{ margin: 0 }}>
              {member.description}
            </p>
            <p style={{ margin: '12px 0 0', fontSize: '12px' }}>
              {activePartyMember === 'navigator' && '"What\'s on today?"'}
              {activePartyMember === 'oracle' && '"What should I focus on?"'}
              {activePartyMember === 'scribe' && '"Capture this insight..."'}
              {activePartyMember === 'steward' && '"Handle that email..."'}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              background: msg.role === 'user' ? COLORS.accentPrimary : COLORS.bgElevated,
              color: msg.role === 'user' ? 'white' : COLORS.textPrimary,
              fontSize: '14px',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: COLORS.textMuted,
            fontSize: '13px',
          }}>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            <span>{member.name} is thinking...</span>
          </div>
        )}

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: `${COLORS.accentDanger}20`,
            border: `1px solid ${COLORS.accentDanger}40`,
            color: COLORS.accentDanger,
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area - extra bottom padding for TimeSpaceGPS bar */}
      <div style={{
        padding: '12px 16px',
        paddingBottom: '120px', // Space for the GPS bar at bottom
        borderTop: `1px solid ${COLORS.bgElevated}`,
        display: 'flex',
        gap: '8px',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Talk to ${member.name}...`}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px 14px',
            background: COLORS.bgElevated,
            border: `1px solid ${COLORS.textMuted}30`,
            borderRadius: '8px',
            color: COLORS.textPrimary,
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          style={{
            padding: '10px 14px',
            background: inputValue.trim() && !isLoading ? member.color : COLORS.bgElevated,
            border: 'none',
            borderRadius: '8px',
            color: inputValue.trim() && !isLoading ? 'white' : COLORS.textMuted,
            cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default PartyChatPanel;
