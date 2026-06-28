# 🏰 Habsburger Stadtgame 2.0

Echtzeit-Strategiespiel für Altdorf mit **Admin-Kontrollzentrum** und **Spielerclients**.

## ⚡ Schnellstart

```bash
# Abhängigkeiten installieren
npm install

# Server starten
npm start
# → http://localhost:3000
```

Browser öffnen, Secret Code eingeben → Spielfeld sehen!

---

## 🔐 Secret Codes (im `gameState.js` definiert)

### Admin (hat vollständige Kontrolle)
```
HABSBURG-ADMIN-2025
```

### Gruppen (pro Gruppe unterschiedlich)
```
rot:     ROT-ADLER-77
blau:    BLAU-WELLE-42
grün:    GRUEN-EICHE-13
gelb:    GELB-SONNE-88
lila:    LILA-BURG-55
orange:  ORANGE-WOLF-31
```

**Diese Codes sind persistent** — sie ändern sich nicht während des Spiels.

---

## 👥 Rollen & Rechte

### 🎮 SPIELER
- ✅ Spielfeld ansehen (live mit anderen Spielern)
- ✅ Eigene Ressourcen sehen (Holz, Stein, Eisen)
- ✅ Gebäude auf eigenen Territorien bauen (wenn Ressourcen reichen)
- ❌ Ressourcen anderer Gruppen sehen (werden als "?" angezeigt)
- ❌ Territorien erobern / übertragen
- ❌ Würfeln
- ❌ Konfiguration ändern

### ⚙️ ADMINISTRATOR
- ✅ **Alle** Ressourcen aller Gruppen anpassen (live)
- ✅ Territorium-Besitzer ändern
- ✅ Gebäude hinzufügen/entfernen (auf allen Territorien)
- ✅ Würfeln manuell oder automatisch
- ✅ Auto-Dice Interval konfigurieren (1–120 Min)
- ✅ Komplettes Spiel zurücksetzen
- ✅ Secret Codes anschauen
- ✅ Event-Log einsehen

---

## 🗺 Spielfeld (24 Territorien)

**Layout:** 4–5–6–5–4 Hex-Ringe

### Ressourcentypen
- **Holz** (🪵) – Innenfelder (häufig, Nummern 6,8)
- **Stein** (🪨) – Mittlere Ringe (Nummern 4,10)
- **Eisen** (⚙️) – Randfelder (seltener, Nummern 2,3,11,12)

**Habsburg Burg (Territorium 24)** – Die Hauptstadt, 10 VP wenn kontrolliert!

---

## 🏗 Gebäude & Kosten

| Typ | Kosten | VP | Emoji |
|---|---|---|---|
| **Vorposten** | 5🪵 + 2🪨 | 1 | 🏠 |
| **Turm** | 3🪵 + 5🪨 + 1⚙️ | 2 | 🗼 |
| **Burg** | 8🪵 + 8🪨 + 3⚙️ | 5 | 🏰 |

---

## 🎲 Würfel-System

### Automatisches Würfeln (Admin-Steuerung)
- **Interval konfigurierbar:** 1–120 Minuten (default: 15 Min)
- **Auto-Toggle:** Admin kann An/Aus-schalten
- **Manuelles Würfeln:** Admin kann jederzeit manuell würfeln (2–12 oder zufällig)

### Ressourcen-Produktion
Wenn die Würfelzahl fällt:
- Alle Territorien mit dieser Zahl produzieren ihre Ressource
- Jedes Gebäude auf dem Territorium = 1 Ressource für den Besitzer
- Beispiel: Territorium 8 (Holz) mit 2 Burgen → +2 Holz

---

## 🌐 API

Alle Requests brauchen Header: `x-auth-code: <SECRET>`

### Public Endpoints

#### Login / Identifizierung
```
POST /api/auth
{ "code": "ROT-ADLER-77" }
→ { role: "player", groupId: "red", name: "Gruppe Rot" }
```

#### Spielfeld abrufen
```
GET /api/game
→ Vollständiger Spielstatus (Territorien, Gruppen, Ressourcen, Events)
```

### Player Endpoints

#### Gebäude bauen
```
POST /api/build
{ "territoryId": "5", "buildingType": "outpost" }
```

### Admin Endpoints

#### Ressourcen anpassen
```
POST /api/admin/resources
{ "groupId": "red", "resource": "wood", "value": 50 }
```

#### Territorium-Besitzer ändern
```
POST /api/admin/territory
{ "territoryId": "5", "owner": "red" }
```

#### Gebäude hinzufügen/entfernen
```
POST /api/admin/building
{ "territoryId": "5", "action": "add", "buildingType": "castle" }
{ "territoryId": "5", "action": "remove", "index": 0 }
```

#### Würfeln (manuell)
```
POST /api/admin/dice
{ "value": 8 }  // optional; zufällig wenn nicht angegeben
```

#### Auto-Dice konfigurieren
```
POST /api/admin/dice-config
{ "autoDice": true, "intervalMinutes": 20 }
```

#### Spiel zurücksetzen
```
POST /api/admin/reset
```

---

## 🔑 Secret Codes ändern

Bearbeite `gameState.js` **VOR dem ersten Start:**

```javascript
const ADMIN_CODE = 'MEIN-ADMIN-CODE';
const GROUP_CODES = {
  red:    'GRUPPE-ROT-CODE',
  blue:   'GRUPPE-BLAU-CODE',
  // ...
};
```

Codes sind dann für die Dauer des Spiels fixiert. Sie ändern sich nicht.

---

## 🖥 Deploying

### Lokal (Entwicklung)
```bash
npm start
# http://localhost:3000
```

### VPS / Production (mit PM2)
```bash
npm install -g pm2
pm2 start server.js --name habsburger
pm2 save
pm2 startup
```

Nginx-Reverse-Proxy (Empfohlen):
```nginx
server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

---

## 📊 Datenspeicherung

**Datei:** `db.json` (im Root-Verzeichnis)

- Speichert alle Territorien, Ressourcen, Gebäude, Events
- Wird nach jedem API-Call aktualisiert
- Überlebt Server-Neustarts
- Manuell editierbar (JSON-Format)

---

## 🐛 Troubleshooting

### Codes nicht korrekt?
→ `gameState.js` prüfen, Server neu starten

### Admin-Panel nicht sichtbar?
→ Mit Admin-Code (`HABSBURG-ADMIN-2025`) anmelden

### Ressourcen-Updates bei anderen Spielern nicht sichtbar?
→ Frontend polled alle 3 Sekunden. Browser-Cache evtl. leeren.

### Port 3000 schon in Benutzung?
```bash
PORT=3001 npm start
```

---

## 📝 Lizenz

ISC

---

**Genießt das Spiel!** 🏰⚜️
