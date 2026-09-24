# Munggi-App – Austausch mit anderen Systemen (KML/KMZ, CoT, ATAK), Stand T254 (2026-09-20)

## Wo

* PC: Führungsunterlagen → Kasten «🔁 Austausch mit anderen Systemen» (direkt unter dem KML/KMZ-Export):
  «📥 Importieren», «🎯 CoT-Ereignisse (.cot)», «📦 ATAK-Datenpaket (.zip)».
* «Laden» im Kopf nimmt neben Projekten (.json) auch .kml, .kmz, .cot, .xml, .zip und .gpx entgegen.
* Dateien lassen sich auch direkt auf die Karte ziehen (PC).
* Suche (Ctrl+K): «Importieren», «Export als CoT», «Export als ATAK-Datenpaket».
* Handy: Mehr → «📥 KML/CoT importieren» (Dateiauswahl des Systems).

## Import

Nach der Dateiauswahl zeigt ein Fenster, was in der Datei steckt (Punkte, Linien, Flächen, Kreise, Routen, Standorte,
Meldungen, Ordner) und fragt nach dem Ziel:

* **Kategorie** (KOCOA) und **Seite** (Allgemein / BLAU / ROT) sowie **Ebene** (Name der Arbeitsebene).
* **Je KML-Ordner eine eigene Ebene** – sinnvoll bei Google-Earth-Dateien mit Ordnerstruktur.
* **Linien als Routen importieren** – die Linien werden zu Munggi-Routen (Höhenprofil, Marschzeit, Zeitplan).
* Die Karte zoomt danach auf das Importierte; die Ebenen werden sichtbar geschaltet.

Was verstanden wird:

* **KML / KMZ** (Google Earth, map.geo.admin, QGIS, ATAK-Exporte): Punkte, Linien, Flächen, MultiGeometry, gx:Track
  (z. B. GPS-Aufzeichnungen), Stile (Linienfarbe/-breite, Symbolfarbe), Beschreibung und ExtendedData/SchemaData als Bemerkung.
  Bodenüberlagerungen (Bilder) werden nicht importiert.
* **Munggi-eigene KML/KMZ-Exporte** werden erkannt: Kategorie, Seite, Ebene, Objekttyp (auch Kreise mit Radius),
  Signaturen (Signaturschlüssel, Zuordnung), Formationen (ab T265 vollständig mit allen Feldern), taktische Linien/Flächen, Routen und die KOCOA-Eigenschaften kommen zurück.
* **KML aus Führungsapplikationen (APP-6A / MSS)** (ab T265): Placemarks mit dem Sachdatum `App6aXmlTxt` (15-stelliger
  Symbolcode nach APP-6A/2525B, z. B. `SFGPUCIO---D---`, plus Modifikatoren) werden zu Munggi-Formationen nach APP-6D:
  Zugehörigkeit (Seite BLAU/ROT automatisch, wenn im Dialog «Allgemein» steht), Truppengattung, Stufe (Trupp … Armee),
  HQ/Task Force, Status (geplant gestrichelt), verstärkt/vermindert (+/−), Bezeichnung, übergeordnete Formation, Zusatzinfo,
  Stabsbemerkung. `SYMBOL_NAME` wird mit der Schweizer Signaturliste abgeglichen («Gebirgsspezialisten» → Gebirgsstern).
  Die Einsatzfähigkeit `XF` (GREEN voll / YELLOW teilweise / RED nicht einsatzfähig) wird zum APP-6-Status und als
  Statusbalken nach Standard gezeigt; weitere Herstellerfelder (XB, XE, GUID) stehen in der Bemerkung. Taktische Zeichen (Schema `G`, ab T266): Hauptangriff, Nebenangriff/Unterstützungsangriff, Scheinangriff, Luftangriff,
  Ablauf-/Phasenlinie, Abschnittsgrenze, VLOT, Bereitschaftsraum, Beobachtungsposten, Checkpoint … werden Munggi-Signaturen (Breite der
  Angriffspfeile aus dem Export, geplant = gestrichelt); Zielräume und unbekannte Zeichen kommen als beschriftete Zeichnungsflächen/-linien.
* **CoT-XML** (.cot, .xml; ein oder mehrere `<event>`) und **ATAK-Datenpakete** (.zip mit MANIFEST/manifest.xml):
  Marker (Typ `a-f…` → BLAU, `a-h…` → ROT, andere → gewählte Seite; Farbe, Rufname, Bemerkung), Zeichnungen `u-d-f`
  (Linie oder Fläche), Rechtecke `u-d-r`, Kreise `u-d-c-c`, Routen `b-m-r` (werden Munggi-Routen), 9-Line `b-r-f-h-c`
  (Punkt mit Meldungstext), Standortmeldungen anderer TAK-Geräte (PLI) in die Ebene «CoT-Standorte».

## Export

* **🎯 CoT-Ereignisse (.cot):** alle Objekte der Lage (Häkchen «nur sichtbare Ebenen» gilt auch hier), der eigene
  GPS-Standort als Position (PLI) und die Meldungen aus dem Sitzungs-Chat (9-Liner als MEDEVAC-Ereignis `b-r-f-h-c`,
  übrige als Marker mit dem Meldungstext) in einer XML-Datei.
* **📦 ATAK-Datenpaket (.zip):** dieselben Ereignisse als Datenpaket – je Ereignis eine .cot-Datei plus Manifest.
  In ATAK: Import-Manager → Datei wählen; in iTAK/WinTAK entsprechend. Marker erscheinen mit Rufname, Farbe und
  Bemerkung (Kategorie › Seite › Ebene, KOCOA-Bemerkung), Signaturen als Einheiten-Marker nach Zuordnung
  (BLAU `a-f-G-U-C`, ROT `a-h-G-U-C`, neutral `a-n`, unbekannt `a-u`; APP-6-Code in der Bemerkung).
* Jedes Ereignis trägt zusätzlich ein `<munggi>`-Detail mit dem vollständigen Munggi-Objekt: Wird die Datei später wieder
  in Munggi importiert, sind Kategorie, Ebene, Eigenschaften und Geometrie 1:1 zurück. TAK-Systeme ignorieren das Detail.

## Grenzen

* Es ist ein Dateiaustausch – keine Live-Verbindung zu einem TAK Server. Für Live-Betrieb wäre eine CoT-Brücke im
  Feldserver der nächste Schritt (Roadmap).
* Munggi führt keine 2525-/APP-6-Codes in den CoT-Typen; Einheiten werden auf Stufe «Bodentruppe» (`…-G-U-C`) abgebildet.
  Sichtfelder/Wirkungsbereiche werden als Kreise mit Radius exportiert, Bodenüberlagerungen (Bilder) gar nicht.
* Symbole aus KML-Icons (URL) werden als farbige Punkte übernommen; Signaturen entstehen nur aus Munggi-eigenen Exporten.

## Ab T261: Was ATAK aus dem Datenpaket macht

* **Routen** erscheinen als ATAK-Route: Stützpunkte sind Kontrollpunkte (unsichtbar), Checkpoints gibt es an Start, an jeder
  Teilstrecken-Grenze («CP1 08:35» – Uhrzeit, wenn in Munggi ein Zeitplan steht), an Schlüsselstellen (Name = Notiz) und am Ziel.
  Die Teilstrecken mit Distanz, Höhenmetern, Minuten und Ankunft stehen in den Bemerkungen der Route.
* **Signaturen** erhalten den CoT-Typ aus dem APP-6D-Symbolcode: Zugehörigkeit (BLAU → f, ROT → h, Neutral → n, Unbekannt → u),
  Dimension (Landeinheit, Gerät, Anlage, Luft, See) und Funktion nach MIL-STD-2525C (Infanterie, Panzer, Artillerie, Aufklärung,
  Genie, Sanität, Übermittlung, Nachschub …). ATAK zeichnet Rahmen, Farbe und Funktionszeichen; Truppenstufe und Modifikatoren
  wie «Gebirge» kennt CoT nicht – sie stehen mit dem vollständigen Code in den Bemerkungen. Taktische Punkte (Beobachtungsposten,
  Stellungen …) erscheinen als generischer Rahmen in der Seitenfarbe mit dem Namen.
* **Geofence (ab T262, Wirkungsbereiche ab T267):** Flächen, Kreise und Wirkungsbereiche mit Selbstwarnung (warnen beim Betreten / Verlassen / beidem) gehen als
  ATAK-Geofence mit (Auslöser Entry / Exit / Both, Überwachung «All»). ATAK legt die Form als Geofence an und alarmiert;
  umgekehrt wird ein ATAK-Geofence in Munggi zur Fläche mit Selbstwarnung.
* **Ab T263:** Alle Schnittstellen stehen im eigenen Bereich **«Austausch»** des Werkzeugfensters (nach «Führungsunterlagen»):
  ATAK/CoT (Import, CoT-Ereignisse, Datenpaket, Häkchen «SpotMap mitgeben»), KML/KMZ, GPX. **SpotMaps** gehen als beschriftete
  Formen ins ATAK-Paket: Felder, Seen und Gebäude als gefüllte Flächen, Strassen und Bäche als Linien, jeweils mit dem Taufnamen;
  ausgeblendete SpotMaps bleiben draussen.
