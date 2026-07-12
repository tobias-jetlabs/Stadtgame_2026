# 🎛️ Habsburger Stadtgame – Admin-Anleitung

Kompletter Guide für Spielleiter/Administrator.

---

## 📋 Vor dem Spiel

### 1. Secret Codes anpassen (OPTIONAL)

Bearbeite `gameState.js` vor dem **ersten Start:**

```javascript
const ADMIN_CODE = 'FPU6-ZHZQ';  // ← Dein Admin-Passwort
const GROUP_CODES = {
  uri:         '72TT-47GU',          // Gruppe 1
  schwyz:      '7CWB-CK5V',       // Gruppe 2
  unterwalden: 'TN92-3ZGE',  // Gruppe 3
  luzern:      'E5B6-DDRC',       // Gruppe 4
};
```

**Wichtig:** Nach dem Start bleiben die Codes für die gesamte Spiel-Session unverändert.

### 2. Startwerte überprüfen

In `gameState.js`:
```javascript
groups: {
  uri: { 
    name: 'Uri', 
    resources: { wood: 20, stone: 10, iron: 5 },  // ← Startressourcen
    points: 0,
    joined: false
  },
  // ...
}
```

Ändern → Server neu starten.

---

## 🚀 Spielstart

### Server starten
```bash
npm start
```
→ Console zeigt alle Codes

### Spieler beitreten lassen
- Jede Gruppe gibt ihren Code im Browser ein
- Login-Screen → Geheimcode → ▶ Beitreten
- Spielfeld wird sichtbar

### Du (Admin) anmelden
```
Code eingeben: FPU6-ZHZQ
```

→ Admin-Panel (Reiter "⚙ Admin") wird sichtbar

---

## ⚙️ Admin-Panel

Fünf Hauptbereiche:

### 1️⃣ WÜRFELKONFIGURATION

**Auto-Dice Aktivieren/Deaktivieren:**
- Toggle "Automatisches Würfeln" 
- Interval in Minuten (1–120)
- "Speichern" klicken

**Manuell würfeln:**
- Zahl eingeben (2–12) oder leer lassen (zufällig)
- Button "🎲 Würfeln"
- Ressourcen werden sofort verteilt

---

### 2️⃣ RESSOURCEN BEARBEITEN

Pro Gruppe drei Eingabefelder für:
- 🪵 Holz
- 🪨 Stein
- ⚙️ Eisen

**Ablauf:**
1. Zahlen eingeben
2. "Speichern" klicken
3. Alle Spieler sehen sofort die neuen Werte (für alle Gruppen sichtbar)

**Usecase:** Initialisierung, Sanktionen, Fehlerkorrektur

---

### 3️⃣ BAUTEN VERWALTEN

Freies Hinzufügen/Entfernen von Bauten, **ohne** Kosten und **ohne** Besitzprüfung — dein direkter
Eingriff, unabhängig von dem, was Spieler per Drag & Drop dürfen.

**Hinzufügen:**
1. Bautentyp wählen (Turm/Stützpunkt/Burg) — die Standort-Auswahl daneben passt sich automatisch an
   (nur Gebiete für Turm, nur freie Kanten für Stützpunkt, nur freie 3er-Ecken für Burg)
2. Standort wählen (nur noch unbesetzte Standorte werden angezeigt)
3. Besitzer-Gruppe wählen
4. "Hinzufügen" klicken

**Entfernen:** Auf eine Baute in der Liste darunter klicken (✕).

**Wichtig:** Baute-Besitz ist unabhängig vom Gebietsbesitz. Wenn du einer anderen Gruppe ein Gebiet
zuweist, bleiben die bereits dort/daran stehenden Bauten beim ursprünglichen Besitzer — sie wechseln
nicht automatisch mit.

---

### 4️⃣ TERRITORIEN VERWALTEN

**Tabelle mit allen 24 Territorien:**

Spalten: | # | Name | Ressource | Zahl | Besitzer |

**Besitzer ändern:**
- Dropdown "Besitzer" klicken
- Gruppe wählen oder "Niemand"
- Territory wird sofort neu eingefärbt
- **Wichtig:** Nur der Admin vergibt Gebietsbesitz. Spieler können sich kein Gebiet selbst nehmen — erst wenn du hier eine Gruppe zuweist, darf diese Gruppe dort im Spieler-Tab bauen.

**Beispiel: Uri soll Territorium 5 bekommen**
1. Dropdown "Besitzer" auf "Uri" setzen
2. Uri kann nun einen Turm auf Territorium 5 bauen (oder einen Stützpunkt/eine Burg, sobald auch die
   Nachbargebiete Uri gehören)
3. Nächster Würfelwurf: Uri bekommt +1 Stein pro dort stehender Baute (falls Zahl 4)

---

### 5️⃣ SCHNELLAKTIONEN

- **🎲 Zufälliger Würfelwurf** → zufällig 2–12
- **🔄 Spiel zurücksetzen** → ACHTUNG: Alle Daten weg! Doppelte Bestätigung

---

## 🎮 Während des Spiels

### Typischer Ablauf

1. **Auto-Würfeln läuft** (wenn aktiviert)
   - Alle 15 Min (konfigurierbar) automatischer Wurf
   - Ressourcen verteilt sich automatisch
   - Event-Log zeigt: "🎲 Würfelwurf: 6. Uri: +2 Holz"

2. **Spieler bauen**
   - Spieler ziehen eine Baute aus der Seitenleiste auf einen markierten Standort auf der Karte
   - Admin sieht sofort in der Karte die neuen Bauten

3. **Admin kann eingreifen**
   - Ressourcen anpassen
   - Bauten hinzufügen/entfernen
   - Territory umowned

4. **Würfel manuell (wenn nötig)**
   - Auto-Dice temporär ausschalten
   - Oder einfach manuellen Wurf triggern

---

## 🔍 Monitoring

### Event-Log lesen
Rechts im Spielfeld-Tab, "📜 Ereignisse":
```
14:15  🏗 Uri hat Turm bei Marktplatz gebaut.
14:18  🎲 Würfelwurf: 8. Schwyz: +3 Holz
14:20  🔧 Admin: Luzern → Stein = 25
```

### Live-Rangliste
"⚔ Rangliste" zeigt aktuelle Punkte aller Gruppen

### Ressourcen überprüfen
Ressourcen aller Gruppen sind für Admin **und** alle Spieler als exakte Zahlen sichtbar.

---

## ⚠️ Häufige Szenarien

### "Uri hat nicht genug Ressourcen zum Bauen"
**Lösung:**
1. Admin-Panel → Ressourcen-Bereich
2. Bei Uri "Holz" auf 50 setzen
3. "Speichern"
4. Spieler kann jetzt bauen

### "Würfel läuft nicht"
**Überprüfen:**
1. Toggle "Automatisches Würfeln" ist ON?
2. Interval > 0?
3. Server läuft noch?

### "Gruppe hat Gebiet ohne Baute"
**Manuell korrigieren:**
1. Territorium in Tabelle finden
2. Besitzer-Dropdown auf andere Gruppe setzen
3. Oder: Im Bauten-Bereich eine passende Baute hinzufügen, dann kommt die Produktion beim nächsten Würfelwurf

### "Spiel kaputt – komplett zurücksetzen"
1. Admin-Panel → Schnellaktionen
2. "🔄 Spiel zurücksetzen"
3. Doppelte Bestätigung
4. **Alle Daten weg!** Spieler müssen neu beitreten (selbe Codes)

---

## 🛡️ Sicherheit & Best Practices

### Codes schützen
- Admin-Code niemandem geben (außer Co-Admins)
- Gruppen-Codes müssen geheim bleiben
- Falls kompromittiert: Codes in `gameState.js` ändern + Server neu starten

### Datensicherung
- `db.json` sichern vor wichtigen Events
```bash
cp db.json db.json.backup-$(date +%s)
```

### Mehrere Admins?
→ Für jetzt: Alle teilen sich denselben Admin-Code (nicht ideal, aber funktioniert)

---

## 🔧 Technische Details

### Wenn Server abbricht
- **Daten:** Alle in `db.json` gespeichert (überlebt Neustart)
- **Sessions:** Spieler müssen nicht neu anmelden (Cookies bleiben)
- **Auto-Dice:** Wird beim Start neu gestartet

### Ports ändern
Standardport ist 3001. Die App läuft immer unter dem Pfad `/stadtgame`.
```bash
PORT=8080 npm start
```

### Logs ansehen
Terminal zeigt:
```
[DB] Loaded game state from disk.
🎲 Würfelwurf: 6. Uri: +2 Holz
🔧 Admin: Uri → Stein = 50
```

---

## ❓ FAQ

**F: Können Spieler die Codes sehen?**
A: Nein. Nur Admin sieht die Codes im Admin-Panel.

**F: Sind die Codes fix?**
A: Ja! Einmal im Spiel, ändern sie nicht mehr (bis Neustart).

**F: Kann ich während des Spiels Codes ändern?**
A: Nein. `gameState.js` muss vor dem Start editiert werden. Danach Server neu starten.

**F: Was passiert bei Auto-Dice Interval 0?**
A: Auto-Dice pausiert. Nur manuelle Würfe funktionieren.

**F: Wie viele Gruppen sind möglich?**
A: Im Default: 4 (Uri, Schwyz, Unterwalden, Luzern). Mehr im Code hinzufügbar.

**F: Sehen Spieler die Ressourcen anderer Gruppen?**
A: Ja, alle Ressourcen aller Gruppen sind für jeden sichtbar (Rangliste).

**F: Können Spieler sich selbst ein Gebiet nehmen?**
A: Nein. Nur der Admin vergibt Gebietsbesitz (Territorien-Tabelle). Spieler dürfen dann auf ihren zugewiesenen, noch unbebauten Gebieten/Kanten/Ecken selbst bauen.

**F: Was passiert mit Bauten, wenn ein Gebiet den Besitzer wechselt?**
A: Nichts — Bauten behalten immer ihren ursprünglichen Besitzer, unabhängig davon, wem das Gebiet
gerade gehört. Das Anfechten ("Challenge") von Bauten-Besitz ist als spätere Erweiterung geplant,
aktuell aber nicht möglich.

---

**Happy Game Mastering!** 🏰⚜️
