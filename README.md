# 🏰 Habsburger Stadtgame 2.0

Echtzeit-Strategiespiel für Altdorf mit **Admin-Kontrollzentrum** und **Spielerclients**.

## ⚡ Schnellstart

```bash
# Abhängigkeiten installieren
npm install

# Server starten
npm start
# → http://localhost:3001/stadtgame
```

Browser öffnen, Secret Code eingeben → Spielfeld sehen!

---

## 🔐 Secret Codes (im `gameState.js` definiert)

### Admin (hat vollständige Kontrolle)
```
FPU6-ZHZQ
```

### Gruppen (pro Gruppe unterschiedlich)
```
uri:          72TT-47GU
schwyz:       7CWB-CK5V
unterwalden:  TN92-3ZGE
luzern:       E5B6-DDRC
```

**Diese Codes sind persistent** — sie ändern sich nicht während des Spiels.

---

## 👥 Rollen & Rechte

### 🎮 SPIELER
- ✅ Spielfeld ansehen (live mit anderen Spielern)
- ✅ Ressourcen aller Gruppen sehen (Holz, Stein, Eisen)
- ✅ Bauten per Drag & Drop aus der Seitenleiste auf die Karte ziehen (nur auf Standorte, deren Gebiete komplett der eigenen Gruppe gehören, und wenn Ressourcen reichen)
- ❌ Territorien selbst beanspruchen (Besitz vergibt nur der Admin)
- ❌ Territorien erobern / übertragen
- ❌ Würfeln
- ❌ Konfiguration ändern

### ⚙️ ADMINISTRATOR
- ✅ **Alle** Ressourcen aller Gruppen anpassen (live, direkt pro Feld)
- ✅ Territorium-Besitzer ändern
- ✅ Bauten frei hinzufügen/entfernen/Besitzer ändern (ohne Kosten, ohne Besitzprüfung)
- ✅ Würfeln manuell oder automatisch
- ✅ Auto-Dice Interval konfigurieren (1–120 Min)
- ✅ Komplettes Spiel zurücksetzen
- ✅ Secret Codes anschauen
- ✅ Event-Log einsehen

---

## 🗺 Spielfeld (24 Territorien)

**Layout:** 4–5–6–5–4 Hex-Ringe

### Ressourcentypen
- **Holz** (🪵) – 10 Felder, Innen-/Mittelringe (häufig)
- **Stein** (🪨) – 8 Felder, Mittelringe (häufig)
- **Eisen** (⚙️) – 6 Felder, ausschliesslich am Spielfeldrand (seltener)

Alle 24 Territorien sind gleichwertig — es gibt kein Sonderfeld/keine Hauptstadt.

---

## 🏗 Bauten & Standorte

| Typ | Kosten | VP | Standort | Besitzbedingung |
|---|---|---|---|---|
| **Turm** | 5🪵 + 10🪨 | 1 | Mitte eines Gebiets | Gebiet muss der Gruppe gehören |
| **Stützpunkt** | 10🪵 + 25🪨 | 2 | Auf der Grenze zwischen 2 Gebieten | Beide Gebiete müssen der Gruppe gehören |
| **Burg** | 20🪵 + 50🪨 + 10⚙️ | 5 | Am Kreuzungspunkt von 3 Gebieten | Alle 3 Gebiete müssen der Gruppe gehören |

Jeder Standort (ein Gebiet, eine Kante, eine Ecke) kann nur **eine** Baute tragen. Die Standort-Id im
`/api/build`-Aufruf ist die aufsteigend sortierte, mit `-` verbundene Liste der betroffenen
Gebiets-Ids — z.B. `"5"` für einen Turm, `"5-9"` für einen Stützpunkt, `"1-2-5"` für eine Burg.

**Besitz von Bauten ist unabhängig vom Gebietsbesitz:** Ändert sich der Besitzer eines Gebiets (z.B.
durch den Admin), behalten die dort/daran stehenden Bauten weiterhin ihren ursprünglichen Besitzer.
Ein "Challenge"-Mechanismus, um Bauten-Besitz anzufechten, ist als spätere Erweiterung vorgesehen,
aber aktuell **nicht implementiert**.

---

## 🎲 Würfel-System

### Automatisches Würfeln (Admin-Steuerung)
- **Interval konfigurierbar:** 1–120 Minuten (default: 15 Min)
- **Auto-Toggle:** Admin kann An/Aus-schalten
- **Manuelles Würfeln:** Admin kann jederzeit manuell würfeln (2–12 oder zufällig)

### Ressourcen-Produktion
Wenn die Würfelzahl fällt:
- Für jede Baute wird pro angrenzendem Gebiet mit passender Zahl 1 Ressource an den **Besitzer der
  Baute** ausgeschüttet (nicht an den aktuellen Gebietsbesitzer)
- Ein Stützpunkt/eine Burg kann so pro Wurf aus mehreren Gebieten gleichzeitig produzieren
- Beispiel: Eine Burg an einer Ecke mit Holz-Gebiet (Zahl 8) + Stein-Gebiet (Zahl 8) → bei einer 8
  gibt es +1 Holz UND +1 Stein für die Burg-Besitzerin

---

## 🌐 API

Basis-Pfad: `/stadtgame` (z.B. `https://raspberry-pi-server.taila81f99.ts.net/stadtgame`)
Alle Requests brauchen Header: `x-auth-code: <SECRET>`

### Public Endpoints

#### Login / Identifizierung
```
POST /stadtgame/api/auth
{ "code": "72TT-47GU" }
→ { role: "player", groupId: "uri", name: "Uri" }
```

#### Spielfeld abrufen
```
GET /stadtgame/api/game
→ Vollständiger Spielstatus (Territorien, Gruppen, Ressourcen, Events)
```

### Player Endpoints

#### Baute errichten
```
POST /stadtgame/api/build
{ "buildingType": "turm", "locationId": "5" }
{ "buildingType": "stuetzpunkt", "locationId": "5-9" }
{ "buildingType": "burg", "locationId": "1-2-5" }
```
Funktioniert nur, wenn alle in `locationId` genannten Gebiete der eigenen Gruppe gehören, dort noch
keine Baute steht und genug Ressourcen vorhanden sind.

### Admin Endpoints

#### Ressourcen anpassen
```
POST /stadtgame/api/admin/resources
{ "groupId": "uri", "resource": "wood", "value": 50 }
```

#### Territorium-Besitzer ändern
```
POST /stadtgame/api/admin/territory
{ "territoryId": "5", "owner": "uri" }
```

#### Baute hinzufügen/entfernen/Besitzer ändern (kostenlos, ohne Besitzprüfung)
```
POST /stadtgame/api/admin/building
{ "action": "add", "buildingType": "burg", "locationId": "1-2-5", "owner": "uri" }
{ "action": "remove", "structureId": "1735689600000-abcde" }
{ "action": "transfer", "structureId": "1735689600000-abcde", "owner": "schwyz" }
```

#### Würfeln (manuell)
```
POST /stadtgame/api/admin/dice
{ "value": 8 }  // optional; zufällig wenn nicht angegeben
```

#### Auto-Dice konfigurieren
```
POST /stadtgame/api/admin/dice-config
{ "autoDice": true, "intervalMinutes": 20 }
```

#### Spiel zurücksetzen
```
POST /stadtgame/api/admin/reset
```

---

## 🔑 Secret Codes ändern

Bearbeite `gameState.js` **VOR dem ersten Start:**

```javascript
const ADMIN_CODE = 'MEIN-ADMIN-CODE';
const GROUP_CODES = {
  uri:    'GRUPPE-URI-CODE',
  schwyz: 'GRUPPE-SCHWYZ-CODE',
  // ...
};
```

Codes sind dann für die Dauer des Spiels fixiert. Sie ändern sich nicht.

---

## 🖥 Deploying

### Lokal (Entwicklung)
```bash
npm start
# http://localhost:3001/stadtgame
```

### VPS / Production (mit PM2)
```bash
npm install -g pm2
pm2 start server.js --name habsburger
pm2 save
pm2 startup
```

Der Server hört auf Port 3001 und stellt die gesamte App (Frontend + API) unter
dem Pfad `/stadtgame` bereit — z.B. `https://raspberry-pi-server.taila81f99.ts.net/stadtgame`.

Nginx-Reverse-Proxy (Empfohlen):
```nginx
server {
  listen 80;
  server_name raspberry-pi-server.taila81f99.ts.net;

  location /stadtgame {
    proxy_pass http://localhost:3001;
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
→ Mit Admin-Code (`FPU6-ZHZQ`) anmelden

### Ressourcen-Updates bei anderen Spielern nicht sichtbar?
→ Frontend polled alle 3 Sekunden. Browser-Cache evtl. leeren.

### Port 3001 schon in Benutzung?
```bash
PORT=4000 npm start
```

---

## 📝 Lizenz

ISC

---

**Genießt das Spiel!** 🏰⚜️
