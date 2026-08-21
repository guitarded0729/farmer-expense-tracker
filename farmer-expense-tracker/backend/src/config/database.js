import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { fsync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load dotenv from backend directory and workspace root
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const { Pool } = pg;

let pool = null;
let isPgConnected = false;

// Prepare database connection pool safely
const rawDbUrl = process.env.DATABASE_URL;
let poolConfig = null;

if (rawDbUrl && typeof rawDbUrl === 'string' && rawDbUrl.trim() !== '') {
  poolConfig = { connectionString: rawDbUrl.trim() };
} else {
  const pgUser = process.env.DB_USER || process.env.PGUSER || 'postgres';
  const pgPass = String(process.env.DB_PASSWORD || process.env.PGPASSWORD || '');
  const pgHost = process.env.DB_HOST || process.env.PGHOST || 'localhost';
  const pgPort = Number(process.env.DB_PORT || process.env.PGPORT || 5432);
  const pgDb = process.env.DB_NAME || process.env.PGDATABASE || 'farmer_expense_tracker';

  poolConfig = {
    user: pgUser,
    password: pgPass,
    host: pgHost,
    port: pgPort,
    database: pgDb,
  };
}

// Attempt PostgreSQL Connection
try {
  pool = new Pool(poolConfig);

  pool.on('error', (err) => {
    console.warn('[DB WARNING] Unexpected PostgreSQL pool error:', err.message);
    isPgConnected = false;
  });

  // Test connection and auto-create tables on boot
  const testClient = await pool.connect();
  console.log('[DB SUCCESS] Successfully connected to PostgreSQL database!');
  isPgConnected = true;

  try {
    const fs = await import('fs');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await testClient.query(schemaSql);
    console.log('[DB SUCCESS] Auto-created database tables (farmers, seasons, transactions, budgets)!');
  } catch (sErr) {
    console.warn('[DB WARNING] Table auto-migration notice:', sErr.message);
  } finally {
    testClient.release();
  }
} catch (err) {
  console.warn('[DB NOTICE] PostgreSQL not connected:', err.message);
  console.warn('[DB NOTICE] Operating in high-availability In-Memory / Fallback mode.');
  isPgConnected = false;
}

/* ------------------------------------------------------------------ */
/* Seed Data for In-Memory Fallback Mode                             */
/* ------------------------------------------------------------------ */
const dbState = {
  farmers: [],
  seasons: [],
  fields: [],
  transactions: [],
  budgets: [],
};

/* Helper for fallback query handling */
const mockQuery = (text, params = []) => {
  const normText = text.replace(/\s+/g, ' ').trim().toUpperCase();

  // FARMERS
  if (normText.startsWith('SELECT * FROM FARMERS ORDER BY')) {
    return { rows: [...dbState.farmers] };
  }
  if (normText.startsWith('SELECT * FROM FARMERS WHERE ID = $1')) {
    const found = dbState.farmers.filter((f) => f.id === params[0]);
    return { rows: found };
  }
  if (normText.startsWith('INSERT INTO FARMERS')) {
    const id = params[0] || `f-${Math.random().toString(36).slice(2, 10)}`;
    let newFarmer;
    if (params.length >= 10) {
      newFarmer = {
        id,
        name: params[1],
        farm_name: params[2],
        role: params[3],
        category: params[4],
        region: params[5],
        scale: params[6],
        phone: params[7],
        email: params[8],
        equity_share: params[9],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      newFarmer = {
        id,
        name: params[0],
        farm_name: params[1],
        role: params[2] || 'Primary Operator',
        category: params[3] || 'General Agriculture',
        region: params[4] || 'Unspecified Region',
        scale: params[5] || 'Standard Farm',
        phone: params[6] || '',
        email: params[7] || '',
        equity_share: params[8] || 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    dbState.farmers.push(newFarmer);
    return { rows: [newFarmer] };
  }
  if (normText.startsWith('UPDATE FARMERS SET')) {
    const id = params[params.length - 1];
    const idx = dbState.farmers.findIndex((f) => f.id === id);
    if (idx !== -1) {
      dbState.farmers[idx] = {
        ...dbState.farmers[idx],
        name: params[0] !== undefined ? params[0] : dbState.farmers[idx].name,
        farm_name: params[1] !== undefined ? params[1] : dbState.farmers[idx].farm_name,
        role: params[2] !== undefined ? params[2] : dbState.farmers[idx].role,
        category: params[3] !== undefined ? params[3] : dbState.farmers[idx].category,
        region: params[4] !== undefined ? params[4] : dbState.farmers[idx].region,
        scale: params[5] !== undefined ? params[5] : dbState.farmers[idx].scale,
        phone: params[6] !== undefined ? params[6] : dbState.farmers[idx].phone,
        email: params[7] !== undefined ? params[7] : dbState.farmers[idx].email,
        equity_share: params[8] !== undefined ? params[8] : dbState.farmers[idx].equity_share,
        updated_at: new Date().toISOString(),
      };
      return { rows: [dbState.farmers[idx]] };
    }
    return { rows: [] };
  }
  if (normText.startsWith('DELETE FROM FARMERS')) {
    const id = params[0];
    const idx = dbState.farmers.findIndex((f) => f.id === id);
    if (idx !== -1) {
      const removed = dbState.farmers.splice(idx, 1);
      return { rows: [{ id: removed[0].id }] };
    }
    return { rows: [] };
  }

  // SEASONS
  if (normText.startsWith('SELECT * FROM SEASONS ORDER BY')) {
    const sorted = [...dbState.seasons].sort((a, b) => a.sort_order - b.sort_order);
    return { rows: sorted };
  }
  if (normText.startsWith('SELECT * FROM SEASONS WHERE ID = $1')) {
    return { rows: dbState.seasons.filter((s) => s.id === params[0]) };
  }
  if (normText.includes('MAX(SORT_ORDER)')) {
    const max = dbState.seasons.reduce((m, s) => Math.max(m, s.sort_order || 0), 0);
    return { rows: [{ next_order: max + 1 }] };
  }
  if (normText.startsWith('INSERT INTO SEASONS')) {
    const newSeason = {
      id: params.length === 3 ? params[0] : `s-${Math.random().toString(36).slice(2, 10)}`,
      name: params.length === 3 ? params[1] : params[0],
      sort_order: params.length === 3 ? params[2] : params[1],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dbState.seasons.push(newSeason);
    return { rows: [newSeason] };
  }
  if (normText.startsWith('UPDATE SEASONS')) {
    const id = params[2];
    const idx = dbState.seasons.findIndex((s) => s.id === id);
    if (idx !== -1) {
      dbState.seasons[idx].name = params[0];
      dbState.seasons[idx].sort_order = params[1];
      dbState.seasons[idx].updated_at = new Date().toISOString();
      return { rows: [dbState.seasons[idx]] };
    }
    return { rows: [] };
  }
  if (normText.startsWith('DELETE FROM SEASONS')) {
    const id = params[0];
    const idx = dbState.seasons.findIndex((s) => s.id === id);
    if (idx !== -1) {
      dbState.seasons.splice(idx, 1);
      return { rows: [{ id }] };
    }
    return { rows: [] };
  }

  // FIELDS
  if (normText.startsWith('SELECT * FROM FIELDS')) {
    if (normText.includes('WHERE ID = $1')) {
      return { rows: dbState.fields.filter((f) => f.id === params[0]) };
    }
    let res = [...dbState.fields];
    let pIdx = 0;
    if (normText.includes('FARMER_ID =')) {
      const fId = params[pIdx++];
      res = res.filter((f) => f.farmer_id === fId);
    }
    if (normText.includes('SEASON_ID =')) {
      const sId = params[pIdx++];
      res = res.filter((f) => f.season_id === sId);
    }
    return { rows: res };
  }
  if (normText.startsWith('INSERT INTO FIELDS')) {
    const id = params.length === 8 ? params[0] : `f-${Math.random().toString(36).slice(2, 10)}`;
    const offset = params.length === 8 ? 1 : 0;
    const newField = {
      id,
      farmer_id: params[offset + 0],
      name: params[offset + 1],
      crop: params[offset + 2],
      area: params[offset + 3] !== null && params[offset + 3] !== undefined ? Number(params[offset + 3]) : null,
      area_unit: params[offset + 4] || 'acres',
      location: params[offset + 5] || '',
      season_id: params[offset + 6] || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dbState.fields.push(newField);
    return { rows: [newField] };
  }
  if (normText.startsWith('UPDATE FIELDS')) {
    const id = params[params.length - 1];
    const idx = dbState.fields.findIndex((f) => f.id === id);
    if (idx !== -1) {
      dbState.fields[idx] = {
        ...dbState.fields[idx],
        name: params[0] !== undefined ? params[0] : dbState.fields[idx].name,
        crop: params[1] !== undefined ? params[1] : dbState.fields[idx].crop,
        area: params[2] !== undefined ? (params[2] !== null ? Number(params[2]) : null) : dbState.fields[idx].area,
        area_unit: params[3] !== undefined ? params[3] : dbState.fields[idx].area_unit,
        location: params[4] !== undefined ? params[4] : dbState.fields[idx].location,
        season_id: params[5] !== undefined ? params[5] : dbState.fields[idx].season_id,
        updated_at: new Date().toISOString(),
      };
      return { rows: [dbState.fields[idx]] };
    }
    return { rows: [] };
  }
  if (normText.startsWith('DELETE FROM FIELDS')) {
    const id = params[0];
    const idx = dbState.fields.findIndex((f) => f.id === id);
    if (idx !== -1) {
      dbState.fields.splice(idx, 1);
      return { rows: [{ id }] };
    }
    return { rows: [] };
  }

  // TRANSACTIONS
  if (normText.startsWith('SELECT * FROM TRANSACTIONS')) {
    if (normText.includes('WHERE ID = $1')) {
      return { rows: dbState.transactions.filter((t) => t.id === params[0]) };
    }
    let res = [...dbState.transactions];
    let pIdx = 0;
    if (normText.includes('FARMER_ID =')) {
      const fId = params[pIdx++];
      res = res.filter((t) => t.farmer_id === fId);
    }
    if (normText.includes('SEASON_ID =')) {
      const sId = params[pIdx++];
      res = res.filter((t) => t.season_id === sId);
    }
    if (normText.includes('TYPE =')) {
      const tp = params[pIdx++];
      res = res.filter((t) => t.type === tp);
    }
    res.sort((a, b) => new Date(b.date) - new Date(a.date));
    return { rows: res };
  }
  if (normText.startsWith('INSERT INTO TRANSACTIONS')) {
    let newTx;
    // Parameter count mapping based on fields
    if (params.length === 15) {
      // With explicit ID + 14 columns
      newTx = {
        id: params[0] || `t-${Math.random().toString(36).slice(2, 10)}`,
        season_id: params[1],
        farmer_id: params[2],
        type: params[3],
        category: params[4],
        amount: Number(params[5]),
        note: params[6] || '',
        date: params[7] || new Date().toISOString().slice(0, 10),
        unusual: Boolean(params[8]),
        split_total: params[9] !== null ? Number(params[9]) : null,
        split_people_count: params[10] !== null ? Number(params[10]) : null,
        split_names: params[11],
        crop: params[12],
        field_id: params[13],
        receipt: params[14],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else if (params.length === 14) {
      // Auto ID + 14 columns
      newTx = {
        id: `t-${Math.random().toString(36).slice(2, 10)}`,
        season_id: params[0],
        farmer_id: params[1],
        type: params[2],
        category: params[3],
        amount: Number(params[4]),
        note: params[5] || '',
        date: params[6] || new Date().toISOString().slice(0, 10),
        unusual: Boolean(params[7]),
        split_total: params[8] !== null ? Number(params[8]) : null,
        split_people_count: params[9] !== null ? Number(params[9]) : null,
        split_names: params[10],
        crop: params[11],
        field_id: params[12],
        receipt: params[13],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else if (params.length >= 12) {
      // Old style explicit ID
      newTx = {
        id: params[0] || `t-${Math.random().toString(36).slice(2, 10)}`,
        season_id: params[1],
        farmer_id: params[2],
        type: params[3],
        category: params[4],
        amount: Number(params[5]),
        note: params[6] || '',
        date: params[7] || new Date().toISOString().slice(0, 10),
        unusual: Boolean(params[8]),
        split_total: params[9] !== null ? Number(params[9]) : null,
        split_people_count: params[10] !== null ? Number(params[10]) : null,
        split_names: params[11],
        crop: null,
        field_id: null,
        receipt: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      // Old style auto ID
      newTx = {
        id: `t-${Math.random().toString(36).slice(2, 10)}`,
        season_id: params[0],
        farmer_id: params[1],
        type: params[2],
        category: params[3],
        amount: Number(params[4]),
        note: params[5] || '',
        date: params[6] || new Date().toISOString().slice(0, 10),
        unusual: Boolean(params[7]),
        split_total: params[8] !== null ? Number(params[8]) : null,
        split_people_count: params[9] !== null ? Number(params[9]) : null,
        split_names: params[10],
        crop: null,
        field_id: null,
        receipt: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    dbState.transactions.push(newTx);
    return { rows: [newTx] };
  }
  if (normText.startsWith('UPDATE TRANSACTIONS')) {
    const id = params[params.length - 1];
    const idx = dbState.transactions.findIndex((t) => t.id === id);
    if (idx !== -1) {
      const cur = dbState.transactions[idx];
      dbState.transactions[idx] = {
        ...cur,
        season_id: params[0] !== undefined ? params[0] : cur.season_id,
        farmer_id: params[1] !== undefined ? params[1] : cur.farmer_id,
        type: params[2] !== undefined ? params[2] : cur.type,
        category: params[3] !== undefined ? params[3] : cur.category,
        amount: params[4] !== undefined ? Number(params[4]) : cur.amount,
        note: params[5] !== undefined ? params[5] : cur.note,
        date: params[6] !== undefined ? params[6] : cur.date,
        unusual: params[7] !== undefined ? Boolean(params[7]) : cur.unusual,
        split_total: params[8] !== undefined ? (params[8] !== null ? Number(params[8]) : null) : cur.split_total,
        split_people_count: params[9] !== undefined ? (params[9] !== null ? Number(params[9]) : null) : cur.split_people_count,
        split_names: params[10] !== undefined ? params[10] : cur.split_names,
        crop: params[11] !== undefined ? params[11] : cur.crop,
        field_id: params[12] !== undefined ? params[12] : cur.field_id,
        receipt: params[13] !== undefined ? params[13] : cur.receipt,
        updated_at: new Date().toISOString(),
      };
      return { rows: [dbState.transactions[idx]] };
    }
    return { rows: [] };
  }
  if (normText.startsWith('DELETE FROM TRANSACTIONS')) {
    const id = params[0];
    const idx = dbState.transactions.findIndex((t) => t.id === id);
    if (idx !== -1) {
      dbState.transactions.splice(idx, 1);
      return { rows: [{ id }] };
    }
    return { rows: [] };
  }

  // BUDGETS
  if (normText.startsWith('SELECT * FROM BUDGETS')) {
    let res = [...dbState.budgets];
    if (params.length === 2) {
      res = res.filter((b) => b.farmer_id === params[0] && b.season_id === params[1]);
    } else if (params.length === 1) {
      res = res.filter((b) => b.farmer_id === params[0]);
    }
    return { rows: res };
  }
  if (normText.includes('INSERT INTO BUDGETS')) {
    // Check if season_id parameter exists
    let farmerId, seasonId, category, amount;
    if (params.length === 4) {
      farmerId = params[0];
      seasonId = params[1];
      category = params[2];
      amount = Number(params[3]);
    } else {
      farmerId = params[0];
      seasonId = null;
      category = params[1];
      amount = Number(params[2]);
    }

    const idx = dbState.budgets.findIndex(
      (b) => b.farmer_id === farmerId && b.season_id === seasonId && b.category === category
    );
    if (idx !== -1) {
      dbState.budgets[idx].amount = amount;
      return { rows: [dbState.budgets[idx]] };
    }
    const newB = {
      id: `b-${Math.random().toString(36).slice(2, 10)}`,
      farmer_id: farmerId,
      season_id: seasonId,
      category,
      amount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dbState.budgets.push(newB);
    return { rows: [newB] };
  }
  if (normText.startsWith('UPDATE BUDGETS')) {
    const amount = Number(params[0]);
    const id = params[1];
    const idx = dbState.budgets.findIndex((b) => b.id === id);
    if (idx !== -1) {
      dbState.budgets[idx].amount = amount;
      return { rows: [dbState.budgets[idx]] };
    }
    return { rows: [] };
  }

  return { rows: [] };
};

/**
 * Main query function. Uses PostgreSQL if connected, otherwise falls back smoothly to in-memory store.
 */
export const query = async (text, params = []) => {
  if (isPgConnected && pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      const connErrorCodes = ['ECONNREFUSED', '57P01', '28P01', '28000', 'ENOTFOUND', '08006', '08001'];
      if (connErrorCodes.includes(err.code) || (err.message && err.message.includes('connection'))) {
        console.warn('[DB WARNING] PostgreSQL connection lost, switching to fallback:', err.message);
        isPgConnected = false;
        return mockQuery(text, params);
      }
      throw err;
    }
  }
  return mockQuery(text, params);
};

export const getClient = async () => {
  if (isPgConnected && pool) {
    try {
      return await pool.connect();
    } catch (err) {
      isPgConnected = false;
    }
  }
  return {
    query: async (text, params) => mockQuery(text, params),
    release: () => {},
  };
};

export const checkPgConnection = () => isPgConnected;

export default pool;
