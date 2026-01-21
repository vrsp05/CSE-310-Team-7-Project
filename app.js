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
  res.render("index");
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
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
