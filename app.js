import express from "express";
import cors from "cors";
import path from "path";  
import fs from "fs";
import bcrypt from "bcrypt";
import session from "express-session";
import { fileURLToPath } from "url";
import multer from "multer"; // Para manejar archivos
import "dotenv/config"; // Carga variables de .env automáticamente
import systemInstructionDefault from './config/geminiInstruction.js';
import { createClient } from "@supabase/supabase-js"; // Cliente de Supabase

// ----------------------
// ES MODULE FIXES
// ----------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------
// SUPABASE SETUP
// ----------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Configuración de Multer (subida temporal en memoria)
const upload = multer({ storage: multer.memoryStorage() });

// ----------------------
// APP SETUP
// ----------------------
const app = express();
app.use(cors());

// Simple request logger to help debug routing issues (prints method + path)
app.use((req, res, next) => {
  console.log(`>> ${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Development-friendly Content Security Policy
// Ensures connect-src allows localhost and secure origins so DevTools and XHR/fetch aren't blocked.
app.use((req, res, next) => {
  const connectList = ["'self'", 'http://localhost:3000', 'https:', 'wss:'];
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    `connect-src ${connectList.join(' ')}`,
    "font-src 'self' data:",
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);
  next();
});

// Serve a small permissive response for the Chrome DevTools app-specific probe
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  // return an empty JSON so DevTools probe won't be blocked by 404s
  res.json({});
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Importante para recibir JSON

app.use(
  session({
    secret: "dev-secret-change-later",
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  // Try to read user from cookie token (JWT decode — no network call)
  let user = null;
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map(c => c.trim());
    const tokenCookie = cookies.find(c => c.startsWith('supabaseToken='));
    if (tokenCookie) {
      try {
        const token = tokenCookie.split('=')[1];
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
        user = {
          id: payload.sub,
          email: payload.email,
          username: payload.user_metadata?.display_name || payload.email,
          user_metadata: payload.user_metadata || {}
        };
      } catch (_) {}
    }
  }
  res.locals.user = user;
  next();
});

// ----------------------
// AUTH MIDDLEWARE
// ----------------------
// function requireAuth(req, res, next) {
//   if (!req.session.user) {
//     return res.redirect("/?error=Please login first");
//   }
//   next();
// }
async function requireAuth(req, res, next) {
    let token = null;

    if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').map(c => c.trim());
        const tokenCookie = cookies.find(c => c.startsWith('supabaseToken='));
        if (tokenCookie) token = tokenCookie.split('=')[1];
    }

    if (!token) return res.redirect('/?error=Please+login+first');

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.redirect('/?error=Session+expired');

    res.locals.user = { ...user, username: user.user_metadata?.display_name || user.email };
    req.user = res.locals.user;
    next();
}

// ----------------------
// NUEVAS RUTAS DE SUPABASE
// ----------------------

// 1. Guardar contraseñas en la tabla 'credentials'
app.post("/dashboard/add-credential", requireAuth, async (req, res) => {
  const { serviceName, passwordData } = req.body;

  const { error } = await supabase
    .from('credentials')
    .insert([{ 
      data: { service: serviceName, details: passwordData },
      user_id: req.session.user.id // Si quieres vincularlo al usuario
    }]);

  if (error) return res.status(400).send(error.message);
  res.redirect("/dashboard");
});

// 2. Subir archivos al bucket 'files'
app.post("/dashboard/upload", requireAuth, upload.single('archivo'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('No se seleccionó ningún archivo.');

  // Subida al bucket 'files' que se ve en tu captura
  const filePath = `uploads/${req.session.user.id}/${Date.now()}_${file.originalname}`;
  
  const { data, error } = await supabase.storage
    .from('files') 
    .upload(filePath, file.buffer, {
      contentType: file.mimetype
    });

  if (error) return res.status(400).send(error.message);
  
  // Opcional: Guardar el rastro de la subida en tu tabla
  await supabase.from('credentials').insert([{ 
    data: { type: "file_upload", path: data.path } 
  }]);

  res.redirect("/dashboard");
});

import helmet from 'helmet';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// Load pdf-parse with fallbacks for its various bundle locations
let pdfParse;
try {
  pdfParse = require('pdf-parse');
  if (pdfParse && typeof pdfParse !== 'function' && pdfParse.default) pdfParse = pdfParse.default;
} catch (e) {
  try {
    pdfParse = require('pdf-parse/dist/pdf-parse/cjs/index.cjs');
  } catch (e2) {
    try {
      pdfParse = require('pdf-parse/dist/node/cjs/index.cjs');
    } catch (e3) {
      pdfParse = null;
    }
  }
}
const mammoth = require('mammoth');

// Optional DOCX generator (used to export edited resume as .docx)
let docxPkg = null;
try {
  docxPkg = require('docx');
} catch (e) {
  console.warn('docx package not available. Install `docx` to enable DOCX exports.');
}

// Helper: try multiple Gemini models until one succeeds
async function callGeminiWithFallback(models, key, body) {
  let lastResp = null;
  let lastData = null;
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
    try {
      const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await resp.json().catch(() => null);
      lastResp = resp;
      lastData = data;
      if (resp.ok) {
        // attach url for debugging
        return { resp, data, model };
      } else {
        console.warn(`Gemini model ${model} returned ${resp.status}`, data);
      }
    } catch (err) {
      console.error(`Error calling Gemini model ${model}`, err);
    }
  }
  return { resp: lastResp, data: lastData, model: null };
}

// Log pdfParse availability for debugging
console.log('pdfParse loaded:', typeof pdfParse, Object.keys(pdfParse || {}));

// build connect-src list (incluye localhost para desarrollo)
const connectSrc = ["'self'", 'http://localhost:3000', 'https:', 'wss:'];

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],   // quita 'unsafe-inline' si usas nonces/hashes
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc,
      fontSrc: ["'self'", 'data:'],
    }
  }
}));

// ----------------------
// ROUTES EXISTENTES (Se mantienen igual)
// ----------------------

// Debug: check what user the server sees
app.get("/debug/me", (req, res) => {
  res.json({ user: res.locals.user, cookies: req.headers.cookie || 'none' });
});

app.get("/", (req, res) => {
  res.render("index", { error: req.query.error || null });
});


app.get("/register", (req, res) => {
  res.render("auth/register", { error: req.query.error || null });
});

app.get("/about", (req, res) => {
  res.render("about", { user: res.locals.user || null });
});

app.get("/dashboard", requireAuth, async (req, res) => {
    const { data: dbItems } = await supabase.from('credentials').select('*');
    res.render("dashboard/index", { user: req.user, dbItems: dbItems || [] });
});

app.get("/dashboard/profile", requireAuth, (req, res) => {
    res.render("dashboard/profile", { user: req.user });
});

// Server-side proxy to call Gemini (uses GEMINI_API_KEY from .env)
app.post('/api/generate', requireAuth, async (req, res) => {
  try {
    const { prompt, jobDescription } = req.body || {};
    if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'Missing prompt' });

    // allow override from env; otherwise use the imported default instruction
    const systemInstruction = process.env.GEMINI_SYSTEM_INSTRUCTION || systemInstructionDefault || '';

    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: 'Server misconfigured: missing GEMINI_API_KEY' });

    const basePrompt = jobDescription ? `${prompt}\n\nJob Description:\n${jobDescription}` : prompt;
    const finalPrompt = systemInstruction ? `${systemInstruction}\n\n${basePrompt}` : basePrompt;

    const body = {
      contents: [ { parts: [ { text: finalPrompt } ] } ],
      generationConfig: {
        thinkingConfig: { include_thoughts: true }
      }
    };

    // Choose models to try. You can set GEMINI_DEFAULT_MODEL in .env to force a specific
    // model name (e.g. the exact name returned by the ListModels API). By default we
    // prefer Gemini 3 flash preview.
    const models = process.env.GEMINI_DEFAULT_MODEL
      ? [process.env.GEMINI_DEFAULT_MODEL, 'gemini-3-flash-preview']
      : ['gemini-3-flash-preview'];
    const { resp, data, model } = await callGeminiWithFallback(models, key, body);
    if (!resp || !resp.ok) {
      console.error('Gemini error (all models)', data);
      if (data && data.error && /not found|not supported|unsupported/i.test(data.error.message || '')) {
        console.error('Model appears unsupported for this API version. Try calling /debug/list-models to see available models.');
      }
      return res.status(502).json({ error: data?.error?.message || 'Upstream error', details: data });
    }

    // Assemble response text from candidates -> content -> parts
    const parts = data?.candidates?.[0]?.content?.parts || [];
    let resultText = '';
    parts.forEach(p => {
      if (!p.thought && p.text) {
        resultText += p.text + '\n';
      }
    });

    const resultTrim = resultText.trim();

    // Try to extract Edited Resume block if model produced one
    let editedText = null;
    const editedMatch = resultTrim.match(/Edited Resume:\s*([\s\S]*?)$/i);
    if (editedMatch && editedMatch[1]) {
      editedText = editedMatch[1].trim();
    } else {
      const altMatch = resultTrim.match(/Edited Resume[:\-\n\r\s]*([\s\S]*?)(?:\n\n|$)/i);
      if (altMatch && altMatch[1]) editedText = altMatch[1].trim();
    }

    // Store same session payload as the form flow so Analysis page can read it
    try {
      req.session.last_ai_result = { prompt: basePrompt, result: resultTrim, editedText: editedText || null, raw: data, modelUsed: model };
    } catch (e) {
      console.error('Warning: could not set session last_ai_result', e);
    }

    return res.json({ result: resultTrim, editedText: editedText || null, raw: data });
  } catch (err) {
    console.error('Error calling Gemini', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DEBUG: unauthenticated endpoint to test Gemini from server without session
// Remove this before deploying to production.
app.post('/debug/generate', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: 'Missing GEMINI_API_KEY in server env' });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${encodeURIComponent(key)}`;
    console.log('DEBUG: calling Gemini URL', url);

  const body = { contents: [ { parts: [ { text: prompt } ] } ], generationConfig: { thinkingConfig: { include_thoughts: true } } };
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const text = await resp.text();
    console.log('DEBUG: Gemini status', resp.status, 'body:', text);
    let parsed;
    try { parsed = JSON.parse(text); } catch (e) { parsed = { raw: text }; }
    if (!resp.ok) return res.status(502).json({ status: resp.status, body: parsed });
    return res.json({ status: resp.status, body: parsed });
  } catch (err) {
    console.error('DEBUG /debug/generate error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Small, safe endpoint to check whether the GEMINI_API_KEY is present in the running process.
// This returns only metadata (presence, length, and first/last 4 chars) — not the full key.
app.get('/debug/env', (req, res) => {
  const key = process.env.GEMINI_API_KEY || null;
  if (!key) return res.json({ hasKey: false });
  const safe = `${key.slice(0,4)}...${key.slice(-4)}`;
  return res.json({ hasKey: true, length: key.length, preview: safe });
});

// DEBUG: list available models for the current API key. Useful to discover the correct
// model name and which methods each model supports (generateContent etc.). Returns
// upstream response directly. Remove or protect in production.
app.get('/debug/list-models', async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: 'Missing GEMINI_API_KEY in server env' });
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
    const resp = await fetch(url);
    const text = await resp.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch (e) { parsed = { raw: text }; }
    return res.status(resp.status).json(parsed);
  } catch (err) {
    console.error('DEBUG /debug/list-models error', err);
    return res.status(500).json({ error: 'Server error listing models' });
  }
});


// POST /generate - form submit from dashboard: call Gemini, store result in session, redirect to analysis
app.post('/generate', requireAuth, async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') return res.redirect('/dashboard?error=Missing+prompt');

    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.redirect('/dashboard?error=Server+not+configured');

    const jobDescription = req.body.jobDescription || '';
    // allow system instruction override from env, otherwise use imported default
    const systemInstruction = process.env.GEMINI_SYSTEM_INSTRUCTION || systemInstructionDefault || '';
    const basePrompt = jobDescription ? `${prompt}\n\nJob Description:\n${jobDescription}` : prompt;
    const finalPrompt = systemInstruction ? `${systemInstruction}\n\n${basePrompt}` : basePrompt;
    const body = { contents: [ { parts: [ { text: finalPrompt } ] } ], generationConfig: { thinkingConfig: { include_thoughts: true } } };

    // Prefer GEMINI_DEFAULT_MODEL if set, otherwise prefer Gemini 3 flash preview.
    const models = process.env.GEMINI_DEFAULT_MODEL
      ? [process.env.GEMINI_DEFAULT_MODEL, 'gemini-3-flash-preview']
      : ['gemini-3-flash-preview'];
    const { resp, data, model } = await callGeminiWithFallback(models, key, body);
    if (!resp || !resp.ok) {
      console.error('Gemini error (all models)', data);
      if (data && data.error && /not found|not supported|unsupported/i.test(data.error.message || '')) {
        console.error('Model appears unsupported for this API version. Try calling /debug/list-models to see available models.');
      }
      req.session.last_ai_error = data;
      return res.redirect('/dashboard?error=AI+error');
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    let resultText = '';
    parts.forEach(p => {
      if (p.text) resultText += p.text + '\n';
      if (p.thought) resultText += `(thought) ${p.thought}\n`;
    });

    const resultTrim = resultText.trim();

    // Try to extract Edited Resume block
    let editedText = null;
    const editedMatch = resultTrim.match(/Edited Resume:\s*([\s\S]*?)$/i);
    if (editedMatch && editedMatch[1]) {
      editedText = editedMatch[1].trim();
    } else {
      const altMatch = resultTrim.match(/Edited Resume[:\-\n\r\s]*([\s\S]*?)(?:\n\n|$)/i);
      if (altMatch && altMatch[1]) editedText = altMatch[1].trim();
    }

    // Store in session so analysis page can show it
    req.session.last_ai_result = { prompt: basePrompt, result: resultTrim, editedText: editedText || null, raw: data, modelUsed: model };
    return res.redirect('/dashboard/analysis');
  } catch (err) {
    console.error('Error in /generate', err);
    return res.redirect('/dashboard?error=Server+error');
  }
});

// POST /generate-file - accept resume file + jobDescription, extract text and call Gemini
app.post('/generate-file', requireAuth, upload.single('resumeFile'), async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription || '';
    const systemInstruction = process.env.GEMINI_SYSTEM_INSTRUCTION || systemInstructionDefault || '';

    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No resume file uploaded. Please attach a PDF or DOCX.' });

    // Extract text based on file type/extension
    const name = (file.originalname || '').toLowerCase();
    let resumeText = '';

    if (name.endsWith('.pdf') || file.mimetype === 'application/pdf') {
      // pdf-parse v1 exported a function; v2 exports { PDFParse } class.
      try {
        if (typeof pdfParse === 'function') {
          const parsed = await pdfParse(file.buffer);
          resumeText = parsed?.text || '';
        } else if (pdfParse && pdfParse.PDFParse) {
          const Parser = pdfParse.PDFParse;
          const parser = new Parser({ data: file.buffer });
          const parsed = await parser.getText();
          resumeText = parsed?.text || '';
          try { await parser.destroy(); } catch (e) { /* ignore */ }
        } else {
          return res.status(500).json({ error: 'Server error: pdf parsing library not available' });
        }
      } catch (e) {
        console.error('pdf-parse error', e);
        return res.status(500).json({ error: 'Server error while parsing PDF' });
      }
    } else if (name.endsWith('.docx') || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      resumeText = result.value || '';
    } else if (name.endsWith('.txt') || file.mimetype.startsWith('text/')) {
      resumeText = file.buffer.toString('utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload PDF, DOCX or TXT.' });
    }

    const basePrompt = `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`;
    const finalPrompt = systemInstruction ? `${systemInstruction}\n\n${basePrompt}` : basePrompt;

    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: 'Server misconfigured: missing GEMINI_API_KEY' });

    const body = { contents: [ { parts: [ { text: finalPrompt } ] } ], generationConfig: { thinkingConfig: { include_thoughts: true } } };

    // Prefer GEMINI_DEFAULT_MODEL if set, otherwise prefer Gemini 3 flash preview.
    const models = process.env.GEMINI_DEFAULT_MODEL
      ? [process.env.GEMINI_DEFAULT_MODEL, 'gemini-3-flash-preview']
      : ['gemini-3-flash-preview'];
    const { resp, data, model } = await callGeminiWithFallback(models, key, body);
    if (!resp || !resp.ok) {
      console.error('Gemini error (all models)', data);
      if (data && data.error && /not found|not supported|unsupported/i.test(data.error.message || '')) {
        console.error('Model appears unsupported for this API version. Try calling /debug/list-models to see available models.');
      }
      return res.status(502).json({ error: data?.error?.message || 'Upstream error', details: data });
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    let resultText = '';
    parts.forEach(p => {
      if (!p.thought && p.text) {
        resultText += p.text + '\n';
      }
    });

    const resultTrim = resultText.trim();

    // Parse structured JSON response from Gemini
    let aiJson = null;
    try {
      // Strip markdown fences if the model wrapped it anyway
      const cleaned = resultTrim.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
      aiJson = JSON.parse(cleaned);
    } catch (e) {
      console.warn('Gemini response was not valid JSON, storing as plain text', e.message);
    }

    const editedText   = aiJson?.editedResume   || null;
    const score        = aiJson?.score          ?? null;
    const matchingKeywords = aiJson?.matchingKeywords || null;
    const missingGaps  = aiJson?.missingGaps    || null;
    const summary      = aiJson?.summary        || null;
    const suggestions  = aiJson?.suggestions    || null;

    // store in session for Analysis page
    try {
      req.session.last_ai_result = {
        prompt: basePrompt,
        result: resultTrim,
        editedText,
        score,
        matchingKeywords,
        missingGaps,
        summary,
        suggestions,
        raw: data,
        modelUsed: model
      };
    } catch (e) { console.error(e); }

    return res.json({ ok: true, editedText: editedText || null });
  } catch (err) {
    console.error('Error in /generate-file', err);
    return res.status(500).json({ error: 'Server error' });
  }
});


// GET /dashboard/analysis - render analysis page and include last AI result from session (once only)
app.get('/dashboard/analysis', requireAuth, (req, res) => {
  const ai = req.session.last_ai_result || null;
  // clear it after reading so it doesn't persist
  delete req.session.last_ai_result;
  res.render('dashboard/analysis', { user: req.user, aiResult: ai });
});


// ... El resto de tus rutas de registro/login se mantienen igual ...

// ----------------------
// AUTH ROUTES (login / logout)
// ----------------------
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, username } = req.body;
    const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { display_name: username } }
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Success! Check your email to confirm.", user: data.user });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Login successful", session: data.session });
});

app.get('/logout', async (req, res) => {
    await supabase.auth.signOut();
    res.setHeader('Set-Cookie', 'supabaseToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;');
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// POST /download/corrected-docx - create a .docx from provided editedText and stream it
app.post('/download/corrected-docx', requireAuth, async (req, res) => {
  try {
    if (!docxPkg) return res.status(500).json({ error: 'DOCX export not available on server. Install docx package.' });
    const { editedText, filename } = req.body || {};
    if (!editedText) return res.status(400).json({ error: 'Missing editedText' });

    const { Document, Packer, Paragraph, TextRun } = docxPkg;

    // Build paragraphs from each line (docx v8+ API: sections passed to constructor)
    const lines = editedText.split(/\r?\n/);
    const children = lines.map(line =>
      line.trim() === ''
        ? new Paragraph({})
        : new Paragraph({ children: [ new TextRun({ text: line, size: 24, font: 'Calibri' }) ] })
    );

    const doc = new Document({
      sections: [{ children }]
    });

    const buffer = await Packer.toBuffer(doc);
    const outName = (filename ? filename.replace(/\.[^.]+$/, '') : 'improved_resume');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}.docx"`);
    return res.send(buffer);
  } catch (err) {
    console.error('Error building DOCX', err);
    return res.status(500).json({ error: 'Server error building DOCX: ' + err.message });
  }
});