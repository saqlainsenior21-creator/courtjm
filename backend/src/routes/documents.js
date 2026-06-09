const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticate } = require('../auth');

const DOC_TYPES = ['Pleading','Application','Affidavit','Order','Judgment','Notice','Summons','Warrant','Evidence','Correspondence','Other'];

router.get('/', authenticate, (req, res) => {
  const cid = req.user.role === 'moj_admin' ? null : req.user.court_id;
  let query = `SELECT d.*, cs.title, cs.case_number, c.name as court_name FROM documents d JOIN cases cs ON d.case_id = cs.id JOIN courts c ON d.court_id = c.id WHERE 1=1`;
  const params = [];
  if (cid) { query += ' AND d.court_id = ?'; params.push(cid); }
  query += ' ORDER BY d.created_at DESC LIMIT 100';
  res.json(db.prepare(query).all(...params));
});

router.post('/', authenticate, (req, res) => {
  const { case_id, title, doc_type, filed_by, notes } = req.body;
  if (!case_id || !title || !doc_type) return res.status(400).json({ error: 'Case, title and document type required' });
  const court_id = req.user.role === 'moj_admin' ? req.body.court_id : req.user.court_id;
  const result = db.prepare(`INSERT INTO documents (case_id, court_id, title, doc_type, filed_by, filed_by_user_id, notes) VALUES (?,?,?,?,?,?,?)`)
    .run(case_id, court_id, title, doc_type, filed_by || req.user.name, req.user.id, notes);
  db.prepare(`INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?, 'DOCUMENT_FILED', 'document', ?, ?)`).run(req.user.id, result.lastInsertRowid, `${doc_type}: ${title}`);
  res.json({ id: result.lastInsertRowid, message: 'Document filed successfully' });
});

router.put('/:id/status', authenticate, (req, res) => {
  const { status, notes } = req.body;
  db.prepare('UPDATE documents SET status = ?, notes = COALESCE(?, notes) WHERE id = ?').run(status, notes, req.params.id);
  res.json({ success: true });
});

module.exports = router;
