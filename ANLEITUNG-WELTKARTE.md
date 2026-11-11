# Munggi-App – Weltkarte (ab T436)

Die Weltkarte ergänzt die Schweizer Landeskarten um Kartenebenen für Übungen und Einsätze
im Ausland (zuerst Nachbarländer und Europa). Sie besteht aus **eigenen, offenen Daten**:
kein Konto, kein Schlüssel, kein fremder Kartendienst im Einsatz.

* **Welt Übersicht** – Strassen-/Übersichtskarte aus OpenStreetMap-Daten (Protomaps, Lizenz
  ODbL). Die App zeichnet sie selbst (Vektorkacheln); Schriften und Stil sind eingebaut.
  Beschriftung deutsch, sonst englisch, sonst Landessprache.
* **Welt Satellit (online)** – Sentinel-2 cloudless von EOX (10 m, Jahrgang wählbar). Kommt
  nur aus dem Internet; dafür gibt es keine frei verteilbaren Daten.
* Geplant: Topografie mit Höhenlinien (aus den vorhandenen Höhendaten gerechnet, W4),
  Weltpakete für den Offline-Betrieb (`.kocoamap`, W3), MGRS/Werkzeuge ausserhalb der
  Schweiz (W2).

## Online-Weltkarten (T437) – freie Kacheldienste ohne Konto

Zusätzlich zur eigenen Karte gibt es die Basiskarte **«Welt online (Auswahl unten)»** mit der Karte
**Online-Weltkarten**. Dort wählst du eine Quelle und drückst «Anzeigen»:

| Gruppe | Quelle | Art | Hinweis |
|---|---|---|---|
| Welt | OpenTopoMap | Topo mit Höhenlinien | Zoom bis 17, Freiwilligenbetrieb |
| Welt | CyclOSM | Relief, Wege | OSM France |
| Welt | OSM Humanitarian | ruhige Strassenkarte | gute Unterlage für Signaturen |
| Welt | EOX Sentinel-2 cloudless | Satellit 10 m | Jahrgang aus der Karte «Weltkarte» |
| Welt | NASA VIIRS / MODIS Terra Tagesbild | Satellit 250–375 m, tagesaktuell | Datum wählbar (Standard gestern), gemeinfrei, bis Zoom 9 |
| Welt | NASA Schneebedeckung, Black Marble (Nachtlichter), Blue Marble (Relief) | Lagebild | gemeinfrei, bis Zoom 8 |
| Welt | Esri World Imagery (T448) | Satellit bis unter 1 m | ohne Konto; nur für Übungen – jeder Ausschnitt wird bei Esri (USA) abgefragt; dazu «Esri Beschriftung & Grenzen» als Ebene |
| Österreich | basemap.at Grundkarte / Orthofoto / Gelände | amtlich | CC BY 4.0, Luftbild 20–30 cm |
| Deutschland | basemap.de farbig / grau | amtlich | dl-de/by-2-0 |
| Frankreich | IGN Plan IGN v2 / Orthofoto | amtlich | Géoplateforme |
| Norwegen | Kartverket Topo | amtlich | |

* Nicht im Katalog: **OpenStreetMap Standard** (`tile.openstreetmap.org`) sperrt Anwendungen, die keinen
  Referer senden – aus der EXE und aus der lokal geöffneten HTML kommt «403 Access blocked»; **CARTO**
  verlangt inzwischen einen Schlüssel. Wer die OSM-Standardkarte braucht, erhält sie über OpenTopoMap/
  CyclOSM/Humanitarian in verwandter Darstellung; ein eigener Durchgang über den Feldserver wäre möglich,
  falls gewünscht.
* Die Karten «Online-Weltkarten» (zweitletzt, offen) und «Weltkarte» (zuletzt, eingeklappt) stehen am Ende
  des Abschnitts «Karten»; der Auf-/Zuklapp-Zustand wird gemerkt.
* **NASA GIBS** liefert Tagesbilder weltweit, aber grob (250–375 m): gut für Wolken, Schnee, Rauch und
  Übersicht, nicht zum Planen im Gelände. Das Datum (UTC) steht in der Karte; das Bild eines Tages ist ab
  etwa Mittag UTC vollständig, deshalb ist «gestern» voreingestellt.
* **Quelle prüfen** lädt eine Kachel des aktuellen Ausschnitts und meldet, ob der Dienst antwortet.
* **Zur Abdeckung** springt bei Länderdiensten ins Land; ausserhalb bleiben deren Kacheln leer.
* **Eigene Quelle und Adressen:** Name, URL-Vorlage (`{z}` `{x}` `{y}`, `{s}` für Teil-Server a/b/c,
  `{-y}` für TMS-Zählung, `{r}` für Retina), max. Zoom und Namensnennung eintragen → «Quelle hinzufügen».
  So lässt sich jeder weitere Kacheldienst (z. B. regionale Orthofotos aus Südtirol, Lombardei, Spanien)
  ohne neue App-Version aufnehmen. Die Adresse der gewählten Katalog-Quelle steht darunter und kann
  angepasst werden, falls ein Dienst seinen Pfad ändert (Originaladresse eintragen setzt zurück).
* **Regeln:** Diese Quellen sind nur online, die Namensnennung bleibt eingeblendet, es werden keine
  grossen Gebiete vorgeladen und keine Offline-Pakete daraus gebaut. Alle Abfragen gehen an fremde
  Server – der Kartenausschnitt ist dort sichtbar (für Übungen gedacht, im Einsatz die eigene Karte).
* Die Adressen der Katalog-Quellen entsprechen dem Stand Oktober 2026 und wurden aus der
  Entwicklungsumgebung nicht abgerufen (Hosts gesperrt) – beim ersten Einsatz mit «Quelle prüfen»
  bestätigen; eine geänderte Adresse lässt sich direkt in der Karte korrigieren.

## Ausserhalb der Schweiz (W2, T438)

Sobald die Kartenmitte ausserhalb der Schweiz liegt (grober Landesumriss; in den Einstellungen der Karte
«Weltkarte» auf «Schweiz» oder «Welt» festlegbar), schaltet die App um – sichtbar am grünen Chip
**«ausserhalb CH · MGRS»** in der Koordinatenleiste:

* **Koordinaten:** MGRS steht zuerst, LV95 wird ausgeblendet (Leiste, Koordinaten-Sprechblase). In der
  Suche lassen sich MGRS (`32T MT 50721 22038`, auch ohne Leerzeichen) und UTM (`32T 450721 5222038`,
  `32 N 450721 5222038`) eingeben.
* **Höhenprofil, Distanz, Sichtlinie, Tourenportal, Patrouille, Vorausschau:** Höhen kommen aus den
  Terrarium-Kacheln (≈30 m; aus dem Offline-Paket, sonst online). Auch in der Schweiz dienen sie als
  Rückfall, wenn swisstopo nicht erreichbar ist und kein Paket geladen wurde.
* **Ortssuche:** über OSM (Photon, ohne Konto); in der Schweiz zusätzlich, wenn swisstopo nichts findet.
* **Wetterprognose:** ausserhalb des Alpenraums ohne das Modell ICON-CH, Zeitzone des Ortes.
* **Meteo-Reiter (T439):** Die Pins der Lokalprognose sind MeteoSchweiz-Punkte und gibt es nur in der Schweiz.
  Liegt die Kartenmitte ausserhalb, heisst der Chip «Punkt»: ein Druck setzt einen ziehbaren Prognosepunkt ⌖ in
  die Kartenmitte, die Prognose kommt von Open-Meteo (7 Tage, Tageskacheln, Tageskarte, «Alle Tage», «Stunden &
  Hinweise»). Im Alpenraum (2–18 E / 42–50 N) rechnet weiterhin ICON-CH (MeteoSchweiz) über Open-Meteo, weiter
  entfernt wählt Open-Meteo das Modell selbst (ICON, ECMWF, GFS …) – die Quelle steht auf der Ortskarte. Die Höhe
  des Punkts kommt aus Terrarium, die Koordinaten stehen als WGS84 und MGRS. «Kartenmitte» holt den Marker zurück;
  zurück in der Schweiz heisst der Chip wieder «Orte / Pins».
  Der Chip «Pins» blendet die **Welt-Pins** an Ortschaften ein und aus (T440/T442): Städte und Orte im Ausschnitt, nach
  Bedeutung gewählt (je nach Zoom nur Grossstädte bis hin zu Kleinstädten) und wie in der Schweiz ausgedünnt, mit Piktogramm
  und min/max des gewählten Tags; sie folgen dem Ausschnitt, ein Druck auf einen Pin wählt den Prognosepunkt (hervorgehoben,
  kein Marker auf der Karte). Ohne Pins steht der Prognosepunkt in der Kartenmitte («Kartenmitte»). Die Ortsliste ist in der App
  enthalten (GeoNames, Europa ab 5 000, weltweit ab 50 000 Einwohnern) und braucht kein Netz; ab Zoom 11 kommen Dörfer
  aus OpenStreetMap (Overpass) dazu, wenn der Dienst antwortet. Die Zeile unter dem Prognosepunkt zeigt die Quelle
  («18 Orte (GeoNames) · 13 Pins»). Nur ohne Orte im Ausschnitt (offene See) erscheint ein 3×3-Raster als Ersatz.
  Quelle Ortsliste: GeoNames (geonames.org), Lizenz CC BY 4.0; Aufbau mit `tools/welt/welt_orte.js`.
* **Nur Schweiz** bleiben: Hangneigungs-Ebene (swisstopo), Skitouren/Wanderwege, CAT/ATH, Lawinenbulletin,
  SLF-Stationen, Wetterkameras, VBS-/BAZL-Ebenen, swissNAMES-Beschriftung, Routing Weg/Strasse/Skitour,
  Strassen-Info, 3D+. Beim Einschalten solcher Ebenen ausserhalb erscheint ein Hinweis. Routing und
  Beschriftung aus OSM-Daten folgen mit W4; Führungsraster und Druckkopf tragen noch LV95.

## Bedienung

«Karten» → Basiskarte: **Welt Übersicht** oder **Welt Satellit (online)** wählen (sie
ersetzen die Landeskarte; Zoom ist dann bis Stufe 2 erlaubt). Darunter die Karte
**Weltkarte** mit Zustand und Quelle:

* **Vom Host laden** – holt die Liste der Weltkarten vom Feldserver der Sitzung
  (Ordner `welt`, siehe unten). Geschieht automatisch, wenn die Übersicht eingeschaltet
  ist und eine Sitzung verbunden wird.
* **Datei wählen** – eine `.pmtiles`-Datei von der Platte (EXE und Browser; auf dem Handy je
  nach System). Es werden nur die gerade benötigten Stücke gelesen; die Datei kann mehrere
  Gigabyte gross sein. Die Auswahl gilt für die laufende Sitzung der App.
* **Einstellungen** – Adresse einer eigenen Ablage (z. B. `http://192.168.1.20:8766`; die App
  hängt `/welt/index.json` an) und der Satelliten-Jahrgang.
* **Zum Gebiet** – springt auf die Abdeckung der geladenen Datei.

Liegen beim Host mehrere Dateien, zeigt die Karte sie als Knöpfe; die zuletzt gewählte
Datei wird beim nächsten Mal bevorzugt.

## Woher die Kacheln kommen (drei Wege, gleiche Daten)

1. **Host der Sitzung.** Die Kartendatei liegt einmal auf dem Host-Laptop. Der Feldserver
   liefert sie über den Hilfsport (Port + 1, `http://<Host>:8766/welt/…`) und über den
   TLS-Hauptport (`https://<Host>:8765/welt/…`, für Handys/PWA) mit Bereichsanfragen aus.
   Jedes Gerät im Raumnetz – Browser-HTML, EXE, Handy-PWA – holt sich nur die sichtbaren
   Kacheln. Nichts muss kopiert werden. Ohne Internet.
   * **EXE:** Ordner `welt` im App-Datenordner (dort, wo auch das Feldserver-Zertifikat und
     `sitzungen` liegen; die Karte «Weltkarte» zeigt den Pfad an). Dateien hineinlegen, Sitzung
     hosten – fertig.
   * **Node-Feldserver:** `node munggi-relay.js 8765 TASKGROUP --welt C:\Karten\welt`
     (Standard: Ordner `welt` neben dem Skript).
2. **Datei auf dem Gerät.** «Datei wählen» – für Laptops ohne Sitzung.
3. **Eigene Ablage mit Internet.** Ein beliebiger Webserver, der Bereichsanfragen
   (HTTP Range) und CORS erlaubt, mit `index.json` (siehe Feldserver) – optional.

Die App prüft die Dateien beim Laden (Kopf, Kacheltyp, Abdeckung, Zoom) und zeigt die
Abdeckung an. Ausserhalb der Abdeckung bleibt die Karte leer.

## Kartendateien beschaffen (einmalig, am PC mit Internet)

Protomaps veröffentlicht täglich eine weltweite Datei (≈ 120 GB, Zoom 0–15). Man lädt
davon nur **Ausschnitte**:

1. `pmtiles`-Kommandozeile laden: https://github.com/protomaps/go-pmtiles/releases
   (`go-pmtiles_<Version>_Windows_x86_64.zip`, entpacken → `pmtiles.exe`).
2. Aktuellen Build nachsehen: **https://maps.protomaps.com/builds** – beim neuesten Eintrag den Download-Link
   kopieren (Form `https://build.protomaps.com/JJJJMMTT.pmtiles`; die Wurzel `build.protomaps.com` hat keine
   Übersicht und zeigt 404). Die 120-GB-Datei nicht laden – der Link wird nur dem `extract` übergeben.
3. Ausschnitte ziehen, z. B. (Datum einsetzen):

   ```
   pmtiles extract https://build.protomaps.com/20251030.pmtiles europa_uebersicht.pmtiles --bbox=-12,34,32,72 --maxzoom=10
   pmtiles extract https://build.protomaps.com/20251030.pmtiles oesterreich.pmtiles --bbox=9.4,46.3,17.3,49.1 --maxzoom=15
   pmtiles extract https://build.protomaps.com/20251030.pmtiles deutschland_sued.pmtiles --bbox=7.4,47.2,13.9,50.6 --maxzoom=15
   pmtiles extract https://build.protomaps.com/20251030.pmtiles italien_nord.pmtiles --bbox=6.6,43.6,13.9,47.1 --maxzoom=15
   pmtiles extract https://build.protomaps.com/20251030.pmtiles frankreich_ost.pmtiles --bbox=2.0,43.4,8.3,49.6 --maxzoom=15
   pmtiles extract https://build.protomaps.com/20251030.pmtiles liechtenstein.pmtiles --bbox=9.45,47.03,9.65,47.28 --maxzoom=15
   ```

   `--bbox=West,Süd,Ost,Nord` in Grad. Jede Zoomstufe über 12 verdoppelt die Grösse etwa;
   Richtwerte: Europa bis Zoom 10 ≈ 1–2 GB, ein Nachbarland bis Zoom 15 ≈ 3–10 GB.
   `pmtiles show datei.pmtiles` zeigt Abdeckung und Grösse. Das Skript
   `tools/welt/welt_ausschnitte.cmd` enthält die Zeilen oben zum Anpassen.
4. Dateien in den Ordner `welt` des Hosts legen (Dateiname wird zum Anzeigenamen;
   Unterstriche werden zu Leerzeichen).

**Lizenz/Namensnennung:** OpenStreetMap-Mitwirkende (ODbL), Verarbeitung Protomaps – die
App zeigt die Namensnennung in der Kartenecke. Sentinel-2 cloudless: EOX IT Services GmbH,
enthält modifizierte Copernicus-Sentinel-Daten; Jahrgänge ab 2018 CC BY-NC-SA 4.0
(nicht-kommerzielle Nutzung).

## Technik (für die Entwicklung)

* MapLibre GL zeichnet die Vektorkacheln als Unterlage der Leaflet-Karte
  (`@maplibre/maplibre-gl-leaflet`); PMTiles-Leser `pmtiles` 4.5 (Bibliothek `welt`, verzögert
  geladen). Alle Werkzeuge bleiben Leaflet-Ebenen darüber.
* Stil: `tools/welt/welt_stil.js` erzeugt aus `@protomaps/basemaps` den Feldstil
  (`src/data/welt_stil.json`, Protomaps-Schema v4, Sprache de). Strassenschilder (Sprite) sind
  vorerst weggelassen.
* Schriften: `tools/welt/welt_glyphen.js` rendert Noto Sans (SIL OFL) mit tiny-sdf in
  Chromium zu fontnik-Glyphen (24 px, Puffer 3) und bettet Latein (alle Schnitte) und
  Kyrillisch (Regular) gepackt in `src/data/welt_glyphen.json` ein; die App liefert sie über
  das Protokoll `munggi://glyphs/…`. Fehlende Bereiche ergeben keine Fehler, nur fehlende
  Schriftzeichen.
* Testdaten: `tools/welt/welt_testgebiet.js` + `welt_testgebiet_mbtiles.py` + `pmtiles convert`
  → `tests_data/welt_test.pmtiles` (synthetisches Bodensee-Gebiet, Protomaps-Schema).
* Feldserver: `munggi-relay.js` (`--welt`) und `collab_relay.rs` (Ordner `welt` im Datenordner,
  Umgebungsvariable `MUNGGI_WELT_DIR`) beantworten `/welt/index.json` (Dateiliste mit
  Kopfdaten) und `/welt/<datei>` mit `Range`, `ETag`, CORS und `OPTIONS`.

## Lawinenbulletins Ausland (EAWS, T441)

Im Reiter **Verhältnisse → Lawinen** steht vor der SLF-Karte die Karte «Lawinenbulletin Ausland (EAWS)». Der Schalter
«Bulletin-Ebene Ausland» färbt die Warnregionen der europäischen Dienste nach Gefahrenstufe; ein Druck auf eine Region zeigt
Stufe (oben/unten, Vormittag/Nachmittag), Lawinenprobleme, Texte und den Link zum Originaldienst. Ohne Datum gilt der heutige
Tag; fehlt er (Sommer, Ausfall), sucht Munggi bis sieben Tage zurück. Mit dem Datumsfeld lassen sich ältere Bulletins holen.
Geladene Stufen und Bulletins bleiben 40 Tage im Speicher und sind offline abrufbar. «Dienste im Ausschnitt» verlinkt die
Webseiten. Ausserhalb der Schweiz klappt die Karte beim ersten Mal von selbst auf.

Datenquellen: Sammelstelle der EAWS-Dienste auf avalanche.report (`static.avalanche.report/eaws_bulletins`, CAAML v6,
CC BY 4.0). Sprache (T442): zuerst die Anzeigesprache der App (Sammelstelle `…{Dienst}.de.json`, sonst Originaldienst),
dann die Standardfassung (Englisch, wo der Dienst sie liefert, sonst Landessprache, z. B. Frankreich nur Französisch); das
Popup nennt die Sprache und weist auf Abweichungen hin. Regionsgrenzen aus dem Projekt eaws-regions (CC0).

**Regionsgrenzen:** eingebettet (Stand 31.10.2026: 36 Dienste ohne Schweiz, 478 Regionen, rund 1,1 MB). Zum Auffrischen
`tools\welt\eaws_regionen.cmd` ausführen (braucht curl und Node.js): lädt vier Dateien von eaws.gitlab.io und erzeugt
`eaws\eaws_regionen.json` (vereinfacht auf rund 100 m, Meteomont und Skandinavien stärker). Diese Datei nach
`src\data\eaws_regionen.json` legen und neu bauen, oder Claude Bescheid geben.

**Kanada (T443):** Liegt der Ausschnitt über Kanada und die Ebene ist ein, erscheinen die Prognosegebiete von Avalanche Canada
(und der eingebundenen Betreiber wie Parks Canada) in derselben Ebene. Ein Druck zeigt die höchste Stufe heute, die Tabelle
Tage × Höhenbänder (alpin, Waldgrenze, unter Waldgrenze), Kernaussage, Probleme, Zusammenfassungen und Hinweise, mit Link auf
avalanche.ca. Es gibt nur die aktuelle Prognose (kein Archiv), Englisch oder Französisch. Quelle: Avalanche Canada, Nutzung
gemäss deren Bedingungen (avalanche.ca).

**USA (T444):** Über den USA (inkl. Alaska) erscheinen die Prognosezonen der rund 20 amerikanischen Lawinenzentren aus
avalanche.org (National Avalanche Center) in derselben Ebene. Ein Druck zeigt Stufe und Reiseempfehlung, allfällige
Lawinenwarnung, die Gültigkeit, die Kernaussage, die Tabelle Heute/Morgen × Höhenbänder, die Probleme, die Gefahren- und
Wetterbeschreibung und den Link auf die Prognoseseite des Zentrums. Nur aktuelle Prognose, Englisch. Nutzung gemäss den
Regeln des NAC (Farben der Skala, Link zur Prognose, abgelaufene Stufen werden grau).

**Japan (T445):** Japan hat keine Datenschnittstelle für Lawinenbulletins. Über Japan zeigt die Ebene darum Markierungen mit
groben Gebietskreisen für die sechs Gebiete des Japan Avalanche Network (Tateyama, Hakuba, Myōkō, Kagura·Tanigawa·Hotaka,
Südwest-Hokkaido, Zentral-Hokkaido) und den Niseko-Bericht; ein Druck öffnet die Links zum Bericht (Japanisch, Liste auch
Englisch) und zu den amtlichen JMA-Warnhinweisen. Keine Gefahrenstufen in Munggi.

## Reiter Karten: Seiten «Schweiz | Welt» (T449)

Oben im Reiter Karten stehen zwei Knöpfe **Schweiz** und **Welt**. Basiskarte, Lesezeichen und die Suche sind gemeinsam, die
Ebenenliste wechselt mit der Seite. Die Wahl bleibt gemerkt; die App schaltet nie von selbst um – ausserhalb der Schweiz erscheint
auf der Seite Schweiz nur der Chip «ausserhalb der Schweiz → Welt», ein Klick darauf wechselt.

**Seite Welt – Basiskarte:** eine Auswahl mit den Gruppen Schweiz (Landeskarten), Welt (Welt Übersicht aus eigenen Daten, Welt
Satellit, OpenTopoMap, CyclOSM, OSM Humanitarian, EOX Sentinel-2, Esri World Imagery), Länderkarten (basemap.at, basemap.de, IGN,
Kartverket) und Eigene. NASA-Bilder stehen hier nicht als Basis – sie sind Ebenen.

**Seite Welt – Ebenen** (Häkchen und Deckkraft wie in der Schweiz, mehrere gleichzeitig):
«Beschriftung & Wege» (EOX Beschriftung hell/dunkel, EOX Strassen, Esri Beschriftung & Grenzen, Meteo-Pins),
«NASA Erdbeobachtung» mit **Datum**, Knopf «Gestern» und Mischung oben in der Gruppe – das Datum gilt für VIIRS-, MODIS-Tagesbild
und Schneebedeckung; Black Marble und Blue Marble sind Jahreskomposite –, «Gelände & Lawinen» (Lawinenbulletin Ausland als Ebene;
das Bulletin selbst bleibt unter Verhältnisse), «Länderkarten als Ebene» (amtliche Karten und Orthofotos mit «Zur Abdeckung») und
«Eigene Quellen» (eigene URL-Vorlagen, «Quelle hinzufügen»).

Ganz unten, nur auf der Seite Welt und eingeklappt: **«Adressen & Prüfung»** (die bisherige Karte «Online-Weltkarten»: Quelle
prüfen, Adressen ändern, eigene Quellen erfassen, Quelle als Basis oder einzelne Ebene) und **«Weltkarte»** (eigene Kartendatei,
Feldserver, Sentinel-Jahrgang, Weltpaket speichern). Die Telefon-Ansicht behält ihre Chips (Schweizer Karten); die Welt-Seite ist
für die Planung am Tisch gedacht.

## Welt Topo: Schummerung und Höhenlinien (W4a, T450)

Auf der Seite Welt stehen in der Gruppe «Gelände & Lawinen» zwei Ebenen, die aus den Höhendaten gerechnet werden – weltweit,
auch ohne Kartenanbieter: **Schummerung (Relief aus Höhendaten)** und **Höhenlinien (aus Höhendaten)**. Beide lassen sich mit
Deckkraft über jede Basiskarte legen (Satellit, Welt Übersicht, Online-Karten). Die Höhenlinien haben eine Äquidistanz nach
Zoom (500 m in der Übersicht bis 20 m im Detail) oder fest 20/50/100/200 m; jede fünfte Linie ist kräftiger und beschriftet.

Die Höhen kommen aus den Terrarium-Kacheln (~30 m Raster, bis Zoom 15; näher heran wird vergrössert, mehr Detail gibt es nicht).
Ein Offline-Paket «Höhendaten» (Werkzeug Offline-Karte) wird zuerst genutzt, sonst das Netz. Die Kacheln werden im Browser
gerechnet – beim ersten Aufbau eines Ausschnitts dauert es einen Moment. Nicht im Druck und nicht in 3D.

## Karte blasser – auch für die Weltkarten (T451)

In der Basiskarten-Karte (beide Seiten) gibt es den Regler **«Karte blasser»** (0–70 %). Er schwächt die Basiskarte ab –
Landeskarte wie Weltkarten (Welt Übersicht, Welt Satellit, Online-Karten, Esri) – vor weissem Grund, so dass Höhenlinien,
Schummerung und Signaturen hervortreten. Der gleiche Regler steht wie bisher im Anzeige-Popover; beide sind gekoppelt, der Wert
bleibt gemerkt und wirkt im Druck. Die Welt-Ebenen darüber (NASA, Beschriftung) bleiben unverändert.

## Routing weltweit (W4b, T452)

Ausserhalb der Schweiz folgen die Routen des Routenplaners (Modi Weg/Strasse, Wanderweg, Skitour) nicht mehr nur der direkten
Linie: Standard ist **BRouter** (brouter.de, OSM-Wegenetz, ohne Konto) – Weg/Strasse mit dem Profil «trekking», Wanderweg und
Skitour mit «hiking-mountain» (Skitourenrouten gibt es nur in der Schweiz; die App weist darauf hin). Start und Ziel jedes
Abschnitts gehen an diesen Dienst in Deutschland; in der Karte «Weltkarte» (Seite Welt) lässt sich das mit «Routing über BRouter
(online)» abschalten.

Ohne Netz, ausgeschaltet oder wenn der Dienst nicht antwortet, rechnet die App den Abschnitt aus dem **Wegenetz der eigenen
Weltkarte** (Weltpaket oder Feldserver): die Strassen- und Wegelinien der Kacheln im Rechteck um den Abschnitt werden zu einem
Graphen verbunden und der kürzeste Weg gesucht – Weg/Strasse über alle Strassen und Wege, Wanderweg nur Wege und Nebenstrassen,
Skitour nur Wege. Das reicht bis etwa 50 km je Abschnitt; darüber oder ohne Kartendaten wird der Punkt direkt verbunden und die
App sagt es. Die Hinweiszeile beim Zeichnen nennt die Quelle («über BRouter (OSM)» oder «aus dem Weltpaket»).

## Export mit Welt-Karteneinstellungen (T453)

Was auf der Karte eingeblendet ist, kommt in die Exporte: Routenplan-PDF, Führungsraster, SpotMap und die massstabsgetreuen
Ausdrucke (Layer-Export als Kartenblatt, «Karte drucken») übernehmen die Welt-Basiskarte (Welt Übersicht, Welt Satellit,
Online-Karten wie Esri), **Welt Topo** (Schummerung, Höhenlinien) und die **Welt-Ebenen darüber** (NASA, EOX-/Esri-Beschriftung)
mit ihrer Deckkraft, dazu «Karte blasser». Die Mischung «Multiplizieren» wird im Export nicht nachgebildet. Beim Kartenblatt wartet
die Aufnahme, bis die Welt-Ebenen geladen sind (höchstens 15 s).

Behoben: Beim Zoomen weit aus dem Bereich der eigenen Weltkarte erschien die Fehlermeldung «Cannot read properties of undefined
(reading 'clearFadeHold')» (Fehler in der eingebetteten MapLibre-Bibliothek 3.6.0, hier korrigiert).

## Online-Karten als Ebene darüber (T447)

Jede Quelle der Karte «Online-Weltkarten» lässt sich statt als Basiskarte auch **als Ebene über der Basiskarte** zeigen
(«Als Ebene darüber»). Darunter bleibt die gewohnte Karte – Landeskarte, Welt Übersicht/Satellit oder eine andere Online-Karte –,
so dass sich etwa die NASA-Schneebedeckung über der swisstopo-Karte am genauen Standort prüfen lässt. In der Ebenenliste erscheint
die Zeile **«Welt-Ebene online (Auswahl unten)»** (Gruppe «Beschriftung & Wege») mit Häkchen und Deckkraft-Regler; in der Karte
«Online-Weltkarten» stehen Deckkraft (Vorgabe 85 % für die Schneekarte, sonst 100 %) und die Mischung (Normal, Multiplizieren –
die Karte darunter bleibt lesbar –, Aufhellen). Deckkraft je Quelle und Mischung werden gemerkt; die Ebene erscheint nach
einem Neustart nicht von selbst.

Neu im Katalog, nur als Ebene (transparent): **EOX Beschriftung hell** (Ortsnamen, Grenzen, Gewässer in Weiss – für Satellit,
Sentinel-2, Blue Marble), **EOX Beschriftung dunkel** (für helle Karten und Tagesbilder) und **EOX Strassen** (OSM-Strassennetz).
Damit wird aus «Welt Satellit» oder «EOX Sentinel-2 cloudless» eine beschriftete Satellitenkarte (bis Zoom 16, Namensnennung
«Data © OpenStreetMap contributors, Rendering © EOX and MapServer»). Diese Einträge sind als Basiskarte gesperrt.

Esri World Imagery (T448, Entscheid Rafael 06.11.): weltweites Luftbild bis unter 1 m als Basiskarte, dazu «Esri Beschriftung & Grenzen»
als Ebene. Kein Konto und kein Schlüssel nötig (Kachelpfad `server.arcgisonline.com`). Gedacht für Übungen – jeder Kartenausschnitt
wird bei Esri in den USA abgefragt, im Einsatz deshalb nicht verwenden. Sollte Esri den Pfad schliessen, zeigt «Quelle prüfen» einen
Fehler; die Adresse ist wie bei allen Quellen in den Einstellungen änderbar.

Nicht enthalten: Die Ebene erscheint nicht im Druck/PDF und nicht in der 3D-Perspektive (nur 2D-Karte).

## Routen-Check und Lawinenbeurteilung mit dem Auslandsbulletin (L6, T454)

Ausserhalb der Schweiz greifen die Einschätzung (Werkzeug Lawinen-Einschätzung, Hinweis «Lawinenbulletin <Dienst>: Stufe») und das
Vorbefüllen der Lawinenbeurteilung (Verhältnisse → «Aus Bulletin übernehmen», Routenplaner) auf die ausländischen Bulletins zu:
EAWS-Regionen (Nachbarländer, Norwegen, Schweden, Slowenien) mit Gefahrenstufe nach Höhenband, Lawinenproblemen, Expositionen und
Texten; Kanada und USA mit der Gefahrenstufe je Gebiet (Höhenbänder, sofern das Prognoseprodukt geladen ist; keine Probleme).
Die Kopfzeile der Beurteilung nennt den Dienst, etwa «Lawinenbulletin LWD Tirol (Ausland) vom …»; Routen über die Grenze
verbinden SLF und Auslandsbulletin. Die Bulletins der sichtbaren Dienste werden still nachgeladen, sobald die Karte ausserhalb der
Schweiz steht (Datum wie die EAWS-Ebene, bis 7 Tage zurück, aus dem Speicher wenn offline). «Waldgrenze» als Höhenangabe wird
für die Stufe am Punkt in den Alpen mit 1900 m angesetzt. Japan liefert keine Stufen und bleibt aussen vor.

## Weltpaket, Druck und 3D (W3, T446)

**Weltpaket:** In der Karte «Weltkarte» speichert «Weltpaket speichern» die aktuelle Quelle (Datei, Host oder Adresse) als
`…_welt.kocoamap`. Dieses Paket lädt wie jede Offline-Karte (Karten → Offline-Karte → Laden, oder aus der Offline-Bibliothek) und
setzt die Weltkarte als Quelle – ohne Feldserver, auch ohne Netz. Höhen für Profile und 3D ausserhalb der Schweiz kommen aus
den Terrarium-Kacheln; sie lassen sich mit dem Offline-Werkzeug («Höhendaten» für ein Rechteck) mitnehmen, die Quelle ist weltweit.

**Druck und PDF:** Ist die Weltkarte oder eine Online-Weltkarte die Basiskarte, drucken Routenblatt, Führungsraster, SpotMap,
CONOPS-Karten und «Karte drucken» mit dieser Karte. Die Vektorkarte wird dafür im Hintergrund in Blöcken gezeichnet (ein paar
Sekunden je Blatt).

**3D-Perspektive:** Im 3D-Fenster stehen «Weltkarte (Paket/Host)» und «Welt online (…)» zur Wahl; ausserhalb der Schweiz wird die
aktive Weltkarte beim Öffnen automatisch gewählt, in der Schweiz wieder SwissImage. Das Gelände (Terrarium) ist weltweit. Die
3D+-Ansicht (Cesium, swisstopo-Daten) bleibt auf die Schweiz beschränkt.
