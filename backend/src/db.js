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
  const courtCount = db.prepare('SELECT COUNT(*) as c FROM courts').get().c;
  const caseCount = db.prepare('SELECT COUNT(*) as c FROM cases').get().c;
  // If we have courts but old/few cases, wipe and reseed
  if (courtCount > 0 && caseCount < 20) {
    console.log('🔄 Reseeding — old data found, refreshing with full case set');
    db.exec('DELETE FROM documents; DELETE FROM hearings; DELETE FROM cases; DELETE FROM audit_log; DELETE FROM users; DELETE FROM courts;');
  } else if (courtCount > 0) {
    return;
  }

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

  // Seed sample cases — 28 realistic cases across all 14 parishes
  const cases = [
    // Kingston — Supreme Court (court_id 1)
    { court_id: 1, case_number: 'CL-2024-001', case_type: 'Civil', title: 'Brown v. Caribbean Holdings Ltd', plaintiff: 'Marcus Brown', plaintiff_lawyer: 'Thompson & Associates', defendant: 'Caribbean Holdings Ltd', defendant_lawyer: 'Clarke Legal Group', presiding_judge: 'Hon. Justice Williams', status: 'active', filed_date: '2024-03-15', next_hearing_date: '2026-07-10', priority: 'normal' },
    { court_id: 1, case_number: 'CL-2024-002', case_type: 'Commercial', title: 'NCB Jamaica Ltd v. Tropical Properties Ltd', plaintiff: 'NCB Jamaica Ltd', plaintiff_lawyer: 'Myers Fletcher & Gordon', defendant: 'Tropical Properties Ltd', defendant_lawyer: 'DunnCox', presiding_judge: 'Hon. Justice Campbell', status: 'active', filed_date: '2024-05-20', next_hearing_date: '2026-07-15', priority: 'high' },
    { court_id: 1, case_number: 'CL-2025-003', case_type: 'Constitutional', title: 'Morgan v. Attorney General of Jamaica', plaintiff: 'Delroy Morgan', plaintiff_lawyer: 'Nunes Scholefield & DeLeon', defendant: 'Attorney General of Jamaica', defendant_lawyer: 'Office of the Director of State Proceedings', presiding_judge: 'Hon. Justice Barrett', status: 'active', filed_date: '2025-01-08', next_hearing_date: '2026-08-05', priority: 'urgent' },
    { court_id: 1, case_number: 'CL-2025-004', case_type: 'Probate', title: 'In the Matter of the Estate of Gloria Reid (Deceased)', plaintiff: 'Winston Reid', plaintiff_lawyer: 'Hart Muirhead Fatta', defendant: 'Nadine Reid-Campbell', defendant_lawyer: 'Livingston Alexander & Levy', presiding_judge: 'Hon. Justice Thompson', status: 'active', filed_date: '2025-04-12', next_hearing_date: '2026-07-22', priority: 'normal' },
    { court_id: 1, case_number: 'CL-2023-005', case_type: 'Civil', title: 'Digicel Jamaica Ltd v. Flow Jamaica Ltd', plaintiff: 'Digicel Jamaica Ltd', plaintiff_lawyer: 'Rattray Patterson Rattray', defendant: 'Flow Jamaica Ltd', defendant_lawyer: 'Samuda & Johnson', presiding_judge: 'Hon. Justice Williams', status: 'adjourned', filed_date: '2023-09-01', next_hearing_date: '2026-09-10', priority: 'high' },
    // Kingston — Parish Court (court_id 2)
    { court_id: 2, case_number: 'PC-KGN-2025-001', case_type: 'Criminal', title: 'R v. Johnson (Illegal Possession of Firearm)', plaintiff: 'The Crown', plaintiff_lawyer: 'Director of Public Prosecutions', defendant: 'Devon Johnson', defendant_lawyer: 'Legal Aid Council', presiding_judge: 'Hon. Justice Reid', status: 'active', filed_date: '2025-01-10', next_hearing_date: '2026-07-08', priority: 'urgent' },
    { court_id: 2, case_number: 'PC-KGN-2025-002', case_type: 'Family', title: 'Clarke v. Clarke (Divorce & Ancillary Relief)', plaintiff: 'Sharon Clarke', plaintiff_lawyer: 'Livingston Alexander & Levy', defendant: 'Michael Clarke', defendant_lawyer: 'Nunes Scholefield', presiding_judge: 'Hon. Justice Brown', status: 'active', filed_date: '2025-03-22', next_hearing_date: '2026-07-20', priority: 'normal' },
    { court_id: 2, case_number: 'PC-KGN-2025-003', case_type: 'Criminal', title: 'R v. Campbell (Assault Occasioning Bodily Harm)', plaintiff: 'The Crown', plaintiff_lawyer: 'Office of the DPP', defendant: 'Rohan Campbell', defendant_lawyer: 'Self-represented', presiding_judge: 'Hon. Justice Morris', status: 'pending', filed_date: '2025-06-15', next_hearing_date: '2026-07-03', priority: 'normal' },
    // Corporate Area (court_id 3)
    { court_id: 3, case_number: 'RM-KGN-2025-001', case_type: 'Traffic', title: 'R v. Williams (Dangerous Driving)', plaintiff: 'The Crown', plaintiff_lawyer: 'Office of the DPP', defendant: 'Carlton Williams', defendant_lawyer: 'Self-represented', presiding_judge: 'Hon. Justice Morris', status: 'pending', filed_date: '2025-06-01', next_hearing_date: '2026-07-05', priority: 'low' },
    { court_id: 3, case_number: 'RM-KGN-2025-002', case_type: 'Civil', title: 'Davis v. National Insurance Fund', plaintiff: 'Errol Davis', plaintiff_lawyer: 'Thompson & Associates', defendant: 'National Insurance Fund', defendant_lawyer: 'Crown Counsel', presiding_judge: 'Hon. Justice Reid', status: 'active', filed_date: '2025-02-28', next_hearing_date: '2026-07-18', priority: 'normal' },
    // St. Catherine (court_id 6)
    { court_id: 6, case_number: 'PC-STC-2025-001', case_type: 'Land', title: 'Senior Family Trust v. Reid Holdings Ltd', plaintiff: 'Senior Family Trust', plaintiff_lawyer: 'Rattray Patterson Rattray', defendant: 'Reid Holdings Ltd', defendant_lawyer: 'Hart Muirhead Fatta', presiding_judge: 'Hon. Justice Thompson', status: 'active', filed_date: '2025-02-14', next_hearing_date: '2026-07-12', priority: 'high' },
    { court_id: 6, case_number: 'PC-STC-2025-002', case_type: 'Criminal', title: 'R v. Brown (Robbery with Aggravation)', plaintiff: 'The Crown', plaintiff_lawyer: 'Office of the DPP', defendant: 'Fitzroy Brown', defendant_lawyer: 'Legal Aid Council', presiding_judge: 'Hon. Justice Clarke', status: 'active', filed_date: '2025-04-05', next_hearing_date: '2026-07-09', priority: 'urgent' },
    // St. James (court_id 8)
    { court_id: 8, case_number: 'PC-STJ-2025-001', case_type: 'Civil', title: 'Montego Bay Tourism Board v. Paradise Resorts Ltd', plaintiff: 'Montego Bay Tourism Board', plaintiff_lawyer: 'Myers Fletcher & Gordon', defendant: 'Paradise Resorts Ltd', defendant_lawyer: 'DunnCox', presiding_judge: 'Hon. Justice Green', status: 'active', filed_date: '2025-01-20', next_hearing_date: '2026-07-25', priority: 'normal' },
    { court_id: 8, case_number: 'PC-STJ-2025-002', case_type: 'Criminal', title: 'R v. Thompson (Drug Trafficking)', plaintiff: 'The Crown', plaintiff_lawyer: 'Office of the DPP', defendant: 'Andre Thompson', defendant_lawyer: 'Legal Aid Council', presiding_judge: 'Hon. Justice White', status: 'active', filed_date: '2025-05-10', next_hearing_date: '2026-07-14', priority: 'high' },
    { court_id: 8, case_number: 'PC-STJ-2024-003', case_type: 'Family', title: 'Henry v. Henry (Maintenance Order)', plaintiff: 'Tracey Henry', plaintiff_lawyer: 'Livingston Alexander & Levy', defendant: 'Paul Henry', defendant_lawyer: 'Self-represented', presiding_judge: 'Hon. Justice Green', status: 'closed', filed_date: '2024-08-15', next_hearing_date: null, priority: 'normal', verdict: 'Maintenance order granted — J$25,000/month', verdict_date: '2026-03-10' },
    // Manchester (court_id 10)
    { court_id: 10, case_number: 'PC-MAN-2025-001', case_type: 'Civil', title: 'Mandeville Commercial Centre Ltd v. Brown Brothers Ltd', plaintiff: 'Mandeville Commercial Centre Ltd', plaintiff_lawyer: 'Samuda & Johnson', defendant: 'Brown Brothers Ltd', defendant_lawyer: 'Clarke Legal Group', presiding_judge: 'Hon. Justice Harris', status: 'active', filed_date: '2025-03-01', next_hearing_date: '2026-07-16', priority: 'normal' },
    { court_id: 10, case_number: 'PC-MAN-2025-002', case_type: 'Labour', title: 'Williams v. Bauxite Jamaica Ltd (Wrongful Dismissal)', plaintiff: 'Kemar Williams', plaintiff_lawyer: 'Thompson & Associates', defendant: 'Bauxite Jamaica Ltd', defendant_lawyer: 'Hart Muirhead Fatta', presiding_judge: 'Hon. Justice Harris', status: 'active', filed_date: '2025-02-18', next_hearing_date: '2026-07-23', priority: 'normal' },
    // St. Elizabeth (court_id 11)
    { court_id: 11, case_number: 'PC-ELI-2025-001', case_type: 'Land', title: 'Gordon v. Black River Development Corp', plaintiff: 'Trevor Gordon', plaintiff_lawyer: 'Rattray Patterson Rattray', defendant: 'Black River Development Corp', defendant_lawyer: 'DunnCox', presiding_judge: 'Hon. Justice Campbell', status: 'active', filed_date: '2025-01-30', next_hearing_date: '2026-07-17', priority: 'high' },
    { court_id: 11, case_number: 'PC-ELI-2025-002', case_type: 'Criminal', title: 'R v. Reid (Unlawful Wounding)', plaintiff: 'The Crown', plaintiff_lawyer: 'Office of the DPP', defendant: 'Garfield Reid', defendant_lawyer: 'Legal Aid Council', presiding_judge: 'Hon. Justice Brown', status: 'pending', filed_date: '2025-05-20', next_hearing_date: '2026-07-07', priority: 'normal' },
    // Clarendon (court_id 12)
    { court_id: 12, case_number: 'PC-CLA-2025-001', case_type: 'Civil', title: 'May Pen Farmers Cooperative v. Agri-Jamaica Ltd', plaintiff: 'May Pen Farmers Cooperative', plaintiff_lawyer: 'Myers Fletcher & Gordon', defendant: 'Agri-Jamaica Ltd', defendant_lawyer: 'Nunes Scholefield', presiding_judge: 'Hon. Justice Morgan', status: 'active', filed_date: '2025-02-10', next_hearing_date: '2026-07-19', priority: 'normal' },
    // St. Ann (court_id 13)
    { court_id: 13, case_number: 'PC-ANN-2025-001', case_type: 'Criminal', title: 'R v. Scott (Breaking & Entering)', plaintiff: 'The Crown', plaintiff_lawyer: 'Office of the DPP', defendant: 'Damion Scott', defendant_lawyer: 'Legal Aid Council', presiding_judge: 'Hon. Justice Palmer', status: 'active', filed_date: '2025-04-22', next_hearing_date: '2026-07-11', priority: 'normal' },
    { court_id: 13, case_number: 'PC-ANN-2025-002', case_type: 'Family', title: 'Taylor v. Taylor (Custody of Minor Children)', plaintiff: 'Christine Taylor', plaintiff_lawyer: 'Livingston Alexander & Levy', defendant: 'David Taylor', defendant_lawyer: 'Clarke Legal Group', presiding_judge: 'Hon. Justice Palmer', status: 'active', filed_date: '2025-03-14', next_hearing_date: '2026-07-24', priority: 'high' },
    // Trelawny (court_id 14)
    { court_id: 14, case_number: 'PC-TRE-2025-001', case_type: 'Land', title: 'Falmouth Heritage Trust v. Private Developer Ltd', plaintiff: 'Falmouth Heritage Trust', plaintiff_lawyer: 'Hart Muirhead Fatta', defendant: 'Private Developer Ltd', defendant_lawyer: 'Samuda & Johnson', presiding_judge: 'Hon. Justice Clarke', status: 'active', filed_date: '2025-01-25', next_hearing_date: '2026-08-01', priority: 'high' },
    // Portland (court_id 15)
    { court_id: 15, case_number: 'PC-POR-2025-001', case_type: 'Civil', title: 'Hamilton v. Portland Parish Council', plaintiff: 'Tricia Hamilton', plaintiff_lawyer: 'Thompson & Associates', defendant: 'Portland Parish Council', defendant_lawyer: 'Crown Counsel', presiding_judge: 'Hon. Justice Bennett', status: 'active', filed_date: '2025-02-05', next_hearing_date: '2026-07-28', priority: 'normal' },
    // St. Mary (court_id 16)
    { court_id: 16, case_number: 'PC-MAR-2025-001', case_type: 'Criminal', title: 'R v. Bennett (Fraud & Forgery)', plaintiff: 'The Crown', plaintiff_lawyer: 'Office of the DPP', defendant: 'Carlton Bennett', defendant_lawyer: 'Legal Aid Council', presiding_judge: 'Hon. Justice Grant', status: 'active', filed_date: '2025-03-08', next_hearing_date: '2026-07-13', priority: 'high' },
    // St. Thomas (court_id 17)
    { court_id: 17, case_number: 'PC-THO-2025-001', case_type: 'Civil', title: 'Jackson v. Eastern Bus Services Ltd (Personal Injury)', plaintiff: 'Marcia Jackson', plaintiff_lawyer: 'Nunes Scholefield', defendant: 'Eastern Bus Services Ltd', defendant_lawyer: 'Myers Fletcher & Gordon', presiding_judge: 'Hon. Justice James', status: 'active', filed_date: '2025-01-15', next_hearing_date: '2026-07-21', priority: 'normal' },
    // Westmoreland (court_id 18)
    { court_id: 18, case_number: 'PC-WES-2025-001', case_type: 'Land', title: 'Western Farmers Alliance v. Sugar Industry Authority', plaintiff: 'Western Farmers Alliance', plaintiff_lawyer: 'Rattray Patterson Rattray', defendant: 'Sugar Industry Authority', defendant_lawyer: 'Crown Counsel', presiding_judge: 'Hon. Justice Nelson', status: 'active', filed_date: '2025-02-20', next_hearing_date: '2026-07-26', priority: 'high' },
    // Hanover (court_id 19)
    { court_id: 19, case_number: 'PC-HAN-2025-001', case_type: 'Family', title: 'Gordon v. Gordon (Domestic Violence Protection Order)', plaintiff: 'Yvette Gordon', plaintiff_lawyer: 'Legal Aid Council', defendant: 'Carl Gordon', defendant_lawyer: 'Self-represented', presiding_judge: 'Hon. Justice Stewart', status: 'active', filed_date: '2025-05-30', next_hearing_date: '2026-07-02', priority: 'urgent' },
  ];

  const insertCase = db.prepare(`INSERT INTO cases (court_id, case_number, case_type, title, plaintiff, plaintiff_lawyer, defendant, defendant_lawyer, presiding_judge, status, filed_date, next_hearing_date, priority, verdict, verdict_date) VALUES (@court_id, @case_number, @case_type, @title, @plaintiff, @plaintiff_lawyer, @defendant, @defendant_lawyer, @presiding_judge, @status, @filed_date, @next_hearing_date, @priority, @verdict, @verdict_date)`);
  cases.forEach(c => insertCase.run({ verdict: null, verdict_date: null, ...c }));

  // Seed hearings
  const hearings = [
    { case_id: 1, court_id: 1, hearing_date: '2026-05-15', hearing_time: '10:00', courtroom: 'Courtroom 3', judge: 'Hon. Justice Williams', type: 'Mention', status: 'completed', outcome: 'Adjourned to July 10' },
    { case_id: 1, court_id: 1, hearing_date: '2026-07-10', hearing_time: '10:00', courtroom: 'Courtroom 3', judge: 'Hon. Justice Williams', type: 'Trial', status: 'scheduled', outcome: null },
    { case_id: 2, court_id: 1, hearing_date: '2026-07-15', hearing_time: '09:30', courtroom: 'Courtroom 2', judge: 'Hon. Justice Campbell', type: 'Case Management', status: 'scheduled', outcome: null },
    { case_id: 3, court_id: 1, hearing_date: '2026-08-05', hearing_time: '10:00', courtroom: 'Courtroom 1', judge: 'Hon. Justice Barrett', type: 'Mention', status: 'scheduled', outcome: null },
    { case_id: 6, court_id: 2, hearing_date: '2026-07-08', hearing_time: '09:00', courtroom: 'Courtroom 1', judge: 'Hon. Justice Reid', type: 'Plea', status: 'scheduled', outcome: null },
    { case_id: 7, court_id: 2, hearing_date: '2026-07-20', hearing_time: '11:00', courtroom: 'Courtroom 2', judge: 'Hon. Justice Brown', type: 'Mention', status: 'scheduled', outcome: null },
    { case_id: 12, court_id: 6, hearing_date: '2026-07-09', hearing_time: '09:00', courtroom: 'Courtroom 1', judge: 'Hon. Justice Clarke', type: 'Trial', status: 'scheduled', outcome: null },
    { case_id: 13, court_id: 8, hearing_date: '2026-07-25', hearing_time: '10:00', courtroom: 'Courtroom 2', judge: 'Hon. Justice Green', type: 'Mention', status: 'scheduled', outcome: null },
    { case_id: 28, court_id: 19, hearing_date: '2026-07-02', hearing_time: '09:00', courtroom: 'Courtroom 1', judge: 'Hon. Justice Stewart', type: 'Urgent Hearing', status: 'scheduled', outcome: null },
  ];
  const insertHearing = db.prepare(`INSERT INTO hearings (case_id, court_id, hearing_date, hearing_time, courtroom, judge, type, status, outcome) VALUES (@case_id, @court_id, @hearing_date, @hearing_time, @courtroom, @judge, @type, @status, @outcome)`);
  hearings.forEach(h => insertHearing.run(h));

  // Seed documents
  const docs = [
    { case_id: 1, court_id: 1, title: 'Claim Form', doc_type: 'Pleading', filed_by: 'Thompson & Associates', status: 'accepted' },
    { case_id: 1, court_id: 1, title: 'Particulars of Claim', doc_type: 'Pleading', filed_by: 'Thompson & Associates', status: 'accepted' },
    { case_id: 1, court_id: 1, title: 'Defence', doc_type: 'Pleading', filed_by: 'Clarke Legal Group', status: 'accepted' },
    { case_id: 2, court_id: 1, title: 'Fixed Date Claim Form', doc_type: 'Application', filed_by: 'Myers Fletcher & Gordon', status: 'received' },
    { case_id: 2, court_id: 1, title: 'Affidavit in Support', doc_type: 'Affidavit', filed_by: 'Myers Fletcher & Gordon', status: 'accepted' },
    { case_id: 6, court_id: 2, title: 'Indictment', doc_type: 'Notice', filed_by: 'Office of the DPP', status: 'accepted' },
    { case_id: 7, court_id: 2, title: 'Divorce Petition', doc_type: 'Pleading', filed_by: 'Livingston Alexander & Levy', status: 'accepted' },
    { case_id: 11, court_id: 6, title: 'Statement of Case', doc_type: 'Pleading', filed_by: 'Rattray Patterson Rattray', status: 'accepted' },
    { case_id: 13, court_id: 8, title: 'Witness Statement', doc_type: 'Evidence', filed_by: 'Myers Fletcher & Gordon', status: 'received' },
  ];
  const insertDoc = db.prepare(`INSERT INTO documents (case_id, court_id, title, doc_type, filed_by, status) VALUES (@case_id, @court_id, @title, @doc_type, @filed_by, @status)`);
  docs.forEach(d => insertDoc.run(d));

  console.log('✅ CourtJM seeded — 19 courts, 28 cases across all 14 parishes, hearings & documents');
}

module.exports = { db, initDb };
