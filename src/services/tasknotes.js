// src/services/tasknotes.js

/**
 * TaskNotes HTTP API Client
 * Connects Orrery directly to TaskNotes (server-authoritative)
 *
 * API runs on localhost:8080 by default
 * All task operations go through TaskNotes, which is source of truth
 *
 * NOTE: We do NOT use TaskNotes NLP API - Claude handles all intelligence
 */

const DEFAULT_BASE_URL = 'http://localhost:8080/api';

class TaskNotesClient {
  constructor(baseUrl = DEFAULT_BASE_URL, apiKey = null) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    let response;
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (e) {
      // Network error (CORS, DNS, connection refused, etc.)
      throw new Error(`Network error: ${e.message}. Is TaskNotes HTTP API running?`);
    }

    // Handle non-JSON responses (e.g., HTML error pages)
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`TaskNotes returned non-JSON response (${response.status})`);
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error(`Failed to parse TaskNotes response: ${e.message}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'TaskNotes API error');
    }

    return data.data;
  }

  // ─── Health ─────────────────────────────────────────────────────

  async health() {
    return this.request('/health');
  }

  // ─── Tasks ──────────────────────────────────────────────────────

  async getTasks(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.project) params.append('project', filters.project);
    if (filters.tag) params.append('tag', filters.tag);

    const query = params.toString();
    return this.request(`/tasks${query ? `?${query}` : ''}`);
  }

  async getTask(id) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(task) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id, updates) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleTaskStatus(id) {
    return this.request(`/tasks/${id}/toggle-status`, {
      method: 'POST',
    });
  }

  // ─── Stats ──────────────────────────────────────────────────────

  async getStats() {
    return this.request('/stats');
  }

  async getFilterOptions() {
    return this.request('/filter-options');
  }
}

// Singleton instance
export const taskNotesClient = new TaskNotesClient();

// Export class for testing/custom instances
export { TaskNotesClient };

/**
 * Configure the TaskNotes client
 * Call this on app startup with user settings
 */
export function configureTaskNotes(baseUrl, apiKey = null) {
  taskNotesClient.baseUrl = baseUrl || DEFAULT_BASE_URL;
  taskNotesClient.apiKey = apiKey;
}

/**
 * Test connection to TaskNotes
 */
export async function testConnection() {
  try {
    await taskNotesClient.health();
    return { connected: true, error: null };
  } catch (e) {
    return { connected: false, error: e.message };
  }
}
