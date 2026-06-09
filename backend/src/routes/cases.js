const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticate } = require('../auth');

// PUBLIC case search
router.get('/search', (req, res) => {
  const { q, parish, case_type, status } = req.query;
  if (!q && !parish) return res.json([]);
  let query = `SELECT cs.id, cs.case_number, cs.case_type, cs.title, cs.plaintiff, cs.defendant, cs.status, cs.filed_date, cs.next_hearing_date, cs.priority, c.name as court_name, c.parish
    FROM cases cs JOIN courts c ON cs.court_id = c.id WHERE 1=1`;
  const params = [];
  if (q) { query += ' AND (cs.case_number LIKE ? OR cs.title LIKE ? OR cs.plaintiff LIKE ? OR cs.defendant LIKE ?)'; const s = `%${q}%`; params.push(s,s,s,s); }
  if (parish) { query += ' AND c.parish = ?'; params.push(parish); }
  if (case_type) { query += ' AND cs.case_type = ?'; params.push(case_type); }
  if (status) { query += ' AND cs.status = ?'; params.push(status); }
  query += ' ORDER BY cs.filed_date DESC LIMIT 50';
  res.json(db.prepare(query).all(...params));
});

// GET all cases (authenticated)
router.get('/', authenticate, (req, res) => {
  const { status, case_type, priority } = req.query;
  const cid = req.user.role === 'moj_admin' ? null : req.user.court_id;
  let query = `SELECT cs.*, c.name as court_name, c.parish FROM cases cs JOIN courts c ON cs.court_id = c.id WHERE 1=1`;
  const params = [];
  if (cid) { query += ' AND cs.court_id = ?'; params.push(cid); }
  if (status) { query += ' AND cs.status = ?'; params.push(status); }
  if (case_type) { query += ' AND cs.case_type = ?'; params.push(case_type); }
  if (priority) { query += ' AND cs.priority = ?'; params.push(priority); }
  query += ' ORDER BY cs.filed_date DESC';
  res.json(db.prepare(query).all(...params));
});

// GET single case
router.get('/:id', (req, res) => {
  const c = db.prepare('SELECT cs.*, ct.name as court_name, ct.parish, ct.type as court_type FROM cases cs JOIN courts ct ON cs.court_id = ct.id WHERE cs.id = ? OR cs.case_number = ?').get(req.params.id, req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  const hearings = db.prepare('SELECT * FROM hearings WHERE case_id = ? ORDER BY hearing_date DESC').all(c.id);
  const documents = db.prepare('SELECT * FROM documents WHERE case_id = ? ORDER BY created_at DESC').all(c.id);
  res.json({ ...c, hearings, documents });
});

// POST create case
router.post('/', authenticate, (req, res) => {
  const { case_number, case_type, title, description, plaintiff, plaintiff_lawyer, defendant, defendant_lawyer, presiding_judge, filed_date, next_hearing_date, priority } = req.body;
  if (!case_number || !case_type || !title || !plaintiff || !defendant) return res.status(400).json({ error: 'Case number, type, title, plaintiff and defendant required' });
  const court_id = req.user.role === 'moj_admin' ? req.body.court_id : req.user.court_id;
  try {
    const result = db.prepare(`INSERT INTO cases (court_id, case_number, case_type, title, description, plaintiff, plaintiff_lawyer, defendant, defendant_lawyer, presiding_judge, filed_date, next_hearing_date, priority, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(court_id, case_number, case_type, title, description, plaintiff, plaintiff_lawyer, defendant, defendant_lawyer, presiding_judge, filed_date || new Date().toISOString().split('T')[0], next_hearing_date, priority || 'normal', req.user.id);
    db.prepare(`INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?, 'CASE_FILED', 'case', ?, ?)`).run(req.user.id, result.lastInsertRowid, `Case: ${case_number}`);
    res.json({ id: result.lastInsertRowid, message: 'Case filed successfully' });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(400).json({ error: 'Case number already exists' });
    res.status(500).json({ error: e.message });
  }
});

// PUT update case status
router.put('/:id', authenticate, (req, res) => {
  const { status, next_hearing_date, presiding_judge, verdict, verdict_date, priority } = req.body;
  db.prepare(`UPDATE cases SET status=COALESCE(?,status), next_hearing_date=COALESCE(?,next_hearing_date), presiding_judge=COALESCE(?,presiding_judge), verdict=COALESCE(?,verdict), verdict_date=COALESCE(?,verdict_date), priority=COALESCE(?,priority) WHERE id=?`)
    .run(status, next_hearing_date, presiding_judge, verdict, verdict_date, priority, req.params.id);
  db.prepare(`INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?, 'CASE_UPDATED', 'case', ?, ?)`).run(req.user.id, req.params.id, `Updated: ${JSON.stringify(req.body)}`);
  res.json({ success: true });
});

module.exports = router;
