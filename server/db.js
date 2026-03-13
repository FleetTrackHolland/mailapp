import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, 'fleettrack.db');
const db = new Database(dbPath);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT,
    company TEXT,
    sector TEXT,
    location TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    source TEXT,
    status TEXT DEFAULT 'new',
    notes TEXT,
    vehicles INTEGER DEFAULT 0,
    followUp1Date TEXT,
    followUp2Date TEXT,
    nextAction TEXT,
    unsubscribed INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    icebreaker TEXT,
    createdAt TEXT,
    updatedAt TEXT,
    lastContact TEXT
  );

  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    leadId TEXT,
    type TEXT,
    text TEXT,
    date TEXT,
    FOREIGN KEY(leadId) REFERENCES leads(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    leadId TEXT,
    text TEXT,
    date TEXT,
    completed INTEGER DEFAULT 0,
    notified30m INTEGER DEFAULT 0,
    notifiedNow INTEGER DEFAULT 0,
    FOREIGN KEY(leadId) REFERENCES leads(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT,
    subject TEXT,
    status TEXT,
    sentCount TEXT,
    deliveredCount TEXT,
    bouncedCount TEXT,
    openRate REAL,
    clickRate REAL,
    date TEXT,
    content TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    orderId TEXT,
    planName TEXT,
    price REAL,
    vatAmount REAL,
    totalIncVat REAL,
    status TEXT,
    customerEmail TEXT,
    customerName TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    customerId TEXT PRIMARY KEY,
    plan TEXT,
    activeSince TEXT,
    nextBillingDate TEXT,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Migration: Add location column to leads if it doesn't exist
try {
  db.exec("ALTER TABLE leads ADD COLUMN location TEXT;");
  console.log('✅ Migration: Added location column to leads table');
} catch (e) {}

try {
  db.exec("ALTER TABLE leads ADD COLUMN score INTEGER DEFAULT 0;");
  db.exec("ALTER TABLE leads ADD COLUMN icebreaker TEXT;");
  console.log('✅ Migration: Added AI Insight columns to leads table');
} catch (e) {}

// Initialize default config if empty
const configCheck = db.prepare("SELECT COUNT(*) as count FROM config").get();
if (configCheck.count === 0) {
  const defaultConfig = {
    companyName: 'FleetTrack Logistics',
    website: 'www.fleettrack.nl',
    email: 'info@fleettrack.nl',
    phone: '+31 20 123 4567',
    address: 'Strawinskylaan 123, Amsterdam',
    vat: 'NL123456789B01',
    kvk: '12345678',
    logoUrl: '',
    primaryColor: '#007AFF'
  };
  const insertConfig = db.prepare("INSERT INTO config (key, value) VALUES (?, ?)");
  for (const [key, value] of Object.entries(defaultConfig)) {
    insertConfig.run(key, typeof value === 'string' ? value : JSON.stringify(value));
  }
}

console.log('✅ SQLite Database & Schema Ready');

export default db;
