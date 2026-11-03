/* Small fetch wrapper for talking to the backend API. */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);
const API_BASE = window.API_BASE || (
  LOCAL_HOSTS.has(window.location.hostname)
    ? `${window.location.protocol}//${window.location.hostname}:4000/api`
    : '/api'
);

async function apiRequest(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include', // send the session cookie
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch (_) { /* no body */ }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body }),
  del: (path) => apiRequest(path, { method: 'DELETE' }),

  me: () => apiRequest('/auth/me').catch(() => ({ user: null })),
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password) => apiRequest('/auth/register', { method: 'POST', body: { name, email, password } }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),

  sermons: () => apiRequest('/sermons'),
  events: () => apiRequest('/events'),
  submitPledge: (payload) => apiRequest('/pledges', { method: 'POST', body: payload }),
};
