const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticate } = require('../auth');

router.get('/', authenticate, (req, res) => {
  const { date, status } = req.query;
  const cid = req.user.role === 'moj_admin' ? null : req.user.court_id;
  let query = `SELECT h.*, cs.title, cs.case_number, cs.case_type, c.name as court_name FROM hearings h JOIN cases cs ON h.case_id = cs.id JOIN courts c ON h.court_id = c.id WHERE 1=1`;
  const params = [];
  if (cid) { query += ' AND h.court_id = ?'; params.push(cid); }
  if (date) { query += ' AND h.hearing_date = ?'; params.push(date); }
  if (status) { query += ' AND h.status = ?'; params.push(status); }
  query += ' ORDER BY h.hearing_date DESC, h.hearing_time';
  res.json(db.prepare(query).all(...params));
});

router.get('/today', authenticate, (req, res) => {
  const cid = req.user.role === 'moj_admin' ? null : req.user.court_id;
  let query = `SELECT h.*, cs.title, cs.case_number, cs.case_type, cs.plaintiff, cs.defendant FROM hearings h JOIN cases cs ON h.case_id = cs.id WHERE h.hearing_date = date('now') AND h.status = 'scheduled'`;
  const params = [];
  if (cid) { query += ' AND h.court_id = ?'; params.push(cid); }
  query += ' ORDER BY h.hearing_time';
  res.json(db.prepare(query).all(...params));
});

router.post('/', authenticate, (req, res) => {
  const { case_id, hearing_date, hearing_time, courtroom, judge, type, notes } = req.body;
  if (!case_id || !hearing_date || !hearing_time) return res.status(400).json({ error: 'Case, date and time required' });
  const court_id = req.user.role === 'moj_admin' ? req.body.court_id : req.user.court_id;
  const result = db.prepare(`INSERT INTO hearings (case_id, court_id, hearing_date, hearing_time, courtroom, judge, type, notes) VALUES (?,?,?,?,?,?,?,?)`)
    .run(case_id, court_id, hearing_date, hearing_time, courtroom, judge, type || 'Hearing', notes);
  // Update case next hearing date
  db.prepare('UPDATE cases SET next_hearing_date = ? WHERE id = ?').run(hearing_date, case_id);
  res.json({ id: result.lastInsertRowid, message: 'Hearing scheduled' });
});

router.put('/:id', authenticate, (req, res) => {
  const { status, outcome, next_date, notes } = req.body;
  db.prepare(`UPDATE hearings SET status=COALESCE(?,status), outcome=COALESCE(?,outcome), next_date=COALESCE(?,next_date), notes=COALESCE(?,notes) WHERE id=?`)
    .run(status, outcome, next_date, notes, req.params.id);
  if (next_date) {
    const h = db.prepare('SELECT case_id FROM hearings WHERE id = ?').get(req.params.id);
    if (h) db.prepare('UPDATE cases SET next_hearing_date = ? WHERE id = ?').run(next_date, h.case_id);
  }
  res.json({ success: true });
});

module.exports = router;
