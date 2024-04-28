import React from "react";
import { useState } from "react";

function AddEditRecipeForm({ handleAddRecipe }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [publishDate, setPublishDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [direction, setDirection] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [ingredientName, setIngredientName] = useState("");

  function handleRecipeFormSubmit(e) {
    e.preventDefault();
    if (ingredients.length === 0) {
      alert("Bitte fügen Sie mindestens eine Zutat hinzu.");
      return;
    }
    const isPublished = new Date(publishDate) <= new Date() ? true : false;
    const newRecipe = {
      name,
      category,
      publishDate: new Date(publishDate).toISOString(),
      direction,
      ingredients,
      isPublished,
    };
    handleAddRecipe(newRecipe);
  }

  function handleAddIngredient(e) {
    if (e.key && e.key !== "Enter") {
      return;
    }
    e.preventDefault();
    if (!ingredientName) {
      alert("Bitte geben Sie eine Zutat ein.");
      return;
    }

    setIngredients([...ingredients, ingredientName]);
    setIngredientName("");
  }
  return (
    <form
      onSubmit={handleRecipeFormSubmit}
      className="add-edit-recipe-form-container"
    >
      <h2>Add a new recipe</h2>
      <div className="top-form-section">
        <div className="fields">
          <label className="recipe-label input-label">
            Rezeptame:
            <input
              className="input-text"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="recipe-label input-label">
            Kategorie:
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
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
          <label className="recipe-label input-label">
            Veröffentlichungsdatum:
            <input
              className="input-text"
              type="date"
              value={publishDate}
              onChange={(event) => setPublishDate(event.target.value)}
            />
          </label>
          <label className="recipe-label input-label">
            Zubereitung:
            <textarea
              required
              className="input-text"
              value={direction}
              onChange={(event) => setDirection(event.target.value)}
            />
          </label>
          <div className="ingredients-list">
            <h3 className="text-center">Zutaten</h3>
            <table className="ingredients-table">
              <thead>
                <tr>
                  <th className="table-header">Zutat</th>
                  <th className="table-header">Löschen</th>
                </tr>
              </thead>
              <tbody>
                {ingredients && ingredients.length > 0
                  ? ingredients.map((ingredient) => {
                      return (
                        <tr key={ingredient}>
                          <td className="table-data text-center">
                            {ingredient}
                          </td>
                          <td className="ingredient-delete-box">
                            <button
                              type="button"
                              className="secondary-button ingredient-delete-button"
                            >
                              Löschen
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  : null}
              </tbody>
            </table>
            {ingredients && ingredients.length === 0 ? (
              <h3 className="text-center no-ingredients">
                Noch keine Zutaten hinzugefügt
              </h3>
            ) : null}
            <div className="ingredient-form">
              <label className="ingredient-label">
                Zutat:
                <input
                  placeholder="Zutat hinzufügen"
                  className="input-text"
                  type="text"
                  value={ingredientName}
                  onChange={(event) => setIngredientName(event.target.value)}
                  onClick={handleAddIngredient}
                />
                <label className="ingredient-label">
                  <button
                    type="button"
                    className="primary-button add-ingredient-button"
                    onClick={handleAddIngredient}
                  >
                    Zutat hinzufügen
                  </button>
                </label>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="action-button">
        <button
          type="submit"
          className="primary-button action-button"
          onClick={() =>
            handleAddRecipe({
              name,
              category,
              publishDate,
              direction,
              ingredients,
            })
          }
        >
          Rezept erstellen
        </button>
      </div>
    </form>
  );
}

export default AddEditRecipeForm;
