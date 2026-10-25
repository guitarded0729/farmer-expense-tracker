export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  // If explicitly configured for a remote or production domain
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  // When accessed from a phone or another device on the same local network
  if (
    typeof window !== 'undefined' &&
    window.location?.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    const protocol = window.location.protocol || 'http:';
    return `${protocol}//${window.location.hostname}:5000`;
  }
  return envUrl || 'http://localhost:5000';
}

const API_BASE_URL = getApiBaseUrl();

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || `API request failed with status ${response.status}`);
  }
  return data.data;
}

// Farmers API
export async function getFarmers() {
  const res = await fetch(`${API_BASE_URL}/api/farmers`);
  return handleResponse(res);
}

export async function createFarmer(farmer) {
  const res = await fetch(`${API_BASE_URL}/api/farmers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(farmer),
  });
  return handleResponse(res);
}

export async function updateFarmer(id, patch) {
  const res = await fetch(`${API_BASE_URL}/api/farmers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return handleResponse(res);
}

export async function deleteFarmer(id) {
  const res = await fetch(`${API_BASE_URL}/api/farmers/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Seasons API
export async function getSeasons() {
  const res = await fetch(`${API_BASE_URL}/api/seasons`);
  return handleResponse(res);
}

export async function createSeason(season) {
  const res = await fetch(`${API_BASE_URL}/api/seasons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(season),
  });
  return handleResponse(res);
}

export async function updateSeason(id, patch) {
  const res = await fetch(`${API_BASE_URL}/api/seasons/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return handleResponse(res);
}

export async function deleteSeason(id) {
  const res = await fetch(`${API_BASE_URL}/api/seasons/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Transactions API
export async function getTransactions(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/api/transactions${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function createTransaction(tx) {
  const res = await fetch(`${API_BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tx),
  });
  return handleResponse(res);
}

export async function updateTransaction(id, patch) {
  const res = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return handleResponse(res);
}

export async function deleteTransaction(id) {
  const res = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Budgets API
export async function getBudgets(farmerId, seasonId) {
  const params = {};
  if (farmerId) params.farmerId = farmerId;
  if (seasonId) params.seasonId = seasonId;
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/api/budgets${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function upsertBudget(budgetData) {
  const res = await fetch(`${API_BASE_URL}/api/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(budgetData),
  });
  return handleResponse(res);
}

// Fields API
export async function getFields(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/api/fields${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function createField(field) {
  const res = await fetch(`${API_BASE_URL}/api/fields`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(field),
  });
  return handleResponse(res);
}

export async function updateField(id, patch) {
  const res = await fetch(`${API_BASE_URL}/api/fields/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return handleResponse(res);
}

export async function deleteField(id) {
  const res = await fetch(`${API_BASE_URL}/api/fields/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}
