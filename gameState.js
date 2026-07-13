'use strict';

// ─── Secret codes ─────────────────────────────────────────────────────────────
// These are set once and never change. Edit before first run.
// Randomly generated, unrelated to each other and to the group names on
// purpose — so knowing one code gives no hint about any other code.
const ADMIN_CODE = 'FPU6-ZHZQ';
const GROUP_CODES = {
  uri:         '72TT-47GU',
  schwyz:      '7CWB-CK5V',
  unterwalden: 'TN92-3ZGE',
  luzern:      'E5B6-DDRC',
};

// ─── Territory layout ─────────────────────────────────────────────────────────
// 24 territories in a hex grid (5-row Catan-style: 4-5-6-5-4)
// Resource distribution (Holz/Stein häufiger, Eisen am Spielfeldrand):
//   Holz (wood)   → 10 Felder, mittlere/innere Zeilen
//   Stein (stone) → 8 Felder, Zeilen 1/3 + 2 Streufelder
//   Eisen (iron)  → 6 Felder, ausschliesslich in den äusseren Randzeilen (0 + 5)
//
// Numbers 2–12 (2d6 distribution), each appears once or twice:
//   Most common: 6,8 (5/36), then 5,9 (4/36), then 4,10 (3/36), 3,11 (2/36), 2,12 (1/36)

const DEFAULT_STATE = {
  lastDiceRoll: null,
  nextRollAt: null,
  diceIntervalMinutes: 15,
  autoDice: true,
  // true  = real 2d6 probability (2/12 rare, 7 most common) — matches the
  //         board's number layout, which was designed around that curve.
  // false = every value 2–12 equally likely.
  realDiceProbability: true,

  groups: {
    uri:         { name: 'Uri',         color: '#e74c3c', resources: { wood: 20, stone: 10, iron: 5 }, points: 0, joined: false },
    schwyz:      { name: 'Schwyz',      color: '#2980b9', resources: { wood: 20, stone: 10, iron: 5 }, points: 0, joined: false },
    unterwalden: { name: 'Unterwalden', color: '#27ae60', resources: { wood: 20, stone: 10, iron: 5 }, points: 0, joined: false },
    luzern:      { name: 'Luzern',      color: '#d4ac0d', resources: { wood: 20, stone: 10, iron: 5 }, points: 0, joined: false },
  },

  // 24 territories in hex grid
  // resourceType: 'wood'=Holz (inner), 'stone'=Stein (mid), 'iron'=Eisen (outer/edge)
  // number: 2–12, used for dice production
  // adjacentTo defines the edge graph, used to validate Stützpunkt locations.
  territories: {
    // ── Row 0 – outer edge top (Eisen) ──
    '1':  { number: 2,  label: 'Nordtor',        resourceType: 'iron',  owner: null, adjacentTo: [2, 5] },
    '2':  { number: 3,  label: 'Eisenberg',      resourceType: 'iron',  owner: null, adjacentTo: [1, 3, 6] },
    '3':  { number: 11, label: 'Felsklippe',     resourceType: 'iron',  owner: null, adjacentTo: [2, 4, 7] },
    '4':  { number: 12, label: 'Ostflanke',      resourceType: 'iron',  owner: null, adjacentTo: [3, 8] },

    // ── Row 1 – outer ring (Stein) ──
    '5':  { number: 4,  label: 'Stadttor',       resourceType: 'stone', owner: null, adjacentTo: [1, 6, 9] },
    '6':  { number: 10, label: 'Brunnen',        resourceType: 'stone', owner: null, adjacentTo: [2, 5, 7, 10] },
    '7':  { number: 4,  label: 'Klostermauer',  resourceType: 'stone', owner: null, adjacentTo: [3, 6, 8, 11] },
    '8':  { number: 10, label: 'Steinbruch',     resourceType: 'stone', owner: null, adjacentTo: [4, 7, 12] },

    // ── Row 2 – mid ring (Holz + Stein mix) ──
    '9':  { number: 5,  label: 'Waldrand',       resourceType: 'wood',  owner: null, adjacentTo: [5, 10, 13] },
    '10': { number: 9,  label: 'Mühle',          resourceType: 'wood',  owner: null, adjacentTo: [6, 9, 11, 14] },
    '11': { number: 5,  label: 'Holzfäller',     resourceType: 'wood',  owner: null, adjacentTo: [7, 10, 12, 15] },
    '12': { number: 9,  label: 'Sägewerk',       resourceType: 'wood',  owner: null, adjacentTo: [8, 11, 16] },

    // ── Row 3 – inner ring (Holz, most productive) ──
    '13': { number: 6,  label: 'Marktplatz',     resourceType: 'stone', owner: null, adjacentTo: [9, 14, 17] },
    '14': { number: 8,  label: 'Rathausplatz',   resourceType: 'wood',  owner: null, adjacentTo: [10, 13, 15, 18] },
    '15': { number: 6,  label: 'Waffenschmiede', resourceType: 'wood',  owner: null, adjacentTo: [11, 14, 16, 19] },
    '16': { number: 8,  label: 'Kräutergarten',  resourceType: 'wood',  owner: null, adjacentTo: [12, 15, 20] },

    // ── Row 4 – core center ──
    '17': { number: 6,  label: 'Burghügel',      resourceType: 'wood',  owner: null, adjacentTo: [13, 18, 21] },
    '18': { number: 8,  label: 'Fischergasse',   resourceType: 'wood',  owner: null, adjacentTo: [14, 17, 19, 22] },
    '19': { number: 8,  label: 'Mühlbach',       resourceType: 'wood',  owner: null, adjacentTo: [15, 18, 20, 23] },
    '20': { number: 6,  label: 'Klostergasse',   resourceType: 'stone', owner: null, adjacentTo: [16, 19, 24] },

    // ── Row 5 – south outer ring (Stein + Eisen) ──
    '21': { number: 3,  label: 'Südtor',         resourceType: 'iron',  owner: null, adjacentTo: [17, 22] },
    '22': { number: 11, label: 'Flussübergang',  resourceType: 'stone', owner: null, adjacentTo: [18, 21, 23] },
    '23': { number: 3,  label: 'Ackerland',      resourceType: 'stone', owner: null, adjacentTo: [19, 22, 24] },
    '24': { number: 11, label: 'Talgrund',       resourceType: 'iron',  owner: null, adjacentTo: [20, 23] },
  },

  // Building type definitions. `placement` decides how many territories a
  // structure of that type spans, and therefore what kind of location id it
  // needs (see resolveLocation() below):
  //   'territory' → 1 territory  (built in the middle of an owned territory)
  //   'edge'      → 2 territories (built on the shared border, both owned)
  //   'vertex'    → 3 territories (built where 3 fields meet, all 3 owned)
  buildings: {
    turm:        { label: 'Turm',        cost: { wood: 5,  stone: 10, iron: 0  }, points: 1, placement: 'territory' },
    stuetzpunkt: { label: 'Stützpunkt',  cost: { wood: 10, stone: 25, iron: 0  }, points: 2, placement: 'edge' },
    burg:        { label: 'Burg',        cost: { wood: 20, stone: 50, iron: 10 }, points: 5, placement: 'vertex' },
  },

  // Built structures. Each entry: { id, type, owner, locationId, territories, builtAt }
  // `locationId` is the canonical, ascending-sorted "-"-joined territory id
  // key for that spot (e.g. "5" for a Turm, "5-9" for a Stützpunkt, "1-2-5"
  // for a Burg) — also used to enforce "only one structure per spot".
  // Ownership lives on the structure itself and is intentionally independent
  // of territory.owner: capturing a territory does NOT transfer the
  // buildings sitting on/around it.
  structures: [],

  events: [],
  createdAt: new Date().toISOString(),
};

// ─── Board geometry ───────────────────────────────────────────────────────────
// Mirrors the hex layout used by the frontend (public/index.html) exactly, so
// server-side validation of build locations (edges/vertices) matches what
// players see and click on. This is static/derived data — not part of the
// mutable game state.

const HEX_R = 50;
const HEX_COL_STEP = Math.sqrt(3) * HEX_R;
const HEX_ROW_STEP = 1.5 * HEX_R;
const HEX_ROWS = [
  { count: 4, ids: [1, 2, 3, 4],                yRow: 0 },
  { count: 5, ids: [5, 6, 7, 8, 9],             yRow: 1 },
  { count: 6, ids: [10, 11, 12, 13, 14, 15],    yRow: 2 },
  { count: 5, ids: [16, 17, 18, 19, 20],        yRow: 3 },
  { count: 4, ids: [21, 22, 23, 24],            yRow: 4 },
];

function computeHexPositions() {
  const positions = {};
  const cx = 390;
  const startY = 70;
  HEX_ROWS.forEach(row => {
    const totalW = (row.count - 1) * HEX_COL_STEP;
    const startX = cx - totalW / 2;
    row.ids.forEach((id, i) => {
      positions[String(id)] = [startX + i * HEX_COL_STEP, startY + row.yRow * HEX_ROW_STEP];
    });
  });
  return positions;
}

function hexCorners(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

// Edges: every unique pair of territories that border each other, taken
// straight from the curated adjacentTo graph above.
function computeEdgeKeys(territories) {
  const seen = new Set();
  for (const [id, t] of Object.entries(territories)) {
    for (const nId of t.adjacentTo) {
      const pair = [id, String(nId)].sort((a, b) => Number(a) - Number(b));
      seen.add(pair.join('-'));
    }
  }
  return seen;
}

// Vertices: every hex corner touched by exactly 3 territories — the true
// 3-way intersections where a Burg may be built. Corners only touched by 1
// or 2 territories are board-boundary corners and are not valid Burg spots.
function computeVertexKeys(positions) {
  const map = new Map(); // "x.x,y.y" -> Set(territoryId)
  for (const [id, [cx, cy]] of Object.entries(positions)) {
    hexCorners(cx, cy, HEX_R).forEach(([x, y]) => {
      const key = `${x.toFixed(1)},${y.toFixed(1)}`;
      if (!map.has(key)) map.set(key, new Set());
      map.get(key).add(id);
    });
  }
  const keys = new Set();
  for (const set of map.values()) {
    if (set.size !== 3) continue;
    const sorted = [...set].sort((a, b) => Number(a) - Number(b));
    keys.add(sorted.join('-'));
  }
  return keys;
}

const HEX_POSITIONS = computeHexPositions();
const VALID_EDGE_KEYS = computeEdgeKeys(DEFAULT_STATE.territories);
const VALID_VERTEX_KEYS = computeVertexKeys(HEX_POSITIONS);

// Resolves a client-supplied locationId against the building type's
// placement rule. Returns the canonical, sorted array of territory ids the
// structure would occupy, or null if the location is not a valid spot for
// that building type. Never trusts the client's ordering.
function resolveLocation(placement, locationId) {
  if (!locationId) return null;
  const parts = String(locationId).split('-').map(s => s.trim()).filter(Boolean);
  const sorted = [...parts].sort((a, b) => Number(a) - Number(b));
  const key = sorted.join('-');

  if (placement === 'territory') {
    return sorted.length === 1 && DEFAULT_STATE.territories[sorted[0]] ? sorted : null;
  }
  if (placement === 'edge') {
    return sorted.length === 2 && VALID_EDGE_KEYS.has(key) ? sorted : null;
  }
  if (placement === 'vertex') {
    return sorted.length === 3 && VALID_VERTEX_KEYS.has(key) ? sorted : null;
  }
  return null;
}

module.exports = { DEFAULT_STATE, ADMIN_CODE, GROUP_CODES, resolveLocation, VALID_EDGE_KEYS, VALID_VERTEX_KEYS };
