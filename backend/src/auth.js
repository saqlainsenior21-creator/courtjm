const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('./db');
const JWT_SECRET = process.env.JWT_SECRET || 'courtjm-dev-secret';

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, court_id: user.court_id }, JWT_SECRET, { expiresIn: '12h' });
}

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(auth.slice(7), JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

function setupAuthRoutes(app) {
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(email.toLowerCase().trim());
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
    let court = null;
    if (user.court_id) court = db.prepare('SELECT id, name, parish, type FROM courts WHERE id = ?').get(user.court_id);
    db.prepare(`INSERT INTO audit_log (user_id, action, details) VALUES (?, 'LOGIN', ?)`).run(user.id, `Login: ${user.email}`);
    res.json({ token: generateToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role, court_id: user.court_id, court, bar_number: user.bar_number } });
  });

  app.get('/api/auth/me', authenticate, (req, res) => {
    const user = db.prepare('SELECT id, name, email, role, court_id, bar_number FROM users WHERE id = ?').get(req.user.id);
    let court = null;
    if (user.court_id) court = db.prepare('SELECT id, name, parish, type FROM courts WHERE id = ?').get(user.court_id);
    res.json({ ...user, court });
  });
}

module.exports = { authenticate, requireRole, setupAuthRoutes };
