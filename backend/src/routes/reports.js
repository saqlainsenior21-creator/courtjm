const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticate } = require('../auth');

function toCSV(rows, fields) {
  const header = fields.join(',');
  const lines = rows.map(r => fields.map(f => {
    const v = r[f] ?? '';
    return typeof v === 'string' && (v.includes(',') || v.includes('"')) ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(','));
  return [header, ...lines].join('\n');
}

// Cases CSV
router.get('/cases', authenticate, (req, res) => {
  const { format, status, case_type } = req.query;
  const cid = req.user.role === 'moj_admin' ? null : req.user.court_id;
  let query = `SELECT cs.id, cs.case_number, cs.case_type, cs.title, cs.plaintiff, cs.plaintiff_lawyer, cs.defendant, cs.defendant_lawyer, cs.presiding_judge, cs.status, cs.priority, cs.filed_date, cs.next_hearing_date, cs.verdict, cs.verdict_date, c.name as court, c.parish FROM cases cs JOIN courts c ON cs.court_id = c.id WHERE 1=1`;
  const params = [];
  if (cid) { query += ' AND cs.court_id = ?'; params.push(cid); }
  if (status) { query += ' AND cs.status = ?'; params.push(status); }
  if (case_type) { query += ' AND cs.case_type = ?'; params.push(case_type); }
  query += ' ORDER BY c.parish, cs.filed_date DESC';
  const rows = db.prepare(query).all(...params);

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="courtjm-cases.csv"');
    return res.send(toCSV(rows, ['case_number','case_type','title','plaintiff','defendant','presiding_judge','status','priority','filed_date','next_hearing_date','court','parish']));
  }
  res.json(rows);
});

// Hearings CSV
router.get('/hearings', authenticate, (req, res) => {
  const { format, from, to } = req.query;
  const cid = req.user.role === 'moj_admin' ? null : req.user.court_id;
  let query = `SELECT h.id, h.hearing_date, h.hearing_time, h.type, h.status, h.courtroom, h.judge, h.outcome, cs.case_number, cs.title, cs.case_type, c.name as court, c.parish FROM hearings h JOIN cases cs ON h.case_id = cs.id JOIN courts c ON h.court_id = c.id WHERE 1=1`;
  const params = [];
  if (cid) { query += ' AND h.court_id = ?'; params.push(cid); }
  if (from) { query += ' AND h.hearing_date >= ?'; params.push(from); }
  if (to) { query += ' AND h.hearing_date <= ?'; params.push(to); }
  query += ' ORDER BY h.hearing_date DESC';
  const rows = db.prepare(query).all(...params);

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="courtjm-hearings.csv"');
    return res.send(toCSV(rows, ['hearing_date','hearing_time','type','status','courtroom','judge','case_number','title','court','parish','outcome']));
  }
  res.json(rows);
});

// Summary stats
router.get('/summary', authenticate, (req, res) => {
  const cid = req.user.role === 'moj_admin' ? null : req.user.court_id;
  const p = cid ? [cid] : [];
  const w = cid ? 'WHERE court_id = ?' : '';
  const cw = cid ? 'WHERE cs.court_id = ?' : '';

  const byStatus = db.prepare(`SELECT status, COUNT(*) as count FROM cases ${w} GROUP BY status`).all(...p);
  const byType = db.prepare(`SELECT case_type, COUNT(*) as count FROM cases ${w} GROUP BY case_type ORDER BY count DESC`).all(...p);
  const byPriority = db.prepare(`SELECT priority, COUNT(*) as count FROM cases ${w} GROUP BY priority`).all(...p);
  const byParish = cid ? [] : db.prepare(`SELECT c.parish, COUNT(cs.id) as cases FROM courts c LEFT JOIN cases cs ON cs.court_id = c.id GROUP BY c.parish ORDER BY cases DESC`).all();
  const monthlyFilings = db.prepare(`SELECT strftime('%Y-%m', filed_date) as month, COUNT(*) as count FROM cases ${w} GROUP BY month ORDER BY month DESC LIMIT 12`).all(...p);

  res.json({ byStatus, byType, byPriority, byParish, monthlyFilings });
});

module.exports = router;
