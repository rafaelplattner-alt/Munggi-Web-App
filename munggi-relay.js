#!/usr/bin/env node
/* ============================================================
   Munggi-App – Sitzungs-Server («Feldserver») für die Mehrplatz-Arbeit im LAN
   ------------------------------------------------------------
   Dummer Broadcast-Relay: leitet jede Nachricht an alle anderen
   verbundenen Geräte weiter. Keine Daten werden gespeichert,
   keine Internet-Verbindung wird benutzt.

   T246: Derselbe Port nimmt Klartext (ws://, PCs/EXE/Datei) UND TLS
   (wss://, Handys mit der https-PWA) an – das erste Byte entscheidet.
   Über https liefert der Server auf Wunsch auch die PWA aus (--www),
   auf Port+1 eine unverschlüsselte Hilfsseite mit dem Zertifikat und
   der Installationsanleitung für iPhone/Android (feldserver-anleitung.html).

   Start:      node munggi-relay.js [Port] [Einsatzcode] [Optionen]
   Beispiel:   node munggi-relay.js 8765 ALPHA1 --www ./pwa
   Ohne Argumente: Port 8765, Code MUNGGI.
   Optionen:
     --www <Ordner>        PWA-Dateien (index.html, sw.js, manifest, Icons) über https ausliefern
     --cert <pem> --key <pem>   eigenes Zertifikat/Schlüssel (sonst: feldserver-zertifikat.pem
                           und feldserver-schluessel.pem neben diesem Skript; fehlen sie, werden
                           sie mit openssl erzeugt – oder aus --cert-dir gelesen, z. B. dem
                           Ordner KOCOA-Daten neben der Windows-EXE)
     --cert-dir <Ordner>   Ordner mit feldserver-zertifikat.pem / feldserver-schluessel.pem
     --no-tls              nur Klartext (wie vor T246)
     --rooms A,B,C         T432: mehrere Räume (Einsatzcodes) auf einem Server; der 2. Positionsparameter
                           ist der erste Raum. Nachrichten bleiben im Raum.
     --open                T432: jeder neue Einsatzcode eröffnet einen Raum (Übungsbetrieb)
     --lead <Code>         T432: Leitungs-Code – damit verbundene Teilnehmer (?lead=…) verwalten Räume
     --data <Ordner>       T432: Raum-Gedächtnis (letzter Lage-Schnappschuss je Raum) – Standard: sitzungen/ neben dem Skript
     --welt <Ordner>       T436: Weltkarten (*.pmtiles) – liefert /welt/index.json und /welt/<datei> mit Bereichsanfragen
                           (Haupt- und Hilfsport); Standard: welt/ neben dem Skript
     --snapsec <s>         T432: Abstand der Schnappschuss-Anfragen an den Lage-Inhaber (Standard 120 s)
   (Hinweis: In der Windows-EXE ist derselbe Server eingebaut –
   dieses Skript braucht es nur für Browser-/PWA-Hosts oder Tests.)
   T432: Räume – ein Host für mehrere Teams/Det. Je Raum eigener Einsatzcode, eigene Teilnehmerliste, eigenes
   Gedächtnis: der Server fragt den Lage-Inhaber periodisch nach einem Schnappschuss (snap_req, actor «relay»),
   hält ihn im Speicher und als Datei und beantwortet damit Beitritte in leere Räume. Begrüssung {"t":"relay",…}
   beim Verbinden; Leitung (lead) steuert Räume per {"t":"relay_ctl",…} und erhält {"t":"relay_rooms",…}.
   T310: Betrieb im Internet (Mobilfunk) – hinter einem Reverse-Proxy mit
   Zertifikat (z. B. Caddy, siehe ANLEITUNG-RELAY-INTERNET.md) mit --no-tls
   starten; Pfade in der Adresse sind erlaubt (nur ?code= zählt); Klartext-Ping
   {"t":"ping"} wird dem Absender mit {"t":"pong"} beantwortet; TCP-Keepalive.
   ============================================================ */
'use strict';
const net = require('net');
const tls = require('tls');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const argv = process.argv.slice(2);
const opt = {};
const pos = [];
for (let i = 0; i < argv.length; i++){
  const a = argv[i];
  if (a.startsWith('--')){ const k = a.slice(2); if (k === 'no-tls'){ opt.noTls = true; } else if (k === 'open'){ opt.open = true; } else { opt[k] = argv[++i]; } }
  else pos.push(a);
}
const PORT = parseInt(pos[0], 10) || 8765;
const CODE = (pos[1] || opt.code || 'MUNGGI').trim();
/* T322: ein unerwarteter Fehler darf den Feldserver nicht mehr beenden – protokollieren und weiterlaufen */
process.on('uncaughtException', e => { try { console.error(new Date().toISOString(), '! Unerwarteter Fehler (Dienst läuft weiter):', e && e.stack || e); } catch (e2) {} });
process.on('unhandledRejection', e => { try { console.error(new Date().toISOString(), '! Unbehandelte Zusage:', e && e.stack || e); } catch (e2) {} });
const HELPER_PORT = PORT + 1;
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const clients = new Set();
const HERE = __dirname;

/* ---------- T432: Räume ---------- */
const rooms = new Map();                       /* code -> { code, name, clients:Set, snap, snapAt, dirty, d2t, t2d, lastAsk, lastWrite } */
let OPEN = !!opt.open;
const LEAD = (opt.lead || '').trim();
const SNAP_SEC = Math.max(2, parseInt(opt.snapsec, 10) || 120);
const DATA_DIR = opt.data ? path.resolve(opt.data) : (opt['cert-dir'] ? path.join(opt['cert-dir'], 'sitzungen') : path.join(HERE, 'sitzungen'));
const WELT_DIR = opt.welt ? path.resolve(opt.welt) : (opt['cert-dir'] ? path.join(opt['cert-dir'], 'welt') : path.join(HERE, 'welt'));   /* T436 */
function codeTag(code){ let h = 5381; const str = String(code || ''); for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function safeName(code){ return String(code).replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 60); }
function roomFile(code){ return path.join(DATA_DIR, safeName(code) + '.snap.json'); }
function roomGet(code, create, name){
  let r = rooms.get(code);
  if (!r && create){
    r = { code, name: name || '', clients: new Set(), snap: null, snapAt: 0, dirty: false, d2t: false, t2d: true, lastAsk: Date.now(), lastWrite: 0 };   /* erste Gedächtnis-Anfrage erst nach SNAP_SEC */
    try { if (fs.existsSync(roomFile(code))){ const j = JSON.parse(fs.readFileSync(roomFile(code), 'utf8')); if (j && typeof j.snap === 'string'){ r.snap = j.snap; r.snapAt = j.snapAt || 0; } if (j && j.name && !r.name) r.name = j.name; if (j && typeof j.d2t === 'boolean') r.d2t = j.d2t; if (j && typeof j.t2d === 'boolean') r.t2d = j.t2d; } } catch (e) {}
    rooms.set(code, r);
    console.log(new Date().toISOString(), '· Raum «' + code + '»' + (r.snap ? ' (Stand vom ' + new Date(r.snapAt).toLocaleString('de-CH') + ')' : ''));
  }
  return r || null;
}
function roomPersist(r, force){
  const now = Date.now(); if (!force && now - r.lastWrite < 30000) return; r.lastWrite = now;
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(roomFile(r.code), JSON.stringify({ code: r.code, name: r.name, snapAt: r.snapAt, d2t: r.d2t, t2d: r.t2d, snap: r.snap })); } catch (e){ console.log(new Date().toISOString(), '! Raum-Datei nicht schreibbar: ' + (e.message || e)); }
}
function roomInfo(r){ return { code: r.code, name: r.name, n: r.clients.size, snapAt: r.snapAt, hasSnap: !!r.snap, d2t: r.d2t, t2d: r.t2d }; }
function roomsMsg(){ return JSON.stringify({ t: 'relay_rooms', open: OPEN, lead: !!LEAD, snapSec: SNAP_SEC, rooms: Array.from(rooms.values()).map(roomInfo) }); }
function snapStore(r, obj){
  try { const o = Object.assign({}, obj); o.actor = 'relay'; delete o.to; r.snap = JSON.stringify(o); r.snapAt = Date.now(); r.dirty = false; roomPersist(r, false); } catch (e) {}
}
/* T474: verschlüsselte Räume – der Server kann den Schnappschuss nicht lesen, bewahrt aber die Hülle auf und reicht sie weiter.
   Die Hülle beginnt mit {"e":1,…; Empfänger und Herkunftsvermerk (rs = vom Server, relayAt) werden vorn eingesetzt, ohne sie zu zerlegen. */
function snapStoreEnc(r, msg){ r.snap = msg.replace(/"to"\s*:\s*"[^"]{0,40}"\s*,/, ''); r.snapAt = Date.now(); r.dirty = false; roomPersist(r, false); }
function snapServe(r, toActor){
  try {
    if (/^\{"e":1,/.test(r.snap)) return '{"e":1,"to":' + JSON.stringify(String(toActor)) + ',"rs":1,"relayAt":' + r.snapAt + ',' + r.snap.slice(7);
    const o = JSON.parse(r.snap); o.to = toActor; o.actor = 'relay'; o.relayAt = r.snapAt; o.ct = codeTag(r.code); return JSON.stringify(o);
  } catch (e){ return null; }
}
function roomClose(r){ for (const c of r.clients){ try { c.end(Buffer.from([0x88, 0])); } catch (e) {} try { c.destroy(); } catch (e) {} } rooms.delete(r.code); try { fs.unlinkSync(roomFile(r.code)); } catch (e) {} console.log(new Date().toISOString(), '· Raum «' + r.code + '» geschlossen'); }
function roomClear(r){ r.snap = null; r.snapAt = 0; r.dirty = false; try { fs.unlinkSync(roomFile(r.code)); } catch (e) {} }
/* Leitung: Räume verwalten */
function relayCtl(sock, m){
  if (!sock.lead){ sendText(sock, JSON.stringify({ t: 'relay_err', msg: 'Keine Leitungsrechte' })); return; }
  const op = String(m.op || ''); const code = String(m.room || '').trim().slice(0, 40);
  if (op === 'add' && code){ const r = roomGet(code, true, String(m.name || '').slice(0, 60)); if (m.name) r.name = String(m.name).slice(0, 60); roomPersist(r, true); }
  else if (op === 'close' && code){ const r = rooms.get(code); if (r && r !== sock.room) roomClose(r); }
  else if (op === 'clear' && code){ const r = rooms.get(code); if (r) roomClear(r); }
  else if (op === 'set' && code){ const r = rooms.get(code); if (r){ if (typeof m.d2t === 'boolean') r.d2t = m.d2t; if (typeof m.t2d === 'boolean') r.t2d = m.t2d; if (typeof m.name === 'string') r.name = m.name.slice(0, 60); roomPersist(r, true); } }
  else if (op === 'open'){ OPEN = !!m.open; }
  sendText(sock, roomsMsg());
  for (const c of clients) if (c !== sock && c.lead) sendText(c, roomsMsg());
}
/* Gedächtnis auffrischen: Lage-Inhaber je Raum periodisch um einen Schnappschuss bitten */
function snapAsk(r){ r.lastAsk = Date.now(); const ask = JSON.stringify({ t: 'snap_req', actor: 'relay', any: 1, ct: codeTag(r.code) }); for (const c of r.clients) sendTo(c, ask); }
setInterval(() => {
  const now = Date.now();
  for (const r of rooms.values()){
    if (!r.clients.size || !r.dirty || now - r.lastAsk < SNAP_SEC * 1000) continue;
    snapAsk(r);
  }
}, 1000);
process.on('SIGINT', () => { for (const r of rooms.values()) if (r.snap) roomPersist(r, true); process.exit(0); });
process.on('SIGTERM', () => { for (const r of rooms.values()) if (r.snap) roomPersist(r, true); process.exit(0); });
(function roomsInit(){
  const list = String(opt.rooms || '').split(',').map(x => x.trim()).filter(Boolean);
  roomGet(CODE, true); list.forEach(c => roomGet(c, true));
  if (OPEN){ try { fs.readdirSync(DATA_DIR).forEach(f => { if (!/\.snap\.json$/.test(f)) return; try { const j = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')); if (j && j.code) roomGet(String(j.code), true); } catch (e) {} }); } catch (e) {} }
})();

/* ---------- lokale Adressen ---------- */
function localIps(){
  const ips = ['127.0.0.1', '192.168.137.1'];
  try {
    for (const list of Object.values(os.networkInterfaces())) for (const it of list)
      if (it.family === 'IPv4' || it.family === 4) if (!ips.includes(it.address)) ips.push(it.address);
  } catch (e) {}
  return ips;
}
function mainIp(){
  const all = localIps().filter(ip => ip !== '127.0.0.1');
  return all.find(ip => ip.startsWith('192.168.') && ip !== '192.168.137.1') || all.find(ip => ip.startsWith('10.')) || all[1] || all[0] || '127.0.0.1';
}

/* ---------- Zertifikat ---------- */
function loadCert(){
  if (opt.noTls) return null;
  if (opt.cert && opt.key) return { cert: fs.readFileSync(opt.cert), key: fs.readFileSync(opt.key), from: opt.cert };
  const dirs = [opt['cert-dir'], HERE, path.join(HERE, 'KOCOA-Daten')].filter(Boolean);
  for (const d of dirs){
    const c = path.join(d, 'feldserver-zertifikat.pem'), k = path.join(d, 'feldserver-schluessel.pem');
    if (fs.existsSync(c) && fs.existsSync(k)){
      const known = (() => { try { return fs.readFileSync(path.join(d, 'feldserver-adressen.txt'), 'utf8').split(/\r?\n/); } catch (e){ return null; } })();
      if (known && !known.includes(mainIp()) && d === HERE){ console.log(' Zertifikat enthält die aktuelle Adresse ' + mainIp() + ' nicht – wird neu erzeugt.'); break; }
      return { cert: fs.readFileSync(c), key: fs.readFileSync(k), from: c };
    }
  }
  /* neu erzeugen mit openssl */
  const ips = localIps();
  const c = path.join(HERE, 'feldserver-zertifikat.pem'), k = path.join(HERE, 'feldserver-schluessel.pem');
  const san = ips.map(ip => 'IP:' + ip).concat(['DNS:munggi.local', 'DNS:localhost']).join(',');
  const r = spawnSync('openssl', ['req', '-x509', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:prime256v1', '-nodes',
    '-keyout', k, '-out', c, '-days', '760', '-subj', '/CN=Munggi Feldserver/O=Munggi-App',
    '-addext', 'subjectAltName=' + san, '-addext', 'basicConstraints=critical,CA:TRUE',
    '-addext', 'keyUsage=critical,digitalSignature,keyEncipherment,keyCertSign', '-addext', 'extendedKeyUsage=serverAuth'], { encoding: 'utf8' });
  if (r.status === 0 && fs.existsSync(c)){
    fs.writeFileSync(path.join(HERE, 'feldserver-adressen.txt'), ips.join('\n'));
    console.log(' Neues Zertifikat «Munggi Feldserver» erzeugt (' + san + ')');
    return { cert: fs.readFileSync(c), key: fs.readFileSync(k), from: c };
  }
  console.log(' HINWEIS: kein Zertifikat gefunden und openssl nicht verfügbar (' + ((r.error && r.error.message) || r.stderr || '').toString().trim().slice(0, 120) + ').');
  console.log('          Handys (PWA) können so nicht beitreten. Abhilfe: openssl installieren (z. B. Git für Windows),');
  console.log('          oder --cert-dir auf den Ordner KOCOA-Daten der Windows-EXE zeigen, oder --cert/--key angeben.');
  return null;
}
const CERT = loadCert();
const CERT_DER = CERT ? (() => { const m = /-----BEGIN CERTIFICATE-----([^-]+)-----END CERTIFICATE-----/.exec(CERT.cert.toString()); return m ? Buffer.from(m[1].replace(/\s+/g, ''), 'base64') : null; })() : null;

/* ---------- statische Dateien (PWA, Anleitung, Zertifikat) ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const WWW = opt.www ? path.resolve(opt.www) : null;
function anleitung(){
  let t;
  try { t = fs.readFileSync(path.join(HERE, 'feldserver-anleitung.html'), 'utf8'); }
  catch (e){ t = '<!DOCTYPE html><meta charset="utf-8"><h1>Munggi Feldserver</h1><p><a href="/munggi-feldserver.cer">Zertifikat laden</a> – danach auf dem Handy installieren und vertrauen; App: https://{{IP}}:{{PORT}}/ – Sitzung: {{IP}}:{{PORT}}</p>'; }
  return t.replace(/\{\{IP\}\}/g, mainIp()).replace(/\{\{PORT\}\}/g, String(PORT));
}
function httpResponse(status, ctype, body, extra){
  const b = Buffer.isBuffer(body) ? body : Buffer.from(body);
  return Buffer.concat([Buffer.from('HTTP/1.1 ' + status + '\r\nContent-Type: ' + ctype + '\r\nContent-Length: ' + b.length + '\r\nConnection: close\r\nCache-Control: no-cache\r\n' + (extra || '') + '\r\n'), b]);
}
/* ---------- T436: Weltkarten (PMTiles) mit Bereichsanfragen ---------- */
const CORS = 'Access-Control-Allow-Origin: *\r\nAccess-Control-Allow-Headers: Range, If-Match, If-None-Match\r\nAccess-Control-Expose-Headers: Content-Range, Content-Length, Accept-Ranges, ETag\r\n';
function pmHeader(fd){
  /* PMTiles-Kopf (127 Byte): Kacheltyp, Zoom, Umgrenzung */
  try {
    const b = Buffer.alloc(127); fs.readSync(fd, b, 0, 127, 0); if (b.toString('latin1', 0, 7) !== 'PMTiles') return null;
    const e7 = o => b.readInt32LE(o) / 1e7;
    return { tileType: b[99], minZoom: b[100], maxZoom: b[101], bounds: [e7(102), e7(106), e7(110), e7(114)], center: [e7(119), e7(123), b[118]] };
  } catch (e){ return null; }
}
function weltIndex(){
  const out = [];
  try {
    for (const name of fs.readdirSync(WELT_DIR)){
      if (!/\.pmtiles$/i.test(name)) continue;
      const f = path.join(WELT_DIR, name); const st = fs.statSync(f); if (!st.isFile()) continue;
      let hd = null; try { const fd = fs.openSync(f, 'r'); hd = pmHeader(fd); fs.closeSync(fd); } catch (e){}
      out.push(Object.assign({ file: name, name: name.replace(/\.pmtiles$/i, '').replace(/[_-]+/g, ' '), size: st.size, mtime: st.mtimeMs }, hd || {}));
    }
  } catch (e){}
  return out;
}
function weltServe(sock, method, p, head){
  if (method === 'OPTIONS'){ sock.end(Buffer.from('HTTP/1.1 204 No Content\r\n' + CORS + 'Access-Control-Allow-Methods: GET, HEAD, OPTIONS\r\nAccess-Control-Max-Age: 86400\r\nContent-Length: 0\r\nConnection: close\r\n\r\n')); return; }
  if (p === '/welt/index.json' || p === '/welt/' || p === '/welt'){ sock.end(httpResponse('200 OK', 'application/json', JSON.stringify({ welt: true, files: weltIndex() }), CORS)); return; }
  const name = decodeURIComponent(p.slice('/welt/'.length)); const f = path.join(WELT_DIR, name);
  if (!name || name.includes('..') || name.includes('/') || !f.startsWith(WELT_DIR) || !fs.existsSync(f) || !fs.statSync(f).isFile()){ sock.end(httpResponse('404 Not Found', 'text/plain; charset=utf-8', 'Nicht gefunden', CORS)); return; }
  const size = fs.statSync(f).size; const etag = '"' + size.toString(16) + '-' + Math.floor(fs.statSync(f).mtimeMs).toString(16) + '"';
  const rm = /^range:\s*bytes=(\d*)-(\d*)/im.exec(head); let start = 0, end = size - 1, status = '200 OK';
  if (rm && (rm[1] !== '' || rm[2] !== '')){
    if (rm[1] === ''){ start = Math.max(0, size - parseInt(rm[2], 10)); } else { start = parseInt(rm[1], 10); if (rm[2] !== '') end = Math.min(size - 1, parseInt(rm[2], 10)); }
    if (isNaN(start) || start > end || start >= size){ sock.end(Buffer.from('HTTP/1.1 416 Range Not Satisfiable\r\n' + CORS + 'Content-Range: bytes */' + size + '\r\nContent-Length: 0\r\nConnection: close\r\n\r\n')); return; }
    status = '206 Partial Content';
  }
  const len = end - start + 1;
  const hdr = 'HTTP/1.1 ' + status + '\r\nContent-Type: application/octet-stream\r\nContent-Length: ' + len + '\r\nAccept-Ranges: bytes\r\nETag: ' + etag + '\r\nCache-Control: public, max-age=3600\r\nConnection: close\r\n' + CORS + (status[0] === '2' && status[2] === '6' ? 'Content-Range: bytes ' + start + '-' + end + '/' + size + '\r\n' : '') + '\r\n';
  sock.write(hdr);
  if (method === 'HEAD'){ sock.end(); return; }
  const rs = fs.createReadStream(f, { start, end }); rs.on('error', () => { try { sock.destroy(); } catch (e){} }); rs.pipe(sock);
}
function staticResponse(url, helper){
  const p = url.split('?')[0];
  if (p === '/munggi-feldserver.cer' || p === '/munggi-feldserver.crt' || p === '/munggi-feldserver.der')
    return CERT_DER ? httpResponse('200 OK', 'application/x-x509-ca-cert', CERT_DER, '')  /* ohne Content-Disposition: iOS zeigt direkt «Profil laden» */ : httpResponse('404 Not Found', 'text/plain; charset=utf-8', 'Kein Zertifikat (Server läuft ohne TLS)');
  if (p === '/munggi-feldserver.pem') return CERT ? httpResponse('200 OK', 'application/x-pem-file', CERT.cert, 'Content-Disposition: attachment; filename="munggi-feldserver.pem"\r\n') : httpResponse('404 Not Found', 'text/plain', 'kein Zertifikat');
  if (p === '/anleitung' || p === '/anleitung.html') return httpResponse('200 OK', 'text/html; charset=utf-8', anleitung());
  if (p === '/status') return httpResponse('200 OK', 'application/json', JSON.stringify({ feldserver: true, ip: mainIp(), port: PORT, tls: !!CERT, pwa: !!WWW, welt: weltIndex().length }));
  if (helper && p === '/') return httpResponse('200 OK', 'text/html; charset=utf-8', anleitung());
  if (WWW){
    const name = (p === '/' || p === '/index.html') ? 'index.html' : p.replace(/^\/+/, '');
    const f = path.join(WWW, name);
    if (!f.startsWith(WWW) || name.includes('..')) return httpResponse('403 Forbidden', 'text/plain', 'nein');
    if (fs.existsSync(f) && fs.statSync(f).isFile())
      return httpResponse('200 OK', MIME[path.extname(name).toLowerCase()] || 'application/octet-stream', fs.readFileSync(f), name === 'sw.js' ? 'Service-Worker-Allowed: /\r\n' : '');
  }
  if (p === '/') return httpResponse('200 OK', 'text/html; charset=utf-8', anleitung());
  return httpResponse('404 Not Found', 'text/plain; charset=utf-8', 'Nicht gefunden');
}

/* ---------- WebSocket ---------- */
function wsAccept(key){ return crypto.createHash('sha1').update(key + GUID).digest('base64'); }
function sendText(sock, str){
  const payload = Buffer.from(str, 'utf8');
  let header;
  if (payload.length < 126){ header = Buffer.from([0x81, payload.length]); }
  else if (payload.length < 65536){ header = Buffer.alloc(4); header[0] = 0x81; header[1] = 126; header.writeUInt16BE(payload.length, 2); }
  else { header = Buffer.alloc(10); header[0] = 0x81; header[1] = 127; header.writeBigUInt64BE(BigInt(payload.length), 2); }
  try { sock.write(Buffer.concat([header, payload])); } catch (e) {}
}
/* T322: Grenzen – Rahmen 24 MB, Sendepuffer je Teilnehmer 48 MB (langsames Handy bremst nicht alle), 60 Nachrichten/s je Verbindung,
   Verbindungen ohne Upgrade nach 15 s schliessen */
const MAX_FRAME = 24 * 1024 * 1024, MAX_BUFFERED = 48 * 1024 * 1024, MAX_RATE = 60, UPGRADE_TIMEOUT = 15000;
function sendTo(c, str){
  if (c.writableLength > MAX_BUFFERED){ console.log(new Date().toISOString(), '! Sendepuffer voll – Teilnehmer getrennt'); try { c.destroy(); } catch (e) {} return; }
  sendText(c, str);
}
function broadcast(from, str){ const set = (from && from.room) ? from.room.clients : clients; for (const c of set) if (c !== from) sendTo(c, str); }
/* T322 (Audit Befund 3): Nachrichten mit Empfänger («to») nur an diesen zustellen – Schnappschüsse gehen nicht mehr an alle.
   Der Actor einer Verbindung wird aus dem ersten Feld «actor»/«from» (Klartext oder Hüllen-Kopf) gelernt. */
const actorRe = /"(?:actor|from)"\s*:\s*"([a-z0-9_-]{1,32})"/, toRe = /"to"\s*:\s*"([a-z0-9_-]{1,32})"/;
const typeRe = /"t"\s*:\s*"([a-z_]{1,16})"/;
/* T474: verschlüsselte Hülle {"e":1,"ct":…,"k":"snap|snap_req|p","tr":n,"same":1,"to":…,"from":…,"iv":…,"d":…} – nur die Art ist sichtbar */
const encRe = /^\{"e"\s*:\s*1\b/, kindRe = /"k"\s*:\s*"([a-z_]{1,10})"/, trRe = /"tr"\s*:\s*(\d+)/, sameRe = /"same"\s*:\s*1\b/;
function route(from, msg){
  const head = msg.length > 400 ? msg.slice(0, 400) : msg;
  if (!from.actor){ const am = actorRe.exec(head); if (am) from.actor = am[1]; }
  const r = from.room; const tyM = typeRe.exec(head); let ty = tyM ? tyM[1] : ''; let enc = false;
  if (!ty && encRe.test(head)){ enc = true; const km = kindRe.exec(head); ty = km ? (km[1] === 'p' ? 'peer' : km[1]) : 'enc'; }
  /* T432: Raum-Gedächtnis und Leitung */
  if (r){
    if (ty === 'relay_ctl'){ let m = null; try { m = JSON.parse(msg); } catch (e) {} if (m) relayCtl(from, m); return; }
    if (ty === 'snap'){
      const toRelay = /"to"\s*:\s*"relay"/.test(head);
      if (sameRe.test(head)){ if (r.snap) r.dirty = false; if (toRelay) return; }   /* T474: «unverändert» – der gemerkte Stand gilt weiter */
      else if (enc){ if (msg.length < MAX_FRAME){ snapStoreEnc(r, msg); if (toRelay) return; } }
      else {
        let m = null; try { m = JSON.parse(msg); } catch (e) {}
        if (m && (m.gz || m.state)){ snapStore(r, m); if (m.to === 'relay') return; }   /* an den Server adressiert: nur merken */
      }
    } else if (ty === 'snap_req'){
      /* leerer Raum: gespeicherten Stand liefern; sonst erst, wenn der Beitretende dreimal vergeblich gefragt hat (tries ≥ 3) */
      const trM = (enc ? trRe : /"tries"\s*:\s*(\d+)/).exec(head); const tries = trM ? parseInt(trM[1], 10) : 0;
      if (r.snap && (r.clients.size <= 1 || tries >= 3)){ const out = snapServe(r, from.actor || ''); if (out){ sendTo(from, out); if (r.clients.size <= 1) return; } }
    } else if (ty && !/^(hello|peer|bye|pong|ping)$/.test(ty)) r.dirty = true;
  }
  const tm = toRe.exec(head);
  if (tm){
    let hit = 0;
    const set = r ? r.clients : clients;
    for (const c of set) if (c !== from && c.actor === tm[1]){ sendTo(c, msg); hit++; }
    if (hit) return;                    /* Empfänger bekannt → nur dorthin */
    if (tm[1] === 'relay') return;
  }
  broadcast(from, msg);
}

/* Eine (Klartext- oder TLS-)Verbindung bedienen: HTTP-Kopf lesen, dann WebSocket oder statische Antwort */
function handleStream(sock, helper){
  let buf = Buffer.alloc(0);
  let upgraded = false;
  let fragments = [];
  let fragBytes = 0;
  const upgradeTimer = setTimeout(() => { if (!upgraded){ try { sock.destroy(); } catch (e) {} } }, UPGRADE_TIMEOUT);
  sock.on('data', chunk => {
    if (!upgraded && buf.length + chunk.length > 65536){ sock.destroy(); return; }
    buf = Buffer.concat([buf, chunk]);
    if (buf.length > MAX_FRAME + 65536){ sock.destroy(); return; }
    if (!upgraded){
      const idx = buf.indexOf('\r\n\r\n');
      if (idx === -1){ if (buf.length > 16384) sock.destroy(); return; }
      const head = buf.slice(0, idx).toString('utf8');
      buf = buf.slice(idx + 4);
      const lineM = /^(\S+)\s+(\S+)/.exec(head);
      const method = lineM ? lineM[1] : '', url = lineM ? lineM[2] : '/';
      const isWs = /^upgrade:\s*websocket/im.test(head);
      if (!isWs){
        const p0 = url.split('?')[0];
        if (p0 === '/welt' || p0.startsWith('/welt/')){ clearTimeout(upgradeTimer); weltServe(sock, method, p0, head); return; }   /* T436 */
        if (method !== 'GET' && method !== 'HEAD'){ sock.end(httpResponse('405 Method Not Allowed', 'text/plain', 'nur GET')); return; }
        sock.end(staticResponse(url, helper)); return;
      }
      if (helper){ sock.end(httpResponse('403 Forbidden', 'text/plain', 'Sitzung nur auf dem Hauptport')); return; }
      const keyM = /sec-websocket-key:\s*(.+)/i.exec(head);
      const codeM = /[?&]code=([^&\s]*)/.exec(url);
      let code = '';
      /* T322 (Audit Befund 3): fehlerhafte Kodierung (z. B. «%») warf eine Ausnahme und beendete den ganzen Prozess */
      try { code = codeM ? decodeURIComponent(codeM[1]) : ''; } catch (e){ sock.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\nUngültiger Code'); return; }
      const room = keyM && code ? (rooms.get(code) || (OPEN ? roomGet(code, true) : null)) : null;   /* T432: Raum = Einsatzcode */
      if (!keyM || !room){
        sock.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n' + (keyM ? (rooms.size > 1 || OPEN ? 'Raum nicht freigegeben' : 'Falscher Einsatzcode') : 'Kein WebSocket'));
        return;
      }
      let lead = ''; try { const lm = /[?&]lead=([^&\s]*)/.exec(url); lead = lm ? decodeURIComponent(lm[1]) : ''; } catch (e) {}
      sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + wsAccept(keyM[1].trim()) + '\r\n\r\n');
      upgraded = true; clearTimeout(upgradeTimer);
      try { sock.setKeepAlive(true, 30000); } catch (e) {}   /* T310: tote Mobilfunk-Verbindungen erkennen */
      clients.add(sock); sock.room = room; room.clients.add(sock); sock.lead = !!(LEAD && lead === LEAD);
      console.log(new Date().toISOString(), '+ Teilnehmer verbunden' + (sock.encrypted ? ' (wss)' : ' (ws)') + ' · Raum «' + room.code + '» (' + room.clients.size + ' im Raum, ' + clients.size + ' gesamt)' + (sock.lead ? ' · Leitung' : ''));
      sendText(sock, JSON.stringify({ t: 'relay', v: 3, room: room.code, name: room.name, n: room.clients.size, hasSnap: !!room.snap, snapAt: room.snapAt, allow: { d2t: room.d2t, t2d: room.t2d }, lead: sock.lead, open: OPEN, rooms: rooms.size }));
      if (sock.lead) sendText(sock, roomsMsg());
    }
    for (;;){
      if (buf.length < 2) return;
      const fin = (buf[0] & 0x80) !== 0;
      const opcode = buf[0] & 0x0f;
      const masked = (buf[1] & 0x80) !== 0;
      let len = buf[1] & 0x7f;
      let off = 2;
      if (len === 126){ if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
      else if (len === 127){ if (buf.length < 10) return; const big = buf.readBigUInt64BE(2); if (big > BigInt(MAX_FRAME)){ console.log(new Date().toISOString(), '! Rahmen zu gross (' + big + ' Bytes) – Verbindung getrennt'); sock.destroy(); return; } len = Number(big); off = 10; }
      if (len > MAX_FRAME){ sock.destroy(); return; }
      const maskLen = masked ? 4 : 0;
      if (buf.length < off + maskLen + len) return;
      const mask = masked ? buf.slice(off, off + 4) : null;
      let payload = buf.slice(off + maskLen, off + maskLen + len);
      if (mask){ payload = Buffer.from(payload); for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3]; }
      buf = buf.slice(off + maskLen + len);
      if (opcode === 0x8){ sock.end(); return; }
      if (opcode === 0x9){ const h = Buffer.from([0x8a, Math.min(payload.length, 125)]); try { sock.write(Buffer.concat([h, payload.slice(0, 125)])); } catch (e) {} continue; }
      if (opcode === 0xa) continue;
      if (opcode === 0x1 || opcode === 0x0){
        fragments.push(payload); fragBytes += payload.length;
        if (fragBytes > MAX_FRAME){ sock.destroy(); return; }
        if (fin){
          const msg = Buffer.concat(fragments).toString('utf8'); fragments = []; fragBytes = 0;
          /* T310: Klartext-Ping der App (Mobilfunk-Wächter) nur dem Absender mit Pong beantworten – nicht verteilen */
          if (msg.length < 200 && /"t"\s*:\s*"ping"/.test(msg)){ sendText(sock, '{"t":"pong"}'); continue; }
          /* T322: Rate je Verbindung */
          const nowS = Date.now() / 1000 | 0; if (sock.rateSec !== nowS){ sock.rateSec = nowS; sock.rateN = 0; }
          if (++sock.rateN > MAX_RATE){ if (sock.rateN === MAX_RATE + 1) console.log(new Date().toISOString(), '! Zu viele Nachrichten – gedrosselt'); continue; }
          route(sock, msg);
        }
      }
    }
  });
  const drop = () => { clearTimeout(upgradeTimer); if (clients.delete(sock)){ if (sock.room){ const r = sock.room; r.clients.delete(sock); if (r.snap) roomPersist(r, true);
      /* T474: geht ein Teilnehmer und der Stand ist nicht aktuell, gleich nachfragen (statt bis zu SNAP_SEC zu warten) */
      if (r.clients.size && r.dirty && Date.now() - r.lastAsk > Math.min(20000, SNAP_SEC * 1000)) snapAsk(r); } console.log(new Date().toISOString(), '- Teilnehmer getrennt (' + clients.size + ' aktiv)'); } };
  sock.on('close', drop);
  sock.on('error', drop);
}

/* ---------- Hauptport: erstes Byte entscheidet zwischen TLS und Klartext ---------- */
const tlsServer = CERT ? tls.createServer({ cert: CERT.cert, key: CERT.key }, s => handleStream(s, false)) : null;
if (tlsServer) tlsServer.on('tlsClientError', e => { if (process.env.MUNGGI_DEBUG) console.log('TLS-Fehler:', e.message); });
const server = net.createServer(sock => {
  sock.setNoDelay(true);
  sock.once('data', first => {
    sock.pause(); sock.unshift(first);
    if (first[0] === 0x16 && tlsServer) tlsServer.emit('connection', sock);
    else handleStream(sock, false);
    process.nextTick(() => sock.resume());
  });
  sock.on('error', () => {});
});
const helperServer = net.createServer(sock => { sock.on('error', () => {}); handleStream(sock, true); });

server.listen(PORT, '0.0.0.0', () => {
  console.log('==============================================');
  console.log(' Munggi Feldserver läuft');
  console.log(' Port:        ' + PORT + (CERT ? '  (ws:// und wss:// – Zertifikat: ' + CERT.from + ')' : '  (nur ws://, ohne TLS)'));
  console.log(' Einsatzcode: ' + CODE + (CODE === 'MUNGGI' ? '   ⚠ Standardcode – für Internet-Relays unbedingt eigenen Code setzen (2. Argument oder --code)' : ''));
  if (rooms.size > 1 || OPEN) console.log(' Räume:       ' + Array.from(rooms.keys()).join(', ') + (OPEN ? '  (+ neue Codes eröffnen Räume)' : '') + (LEAD ? '  · Leitungs-Code gesetzt' : '  · kein Leitungs-Code (--lead)'));
  console.log(' Gedächtnis:  ' + DATA_DIR + '  (Schnappschuss alle ' + SNAP_SEC + ' s)');
  try { const n = weltIndex().length; console.log(' Weltkarten:  ' + WELT_DIR + '  (' + n + ' Datei' + (n === 1 ? '' : 'en') + ' · /welt/index.json)'); } catch (e){}
  console.log(' Teilnehmer verbinden sich mit  ' + mainIp() + ':' + PORT);
  if (CERT) console.log(' Handys: Zertifikat + Anleitung unter  http://' + mainIp() + ':' + HELPER_PORT + '/');
  if (WWW) console.log(' PWA:    https://' + mainIp() + ':' + PORT + '/  (aus ' + WWW + ')');
  console.log(' Beenden mit Ctrl+C');
  console.log('==============================================');
});
helperServer.on('error', e => console.log(' Hilfsport ' + HELPER_PORT + ' nicht verfügbar (' + e.code + ') – Zertifikat dann über https://' + mainIp() + ':' + PORT + '/munggi-feldserver.cer'));
helperServer.listen(HELPER_PORT, '0.0.0.0');
