import express from "express";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import session from "express-session";
import { fileURLToPath } from "url";
import { pool } from "./src/db/db.js";

// ----------------------
// ES MODULE FIXES
// ----------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------
// APP SETUP
// ----------------------
const app = express();

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Read form data
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(
  session({
    secret: "dev-secret-change-later",
    resave: false,
    saveUninitialized: false,
  })
);

// Make user available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// ----------------------
// JSON "DATABASE"
// ----------------------
const USERS_FILE = path.join(__dirname, "data", "users.json");

// Ensure data folder + file exist
if (!fs.existsSync(path.dirname(USERS_FILE))) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, "[]", "utf-8");
}

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

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
// ROUTES
// ----------------------

// Login page
app.get("/", (req, res) => {
  res.render("index", { error: req.query.error || null });
});

// Register page
app.get("/register", (req, res) => {
  res.render("auth/register", { error: req.query.error || null });
});

// Register POST
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.redirect("/register?error=Please fill all fields");
  }

  const users = readUsers();

  if (users.some((u) => u.username === username)) {
    return res.redirect("/register?error=Username already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  users.push({
    id: Date.now().toString(),
    username,
    email,
    passwordHash,
  });

  writeUsers(users);
  res.redirect("/?error=Account created. Please login.");
});

// Login POST
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const users = readUsers();
  const user = users.find((u) => u.username === username);

  if (!user) return res.redirect("/?error=Wrong username or password");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.redirect("/?error=Wrong username or password");

  req.session.user = {
    id: user.id,
    username: user.username,
  };

  res.redirect("/dashboard");
});

// Dashboard
app.get("/dashboard", requireAuth, (req, res) => {
  res.render("dashboard/index", { user: req.session.user });
});

// Analysis page
app.get("/dashboard/analysis", requireAuth, (req, res) => {
  res.render("dashboard/analysis", { user: req.session.user });
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// ----------------------
// DB TEST ROUTE
// ----------------------
app.get("/db-test", async (req, res) => {
  try {
    const r = await pool.query("select now() as now");
    res.json(r.rows[0]);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// SERVER
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});