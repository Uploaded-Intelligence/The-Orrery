// src/services/liferpg.js
// LifeRPG API Client - Experiments ontology
// "The Orrery is a laboratory of life, not a task manager"

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * LifeRPG API Client
 * Works with experiments (not tasks) and inquiries (not quests)
 */
export const liferpgClient = {
  // ═══════════════════════════════════════════════════════════════
  // EXPERIMENTS (hypotheses you're testing about yourself)
  // ═══════════════════════════════════════════════════════════════

  async getExperiments() {
    const res = await fetch(`${API_BASE}/experiments`);
    if (!res.ok) throw new Error(`Failed to fetch experiments: ${res.status}`);
    const data = await res.json();
    return data.experiments;
  },

  async createExperiment(experiment) {
    const res = await fetch(`${API_BASE}/experiments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(experiment),
    });
    if (!res.ok) throw new Error(`Failed to create experiment: ${res.status}`);
    return res.json();
  },

  async updateExperiment(id, updates) {
    const res = await fetch(`${API_BASE}/experiments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Failed to update experiment: ${res.status}`);
    return res.json();
  },

  async patchExperiment(id, updates) {
    // PATCH for status transitions (especially concluding with findings)
    const res = await fetch(`${API_BASE}/experiments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || `Failed to patch experiment: ${res.status}`);
    }
    return res.json();
  },

  async deleteExperiment(id) {
    const res = await fetch(`${API_BASE}/experiments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete experiment: ${res.status}`);
  },

  // ═══════════════════════════════════════════════════════════════
  // INQUIRIES (research programs - ongoing questions you're exploring)
  // ═══════════════════════════════════════════════════════════════

  async getInquiries() {
    const res = await fetch(`${API_BASE}/inquiries`);
    if (!res.ok) throw new Error(`Failed to fetch inquiries: ${res.status}`);
    const data = await res.json();
    return data.inquiries;
  },

  async getInquiry(id, includeExperiments = false) {
    const url = includeExperiments
      ? `${API_BASE}/inquiries/${id}?includeExperiments=true`
      : `${API_BASE}/inquiries/${id}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch inquiry: ${res.status}`);
    return res.json();
  },

  async createInquiry(inquiry) {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiry),
    });
    if (!res.ok) throw new Error(`Failed to create inquiry: ${res.status}`);
    return res.json();
  },

  async updateInquiry(id, updates) {
    const res = await fetch(`${API_BASE}/inquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Failed to update inquiry: ${res.status}`);
    return res.json();
  },

  async patchInquiry(id, updates) {
    const res = await fetch(`${API_BASE}/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || `Failed to patch inquiry: ${res.status}`);
    }
    return res.json();
  },

  async deleteInquiry(id) {
    const res = await fetch(`${API_BASE}/inquiries/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete inquiry: ${res.status}`);
  },

  // ═══════════════════════════════════════════════════════════════
  // EDGES (condition dependencies between experiments)
  // ═══════════════════════════════════════════════════════════════

  async getEdges() {
    const res = await fetch(`${API_BASE}/edges`);
    if (!res.ok) throw new Error(`Failed to fetch edges: ${res.status}`);
    const data = await res.json();
    return data.edges;
  },

  async createEdge(source, target, condition = '') {
    const res = await fetch(`${API_BASE}/edges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, target, condition }),
    });
    if (!res.ok) throw new Error(`Failed to create edge: ${res.status}`);
    return res.json();
  },

  async deleteEdge(source, target) {
    const res = await fetch(`${API_BASE}/edges?source=${source}&target=${target}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete edge: ${res.status}`);
  },

  // ═══════════════════════════════════════════════════════════════
  // VINES (organic connections between inquiries)
  // ═══════════════════════════════════════════════════════════════

  async getVines() {
    const res = await fetch(`${API_BASE}/vines`);
    if (!res.ok) throw new Error(`Failed to fetch vines: ${res.status}`);
    const data = await res.json();
    return data.vines;
  },

  async createVine(sourceInquiry, targetInquiry, strength = 0.5, reason = '') {
    const res = await fetch(`${API_BASE}/vines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceInquiry, targetInquiry, strength, reason }),
    });
    if (!res.ok) throw new Error(`Failed to create vine: ${res.status}`);
    return res.json();
  },

  async updateVine(sourceInquiry, targetInquiry, updates) {
    const res = await fetch(`${API_BASE}/vines`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceInquiry, targetInquiry, ...updates }),
    });
    if (!res.ok) throw new Error(`Failed to update vine: ${res.status}`);
    return res.json();
  },

  async deleteVine(sourceInquiry, targetInquiry) {
    const res = await fetch(
      `${API_BASE}/vines?sourceInquiry=${sourceInquiry}&targetInquiry=${targetInquiry}`,
      { method: 'DELETE' }
    );
    if (!res.ok) throw new Error(`Failed to delete vine: ${res.status}`);
  },

  // ═══════════════════════════════════════════════════════════════
  // HEALTH CHECK
  // ═══════════════════════════════════════════════════════════════

  async healthCheck() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return res.json();
  },
};

export default liferpgClient;
