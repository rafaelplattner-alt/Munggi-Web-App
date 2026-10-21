# Munggi-App – Mehrplatz-Sitzung im lokalen Netz (T163)

Mehrere PCs (und iPhones/iPads mit der PWA) arbeiten **gleichzeitig am selben
Dokument**: Zeichnen, Signaturen, Routen, Layer-Sichtbarkeit, Projektname,
Kategorie-Notizen und die CONOPS-Planung werden laufend abgeglichen.
Es werden **keine Internet-Server** benutzt – alles bleibt im Einsatznetz.

## So funktioniert es

* Ein Gerät ist **Host** und stellt den Sitzungs-Server bereit (eingebaut in
  der Windows-EXE). Alle anderen **treten bei** (IP des Hosts + Einsatzcode).
* Jedes Gerät sendet nur seine eigenen Änderungen (alle ~1 Sekunde).
  Bei gleichzeitiger Änderung **desselben** Objekts gewinnt die letzte Änderung.
* Wer später beitritt, erhält automatisch die aktuelle Lage vom Host
  (eigener Inhalt bleibt bestehen und wird in die Sitzung eingebracht –
  für einen sauberen Start vorher «🆕 Neu» drücken).
* Bei Verbindungsverlust verbindet die App alle 5 s neu; eigene Änderungen
  aus der Offline-Zeit werden nach dem Wiederverbinden übertragen.

## Bedienung

1. **Host:** «🤝 Sitzung» → Anzeigename, Einsatzcode und Port prüfen → **Hosten**.
   Die EXE zeigt die Adresse an (z. B. `192.168.1.20:8765`).
2. **Teilnehmer:** «🤝 Sitzung» → gleicher Einsatzcode → Adresse des Hosts
   eintragen → **Beitreten**.
3. Der Knopf zeigt den Zustand: `🤝 Sitzung · 3` = verbunden, 3 Teilnehmer.
   Im Dialog: Teilnehmerliste und «⛔ Sitzung verlassen».

**Windows-Firewall:** Beim ersten Hosten fragt Windows nach – Zugriff für
**private Netzwerke** erlauben, sonst können andere PCs nicht beitreten.

## WLAN / Feldbetrieb ohne Router (T164)

Die Sitzung braucht nur ein gemeinsames Netz – WLAN genügt:

* **Gleiches WLAN vorhanden** (Unterkunft, KP mit Router): einfach wie oben
  hosten/beitreten, egal ob die Geräte per Kabel oder WLAN verbunden sind.
* **Gar keine Infrastruktur:** Der Host-PC spannt selbst ein WLAN auf –
  Windows-Einstellungen → Netzwerk und Internet → **Mobiler Hotspot**
  einschalten (Internet ist nicht nötig). Die anderen Geräte verbinden sich
  mit diesem WLAN; der Host hat im Hotspot-Netz praktisch immer die Adresse
  **192.168.137.1**. Im Sitzungs-Dialog gibt es dafür den Abschnitt
  «📶 Feldbetrieb ohne Router» mit einem Knopf, der die Adresse automatisch
  einträgt. Alternativ kann ein iPhone den Hotspot aufspannen – dann hostet
  einer der verbundenen PCs die Sitzung.
* **Stolpersteine:** Stuft Windows das Hotspot-Netz als «öffentlich» ein, die
  App in den Firewall-Einstellungen auch für öffentliche Netze freigeben.
  Auf manchen verwalteten Laptops ist der mobile Hotspot per Richtlinie
  gesperrt – vor dem Einsatz einmal testen. Reichweite typisch 20–50 m.

## Einbau des Sitzungs-Servers in die Windows-EXE (einmalig)

1. `collab_relay.rs` nach `kocoa-tauri/src-tauri/src/` kopieren.
2. In `src-tauri/src/main.rs`:
   * oben ergänzen: `mod collab_relay;`
   * beim Tauri-Builder die Befehle registrieren (bestehende
     `generate_handler![...]`-Liste erweitern):

   ```rust
   .invoke_handler(tauri::generate_handler![
       collab_relay::start_collab_relay,
       collab_relay::stop_collab_relay
   ])
   ```
3. Wie gewohnt `src/index.html` durch die neue `kocoa_reglement_8_65.html`
   ersetzen und `cargo tauri build` ausführen.
   Es sind **keine zusätzlichen Rust-Abhängigkeiten** nötig (nur Standardbibliothek).

## Ohne EXE hosten (Browser/PWA oder zum Testen)

Auf einem beliebigen PC mit Node.js:

```
node munggi-relay.js 8765 ALPHA1
```

(Port und Einsatzcode frei wählbar; mit `--www pwa` liefert der Server zusätzlich
die PWA über https aus, siehe «Feldserver» unten.) Danach in der App auf diesem PC
«Hosten» drücken – sie verbindet sich mit dem laufenden Server.
Handys (iPhone/Android) können immer nur **beitreten**, nicht hosten.

## Was abgeglichen wird (Stand T172)

Work-Layer-Objekte (Signaturen, Zeichnungen, Routen, Analysen, Messungen),
Layer-Sichtbarkeit/-Deckkraft, Projektname, Kategorie-Notizen, die CONOPS-Planung
sowie – seit T171 – **SpotMaps, Führungsraster, Meldungen und die Lawinen-/
Geländebeurteilung**. Für diese vier Strukturen gilt «letzte Änderung gewinnt» als
Ganzes (nicht pro Element).

Seit T172 merkt sich jedes Gerät **Löschungen** (Grabsteine): Ein Objekt, das
während eines Verbindungsunterbruchs gelöscht wurde, taucht nach dem
Wiederverbinden nicht mehr auf – auch nicht durch ein Gerät, das die Löschung
verpasst hat. «Letzte Änderung gewinnt» richtet sich nach einer gemeinsamen
**logischen Uhr**, nicht mehr nach den PC-Uhren (falsch gestellte Uhrzeiten
spielen keine Rolle). Und ein Objekt, das gerade **von Hand bearbeitet** wird
(Eckpunkt ziehen, Marker verschieben), wird nicht mitten in der Bearbeitung
durch eine fremde Änderung ersetzt – diese wird nach dem Loslassen angewendet.

## Sicherheit

* Zugriff nur mit dem **Einsatzcode**; falscher Code wird vom Server abgewiesen (HTTP 403).
  Zusätzlich trägt seit T171 jede Nachricht eine Code-Kennung – Nachrichten aus
  fremden Sitzungen werden von der App ignoriert. Vorgeschlagene Codes sind
  kryptografisch zufällig (8 Zeichen). Eingehende Daten werden auf Struktur,
  Wertebereiche und Grösse geprüft.
* Ohne Passphrase (T245) ist die Übertragung zwischen PCs unverschlüsselt (`ws://`);
  Handys verbinden sich seit T246 immer über TLS (`wss://`). Gedacht für ein
  **abgeschottetes, vertrauenswürdiges Netz**; für Inhalte, die niemand mitlesen
  darf, die Passphrase setzen (Ende-zu-Ende, unabhängig von ws/wss).
* Der Server speichert nichts und leitet nur weiter; nach dem Beenden der
  Sitzung ist nichts zurückgeblieben.

## Verschlüsselung, Live-Standorte und Chat (T245)

* **Passphrase (optional):** Im Dialog «🤝 Sitzung» unter «🔒 Verschlüsselung · Rolle · Standort»
  eine Passphrase eintragen – **vor** «Hosten» bzw. «Beitreten», auf allen Geräten gleich,
  zusammen mit demselben Einsatzcode. Der Schlüssel wird aus Passphrase + Einsatzcode abgeleitet
  (PBKDF2, 120 000 Runden, SHA-256) und jede Nachricht mit AES-256-GCM verschlüsselt. Der
  Sitzungs-Server (Relay) sieht nur Chiffrat; ein Gerät ohne oder mit falscher Passphrase
  bekommt einen Hinweis und bleibt aussen vor. Voraussetzung ist ein «sicherer Kontext» des
  Browsers (Windows-EXE, Datei, PWA über HTTPS oder localhost) – über schlichtes HTTP steht
  WebCrypto nicht zur Verfügung, die App meldet das im Dialog.
* **Live-Standorte:** Jedes Gerät mit eingeschaltetem GPS (📍) und aktiver Option «Eigenen
  GPS-Standort teilen» meldet seinen Standort (Rufname, Rolle, Genauigkeit) gedrosselt in die
  Sitzung. Die anderen erscheinen als Marker mit Etikett; grün = aktuell (< 60 s), grau =
  veraltet, rot = verschollen (> 5 min) oder GPS aus. Fenster «👥 Teilnehmer & Live-Standorte»
  (Leiste über der Karte, Dialog, Suche, «Mehr» am Handy): Liste mit Distanz und Peilung vom
  eigenen Standort, Klick zentriert, «Alle zeigen». Die Rolle ist freier Text – die Vorschläge
  sind nur Beispiele.
* **Chat:** Fenster «💬 Sitzungs-Chat» mit Kurzmeldungs-Tasten (Verstanden, Negativ, Warten,
  Weiter, Sammeln, Standort?, Hilfe nötig), freier Eingabe (Enter sendet), optional mit eigenem
  Standort (📍-Schalter; Empfänger klicken 📍 und die Karte springt hin). Jede Nachricht zeigt
  «✓ n/N» = von n der N anderen Geräte empfangen. Ungelesene Nachrichten erscheinen als Zähler
  in der Leiste über der Karte und als Hinweis. Spät beitretende Geräte erhalten vom Host die
  letzten 50 Nachrichten. «⬇ Verlauf» speichert den Chat als Textdatei. Der Verlauf lebt nur
  in der laufenden App (kein Speichern auf dem Server).

## Feldserver: Handys (iPhone/Android) beitreten lassen (T246)

**Warum ein eigener Schritt?** Die Munggi-App auf dem Handy ist eine installierte Web-App
(PWA) und läuft über **https**. Aus einer https-Seite erlaubt kein Browser eine unverschlüsselte
`ws://`-Verbindung ins LAN («Mixed Content»). Der Sitzungs-Server nimmt darum seit T246 auf
demselben Port auch **TLS (`wss://`)** an – mit einem selbst erzeugten Zertifikat, dem die Handys
einmalig vertrauen müssen. PCs (EXE, Datei) sind nicht betroffen und verbinden sich wie bisher.

**Ablauf (Host-PC mit Windows-EXE)**

1. Optional den *Mobilen Hotspot* von Windows einschalten (feste Adresse 192.168.137.1 – dann
   bleibt das Zertifikat dauerhaft gültig). Alle Handys mit diesem WLAN verbinden.
2. «🤝 Sitzung» → Einsatzcode (und ggf. Passphrase) → **Hosten**. Die EXE erzeugt beim ersten Mal
   das Zertifikat «Munggi Feldserver» und zeigt im Dialog den Kasten «📱 Handys beitreten lassen»
   mit **QR-Code** und den Adressen:
   * Hilfsseite (unverschlüsselt): `http://192.168.137.1:8766/` – Zertifikat + Anleitung
   * App vom Feldserver: `https://192.168.137.1:8765/` – die PWA, direkt aus der EXE ausgeliefert
   * Sitzung: `192.168.137.1:8765`
3. Handy: QR scannen bzw. Hilfsseite öffnen → **Zertifikat laden** → installieren:
   * iPhone (in **Safari**, nicht Chrome): «Profil laden» erlauben → Einstellungen → Profil geladen
     → Installieren (Warnung «nicht verifiziert» bestätigen) → Einstellungen → Allgemein → Info →
     Zertifikatsvertrauenseinstellungen → «Munggi Feldserver» einschalten. Landet die Datei statt
     dessen in «Dateien › Downloads», dort antippen – das löst dieselbe Profil-Abfrage aus.
   * Android: Einstellungen → nach «Zertifikat» suchen → CA-Zertifikat installieren → Datei
     `munggi-feldserver.cer` wählen.
4. Handy: `https://192.168.137.1:8765/` öffnen (jetzt ohne Warnung) → «Zum Home-Bildschirm» /
   «App installieren». Die App läuft danach auch ohne Server. (Eine bereits von einer anderen
   Adresse installierte Munggi-App kann ebenfalls beitreten – Projekte/Offline-Karten sind je
   Installationsadresse getrennt.)
5. Handy: Mehr → Sitzung → Einsatzcode, Passphrase, Rolle, «Standort teilen» → Adresse
   `192.168.137.1:8765` → **Beitreten**. Der Dialog zeigt auf https automatisch den Hinweis mit
   dem Link zur Hilfsseite; bleibt die Verbindung aus, erscheint nach einigen Sekunden ein Hinweis
   («Zertifikat installiert und Vertrauen eingeschaltet?»).

Das Zertifikat muss nur **einmal pro Handy** installiert werden – solange der Feldserver eine
Adresse behält, die im Zertifikat steht (alle Adressen des PCs zum Zeitpunkt der Erzeugung plus
192.168.137.1). Wechselt der PC in ein anderes Netz mit neuer Adresse, erzeugt die EXE beim
nächsten Hosten ein neues Zertifikat und die Handys installieren es erneut.

**Ohne EXE (Node):** `node munggi-relay.js 8765 CODE --www pwa` (Ordner `pwa` = Inhalt des
Mobile-PWA-Zips). Das Zertifikat wird mit `openssl` erzeugt (unter Windows z. B. aus «Git für
Windows»; alternativ `--cert-dir` auf den Ordner `KOCOA-Daten` der EXE oder `--cert/--key`).
`--no-tls` schaltet auf das alte Verhalten (nur ws://) zurück.

**Firewall:** Ports 8765 (Sitzung, PWA) und 8766 (Hilfsseite) für private Netze freigeben; stuft
Windows den Hotspot als «öffentlich» ein, auch dort. Der Einsatzcode wird auf der Hilfsseite
bewusst nicht angezeigt.

## P2P-Sitzung ohne Laptop – über den Hotspot eines Handys (T249)

Für eine Gruppe am gleichen Ort braucht es weder Laptop noch Feldserver: Die Geräte verbinden sich direkt miteinander
(WebRTC-Datenkanäle, in Safari und Chrome), das Netz ist der Hotspot irgendeines Handys. Alles Übrige (Abgleich, Layer,
Live-Standorte, Chat, Passphrase) ist dasselbe wie in der Sitzung über den Server.

**Ablauf**

1. Ein Handy schaltet seinen persönlichen Hotspot ein, alle anderen verbinden sich mit diesem WLAN. (Der Ersteller kann
   Hotspot-Name und Kennwort im P2P-Fenster eintragen – dann zeigt die App einen WLAN-QR, den die anderen mit der
   Kamera-App scannen.)
2. Ersteller: Mehr → «📱 P2P-Sitzung» (oder Suche «P2P», oder Sitzungsdialog → «P2P-Sitzung öffnen») → Name, Einsatzcode,
   optional Passphrase → **«Sitzung erstellen & QR zeigen»**.
3. Beitretender: «📱 P2P-Sitzung» → **«Einladung scannen & beitreten»** → Kamera auf den QR des Erstellers. Das Handy
   zeigt danach seinen **Antwort-QR**.
4. Ersteller: **«Antwort scannen»** → Kamera auf den Antwort-QR. Verbunden – der Ersteller sieht sofort einen neuen
   Einladungs-QR für das nächste Gerät.
5. Weitere Geräte: Schritte 3–4 mit *irgendeinem* Mitglied (jedes kann einladen). Die Verbindung zu allen übrigen
   Mitgliedern baut die App im Hintergrund über das bestehende Netz auf; der Neue erhält die Lage und den Chatverlauf.

Einsatzcode und – falls gesetzt – Passphrase stehen im Einladungs-QR und müssen nicht eingetippt werden. Kein Scanner
zur Hand: «Einladung kopieren» / «Antwort einfügen» übertragen den Code auch als Text (z. B. per AirDrop/Messenger,
sobald wieder Netz da ist).

**Technik, kurz:** Kein STUN/TURN, nur lokale Kandidaten (die Browser tarnen sie als mDNS-Namen `….local`, die im
selben WLAN auflösbar sind). Kanäle sind DTLS-verschlüsselt; die Passphrase verschlüsselt zusätzlich Ende-zu-Ende.
Nachrichten werden an alle Nachbarn gesendet und höchstens zwei Sprünge weitergereicht (Deduplizierung), grosse
Nachrichten in Teilstücke zerlegt. Koordinator (Schnappschuss und Chatverlauf für Spät-Beitretende) ist das Mitglied mit
der kleinsten Teilnehmer-ID unter denen, die länger als 8 s dabei sind – ohne Absprache eindeutig, überlebt den Ausstieg
des Erstellers. Der Scanner nutzt BarcodeDetector (Chrome/Android) oder jsQR (iPhone) – Kamera nur in der installierten
App bzw. über https.

**Grenzen:** Reichweite = Hotspot (grob 20–50 m), sinnvoll bis etwa 8–10 Geräte (jedes mit jedem verbunden). Fällt das
Hotspot-Handy aus, müssen die anderen einen neuen Hotspot wählen und neu beitreten. iPhone schläfert die Web-App bei
gesperrtem Bildschirm ein – Verbindungen brechen dann ab; Bildschirm eingeschaltet lassen (Automatische Sperre aus) oder
nach dem Aufwecken neu beitreten. Zwischen Hotspot-Geräten mancher Hersteller ist «Client-Isolation» aktiv, dann sehen
sich die Handys nicht – Hotspot eines anderen Geräts probieren.

## Meldungen an die Sitzung senden (T250)

* **Wo:** 9-Liner MEDEVAC, LZ Brief, SITREP und Beobachtungsmeldung haben neben «Kopieren»/«Teilen»
  den Knopf «📡 An Sitzung». Am Handy findet er sich zusätzlich im Standort-Blatt («Standort melden»)
  und in der Notfall-Anzeige (NOTFALL – Standort). Ohne aktive Sitzung erscheint ein Hinweis mit
  Sprung zum Sitzungs-Dialog.
* **Wie:** Die Meldung geht als Karte in den Sitzungs-Chat aller Teilnehmer – über den Feldserver
  genauso wie über die P2P-Sitzung, verschlüsselt, wenn eine Passphrase gesetzt ist. Mitgesendet
  werden der Funkspruch-Text, die Formularfelder und (falls vorhanden) der Standort.
* **Beim Empfänger:** 9-Liner und Notfall lösen den Alarm aus (Ton, Vibration, roter Bildschirmrand,
  Benachrichtigung – wie beim Geofence, Einstellung «Alarm» unter Messen); SITREP, Beobachtung und
  Standort nur einen Hinweiston. Auf der Karte im Chat: «📋 Öffnen» füllt das eigene Formular mit
  den empfangenen Angaben (z. B. um den 9-Liner weiterzugeben oder zu ergänzen), «🗺 Auf Karte»
  springt zum Standort, «Kopieren» legt den Text in die Zwischenablage. Der Absender sieht wie beim
  Chat «✓ n/N» als Lesebestätigung.
* **Spät Beitretende** erhalten die Meldungen mit dem Chatverlauf (letzte 50 Nachrichten) nach.
