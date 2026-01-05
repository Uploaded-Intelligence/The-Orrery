// ═══════════════════════════════════════════════════════════════
// constants/colors.js
// Living Cosmos - Bioluminescent Sci-Fantasy Palette
// ═══════════════════════════════════════════════════════════════

export const COLORS = {
  // ─── Deep Void Layers ───────────────────────────────────────
  // Not pure black - rich, living darkness
  bgVoid: '#0a0b10',       // Deepest void
  bgSpace: '#0f1118',      // Primary background
  bgDeep: '#141620',       // Depth layer
  bgPanel: '#1a1c28',      // Elevated surfaces
  bgElevated: '#242736',   // Highest elevation

  // ─── Bioluminescent Accents ─────────────────────────────────
  // Living light that pulses through the cosmos
  accentPrimary: '#7c3aed',    // Deep violet - mystery, depth
  accentSecondary: '#22d3ee',  // Bright cyan - bioluminescence
  accentTertiary: '#a855f7',   // Light violet - ethereal

  // ─── Life States ────────────────────────────────────────────
  accentGrowth: '#34d399',     // Emerald - living, growing
  accentEnergy: '#fbbf24',     // Warm amber - active energy
  accentBloom: '#f472b6',      // Pink - fruiting, completion
  accentDanger: '#f87171',     // Soft red - warning

  // Legacy aliases for compatibility
  accentSuccess: '#34d399',
  accentWarning: '#fbbf24',

  // ─── Organic Text ───────────────────────────────────────────
  textPrimary: '#f0f4f8',      // Soft white
  textSecondary: '#a0aec0',    // Muted
  textMuted: '#5a6577',        // Distant
  textGlow: '#22d3ee',         // Luminescent

  // ─── Status States ──────────────────────────────────────────
  statusLocked: '#3d4255',     // Dormant, unawakened
  statusAvailable: '#7c3aed',  // Ready to grow
  statusActive: '#22d3ee',     // Pulsing with energy
  statusComplete: '#34d399',   // Fully bloomed
  statusBridge: '#fbbf24',     // Connecting, bridging

  // ─── Particle & Glow Colors ─────────────────────────────────
  particleCore: '#22d3ee',
  particleAura: '#7c3aed',
  particleDust: '#a855f7',
  glowCyan: 'rgba(34, 211, 238, 0.6)',
  glowViolet: 'rgba(124, 58, 237, 0.5)',
  glowPink: 'rgba(244, 114, 182, 0.5)',
  glowGreen: 'rgba(52, 211, 153, 0.5)',
};

// ─── Quest Palette ────────────────────────────────────────────
// Each quest is a unique organism with its own color signature
export const QUEST_COLORS = [
  '#8b5cf6', // Violet Orchid
  '#22d3ee', // Cyan Jellyfish
  '#34d399', // Emerald Moss
  '#fbbf24', // Amber Fungus
  '#f472b6', // Pink Coral
  '#6366f1', // Indigo Deep
  '#2dd4bf', // Teal Algae
  '#fb923c', // Orange Lichen
];

// ─── Animation Timings ────────────────────────────────────────
export const TIMING = {
  breathe: '4s',        // Slow, living pulse
  pulse: '2s',          // Active energy pulse
  grow: '0.6s',         // Growth animation
  bloom: '0.8s',        // Completion bloom
  float: '6s',          // Floating particles
  shimmer: '3s',        // Subtle shimmer
};

// ─── Gradients ────────────────────────────────────────────────
export const GRADIENTS = {
  voidDepth: `radial-gradient(ellipse at 50% 50%, ${COLORS.bgDeep} 0%, ${COLORS.bgVoid} 100%)`,
  cosmicGlow: `radial-gradient(ellipse at 30% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%)`,
  biolumAura: `radial-gradient(circle, ${COLORS.glowCyan} 0%, transparent 70%)`,
  growthAura: `radial-gradient(circle, ${COLORS.glowGreen} 0%, transparent 70%)`,
};
