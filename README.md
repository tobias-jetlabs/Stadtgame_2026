# 🏰 Habsburger Stadtgame

Real-world strategy game inspired by Settlers of Catan, played in the town of Altdorf.

## Quick Start

```bash
npm install
npm start
# → http://localhost:3000
```

## API

| Endpoint | Method | Description |
|---|---|---|
| `/api/game` | GET | Full game state |
| `/api/dice` | POST | Roll the dice (leader) |
| `/api/build` | POST | Build a structure |
| `/api/conquer` | POST | Conquer a territory |
| `/api/resources` | POST | Manually adjust resources |
| `/api/reset` | POST | Reset game (admin) |

### Build a structure
```json
POST /api/build
{ "group": "red", "territoryId": "3", "buildingType": "outpost" }
```

### Conquer a territory
```json
POST /api/conquer
{ "attacker": "blue", "territoryId": "3" }
```

### Roll dice
```json
POST /api/dice
```

### Manual resource adjustment
```json
POST /api/resources
{ "group": "red", "resource": "wood", "amount": 5 }
```

## Groups
- `red` – Gruppe Rot
- `blue` – Gruppe Blau  
- `green` – Gruppe Grün
- `yellow` – Gruppe Gelb

## Building Types
| Type | Label | Cost | Points |
|---|---|---|---|
| `outpost` | 🏠 Vorposten | 5 Holz, 2 Stein | 1 |
| `tower` | 🗼 Turm | 3 Holz, 5 Stein | 2 |
| `castle` | 🏰 Burg | 10 Holz, 10 Stein | 5 |

**Capital (Habsburg Burg, Gebiet 16):** 10 Punkte für kontrollierende Gruppe.

## Architecture
- **Frontend:** Vanilla HTML/CSS/JS (served as static files)
- **Backend:** Node.js + Express
- **Storage:** `db.json` (auto-saved on every change)
- **Polling:** Browser fetches `/api/game` every 3 seconds

## Deploying on a VPS
```bash
npm install -g pm2
pm2 start server.js --name habsburger
pm2 save
```
Then set up nginx to proxy port 3000.
