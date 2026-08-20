const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('pollpulse_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('pollpulse_token', token);
  } else {
    localStorage.removeItem('pollpulse_token');
  }
}

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}

export const authApi = {
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => apiRequest('/auth/me'),
};

export const pollsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/polls${query ? `?${query}` : ''}`);
  },
  get: (id) => apiRequest(`/polls/${id}`),
  create: (body) => apiRequest('/polls', { method: 'POST', body: JSON.stringify(body) }),
  vote: (id, optionId) =>
    apiRequest(`/polls/${id}/vote`, { method: 'POST', body: JSON.stringify({ optionId }) }),
  close: (id) => apiRequest(`/polls/${id}/close`, { method: 'POST' }),
};
