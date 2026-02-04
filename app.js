const express = require("express");
const app = express();

// use EJS
app.set("view engine", "ejs");
app.set("views", "./views");

// public files
app.use(express.static("public"));

// ROUTES

// main route
app.get("/", (req, res) => {
  res.render("index", { error: req.query.error || null });
});
//register page
app.get("/register", (req,res) => {
    res.render("auth/register");
});
// dashboard page
app.get("/dashboard", (req, res) => {
    res.render("dashboard/index");
});



// server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});