const http = require('http');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { IgApiClient, RealtimeClient } = require('nodejs-insta-private-api');

const PORT = 3001;
const SESSIONS_DIR = path.join(__dirname, '..', 'sessions');

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });

const waSessions = new Map();
const igSessions = new Map();

// =================== WHATSAPP ===================

function getSessionDir(sessionId) {
  const dir = path.join(SESSIONS_DIR, sessionId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function createWASession(sessionId, retries = 0) {
  if (retries > 3) return { error: 'Não foi possível conectar. Tente novamente.' };

  if (waSessions.has(sessionId)) {
    const s = waSessions.get(sessionId);
    if (s.connected) return { connected: true, phone: s.phone };
    if (s.qr) return { qr: s.qr };
  }

  const { state, saveCreds } = await useMultiFileAuthState(getSessionDir(sessionId));
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ['Rede Auto', 'Chrome', '1.0'],
    defaultQueryTimeoutMs: 60000,
    connectTimeoutMs: 20000,
  });

  const sessionData = { sock, qr: null, connected: false, phone: null };
  waSessions.set(sessionId, sessionData);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { qr, connection, lastDisconnect } = update;
    if (qr) {
      try {
        const dataUrl = await QRCode.toDataURL(qr, { width: 300 });
        sessionData.qr = dataUrl;
      } catch (err) {
        console.error(`[WA ${sessionId}] QR error:`, err.message);
      }
    }
    if (connection === 'open') {
      sessionData.connected = true;
      sessionData.qr = null;
      sessionData.phone = sock.user?.id?.split(':')[0] || null;
      console.log(`[WA ${sessionId}] connected, phone: ${sessionData.phone}`);
    }
    if (connection === 'close') {
      sessionData.connected = false;
      sessionData.qr = null;
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut && code !== 401) {
        setTimeout(() => createWASession(sessionId, retries + 1), 1000);
      } else {
        try { fs.rmSync(getSessionDir(sessionId), { recursive: true, force: true }); } catch {}
        waSessions.delete(sessionId);
      }
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;
    for (const msg of m.messages) {
      if (msg.key.fromMe) continue;
      const jid = msg.key.remoteJid;
      if (!jid || jid === 'status@broadcast') continue;
      const text = msg.message?.conversation
        || msg.message?.extendedTextMessage?.text
        || msg.message?.imageMessage?.caption || '';
      if (!text) continue;
      const phone = jid.replace(/\D/g, '');
      await notifyWebhook({
        platform: 'whatsapp',
        session_id: sessionId,
        message: { id: msg.key.id, text, from: phone, pushName: msg.pushName || phone },
      });
    }
  });

  for (let i = 0; i < 40; i++) {
    if (sessionData.qr) return { qr: sessionData.qr };
    if (sessionData.connected) return { connected: true, phone: sessionData.phone };
    await new Promise((r) => setTimeout(r, 200));
  }
  return sessionData.connected
    ? { connected: true, phone: sessionData.phone }
    : sessionData.qr
      ? { qr: sessionData.qr }
      : { error: 'Tempo esgotado ao gerar QR Code. Tente novamente.' };
}

// =================== INSTAGRAM ===================

async function createIGSession(sessionId, username, password) {
  if (igSessions.has(sessionId)) {
    const s = igSessions.get(sessionId);
    if (s.connected) return { connected: true, username: s.username };
  }

  const sessionDir = path.join(SESSIONS_DIR, sessionId);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const ig = new IgApiClient();
  ig.state.generateDevice(username);

  // Try to load saved state first
  const stateFile = path.join(sessionDir, 'ig-state.json');
  let loggedIn = false;

  if (fs.existsSync(stateFile)) {
    try {
      const savedState = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
      await ig.state.deserialize(savedState);
      // Verify the session is still valid
      await ig.account.currentUser();
      loggedIn = true;
      console.log(`[IG ${sessionId}] restored session for ${username}`);
    } catch (err) {
      console.log(`[IG ${sessionId}] saved state invalid, will login fresh`);
    }
  }

  if (!loggedIn) {
    try {
      await ig.simulate.preLoginFlow();
      await ig.account.login({ username, password });
      const state = await ig.state.serialize();
      fs.writeFileSync(stateFile, JSON.stringify(state));
      console.log(`[IG ${sessionId}] logged in as ${username}`);
    } catch (loginErr) {
      console.error(`[IG ${sessionId}] login failed:`, loginErr.message);
      const msg = loginErr.message || '';
      if (msg.includes('two-factor') || msg.includes('2fa') || msg.includes('challenge')) {
        return { error: 'O Instagram pediu verificação de dois fatores. Tente desativar temporariamente no seu Instagram e conectar novamente.' };
      }
      if (msg.includes('rate') || msg.includes('block') || msg.includes('spam')) {
        return { error: 'O Instagram bloqueou a tentativa de login. Aguarde alguns minutos e tente novamente.' };
      }
      return { error: 'Login ou senha incorretos. Verifique e tente novamente.' };
    }
  }

  const sessionData = { ig, connected: true, username, realtime: null };
  igSessions.set(sessionId, sessionData);

  // Start realtime listener for DMs
  try {
    const realtime = new RealtimeClient();
    await realtime.connect({ ig, graphQlSubs: ['ig_sub_direct'] });
    sessionData.realtime = realtime;

    realtime.on('message', (msg) => {
      const text = msg?.text || '';
      const fromUser = String(msg?.user_id || '');
      if (text && fromUser) {
        notifyWebhook({
          platform: 'instagram',
          session_id: sessionId,
          message: { id: String(msg.message_id || Date.now()), text, from: fromUser, pushName: fromUser },
        });
      }
    });
    console.log(`[IG ${sessionId}] realtime connected`);
  } catch (err) {
    console.error(`[IG ${sessionId}] realtime error:`, err.message);
  }

  return { connected: true, username };
}

// =================== WEBHOOK FORWARD ===================

async function notifyWebhook(payload) {
  try {
    const webhookUrl = process.env.SUPABASE_URL;
    if (!webhookUrl) return;
    await fetch(`${webhookUrl}/functions/v1/platform-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[webhook] error:', err.message);
  }
}

// =================== HTTP SERVER ===================

function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.split('/').filter(Boolean);

  // === WhatsApp QR ===
  if (parts.length === 2 && parts[0] === 'qr' && req.method === 'POST') {
    const sessionId = parts[1];
    try {
      const result = await createWASession(sessionId);
      return sendJson(res, result);
    } catch (err) {
      console.error(`[qr] error:`, err.message);
      return sendJson(res, { error: 'Erro ao gerar QR Code. Tente novamente.' }, 500);
    }
  }

  if (parts.length === 2 && parts[0] === 'wa-status' && req.method === 'GET') {
    const s = waSessions.get(parts[1]);
    return sendJson(res, s ? { connected: s.connected, phone: s.phone } : { connected: false });
  }

  if (parts.length === 2 && parts[0] === 'wa-send' && req.method === 'POST') {
    const s = waSessions.get(parts[1]);
    if (!s || !s.connected) return sendJson(res, { error: 'WhatsApp não conectado' }, 400);
    const body = await readBody(req);
    const phone = body.phone?.replace(/\D/g, '');
    if (!phone) return sendJson(res, { error: 'Telefone não informado' }, 400);
    try {
      const result = await s.sock.sendMessage(`${phone}@s.whatsapp.net`, { text: body.text });
      return sendJson(res, { success: true, id: result?.key?.id });
    } catch (err) {
      return sendJson(res, { error: err.message }, 500);
    }
  }

  if (parts.length === 2 && parts[0] === 'wa-restart' && req.method === 'POST') {
    const s = waSessions.get(parts[1]);
    if (s?.sock) { try { await s.sock.logout(); } catch {} }
    waSessions.delete(parts[1]);
    try { fs.rmSync(getSessionDir(parts[1]), { recursive: true, force: true }); } catch {}
    return sendJson(res, { success: true });
  }

  // === Instagram login ===
  if (parts.length === 2 && parts[0] === 'ig-login' && req.method === 'POST') {
    const sessionId = parts[1];
    const body = await readBody(req);
    if (!body.username || !body.password) return sendJson(res, { error: 'Login e senha são obrigatórios' }, 400);
    try {
      const result = await createIGSession(sessionId, body.username, body.password);
      return sendJson(res, result);
    } catch (err) {
      console.error(`[ig-login] error:`, err.message);
      return sendJson(res, { error: 'Login ou senha incorretos. Verifique e tente novamente.' }, 401);
    }
  }

  if (parts.length === 2 && parts[0] === 'ig-status' && req.method === 'GET') {
    const s = igSessions.get(parts[1]);
    return sendJson(res, s ? { connected: s.connected, username: s.username } : { connected: false });
  }

  if (parts.length === 2 && parts[0] === 'ig-restart' && req.method === 'POST') {
    const s = igSessions.get(parts[1]);
    if (s?.realtime) { try { s.realtime.disconnect(); } catch {} }
    igSessions.delete(parts[1]);
    try { fs.rmSync(path.join(SESSIONS_DIR, parts[1]), { recursive: true, force: true }); } catch {}
    return sendJson(res, { success: true });
  }

  // === Health ===
  if (parts.length === 0 || parts[0] === 'health') {
    return sendJson(res, {
      ok: true,
      whatsapp: Array.from(waSessions.keys()),
      instagram: Array.from(igSessions.keys()),
    });
  }

  sendJson(res, { error: 'Not found' }, 404);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Connector Server] rodando em http://127.0.0.1:${PORT}`);
  console.log('  WhatsApp: QR Code');
  console.log('  Instagram: login + senha');
});
