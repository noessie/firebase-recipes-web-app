import { startTransition, useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import AddEditRecipeForm from "./components/AddEditRecipeForm";
import FirebaseAuthService from "./FirebaseAuthService";
import "./App.css";
import FirebaseFirestoreService from "./FirebaseFirestoreService";

function App() {
  const [user, setUser] = useState(null);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [orderBy, setOrderBy] = useState("publishDateDesc");
  const [recipesPerPage, setRecipesPerPage] = useState(3);

  useEffect(() => {
    setIsLoading(true);
    fetchRecipes()
      .then((fetchedRecipes) => {
        setRecipes(fetchedRecipes);
      })
      .catch((error) => {
        console.error(error.message);
        throw error;
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, categoryFilter, orderBy, recipesPerPage]);

  FirebaseAuthService.subscribeToAuthChanges(setUser);

  async function fetchRecipes(cursorID = "") {
    const queries = [];
    if (categoryFilter) {
      queries.push({
        field: "category",
        condition: "==",
        value: categoryFilter,
      });
    }
    if (!user) {
      queries.push({
        field: "isPublished",
        condition: "==",
        value: true,
      });
    }

    const orderByField = orderBy.field;
    let orderByDirection;
    if (orderBy) {
      switch (orderBy) {
        case "publishDateAsc":
          orderByDirection = "asc";
          break;
        case "publishDateDesc":
          orderByDirection = "desc";
          break;
        default:
          break;
      }
    }

    let fetchedRecipes = [];

    try {
      const response = await FirebaseFirestoreService.readDocuments({
        collection: "recipes",
        queries: queries,
        orderByField: orderByField,
        orderByDirection: orderByDirection,
        perPage: recipesPerPage,
        cursorID: cursorID,
      });
      const newRecipes = response.docs.map((recipeDoc) => {
        const id = recipeDoc.id;
        const data = recipeDoc.data();
        data.publishDate = new Date(data.publishDate.seconds * 1000);
        return { ...data, id };
      });
      if (cursorID) {
        fetchedRecipes = [...recipes, ...newRecipes];
      } else {
        fetchedRecipes = [...newRecipes];
      }
    } catch (error) {
      console.error(error.message);
      throw error;
    }
    return fetchedRecipes;
  }

  function handleRecipesPerPageChange(event) {
    setRecipesPerPage(event.target.value);
    setRecipes([]);
    setRecipesPerPage(recipesPerPage);
  }

  function handleLoadMoreRecipesClick() {
    const lastRecipe = recipes[recipes.length - 1];
    const cusorID = lastRecipe.id;
    handleFetchRecipes(cusorID);
  }

  async function handleFetchRecipes(cursorID = "") {
    try {
      const fetchedRecipes = await fetchRecipes(cursorID);
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  async function handleAddRecipe(newRecipe) {
    try {
      const response = await FirebaseFirestoreService.createDocument(
        "recipes",
        newRecipe
      );

      handleFetchRecipes();

      alert(`Recipe added successfully with an ID= ${response.id} `);
      setCurrentRecipe(null);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleDeleteRecipe(recipeId) {
    const deleteConfirmation = window.confirm(
      "Are you sure you want to delete this recipe?"
    );
    if (!deleteConfirmation) {
      try {
        await FirebaseFirestoreService.deleteDocument("recipes", recipeId);
        handleFetchRecipes();
        setCurrentRecipe(null);
        window.scrollTo(0, 0);
        alert(`Recipe ${recipeId} deleted successfully`);
      } catch (error) {
        alert(error.message);
        throw error;
      }
    }
  }

  function handleEditRecipeClick(recipeId) {
    const selectedRecipe = recipes.find((recipe) => recipe.id === recipeId);
    if (selectedRecipe) {
      startTransition(() => {
        setCurrentRecipe(selectedRecipe);
      });
      window.scrollTo(0, document.body.scrollHeight);
    }
  }

  function handleEditRecipeCancel() {
    setCurrentRecipe(null);
  }

  async function handleUpdateRecipe(newRecipe, recipeId) {
    try {
      await FirebaseFirestoreService.updateDocument(
        "recipes",
        recipeId,
        newRecipe
      );
      handleFetchRecipes();
      alert("Recipe updated successfully");
    } catch (error) {
      alert(error.message);
      throw error;
    }
  }

  function formatDate(date) {
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getFullYear();
    const dateString = `${day}.${month}.${year}`;
    return dateString;
  }

  function lookupCategoryLabel(categoryKey) {
    const categories = {
      frühstück: "Frühstück",
      mittagessen: "Mittagessen",
      abendessen: "Abendessen",
      snack: "Snack",
      dessert: "Dessert",
      getränk: "Getränk",
    };
    const label = categories[categoryKey];
    return label;
  }

  return (
    <div className="App">
      <div className="title-row">
        <h1 className="title"> Firebase Recipes</h1>
        <LoginForm existingUser={user} />
      </div>
      <div className="main">
        <div className="row filters">
          <label className="recipe-label input-label">
            Kategorie:
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="select"
              required
            >
              <option value="">Wählen Sie eine Kategorie</option>
              <option value="Frühstück">Frühstück</option>
              <option value="Mittagessen">Mittagessen</option>
              <option value="Abendessen">Abendessen</option>
              <option value="Snack">Snack</option>
              <option value="Dessert">Dessert</option>
              <option value="Getränk">Getränk</option>
            </select>
          </label>
          <label>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="select"
            >
              <option value="publishDateDsc">
                Publish Date (newest - oldest)
              </option>
              <option value="publishDateAsc">
                Publish Date (oldest - newest)
              </option>
            </select>
          </label>
        </div>

        <div className="center">
          <div className="recipe-list-box">
            {isLoading ? (
              <div className="fire">
                <div className="flames"></div>
                <div className="flames"></div>
                <div className="flames"></div>
                <div className="flames"></div>
              </div>
            ) : null}
            {!isLoading && recipes && recipes.length === 0 ? (
              <h5 className="no-recipes">No recipes found</h5>
            ) : null}
            {recipes && recipes.length > 0 ? (
              <div className="recipe-list">
                {recipes.map((recipe) => {
                  return (
                    <div className="recipe-card" key={recipe.id}>
                      {recipe.isPublished === false ? (
                        <div className="unpublished">Unpublished</div>
                      ) : null}
                      <div className="recipe-name">{recipe.name}</div>
                      <div className="recipe-field">
                        Category: {lookupCategoryLabel(recipe.category)}
                      </div>
                      <div className="recipe-field">
                        Publish Date: {formatDate(recipe.publishDate)}
                      </div>
                      {user ? (
                        <button
                          type="button"
                          className="primary-button edit-button"
                          onClick={() => handleEditRecipeClick(recipe.id)}
                        >
                          Edit
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
        {isLoading || recipes.length === 0 ? (
          <>
            <label className="input-label">
              Recipes per page:
              <select
                value={recipesPerPage}
                onChange={handleRecipesPerPageChange}
                className="select"
              >
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="9">9</option>
              </select>
            </label>
            <div className="pagination">
              <button
                type="button"
                className="primary-button"
                onClick={handleLoadMoreRecipesClick}
              >
                Load more recipes
              </button>
              </div>
          </>
        ) : null}
        {user ? (
          <AddEditRecipeForm
            existingRecipe={currentRecipe}
            handleAddRecipe={handleAddRecipe}
            handleEditRecipeCancel={handleEditRecipeCancel}
            handleUpdateRecipe={handleUpdateRecipe}
            handleDeleteRecipe={handleDeleteRecipe}
          ></AddEditRecipeForm>
        ) : null}
      </div>
    </div>
  );
}

export default App;
