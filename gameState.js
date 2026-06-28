'use strict';

const DEFAULT_STATE = {
  lastDiceRoll: null,
  nextRollAt: null,
  groups: {
    red: { name: 'Gruppe Rot', color: '#e74c3c', resources: { wood: 20, stone: 10 }, points: 0 },
    blue: { name: 'Gruppe Blau', color: '#3498db', resources: { wood: 20, stone: 10 }, points: 0 },
    green: { name: 'Gruppe Grün', color: '#27ae60', resources: { wood: 20, stone: 10 }, points: 0 },
    yellow: { name: 'Gruppe Gelb', color: '#f39c12', resources: { wood: 20, stone: 10 }, points: 0 },
  },
  territories: {
    '1':  { number: 4,  label: 'Marktplatz',       owner: null, buildings: [], adjacentTo: [2, 5, 6] },
    '2':  { number: 6,  label: 'Brunnen',           owner: null, buildings: [], adjacentTo: [1, 3, 7] },
    '3':  { number: 2,  label: 'Mühlbach',          owner: null, buildings: [], adjacentTo: [2, 4, 8] },
    '4':  { number: 8,  label: 'Kapellgasse',       owner: null, buildings: [], adjacentTo: [3, 9] },
    '5':  { number: 3,  label: 'Stadttor',          owner: null, buildings: [], adjacentTo: [1, 6, 10] },
    '6':  { number: 5,  label: 'Rathausplatz',      owner: null, buildings: [], adjacentTo: [1, 2, 5, 7, 11] },
    '7':  { number: 9,  label: 'Klostergasse',      owner: null, buildings: [], adjacentTo: [2, 3, 6, 8, 12] },
    '8':  { number: 1,  label: 'Fischergasse',      owner: null, buildings: [], adjacentTo: [3, 4, 7, 9, 13] },
    '9':  { number: 11, label: 'Kräutergarten',     owner: null, buildings: [], adjacentTo: [4, 8, 14] },
    '10': { number: 7,  label: 'Waffenschmiede',    owner: null, buildings: [], adjacentTo: [5, 6, 11, 15] },
    '11': { number: 10, label: 'Burghügel',         owner: null, buildings: [], adjacentTo: [6, 7, 10, 12, 16] },
    '12': { number: 2,  label: 'Nebenweg',          owner: null, buildings: [], adjacentTo: [7, 8, 11, 13, 17] },
    '13': { number: 6,  label: 'Flussübergang',     owner: null, buildings: [], adjacentTo: [8, 9, 12, 14, 18] },
    '14': { number: 4,  label: 'Ackerland',         owner: null, buildings: [], adjacentTo: [9, 13, 19] },
    '15': { number: 8,  label: 'Vorposten Nord',    owner: null, buildings: [], adjacentTo: [10, 11, 16] },
    '16': { number: 3,  label: 'Habsburg Burg',     owner: null, buildings: [], adjacentTo: [11, 12, 15, 17], isCapital: true },
    '17': { number: 5,  label: 'Waldlichtung',      owner: null, buildings: [], adjacentTo: [12, 13, 16, 18] },
    '18': { number: 9,  label: 'Steinbruch',        owner: null, buildings: [], adjacentTo: [13, 14, 17, 19] },
    '19': { number: 11, label: 'Südlicher Pfad',    owner: null, buildings: [], adjacentTo: [14, 18] },
  },
  buildings: {
    castle: {
      label: 'Burg',
      cost: { wood: 10, stone: 10 },
      points: 5,
      emoji: '🏰',
      defense: 3,
    },
    outpost: {
      label: 'Vorposten',
      cost: { wood: 5, stone: 2 },
      points: 1,
      emoji: '🏠',
      defense: 1,
    },
    tower: {
      label: 'Turm',
      cost: { wood: 3, stone: 5 },
      points: 2,
      emoji: '🗼',
      defense: 2,
    },
  },
  events: [],
  createdAt: new Date().toISOString(),
};

module.exports = { DEFAULT_STATE };
