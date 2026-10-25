/**
 * KrishiKhaata API Service Layer with High-Availability Hybrid Mode
 * 
 * Automatically connects to Express + PostgreSQL backend when available
 * (locally or via VITE_API_URL). When deployed to static cloud hosts
 * like Vercel without an active backend URL, seamlessly operates in
 * High-Availability Client Storage mode with persistent browser storage.
 */

export function isLocalNetwork(hostname) {
  if (!hostname) return false;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
    hostname.endsWith('.local')
  );
}

export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  // If explicitly configured for a remote or production domain
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('krishi_backend_url');
    if (customUrl) return customUrl;

    const hostname = window.location?.hostname;
    // When on phone or tablet on the same Wi-Fi LAN
    if (isLocalNetwork(hostname) && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const protocol = window.location.protocol || 'http:';
      return `${protocol}//${hostname}:5000`;
    }
    // If on localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return envUrl || 'http://localhost:5000';
    }
    // If hosted on a public domain like Vercel, Netlify, etc. and no VITE_API_URL provided:
    // return null so it uses client-side storage instead of attempting port 5000 on cloud
    return null;
  }

  return envUrl || 'http://localhost:5000';
}

const API_BASE_URL = getApiBaseUrl();

/* ------------------------------------------------------------------ */
/* Local Client Storage Engine & Pre-seeded Rich Demo Dataset         */
/* ------------------------------------------------------------------ */
const STORAGE_KEY = 'krishi_client_db_v2';

const DEFAULT_DB = {
  farmers: [
    {
      id: 'f-aryan-1',
      name: 'Aryan Singh',
      farmName: 'Shanti Plot',
      role: 'Primary Operator',
      category: 'Organic Farming',
      region: 'Central Zone (MP/Maharashtra)',
      scale: 'Smallholder (< 2 Ha)',
      phone: '+91 79779 12345',
      email: 'aryansingh0729@gmail.com',
      equityShare: 100,
      createdAt: '2026-08-12T15:48:13.958Z',
      updatedAt: '2026-08-12T15:48:13.958Z'
    },
    {
      id: 'f-vinay-2',
      name: 'Vinay',
      farmName: 'Shanti Plot',
      role: 'Co-Farmer',
      category: 'Horticulture & Fruits',
      region: 'Central Zone (MP/Maharashtra)',
      scale: 'Medium Farm (2-10 Ha)',
      phone: '7977912323',
      email: 'abc@gmail.com',
      equityShare: 50,
      createdAt: '2026-08-12T15:53:57.456Z',
      updatedAt: '2026-08-12T15:53:57.456Z'
    }
  ],
  seasons: [
    { id: 's-1', name: 'Kharif 2023 (Season 1)', order: 1 },
    { id: 's-2', name: 'Rabi 2023 (Season 2)', order: 2 },
    { id: 's-3', name: 'Kharif 2024 (Season 3)', order: 3 },
    { id: 's-4', name: 'Rabi 2024 (Season 4)', order: 4 },
    { id: 's-5', name: 'Kharif 2025 (Season 5)', order: 5 }
  ],
  fields: [
    {
      id: 'fld-1',
      farmerId: 'f-aryan-1',
      seasonId: 's-5',
      name: 'North Terrace Plot',
      crop: 'Basmati Rice',
      area: 4.5,
      areaUnit: 'acres',
      location: '26.8467° N, 80.9462° E'
    },
    {
      id: 'fld-2',
      farmerId: 'f-aryan-1',
      seasonId: 's-5',
      name: 'South Meadows Plot',
      crop: 'Premium Wheat',
      area: 3.2,
      areaUnit: 'acres',
      location: '26.8471° N, 80.9469° E'
    }
  ],
  transactions: [
    { id: 't-1', seasonId: 's-1', farmerId: 'f-aryan-1', type: 'expense', category: 'seeds', amount: 10000, note: 'Pusa Rice Seeds', date: '2023-06-15', crop: 'Rice', unusual: false },
    { id: 't-2', seasonId: 's-1', farmerId: 'f-aryan-1', type: 'expense', category: 'fertilizer', amount: 12000, note: 'DAP & Urea bags', date: '2023-07-02', crop: 'Rice', unusual: false },
    { id: 't-3', seasonId: 's-1', farmerId: 'f-aryan-1', type: 'expense', category: 'labor', amount: 8000, note: 'Sowing operations labor', date: '2023-06-20', crop: 'Rice', unusual: false },
    { id: 't-4', seasonId: 's-1', farmerId: 'f-aryan-1', type: 'expense', category: 'irrigation', amount: 5000, note: 'Diesel pump rental', date: '2023-08-01', crop: 'Rice', unusual: false },
    { id: 't-5', seasonId: 's-1', farmerId: 'f-aryan-1', type: 'income', category: 'crop_sale', amount: 62000, note: 'Co-op Rice Harvest Sale', date: '2023-11-10', crop: 'Rice', unusual: false },

    { id: 't-6', seasonId: 's-2', farmerId: 'f-aryan-1', type: 'expense', category: 'seeds', amount: 11000, note: 'HD-3086 Wheat Seeds', date: '2023-11-20', crop: 'Wheat', unusual: false },
    { id: 't-7', seasonId: 's-2', farmerId: 'f-aryan-1', type: 'expense', category: 'fertilizer', amount: 13500, note: 'NPK fertilizer mix', date: '2023-12-05', crop: 'Wheat', unusual: false },
    { id: 't-8', seasonId: 's-2', farmerId: 'f-aryan-1', type: 'expense', category: 'labor', amount: 9500, note: 'Harvesting labor', date: '2024-03-25', crop: 'Wheat', unusual: false },
    { id: 't-9', seasonId: 's-2', farmerId: 'f-aryan-1', type: 'expense', category: 'irrigation', amount: 6000, note: 'Tube-well electricity cost', date: '2024-01-10', crop: 'Wheat', unusual: false },
    { id: 't-10', seasonId: 's-2', farmerId: 'f-aryan-1', type: 'income', category: 'crop_sale', amount: 70000, note: 'Mandi Wheat Sale', date: '2024-04-12', crop: 'Wheat', unusual: false },

    { id: 't-11', seasonId: 's-3', farmerId: 'f-aryan-1', type: 'expense', category: 'seeds', amount: 12500, note: 'Basmati Seed Sowing', date: '2024-06-18', crop: 'Rice', unusual: false },
    { id: 't-12', seasonId: 's-3', farmerId: 'f-aryan-1', type: 'expense', category: 'fertilizer', amount: 15000, note: 'Organic fertilizer bags', date: '2024-07-10', crop: 'Rice', unusual: false },
    { id: 't-13', seasonId: 's-3', farmerId: 'f-aryan-1', type: 'expense', category: 'labor', amount: 11000, note: 'Weeding and transplantation', date: '2024-07-28', crop: 'Rice', unusual: false },
    { id: 't-14', seasonId: 's-3', farmerId: 'f-aryan-1', type: 'expense', category: 'irrigation', amount: 7500, note: 'Borewell repair & diesel', date: '2024-08-15', crop: 'Rice', unusual: false },
    { id: 't-15', seasonId: 's-3', farmerId: 'f-aryan-1', type: 'income', category: 'crop_sale', amount: 79000, note: 'Rice harvest sale to trader', date: '2024-11-05', crop: 'Rice', unusual: false },
    { id: 't-16', seasonId: 's-3', farmerId: 'f-aryan-1', type: 'income', category: 'subsidy', amount: 8000, note: 'PM-Kisan Subsidy Scheme', date: '2024-09-01', unusual: false },

    { id: 't-17', seasonId: 's-4', farmerId: 'f-aryan-1', type: 'expense', category: 'seeds', amount: 14500, note: 'Wheat Seed Varieties', date: '2024-11-22', crop: 'Wheat', unusual: false },
    { id: 't-18', seasonId: 's-4', farmerId: 'f-aryan-1', type: 'expense', category: 'fertilizer', amount: 17000, note: 'Potash & Urea inputs', date: '2024-12-10', crop: 'Wheat', unusual: false },
    { id: 't-19', seasonId: 's-4', farmerId: 'f-aryan-1', type: 'expense', category: 'labor', amount: 12000, note: 'Field leveling and sorting labor', date: '2025-01-05', crop: 'Wheat', unusual: false },
    { id: 't-20', seasonId: 's-4', farmerId: 'f-aryan-1', type: 'expense', category: 'irrigation', amount: 8500, note: 'Drip irrigation maintenance', date: '2025-01-20', crop: 'Wheat', unusual: false },
    { id: 't-21', seasonId: 's-4', farmerId: 'f-aryan-1', type: 'income', category: 'crop_sale', amount: 88000, note: 'Wheat sale to Food Corp', date: '2025-04-18', crop: 'Wheat', unusual: false },

    { id: 't-22', seasonId: 's-5', farmerId: 'f-aryan-1', type: 'expense', category: 'seeds', amount: 16500, note: 'High-yield hybrid Basmati seeds', date: '2025-06-12', crop: 'Basmati Rice', fieldId: 'fld-1', unusual: false },
    { id: 't-23', seasonId: 's-5', farmerId: 'f-aryan-1', type: 'expense', category: 'fertilizer', amount: 21000, note: 'Bulk organic compost', date: '2025-07-05', crop: 'Basmati Rice', fieldId: 'fld-1', unusual: false },
    { id: 't-24', seasonId: 's-5', farmerId: 'f-aryan-1', type: 'expense', category: 'labor', amount: 14000, note: 'Sowing & transplant labor', date: '2025-06-25', crop: 'Basmati Rice', fieldId: 'fld-1', unusual: false },
    { id: 't-25', seasonId: 's-5', farmerId: 'f-aryan-1', type: 'expense', category: 'irrigation', amount: 11000, note: 'Canal water lease charges', date: '2025-08-01', crop: 'Basmati Rice', fieldId: 'fld-1', unusual: false },
    { id: 't-26', seasonId: 's-5', farmerId: 'f-aryan-1', type: 'expense', category: 'equipment', amount: 18500, note: 'Tractor transmission overhaul', date: '2025-08-10', crop: 'Basmati Rice', fieldId: 'fld-1', unusual: true },
    { id: 't-27', seasonId: 's-5', farmerId: 'f-aryan-1', type: 'expense', category: 'pesticides', amount: 6000, note: 'Neem oil insecticide spray', date: '2025-08-14', crop: 'Basmati Rice', fieldId: 'fld-1', unusual: false },
    { id: 't-28', seasonId: 's-5', farmerId: 'f-aryan-1', type: 'income', category: 'crop_sale', amount: 112000, note: 'Export Quality Basmati Harvest Sale', date: '2025-10-15', crop: 'Basmati Rice', unusual: false }
  ],
  budgets: {
    'f-aryan-1_s-5': {
      seeds: 18000,
      fertilizer: 22000,
      labor: 16000,
      irrigation: 12000,
      equipment: 8000,
      pesticides: 7000
    }
  }
};

function getLocalStore() {
  if (typeof window === 'undefined') return DEFAULT_DB;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DB));
      return DEFAULT_DB;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DB;
  }
}

function saveLocalStore(db) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.warn('Failed saving to localStorage:', err);
  }
}

const uid = () => 'id-' + Math.random().toString(36).slice(2, 10);

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || `API request failed with status ${response.status}`);
  }
  return data.data;
}

/* ------------------------------------------------------------------ */
/* Farmers API with Automatic Client Fallback                         */
/* ------------------------------------------------------------------ */
export async function getFarmers() {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/farmers`);
      if (res.ok) {
        const data = await handleResponse(res);
        const db = getLocalStore();
        db.farmers = data;
        saveLocalStore(db);
        return data;
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, using client storage:', e.message);
    }
  }
  return getLocalStore().farmers;
}

export async function createFarmer(farmer) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/farmers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farmer),
      });
      if (res.ok) {
        return await handleResponse(res);
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, saving farmer locally:', e.message);
    }
  }
  const db = getLocalStore();
  const created = {
    ...farmer,
    id: farmer.id || uid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.farmers.push(created);
  saveLocalStore(db);
  return created;
}

export async function updateFarmer(id, patch) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/farmers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        return await handleResponse(res);
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, updating farmer locally:', e.message);
    }
  }
  const db = getLocalStore();
  db.farmers = db.farmers.map((f) => (f.id === id ? { ...f, ...patch, updatedAt: new Date().toISOString() } : f));
  saveLocalStore(db);
  return db.farmers.find((f) => f.id === id);
}

export async function deleteFarmer(id) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/farmers/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return await handleResponse(res);
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, deleting farmer locally:', e.message);
    }
  }
  const db = getLocalStore();
  db.farmers = db.farmers.filter((f) => f.id !== id);
  saveLocalStore(db);
  return { id };
}

/* ------------------------------------------------------------------ */
/* Seasons API with Automatic Client Fallback                         */
/* ------------------------------------------------------------------ */
export async function getSeasons() {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/seasons`);
      if (res.ok) {
        const data = await handleResponse(res);
        const db = getLocalStore();
        db.seasons = data;
        saveLocalStore(db);
        return data;
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, using client seasons:', e.message);
    }
  }
  return getLocalStore().seasons;
}

export async function createSeason(season) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/seasons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(season),
      });
      if (res.ok) {
        return await handleResponse(res);
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, saving season locally:', e.message);
    }
  }
  const db = getLocalStore();
  const created = {
    ...season,
    id: season.id || uid(),
    order: season.order || db.seasons.length + 1
  };
  db.seasons.push(created);
  saveLocalStore(db);
  return created;
}

export async function updateSeason(id, patch) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/seasons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        return await handleResponse(res);
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, updating season locally:', e.message);
    }
  }
  const db = getLocalStore();
  db.seasons = db.seasons.map((s) => (s.id === id ? { ...s, ...patch } : s));
  saveLocalStore(db);
  return db.seasons.find((s) => s.id === id);
}

export async function deleteSeason(id) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/seasons/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return await handleResponse(res);
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, deleting season locally:', e.message);
    }
  }
  const db = getLocalStore();
  db.seasons = db.seasons.filter((s) => s.id !== id);
  saveLocalStore(db);
  return { id };
}

/* ------------------------------------------------------------------ */
/* Transactions API with Automatic Client Fallback                    */
/* ------------------------------------------------------------------ */
export async function getTransactions(params = {}) {
  if (API_BASE_URL) {
    try {
      const query = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/api/transactions${query ? `?${query}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await handleResponse(res);
        const db = getLocalStore();
        db.transactions = data;
        saveLocalStore(db);
        return data;
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, using client transactions:', e.message);
    }
  }
  let list = getLocalStore().transactions;
  if (params.farmerId) list = list.filter((t) => t.farmerId === params.farmerId);
  if (params.seasonId) list = list.filter((t) => t.seasonId === params.seasonId);
  return list;
}

export async function createTransaction(tx) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      });
      if (res.ok) {
        return await handleResponse(res);
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, saving transaction locally:', e.message);
    }
  }
  const db = getLocalStore();
  const created = {
    ...tx,
    id: tx.id || uid(),
    createdAt: new Date().toISOString()
  };
  db.transactions.push(created);
  saveLocalStore(db);
  return created;
}

export async function updateTransaction(id, patch) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        return await handleResponse(res);
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, updating transaction locally:', e.message);
    }
  }
  const db = getLocalStore();
  db.transactions = db.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t));
  saveLocalStore(db);
  return db.transactions.find((t) => t.id === id);
}

export async function deleteTransaction(id) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return await handleResponse(res);
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, deleting transaction locally:', e.message);
    }
  }
  const db = getLocalStore();
  db.transactions = db.transactions.filter((t) => t.id !== id);
  saveLocalStore(db);
  return { id };
}

/* ------------------------------------------------------------------ */
/* Budgets API with Automatic Client Fallback                         */
/* ------------------------------------------------------------------ */
export async function getBudgets(farmerId, seasonId) {
  if (API_BASE_URL) {
    try {
      const params = {};
      if (farmerId) params.farmerId = farmerId;
      if (seasonId) params.seasonId = seasonId;
      const query = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/api/budgets${query ? `?${query}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        return await handleResponse(res);
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, using client budgets:', e.message);
    }
  }
  const db = getLocalStore();
  const key = `${farmerId}_${seasonId}`;
  return db.budgets[key] || db.budgets['f-aryan-1_s-5'] || {};
}

export async function upsertBudget(budgetData) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData),
      });
      if (res.ok) {
        return await handleResponse(res);
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, saving budget locally:', e.message);
    }
  }
  const db = getLocalStore();
  const key = `${budgetData.farmerId}_${budgetData.seasonId}`;
  if (!db.budgets[key]) db.budgets[key] = {};
  db.budgets[key][budgetData.category] = Number(budgetData.amount) || 0;
  saveLocalStore(db);
  return { category: budgetData.category, amount: budgetData.amount };
}

/* ------------------------------------------------------------------ */
/* Fields API with Automatic Client Fallback                          */
/* ------------------------------------------------------------------ */
export async function getFields(params = {}) {
  if (API_BASE_URL) {
    try {
      const query = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/api/fields${query ? `?${query}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await handleResponse(res);
        const db = getLocalStore();
        db.fields = data;
        saveLocalStore(db);
        return data;
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, using client fields:', e.message);
    }
  }
  let list = getLocalStore().fields;
  if (params.farmerId) list = list.filter((f) => f.farmerId === params.farmerId);
  return list;
}

export async function createField(field) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(field),
      });
      if (res.ok) {
        return await handleResponse(res);
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, saving field locally:', e.message);
    }
  }
  const db = getLocalStore();
  const created = {
    ...field,
    id: field.id || uid()
  };
  db.fields.push(created);
  saveLocalStore(db);
  return created;
}

export async function updateField(id, patch) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/fields/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        return await handleResponse(res);
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, updating field locally:', e.message);
    }
  }
  const db = getLocalStore();
  db.fields = db.fields.map((f) => (f.id === id ? { ...f, ...patch } : f));
  saveLocalStore(db);
  return db.fields.find((f) => f.id === id);
}

export async function deleteField(id) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/fields/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return await handleResponse(res);
      }
    } catch (e) {
      console.warn('[API NOTICE] Backend unreachable, deleting field locally:', e.message);
    }
  }
  const db = getLocalStore();
  db.fields = db.fields.filter((f) => f.id !== id);
  saveLocalStore(db);
  return { id };
}
