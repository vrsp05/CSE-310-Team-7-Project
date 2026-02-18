import express from "express";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import session from "express-session";
import { fileURLToPath } from "url";
import multer from "multer"; // Para manejar archivos
import "dotenv/config"; // Carga variables de .env automáticamente
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
  res.locals.user = req.session.user || null;
  next();
});

// ----------------------
// AUTH MIDDLEWARE
// ----------------------
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/?error=Please login first");
  }
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

// ----------------------
// ROUTES EXISTENTES (Se mantienen igual)
// ----------------------

app.get("/", (req, res) => {
  res.render("index", { error: req.query.error || null });
});

app.get("/register", (req, res) => {
  res.render("auth/register", { error: req.query.error || null });
});

app.get("/dashboard", requireAuth, async (req, res) => {
    // Aquí podrías traer datos de Supabase para mostrarlos
    const { data: dbItems } = await supabase.from('credentials').select('*');
    res.render("dashboard/index", { user: req.session.user, dbItems: dbItems || [] });
});

// ROUTES EXISTENTES
// -----------------

app.get("/about", (req, res) => {
  res.render("about", {error: req.query.error || null })
}); 

// ... El resto de tus rutas de registro/login se mantienen igual ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});