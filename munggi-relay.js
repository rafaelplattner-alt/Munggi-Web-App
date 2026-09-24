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
   (Hinweis: In der Windows-EXE ist derselbe Server eingebaut –
   dieses Skript braucht es nur für Browser-/PWA-Hosts oder Tests.)
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
  if (a.startsWith('--')){ const k = a.slice(2); if (k === 'no-tls'){ opt.noTls = true; } else { opt[k] = argv[++i]; } }
  else pos.push(a);
}
const PORT = parseInt(pos[0], 10) || 8765;
const CODE = (pos[1] || 'MUNGGI').trim();
const HELPER_PORT = PORT + 1;
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const clients = new Set();
const HERE = __dirname;

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
function staticResponse(url, helper){
  const p = url.split('?')[0];
  if (p === '/munggi-feldserver.cer' || p === '/munggi-feldserver.crt' || p === '/munggi-feldserver.der')
    return CERT_DER ? httpResponse('200 OK', 'application/x-x509-ca-cert', CERT_DER, '')  /* ohne Content-Disposition: iOS zeigt direkt «Profil laden» */ : httpResponse('404 Not Found', 'text/plain; charset=utf-8', 'Kein Zertifikat (Server läuft ohne TLS)');
  if (p === '/munggi-feldserver.pem') return CERT ? httpResponse('200 OK', 'application/x-pem-file', CERT.cert, 'Content-Disposition: attachment; filename="munggi-feldserver.pem"\r\n') : httpResponse('404 Not Found', 'text/plain', 'kein Zertifikat');
  if (p === '/anleitung' || p === '/anleitung.html') return httpResponse('200 OK', 'text/html; charset=utf-8', anleitung());
  if (p === '/status') return httpResponse('200 OK', 'application/json', JSON.stringify({ feldserver: true, ip: mainIp(), port: PORT, tls: !!CERT, pwa: !!WWW }));
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
function broadcast(from, str){ for (const c of clients) if (c !== from) sendText(c, str); }

/* Eine (Klartext- oder TLS-)Verbindung bedienen: HTTP-Kopf lesen, dann WebSocket oder statische Antwort */
function handleStream(sock, helper){
  let buf = Buffer.alloc(0);
  let upgraded = false;
  let fragments = [];
  sock.on('data', chunk => {
    buf = Buffer.concat([buf, chunk]);
    if (!upgraded){
      const idx = buf.indexOf('\r\n\r\n');
      if (idx === -1){ if (buf.length > 16384) sock.destroy(); return; }
      const head = buf.slice(0, idx).toString('utf8');
      buf = buf.slice(idx + 4);
      const lineM = /^(\S+)\s+(\S+)/.exec(head);
      const method = lineM ? lineM[1] : '', url = lineM ? lineM[2] : '/';
      const isWs = /^upgrade:\s*websocket/im.test(head);
      if (!isWs){
        if (method !== 'GET' && method !== 'HEAD'){ sock.end(httpResponse('405 Method Not Allowed', 'text/plain', 'nur GET')); return; }
        sock.end(staticResponse(url, helper)); return;
      }
      if (helper){ sock.end(httpResponse('403 Forbidden', 'text/plain', 'Sitzung nur auf dem Hauptport')); return; }
      const keyM = /sec-websocket-key:\s*(.+)/i.exec(head);
      const codeM = /[?&]code=([^&\s]*)/.exec(url);
      const code = codeM ? decodeURIComponent(codeM[1]) : '';
      if (!keyM || code !== CODE){
        sock.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n' + (keyM ? 'Falscher Einsatzcode' : 'Kein WebSocket'));
        return;
      }
      sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + wsAccept(keyM[1].trim()) + '\r\n\r\n');
      upgraded = true;
      clients.add(sock);
      console.log(new Date().toISOString(), '+ Teilnehmer verbunden' + (sock.encrypted ? ' (wss)' : ' (ws)') + ' (' + clients.size + ' aktiv)');
    }
    for (;;){
      if (buf.length < 2) return;
      const fin = (buf[0] & 0x80) !== 0;
      const opcode = buf[0] & 0x0f;
      const masked = (buf[1] & 0x80) !== 0;
      let len = buf[1] & 0x7f;
      let off = 2;
      if (len === 126){ if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
      else if (len === 127){ if (buf.length < 10) return; const big = buf.readBigUInt64BE(2); if (big > 512n * 1024n * 1024n){ sock.destroy(); return; } len = Number(big); off = 10; }
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
        fragments.push(payload);
        if (fin){ const msg = Buffer.concat(fragments).toString('utf8'); fragments = []; broadcast(sock, msg); }
      }
    }
  });
  const drop = () => { if (clients.delete(sock)) console.log(new Date().toISOString(), '- Teilnehmer getrennt (' + clients.size + ' aktiv)'); };
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
  console.log(' Einsatzcode: ' + CODE);
  console.log(' Teilnehmer verbinden sich mit  ' + mainIp() + ':' + PORT);
  if (CERT) console.log(' Handys: Zertifikat + Anleitung unter  http://' + mainIp() + ':' + HELPER_PORT + '/');
  if (WWW) console.log(' PWA:    https://' + mainIp() + ':' + PORT + '/  (aus ' + WWW + ')');
  console.log(' Beenden mit Ctrl+C');
  console.log('==============================================');
});
helperServer.on('error', e => console.log(' Hilfsport ' + HELPER_PORT + ' nicht verfügbar (' + e.code + ') – Zertifikat dann über https://' + mainIp() + ':' + PORT + '/munggi-feldserver.cer'));
helperServer.listen(HELPER_PORT, '0.0.0.0');
