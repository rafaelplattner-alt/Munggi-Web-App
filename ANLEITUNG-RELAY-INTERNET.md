# Munggi-App – Sitzung über Mobilfunk und Internet (Relay) · Stand T310 (2026-10-08)

Die Sitzung (Lageabgleich, Chat, Meldungen, Live-Standorte) läuft immer über ein **Relay**: einen kleinen Server, der jede
Nachricht an alle anderen verbundenen Geräte weiterreicht und nichts speichert. Im Einsatznetz ist das der Feldserver
(Windows-EXE) oder `node munggi-relay.js` im LAN. Sollen Handys **über Mobilfunk** teilnehmen, muss das Relay aus dem
Internet erreichbar sein. Diese Anleitung beschreibt die drei Wege und die Einstellungen in der App.

> Grundsatz: Über ein öffentliches Netz nur mit **Passphrase** (Ende-zu-Ende-Verschlüsselung, Sitzung › Verschlüsselung) und
> nur mit Inhalten, die über ein öffentliches Netz gehen dürfen. Das Relay sieht nur Chiffrat; der Netzbetreiber sieht,
> dass Geräte mit dem Relay verbunden sind (Metadaten). Für den Ernstfall bleiben Einsatznetz und LoRa/Mesh die Grundlage.

## Weg A (empfohlen): eigener kleiner Server (VPS) mit Caddy

Ein VPS der kleinsten Klasse (1 CPU, 1 GB RAM, Standort Schweiz) reicht für Dutzende Teilnehmer; der Datenverkehr ist
winzig (Positionen = wenige Byte alle paar Sekunden). Benötigt wird ein Hostname (DNS-A-Record), z. B. `relay.example.ch`.

1. **Server vorbereiten** (Ubuntu 22.04/24.04, als root oder mit sudo):
   ```bash
   apt update && apt install -y nodejs caddy ufw
   ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw enable     # 8765 bleibt von aussen zu
   mkdir -p /opt/munggi && cp munggi-relay.js /opt/munggi/
   ```
   (`node --version` sollte 18 oder neuer melden; sonst Node von nodesource.com installieren.)
2. **Relay als Dienst** – `/etc/systemd/system/munggi-relay.service`:
   ```ini
   [Unit]
   Description=Munggi Relay
   After=network.target
   [Service]
   ExecStart=/usr/bin/node /opt/munggi/munggi-relay.js 8765 EINSATZCODE --no-tls
   Restart=always
   User=nobody
   [Install]
   WantedBy=multi-user.target
   ```
   `EINSATZCODE` ersetzen (8 Zeichen, in der App unter «Einsatzcode»). Dann:
   `systemctl daemon-reload && systemctl enable --now munggi-relay && journalctl -u munggi-relay -f`
   Das Relay läuft nur im Klartext auf 127.0.0.1:8765 (Firewall) – die Verschlüsselung zum Handy macht Caddy.
3. **Caddy** (Zertifikat von Let's Encrypt automatisch) – `/etc/caddy/Caddyfile`:
   ```
   relay.example.ch {
       reverse_proxy 127.0.0.1:8765
   }
   ```
   `systemctl reload caddy`. Caddy leitet WebSockets ohne weitere Einstellung durch.
   Mehrere Sitzungen (z. B. zwei Kompanien): je ein Relay-Dienst mit eigenem Port und Code, in Caddy je ein Pfad:
   ```
   relay.example.ch {
       handle_path /kp1/* { reverse_proxy 127.0.0.1:8765 }
       handle_path /kp2/* { reverse_proxy 127.0.0.1:8766 }
   }
   ```
   In der App lautet die Adresse dann `wss://relay.example.ch/kp1`.
4. **In der App** (Sitzung › Beitreten): Adresse `relay.example.ch` (oder `wss://relay.example.ch`), Einsatzcode, Name,
   Passphrase unter «Verschlüsselung» – Beitreten. Mit «💾 Merken» bleibt der Server auf dem Gerät gespeichert, «▦ QR»
   zeigt eine Einladung (Adresse + Code, **ohne** Passphrase), «📷 Scannen» übernimmt sie auf einem anderen Handy.
   Ein Hostname wird automatisch verschlüsselt (wss, Port 443) angesprochen; IP-Adressen gelten weiterhin als Einsatznetz
   (ws, Port 8765 – bzw. wss aus der https-PWA wie bisher).

Hinweise: Einsatzcode wechseln = Dienst mit neuem Code neu starten. Das Relay protokolliert nur Verbindungen (Anzahl,
Zeit), keine Inhalte. Updates: `apt upgrade` regelmässig; `fail2ban` optional. Wer den Hoster nicht traut, lässt die
Passphrase nie weg – ohne sie kann der Hoster mitlesen.

## Weg B: Feldserver (Windows-EXE) von zu Hause / aus dem KP erreichbar machen

Der eingebaute Feldserver nimmt bereits TLS an (Port 8765, eigenes Zertifikat). Für Mobilfunk-Teilnehmer braucht es:
Portweiterleitung 8765/TCP im Router auf den Host-PC, eine erreichbare Adresse (feste IP oder DynDNS-Name) und auf jedem
Handy die einmalige Installation des Feldserver-Zertifikats (Hilfsseite auf Port 8766, wie in ANLEITUNG-MEHRPLATZ-SITZUNG.md
beschrieben). Adresse in der App: `wss://meinname.dyndns.example:8765`. Nachteile: offener Port am Heimanschluss, Zertifikat
muss nach einem Adresswechsel neu installiert werden, CGNAT bei vielen Mobil-/Glasfaseranschlüssen verhindert eingehende
Verbindungen. Darum Weg A vorziehen.

## Weg C: VPN

Hängen alle Handys und der Host-PC im selben VPN (z. B. WireGuard), ändert sich in der App nichts – es gilt die LAN-Adresse
des Feldservers im VPN. Vorteil: kein öffentlicher Dienst; Nachteil: VPN-Einrichtung auf jedem Gerät, iPhone-Hintergrund-
Verhalten bleibt gleich.

## Verhalten der App im Mobilfunk (ab T310)

* **Nachliefern:** Chat-Nachrichten und Meldungen ohne Verbindung (Funkloch, Zellwechsel) werden zurückgehalten – auch über
  einen App-Neustart – und beim nächsten Verbinden gesendet; der Status im Sitzungs-Dialog zeigt die Anzahl. Der letzte
  Standort wird ebenfalls nachgeliefert.
* **Wächter:** Alle 25 s ein Ping; antwortet weder Relay (ab T310) noch ein Teilnehmer innerhalb von 100 s, oder ist der
  Socket tot, wird sofort neu verbunden – ebenso beim Netzwechsel («online») und beim Zurückholen der App.
* **Android:** Im Hintergrund bleibt die Verbindung bestehen, solange der Live-Standort geteilt wird (Vordergrunddienst
  «Munggi – Standort aktiv»). In den Android-Einstellungen für die Munggi-App «Akku → uneingeschränkt» wählen, sonst
  kann das System die App nach einigen Minuten anhalten.
* **iPhone:** iOS legt die Verbindung still, sobald die App im Hintergrund ist – Nachrichten und Live-Standort laufen nur bei
  geöffneter App (Bildschirm an, Auto-Sperre ggf. ausschalten). Beim Zurückholen wird sofort neu verbunden und nachgeliefert.
* **Verbrauch:** Grössenordnung wenige MB pro Tag bei durchgehendem Betrieb; Karten kommen aus den Offline-Paketen.

## Kurztest vor dem Einsatz

1. Relay läuft (`journalctl -u munggi-relay -f` zeigt «Teilnehmer verbunden»), Caddy liefert ein gültiges Zertifikat
   (`https://relay.example.ch/` im Browser öffnen: Antwort des Relays, kein Zertifikatsfehler).
2. Zwei Handys über Mobilfunk beitreten, Passphrase gesetzt: Chat in beide Richtungen, Meldung mit Lesebestätigung,
   Live-Standorte sichtbar.
3. Ein Handy in den Flugmodus, Meldung absetzen («zurückgehalten»), Flugmodus aus → Meldung kommt an.
4. App schliessen und wieder öffnen → Sitzung verbindet sich selbst wieder (Adresse gemerkt), Projekt ist noch da.
