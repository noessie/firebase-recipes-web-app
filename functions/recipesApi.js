const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const FirebaseConfig = require("./FirebaseConfig");
const Utilities = require("./utilities.js");

const auth = FirebaseConfig.auth;
const firestore = FirebaseConfig.firestore;

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());

//Restful CRUD API for recipes

app.get("/recipes", async (req, res) => {
  res.send("Hello from recipes API");
});

if (process.env.NODE_ENV !== "production") {
  //loal development
  app.listen(3005, () => {
    console.log("API listening on port 3005");
  });
}
module.exports = app;
