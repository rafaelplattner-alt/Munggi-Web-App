# Munggi - App (KOCOA) als installierte App – ohne App Store, ohne Adminrechte

Dieses Paket macht die «Munggi - App» (KOCOA) als **installierbare Web-App (PWA)** verfügbar –
auf **iPad** (über Safari) und auf **Windows/Bundeslaptop** (über Edge). Beides
funktioniert ohne App Store, ohne Entwicklerkonto und ohne Adminrechte.

Die einzige Voraussetzung: Die Dateien müssen **einmal über eine
https-Adresse** erreichbar sein. Danach installiert sich jeder Nutzer die App
selbst, und sie läuft anschliessend auch offline.

---

## Inhalt des Pakets

```
kocoa-web/
├── index.html                 die KOCOA-App
├── manifest.webmanifest       macht sie installierbar (Name, Icon, Vollbild)
├── sw.js                      Service Worker → Offline-Betrieb
├── icon-180.png               Icon für iPad-Home-Bildschirm
├── icon-192.png / icon-512.png  Icons für Manifest / Edge
└── ANLEITUNG-HOSTING-UND-INSTALLATION.md   diese Datei
```

Alle Dateien gehören **in denselben Ordner** auf dem Server (nicht umbenennen,
nicht in Unterordner verteilen – die Namen sind in der App fest referenziert).

---

## Schritt 1: Bereitstellen über https

Es genügt ein Ort, der statische Dateien über **https** ausliefert. Möglich sind
z. B.:

- ein interner Webserver (IIS, Apache, nginx) – Ordnerinhalt hineinlegen, fertig
- eine SharePoint-/Intranet-Bibliothek, die HTML direkt ausliefert
- jeder andere statische https-Webspace, den deine Organisation freigibt

Wichtig ist nur:
- Adresse beginnt mit **https://** (nicht http, nicht file://) – sonst
  registriert sich der Service Worker nicht und die Installation entfällt.
- `sw.js` wird als JavaScript ausgeliefert und `manifest.webmanifest` als
  Textdatei (die meisten Server tun das automatisch; nur bei Fehlern anpassen).

Danach ist die App unter z. B. `https://intranet.example/kocoa/` erreichbar.

---

## Schritt 2a: Installation auf dem iPad (Safari)

1. Adresse in **Safari** öffnen (nicht in einem anderen Browser – nur Safari
   kann auf iOS/iPadOS Web-Apps installieren).
2. Einmal vollständig laden lassen (damit der Offline-Speicher greift).
3. Auf das **Teilen-Symbol** tippen (Quadrat mit Pfeil nach oben).
4. **„Zum Home-Bildschirm"** wählen → Namen bestätigen.
5. Das KOCOA-Icon erscheint auf dem Home-Bildschirm. Ab jetzt startet die App
   im **Vollbild ohne Safari-Leiste** und funktioniert offline.

Offline-Karten werden wie gewohnt **in der App** heruntergeladen (Offline-Paket-
Funktion). Tipp: Projekte zusätzlich über „Projekt speichern" als Datei sichern –
iOS kann bei sehr knappem Speicher Web-App-Daten auslagern.

**Offline-Pakete bleiben nur pro Adresse erhalten.** Der Browser-Speicher gehört zur Adresse, unter der die
App geöffnet wurde. Wird sie einmal über den Feldserver (z. B. http://192.168.1.5:8765) und einmal über eine
andere Adresse oder als Home-Bildschirm-App geöffnet, sind das getrennte Speicher – die Pakete «fehlen» dann
scheinbar. Darum: die App auf dem Handy immer über dieselbe Adresse (am besten die installierte Home-
Bildschirm-App) nutzen. Ab T260 speichert die App den Paketinhalt selbst (in 16-MB-Stücken) statt eines
Verweises auf die gewählte Datei; im Abschnitt «Offline-Karte» zeigt eine Diagnosezeile Speicherort,
Beständigkeit und das Ergebnis beim Start.

---

## Schritt 2b: Installation auf dem Bundeslaptop (Edge)

1. Adresse in **Microsoft Edge** öffnen und laden lassen.
2. Menü **„…"** (oben rechts) → **Apps** → **„Diese Website als App
   installieren"**. (Alternativ erscheint rechts in der Adressleiste ein
   kleines Installations-Symbol.)
3. Die App bekommt ein eigenes Fenster und einen Startmenü-Eintrag – **ganz
   ohne Adminrechte**, weil Edge das pro Benutzer einrichtet und keine fremde
   `.exe` ausgeführt wird.

Damit ist die App auf dem gesperrten Gerät als „installierte" Anwendung
nutzbar, obwohl EXE-Dateien dort blockiert sind.

---

## Neue App-Version einspielen

1. Neue `index.html` auf dem Server ersetzen.
2. In **`sw.js`** die Zeile `const CACHE = 'kocoa-v1-...'` hochzählen
   (z. B. `kocoa-v2-...`). Das ist wichtig, damit die installierten Geräte die
   neue Version laden statt der alten aus dem Offline-Speicher.
3. Beim nächsten Start (online) aktualisieren sich die Geräte automatisch.

Der Build-Stempel unten in der Koordinatenleiste zeigt, welche Version läuft.

---

## Häufige Stolpersteine

| Symptom | Ursache / Lösung |
|---|---|
| „Zum Home-Bildschirm" fehlt / kein Vollbild | Nicht in Safari geöffnet, oder Adresse ist nicht https |
| Edge zeigt kein „Als App installieren" | Seite über http statt https geladen, oder `manifest.webmanifest` wird nicht ausgeliefert |
| App startet offline nicht | Beim ersten Mal war das Gerät nicht online → einmal mit Netz öffnen |
| Nach Update alte Version | `CACHE`-Zahl in `sw.js` wurde nicht erhöht |
| Karten bleiben leer | Firewall/Proxy blockiert die Kartenserver (z. B. wmts.geo.admin.ch) – bzw. Offline-Pakete in der App laden |

---

Falls kein interner https-Ort verfügbar ist: melde dich – dann finden wir eine
Alternative (z. B. eine sehr kleine, offiziell freigegebene Bereitstellung oder
den offiziellen Freigabeweg über die IT).

---

## Stand dieses Pakets

Build **T100-2026-08-20** – enthält u.a.: Tab «Führungsunterlagen» (Führungsraster mit PPTX-Export, SpotMap-Geländetaufe inkl. 3D), Rechtsklick-/Langdruck-Werkzeugrad, Fixieren-Funktion, Offline-Paket «Wegnetze & Vektordaten» (Routen-Folgen, Isochronen und Scans offline), Offline-Zoombegrenzung sowie Maskottchen Munggi.

## Stand T245 (2026-09-17)

Neu gegenüber T239: Track-Aufzeichnung, Missweisung, Bullseye, Rückwärtseinschnitt, Geofence,
Routen-Navigation, Objektliste; Sitzung mit Live-Standorten, Chat und optionaler Passphrase
(Ende-zu-Ende verschlüsselt). Hinweis: Die Verschlüsselung braucht einen sicheren Kontext –
genau die https-Bereitstellung aus Schritt 1 (oder die Windows-EXE). Auf dem Handy zeigt die
Leiste unter der Karte nur noch Build und Copyright. Beim ersten Start erscheint der
Startbildschirm (Offline-Karte laden, Touren importieren …) statt der automatischen Einführung.

## Stand T246 (2026-09-17) – Feldserver: Handys treten der Sitzung bei

Handys (installierte PWA, https) dürfen keine unverschlüsselte ws://-Verbindung ins LAN öffnen.
Der Sitzungs-Server nimmt darum jetzt auf demselben Port auch TLS (wss://) an und liefert die
PWA selbst über https aus – dann braucht es für den Feldeinsatz **kein Internet-Hosting** mehr:

* **Mit der Windows-EXE (empfohlen):** «🤝 Sitzung» → Hosten. Die EXE zeigt QR-Code und
  Adressen: Hilfsseite `http://<IP>:8766/` (Zertifikat + Anleitung für iPhone/Android),
  App `https://<IP>:8765/` (diese PWA, aus der EXE ausgeliefert), Sitzung `<IP>:8765`.
* **Ohne EXE:** die beiden Dateien `munggi-relay.js` und `feldserver-anleitung.html` aus diesem
  Zip in einen Ordner legen, das Zip daneben nach `pwa` entpacken und starten:
  `node munggi-relay.js 8765 CODE --www pwa` (Zertifikat wird mit openssl erzeugt; ohne openssl
  `--cert-dir` auf den Ordner KOCOA-Daten einer EXE zeigen).

Auf jedem Handy wird das Zertifikat «Munggi Feldserver» einmal installiert (Anleitung auf der
Hilfsseite). Einzelheiten: ANLEITUNG-MEHRPLATZ-SITZUNG.md, Abschnitt «Feldserver».
Die Adressen im Zertifikat sind die des Host-PCs beim ersten Hosten plus 192.168.137.1 (Windows-
Hotspot) – der Hotspot ist deshalb der einfachste Weg zu einer dauerhaft gültigen Adresse.

## Stand T247 (2026-09-18)

Geofence-Alarm mit Ton, Vibration (Android), rotem Bildschirmrand und System-Benachrichtigung (Erlaubnis wird beim Setzen
einer Geofence bzw. über «Alarm testen» erfragt; auf dem iPhone braucht es dafür die installierte App vom Home-Bildschirm),
Linienfarben bleiben nach dem Laden erhalten, Routen-Knöpfe unter den Reitern, Tourenblatt am Handy einspaltig und
schliessbar. Der Service Worker (Cache v139) öffnet die App beim Tippen auf eine Alarm-Benachrichtigung.

## Stand T248 (2026-09-18)

Profil Tour: Antippen einer Tour (Liste oder Gipfel auf der Karte) öffnet zuerst eine Vorschau mit Kennzahlen, Beschreibung
und Gefahren sowie den Knöpfen «Tourenblatt», «Auf Karte» und «Tour übernehmen» – erst «Tour übernehmen» macht sie zur
aktiven Tour. Cache v140.

## Stand T249 (2026-09-18) – P2P-Sitzung ohne Laptop

Mehr → «📱 P2P-Sitzung»: Geräte verbinden sich direkt über den Hotspot eines Handys (WebRTC), Beitritt per QR-Code
(Einladung scannen, Antwort zurückscannen), jedes Mitglied kann weitere einladen. Kamera und WebRTC brauchen die
installierte App (https). Einzelheiten und Grenzen in ANLEITUNG-MEHRPLATZ-SITZUNG.md, Abschnitt «P2P-Sitzung». Cache v141.

## Stand T250 (2026-09-18) – Meldungen an die Sitzung

9-Liner MEDEVAC, LZ Brief, SITREP, Beobachtungsmeldung, Standortmeldung und Notfall-Standort haben den Knopf «📡 An Sitzung»:
Die Meldung geht an alle Teilnehmer der aktiven Sitzung – gleich, ob über Feldserver oder P2P – als Karte im Chat mit
Lesebestätigung; 9-Liner und Notfall lösen beim Empfänger den Alarm aus (Ton, Vibration, roter Rand). «Öffnen» beim Empfänger
füllt sein Formular mit den empfangenen Angaben, «Auf Karte» zeigt den Standort. Cache v142.

## Stand T251 (2026-09-19) – Mesh über LoRa (Meshtastic)

Mehr → «📡 Mesh (LoRa)»: eigenes Meshtastic-Gerät (Heltec V3) anbinden – am Android-Handy per Bluetooth (installierte App
vom Home-Bildschirm, Chrome), am PC per USB. Knoten erscheinen auf der Karte, Chat und Meldungen gehen zusätzlich ins Mesh,
der eigene Standort gedrosselt. iPhones haben keinen direkten Zugang; sie erhalten Mesh-Knoten und -Meldungen über die
Brücke eines Android-/PC-Geräts in derselben Sitzung. Einzelheiten in ANLEITUNG-MESH-LORA.md. Cache v143.

## Stand T252 (2026-09-19) – Feinschliff

Startfenster löst kein Vollbild mehr aus (Offline-Karte laden bleibt bedienbar), Kriterium «Tarnwirksamkeit» statt
«Entdeckungsrisiko», Objektliste und Bearbeitungsfenster aufgeräumt, Missweisung/Alarme kompakt, Artillerie-Promille als
Standard bei Rückwärtseinschnitt und Kompass (Missweisung auch in A‰ eingebbar), Routenplan-PDF mit einer Tabelle
«Teilstrecken & Zeitplan». Cache v144.

## Stand T253 (2026-09-20) – Handy: mehr Karte, Sparmodus

Querformat: Tab-Leiste rechts als Seitenleiste, die Karte nutzt die ganze Höhe; 3D+-Kopfzeile einzeilig (Ebenen hinter ☰).
Karten-Blatt mit Abschnitt «Offline» (Paket laden, Pakete & Herunterladen) und «Kartendetail». Sparmodus gegen Hänger auf
dem iPhone: Kartendetail-Standard «normal» (im Karten-Blatt umstellbar), sparsamere Kachel- und 3D+-Einstellungen,
Gebäude in 3D+ am Handy standardmässig aus. Cache v145.

## Stand T254 (2026-09-20) – Import KML/KMZ/CoT, Export für ATAK

Mehr → «📥 KML/CoT importieren»: KML/KMZ (Google Earth, map.geo.admin, ATAK), CoT-Dateien und ATAK-Datenpakete werden in
Arbeitsebenen importiert; Munggi-eigene Exporte kommen vollständig zurück. Am PC zusätzlich Export als CoT-Ereignisse oder
ATAK-Datenpaket (Führungsunterlagen → «Austausch mit anderen Systemen»). Einzelheiten in ANLEITUNG-AUSTAUSCH-KML-COT.md. Cache v146.

## Stand T255 (2026-09-20) – Vorbereitung native Android-Hülle

Für die PWA ändert sich nichts Sichtbares. Das App-Modul erkennt eine native Hülle (Capacitor) und nutzt dann
Hintergrund-GPS, Bluetooth LE für Meshtastic, System-Benachrichtigungen und Wachhalten; im Browser/als PWA bleibt es
wirkungslos. Das Android-Projekt ist separat verpackt (Munggi-Android-Huelle_T255.zip, BAUANLEITUNG-ANDROID.md). Cache v147.

## Stand T256 (2026-09-20) – iOS-Hülle über Codemagic, Datei-Export in der Hülle

Für Browser und PWA keine sichtbare Änderung. In der nativen Hülle (Android/iOS) laufen Datei-Downloads (Projekt, PDF,
KML, CoT, GPX, CSV) neu über das System-Teilen-Blatt («In Dateien sichern», AirDrop, Mail …). Das iOS-Projekt und der
Cloud-Bau ohne Mac sind im separaten Paket Munggi-Native-Huelle_T256.zip (BAUANLEITUNG-IOS.md) beschrieben. Cache v148.

## Stand T257 (2026-09-20) – Vibration in der iOS-Hülle

Nur für die native Hülle: Alarme vibrieren jetzt auch auf dem iPhone (Haptik-Plugin); Mitteilungen vibrieren bei
Stummschalter bzw. bei «Ton aus, Vibration an» ohne Ton. Browser/PWA unverändert. Cache v149.

## Stand T258 (2026-09-20) – Handy: Tab «Werkzeuge» öffnet das Werkzeug-Panel

In der Vollansicht öffnet der Tab «Werkzeuge» neu das Panel mit Analyse/Messen/Routen (nochmals tippen schliesst).
Das Werkzeugrad bleibt erreichbar: Tab lange drücken oder Knopf «◎ Werkzeugrad» oben im Panel. In den Profilen Einsatz
und Tour bleibt das Rad das Erste. Cache v150.

## Stand T259 (2026-09-21) – Hangneigung 3D, Linie → Route, Routen-Einsehbarkeit

Hangneigung auch in der 3D-Karte (mit Deckkraft), gezeichnete Linie als Route übernehmen, Laufrichtung einer Route
umkehren, Funkabdeckung-Standard stehende Person/stehende Person, Einsehbarkeit entlang einer Route (rot = von dort
einsehbar), 3D+ läuft jetzt auch aus der HTML-Datei, «Gebäude messen» in 3D+ (online).

## Stand T260 (2026-09-23) – Mesh-Team, Chat-Empfänger, Chat-Reiter, Offline-Pakete beständig

Mesh: Team-Filter (★ / Namens-Präfix) – nur eigene Knoten auf Karte, Liste, Brücke und im Chat; fremde Nachrichten
getrennt im Mesh-Fenster; Empfänger im Chat wählbar (Alle / Teilnehmer / Mesh-Knoten als Direktnachricht). Handy:
Reiter «Chat» mit Zähler in der unteren Leiste; Mehr-/Melden-/Karten-Blatt liegt jetzt über offenen Fenstern (Chat,
Mesh, Route) – vorher öffnete es sich dahinter; Munggi tiefer. Offline-Pakete werden in Stücken beständig gespeichert,
alte Einträge umgewandelt, Diagnosezeile im Offline-Abschnitt.

## Stand T261 (2026-09-24) – ATAK-Austausch

CoT-Datenpaket: Routen kommen in ATAK als Route mit Kontrollpunkten an (Checkpoints nur an Start, Teilstrecken-Grenzen mit
Ankunftszeit, Schlüsselstellen und Ziel; Teilstrecken-Tabelle in den Bemerkungen); Signaturen tragen den aus dem APP-6D-Code
abgeleiteten 2525C-Typ (Zugehörigkeit, Dimension, Funktion – z. B. blaue Infanterie statt gelber Einheit).

## Stand T262 (2026-09-24) – Geofence nach ATAK

Geofence-Flächen und -Kreise tragen im CoT-Datenpaket das ATAK-Geofence-Detail (Betreten/Verlassen/beides); ATAK-Geofences
kommen als Fläche mit Selbstwarnung zurück.

## Stand T263 (2026-09-24) – Karten, Bereich «Austausch», SpotMap → ATAK

Nach dem Laden eines Offline-Pakets keine Aufforderung «Datei erneut auswählen» mehr; Gebietsauswahl fürs Paket lässt sich aufheben
(Knopf, Zuklappen des Abschnitts, nach dem Herunterladen); 3D+ startet offline ohne Rückfrage, wenn die Bibliothek im
Browser-Zwischenspeicher liegt (einmal online geöffnet) oder der Ordner «cesium» neben der App liegt. Neuer Bereich «Austausch»
(ATAK/CoT, KML/KMZ, GPX); SpotMap-Elemente als beschriftete Formen im ATAK-Paket.

## Stand T264 (2026-09-24) – Handy: «Mehr» vollständig

In der Vollansicht enthält «Mehr» ab dem ersten Öffnen alle Einträge (Chat, Live-Standorte, Alarm testen, P2P-Sitzung, Mesh, KML/CoT
importieren) – bisher erschienen sie erst nach einem Profilwechsel.

## Stand T265 (2026-09-24) – KML-Import aus Führungsapplikationen

Signaturen aus KML-Exporten der Führungsapplikation (APP-6A/MSS-Codes in den Sachdaten) werden als APP-6D-Formationen importiert –
mit Truppengattung, Stufe, verstärkt/vermindert, Bezeichnung/Zusatzinfo, Seite nach Zugehörigkeit und Einsatzfähigkeit als APP-6-Status. Munggi-eigene
KML-Exporte bringen Formationen vollständig zurück. Details: ANLEITUNG-AUSTAUSCH-KML-COT.md.

## Stand T266 (2026-09-24) – KML-Import Teil 2: taktische Zeichen

Linien- und Flächenzeichen der Führungsapplikation (Hauptangriff, Nebenangriff, Zielraum, Ablauf-/Phasenlinien, Räume) werden
Munggi-Signaturen; Angriffspfeile mit Breite aus dem Export (Regler bis 5000 m), geplante Zeichen gestrichelt.

## Stand T267 (2026-09-24) – Wirkungsbereich-Geofence, iPhone, Kompass, CONOPS

Wirkungsbereich (Analyse) mit Geofence-Warnung und Übergabe ins ATAK-Paket; iPhone zoomt beim Tippen in Eingabefelder nicht mehr in die
Seite; Kompass am Handy zeigt kipp-unabhängig nach Norden (nach Aktivierung Sensorfreigabe erteilen); CONOPS-Lagebilder ohne Hinweiszeile.

## Stand T268 (2026-09-26) – Lawinenbulletin vollständig

Die Ebene «Lawinenbulletin» zeigt ausserhalb der Saison das zuletzt publizierte Bulletin (deutlich als «nicht mehr gültig» markiert);
das Bulletin-Fenster (Knopf «Bulletin» neben der Ebene, am Handy im Karten-Blatt) enthält Gefahrenstufe, Expositionsrose,
Lawinenprobleme und den vollständigen Begleittext in Deutsch, Französisch, Italienisch oder Englisch, ein Datum lässt sich wählen,
die letzten 30 Bulletins bleiben je Sprache gespeichert und stehen offline zur Verfügung. Messstationen: am Handy als Chip
«Messstationen», mit 72-Stunden-Verlauf. Quelle: SLF (CC BY 4.0).

## SLF-Messstationen (IMIS) in der PWA – optionale Weiterleitung (T288)

Der Messwert-Dienst des SLF (`measurement-api.slf.ch`) erlaubt keinen direkten Abruf aus dem Browser (kein CORS-Header).
In der nativen iPhone-/Android-App holt die Hülle die Daten selbst; in der PWA braucht es eine Weiterleitung auf dem Hoster:

- **Netlify:** die mitgelieferte Datei `_redirects` genügt (`/imis-api/* → https://measurement-api.slf.ch/public/api/imis/:splat`).
- **nginx:** `location /imis-api/ { proxy_pass https://measurement-api.slf.ch/public/api/imis/; }`
- **GitHub Pages:** keine Weiterleitungen möglich – die Stationen bleiben dort ohne Werte.

Die App versucht zuerst `/imis-api/…` auf der eigenen Adresse und fällt ohne Antwort still auf den direkten Abruf zurück;
der Service Worker speichert diese Antworten nie zwischen.

## Stand T307 (2026-10-08) – T289–T307: Mobil-Fassung ohne CONOPS-Werkstatt

Die PWA läuft neu mit der Mobil-Fassung der App (`kocoa_reglement_8_65_mobil.html`, Build-Stempel mit Zusatz «-mobil»): identisch
mit der Desktop-Datei, nur ohne die CONOPS-Werkstatt (Folien gestalten, Zeitachse, Task Org, nativer PPTX-Generator) – sie ist nur
am Desktop gedacht. Die CONOPS-Schnellerfassung und der PowerPoint-Export (Vorlage) bleiben. Seit T288 dazugekommen (Auswahl):
Routen zusammenfügen, Tourenart «Fahrzeug» (Fahrzeugtyp, km/h, Fahrbarkeit, Baustellen aus OpenStreetMap), Routen folgen im
Fahrzeugmodus auch über Autobahnen, lange importierte Routen ohne Teilstrecken als eine Zeile, Routen folgen in 3D/3D+ der
Ebenen-Sichtbarkeit, mehrzeilige Beschriftungen, Koordinatensuche in geo.admin-Schreibweise (2'634'500.00, 1'194'500.00), keine
Fenster beim Projektladen, SpotMaps nach dem Laden ausgeblendet, Datumsfelder dunkel. Cache v161.

## Stand T308 (2026-10-08) – Mobil: Laden ohne Fenster, SpotMap im Rad, letztes Projekt bleibt

Beim Laden eines Projekts (auch COA-/Kategorie-Import, KML, Sitzung) öffnen sich keine Bearbeitungsfenster mehr; SpotMaps sind nach
dem Laden ausgeblendet. Werkzeugrad → «SpotMap» → eine Taste je SpotMap (z. B. MSN XY) blendet sie ein/aus (Auge zeigt den Zustand),
dazu «Neue SpotMap»; im Feldmodus «Einsatz» steht «SpotMap» im Feld-Ring. Die Mobil-Fassung (PWA, Android, iPhone) stellt beim Start
das zuletzt geladene Projekt aus der automatischen Sicherung still wieder her (Hinweis unten; «Mehr → Neues Projekt» verwirft es);
gesichert wird nach jedem Laden, beim Wechsel in den Hintergrund und jede Minute. Cache v162.

## Stand T309 (2026-10-08) – Mobil: SpotMap-Namen fest, Rad bei Offline-Auswahl gesperrt

Am Telefon und in der Mobil-Fassung lassen sich SpotMap-Beschriftungen nicht mehr mit dem Finger verschieben (Schieben der Karte
bewegt die Namen nicht mehr mit; am Desktop weiterhin verschiebbar). Während der Offline-Gebietsauswahl (LK25-Blattschnitt, Rechteck)
öffnet sich das Werkzeugrad nicht. Der Knopf «◎ Werkzeugrad» im Werkzeug-Panel der Vollansicht entfällt – das Rad öffnet sich mit
langem Drücken auf den Tab «Werkzeuge». Cache v163.

## Stand T310 (2026-10-08) – Sitzung über Mobilfunk und Internet

Die Sitzung kann über ein eigenes Relay im Internet laufen (VPS mit Caddy, Feldserver per Portweiterleitung oder VPN) –
Einrichtung in ANLEITUNG-RELAY-INTERNET.md. In der App: Adresse `wss://relay.example.ch` (Hostnamen werden automatisch
verschlüsselt angesprochen), gespeicherte Server, Einladung als QR. Nachrichten und Meldungen ohne Verbindung werden
zurückgehalten und nachgeliefert; tote Verbindungen (Mobilfunk) werden erkannt und sofort neu aufgebaut. Hinweise zu
Android (Hintergrund mit Live-Standort) und iPhone (nur bei geöffneter App) im Sitzungs-Dialog. munggi-relay.js: Ping/Pong,
Keepalive. Cache v164.

## Stand T315 (2026-10-10) – Mobil: Werkzeugrad per Langdruck, Kompass-Diagnose, Standort mit Blickrichtung

Das Werkzeugrad öffnet sich auf dem Telefon nur noch nach einem bewussten langen Druck (0,9 s, Finger ruhig, ein Finger);
Schieben, Zoomen mit zwei Fingern und Tippen auf Marker lösen es nicht mehr aus. Unter «Mehr → Darstellung & Modus» lässt
sich «Rad per Langdruck» abschalten (Rad dann über den Tab «Werkzeuge»). Kompass: langer Druck auf die Kompassrose zeigt
eine Diagnose (Sensor-Ereignisse, Quelle, letzte Richtung, Freigabe); liefert das Gerät keine Werte, folgt die Nadel dem
GPS-Kurs, sobald man sich bewegt. Standortmarker im swisstopo-Stil: blauer Punkt, weisser Ring, Genauigkeitskreis und ein
Kegel in Blickrichtung (Kompass, sonst GPS-Kurs in Bewegung), grau ohne Fix seit 60 s, auch in der 3D-Karte. Meldungen
auf dem Telefon kleiner und kürzer. Cache v165, native 1.315.0 (nach dem Kopieren von www/index.html im Ordner
munggi-android `npx cap sync android` ausführen, dann Android Studio bzw. Codemagic).

## Stand T316 (2026-10-10) – Mobil: schwebende Bedienung im ATAK-Stil

Auf dem Telefon schwebt die Bedienung über der Karte: keine Kopfzeile mehr, die Karte nutzt die ganze Fläche. Oben links
die Lupe (Suche als Blatt: Ort, Gipfel, Gewässer, Hütte, Tour, Objekt, Koordinate WGS84/LV95/MGRS), darunter Zoom,
Rückgängig/Wiederholen und der Kompass; rechts 3D · Standort · Beschriftung · 3D+ als runde Knöpfe. Die Tab-Leiste besteht
aus runden, halbtransparenten Knöpfen – hochkant als Reihe unten (mit Beschriftung), quer als Spalte rechts (nur Icons),
die Kartenknöpfe rücken quer entsprechend ein; die 3D-/3D+-Hälfte endet vor der Spalte. Unter «Mehr → Darstellung & Modus»
schaltet «Bedienung: schwebend / klassische Leiste» auf die bisherige Leiste mit Suchfeld oben zurück (wird gemerkt).
Cache v166, native 1.316.0 (nach dem Kopieren von www/index.html im Ordner munggi-android `npx cap sync android`).

## Stand T316b (2026-10-11) – Nachbesserung schwebende Bedienung

Nach dem iPhone-Test: Tab-Knöpfe ohne Beschriftung und näher am Rand (hoch tiefer, quer weiter rechts); Quellenangabe
«Leaflet | © swisstopo» immer ganz unten; Werkzeugrad auch quer sichtbar (vorher ausserhalb des Bildschirms); Werkzeuge-Blatt
öffnet beim ersten Mal mit allen Abschnitten zugeklappt; Chat und andere Fenster enden quer vor der Tab-Spalte; Standort-
Abzeichen und Feld-HUD liegen unter der iOS-Statusleiste und nicht übereinander. Cache v167, native 1.316.1 (versionCode 3161 –
ab jetzt Txxx·10 + Nachbesserung; `npx cap sync android` nicht vergessen).

## Stand T317 (2026-10-11) – Leistung

Laden und Importieren grosser Projekte ist deutlich schneller (die Layer-Liste wird pro Durchlauf nur noch einmal
aufgebaut statt je Objekt), Symbolbilder der Formationen bleiben über App-Starts hinweg im Zwischenspeicher. Neu gibt es
einen Hänger-Wächter: Blockiert die App länger als 0,3 s, wird das mit der zuletzt lange laufenden Funktion protokolliert –
«Mehr → Hilfe → Diagnose», Abschnitt «Leistung» (Knopf «Kopieren»); auf dem Telefon erscheint nach einem Hänger über
1,5 s ein kurzer Hinweis mit der Ursache. Bitte diesen Bericht nach einem Hänger an die Entwicklung schicken.
Cache v168, native 1.317.0 (versionCode 3170; `npx cap sync android`).

## Stand T318 (2026-10-11) – Navi-Ansicht

«Navigation starten» (Routenfenster, Routenliste, Kontextmenü) öffnet auf dem Telefon die Navi-Ansicht: perspektivische
3D-Karte in Fahrt- bzw. Blickrichtung, Standort im unteren Drittel, Route als breites Band. Oben Pfeil, Distanz und Manöver
(Abbiegungen mit Strassenname aus dem swissTLM3D, Schlüsselstellen, RV-Punkte, Ziel) sowie «danach …»; unten Tempo,
Reststrecke mit Zeit und Ankunft; Knöpfe Ton · 2D/3D · Zentrieren · Neu berechnen · Beenden. Sprachausgabe bei Fahrzeugen
1000/300/60 m, zu Fuss 100/20 m (Deutsch; Ton abschaltbar). Fahrzeugrouten: Abseits > 60 m wird vom Standort zum
Wiedereinstieg auf dem Strassennetz neu gerechnet (Umweg gestrichelt). Antippen der Karte pausiert das Folgen 20 s.
Braucht Mobilfunk (3D-Kacheln, Strassennamen, Neuberechnung); ohne 3D läuft die Navigation in 2D weiter. Kein Ersatz
für Rekognoszierung und Verkehrsmeldungen. Cache v169, native 1.318.0 (versionCode 3180; `npx cap sync android`).

## Stand T318b (2026-10-11) – Navi: Routenfenster weg

Beim Start der Navigation schliesst sich das Routenfenster (es verdeckte die Navi-Ansicht); schwebende Fenster bleiben
während der Navigation ausgeblendet. Beenden vor dem Laden der 3D-Karte lässt keine geteilte Ansicht mehr zurück.
Cache v170, native 1.318.1 (versionCode 3181).

## Stand T318c (2026-10-11) – Navi mit 3D+, kurze Hinweise

Die Navi-Ansicht nutzt jetzt standardmässig die 3D+-Karte (swisstopo-Präzisionsgelände, Gebäude und Vegetation werden
eingeschaltet) – mehr Detail, mehr Akku und Daten; steht 3D+ nicht zur Verfügung, weicht sie auf die 3D-Karte und zuletzt
auf 2D aus. Hinweise und Toasts sind auf dem Telefon auf den ersten Satz gekürzt (voller Text im Tooltip der Statuspille).
Die Modusleiste beim Routenzeichnen (Weg/Strasse · Wanderweg · Skitour · Frei · Fahrzeug) zeigt am Telefon alle Modi in zwei
Reihen. Cache v171, native 1.318.2 (versionCode 3182).

## Stand T319 (2026-10-11) – Vorausschau

«▶▶ Vorausschau» im Routenfenster (und ▶▶ im Navi-HUD für den nächsten Abschnitt ab dem eigenen Standort) fliegt die Route
in der Navi-Ansicht (3D+, sonst 3D) ab – im Zeitraffer ×10/×30/×100 mit der geplanten Geschwindigkeit (Fahrzeit bzw.
Marschzeit). Die Leiste zeigt die geplante Uhrzeit und DTG aus dem Zeitplan der Route, km-Stand und Höhe, eine Zeitachse mit
Marken (Schlüsselstellen, RV-Punkte, Teilstrecken-Enden mit Notiz, Ziel) zum Springen, Knöpfe Von vorn / Ab hier, Halte
(2,5 s Pause mit Notiz) und «Einsicht»: Sichtlinien von den nächsten ROT-Punktobjekten (bis 6, bis 6 km) zum aktuellen
Punkt über das Geländeprofil (rot = einsehbar, grün = verdeckt; automatisch an jedem Halt). Beenden kehrt zur laufenden
Navigation zurück. Cache v172, native 1.319.0 (versionCode 3190; `npx cap sync android`).

## Stand T319b (2026-10-11) – Einsicht erkennt feindliche Signaturen auf jedem Layer

Die Einsichtprüfung zählt jede Signatur mit feindlicher Zugehörigkeit (auch auf BLAU-Layern) sowie alle Objekte auf ROT-Layern; Stellungen direkt an der Route zählen mit. Cache v173, native 1.319.1 (versionCode 3191).

## Stand T319c (2026-10-11) – Sichtlinien mit Gebäuden und Vegetation aus 3D+

Ist 3D+ geöffnet, prüft die Einsicht der Vorausschau zweistufig: zuerst das Gelände (sofort), dann die Oberfläche aus den geladenen 3D+-Kacheln (Gebäude, Vegetation) und – für Linien bis 3 km – nachgeladen in höchster Stufe. Die Sichtlinien-Analyse hat dafür die Deckung «Oberfläche aus 3D+». Cache v174, native 1.319.2 (versionCode 3192; `npx cap sync android`).

## Stand T319d (2026-10-12) – Gebäude und Wald aus swissSURFACE3D

Einsehbarkeit, Routen-Einsehbarkeit, Sichtlinie und die Einsicht der Vorausschau können das Oberflächenmodell swissSURFACE3D Raster (0,5 m: Gebäude, Wald, Brücken) nutzen. Die App liest aus den swisstopo-GeoTIFFs nur die benötigten Blöcke (HTTP-Range) und speichert sie im Gerät (IndexedDB); im Offline-Bereich lässt sich die Oberfläche für ein Gebiet vorladen (2 m / 1 m / 0,5 m). Bullseye: verwaiste Ringe nach dem Löschen behoben. Cache v175, native 1.319.3 (versionCode 3193).

## Stand T320 (2026-10-12) – Feldbetrieb: Navigation im Hintergrund, Standort melden

Die Navigation hält den Bildschirm wach und zeigt bei gesperrtem Telefon oder im Hintergrund eine ständige Benachrichtigung mit dem nächsten Manöver (native Hülle: Hintergrund-GPS; Browser: Benachrichtigungen, sofern erlaubt). «Standort melden» (📍 im Navi, Mehr-Blatt, Werkzeuge → Messen) erzeugt eine Standortmeldung mit Rufzeichen, DTG, MGRS/LV95/WGS84, Höhe, Kurs und einem Munggi-Link (`…#pos=…`), der beim Empfänger die Position auf der Karte öffnet – kopieren, teilen, an Sitzung oder Mesh senden, als QR zeigen. Der Link nutzt die Adresse, unter der die PWA läuft. Cache v176, native 1.320.0 (versionCode 3200).

## Stand T321 (2026-10-12) – Laden und Speichern robust (Audit-Etappe 1)

Projektdateien (Format 2, mit Build-Kennung) laden auch dann vollständig, wenn einzelne Objekte beschädigt sind – übersprungene Objekte werden gezählt und gemeldet; Inhalte aus neueren App-Versionen (unbekannte Objektarten oder Felder) werden mitgeführt statt verworfen, auch vom Telefon ohne CONOPS-Werkstatt. Autospeicherung setzt ihren Zähler aus der Datenbank fort, sichert auch reine Text-Projekte und beim Ausblenden zusätzlich lokal; Offline-Pakete werden beim Start nicht mehr bei jedem Fehler gelöscht; Track-Speicherfehler werden gemeldet (GPX-Export). Cache v177, native 1.321.0 (versionCode 3210).

## Stand T322 (2026-10-13) – Sitzung verlässlich (Audit-Etappe 2)

Relay `munggi-relay.js` gehärtet: fehlerhafte Anfragen beenden den Dienst nicht mehr, Grenzen für Rahmengrösse, Sendepuffer und Nachrichtenrate, Zustellung an einzelne Empfänger (Schnappschüsse gehen nur noch an den Beitretenden) – **den Relay auf dem VPS/Feldserver bitte durch diese Datei ersetzen und neu starten**; für Internet-Relays unbedingt einen eigenen Einsatzcode setzen (`node munggi-relay.js 8765 MEINCODE` oder `--code`). App: Änderungen auf einer toten Mobilfunkverbindung werden nach dem Wiederverbinden nachgeliefert, ein Beitritt mit altem Stand überschreibt niemanden mehr (Sitzung gewinnt), gleichzeitige Änderungen enden auf allen Geräten gleich, «Neu»/«Laden» verlassen zuerst die Sitzung, Grabsteine überleben einen Host-Neustart, Direktnachrichten bleiben aus dem Verlauf für Spät-Beitretende. Cache v178, native 1.322.0 (versionCode 3220).

## Stand T323 (2026-10-14) – Netz und Offline (Audit-Etappe 3)

Die App erkennt ein Netz, das nicht antwortet (z. B. WLAN des Feldservers ohne Internet): Nach einer Zeitüberschreitung gelten zwei Minuten lang kurze Zeitlimits, Höhen und Profile kommen zuerst aus dem Offline-Paket, Wegnetz-Abfragen zuerst aus dem Vektorspeicher. Netzanfragen laufen durch einen Pool (höchstens sechs gleichzeitig), die Einsehbarkeit hat einen «Abbrechen»-Knopf, unvollständige Wegnetz-Abfragen werden gemeldet, der manuelle Offline-Modus bleibt über den Neustart erhalten, die Suche verwirft veraltete Antworten. Der Service Worker meldet eine neue Version («Jetzt neu laden») und installiert sich auch, wenn ein Icon fehlt; 🩺 Diagnose zeigt einen Kasten «Netz». Cache v179, native 1.323.0 (versionCode 3230).


## Stand T324 (2026-10-14) – Einheitliches Bearbeitungsfenster (UX-Etappe 1)

Alle Bearbeitungsfenster sind jetzt schwebende Fenster: Zeichnungen, Signaturen, Formationen, Wirkungsdome und Netz-Objekte öffnen nicht mehr als Sprechblase an der Geometrie, sondern im selben verschiebbaren Fenster wie Messungen und Analysen (auf dem Telefon als Blatt von unten, die Karte rückt das Objekt darüber). Jedes Fenster hat eine Farbpalette (neun Farben wie in der Routenplanung plus eigene Farbe) und unten die Knöpfe «Duplizieren», «Layer» und «Löschen». Distanz-, Flächen- und Höhenprofil-Messungen haben neu Farbe, Stärke und Strichart und den Block «KOCOA-Eigenschaften»; Stil und Eigenschaften werden mit dem Projekt gespeichert (bisher ging die Farbe beim Neuladen verloren). Service-Worker-Cache `kocoa-v180-T324-2026-10-14`. Falls die alten Sprechblasen gebraucht werden (Fehlersuche): in der Browser-Konsole `localStorage.setItem('munggiEditPopups','1')` und neu laden.


## Stand T325 (2026-10-14) – Formationssuche, Favoriten, Zuletzt (UX-Etappe 2)

Im Formationsfenster (Platzieren und Bearbeiten) steht zuoberst ein Suchfeld: Es findet Einheiten über die Schweizer Schnellwahl, alle APP-6-Entitäten (deutsch und englisch), gängige Abkürzungen (Pz Gren, Geb Inf, Art, Mw, Flab, San, Log, Ristl, Genie, Aufkl, MP …), Entitätscodes und ganze Symbolcodes (SIDC). Ein Tipp auf den Treffer setzt Symbolsatz, Entität und Modifikatoren; die Vorschau und die Schnellwahl folgen. Mit ☆ merkt man die aktuelle Einheit samt Grösse als Favorit, die zuletzt platzierten Einheiten erscheinen automatisch als Chips – ein Tipp übernimmt sie. Kontext und Status haben eine eigene, beschriftete Zeile. Service-Worker-Cache `kocoa-v181-T325-2026-10-14`.


## Stand T326 (2026-10-14) – Analysefenster und Wirkungsdom (UX-Etappe 3)

Sichtlinie und Einsehbarkeit zeigen das Ergebnis zuoberst (Status, Kennzahlen, Diagramm); die Einstellungen (Höhen, Deckung, Radius, Höhenquelle, Funkparameter, Transparenz) stehen in einem zusammenklappbaren Block mit Kurzfassung und bleiben offen, solange gerechnet wird. Beide haben jetzt eine Farbe (Palette): Sie gilt für «sichtbar» – Linie, Diagramm und Rasterfläche –, «verdeckt» bleibt rot; so lassen sich mehrere Analysen unterscheiden. Sichtlinie, Einsehbarkeit, Funkabdeckung und Wirkungsdom haben den Block «KOCOA-Eigenschaften» mit Beschriftung auf der Karte; Farbe und Eigenschaften werden mit dem Projekt gespeichert. Einheitliche Benennungen: «Stärke», «Strichart», «Punkte bearbeiten»; beim Wirkungsdom steht der Name zuerst. Service-Worker-Cache `kocoa-v182-T326-2026-10-14`.


## Stand T327 (2026-10-14) – Mehrfach-Stil, Layer-Standardfarbe, Löschen (UX-Etappe 4)

In der Objektliste lässt sich eine Auswahl gemeinsam umfärben: «Stil» öffnet einen Dialog mit Farbe, Stärke und Zuordnung, der auf alle gewählten Objekte wirkt (Zeichnungen, Messungen, Routen, Sichtlinien, Einsehbarkeiten, Wirkungsdome, Signaturen, Formationen) – mit Rückgängig. Dasselbe gibt es im Rechtsklick-Menü für ein einzelnes Objekt. Der aktive Layer hat eine Zeile «Standardfarbe»: neue Zeichnungen, Messungen und Analysen übernehmen sie, «auf alle» färbt den Bestand des Layers; die Standardfarbe wird mit dem Projekt gespeichert. Löschen aus dem Bearbeitungsfenster fragt nicht mehr nach, sondern zeigt einen Hinweis mit «Rückgängig» (nur Objektarten ohne Rückgängig fragen weiterhin). Behoben: Beim Aufziehen von Einsehbarkeit, Kreis, Rechteck oder Freihand blieb die Vorschau stehen, wenn die Maus über einem Reiter oder Panel losgelassen wurde. Service-Worker-Cache `kocoa-v183-T327-2026-10-14`.


## Stand T331b (2026-10-16) – 3D-Einsicht, Extern öffnen, Wetterkameras, COA-Layer, Routen-PDF

Sammelstand T328 bis T331b. 3D-Einsicht (Analyse): Standort setzen, Höhe über Grund, Blickrichtung (auch per Zielklick), Neigung, Blickwinkel und Sichtweite wählen, «In 3D+ ansehen» stellt die Kamera in 3D+ genau dorthin; umsehen mit der Maus, Blick übernehmen; auch von einem Punkt einer Marsch-, Fahrzeug- oder Drohnenroute (Drohne in Flughöhe; die Drohnen-Flugroute erscheint in 3D+ als Linie). «Extern öffnen» (unter der Kartenliste, im Rechtsklick-Menü, im Koordinaten-Werkzeug und im Fenster der 3D-Einsicht): swisstopo 3D, Google Maps Karte/Satellit, Street View und Google Earth am Punkt – ohne Schlüssel, nur online; aus der 3D-Einsicht übernimmt Google Earth Standort, Augenhöhe, Richtung und Neigung; der KML-Export schreibt dafür eine Kamera. Neue Kartenebene «Wetterkameras (MeteoSchweiz)» (online): 36 Stationen mit 360°-Panorama, Klick zeigt das aktuelle Bild, «Bild ins Projekt» legt einen Punkt mit dem Schnappschuss ab (bleibt offline im Projekt). COA-Layer neu gegliedert: ROT «Varianten» (Most Likely, Most Dangerous, In allen Fällen), BLAU «Hauptvariante» und «Alternative Variante» (Insertion, Infiltration, EOT, AOT, Exfiltration, Extraktion) und «Eventualplanung» (EP 1–6, per Umbenennen benannt); alte ROT-Varianten werden umgelegt, alte BLAU-Layer mit Objekten bleiben sichtbar. CONOPS-Werkstatt: im COA-Block je Bild wählbar, welche COA-Ebenen erscheinen (Vorgaben wie «Insertion & Infiltration»); Obstacles BLAU nimmt die allgemeinen Hindernisse mit. Routen: Routen-PDF in der gezeichneten Routenfarbe; eine Route ohne selbst erstellte Teilstrecken gilt als eine Strecke (Tabelle, Zeitplan, PDF nur Start/Ziel) – auch bei «Weg folgen»; am PC ist die GPS-Aufzeichnung ausgeblendet. Service-Worker-Cache `kocoa-v184-T331b-2026-10-16`.


## Stand T332 (2026-10-16) – Offline-Gebietsauswahl am Telefon

Am Telefon blieb die Gebietsauswahl für das Offline-Paket nicht erhalten, sobald das Werkzeug-Blatt zugeklappt wurde; «Grösse schätzen» fand dann kein Gebiet. Die Auswahl bleibt jetzt bis «Auswahl aufheben», Herunterladen oder einer neuen Auswahl. Service-Worker-Cache `kocoa-v185-T332-2026-10-16`.


## Stand T373 (2026-10-21) – Sammelstand T333 bis T373

Seit T332 ist viel dazugekommen; die wichtigsten Punkte für das Telefon und die PWA:

- **Telefon:** Das Werkzeugrad öffnet nicht mehr von selbst, wenn man die Karte mit dem Finger schiebt und viel eingezeichnet ist (T373). Die Feldnotiz kann neben einem Text auch eine Punktsignatur (Zuletzt verwendete, Suche, BLAU/ROT) oder eine Formation sein; in einer Sitzung sehen sie alle Teilnehmer sofort, sonst wandern sie mit «An Tisch senden» (T373). Meldungen «Gefecht & Aufklärung» (Kontakt, Drohne, SALUTE/SALT, LACE, Spuren, Beobachtungsjournal, PACE, Linienwarnung, Patrouillenbericht; T337). Munggi-Figur mit Zuständen, Dösen, Winterschlaf, Drohne und Skitour (T357–T359).
- **Planung (Desktop, in der PWA ebenfalls enthalten, Werkstatt nur am Rechner):** Patrouillen-Führungsmittel mit Prüfung (T334), Wirkungsraum und Range Card, Beobachtungsposten mit OP-Karte (T335/T338), Simulation 3D mit Einheiten, Formationen, Wargaming und Optiken (T340–T343), Kartenbilder in PDF-Qualität im CONOPS (T344/T345), Fassadenbezeichnung mit 3D (T346–T355), Einsehbarkeit und Wirkungsraum überarbeitet (T360/T361), Signaturen: Verzierungen in Bildschirmgrösse, ruhige Wellen, Punktzeichen drehen und skalieren, Brücke/Furt als 2-Punkt-Zeichen (T362–T364).
- **Projektbibliothek (Desktop):** Speichern schreibt direkt in die geöffnete Datei (T365/T366), Bibliothek mit Operation/Element/Variante (T367), Verbund «COA Det» mit zusammengelegter Synchromatrix und Folie je Element (T368/T369), Variante als Referenz über der Karte (T370), Mission-Übersicht mit Status und Prüfansicht (T371), Feinschliff (T372).

Service-Worker-Cache `kocoa-v186-T373-2026-10-21`. Nach dem Hochladen einmal neu laden; die Meldung «Neue Version – jetzt neu laden» bestätigen.


## Stand T374 (2026-10-21) – Telefon: Kartenzug, Offline-Karten, Foto

- **Werkzeugrad beim Schieben – Ursache behoben.** Landete der Finger auf einer eingezeichneten Linie oder Fläche, übernahm bisher die Tablet-Brücke die Geste (Objekt verschieben statt Karte schieben) und startete nebenbei den Maus-Langdruck des Rechners – daher das Rad mitten im Kartenzug und der Hinweis «Ebene … automatisch fixiert». Am Telefon schiebt der Finger jetzt immer die Karte, auch wenn er auf einem Objekt beginnt; ein Tipp öffnet wie gehabt das Fenster des Objekts.
- **Offline-Karten:** Ein Tipp auf ein LK25-Blatt löste zwei Klicks aus, das Blatt wurde hin- und zurückgeschaltet (nie grün). Jetzt schaltet ein Tipp genau einmal.
- **Feldnotiz mit Foto:** Im Auswahlblatt der Feldnotiz gibt es «Foto» mit **Kamera** oder **Album**. Das Bild wird verkleinert (≤1280 px, JPEG, meist 100–250 kB), am Standort oder per Tipp abgelegt und hängt am Punkt «Foto · DTG · Rufzeichen». Bei einer bestehenden Feldnotiz: Fenster öffnen → «Foto hinzufügen / ersetzen / entfernen». Das Foto wird mit dem Projekt gespeichert, mit «An Tisch senden» geteilt und in einer Sitzung an alle Teilnehmer übertragen.

**Prüfen, ob das Telefon den neuen Stand hat:** Mehr → Diagnose; die Zeile *Build* muss `T374-2026-10-21` zeigen. Steht dort «Service Worker: nicht unterstützt», läuft die native App (TestFlight/APK) oder die Seite wurde als Datei geöffnet – dann hilft kein PWA-Update, sondern der neue Android-/iOS-Bau bzw. das Neuladen der gehosteten Adresse.

Service-Worker-Cache `kocoa-v187-T374-2026-10-21`. Nach dem Hochladen einmal neu laden; die Meldung «Neue Version – jetzt neu laden» bestätigen.


## Stand T405 (2026-10-23) – neue Bedienoberfläche (T388–T405) auch auf dem Telefon

Dieser Stand holt alle Desktop-Etappen seit T374 auf das Telefon. Funktionen, Daten und Projekte bleiben gleich – neu ist die Hülle:

- **Einheitlicher Stil (olive):** ruhige, deckende Flächen (Panel dunkel, Karten heller, Felder dunkel), ROT/BLAU wie bisher, Tasten mindestens 44 px hoch, Symbol mit Beschriftung, Ein/Aus grün. Häufige Aktionen stehen direkt, seltene unter «···» oder in aufklappbaren Zeilen.
- **Werkzeuge & Karten (Blatt):** Übersicht in vier Gruppen (Kartengrundlagen · Einzeichnen & Analysieren · Planung & Unterlagen · Austausch & Portale); ein Bereich öffnet als eigene Ansicht mit «‹ Werkzeugübersicht».
- **Neu gestaltete Bereiche:** KOCOA-Ebenenliste (Zustandskarte der aktiven Ebene, Auge/Schloss, «Nur aktive Ebene bearbeitbar»), Führungsunterlagen (sechs Karten), Tourenportal (Tourenarten als Tasten, Filter, Zeilen mit Auge/Details), CONOPS-Planung (Abschnitte mit Erfassungsstand), Verhältnisse (Meteo mit Tageskacheln und Vergleichstabelle; Lawinen mit Datenstand und Übernahme-Rückfrage), Objektliste (Suche, «Nur ausgewählte», Gruppenkarten, Mehrfachauswahl), Signaturen (Kategorien als Zeilen, Kategorieansicht mit «‹ Kategorie wählen»), Analyse (fünf Reiter mit Karten, Zustand «Noch kein Ergebnis / Ergebnis auf der Karte», «Ergebnis verwalten»), Karten (Basiskarte als Auswahl, Suche, «Alle Ebenen | Aktiv · n», Gruppen mit Deckkraft-Regler), Routenplaner (Routen als Karten mit Pfeil für Navigation/Zoom/Details/PDF/Löschen), Austausch (ATAK/CoT · KML/KMZ · GPS mit Exportformat-Auswahl), Offline-Karte (Reiter «Herunterladen» ①②③ und «Pakete & Speicher»).
- **Werkzeugrad:** acht Kategorien (Favoriten, Sicht, Route, Messen, Gelände, Zeichnen, Signaturen, Mehr), «Mehr» öffnet Karten, Mobilität, Verhältnisse, Führung, SpotMap, Touren und «Menü»; Mitte = Schliessen bzw. Zurück; Kurznamen, aktives Werkzeug grün; quer wird das Rad kleiner. Feld-/Tour-Profile bleiben flache Ringe.
- **Handcursor** mit dunklem Rand (Tablet mit Maus), 3D+ öffnet sich beim Online/Offline-Wechsel nicht mehr von selbst, Optik («Blick durchs Gerät») zeigt die Vegetation ausser im Schnellmodus.
- Desktop-Kopfzeile (Projekt · Suche · Speichern · Bibliothek · Vollansicht · ···) gilt nur am Rechner; das Telefon behält seine Leiste.

**Prüfen, ob das Telefon den neuen Stand hat:** Mehr → Diagnose; die Zeile *Build* muss `T405-2026-10-23` zeigen. Steht dort «Service Worker: nicht unterstützt», läuft die native App (TestFlight/APK) oder die Seite wurde als Datei geöffnet – dann hilft kein PWA-Update, sondern der neue Android-/iOS-Bau bzw. das Neuladen der gehosteten Adresse.

Service-Worker-Cache `kocoa-v188-T405-2026-10-23`. Nach dem Hochladen einmal neu laden; die Meldung «Neue Version – jetzt neu laden» bestätigen.

