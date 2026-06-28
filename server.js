'use strict';
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const DICE_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

db.load();

// ─── Helpers ────────────────────────────────────────────────────────────────

function getTerritoryResource(number) {
  // Even non-prime → Wood; odd → Stone; primes → Stone
  const primes = [2, 3, 5, 7, 11];
  if (primes.includes(number)) return 'stone';
  if (number % 2 === 0) return 'wood';
  return 'stone';
}

function distributeResources(roll) {
  const state = db.getState();
  const gained = {};

  for (const [tid, territory] of Object.entries(state.territories)) {
    if (territory.number === roll && territory.owner && territory.buildings.length > 0) {
      const resource = getTerritoryResource(roll);
      const amount = territory.buildings.length; // 1 resource per building
      if (!gained[territory.owner]) gained[territory.owner] = {};
      gained[territory.owner][resource] = (gained[territory.owner][resource] || 0) + amount;
    }
  }

  for (const [group, resources] of Object.entries(gained)) {
    for (const [res, amt] of Object.entries(resources)) {
      state.groups[group].resources[res] = (state.groups[group].resources[res] || 0) + amt;
    }
  }

  const summaries = Object.entries(gained)
    .map(([g, r]) => `${state.groups[g].name}: +${Object.entries(r).map(([k,v]) => `${v} ${k === 'wood' ? 'Holz' : 'Stein'}`).join(', ')}`)
    .join(' | ');

  db.addEvent(`🎲 Würfelwurf: ${roll}.${summaries ? ' ' + summaries : ' Keine Produktion.'}`);
  db.save();
}

// ─── API Routes ──────────────────────────────────────────────────────────────

// GET full game state
app.get('/api/game', (req, res) => {
  res.json(db.getState());
});

// POST roll dice (leader action)
app.post('/api/dice', (req, res) => {
  const state = db.getState();
  const roll = Math.floor(Math.random() * 11) + 2; // 2–12 like 2 dice
  state.lastDiceRoll = roll;
  state.nextRollAt = Date.now() + DICE_INTERVAL_MS;
  db.setState(state);
  distributeResources(roll);
  res.json({ roll, state: db.getState() });
});

// POST build a structure
app.post('/api/build', (req, res) => {
  const { group, territoryId, buildingType } = req.body;
  const state = db.getState();

  if (!state.groups[group]) return res.status(400).json({ error: 'Unbekannte Gruppe' });
  if (!state.territories[territoryId]) return res.status(400).json({ error: 'Unbekanntes Territorium' });
  if (!state.buildings[buildingType]) return res.status(400).json({ error: 'Unbekannter Gebäudetyp' });

  const territory = state.territories[territoryId];
  const groupData = state.groups[group];
  const bldDef = state.buildings[buildingType];

  // Check cost
  for (const [res, cost] of Object.entries(bldDef.cost)) {
    if ((groupData.resources[res] || 0) < cost) {
      return res.status(400).json({ error: `Nicht genug ${res === 'wood' ? 'Holz' : 'Stein'}` });
    }
  }

  // Building rules
  if (buildingType === 'outpost') {
    // Can build anywhere that has no building already
    if (territory.buildings.length > 0 && territory.owner !== group) {
      return res.status(400).json({ error: 'Dieses Territorium ist bereits besetzt' });
    }
  } else if (buildingType === 'castle') {
    // Requires adjacent controlled territory
    const hasAdjacentOwned = territory.adjacentTo.some(adjId =>
      state.territories[String(adjId)]?.owner === group
    );
    if (territory.owner !== group && !hasAdjacentOwned) {
      return res.status(400).json({ error: 'Burg benötigt ein angrenzendes kontrolliertes Territorium' });
    }
  } else if (buildingType === 'tower') {
    if (territory.owner !== group) {
      return res.status(400).json({ error: 'Turm kann nur auf eigenem Territorium gebaut werden' });
    }
  }

  // Deduct cost
  for (const [res, cost] of Object.entries(bldDef.cost)) {
    groupData.resources[res] -= cost;
  }

  // Add building
  territory.buildings.push({ type: buildingType, builtAt: new Date().toISOString() });

  // Claim territory if unclaimed
  if (!territory.owner) {
    territory.owner = group;
  }

  db.recalcPoints();
  db.addEvent(`${bldDef.emoji} ${groupData.name} hat in ${territory.label} einen/eine ${bldDef.label} gebaut.`);

  res.json({ success: true, state: db.getState() });
});

// POST conquer a territory
app.post('/api/conquer', (req, res) => {
  const { attacker, territoryId } = req.body;
  const state = db.getState();

  if (!state.groups[attacker]) return res.status(400).json({ error: 'Unbekannte Gruppe' });
  if (!state.territories[territoryId]) return res.status(400).json({ error: 'Unbekanntes Territorium' });

  const territory = state.territories[territoryId];

  if (!territory.owner || territory.owner === attacker) {
    return res.status(400).json({ error: 'Kann nur feindliche Territorien erobern' });
  }

  const defender = territory.owner;
  const defenderName = state.groups[defender].name;
  const attackerName = state.groups[attacker].name;

  // Simple conquest: attacker takes over, buildings remain but ownership changes
  territory.owner = attacker;

  db.recalcPoints();
  db.addEvent(`⚔️ ${attackerName} hat ${territory.label} von ${defenderName} erobert!`);

  res.json({ success: true, state: db.getState() });
});

// POST update resources (admin/leader manual adjustment)
app.post('/api/resources', (req, res) => {
  const { group, resource, amount } = req.body;
  const state = db.getState();

  if (!state.groups[group]) return res.status(400).json({ error: 'Unbekannte Gruppe' });

  state.groups[group].resources[resource] = Math.max(0,
    (state.groups[group].resources[resource] || 0) + amount
  );

  db.save();
  res.json({ success: true, state: db.getState() });
});

// POST reset game (admin)
app.post('/api/reset', (req, res) => {
  const { DEFAULT_STATE } = require('./gameState');
  const fresh = JSON.parse(JSON.stringify(DEFAULT_STATE));
  fresh.createdAt = new Date().toISOString();
  db.setState(fresh);
  console.log('[ADMIN] Game reset.');
  res.json({ success: true });
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🏰 Habsburger Stadtgame läuft auf http://localhost:${PORT}\n`);
});
