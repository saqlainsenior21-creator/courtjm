const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/courtjm.db');
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS courts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      parish TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      judge_count INTEGER DEFAULT 1,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      court_id INTEGER,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('moj_admin','registrar','judge','clerk','lawyer','public')),
      bar_number TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(court_id) REFERENCES courts(id)
    );

    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      court_id INTEGER NOT NULL,
      case_number TEXT UNIQUE NOT NULL,
      case_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      plaintiff TEXT NOT NULL,
      plaintiff_lawyer TEXT,
      defendant TEXT NOT NULL,
      defendant_lawyer TEXT,
      presiding_judge TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','adjourned','closed','dismissed','pending')),
      filed_date TEXT DEFAULT (date('now')),
      next_hearing_date TEXT,
      verdict TEXT,
      verdict_date TEXT,
      priority TEXT DEFAULT 'normal' CHECK(priority IN ('urgent','high','normal','low')),
      created_by INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(court_id) REFERENCES courts(id)
    );

    CREATE TABLE IF NOT EXISTS hearings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      court_id INTEGER NOT NULL,
      hearing_date TEXT NOT NULL,
      hearing_time TEXT NOT NULL,
      courtroom TEXT,
      judge TEXT,
      type TEXT DEFAULT 'Hearing',
      status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled','completed','adjourned','cancelled')),
      outcome TEXT,
      next_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(case_id) REFERENCES cases(id),
      FOREIGN KEY(court_id) REFERENCES courts(id)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      court_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      doc_type TEXT NOT NULL,
      filed_by TEXT,
      filed_by_user_id INTEGER,
      file_size TEXT,
      status TEXT DEFAULT 'received' CHECK(status IN ('received','reviewed','accepted','rejected')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(case_id) REFERENCES cases(id)
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity TEXT,
      entity_id INTEGER,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  seedData();
}

function seedData() {
  const count = db.prepare('SELECT COUNT(*) as c FROM courts').get().c;
  if (count > 0) return;

  const courts = [
    // Kingston & St. Andrew
    { name: 'Supreme Court of Jamaica', type: 'Supreme Court', parish: 'Kingston', address: '134 Tower Street, Kingston', phone: '876-922-8300' },
    { name: 'Kingston & St. Andrew Parish Court', type: 'Parish Court', parish: 'Kingston', address: 'Half Way Tree Road, Kingston 10', phone: '876-926-8700' },
    { name: 'Corporate Area Resident Magistrate Court', type: "Resident Magistrate's Court", parish: 'Kingston', address: 'King Street, Kingston', phone: '876-922-8320' },
    { name: 'Commercial Division - Supreme Court', type: 'Supreme Court', parish: 'Kingston', address: '134 Tower Street, Kingston', phone: '876-922-8300' },
    { name: 'Court of Appeal', type: 'Court of Appeal', parish: 'Kingston', address: 'King Street, Kingston', phone: '876-922-8410' },
    // St. Catherine
    { name: 'St. Catherine Parish Court', type: 'Parish Court', parish: 'St. Catherine', address: 'Spanish Town', phone: '876-984-2237' },
    { name: 'Portmore Resident Magistrate Court', type: "Resident Magistrate's Court", parish: 'St. Catherine', address: 'Portmore', phone: '876-939-7800' },
    // St. James
    { name: 'St. James Parish Court', type: 'Parish Court', parish: 'St. James', address: 'Montego Bay', phone: '876-952-2540' },
    { name: 'St. James Resident Magistrate Court', type: "Resident Magistrate's Court", parish: 'St. James', address: 'Montego Bay', phone: '876-952-2541' },
    // Manchester
    { name: 'Manchester Parish Court', type: 'Parish Court', parish: 'Manchester', address: 'Mandeville', phone: '876-962-2210' },
    // St. Elizabeth
    { name: 'St. Elizabeth Parish Court', type: 'Parish Court', parish: 'St. Elizabeth', address: 'Black River', phone: '876-965-2201' },
    // Clarendon
    { name: 'Clarendon Parish Court', type: 'Parish Court', parish: 'Clarendon', address: 'May Pen', phone: '876-986-2226' },
    // St. Ann
    { name: "St. Ann's Bay Parish Court", type: 'Parish Court', parish: 'St. Ann', address: "St. Ann's Bay", phone: '876-972-2210' },
    // Trelawny
    { name: 'Trelawny Parish Court', type: 'Parish Court', parish: 'Trelawny', address: 'Falmouth', phone: '876-954-3222' },
    // Portland
    { name: 'Portland Parish Court', type: 'Parish Court', parish: 'Portland', address: 'Port Antonio', phone: '876-993-2605' },
    // St. Mary
    { name: 'St. Mary Parish Court', type: 'Parish Court', parish: 'St. Mary', address: 'Port Maria', phone: '876-994-2201' },
    // St. Thomas
    { name: 'St. Thomas Parish Court', type: 'Parish Court', parish: 'St. Thomas', address: 'Morant Bay', phone: '876-982-2218' },
    // Westmoreland
    { name: 'Westmoreland Parish Court', type: 'Parish Court', parish: 'Westmoreland', address: 'Savanna-la-Mar', phone: '876-955-2202' },
    // Hanover
    { name: 'Hanover Parish Court', type: 'Parish Court', parish: 'Hanover', address: 'Lucea', phone: '876-956-2203' },
  ];

  const insertCourt = db.prepare(`INSERT INTO courts (name, type, parish, address, phone) VALUES (@name, @type, @parish, @address, @phone)`);
  courts.forEach(c => insertCourt.run(c));

  // Seed users
  const adminHash = bcrypt.hashSync('Justice#2026@', 10);
  db.prepare(`INSERT INTO users (court_id, name, email, password, role) VALUES (NULL, 'MOJ Administrator', 'admin@moj.gov.jm', ?, 'moj_admin')`).run(adminHash);
  const demoHash = bcrypt.hashSync('Demo2026!', 10);
  db.prepare(`INSERT INTO users (court_id, name, email, password, role, bar_number) VALUES (1, 'Demo Registrar', 'demo@courtjm.com', ?, 'registrar', 'BAR-2026-001')`).run(demoHash);

  // Seed sample cases
  const cases = [
    { court_id: 1, case_number: 'CL-2024-001', case_type: 'Civil', title: 'Brown v. Caribbean Holdings Ltd', plaintiff: 'Marcus Brown', plaintiff_lawyer: 'Thompson & Associates', defendant: 'Caribbean Holdings Ltd', defendant_lawyer: 'Clarke Legal Group', presiding_judge: 'Hon. Justice Williams', status: 'active', filed_date: '2024-03-15', next_hearing_date: '2026-07-10', priority: 'normal' },
    { court_id: 1, case_number: 'CL-2024-002', case_type: 'Commercial', title: 'NCB Jamaica Ltd v. Tropical Properties', plaintiff: 'NCB Jamaica Ltd', plaintiff_lawyer: 'Myers Fletcher & Gordon', defendant: 'Tropical Properties Ltd', defendant_lawyer: 'DunnCox', presiding_judge: 'Hon. Justice Campbell', status: 'active', filed_date: '2024-05-20', next_hearing_date: '2026-07-15', priority: 'high' },
    { court_id: 2, case_number: 'PC-2025-001', case_type: 'Criminal', title: 'R v. Johnson', plaintiff: 'The Crown', plaintiff_lawyer: 'Director of Public Prosecutions', defendant: 'Devon Johnson', defendant_lawyer: 'Legal Aid Council', presiding_judge: 'Hon. Justice Reid', status: 'active', filed_date: '2025-01-10', next_hearing_date: '2026-07-08', priority: 'urgent' },
    { court_id: 2, case_number: 'PC-2025-002', case_type: 'Family', title: 'Clarke v. Clarke (Divorce)', plaintiff: 'Sharon Clarke', plaintiff_lawyer: 'Livingston Alexander & Levy', defendant: 'Michael Clarke', defendant_lawyer: 'Nunes Scholefield', presiding_judge: 'Hon. Justice Brown', status: 'active', filed_date: '2025-03-22', next_hearing_date: '2026-07-20', priority: 'normal' },
    { court_id: 6, case_number: 'STC-2025-001', case_type: 'Traffic', title: 'R v. Williams (Traffic Offence)', plaintiff: 'The Crown', plaintiff_lawyer: 'Office of the DPP', defendant: 'Carlton Williams', defendant_lawyer: 'Self-represented', presiding_judge: 'Hon. Justice Morris', status: 'pending', filed_date: '2025-06-01', next_hearing_date: '2026-07-05', priority: 'low' },
    { court_id: 11, case_number: 'ELC-2025-001', case_type: 'Land', title: 'Senior Family v. Reid (Land Dispute)', plaintiff: 'Senior Family Trust', plaintiff_lawyer: 'Rattray Patterson Rattray', defendant: 'Reid Holdings', defendant_lawyer: 'Hart Muirhead Fatta', presiding_judge: 'Hon. Justice Thompson', status: 'active', filed_date: '2025-02-14', next_hearing_date: '2026-07-12', priority: 'high' },
  ];

  const insertCase = db.prepare(`INSERT INTO cases (court_id, case_number, case_type, title, plaintiff, plaintiff_lawyer, defendant, defendant_lawyer, presiding_judge, status, filed_date, next_hearing_date, priority) VALUES (@court_id, @case_number, @case_type, @title, @plaintiff, @plaintiff_lawyer, @defendant, @defendant_lawyer, @presiding_judge, @status, @filed_date, @next_hearing_date, @priority)`);
  cases.forEach(c => insertCase.run(c));

  // Seed hearings
  db.prepare(`INSERT INTO hearings (case_id, court_id, hearing_date, hearing_time, courtroom, judge, type, status, outcome) VALUES (1, 1, '2026-05-15', '10:00', 'Courtroom 3', 'Hon. Justice Williams', 'Mention', 'completed', 'Adjourned to July 10')`).run();
  db.prepare(`INSERT INTO hearings (case_id, court_id, hearing_date, hearing_time, courtroom, judge, type, status) VALUES (1, 1, '2026-07-10', '10:00', 'Courtroom 3', 'Hon. Justice Williams', 'Trial', 'scheduled')`).run();
  db.prepare(`INSERT INTO hearings (case_id, court_id, hearing_date, hearing_time, courtroom, judge, type, status) VALUES (3, 2, '2026-07-08', '09:00', 'Courtroom 1', 'Hon. Justice Reid', 'Plea', 'scheduled')`).run();

  // Seed documents
  db.prepare(`INSERT INTO documents (case_id, court_id, title, doc_type, filed_by, status) VALUES (1, 1, 'Claim Form', 'Pleading', 'Thompson & Associates', 'accepted')`).run();
  db.prepare(`INSERT INTO documents (case_id, court_id, title, doc_type, filed_by, status) VALUES (1, 1, 'Defence', 'Pleading', 'Clarke Legal Group', 'accepted')`).run();
  db.prepare(`INSERT INTO documents (case_id, court_id, title, doc_type, filed_by, status) VALUES (2, 1, 'Fixed Date Claim Form', 'Application', 'Myers Fletcher & Gordon', 'received')`).run();

  console.log('✅ CourtJM seeded — 19 courts, 6 cases, hearings & documents');
}

module.exports = { db, initDb };
