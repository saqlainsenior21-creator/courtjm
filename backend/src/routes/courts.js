const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticate } = require('../auth');

router.get('/', authenticate, (req, res) => {
  const courts = db.prepare('SELECT * FROM courts ORDER BY parish, name').all();
  res.json(courts);
});

router.get('/overview', authenticate, (req, res) => {
  const totalCourts = db.prepare('SELECT COUNT(*) as c FROM courts WHERE active = 1').get().c;
  const totalCases = db.prepare('SELECT COUNT(*) as c FROM cases').get().c;
  const activeCases = db.prepare("SELECT COUNT(*) as c FROM cases WHERE status = 'active'").get().c;
  const todayHearings = db.prepare("SELECT COUNT(*) as c FROM hearings WHERE hearing_date = date('now') AND status = 'scheduled'").get().c;
  const pendingDocs = db.prepare("SELECT COUNT(*) as c FROM documents WHERE status = 'received'").get().c;
  const urgentCases = db.prepare("SELECT COUNT(*) as c FROM cases WHERE priority = 'urgent' AND status = 'active'").get().c;
  const byType = db.prepare('SELECT type, COUNT(*) as count FROM courts GROUP BY type ORDER BY count DESC').all();
  const byParish = db.prepare('SELECT parish, COUNT(DISTINCT c.id) as courts, COUNT(DISTINCT cs.id) as cases FROM courts c LEFT JOIN cases cs ON cs.court_id = c.id GROUP BY parish ORDER BY parish').all();
  const recentCases = db.prepare('SELECT cs.*, c.name as court_name FROM cases cs JOIN courts c ON cs.court_id = c.id ORDER BY cs.created_at DESC LIMIT 5').all();
  const upcomingHearings = db.prepare(`SELECT h.*, cs.title, cs.case_number, c.name as court_name FROM hearings h JOIN cases cs ON h.case_id = cs.id JOIN courts c ON h.court_id = c.id WHERE h.hearing_date >= date('now') AND h.status = 'scheduled' ORDER BY h.hearing_date, h.hearing_time LIMIT 8`).all();
  const casesByType = db.prepare('SELECT case_type, COUNT(*) as count FROM cases GROUP BY case_type ORDER BY count DESC').all();
  res.json({ totalCourts, totalCases, activeCases, todayHearings, pendingDocs, urgentCases, byType, byParish, recentCases, upcomingHearings, casesByType });
});

router.get('/:id/stats', authenticate, (req, res) => {
  const id = req.params.id;
  const totalCases = db.prepare('SELECT COUNT(*) as c FROM cases WHERE court_id = ?').get(id).c;
  const activeCases = db.prepare("SELECT COUNT(*) as c FROM cases WHERE court_id = ? AND status = 'active'").get(id).c;
  const todayHearings = db.prepare("SELECT COUNT(*) as c FROM hearings WHERE court_id = ? AND hearing_date = date('now') AND status = 'scheduled'").get(id).c;
  const upcomingHearings = db.prepare(`SELECT h.*, cs.title, cs.case_number FROM hearings h JOIN cases cs ON h.case_id = cs.id WHERE h.court_id = ? AND h.hearing_date >= date('now') AND h.status = 'scheduled' ORDER BY h.hearing_date, h.hearing_time LIMIT 5`).all(id);
  const recentCases = db.prepare('SELECT * FROM cases WHERE court_id = ? ORDER BY created_at DESC LIMIT 5').all(id);
  res.json({ totalCases, activeCases, todayHearings, upcomingHearings, recentCases });
});

module.exports = router;
