# Munggi-App – Mehrplatz-Sitzung im lokalen Netz (T163, Räume ab T432)

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

## Räume: ein Host für Taskgroup und Taskforces (T432/T433)

Begriffe: Die **Taskgroup** ist die übergeordnete Stufe (je nach Lage Bataillon oder
Kompanie) – ihr Raum ist der Raum der Leitung. Die **Taskforces** (Det, Zug, Gruppe,
Team, Patrouille) sind ihr unterstellt und arbeiten je in einem eigenen Raum.

Ein Host-Laptop (EXE-Feldserver oder `munggi-relay.js`) betreibt seit T432 **mehrere
Räume** gleichzeitig. Jeder Raum ist eine eigene Sitzung mit eigenem Einsatzcode
(z. B. `TASKGROUP`, `ALPHA`, `BRAVO`); Taskforces in verschiedenen Räumen sehen sich
gegenseitig nicht. So planen bis zu 6 Taskforces mit je bis zu 6 Laptops unabhängig
voneinander über **einen** Host (Router/Switch nötig – ein mobiler Hotspot nimmt
höchstens 8 Geräte auf).

**Einrichten (Host = Taskgroup):** «🤝 Sitzung» → Abschnitt **Taskgroup und
Taskforces (Räume)** einschalten.

* **Leitungs-Code:** Wer sich mit diesem Code verbindet (der Host oder ein
  Teilnehmer, der ihn im Abschnitt «Weitere Einstellungen» einträgt), ist die
  Taskgroup-Leitung und darf die Räume verwalten: anlegen, schliessen, Stand leeren,
  Freigaben schalten. Der Code wird **nur an die Leitung** weitergegeben; Taskforces
  brauchen nur Adresse und ihren Raum-Code.
* **Neue Räume zulassen:** Ein = jeder neue Einsatzcode eröffnet einen Raum
  (Übungsbetrieb). Aus = nur die unten angelegten Räume sind erreichbar, alles
  andere weist der Server ab (HTTP 403 «Raum nicht freigegeben») – für den
  Einsatz aus Gründen der operativen Sicherheit empfohlen.
* **Raumliste:** Raum-Code (= Einsatzcode der Taskforce) und Bezeichnung eintragen →
  «Raum hinzufügen». Beim Hosten werden die Räume dem Server übergeben; der eigene
  Einsatzcode des Hosts ist immer der Raum der Taskgroup.
* Nach dem Verbinden zeigt der Statusblock die **Raumübersicht**: Teilnehmerzahl,
  Alter des letzten Standes, je Raum die zwei Freigaben **«Taskgroup-Stand an die
  Taskforce»** und **«Taskforce-Stand zur Taskgroup»** (siehe Verbund unten),
  **Einladung** (QR-Code mit Adresse und Raum-Code – Taskforces scannen ihn mit der
  Kamera-Beitritt-Funktion oder tippen Adresse + Code ab), **Stand leeren** und
  **Schliessen** (trennt die Teilnehmer, löscht den gespeicherten Stand).

**Beitreten (Taskforce):** wie bisher – Adresse des Hosts und **Raum-Code** als
Einsatzcode. Der Raum-Code wirkt wie der bisherige Einsatzcode: falscher Code
→ abgewiesen; Nachrichten anderer Räume kommen nie an.

### Verbund aus Räumen (T433, Etappe C)

Die Leitung hält zu jedem freigegebenen Taskforce-Raum eine zweite, **lesende
Verbindung** – die Taskforce sieht sie als Teilnehmer «Taskgroup (lesend)». Darüber
laufen die beiden Freigaben, je Raum einzeln schaltbar:

* **Taskforce-Stand zur Taskgroup** (Standard: ein). Die Leitung holt den Stand des
  Raums alle 60 s (vom Lage-Inhaber oder aus dem Server-Gedächtnis) und fügt ihn in
  ihr Projekt ein – als Kopie mit Herkunft wie beim Verbund aus der Bibliothek:
  Ebenen heissen «**ALPHA · Grenzen**» (bzw. mit der Bezeichnung des Raums), sind
  im Layer-Baum unter der Taskforce gruppiert und fixiert. Bei jeder Abfrage werden
  nur die Ebenen dieser Taskforce ersetzt; eigene Ebenen der Taskgroup bleiben.
  Die Kopie ist Teil des Taskgroup-Projekts: Weitere Teilnehmer im Taskgroup-Raum
  erhalten sie über den normalen Abgleich, und sie wird mitgespeichert.
  «Jetzt holen» in der Raumübersicht fragt sofort ab.
  **Synchromatrix (T434):** Mit derselben Abfrage holt die Leitung auch die
  Sync-Matrix der Taskforce – vom Laptop, der sie in der Werkstatt führt (melden
  sich mehrere, zählt die mit den meisten Einträgen). Sie wird wie beim Verbund
  aus der Bibliothek in die Taskgroup-Matrix eingefügt: Elemente der Taskforce als
  Gruppe «ALPHA», H±-Zeiten über die H-Hour der Taskforce in Uhrzeiten aufgelöst,
  wenn sie von der Taskgroup-H-Hour abweicht (fehlt die H-Hour der Taskforce, bleibt
  H± stehen und die Verbund-Zeile weist darauf hin), Marke «H ALPHA», Knoten in
  der Task Org. Bei jeder Abfrage werden nur die Zeilen dieser Taskforce ersetzt.
  Die Werkstatt wird in Sitzungen nicht abgeglichen – die zusammengeführte Matrix
  liegt also auf dem Laptop der Leitung (und im gespeicherten Taskgroup-Projekt).
* **Taskgroup-Stand an die Taskforce** (Standard: aus). Die Leitung sendet ihre
  eigenen Ebenen (ohne Kopien aus anderen Räumen) in den Raum; jede Taskforce sieht
  sie als Block «**Taskgroup · Grenzen**» – fixiert, im Layer-Baum unter «Taskgroup»,
  im Sitzungs-Dialog mit Uhrzeit und Ein-/Ausblenden. Der Block gehört **nicht** zum
  Abgleich der Taskforce: Er wird weder an andere Taskforce-Laptops noch in den
  Schnappschuss noch zurück zur Taskgroup übertragen; wer beitritt, erhält ihn
  direkt von der Leitung. Ändert die Taskgroup etwas, kommt der Block innert
  30 s nach; «Jetzt senden» schickt ihn sofort. Wird die Freigabe entzogen,
  verschwindet der Block bei allen Taskforce-Laptops. (Löst jemand die Fixierung
  und zeichnet im Block, bleibt das lokal und wird beim nächsten Stand ersetzt.)

Beides zusammen ergibt den Verbund: Die Taskgroup plant auf dem Gesamtbild aller
Taskforces, die Taskforces planen auf dem freigegebenen Rahmen der Taskgroup, ohne
dass eine Taskforce die Räume der anderen sieht. Verwendet die Sitzung eine
Passphrase, muss sie in allen Räumen gleich sein (die Lese-Verbindung leitet ihren
Schlüssel aus Passphrase und Raum-Code ab).

**Raum-Gedächtnis (Etappe B):** Der Server fragt alle 120 s den Lage-Inhaber des
Raums nach einem Schnappschuss und hält den letzten Stand je Raum im Speicher
(EXE: Ordner `sitzungen/` neben dem Zertifikat im App-Datenordner;
Node: `sitzungen/` neben dem Skript oder `--data <Ordner>`). Folgen:

Seit T474: Auf die Bitte des Servers antwortet genau ein Gerät – die Leitung vor einem
Schreibtisch-Gerät vor einem Telefon. Hat sich die Lage seit dem letzten Mal nicht
geändert, meldet es nur «unverändert» (rund 70 Bytes statt des ganzen Stands). Geht ein
Teilnehmer, fragt der Server sofort nach, statt die Frist abzuwarten. Das Gedächtnis
arbeitet jetzt auch mit Passphrase: Der Server bewahrt den verschlüsselten Schnappschuss
ungelesen auf und gibt ihn dem Ersten im leeren Raum; lesen kann ihn nur, wer die
Passphrase kennt. Dafür brauchen App und Server den Stand T474 – ein älterer Server
(EXE vor T474) führt bei Passphrase wie bisher kein Gedächtnis.

Fassungen: Weicht die App-Fassung eines Teilnehmers ab, erscheint beim Beitritt ein
Hinweis. Für die Sitzung, besonders für die Lageverfolgung, brauchen alle Geräte
dieselbe Fassung.


* Verlassen alle Teilnehmer eines Raums (Pause, Akku leer, Neustart), bleibt der
  Stand erhalten – der nächste Beitritt erhält ihn vom Server (markiert als «vom
  Server»), auch wenn kein anderer Laptop mehr verbunden ist.
* Ein Laptop, der nach 3 Anfragen von keinem Teilnehmer eine Lage bekommt
  (z. B. weil der Lage-Inhaber gerade abwesend ist), erhält ebenfalls den
  gespeicherten Stand. Solange Teilnehmer online sind, hat deren Lage Vorrang.
  Ist nur die Lese-Verbindung der Leitung im Raum, wird der erste Beitretende
  nach 4 s zum Lage-Inhaber.
* Der Server speichert die Datei spätestens 30 s nach einer Änderung sowie beim
  Trennen des letzten Teilnehmers und beim Beenden. **Stand leeren** oder
  **Schliessen** löscht sie. Vor einer neuen Übung die Räume leeren, damit kein
  alter Stand geladen wird.
* Ohne Räume (Abschnitt ausgeschaltet) verhält sich alles wie bisher: ein Raum
  mit dem Einsatzcode, Gedächtnis ebenfalls aktiv.

**Feldserver ohne EXE (Node):**

```
node munggi-relay.js 8765 TASKGROUP --rooms ALPHA,BRAVO,CHARLIE --lead LEIT-4711
node munggi-relay.js 8765 UEBUNG --open --lead LEIT-4711
```

Weitere Schalter: `--data <Ordner>` (Gedächtnis-Ablage), `--snapsec <s>`
(Abstand der Schnappschuss-Anfragen, Standard 120). Über den Leitungs-Code
können Räume im Betrieb aus der App heraus angelegt und geschlossen werden,
ohne den Server neu zu starten.

**Grenzen:** Der Host-Laptop bleibt Einzelpunkt: fällt er aus, enden alle Räume –
die Stände sind aber auf der Platte und stehen nach dem Neustart des Hostens
wieder bereit. Zwischen Taskforces gibt es keinen direkten Austausch (nur über
die Taskgroup). Übertragen werden Ebenen-Inhalte (Signaturen, Zeichnungen, Routen,
Messungen) und – zur Taskgroup hin – Synchromatrix und Task-Org-Knoten; Werkstatt-
Folien, Wargaming, Meldungen und Beurteilungen der Taskforces kommen weiterhin
über den Verbund aus der Bibliothek (T368).

## Hosts im Netz finden – Funkfeuer (T435, nur Windows-EXE)

Statt die Adresse abzutippen, können Windows-Apps den Host **sehen**:

* **Host:** Beim Erstellen der Sitzung ist der Schalter **«Im Netz sichtbar
  (Funkfeuer)»** standardmässig ein. Der Feldserver sendet dann alle 2 s eine kleine
  Meldung ins lokale Netz (UDP-Port 8764): Anzeigename des Hosts, Port, ob neue
  Räume zugelassen sind und wie viele Räume es gibt – **kein Raum-Code**. Die
  Taskgroup-Leitung kann den Schalter jederzeit ausschalten, auch während die
  Sitzung läuft (operative Sicherheit); dann ist alles wie bisher.
* **Teilnehmer (EXE):** «🤝 Sitzung» → Beitreten → Abschnitt **«Gefundene Hosts»**
  zeigt eine Kachel je Host (Name, Adresse, Räume, offen/geschlossen, grüner Punkt =
  gerade gehört). Antippen füllt die Adresse ein; es bleiben Anzeigename und
  Raum-Code. Die Liste wird alle 2 s aufgefrischt, Hosts verschwinden 8 s nach dem
  letzten Signal.
* **Handys/PWA und Browser** können im Netz nicht mithören – dort weiterhin
  Einladungs-QR (Raumübersicht), «Gespeicherte Server» oder die Hotspot-Adresse.
* **Reichweite:** das eigene WLAN/LAN bzw. der Hotspot des Hosts (Broadcast). Über
  Router-Grenzen, VPN oder Mobilfunk gibt es kein Funkfeuer.
* **Stolpersteine:** Die Windows-Firewall fragt beim ersten Hosten bzw. beim ersten
  Öffnen des Beitreten-Dialogs nach – für private (im Hotspot-Fall auch öffentliche)
  Netze zulassen, sonst hört die App nichts (UDP 8764 eingehend). Manche Gäste-WLANs
  blockieren Broadcasts zwischen Geräten («Client-Isolation») – dann QR oder Adresse.

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
   Seit T246 braucht der Feldserver die Abhängigkeiten `tokio`, `tokio-rustls`,
   `rustls`, `rcgen` und `rustls-pemfile` (siehe Cargo.toml des EXE-Projekts).

**Neubau für T432/T435/T436 (Räume, Funkfeuer, Weltkarten):** Nur `collab_relay.rs` ersetzen (aktueller
Stand liegt im Quellbaum-Zip unter `kocoa-dev/collab_relay.rs`; T436 enthält T432 und T435) und in `src-tauri/Cargo.toml`
unter `[dependencies]` eine Zeile ergänzen:

```toml
serde_json = { version = "1", features = ["preserve_order"] }
```

`main.rs` bleibt unverändert (die drei registrierten Befehle `start_collab_relay`,
`stop_collab_relay`, `collab_relay_info` heissen gleich; `start_collab_relay`
nimmt nun zusätzlich die optionalen Felder `rooms`, `open`, `lead` sowie – T435 – `visible`, `host_name` an;
`collab_relay_info` liefert zusätzlich `found`; T436: `/welt/…` auf Haupt- und Hilfsport, `collab_relay_info` mit `welt`/`weltDir`).
Danach `src/index.html` austauschen und `cargo tauri build`. Der Verbund aus Räumen (T433)
braucht keinen weiteren Neubau – er läuft über die App. Eine ältere EXE
funktioniert mit der neuen HTML weiterhin, nur ohne Räume: Der Abschnitt «Räume»
kann eingeschaltet werden, der alte Feldserver kennt aber nur den Einsatzcode des
Hosts und kein Gedächtnis.

## Ohne EXE hosten (Browser/PWA oder zum Testen)

Auf einem beliebigen PC mit Node.js:

```
node munggi-relay.js 8765 ALPHA1
```

(Port und Einsatzcode frei wählbar.) Danach in der App auf diesem PC
«Hosten» drücken – sie verbindet sich mit dem laufenden Server.
iPhones/iPads können immer nur **beitreten**, nicht hosten.

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
* Die Verbindung ist unverschlüsselt (`ws://`) – für den Einsatz in einem
  **abgeschotteten, vertrauenswürdigen Netz** gedacht. Keine Nutzung über
  offene/fremde Netze; keine echten klassifizierten Inhalte über ungesicherte
  Funkstrecken synchronisieren.
* Der Server speichert nichts und leitet nur weiter; nach dem Beenden der
  Sitzung ist nichts zurückgeblieben.
