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

### Die Würfelzahl
Oben rechts jedes Territoriums eine Zahl (2–12).

**Wenn diese Zahl gewürfelt wird:**
→ Alle Territorien mit dieser Zahl produzieren Ressourcen
→ Jede deiner Bauten, die an einem dieser Territorien liegt, bringt dir +1 Ressource

**Beispiel:**
- Du hast einen Stützpunkt zwischen einem Holz-Gebiet (Zahl 6) und einem Stein-Gebiet (auch Zahl 6)
- Würfel zeigt 6
- Du bekommst +1 Holz UND +1 Stein (eine Ressource pro angrenzendem Gebiet mit passender Zahl)

---

## 💰 Ressourcen

Du startest mit:
- **20 × Holz** 🪵
- **10 × Stein** 🪨
- **5 × Eisen** ⚙️

### Ressourcen bekommen

1. **Durch Würfeln** (Auto oder manuell durch Admin)
   - Zahl fällt → alle Territorien mit dieser Zahl produzieren
   - Pro angrenzendem Territorium mit passender Zahl = 1 Ressource für die Baute

2. **Handel** (optional – mit anderen Gruppen abmachen)

### Ressourcen sehen

Alle Ressourcen aller Gruppen sind für jeden sichtbar (Rangliste).

---

## 🏗 Bauten errichten

### Verfügbare Bauten

| Baute | Kosten | Punkte | Standort |
|---|---|---|---|
| **Turm** | 5🪵 + 10🪨 | +1 | Mitte eines Gebiets |
| **Stützpunkt** | 10🪵 + 25🪨 | +2 | Grenze zwischen 2 Gebieten |
| **Burg** | 20🪵 + 50🪨 + 10⚙️ | +5 | Kreuzungspunkt von 3 Gebieten |

### Bauen – Schritt für Schritt

1. **Baute in der Seitenleiste anfassen** ("⚒ Bauen")
   - Turm, Stützpunkt oder Burg — je nachdem, welche Ressourcen du hast und wo du bauen willst

2. **Auf die Karte ziehen**
   - Während du ziehst, werden **alle** möglichen Standorte für diese Baute als Punkte markiert:
     goldene Punkte sind für dich erlaubt, rötliche Punkte sind (noch) nicht erlaubt (z.B. weil dir
     eines der Gebiete nicht gehört, oder weil dort schon eine Baute steht)
   - Ein Turm braucht 1 eigenes Gebiet, ein Stützpunkt 2 aneinandergrenzende eigene Gebiete, eine Burg 3 Gebiete, die sich an einer Ecke berühren — **alle** beteiligten Gebiete müssen dir gehören

3. **Über einem markierten Punkt loslassen**
   - Der Punkt leuchtet auf, wenn du nah genug bist
   - Loslassen über einem goldenen Punkt baut sofort
   - Loslassen über einem rötlichen Punkt baut nicht, zeigt dir aber genau den Grund an (z.B. "Du besitzt nicht alle für diese Baute nötigen Gebiete.")
   - Loslassen außerhalb jedes Punkts bricht den Bauvorgang ab, ohne etwas zu kosten

4. **Fertig**
   - Ressourcen werden abgezogen, die Baute erscheint sofort auf der Karte

### Regeln für Bauen

- **Besitz vergibt nur der Admin:** Du kannst dir kein Gebiet selbst nehmen
- **1 Baute pro Standort:** Ist eine Stelle (Gebietsmitte, Kante, Ecke) belegt, kann dort nichts mehr gebaut werden
- Für jede Baute müssen **alle** beteiligten Gebiete deiner Gruppe gehören
- **Wichtig:** Wechselt später der Besitzer eines Gebiets, bleiben bereits gebaute Bauten trotzdem bei ihrem ursprünglichen Besitzer — sie wechseln nicht automatisch mit

---

## 🎯 Siegpunkte & Gewinnen

**Punkte sammeln durch:**
- Turm: 1 Punkt
- Stützpunkt: 2 Punkte
- Burg: 5 Punkte

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
- Deine Bauten an diesen Territorien → +Ressource
- Event-Log zeigt: "🎲 Würfelwurf: 6. Uri: +2 Holz"

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
14:15  🏗 Uri hat Turm bei Marktplatz gebaut.
14:18  🎲 Würfelwurf: 8. Schwyz: +3 Holz
14:22  ⚔️ Unterwalden hat Territorium 7 von Uri erobert!
```

---

## 💡 Strategietipps

### 1. Früh expandieren
→ Viele Türme bauen, um früh Ressourcen zu sichern (billigste Baute)

### 2. Häufige Zahlen priorisieren
→ Territorien mit Zahlen 6, 8, 9, 5 sind produktiver

### 3. Stein-Vorrat
→ Alle Bauten brauchen viel Stein, Stützpunkt und Burg besonders. Lager aufstocken!

### 4. Zusammenhängende Territorien
→ Nur wenn deine Gebiete aneinandergrenzen, kannst du Stützpunkte und Burgen bauen — plane deine Gebietswünsche beim Admin entsprechend

---

## ⚠️ Fehler & Troubleshooting

### "Nicht genug Ressourcen"
→ Warten bis nächster Würfelwurf oder Handel mit anderen Gruppen

### "Dort steht bereits eine Baute"
→ Pro Standort (Gebietsmitte, Kante, Ecke) ist nur 1 Baute möglich

### "Du besitzt nicht alle für diese Baute nötigen Gebiete"
→ Frag den Admin, dir die fehlenden Gebiete zuzuweisen, bevor du dort baust

### Nur rötliche Punkte beim Ziehen sichtbar, keine goldenen
→ Du besitzt noch keine passenden Gebiete für diese Baute (bzw. bei Stützpunkt/Burg: keine zwei/drei zusammenhängenden eigenen Gebiete). Frag den Admin nach den fehlenden Gebieten.

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
