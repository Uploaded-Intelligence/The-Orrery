// src/components/ui/PhysicsDebugPanel.jsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings2, ChevronDown, ChevronRight } from 'lucide-react';
import { COLORS } from '@/constants';

/**
 * Collapsible debug panel for live physics parameter tuning
 * Shows sliders for all d3-force parameters
 */
export function PhysicsDebugPanel({ config, onChange }) {
  const [expanded, setExpanded] = useState(false);

  const sliders = [
    { key: 'repulsionStrength', label: 'Repulsion', min: -3000, max: -200, step: 100 },
    { key: 'linkDistance', label: 'Link Distance', min: 50, max: 400, step: 10 },
    { key: 'linkStrength', label: 'Link Strength', min: 0.05, max: 1, step: 0.05 },
    { key: 'collisionRadius', label: 'Collision Radius', min: 40, max: 150, step: 5 },
    { key: 'collisionIterations', label: 'Collision Iters', min: 1, max: 8, step: 1 },
    { key: 'radialStrength', label: 'Radial Strength', min: 0, max: 0.2, step: 0.01 },
    { key: 'centerStrength', label: 'Center Strength', min: 0, max: 0.1, step: 0.005 },
    { key: 'alphaDecay', label: 'Alpha Decay', min: 0.005, max: 0.05, step: 0.005 },
    { key: 'velocityDecay', label: 'Velocity Decay', min: 0.1, max: 0.6, step: 0.05 },
  ];

  const handleChange = (key, value) => {
    onChange({ ...config, [key]: parseFloat(value) });
  };

  const panelStyle = {
    position: 'absolute',
    bottom: '100px',   // Above the TimeSpaceGPS panel
    right: '80px',     // Left of the QuickOracle button
    background: COLORS.bgPanel,
    border: `1px solid ${COLORS.accentPrimary}60`,
    borderRadius: '8px',
    padding: '10px',
    zIndex: 999,       // High z-index to ensure visibility
    minWidth: expanded ? '280px' : 'auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    color: COLORS.textMuted,
    fontSize: '12px',
    fontFamily: 'monospace',
  };

  const sliderContainerStyle = {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  };

  const sliderRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const labelStyle = {
    color: COLORS.textMuted,
    fontSize: '11px',
    fontFamily: 'monospace',
    width: '100px',
    flexShrink: 0,
  };

  const valueStyle = {
    color: COLORS.accentSecondary,
    fontSize: '11px',
    fontFamily: 'monospace',
    width: '55px',
    textAlign: 'right',
    flexShrink: 0,
  };

  return createPortal(
    <div style={panelStyle}>
      <div style={headerStyle} onClick={() => setExpanded(!expanded)}>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Settings2 size={14} />
        <span>Physics</span>
      </div>

      {expanded && (
        <div style={sliderContainerStyle}>
          {sliders.map(({ key, label, min, max, step }) => (
            <div key={key} style={sliderRowStyle}>
              <span style={labelStyle}>{label}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={config[key] || 0}
                onChange={(e) => handleChange(key, e.target.value)}
                style={{ flex: 1, cursor: 'pointer' }}
              />
              <span style={valueStyle}>{config[key]?.toFixed?.(step < 1 ? 2 : 0) || config[key]}</span>
            </div>
          ))}

          <button
            onClick={() => onChange(null)}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              background: COLORS.accentWarning + '20',
              border: `1px solid ${COLORS.accentWarning}`,
              borderRadius: '4px',
              color: COLORS.accentWarning,
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Reset to Defaults
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
