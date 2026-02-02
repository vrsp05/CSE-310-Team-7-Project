const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const session = require("express-session");


const app = express();

// EJS
app.set("view engine", "ejs");
app.set("views", "./views");

// Static files (CSS, etc.)
app.use(express.static("public"));

// Read form data (POST)
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "dev-secret-change-later",
    resave: false,
    saveUninitialized: false,
  })
);


// ----------------------
// JSON "database" helpers
// ----------------------
const USERS_FILE = path.join(__dirname, "data", "users.json");

function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
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

// Register POST (create user)
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.redirect("/register?error=Please fill all fields");
  }

  const users = readUsers();

  // check duplicates
  const usernameTaken = users.some((u) => u.username === username);
  if (usernameTaken) {
    return res.redirect("/register?error=Username already exists");
  }

  // hash password (DO NOT store plain password)
  const passwordHash = await bcrypt.hash(password, 10);

  users.push({
    id: Date.now().toString(),
    username,
    email,
    passwordHash,
  });

  writeUsers(users);

  // Go to login
  return res.redirect("/?error=Account created. Please login.");
});

// Login POST (validate + redirect)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const users = readUsers();
  const user = users.find((u) => u.username === username);

  if (!user) return res.redirect("/?error=Wrong username or password");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.redirect("/?error=Wrong username or password");

  // ✅ STORE USER IN SESSION
  req.session.user = {
    id: user.id,
    username: user.username,
  };

  res.redirect("/dashboard");
});


// Dashboard page
app.get("/dashboard", requireAuth, (req, res) => {
  res.render("dashboard/index", { user: req.session.user });
});

// Analsysis Page

app.get("/dashboard/analysis", requireAuth, (req, res) => {
  res.render("dashboard/analysis", { user: req.session.user});
});

//LOG OUT ROUTE
app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});




// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

// Database Proof of Connection
app.get("/db-test", async (req, res) => {
  const r = await pool.query("select now() as now");
  res.json(r.rows[0]);
});



//MIDDLEWARE

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/?error=Please login first");
  }
  next();
}

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

