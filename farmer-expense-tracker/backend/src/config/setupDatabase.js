import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Client } = pg;

async function setup() {
  const dbPassword = process.env.DB_PASSWORD || 'postgres';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = Number(process.env.DB_PORT || 5432);
  const dbName = process.env.DB_NAME || 'farmer_expense_tracker';

  console.log(`[SETUP] Connecting to PostgreSQL server at ${dbHost}:${dbPort} as user "${dbUser}"...`);

  // Connect to default 'postgres' db first to check / create farmer_expense_tracker db
  const adminClient = new Client({
    user: dbUser,
    password: String(dbPassword),
    host: dbHost,
    port: dbPort,
    database: 'postgres',
  });

  try {
    await adminClient.connect();
    console.log('[SETUP] Connected to PostgreSQL instance!');

    const res = await adminClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rows.length === 0) {
      console.log(`[SETUP] Database "${dbName}" does not exist. Creating...`);
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`[SETUP] Database "${dbName}" created successfully!`);
    } else {
      console.log(`[SETUP] Database "${dbName}" already exists.`);
    }
    await adminClient.end();

    // Now connect to target database and execute schema.sql
    const targetClient = new Client({
      user: dbUser,
      password: String(dbPassword),
      host: dbHost,
      port: dbPort,
      database: dbName,
    });

    await targetClient.connect();
    console.log(`[SETUP] Running schema migrations on "${dbName}"...`);
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await targetClient.query(schemaSql);
    console.log('[SETUP] Tables and triggers created successfully!');
    await targetClient.end();

    console.log('\n✅ PostgreSQL Database setup complete!');
  } catch (err) {
    console.error('\n❌ PostgreSQL Setup Failed:', err.message);
    console.log('\nMake sure to update backend/.env with your correct PostgreSQL password.');
    process.exit(1);
  }
}

setup();
