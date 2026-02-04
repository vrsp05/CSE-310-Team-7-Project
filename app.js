require('dotenv').config();
const express = require("express");
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// 1. Configuración de Supabase
// Asegúrate de tener SUPABASE_URL y SUPABASE_ANON_KEY en tu archivo .env
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_ANON_KEY
);

// 2. Configuración de Multer (para procesar los archivos que subas)
const upload = multer({ storage: multer.memoryStorage() });

// 3. Configuración de Express y EJS
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- RUTAS DE NAVEGACIÓN ---

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
    res.render("auth/register");
});

app.get("/dashboard", async (req, res) => {
    // Obtenemos las contraseñas de la tabla 'credentials' para mostrarlas
    const { data: credentials, error } = await supabase
        .from('credentials')
        .select('*');

    res.render("dashboard/index", { credentials: credentials || [] });
});

// --- RUTAS DE SUPABASE ---

// A. Guardar JSON de contraseñas
app.post("/guardar-password", async (req, res) => {
    const { nombre_servicio, password_json } = req.body;

    const { data, error } = await supabase
        .from('credentials') // Tu tabla existente
        .insert([{ 
            data: { servicio: nombre_servicio, ...password_json } 
        }]);

    if (error) return res.status(400).json({ error: error.message });
    res.redirect("/dashboard");
});

// B. Subir archivos al bucket 'files'
app.post("/upload-file", upload.single('archivo_usuario'), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).send('No seleccionaste ningún archivo.');

    // Subimos al bucket 'files' que se ve en tu captura
    const fileName = `uploads/${Date.now()}_${file.originalname}`;
    
    const { data, error } = await supabase.storage
        .from('files') 
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) return res.status(400).json({ error: error.message });
    
    // Opcional: Guardar la referencia del archivo en la base de datos
    await supabase.from('credentials').insert([{ data: { tipo: "archivo", url: data.path } }]);

    res.redirect("/dashboard");
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en: http://localhost:${PORT}`);
});