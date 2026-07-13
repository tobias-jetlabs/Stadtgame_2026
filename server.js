'use strict';
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { DEFAULT_STATE, ADMIN_CODE, GROUP_CODES, resolveLocation } = require('./gameState');

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

// Real 2d6: sum of two independent 1–6 rolls (triangular curve, 7 most
// common). Uniform: every value 2–12 equally likely. Admin picks which via
// state.realDiceProbability; a forced/manual roll always bypasses both.
function rollDice(realDiceProbability) {
  if (realDiceProbability) {
    return (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
  }
  return Math.floor(Math.random() * 11) + 2;
}

function rollAndDistribute(forcedRoll) {
  const state = db.getState();
  const roll = forcedRoll ?? rollDice(state.realDiceProbability);
  state.lastDiceRoll = roll;
  db.setState(state);
  distributeResources(roll);
  return roll;
}

function distributeResources(roll) {
  const state = db.getState();
  const gained = {};

  // Production is keyed off each structure's own owner (not the current
  // territory owner) — a structure keeps producing for whoever built it even
  // if the territory it sits on/between later changes hands. A structure
  // produces once per territory it touches whose number matches the roll
  // (so a Stützpunkt/Burg can produce from more than one field per roll).
  for (const structure of state.structures) {
    for (const tId of structure.territories) {
      const territory = state.territories[tId];
      if (!territory || territory.number !== roll) continue;
      const res = territory.resourceType || 'wood';
      if (!gained[structure.owner]) gained[structure.owner] = {};
      gained[structure.owner][res] = (gained[structure.owner][res] || 0) + 1;
    }
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
  const { buildingType, locationId } = req.body;
  const state = db.getState();
  const groupId = req.role === 'admin' ? req.body.group : req.groupId;

  if (!state.groups[groupId]) return res.status(400).json({ error: 'Unbekannte Gruppe' });
  const bldDef = state.buildings[buildingType];
  if (!bldDef) return res.status(400).json({ error: 'Unbekannter Gebäudetyp' });

  const territoryIds = resolveLocation(bldDef.placement, locationId);
  if (!territoryIds) return res.status(400).json({ error: 'Ungültiger Standort für diesen Gebäudetyp.' });
  const key = territoryIds.join('-');

  if (state.structures.some(s => s.locationId === key)) {
    return res.status(400).json({ error: 'Dort steht bereits eine Baute.' });
  }

  const group = state.groups[groupId];

  // Players may only build where they own every territory the structure spans
  if (req.role === 'player' && !territoryIds.every(id => state.territories[id].owner === groupId)) {
    return res.status(403).json({ error: 'Du besitzt nicht alle für diese Baute nötigen Gebiete.' });
  }

  // Check cost
  for (const [resKey, cost] of Object.entries(bldDef.cost)) {
    if (cost > 0 && (group.resources[resKey] || 0) < cost) {
      const resName = { wood: 'Holz', stone: 'Stein', iron: 'Eisen' };
      return res.status(400).json({ error: `Nicht genug ${resName[resKey] || resKey}` });
    }
  }

  // Deduct cost
  for (const [resKey, cost] of Object.entries(bldDef.cost)) {
    group.resources[resKey] = (group.resources[resKey] || 0) - cost;
  }

  state.structures.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: buildingType,
    owner: groupId,
    locationId: key,
    territories: territoryIds,
    builtAt: new Date().toISOString(),
  });

  db.recalcPoints();
  const spotLabel = territoryIds.map(id => state.territories[id].label).join(' / ');
  db.addEvent(`🏗 ${group.name} hat ${bldDef.label} bei ${spotLabel} gebaut.`);

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

// Admin: add or remove a structure (free of cost, bypasses ownership checks)
router.post('/api/admin/building', authMiddleware, adminOnly, (req, res) => {
  const { action, buildingType, locationId, owner, structureId } = req.body;
  const state = db.getState();

  if (action === 'add') {
    const bldDef = state.buildings[buildingType];
    if (!bldDef) return res.status(400).json({ error: 'Unbekannter Gebäudetyp' });
    if (!state.groups[owner]) return res.status(400).json({ error: 'Unbekannte Gruppe' });

    const territoryIds = resolveLocation(bldDef.placement, locationId);
    if (!territoryIds) return res.status(400).json({ error: 'Ungültiger Standort für diesen Gebäudetyp.' });
    const key = territoryIds.join('-');
    if (state.structures.some(s => s.locationId === key)) {
      return res.status(400).json({ error: 'Dort steht bereits eine Baute.' });
    }

    state.structures.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: buildingType,
      owner,
      locationId: key,
      territories: territoryIds,
      builtAt: new Date().toISOString(),
    });
    const spotLabel = territoryIds.map(id => state.territories[id].label).join(' / ');
    db.addEvent(`🔧 Admin: ${bldDef.label} (${state.groups[owner].name}) bei ${spotLabel} hinzugefügt.`);
  } else if (action === 'remove') {
    const idx = state.structures.findIndex(s => s.id === structureId);
    if (idx === -1) return res.status(400).json({ error: 'Baute nicht gefunden' });
    const removed = state.structures.splice(idx, 1)[0];
    const spotLabel = removed.territories.map(id => state.territories[id]?.label || id).join(' / ');
    db.addEvent(`🔧 Admin: ${state.buildings[removed.type]?.label || removed.type} bei ${spotLabel} entfernt.`);
  } else if (action === 'transfer') {
    const structure = state.structures.find(s => s.id === structureId);
    if (!structure) return res.status(400).json({ error: 'Baute nicht gefunden' });
    if (!state.groups[owner]) return res.status(400).json({ error: 'Unbekannte Gruppe' });

    const oldOwnerName = state.groups[structure.owner]?.name || structure.owner;
    structure.owner = owner;
    const spotLabel = structure.territories.map(id => state.territories[id]?.label || id).join(' / ');
    db.addEvent(`🔧 Admin: ${state.buildings[structure.type]?.label || structure.type} bei ${spotLabel} → Besitzer von ${oldOwnerName} zu ${state.groups[owner].name} geändert.`);
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
  const { autoDice, intervalMinutes, realDiceProbability } = req.body;
  const state = db.getState();

  if (autoDice !== undefined) state.autoDice = !!autoDice;
  if (intervalMinutes !== undefined) {
    const mins = parseInt(intervalMinutes);
    if (mins < 1 || mins > 120) return res.status(400).json({ error: 'Interval muss 1–120 Minuten sein' });
    state.diceIntervalMinutes = mins;
    state.nextRollAt = Date.now() + mins * 60 * 1000;
  }
  if (realDiceProbability !== undefined) state.realDiceProbability = !!realDiceProbability;

  db.setState(state);
  scheduleNextRoll();
  db.addEvent(`🔧 Admin: Auto-Würfel ${state.autoDice ? 'aktiviert' : 'deaktiviert'}, Interval: ${state.diceIntervalMinutes} Min., Würfelmodus: ${state.realDiceProbability ? 'Real (2 Würfel)' : 'Komplett zufällig'}`);
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
