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

app.post("/recipes", async (request, response) => {
  const authorizationHeader = request.headers["authorization"];
  if (!authorizationHeader) {
    response.status(401).send("Missing authorization");
    return;  
  }
  try {
    await Utilities.authorizeUser(authorizationHeader, auth);
  } catch (error) {
    response.status(401).send(error.message);
    return;
  }
  const newRecipe = request.body;
  const missingFields = Utilities.validateRecipePostPut(newRecipe);
  if (missingFields) {
    response.status(400).send(`Missing fields: ${missingFields}`);
    return;
  }
  const recipe = Utilities.sanitizeRecipePostPut(newRecipe);

  try {
    const firestoreResponse = await firestore.collection("recipes").add(recipe);
    const recipeId = firestoreResponse.id;
    response.status(201).send({id: recipeId });
  } catch (error) {
    response.status(400).send(error.message);
    return;
  }

 });


app.get("/", async (req, res) => {
  res.send("Hello from recipes API");
});

if (process.env.NODE_ENV !== "production") {
  //loal development
  app.listen(3005, () => {
    console.log("API listening on port 3005");
  });
}

module.exports = app;
