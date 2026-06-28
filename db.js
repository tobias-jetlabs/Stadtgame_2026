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
}

function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
}

function getState() {
  return state;
}

function setState(newState) {
  state = newState;
  save();
}

function addEvent(message) {
  const event = {
    time: new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now(),
    message,
  };
  state.events.unshift(event);
  if (state.events.length > 50) state.events = state.events.slice(0, 50);
  save();
}

function recalcPoints() {
  const bldDefs = state.buildings;
  // Reset points
  for (const g of Object.keys(state.groups)) {
    state.groups[g].points = 0;
  }
  for (const [tid, territory] of Object.entries(state.territories)) {
    if (territory.isCapital && territory.owner) {
      state.groups[territory.owner].points += 10;
    }
    for (const bld of territory.buildings) {
      if (territory.owner) {
        state.groups[territory.owner].points += (bldDefs[bld.type]?.points || 0);
      }
    }
  }
  save();
}

module.exports = { load, save, getState, setState, addEvent, recalcPoints };
