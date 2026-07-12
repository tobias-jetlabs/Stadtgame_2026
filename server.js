'use strict';
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { DEFAULT_STATE, ADMIN_CODE, GROUP_CODES } = require('./gameState');

const app = express();
const PORT = process.env.PORT || 3001;
const BASE_PATH = '/stadtgame';

const router = express.Router();
app.use(cors());
app.use(express.json());
app.use(BASE_PATH, router);
router.use(express.static(path.join(__dirname, 'public')));

db.load();

// ─── Auto-dice timer ─────────────────────────────────────────────────────────
let diceTimer = null;

function scheduleNextRoll() {
  if (diceTimer) clearTimeout(diceTimer);
  const state = db.getState();
  if (!state.autoDice) return;

  const intervalMs = (state.diceIntervalMinutes || 15) * 60 * 1000;
  const now = Date.now();
  const nextAt = state.nextRollAt || (now + intervalMs);
  const delay = Math.max(0, nextAt - now);

  diceTimer = setTimeout(() => {
    rollAndDistribute();
    // Schedule next
    const s = db.getState();
    s.nextRollAt = Date.now() + (s.diceIntervalMinutes || 15) * 60 * 1000;
    db.setState(s);
    scheduleNextRoll();
  }, delay);
}

function rollAndDistribute(forcedRoll) {
  const state = db.getState();
  const roll = forcedRoll ?? (Math.floor(Math.random() * 11) + 2);
  state.lastDiceRoll = roll;
  db.setState(state);
  distributeResources(roll);
  return roll;
}

function distributeResources(roll) {
  const state = db.getState();
  const gained = {};

  for (const territory of Object.values(state.territories)) {
    if (territory.number !== roll) continue;
    if (!territory.owner || territory.buildings.length === 0) continue;
    const res = territory.resourceType || 'wood';
    const amount = territory.buildings.length;
    if (!gained[territory.owner]) gained[territory.owner] = {};
    gained[territory.owner][res] = (gained[territory.owner][res] || 0) + amount;
  }

  for (const [group, resources] of Object.entries(gained)) {
    for (const [res, amt] of Object.entries(resources)) {
      state.groups[group].resources[res] = (state.groups[group].resources[res] || 0) + amt;
    }
  }

  const resName = { wood: 'Holz', stone: 'Stein', iron: 'Eisen' };
  const summaries = Object.entries(gained)
    .map(([g, r]) => `${state.groups[g].name}: +${Object.entries(r).map(([k,v]) => `${v} ${resName[k]||k}`).join(', ')}`)
    .join(' | ');

  db.addEvent(`🎲 Würfelwurf: ${roll}. ${summaries || 'Keine Produktion.'}`);
  db.save();
}

// Start the auto-dice on boot
scheduleNextRoll();

// ─── Auth middleware ──────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const code = req.headers['x-auth-code'] || req.body?.authCode;
  if (!code) return res.status(401).json({ error: 'Kein Code' });

  if (code === ADMIN_CODE) {
    req.role = 'admin';
    req.groupId = null;
    return next();
  }

  for (const [groupId, groupCode] of Object.entries(GROUP_CODES)) {
    if (code === groupCode) {
      req.role = 'player';
      req.groupId = groupId;
      return next();
    }
  }

  return res.status(403).json({ error: 'Ungültiger Code' });
}

function adminOnly(req, res, next) {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Nur für Admins' });
  next();
}

// ─── Public routes ────────────────────────────────────────────────────────────

// Login / identify
router.post('/api/auth', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Kein Code angegeben' });

  if (code === ADMIN_CODE) {
    return res.json({ role: 'admin', groupId: null, name: 'Administrator' });
  }

  for (const [groupId, groupCode] of Object.entries(GROUP_CODES)) {
    if (code === groupCode) {
      const state = db.getState();
      const group = state.groups[groupId];
      if (!group) return res.status(400).json({ error: 'Gruppe nicht im Spiel' });

      // Mark group as joined
      if (!group.joined) {
        group.joined = true;
        db.addEvent(`👋 ${group.name} ist dem Spiel beigetreten.`);
        db.save();
      }

      return res.json({ role: 'player', groupId, name: group.name });
    }
  }

  return res.status(403).json({ error: 'Ungültiger Code' });
});

// GET game state (all groups' resources are visible to everyone)
router.get('/api/game', authMiddleware, (req, res) => {
  const state = db.getState();

  if (req.role === 'admin') {
    return res.json({ ...state, role: 'admin', groupCodes: GROUP_CODES });
  }

  return res.json({ ...state, role: 'player', myGroupId: req.groupId });
});

// ─── Player routes ────────────────────────────────────────────────────────────

router.post('/api/build', authMiddleware, (req, res) => {
  const { territoryId, buildingType } = req.body;
  const state = db.getState();
  const groupId = req.role === 'admin' ? req.body.group : req.groupId;

  if (!state.groups[groupId]) return res.status(400).json({ error: 'Unbekannte Gruppe' });
  if (!state.territories[territoryId]) return res.status(400).json({ error: 'Unbekanntes Territorium' });
  if (!state.buildings[buildingType]) return res.status(400).json({ error: 'Unbekannter Gebäudetyp' });

  const territory = state.territories[territoryId];
  const group = state.groups[groupId];
  const bldDef = state.buildings[buildingType];

  // Players can only build on territories the admin has already assigned to them
  if (req.role === 'player' && territory.owner !== groupId) {
    return res.status(403).json({ error: 'Dieses Gebiet gehört dir nicht. Der Admin muss es dir zuerst zuweisen.' });
  }

  // Players can only build if the territory has no building yet
  if (req.role === 'player' && territory.buildings.length > 0) {
    return res.status(400).json({ error: 'Auf diesem Gebiet steht bereits ein Gebäude.' });
  }

  // Check cost
  for (const [res, cost] of Object.entries(bldDef.cost)) {
    if (cost > 0 && (group.resources[res] || 0) < cost) {
      const resName = { wood: 'Holz', stone: 'Stein', iron: 'Eisen' };
      return res.status(400).json({ error: `Nicht genug ${resName[res] || res}` });
    }
  }

  // Deduct cost
  for (const [res, cost] of Object.entries(bldDef.cost)) {
    group.resources[res] = (group.resources[res] || 0) - cost;
  }

  territory.buildings.push({ type: buildingType, builtAt: new Date().toISOString() });

  db.recalcPoints();
  db.addEvent(`🏗 ${group.name} hat in ${territory.label} einen/eine ${bldDef.label} gebaut.`);

  res.json({ success: true, state: db.getState() });
});

// ─── Admin routes ─────────────────────────────────────────────────────────────

// Admin: set resources for a group
router.post('/api/admin/resources', authMiddleware, adminOnly, (req, res) => {
  const { groupId, resource, value } = req.body;
  const state = db.getState();
  if (!state.groups[groupId]) return res.status(400).json({ error: 'Unbekannte Gruppe' });

  state.groups[groupId].resources[resource] = Math.max(0, parseInt(value) || 0);
  db.save();
  db.addEvent(`🔧 Admin: ${state.groups[groupId].name} → ${resource} = ${value}`);
  res.json({ success: true, state: db.getState() });
});

// Admin: set territory owner
router.post('/api/admin/territory', authMiddleware, adminOnly, (req, res) => {
  const { territoryId, owner } = req.body; // owner: groupId or null
  const state = db.getState();
  if (!state.territories[territoryId]) return res.status(400).json({ error: 'Unbekanntes Territorium' });
  if (owner && !state.groups[owner]) return res.status(400).json({ error: 'Unbekannte Gruppe' });

  const t = state.territories[territoryId];
  const oldOwner = t.owner ? state.groups[t.owner]?.name : 'niemand';
  const newOwner = owner ? state.groups[owner]?.name : 'niemand';
  t.owner = owner || null;

  db.recalcPoints();
  db.addEvent(`🔧 Admin: ${t.label} → Besitz von ${oldOwner} zu ${newOwner}`);
  res.json({ success: true, state: db.getState() });
});

// Admin: add or remove a building on a territory
router.post('/api/admin/building', authMiddleware, adminOnly, (req, res) => {
  const { territoryId, action, buildingType, index } = req.body;
  const state = db.getState();
  if (!state.territories[territoryId]) return res.status(400).json({ error: 'Unbekanntes Territorium' });

  const t = state.territories[territoryId];

  if (action === 'add') {
    if (!state.buildings[buildingType]) return res.status(400).json({ error: 'Unbekannter Gebäudetyp' });
    t.buildings.push({ type: buildingType, builtAt: new Date().toISOString() });
    db.addEvent(`🔧 Admin: ${state.buildings[buildingType].label} in ${t.label} hinzugefügt.`);
  } else if (action === 'remove') {
    if (index === undefined || index < 0 || index >= t.buildings.length) {
      return res.status(400).json({ error: 'Ungültiger Index' });
    }
    const removed = t.buildings.splice(index, 1)[0];
    db.addEvent(`🔧 Admin: ${state.buildings[removed.type]?.label || removed.type} in ${t.label} entfernt.`);
  }

  db.recalcPoints();
  res.json({ success: true, state: db.getState() });
});

// Admin: manual dice roll
router.post('/api/admin/dice', authMiddleware, adminOnly, (req, res) => {
  const { value } = req.body;
  const state = db.getState();
  const roll = value ? parseInt(value) : null;
  if (roll && (roll < 2 || roll > 12)) return res.status(400).json({ error: 'Würfelwert muss zwischen 2 und 12 sein' });
  const actual = rollAndDistribute(roll);
  state.nextRollAt = Date.now() + (state.diceIntervalMinutes || 15) * 60 * 1000;
  db.setState(state);
  scheduleNextRoll();
  res.json({ success: true, roll: actual, state: db.getState() });
});

// Admin: configure auto-dice
router.post('/api/admin/dice-config', authMiddleware, adminOnly, (req, res) => {
  const { autoDice, intervalMinutes } = req.body;
  const state = db.getState();

  if (autoDice !== undefined) state.autoDice = !!autoDice;
  if (intervalMinutes !== undefined) {
    const mins = parseInt(intervalMinutes);
    if (mins < 1 || mins > 120) return res.status(400).json({ error: 'Interval muss 1–120 Minuten sein' });
    state.diceIntervalMinutes = mins;
    state.nextRollAt = Date.now() + mins * 60 * 1000;
  }

  db.setState(state);
  scheduleNextRoll();
  db.addEvent(`🔧 Admin: Auto-Würfel ${state.autoDice ? 'aktiviert' : 'deaktiviert'}, Interval: ${state.diceIntervalMinutes} Min.`);
  res.json({ success: true, state: db.getState() });
});

// Admin: conquer / transfer territory (full control)
router.post('/api/admin/conquer', authMiddleware, adminOnly, (req, res) => {
  const { territoryId, newOwner } = req.body;
  const state = db.getState();
  if (!state.territories[territoryId]) return res.status(400).json({ error: 'Unbekanntes Territorium' });

  const t = state.territories[territoryId];
  const old = t.owner ? state.groups[t.owner]?.name : 'niemand';
  const neu = newOwner ? state.groups[newOwner]?.name : 'niemand';
  t.owner = newOwner || null;

  db.recalcPoints();
  db.addEvent(`⚔️ Admin: ${t.label} von ${old} an ${neu} übertragen.`);
  res.json({ success: true, state: db.getState() });
});

// Admin: reset game
router.post('/api/admin/reset', authMiddleware, adminOnly, (req, res) => {
  const fresh = JSON.parse(JSON.stringify(DEFAULT_STATE));
  fresh.createdAt = new Date().toISOString();
  db.setState(fresh);
  scheduleNextRoll();
  console.log('[ADMIN] Game reset.');
  res.json({ success: true });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏰 Habsburger Stadtgame → http://localhost:${PORT}${BASE_PATH}`);
  console.log(`   Admin Code: ${ADMIN_CODE}`);
  Object.entries(GROUP_CODES).forEach(([g, c]) => console.log(`   ${g}: ${c}`));
  console.log('');
});
