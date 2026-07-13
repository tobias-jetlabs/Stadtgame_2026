'use strict';
const fs = require('fs');
const path = require('path');
const { DEFAULT_STATE } = require('./gameState');

const DB_FILE = path.join(__dirname, 'db.json');
let state = null;

function load() {
  if (fs.existsSync(DB_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      console.log('[DB] Loaded game state from disk.');
    } catch (e) {
      console.warn('[DB] Corrupt db.json, starting fresh.');
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      save();
    }
  } else {
    console.log('[DB] No existing state, creating fresh game.');
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    save();
  }

  // Migrate saves from before the structures[] rework (old territory.buildings
  // arrays are simply dropped — they used building types that no longer exist).
  if (!Array.isArray(state.structures)) state.structures = [];
}

function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
}

function getState() { return state; }

function setState(newState) {
  state = newState;
  save();
}

function addEvent(message) {
  const now = new Date();
  const event = {
    time: now.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now(),
    message,
  };
  state.events.unshift(event);
  if (state.events.length > 80) state.events = state.events.slice(0, 80);
  save();
}

function recalcPoints() {
  const bldDefs = state.buildings;
  for (const g of Object.keys(state.groups)) state.groups[g].points = 0;
  // Structure points always go to the structure's own owner, independent of
  // who currently owns the territory/territories it sits on/between.
  for (const s of state.structures) {
    if (!state.groups[s.owner]) continue;
    state.groups[s.owner].points += (bldDefs[s.type]?.points || 0);
  }
  save();
}

module.exports = { load, save, getState, setState, addEvent, recalcPoints };
