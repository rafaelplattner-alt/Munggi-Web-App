# Munggi-App – Mesh über LoRa (Meshtastic), Stand T260 (2026-09-23)

Roadmap Stufe 2: Standorte und Kurzmeldungen über Kilometer und mehrere Funk-Hops, ohne Mobilfunk, ohne
WLAN-Reichweite. Jeder Teilnehmer trägt ein Meshtastic-Gerät (Referenz: **Heltec WiFi LoRa 32 V3**); die
Geräte bilden untereinander das Funk-Mesh. Die Munggi-App spricht nur mit dem **eigenen** Gerät.

## 1. Gerät einmalig einrichten (mit der Meshtastic-App, nicht mit Munggi)

1. Aktuelle Meshtastic-Firmware auf dem Heltec V3 (Web-Flasher unter flasher.meshtastic.org oder Meshtastic-App).
2. In der Meshtastic-App (Android/iOS) mit dem Gerät koppeln und einstellen:
   * **Region: EU_868** (Pflicht, sonst sendet das Gerät nicht).
   * **Kanal:** Alle Geräte der Gruppe müssen denselben Kanal haben. Der Standard «LongFast» ist öffentlich –
     in der Schweiz hören dort über hundert fremde Knoten mit, und ihre Standorte und Texte kommen bei euch an.
     Für eine geschlossene Gruppe in der Meshtastic-App einen **eigenen Kanal mit Schlüssel** anlegen (Kanal-QR
     an alle Geräte verteilen) und ihn als primären Kanal setzen. Munggi sendet immer auf dem primären Kanal
     des Geräts und ändert keine Kanaleinstellungen. Bleibt ihr auf LongFast, blendet der **Team-Filter**
     (Abschnitt 3a) Fremde wenigstens in der App aus.
   * Gerätename (Lang-/Kurzname) vergeben – so erscheint der Knoten bei allen anderen.
   * Optional: Bluetooth-Kopplung mit fester PIN einrichten (Standard: PIN wird auf dem Display angezeigt).
3. Der Heltec V3 hat **kein GPS**. Seinen Standort erhält er von der Munggi-App (Handy-/PC-GPS) – siehe unten.

## 2. Gerät mit Munggi verbinden

Fenster **📡 Mesh (LoRa / Meshtastic)**: über den Sitzungsdialog (🤝 Sitzung → Kasten «Über Kilometer»),
die Suche («Mesh») oder am Handy über «Mehr».

| Weg | Wo es geht | Hinweise |
|---|---|---|
| **🔌 USB / Seriell** | PC mit Chrome/Edge (HTML-Datei oder gehostete App); EXE je nach WebView2-Stand | Windows braucht ggf. den USB-Seriell-Treiber des Chipherstellers (bei Heltec V3 meist CP210x). Nur **ein** Programm darf den Port halten – Meshtastic-CLI/Web-Client vorher schliessen. |
| **🔵 Bluetooth** | Android mit Chrome (installierte Munggi-App vom Home-Bildschirm) | Beim ersten Verbinden fragt Android nach der PIN des Geräts. Ein Meshtastic-Gerät hält nur **eine** Bluetooth-Verbindung: Solange die Meshtastic-App verbunden ist, kann Munggi nicht verbinden (dort trennen). |
| **🌐 WLAN (experimentell)** | Gerät mit eingeschaltetem WLAN im selben Netz | HTTP-API des ESP32. Aus der https-App heraus blockiert der Browser http-Zugriffe; praktisch nur aus der EXE/HTML-Datei. |
| **iPhone** | keine direkte Verbindung möglich (Safari hat kein Web Bluetooth/Web Serial) | Weg: ein Android-Handy oder PC mit Gerät ist in derselben Sitzung und aktiviert die **Brücke** (Standard an). Zusätzlich kann auf dem iPhone die Meshtastic-App mit dem eigenen Gerät laufen – Munggi-Meldungen sind dort als normaler Text lesbar. |

Nach dem Verbinden zeigt das Fenster Gerätename, `!id`, Kanal, Firmware und Akku. Bleibt es bei «Konfiguration …»,
ist das Gerät aus, die Firmware zu alt oder ein anderes Programm hält die Verbindung.

Wenn die Knöpfe in der Windows-EXE ausgegraut sind, fehlt dem eingebetteten Browser die Schnittstelle:
dann die HTML-Datei in Chrome/Edge öffnen (Datei → gleiche App, gleiche Projekte über Laden/Speichern).

## 3. Was über das Mesh läuft

* **Knoten auf der Karte:** Alle Geräte, die ihren Standort gesendet haben, erscheinen als orange Marker 📡
  mit Name; Farbe nach Alter (frisch < 20 min, veraltet < 60 min, alt). Liste im Mesh-Fenster mit Distanz,
  Peilung und Alter; Antippen zentriert. Wegpunkte aus Meshtastic-Apps erscheinen blau 📍.
* **Eigener Standort:** Mit eingeschaltetem GPS sendet Munggi die Position gedrosselt ins Mesh
  (Standard alle 5 min, bei Bewegung > 200 m auch früher; einstellbar aus / 2 / 5 / 15 min).
  Das Gerät übernimmt sie als eigene Position – auch Meshtastic-Apps anderer sehen sie.
* **Chat und Meldungen:** Der Sitzungs-Chat und die Meldungen (9-Liner MEDEVAC, LZ Brief, SITREP,
  Beobachtung, Standort, Notfall – Knopf «📡 An Sitzung») gehen zusätzlich als Text ins Mesh. Längere
  Texte werden in Teile ≤ 200 Byte zerlegt («(1/3) …»). Empfangene Texte stehen im Chat mit dem Kennzeichen
  «📡 Mesh»; ein Nachbarknoten bestätigt den Empfang («📡 ✓»). Beginnt ein Text mit 9-LINE, NOTFALL,
  MEDEVAC, MAYDAY oder SOS, löst er den Alarm aus (Ton, Vibration, roter Rand) – auch wenn er aus einer
  Meshtastic-App kommt.
* **Ohne Sitzung** funktioniert der Chat direkt über das Mesh (Kurzmeldungs-Tasten, Eingabe, «📡 An Sitzung»).

## 3a. Team-Filter und fremde Nachrichten (ab T260)

* Im Mesh-Fenster steht der Kasten **★ Team**. Knoten mit ★ markieren oder ein **Namens-Präfix** setzen
  (z. B. «4T4K» – dann gehören alle Geräte dazu, deren Name so beginnt). Sobald ein Team festgelegt ist,
  erscheinen nur noch Team-Knoten auf der Karte, in der Liste, in der Brücke zur Sitzung und im Chat.
  Ohne Team bleibt alles sichtbar (Hinweis im Fenster).
* Die übrigen Knoten stehen eingeklappt unter **«Weitere Knoten im Mesh»** und lassen sich dort mit ☆ aufnehmen;
  «Team auflösen» zeigt wieder alle.
* **Fremde Nachrichten** landen nicht im Chat und lösen keinen Alarm aus. Das Mesh-Fenster zählt sie
  («Fremde Nachrichten (n)»); dort lassen sie sich lesen, der Absender ins Team nehmen («★ Team») oder direkt
  beantworten («↩ Antworten»). Dringende fremde Texte (NOTFALL, MAYDAY, 9-LINE) ergeben einen stillen Hinweis.
* Der Filter wirkt nur auf die Anzeige: Auf einem öffentlichen Kanal hören Fremde eure Standorte und
  Broadcast-Texte weiterhin mit. Wer das ausschliessen will, braucht den eigenen Kanal mit Schlüssel (Abschnitt 1).

## 3b. Empfänger wählen – Direktnachrichten (ab T260)

Im Chat gibt es die Zeile **«An»**: *Alle* (Sitzung + Mesh), ein *Teilnehmer der Sitzung* (die Nachricht wird nur
bei ihm angezeigt) oder ein *Mesh-Knoten* (Direktnachricht an dieses Gerät; ab Firmware 2.5 verschlüsselt die Funke
Direktnachrichten mit dem Schlüsselpaar des Knotens, sie sind also auch auf LongFast privat). «Antworten» im
Knoten-Fenster oder in den fremden Nachrichten setzt den Empfänger direkt. Direktnachrichten tragen im Chat
das Kennzeichen «→ Name» bzw. «→ nur ich». Auf dem Handy öffnet der Reiter **Chat** in der unteren Leiste den
Chat; der rote Zähler zeigt ungelesene Nachrichten.

## 4. Brücke zur Sitzung (für iPhones und alle ohne eigenes Gerät)

Ist das Gerät verbunden **und** eine Sitzung aktiv (Feldserver oder P2P), arbeitet die App als Brücke:

* Mesh-Texte erscheinen bei **allen** Sitzungsteilnehmern im Chat («Name (Mesh)»), Mesh-Knoten auf allen
  Karten («via <Brücke>»).
* Chat und Meldungen der Sitzungsteilnehmer gehen mit Absendername ins Mesh («Berta: …»).
* Mehrere Brücken sind erlaubt: Alle empfangen, aber nur eine sendet Sitzungsnachrichten ins Mesh
  (Duplikate werden erkannt). Das Fenster zeigt «aktiv, sendet» bzw. «andere Brücke sendet».
* Optional (Standard aus): **Teilnehmer-Standorte als Wegpunkte** alle 10 min ins Mesh – dann sehen
  auch Meshtastic-Apps die Sitzungsteilnehmer. Kostet Sendezeit; nur bei wenigen Teilnehmern sinnvoll.

## 5. Grenzen und Praxis

* **Bandbreite:** LongFast ist langsam (Grössenordnung 1 kbit/s, gemeinsam für alle). Kurze Texte, keine
  Lagebilder; Standort-Intervall nicht unter 2 min. In der Region EU_868 begrenzt das Gerät die Sendezeit
  (Meldung «Sendezeit-Limit»/Duty cycle) – dann warten.
* **Reichweite:** Sichtverbindung entscheidet – im Gebirge Kilometer bis Dutzende Kilometer, im Wald/Tal
  wenige hundert Meter; ein Knoten auf einer Kuppe als Relais hilft mehr als Sendeleistung.
* **Verschlüsselung:** Der Standardkanal LongFast ist mit einem öffentlich bekannten Schlüssel «verschlüsselt» –
  jedes Meshtastic-Gerät in Reichweite liest mit. Für vertrauliche Meldungen in der Meshtastic-App einen
  eigenen Kanal mit Schlüssel anlegen (alle Geräte gleich); Munggi nutzt dann diesen primären Kanal.
* **Hintergrund:** Bei gesperrtem Bildschirm pausiert die Web-App (iOS immer, Android je nach Energiesparmodus);
  das Gerät selbst empfängt weiter und liefert nach dem Aufwecken nach.
* **Nicht getestet mit echter Hardware:** Die Anbindung wurde gegen das dokumentierte Protokoll und die
  offiziellen Protobuf-Schemata geprüft (Test `t251_mesh`). Der erste Lauf mit dem Heltec V3 (USB-Treiber,
  Bluetooth-Kopplung, Firmware-Stand) bleibt der Praxistest.

## 6. Fehlersuche

* Knöpfe ausgegraut → Schnittstelle fehlt (Browser/EXE/iPhone), siehe Tabelle oben.
* «Gerät antwortet nicht (Konfiguration)» → Gerät aus? Anderes Programm verbunden? Kabel nur Ladekabel?
* Nachrichten ohne «✓» → kein Nachbar in Reichweite (kein Knoten hat weitergeleitet) oder Sendezeit-Limit.
* Protokoll im Mesh-Fenster (ausklappbar) zeigt die letzten Ereignisse und Gerätemeldungen.
