// src/services/oracle-context.js
// Oracle Context Builder - exports state for Claude Code consultation
// "The Oracle is the party member who helps with blockers and strategic guidance"

/**
 * Build context for Oracle consultation
 * This is what Claude Code receives to understand your game state
 *
 * @param {Object} state - Orrery state
 * @param {string} query - What you want to ask the Oracle
 * @returns {Object} OracleContext
 */
export function buildOracleContext(state, query = '') {
  const { tasks, quests, edges, questVines } = state;

  // Map UI terminology back to Experiments ontology for Oracle
  const experiments = tasks.map(t => ({
    id: t.id,
    hypothesis: t.hypothesis || t.title,
    status: mapStatusToExperiment(t.status),
    conditions: t.conditions || [],
    energyRequired: t.energyRequired || t.cognitiveLoad || 3,
    timeboxed: t.timeboxed || t.estimatedMinutes || 25,
    actualMinutes: t.actualMinutes || 0,
    findings: t.findings || '',
    nextExperiment: t.nextExperiment || '',
    inquiryId: t.inquiryId || t.questIds?.[0] || null,
    notes: t.notes || '',
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  const inquiries = quests.map(q => ({
    id: q.id,
    question: q.question || q.title,
    description: q.description || '',
    status: mapStatusToInquiry(q.status),
    experimentIds: q.experimentIds || q.taskIds || [],
    keyFindings: q.keyFindings || [],
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  }));

  // Compute blocked experiments (have unmet conditions via edges)
  const blockedExperiments = experiments.filter(exp => {
    const blockers = edges.filter(e => e.target === exp.id);
    return blockers.some(e => {
      const blocker = experiments.find(b => b.id === e.source);
      return blocker && blocker.status !== 'concluded';
    });
  });

  // Available experiments (designed, not blocked)
  const availableExperiments = experiments.filter(exp =>
    exp.status === 'designed' &&
    !blockedExperiments.find(b => b.id === exp.id)
  );

  // In-progress experiments
  const inProgressExperiments = experiments.filter(exp => exp.status === 'running');

  // Experiments concluded today
  const today = new Date().toDateString();
  const concludedToday = experiments.filter(exp =>
    exp.status === 'concluded' &&
    exp.updatedAt &&
    new Date(exp.updatedAt).toDateString() === today
  );

  // Active inquiries (research programs in motion)
  const activeInquiries = inquiries.filter(inq => inq.status === 'active');

  // Vines (inquiry connections)
  const vines = (questVines || []).map(v => ({
    sourceInquiry: v.sourceQuestId || v.sourceInquiry,
    targetInquiry: v.targetQuestId || v.targetInquiry,
    strength: v.strength || 0.5,
    reason: v.reason || '',
  }));

  return {
    // Full state
    experiments,
    inquiries,
    edges,
    vines,

    // Computed for Oracle analysis
    blockedExperiments,
    availableExperiments,
    inProgressExperiments,
    activeInquiries,

    // Momentum indicators
    concludedToday: concludedToday.length,
    totalExperiments: experiments.length,
    totalInquiries: inquiries.length,

    // Current focus (if any active session)
    currentFocus: state.activeSession?.taskId || null,

    // Player request
    query,
    timestamp: new Date().toISOString(),

    // Ontology reminder for Oracle
    _ontology: {
      note: 'This is a laboratory of life, not a task manager.',
      experiments: 'Hypotheses you are testing about yourself',
      inquiries: 'Ongoing questions you are exploring (never complete, only rest or integrate)',
      conditions: 'What needs to be true to run an experiment',
      findings: 'What you learned from an experiment',
      nextExperiment: 'What the findings suggest trying next',
    },
  };
}

/**
 * Copy Oracle context to clipboard
 */
export function copyOracleContextToClipboard(state, query) {
  const context = buildOracleContext(state, query);
  const json = JSON.stringify(context, null, 2);
  navigator.clipboard.writeText(json);
  return context;
}

/**
 * Download Oracle context as JSON file
 */
export function downloadOracleContext(state, query) {
  const context = buildOracleContext(state, query);
  const json = JSON.stringify(context, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `oracle-context-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return context;
}

/**
 * Format context as markdown for pasting into Claude Code
 */
export function formatOracleContextAsMarkdown(state, query) {
  const ctx = buildOracleContext(state, query);

  return `# Oracle Context Export
*Generated: ${ctx.timestamp}*

## Your Question
${query || '(No specific question provided)'}

## Current State

### Momentum
- **Concluded today:** ${ctx.concludedToday}
- **In progress:** ${ctx.inProgressExperiments.length}
- **Available to run:** ${ctx.availableExperiments.length}
- **Blocked:** ${ctx.blockedExperiments.length}

### Available Experiments
${ctx.availableExperiments.length === 0 ? '_None available_' : ctx.availableExperiments.map(e => `
- **${e.hypothesis}** (Energy: ${e.energyRequired}/5, ${e.timeboxed}min)
  ${e.conditions.length > 0 ? `Conditions: ${e.conditions.join(', ')}` : ''}
`).join('')}

### In Progress
${ctx.inProgressExperiments.length === 0 ? '_None_' : ctx.inProgressExperiments.map(e => `
- **${e.hypothesis}**
`).join('')}

### Blocked Experiments
${ctx.blockedExperiments.length === 0 ? '_None_' : ctx.blockedExperiments.map(e => `
- **${e.hypothesis}** - waiting on dependencies
`).join('')}

### Active Inquiries (Research Programs)
${ctx.activeInquiries.length === 0 ? '_None_' : ctx.activeInquiries.map(i => `
- **${i.question}**
  ${i.experimentIds.length} experiments, ${i.keyFindings.length} key findings
`).join('')}

---

<details>
<summary>Full JSON Context</summary>

\`\`\`json
${JSON.stringify(ctx, null, 2)}
\`\`\`

</details>
`;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function mapStatusToExperiment(status) {
  const map = {
    'pending': 'designed',
    'available': 'designed',
    'in_progress': 'running',
    'completed': 'concluded',
    'archived': 'abandoned',
  };
  return map[status] || status;
}

function mapStatusToInquiry(status) {
  const map = {
    'active': 'active',
    'completed': 'integrated',
    'abandoned': 'resting',
  };
  return map[status] || status;
}

export default {
  buildOracleContext,
  copyOracleContextToClipboard,
  downloadOracleContext,
  formatOracleContextAsMarkdown,
};
