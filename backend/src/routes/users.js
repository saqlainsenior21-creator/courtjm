const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { authenticate, requireRole } = require('../auth');

router.get('/', authenticate, requireRole('moj_admin', 'registrar'), (req, res) => {
  let users;
  if (req.user.role === 'moj_admin') {
    users = db.prepare('SELECT u.id, u.name, u.email, u.role, u.bar_number, u.active, u.created_at, c.name as court_name FROM users u LEFT JOIN courts c ON u.court_id = c.id ORDER BY c.name, u.name').all();
  } else {
    users = db.prepare('SELECT id, name, email, role, bar_number, active, created_at FROM users WHERE court_id = ? ORDER BY name').all(req.user.court_id);
  }
  res.json(users);
});

router.post('/', authenticate, requireRole('moj_admin', 'registrar'), (req, res) => {
  const { name, email, password, role, court_id, bar_number } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'All fields required' });
  const cid = req.user.role === 'moj_admin' ? court_id : req.user.court_id;
  const hash = bcrypt.hashSync(password, 10);
  try {
    const result = db.prepare('INSERT INTO users (court_id, name, email, password, role, bar_number) VALUES (?,?,?,?,?,?)').run(cid, name, email.toLowerCase(), hash, role, bar_number || null);
    db.prepare(`INSERT INTO audit_log (user_id, action, details) VALUES (?, 'USER_CREATED', ?)`).run(req.user.id, `User: ${email}`);
    res.json({ id: result.lastInsertRowid, message: 'User created' });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id/toggle', authenticate, requireRole('moj_admin', 'registrar'), (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE users SET active = ? WHERE id = ?').run(user.active ? 0 : 1, req.params.id);
  res.json({ success: true });
});

module.exports = router;
