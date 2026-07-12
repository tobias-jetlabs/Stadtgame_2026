# 🎮 Habsburger Stadtgame – Spieler-Anleitung

Leitfaden für Spieler/Gruppen.

---

## 🔐 Anmelden

1. **Browser öffnen:** `https://raspberry-pi-server.taila81f99.ts.net/stadtgame` (oder die Server-Adresse)
2. **Geheimcode eingeben** (eine pro Gruppe)
3. **"▶ Beitreten" klicken**
4. ✅ Spielfeld wird sichtbar

Dein Code bleibt für die **gesamte Spiel-Session** gleich. Merke ihn dir!

---

## 🗺 Spielfeld verstehen

### Territorium-Typen (Farben & Ressourcen)

| Ressource | Farbe | Häufigkeit | Felder |
|---|---|---|---|
| **Holz** 🪵 | Braun | Am häufigsten | 10 |
| **Stein** 🪨 | Grau | Häufig | 8 |
| **Eisen** ⚙️ | Dunkelblau | Am seltensten, nur am Spielfeldrand | 6 |

**Habsburg Burg** (Territorium 24 – unten rechts):
- Die Hauptstadt 👑
- **10 Siegpunkte** für die Gruppe, die sie kontrolliert!
- Am schwierigsten zu erobern

### Die Würfelzahl
Oben rechts jedes Territoriums eine Zahl (2–12).

**Wenn diese Zahl gewürfelt wird:**
→ Alle Territorien mit dieser Zahl produzieren Ressourcen
→ Jedes deiner Gebäude auf diesen Territorien = +1 Ressource

**Beispiel:**
- Territorium 8 (Holz, Zahl 6)
- Du hast dort 1 Vorposten
- Würfel zeigt 6
- Du bekommst +1 Holz 🪵

---

## 💰 Ressourcen

Du startest mit:
- **20 × Holz** 🪵
- **10 × Stein** 🪨
- **5 × Eisen** ⚙️

### Ressourcen bekommen

1. **Durch Würfeln** (Auto oder manuell durch Admin)
   - Zahl fällt → alle Territorien mit dieser Zahl produzieren
   - 1 Gebäude = 1 Ressource

2. **Handel** (optional – mit anderen Gruppen abmachen)

### Ressourcen sehen

Alle Ressourcen aller Gruppen sind für jeden sichtbar (Rangliste).

---

## 🏗 Gebäude bauen

### Verfügbare Gebäude

| Gebäude | Kosten | Punkte | Effekt |
|---|---|---|---|
| **Vorposten** 🏠 | 5🪵 + 2🪨 | +1 | Basis-Kontrolle |
| **Turm** 🗼 | 3🪵 + 5🪨 + 1⚙️ | +2 | Bessere Verteidigung |
| **Burg** 🏰 | 8🪵 + 8🪨 + 3⚙️ | +5 | Maximum-Kontrolle |

### Bauen – Schritt für Schritt

1. **Territorium wählen**
   - Im Dropdown "Gebiet wählen" erscheinen nur Gebiete, die dir der Admin bereits zugewiesen hat und auf denen noch kein Gebäude steht

2. **Gebäude-Typ wählen**
   - 🏠 Vorposten, 🗼 Turm, oder 🏰 Burg

3. **Ressourcen check**
   - Hast du genug?
   - Falls nicht: Warten bis nächster Würfelwurf

4. **"Bauen" klicken**
   - Ressourcen werden abgezogen
   - Gebäude erscheint auf der Karte

### Regeln für Bauen

- **Besitz vergibt nur der Admin:** Du kannst dir kein Gebiet selbst nehmen
- **1 Gebäude pro Gebiet:** Sobald eines steht, ist der Platz belegt
- Bauen geht nur auf Gebieten, die bereits deiner Gruppe gehören

---

## 🎯 Siegpunkte & Gewinnen

**Punkte sammeln durch:**
- Vorposten: 1 Punkt
- Turm: 2 Punkte
- Burg: 5 Punkte
- **Habsburg Burg kontrollieren: 10 Punkte** 👑

**Wer hat am meisten Punkte am Ende?** → Der Sieger! 🏆

---

## 🎲 Würfelwurf

**Oben rechts im Header:**
```
Letzter Wurf: 6
Nächster in: 12:45
```

### Automatisches Würfeln
- Findet alle 15 Minuten statt (Admin kann Interval ändern)
- Du musst nichts tun → Ressourcen erscheinen automatisch

### Nach einem Wurf
- Alle Territorien mit dieser Zahl produzieren
- Deine Gebäude auf diesen Territorien → +Ressource
- Event-Log zeigt: "🎲 Würfelwurf: 6. Gruppe Rot: +2 Holz"

---

## 📊 Rangliste

Oben rechts: **"⚔ Rangliste"**

Zeigt alle Gruppen mit:
- 🎯 Aktuelle Siegpunkte
- 🪵 Holz, 🪨 Stein, ⚙️ Eisen (für alle Gruppen sichtbar)

---

## 📜 Ereignis-Log

Unten rechts: **"📜 Ereignisse"**

Zeigt die letzten 40 Aktionen:
```
14:15  🏗 Gruppe Rot hat in Marktplatz einen Vorposten gebaut.
14:18  🎲 Würfelwurf: 8. Gruppe Blau: +3 Holz
14:22  ⚔️ Gruppe Grün hat Territorium 7 von Gruppe Rot erobert!
```

---

## 💡 Strategietipps

### 1. Früh expandieren
→ Viele Vorposten bauen, um früh Ressourcen zu sichern

### 2. Häufige Zahlen priorisieren
→ Territorien mit Zahlen 6, 8, 9, 5 sind produktiver

### 3. Holz vorrat
→ Holz brauchen alle Gebäude. Lager aufstocken!

### 4. Zusammenhängende Territorien
→ Deine Territorien sollten sich berühren (sieht besser aus, ist strategischer)

### 5. Die Burg anvisieren
→ Habsburg Burg (👑 Territorium 24) = 10 Punkte + Ansehen!

---

## ⚠️ Fehler & Troubleshooting

### "Nicht genug Ressourcen"
→ Warten bis nächster Würfelwurf oder Handel mit anderen Gruppen

### "Auf diesem Gebiet steht bereits ein Gebäude"
→ Pro Gebiet ist nur 1 Gebäude möglich

### "Dieses Gebiet gehört dir nicht"
→ Frag den Admin, dir das Gebiet zuzuweisen, bevor du dort baust

### "Würfel läuft nicht"
→ Frag Admin nach! Evtl. Auto-Dice ist deaktiviert

### "Mein Code ist falsch"
→ Prüf Großbuchstaben/Bindestriche! Codes sind case-sensitive.

---

## 🏆 Endgame

Wenn der Spielleiter "Ende!" ruft:

1. Wer hat die meisten Siegpunkte?
2. Diese Gruppe gewinnt! 🏰

**Bonus:** Wer die **Habsburger Burg** kontrolliert, hat Ehrenplatz!

---

**Viel Erfolg! Möge der beste Strategist siegen.** ⚜️
