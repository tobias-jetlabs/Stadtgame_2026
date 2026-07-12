'use strict';

// ─── Secret codes ─────────────────────────────────────────────────────────────
// These are set once and never change. Edit before first run.
const ADMIN_CODE = 'HABSBURG-ADMIN-2025';
const GROUP_CODES = {
  red:    'ROT-ADLER-77',
  blue:   'BLAU-WELLE-42',
  green:  'GRUEN-EICHE-13',
  yellow: 'GELB-SONNE-88',
  purple: 'LILA-BURG-55',
  orange: 'ORANGE-WOLF-31',
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

  groups: {
    red:    { name: 'Gruppe Rot',    color: '#e74c3c', resources: { wood: 20, stone: 10, iron: 5 }, points: 0, joined: false },
    blue:   { name: 'Gruppe Blau',   color: '#2980b9', resources: { wood: 20, stone: 10, iron: 5 }, points: 0, joined: false },
    green:  { name: 'Gruppe Grün',   color: '#27ae60', resources: { wood: 20, stone: 10, iron: 5 }, points: 0, joined: false },
    yellow: { name: 'Gruppe Gelb',   color: '#d4ac0d', resources: { wood: 20, stone: 10, iron: 5 }, points: 0, joined: false },
    purple: { name: 'Gruppe Lila',   color: '#8e44ad', resources: { wood: 20, stone: 10, iron: 5 }, points: 0, joined: false },
    orange: { name: 'Gruppe Orange', color: '#e67e22', resources: { wood: 20, stone: 10, iron: 5 }, points: 0, joined: false },
  },

  // 24 territories in hex grid
  // resourceType: 'wood'=Holz (inner), 'stone'=Stein (mid), 'iron'=Eisen (outer/edge)
  // number: 2–12, used for dice production
  territories: {
    // ── Row 0 – outer edge top (Eisen) ──
    '1':  { number: 2,  label: 'Nordtor',        resourceType: 'iron',  owner: null, buildings: [], adjacentTo: [2, 5],        isCapital: false },
    '2':  { number: 3,  label: 'Eisenberg',      resourceType: 'iron',  owner: null, buildings: [], adjacentTo: [1, 3, 6],      isCapital: false },
    '3':  { number: 11, label: 'Felsklippe',     resourceType: 'iron',  owner: null, buildings: [], adjacentTo: [2, 4, 7],      isCapital: false },
    '4':  { number: 12, label: 'Ostflanke',      resourceType: 'iron',  owner: null, buildings: [], adjacentTo: [3, 8],         isCapital: false },

    // ── Row 1 – outer ring (Stein) ──
    '5':  { number: 4,  label: 'Stadttor',       resourceType: 'stone', owner: null, buildings: [], adjacentTo: [1, 6, 9],      isCapital: false },
    '6':  { number: 10, label: 'Brunnen',        resourceType: 'stone', owner: null, buildings: [], adjacentTo: [2, 5, 7, 10],  isCapital: false },
    '7':  { number: 4,  label: 'Klostermauer',  resourceType: 'stone', owner: null, buildings: [], adjacentTo: [3, 6, 8, 11],  isCapital: false },
    '8':  { number: 10, label: 'Steinbruch',     resourceType: 'stone', owner: null, buildings: [], adjacentTo: [4, 7, 12],     isCapital: false },

    // ── Row 2 – mid ring (Holz + Stein mix) ──
    '9':  { number: 5,  label: 'Waldrand',       resourceType: 'wood',  owner: null, buildings: [], adjacentTo: [5, 10, 13],    isCapital: false },
    '10': { number: 9,  label: 'Mühle',          resourceType: 'wood',  owner: null, buildings: [], adjacentTo: [6, 9, 11, 14], isCapital: false },
    '11': { number: 5,  label: 'Holzfäller',     resourceType: 'wood',  owner: null, buildings: [], adjacentTo: [7, 10, 12, 15],isCapital: false },
    '12': { number: 9,  label: 'Sägewerk',       resourceType: 'wood',  owner: null, buildings: [], adjacentTo: [8, 11, 16],    isCapital: false },

    // ── Row 3 – inner ring (Holz, most productive) ──
    '13': { number: 6,  label: 'Marktplatz',     resourceType: 'stone', owner: null, buildings: [], adjacentTo: [9, 14, 17],    isCapital: false },
    '14': { number: 8,  label: 'Rathausplatz',   resourceType: 'wood',  owner: null, buildings: [], adjacentTo: [10, 13, 15, 18],isCapital: false },
    '15': { number: 6,  label: 'Waffenschmiede', resourceType: 'wood',  owner: null, buildings: [], adjacentTo: [11, 14, 16, 19],isCapital: false },
    '16': { number: 8,  label: 'Kräutergarten',  resourceType: 'wood',  owner: null, buildings: [], adjacentTo: [12, 15, 20],   isCapital: false },

    // ── Row 4 – core center ──
    '17': { number: 6,  label: 'Burghügel',      resourceType: 'wood',  owner: null, buildings: [], adjacentTo: [13, 18, 21],   isCapital: false },
    '18': { number: 8,  label: 'Fischergasse',   resourceType: 'wood',  owner: null, buildings: [], adjacentTo: [14, 17, 19, 22],isCapital: false },
    '19': { number: 8,  label: 'Mühlbach',       resourceType: 'wood',  owner: null, buildings: [], adjacentTo: [15, 18, 20, 23],isCapital: false },
    '20': { number: 6,  label: 'Klostergasse',   resourceType: 'stone', owner: null, buildings: [], adjacentTo: [16, 19, 24],   isCapital: false },

    // ── Row 5 – south outer ring (Stein + Eisen) ──
    '21': { number: 3,  label: 'Südtor',         resourceType: 'iron',  owner: null, buildings: [], adjacentTo: [17, 22],       isCapital: false },
    '22': { number: 11, label: 'Flussübergang',  resourceType: 'stone', owner: null, buildings: [], adjacentTo: [18, 21, 23],   isCapital: false },
    '23': { number: 3,  label: 'Ackerland',      resourceType: 'stone', owner: null, buildings: [], adjacentTo: [19, 22, 24],   isCapital: false },
    '24': { number: 11, label: 'Habsburg Burg',  resourceType: 'iron',  owner: null, buildings: [], adjacentTo: [20, 23],       isCapital: true  },
  },

  buildings: {
    outpost: { label: 'Vorposten', cost: { wood: 5, stone: 2, iron: 0 }, points: 1, icon: 'outpost', defense: 1 },
    tower:   { label: 'Turm',     cost: { wood: 3, stone: 5, iron: 1 }, points: 2, icon: 'tower',   defense: 2 },
    castle:  { label: 'Burg',     cost: { wood: 8, stone: 8, iron: 3 }, points: 5, icon: 'castle',  defense: 3 },
  },

  events: [],
  createdAt: new Date().toISOString(),
};

module.exports = { DEFAULT_STATE, ADMIN_CODE, GROUP_CODES };
