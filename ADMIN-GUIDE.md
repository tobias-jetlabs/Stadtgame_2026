# 🎛️ Habsburger Stadtgame – Admin-Anleitung

Kompletter Guide für Spielleiter/Administrator.

---

## 📋 Vor dem Spiel

### 1. Secret Codes anpassen (OPTIONAL)

Bearbeite `gameState.js` vor dem **ersten Start:**

```javascript
const ADMIN_CODE = 'HABSBURG-ADMIN-2025';  // ← Dein Admin-Passwort
const GROUP_CODES = {
  red:    'ROT-ADLER-77',      // Gruppe 1
  blue:   'BLAU-WELLE-42',     // Gruppe 2
  green:  'GRUEN-EICHE-13',    // Gruppe 3
  yellow: 'GELB-SONNE-88',     // Gruppe 4
  purple: 'LILA-BURG-55',      // Gruppe 5
  orange: 'ORANGE-WOLF-31',    // Gruppe 6
};
```

**Wichtig:** Nach dem Start bleiben die Codes für die gesamte Spiel-Session unverändert.

### 2. Startwerte überprüfen

In `gameState.js`:
```javascript
groups: {
  red: { 
    name: 'Gruppe Rot', 
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
Code eingeben: HABSBURG-ADMIN-2025
```

→ Admin-Panel (Reiter "⚙ Admin") wird sichtbar

---

## ⚙️ Admin-Panel

Vier Hauptbereiche:

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
3. Alle Spieler sehen sofort die neuen Werte (außer andere Gruppen sehen "?")

**Usecase:** Initialisierung, Sanktionen, Fehlerkorrektur

---

### 3️⃣ TERRITORIEN & GEBÄUDE VERWALTEN

**Große Tabelle mit allen 24 Territorien:**

Spalten:
| # | Name | Ressource | Zahl | Besitzer | Gebäude | Hinzufügen |

**Besitzer ändern:**
- Dropdown "Besitzer" klicken
- Gruppe wählen oder "Niemand"
- Territory wird sofort neu eingefärbt

**Gebäude verwalten:**
- Bestehende Gebäude: Tag anklicken → entfernt
- Neues Gebäude: "Gebäude" Dropdown → Typ wählen

**Beispiel: Gruppe Rot kontrolliert Territorium 5**
1. Dropdown "Besitzer" auf "Gruppe Rot"
2. Tab "Vorposten" hinzufügen
3. Nächster Würfelwurf: Gruppe Rot bekam +1 Stein (falls Zahl 4)

---

### 4️⃣ SCHNELLAKTIONEN

- **🎲 Zufälliger Würfelwurf** → zufällig 2–12
- **🔄 Spiel zurücksetzen** → ACHTUNG: Alle Daten weg! Doppelte Bestätigung

---

## 🎮 Während des Spiels

### Typischer Ablauf

1. **Auto-Würfeln läuft** (wenn aktiviert)
   - Alle 15 Min (konfigurierbar) automatischer Wurf
   - Ressourcen verteilt sich automatisch
   - Event-Log zeigt: "🎲 Würfelwurf: 6. Gruppe Rot: +2 Holz"

2. **Spieler bauen**
   - Spieler wählen Territorium → Gebäude-Typ
   - Admin sieht sofort in der Karte die neuen Gebäude

3. **Admin kann eingreifen**
   - Ressourcen anpassen
   - Gebäude hinzufügen/entfernen
   - Territory umowned

4. **Würfel manuell (wenn nötig)**
   - Auto-Dice temporär ausschalten
   - Oder einfach manuellen Wurf triggern

---

## 🔍 Monitoring

### Event-Log lesen
Rechts im Spielfeld-Tab, "📜 Ereignisse":
```
14:15  🏗 Gruppe Rot hat in Marktplatz einen/eine Vorposten gebaut.
14:18  🎲 Würfelwurf: 8. Gruppe Blau: +3 Holz
14:20  🔧 Admin: Gruppe Gelb → Stein = 25
```

### Live-Rangliste
"⚔ Rangliste" zeigt aktuelle Punkte aller Gruppen

### Ressourcen überprüfen
Admin sieht **exakte** Zahlen (nicht "?")

---

## ⚠️ Häufige Szenarien

### "Gruppe Rot hat nicht genug Ressourcen zum Bauen"
**Lösung:**
1. Admin-Panel → Ressourcen-Bereich
2. Bei Gruppe Rot "Holz" auf 50 setzen
3. "Speichern"
4. Spieler kann jetzt bauen

### "Würfel läuft nicht"
**Überprüfen:**
1. Toggle "Automatisches Würfeln" ist ON?
2. Interval > 0?
3. Server läuft noch?

### "Gruppe hat Territory ohne Gebäude"
**Manuell korrigieren:**
1. Territorium in Tabelle finden
2. Besitzer-Dropdown auf andere Gruppe setzen
3. Oder: Gebäude hinzufügen, dann kommt die Produktion beim nächsten Würfelwurf

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
```bash
PORT=8080 npm start
```

### Logs ansehen
Terminal zeigt:
```
[DB] Loaded game state from disk.
🎲 Würfelwurf: 6. Gruppe Rot: +2 Holz
🔧 Admin: Gruppe Rot → Stein = 50
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
A: Im Default: 6 (rot, blau, grün, gelb, lila, orange). Mehr im Code hinzufügbar.

**F: Spieler sehen "?" bei anderen Ressourcen — absicht?**
A: Ja! Geheimnis halten. Nur Admin und die Gruppe selbst sehen echte Zahlen.

---

**Happy Game Mastering!** 🏰⚜️
