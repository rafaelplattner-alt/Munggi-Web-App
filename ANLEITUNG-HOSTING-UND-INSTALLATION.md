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

