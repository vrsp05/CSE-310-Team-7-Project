const express = require("express");
const app = express();

// use EJS
app.set("view engine", "ejs");
app.set("views", "./views");

// public files
app.use(express.static("public"));

// main route
app.get("/", (req, res) => {
  res.render("index");
});

// server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
